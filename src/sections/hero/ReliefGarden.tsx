import { publicAsset } from "@/lib/assets/publicAsset";
import { useEffect, useRef, useState } from "react";
import { galleryFragment, galleryVertex } from "./galleryShaders";

/** A low-resolution paint field reveals the relief; a single GPU pass lights both gardens. */
export default function ReliefGarden({ active, night, reducedMotion }: {
  active: boolean; night: boolean; reducedMotion: boolean;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const options = useRef({ active, night, reducedMotion });
  const wake = useRef(() => {});
  const [ready, setReady] = useState(false);
  options.current = { active, night, reducedMotion };
  useEffect(() => { wake.current(); }, [active, night, reducedMotion]);

  useEffect(() => {
    const node = canvas.current!, host = node.closest<HTMLElement>('.hero-gallery')!;
    let gl: WebGLRenderingContext | null;
    try { gl = node.getContext('webgl', { alpha: false, antialias: false, powerPreference: 'low-power' }); }
    catch { node.dataset.renderer = 'fallback'; return; }
    if (!gl) { node.dataset.renderer = 'fallback'; return; }
    const brush = document.createElement('canvas');
    const ctx = brush.getContext('2d')!;
    const shaders: WebGLShader[] = [], textures: WebGLTexture[] = [];
    let program: WebGLProgram | null = null, buffer: WebGLBuffer | null = null;
    let disposed = false, lost = false, loaded = false, frame = 0, previous = 0, lastInput = 0;
    let fieldUntil = 0, previewUntil = 0, inside = false, interacted = false, nightMix = 0;
    let mode = options.current.night, width = 1, height = 1;
    const point = { x: .73, y: .56, tx: .73, ty: .56, previousX: .73, previousY: .56 };
    const origin = { x: .8, y: .16 };
    let touchStart = { x: 0, y: 0 };
    let tick: (now: number) => void = () => {};
    const stop = () => { if (frame) cancelAnimationFrame(frame); frame = 0; previous = 0; node.dataset.renderState = 'paused'; };
    const request = () => {
      if (disposed || lost || !loaded || frame || document.hidden || !options.current.active) return;
      frame = requestAnimationFrame(tick);
    };
    wake.current = () => { if (!options.current.active) stop(); else request(); };
    const cleanupGL = () => { textures.forEach(t => gl.deleteTexture(t)); shaders.forEach(s => gl.deleteShader(s)); gl.deleteBuffer(buffer); gl.deleteProgram(program); };
    try {
      const compile = (kind: number, source: string) => {
        const shader = gl.createShader(kind)!; shaders.push(shader);
        gl.shaderSource(shader, source); gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error('Gallery shader compilation failed');
        return shader;
      };
      program = gl.createProgram()!;
      gl.attachShader(program, compile(gl.VERTEX_SHADER, galleryVertex));
      gl.attachShader(program, compile(gl.FRAGMENT_SHADER, galleryFragment));
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error('Gallery shader linking failed');
      gl.useProgram(program);
      buffer = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,3,-1,-1,3]), gl.STATIC_DRAW);
      const a = gl.getAttribLocation(program, 'position'); gl.enableVertexAttribArray(a); gl.vertexAttribPointer(a, 2, gl.FLOAT, false, 0, 0);
      const uniforms = Object.fromEntries(['uResolution','uPointer','uOrigin','uNight','uTime','uStill'].map(name => [name,gl.getUniformLocation(program!,name)]));
      const texture = (unit: number, name: string) => {
        const t = gl.createTexture()!; textures.push(t); gl.activeTexture(gl.TEXTURE0+unit); gl.bindTexture(gl.TEXTURE_2D,t);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
        gl.uniform1i(gl.getUniformLocation(program!,name),unit); return t;
      };
      const day = texture(0,'uRelief'), evening = texture(1,'uFlowers'), paint = texture(2,'uBrush');
      const load = (url: string, unit: number, t: WebGLTexture) => new Promise<void>((resolve,reject) => {
        const img = new Image(); img.onload = () => {
          if (disposed || lost) return resolve();
          gl.activeTexture(gl.TEXTURE0+unit); gl.bindTexture(gl.TEXTURE_2D,t);
          gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,img); resolve();
        }; img.onerror = reject; img.src = url;
      });
      const resize = () => {
        const rect = host.getBoundingClientRect(); width = Math.max(1,rect.width); height = Math.max(1,rect.height);
        const ratio = Math.min(devicePixelRatio || 1, width < 600 ? 1.25 : 1.5, 2000 / width);
        node.width = Math.round(width*ratio); node.height = Math.round(height*ratio);
        brush.width = Math.round(width*.3); brush.height = Math.round(height*.3);
        ctx.fillStyle = '#000'; ctx.fillRect(0,0,brush.width,brush.height);
        gl.viewport(0,0,node.width,node.height); gl.uniform2f(uniforms.uResolution,width,height);
        request();
      };
      const stamp = (x: number,y: number,alpha: number) => {
        const r = Math.min(width*.27, height*.3, 255)*.3;
        const px=x*brush.width,py=y*brush.height;
        const gradient=ctx.createRadialGradient(px,py,0,px,py,r);
        gradient.addColorStop(0,`rgba(255,255,255,${alpha})`);
        gradient.addColorStop(.46,`rgba(255,255,255,${alpha*.87})`);
        gradient.addColorStop(1,'rgba(255,255,255,0)');
        ctx.fillStyle=gradient;ctx.fillRect(px-r,py-r,r*2,r*2);
      };
      tick = now => {
        frame=0;
        if (disposed || lost || !options.current.active || document.hidden) { stop();return; }
        const dt=Math.min(.05,Math.max(.001,(now-(previous||now-16))/1000)); previous=now;
        const reduced=options.current.reducedMotion;
        if (options.current.night!==mode) { mode=options.current.night;origin.x=point.tx;origin.y=point.ty; }
        nightMix += ((mode?1:0)-nightMix)*(1-Math.exp(-dt*4.8));
        if (Math.abs(nightMix-(mode?1:0))<.001)nightMix=mode?1:0;
        if (reduced)nightMix=mode?1:0;
        const follow=1-Math.exp(-dt*12);
        point.x+=(point.tx-point.x)*follow;point.y+=(point.ty-point.y)*follow;
        const preview=!interacted&&now<previewUntil;
        ctx.fillStyle=`rgba(0,0,0,${1-Math.exp(-dt*1.65)})`;ctx.fillRect(0,0,brush.width,brush.height);
        if (!reduced && (inside||preview)) {
          const steps=Math.min(10,Math.max(1,Math.ceil(Math.hypot((point.x-point.previousX)*width,(point.y-point.previousY)*height)/24)));
          for(let i=1;i<=steps;i++)stamp(point.previousX+(point.x-point.previousX)*i/steps,point.previousY+(point.y-point.previousY)*i/steps,.28);
          fieldUntil=now+2300;
        }
        point.previousX=point.x;point.previousY=point.y;
        gl.activeTexture(gl.TEXTURE2);gl.bindTexture(gl.TEXTURE_2D,paint);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,brush);
        gl.uniform2f(uniforms.uPointer,point.x,point.y);gl.uniform2f(uniforms.uOrigin,origin.x,origin.y);
        gl.uniform1f(uniforms.uNight,nightMix);gl.uniform1f(uniforms.uTime,now/1000);gl.uniform1f(uniforms.uStill,reduced?1:0);
        gl.drawArrays(gl.TRIANGLES,0,3);
        node.dataset.renderState='running';node.dataset.nightMix=nightMix.toFixed(3);
        const moving=Math.hypot(point.tx-point.x,point.ty-point.y)>.0001;
        if (!reduced&&((inside&&(now-lastInput<1300||moving))||preview||(!inside&&now<fieldUntil)||mode||nightMix!==0||moving))frame=requestAnimationFrame(tick);
        else node.dataset.renderState='idle';
      };
      const move = (event: PointerEvent) => {
        if (!options.current.active || options.current.reducedMotion) return;
        const rect=host.getBoundingClientRect();
        if(event.pointerType==='touch'&&Math.abs(event.clientY-touchStart.y)>Math.max(12,Math.abs(event.clientX-touchStart.x)*1.3)) { inside=false;return; }
        point.tx=Math.max(0,Math.min(1,(event.clientX-rect.left)/width));point.ty=Math.max(0,Math.min(1,(event.clientY-rect.top)/height));
        interacted=true;inside=true;lastInput=performance.now();fieldUntil=lastInput+2300;
        request();
      };
      const down = (event: PointerEvent) => {touchStart={x:event.clientX,y:event.clientY};move(event);};
      const leave = () => {inside=false;fieldUntil=performance.now()+2300;request();};
      const up = (event: PointerEvent) => {if(event.pointerType==='touch')leave();};
      const visibility = () => {if(document.hidden)stop();else request();};
      const contextLost = (event: Event) => {event.preventDefault();lost=true;stop();setReady(false);node.dataset.renderer='fallback';};
      const observer=new ResizeObserver(resize);observer.observe(host);resize();
      host.addEventListener('pointermove',move,{passive:true});host.addEventListener('pointerdown',down,{passive:true});
      host.addEventListener('pointerleave',leave);host.addEventListener('pointerup',up);host.addEventListener('pointercancel',leave);
      document.addEventListener('visibilitychange',visibility);node.addEventListener('webglcontextlost',contextLost);
      Promise.all([load(publicAsset('/assets/hero-gallery/ivory-relief.webp'),0,day),load(publicAsset('/assets/hero-gallery/night-botanical.webp'),1,evening)]).then(()=>{
        if(disposed||lost)return;loaded=true;node.dataset.renderer='webgl';previewUntil=performance.now()+1900;setReady(true);request();
      }).catch(()=>{if(!disposed){node.dataset.renderer='fallback';setReady(false);}});
      return () => {
        disposed=true;stop();wake.current=()=>{};observer.disconnect();
        host.removeEventListener('pointermove',move);host.removeEventListener('pointerdown',down);host.removeEventListener('pointerleave',leave);host.removeEventListener('pointerup',up);host.removeEventListener('pointercancel',leave);
        document.removeEventListener('visibilitychange',visibility);node.removeEventListener('webglcontextlost',contextLost);cleanupGL();
      };
    } catch {
      node.dataset.renderer='fallback';cleanupGL();return ()=>{disposed=true;stop();wake.current=()=>{};};
    }
  }, []);
  return <div className="hero-surface" data-ready={ready} aria-hidden="true">
    <div className="hero-surface__fallback" />
    <canvas ref={canvas} className="hero-surface__canvas" />
  </div>;
}
