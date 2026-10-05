import { useEffect, useRef } from 'react';
import type { Group, WebGLRenderer } from 'three';
import { GATE, gateLeafPaths } from './gateIronwork';

/** Forged iron leaves recessed into the photographed stone opening. */
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
      renderer.toneMappingExposure = .95;
      node.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      // Reflections are the same warm sky / dark garden as the photographic plate.
      // Metals need an environment to reveal their faces as well as their silhouettes.
      const sky = document.createElement('canvas');
      sky.width = 256; sky.height = 128;
      const skyContext = sky.getContext('2d')!;
      const horizon = skyContext.createLinearGradient(0, 0, 0, 128);
      horizon.addColorStop(0, '#a9b9c8');
      horizon.addColorStop(.43, '#eed5ae');
      horizon.addColorStop(.58, '#a18b61');
      horizon.addColorStop(1, '#293128');
      skyContext.fillStyle = horizon; skyContext.fillRect(0, 0, 256, 128);
      const glow = skyContext.createRadialGradient(190, 53, 0, 190, 53, 35);
      glow.addColorStop(0, '#fff2d3'); glow.addColorStop(1, '#f5d8a000');
      skyContext.fillStyle = glow; skyContext.fillRect(0, 0, 256, 128);
      const environment = new THREE.CanvasTexture(sky);
      environment.mapping = THREE.EquirectangularReflectionMapping;
      environment.colorSpace = THREE.SRGBColorSpace;
      scene.environment = environment;
      scene.environmentIntensity = .85;
      const camera = new THREE.PerspectiveCamera(2 * Math.atan(383.5 / 1800) * 180 / Math.PI, GATE.width / GATE.height, .1, 4000);
      camera.position.set(255, -383.5, 1800);
      // Subtle hammered surface breaks the uniform computer-drawn highlights.
      const noise = new Uint8Array(64 * 64 * 4);
      let seed = 73;
      for (let i = 0; i < noise.length; i += 4) {
        seed = (seed * 1664525 + 1013904223) >>> 0;
        const value = 115 + (seed >>> 25);
        noise[i] = noise[i + 1] = noise[i + 2] = value; noise[i + 3] = 255;
      }
      const patina = new THREE.DataTexture(noise, 64, 64);
      patina.wrapS = patina.wrapT = THREE.RepeatWrapping;
      patina.repeat.set(3, 18); patina.needsUpdate = true;
      const iron = new THREE.MeshStandardMaterial({ color: '#3d3b32', metalness: .62, roughness: .68, bumpMap: patina, bumpScale: .23 });
      const bronze = new THREE.MeshStandardMaterial({ color: '#716043', metalness: .72, roughness: .54, bumpMap: patina, bumpScale: .12 });
      const geometries = new Set<InstanceType<typeof THREE.BufferGeometry>>();
      const loader = new SVGLoader();

      const makeIron = (side: 'left' | 'right', group: Group) => {
        for (const design of gateLeafPaths(side)) {
          const parsed = loader.parse(`<svg xmlns="http://www.w3.org/2000/svg"><path d="${design.d}" fill="none" stroke="#333" /></svg>`);
          for (const path of parsed.paths) for (const subpath of path.subPaths) {
            const points = subpath.getPoints(30);
            if (points.length < 2) continue;
            if (design.stock === 'flat') {
              // Flat forged stock has a broad face and bevelled edges. A
              // four-sided tube instead makes the whole frame look like wire.
              const closed = points[0].distanceTo(points[points.length - 1]) < .001;
              const vertices = closed ? points.slice(0, -1) : points;
              const contours = [-1, 1].map(side => vertices.map((point, i) => {
                const before = vertices[i === 0 ? (closed ? vertices.length - 1 : 0) : i - 1];
                const after = vertices[i === vertices.length - 1 ? (closed ? 0 : i) : i + 1];
                const incoming = point.clone().sub(before).normalize();
                const outgoing = after.clone().sub(point).normalize();
                if (incoming.lengthSq() === 0) incoming.copy(outgoing);
                if (outgoing.lengthSq() === 0) outgoing.copy(incoming);
                const normal = new THREE.Vector2(-incoming.y - outgoing.y, incoming.x + outgoing.x).normalize();
                const miter = Math.max(.5, Math.abs(normal.dot(new THREE.Vector2(-outgoing.y, outgoing.x))));
                return point.clone().addScaledVector(normal, side * design.width / 2 / miter);
              }));
              let shape: InstanceType<typeof THREE.Shape>;
              if (closed) {
                contours.sort((a, b) => Math.abs(THREE.ShapeUtils.area(b)) - Math.abs(THREE.ShapeUtils.area(a)));
                shape = new THREE.Shape(contours[0]);
                shape.holes.push(new THREE.Path(contours[1]));
              } else {
                shape = new THREE.Shape([...contours[0], ...contours[1].reverse()]);
              }
              const geometry = new THREE.ExtrudeGeometry(shape, { depth: 8, bevelEnabled: true, bevelSize: .6, bevelThickness: .6, bevelSegments: 1, steps: 1 });
              geometry.scale(1, -1, 1);
              geometry.translate(0, 0, -4);
              geometries.add(geometry);
              group.add(new THREE.Mesh(geometry, iron));
              continue;
            }
            // Preserve vertices at frame corners, while sampling curved forged straps.
            class IronCurve extends THREE.Curve<InstanceType<typeof THREE.Vector3>> {
              constructor() { super(); }
              getUtoTmapping(u: number) { return u; }
              getPoint(t: number, target = new THREE.Vector3()) {
                const position = t * (points.length - 1);
                const index = Math.min(Math.floor(position), points.length - 2);
                const a = points[index], b = points[index + 1], f = position - index;
                return target.set(a.x + (b.x - a.x) * f, -(a.y + (b.y - a.y) * f), 0);
              }
            }
            const geometry = new THREE.TubeGeometry(new IronCurve(), (points.length - 1) * 2, design.width / 2, 10, false);
            geometries.add(geometry);
            group.add(new THREE.Mesh(geometry, iron));
          }
        }
      };

      const left = new THREE.Group(), right = new THREE.Group();
      left.position.set(GATE.leftPivot, 0, -5);
      right.position.set(GATE.rightPivot, 0, -5);
      makeIron('left', left); makeIron('right', right);
      right.scale.x = -1;
      const addBox = (parent: Group, x: number, y: number, z: number, width: number, height: number, depth: number, material = iron) => {
        const geometry = new THREE.BoxGeometry(width, height, depth);
        geometries.add(geometry);
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(x, -y, z); parent.add(mesh);
      };
      const sockets = new THREE.Group();
      for (const [leaf, pivot, side] of [[left, GATE.leftPivot, 1], [right, GATE.rightPivot, -1]] as const) {
        for (const y of [270, 447, 688]) {
          // The pintle is fixed in a bolted masonry socket; only the strap moves.
          addBox(sockets, pivot, y, -9, 18, 40, 4);
          for (const offset of [-12, 12]) {
            const geometry = new THREE.SphereGeometry(2.5, 8, 6);
            geometries.add(geometry);
            const bolt = new THREE.Mesh(geometry, bronze);
            bolt.position.set(pivot, -y - offset, -5); sockets.add(bolt);
          }
          const geometry = new THREE.CylinderGeometry(4.6, 4.6, 30, 12);
          geometries.add(geometry);
          const hinge = new THREE.Mesh(geometry, bronze);
          hinge.position.set(pivot, -y, 0); sockets.add(hinge);
          addBox(leaf, 18, y - 8, 2, 36, 9, 5);
        }
        const handleCurve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(224, -353, 3), new THREE.Vector3(212, -364, 14),
          new THREE.Vector3(212, -404, 14), new THREE.Vector3(224, -415, 3),
        ]);
        const geometry = new THREE.TubeGeometry(handleCurve, 24, 3, 10, false);
        geometries.add(geometry);
        leaf.add(new THREE.Mesh(geometry, bronze));
        addBox(leaf, 233, 380, 1, 12, 30, 6);
        // These stationary jamb posts stay flush to the reveal as the leaf opens.
        addBox(sockets, pivot, side === 1 ? 488 : 480, -6, 8, side === 1 ? 554 : 574, 10);
      }
      scene.add(left, right, sockets);
      scene.add(new THREE.HemisphereLight('#c5cbd0', '#413324', 1.5));
      const sunlight = new THREE.DirectionalLight('#ffd398', 4.2);
      sunlight.position.set(760, -160, -300);
      sunlight.target.position.set(255, -340, 0);
      scene.add(sunlight, sunlight.target);
      const bounce = new THREE.DirectionalLight('#d9c09a', 1.25);
      bounce.position.set(500, -180, 550);
      bounce.target.position.set(255, -340, 0);
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
          left.rotation.y = Math.min(amount * GATE.angle, 94) * Math.PI / 180;
          right.rotation.y = -Math.min(amount * GATE.angle, 94) * Math.PI / 180;
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
        iron.dispose(); bronze.dispose(); patina.dispose(); environment.dispose(); renderer.dispose(); renderer.forceContextLoss();
        renderer.domElement.remove(); delete architecture.dataset.iron;
      };
    }).catch(() => { delete architecture.dataset.iron; });
    return () => { disposed = true; release?.(); };
  }, [active]);

  return <div ref={host} className="garden-gate__iron-3d" aria-hidden="true" />;
}
