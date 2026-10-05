import { useEffect, useRef } from 'react';
import type { Group, WebGLRenderer } from 'three';

/** Real round iron stock, with the existing artwork retained as a WebGL fallback. */
export default function SunlitIronGate({ active }: { active: boolean }) {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active) return;
    const node = host.current!;
    const architecture = node.parentElement!;
    const gate = node.closest<HTMLElement>('.garden-gate')!;
    let disposed = false;
    let release: (() => void) | undefined;

    void Promise.all([import('three'), import('three/addons/loaders/SVGLoader.js')]).then(([THREE, { SVGLoader }]) => {
      if (disposed) return;
      let renderer: WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
      } catch { return; }
      renderer.setClearColor(0x000000, 0);
      renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.15;
      node.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(2 * Math.atan(383.5 / 1800) * 180 / Math.PI, 480 / 767, .1, 4000);
      camera.position.set(240, -383.5, 1800);
      const iron = new THREE.MeshStandardMaterial({ color: '#796647', metalness: .48, roughness: .34 });
      const bronze = new THREE.MeshStandardMaterial({ color: '#927044', metalness: .82, roughness: .3 });
      const geometries = new Set<InstanceType<typeof THREE.BufferGeometry>>();
      const loader = new SVGLoader();

      // The source paths stay in the DOM so both renderers share the same design.
      const makeIron = (svg: string, group: Group, yScale = 1, mirror = false) => {
        const parsed = loader.parse(svg);
        for (const path of parsed.paths) {
          const style = path.userData?.style as { fill?: string; stroke?: string; strokeWidth?: number } | undefined;
          if (style?.fill && style.fill !== 'none') {
            for (const shape of path.toShapes()) {
              const geometry = new THREE.ExtrudeGeometry(shape, { depth: 2.6, bevelEnabled: true, bevelThickness: .6, bevelSize: .5, bevelSegments: 2, steps: 1 });
              geometry.scale(mirror ? -1 : 1, -yScale, 1);
              geometries.add(geometry);
              group.add(new THREE.Mesh(geometry, iron));
            }
          }
          if (style?.stroke === 'none') continue;
          for (const subpath of path.subPaths) {
            const points = subpath.getPoints(12);
            if (points.length < 2) continue;
            // Sample every original vertex, including square frame corners.
            // Distance-based resampling cuts across long rail corners.
            class IronCurve extends THREE.Curve<InstanceType<typeof THREE.Vector3>> {
              constructor() { super(); }
              getUtoTmapping(u: number) { return u; }
              getPoint(t: number, target = new THREE.Vector3()) {
                const position = t * (points.length - 1);
                const index = Math.min(Math.floor(position), points.length - 2);
                const a = points[index], b = points[index + 1], f = position - index;
                return target.set((a.x + (b.x - a.x) * f) * (mirror ? -1 : 1), -(a.y + (b.y - a.y) * f) * yScale, 0);
              }
            }
            const radius = Math.max(.8, Math.min(2.2, Number(style?.strokeWidth ?? 3.1) / 2));
            const geometry = new THREE.TubeGeometry(new IronCurve(), (points.length - 1) * 2, radius, 10, false);
            geometries.add(geometry);
            group.add(new THREE.Mesh(geometry, iron));
          }
        }
      };

      const fan = new THREE.Group();
      const fanSource = architecture.querySelector('.garden-gate__fanlight')!;
      makeIron(new XMLSerializer().serializeToString(fanSource), fan);
      scene.add(fan);

      const left = new THREE.Group(), right = new THREE.Group();
      left.position.set(0, -206, 0); right.position.set(480, -206, 0);
      const ornament = architecture.querySelector('#estate-iron-left')!.innerHTML;
      const leafSvg = `<svg xmlns="http://www.w3.org/2000/svg"><g fill="none" stroke="#443b2b" stroke-width="3.1">${ornament}</g></svg>`;
      makeIron(leafSvg, left, 561 / 620);
      makeIron(leafSvg, right, 561 / 620, true);
      for (const [leaf, side] of [[left, 1], [right, -1]] as const) {
        for (const y of [50, 430]) {
          const geometry = new THREE.CylinderGeometry(4, 4, 24, 12);
          geometries.add(geometry);
          const hinge = new THREE.Mesh(geometry, bronze);
          hinge.position.set(side * 5, -y, 1);
          leaf.add(hinge);
        }
        const handleCurve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(side * 219, -220, 2), new THREE.Vector3(side * 213, -230, 9),
          new THREE.Vector3(side * 213, -249, 9), new THREE.Vector3(side * 219, -260, 2),
        ]);
        const geometry = new THREE.TubeGeometry(handleCurve, 20, 2.6, 10, false);
        geometries.add(geometry);
        leaf.add(new THREE.Mesh(geometry, bronze));
      }
      scene.add(left, right);
      scene.add(new THREE.HemisphereLight('#cad7ed', '#463321', 2.4));
      // The photograph's sun is beyond the right jamb. Warm grazing light
      // catches the cylindrical edges; the fronts retain their dark patina.
      const sunlight = new THREE.DirectionalLight('#ffcc80', 6.5);
      sunlight.position.set(780, -255, -180);
      sunlight.target.position.set(240, -340, 0);
      scene.add(sunlight, sunlight.target);
      const bounce = new THREE.DirectionalLight('#e8b979', 2.2);
      bounce.position.set(600, -180, 350);
      bounce.target.position.set(240, -340, 0);
      scene.add(bounce, bounce.target);

      let frame = 0, lastOpen = -1, dirty = true, contextAvailable = true;
      const resize = new ResizeObserver(() => {
        renderer.setSize(node.clientWidth, node.clientHeight, false);
        dirty = true;
        schedule();
      });
      resize.observe(node);
      const paint = () => {
        frame = 0;
        if (disposed || !contextAvailable) return;
        const amount = Number.parseFloat(getComputedStyle(gate).getPropertyValue('--gate-open')) || 0;
        if (dirty || Math.abs(amount - lastOpen) > .0001) {
          left.rotation.y = amount * 62 * Math.PI / 180;
          right.rotation.y = -amount * 62 * Math.PI / 180;
          renderer.render(scene, camera);
          architecture.dataset.iron = '3d';
          lastOpen = amount; dirty = false;
        }
      };
      const schedule = () => { if (!frame && !disposed) frame = requestAnimationFrame(paint); };
      const motion = new MutationObserver(schedule);
      motion.observe(gate, { attributes: true, attributeFilter: ['style'] });
      const lost = (event: Event) => { event.preventDefault(); contextAvailable = false; delete architecture.dataset.iron; cancelAnimationFrame(frame); frame = 0; };
      const restored = () => { contextAvailable = true; dirty = true; schedule(); };
      renderer.domElement.addEventListener('webglcontextlost', lost);
      renderer.domElement.addEventListener('webglcontextrestored', restored);
      paint();
      release = () => {
        cancelAnimationFrame(frame); resize.disconnect(); motion.disconnect();
        renderer.domElement.removeEventListener('webglcontextlost', lost);
        renderer.domElement.removeEventListener('webglcontextrestored', restored);
        geometries.forEach(geometry => geometry.dispose());
        iron.dispose(); bronze.dispose(); renderer.dispose(); renderer.forceContextLoss();
        renderer.domElement.remove(); delete architecture.dataset.iron;
      };
    }).catch(() => { delete architecture.dataset.iron; });
    return () => { disposed = true; release?.(); };
  }, [active]);

  return <div ref={host} className="garden-gate__iron-3d" aria-hidden="true" />;
}
