// Renderer adapted from MengTo/threeui RibbonFieldBackground and EnergyOrb.
// Upstream commit, source links and MIT notice are recorded in NOTICE.md / LICENSE.
import { useEffect, useRef } from "react";
import { RIBBON_FIELD_FRAGMENT_SHADER, RIBBON_FIELD_VERTEX_SHADER } from "./ribbonFieldShaders";
import { NXA_ENERGY_ORB_CONFIGURABLE_FRAGMENT_SHADER, NXA_ENERGY_ORB_VERTEX_SHADER } from "./energyOrbShaders";
import type { SceneBackgroundProps } from "../SceneBackground";

export default function ThreeUIBackground({ effect, active, quality = "desktop", blown = false, onUnavailable }: SceneBackgroundProps & { onUnavailable: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const options = useRef({ blown, onUnavailable });
  options.current = { blown, onUnavailable };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !active) return;
    let gl: WebGLRenderingContext | null;
    try {
      gl = canvas.getContext("webgl", { alpha: true, antialias: false, premultipliedAlpha: false });
    } catch { options.current.onUnavailable(); return; }
    if (!gl) { options.current.onUnavailable(); return; }
    const shaders: WebGLShader[] = [];
    let program: WebGLProgram | null = null;
    let buffer: WebGLBuffer | null = null;
    let frame = 0;
    let visible = false;
    let disposed = false;
    let lastTime = 0;
    let elapsed = 0;
    let previousDraw = 0;
    const pointer = { x: .72, y: .42, targetX: .72, targetY: .42 };
    const stop = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      lastTime = 0;
      canvas.dataset.renderState = "paused";
    };
    const dispose = () => {
      stop();
      disposed = true;
      gl.deleteBuffer(buffer);
      shaders.forEach(shader => gl.deleteShader(shader));
      gl.deleteProgram(program);
    };
    const compile = (kind: number, source: string) => {
      const shader = gl.createShader(kind);
      if (!shader) throw new Error("Shader unavailable");
      shaders.push(shader);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error("Shader compilation failed");
      return shader;
    };

    try {
      const orb = effect === "orb";
      const vertex = compile(gl.VERTEX_SHADER, orb ? NXA_ENERGY_ORB_VERTEX_SHADER : RIBBON_FIELD_VERTEX_SHADER);
      const fragment = compile(gl.FRAGMENT_SHADER, orb ? NXA_ENERGY_ORB_CONFIGURABLE_FRAGMENT_SHADER : RIBBON_FIELD_FRAGMENT_SHADER);
      program = gl.createProgram();
      if (!program) throw new Error("Program unavailable");
      gl.attachShader(program, vertex);
      gl.attachShader(program, fragment);
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error("Program linking failed");
      gl.useProgram(program);
      buffer = gl.createBuffer();
      if (!buffer) throw new Error("Buffer unavailable");
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      const position = gl.getAttribLocation(program, orb ? "p" : "position");
      gl.enableVertexAttribArray(position);
      gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
      const resolution = gl.getUniformLocation(program, orb ? "uR" : "resolution");
      const time = gl.getUniformLocation(program, orb ? "uT" : "time");
      const pointerUniform = gl.getUniformLocation(program, "pointer");
      const glow = gl.getUniformLocation(program, "uGlow");
      if (orb) {
        gl.uniform1f(gl.getUniformLocation(program, "uSmokeScale"), 1.05);
        gl.uniform1f(gl.getUniformLocation(program, "uSmokeStrength"), .65);
        gl.uniform1f(gl.getUniformLocation(program, "uSmokeSpeed"), .55);
        gl.uniform1f(gl.getUniformLocation(program, "uHue"), 1.8);
        gl.uniform1f(gl.getUniformLocation(program, "uSaturation"), .6);
      }
      gl.clearColor(0, 0, 0, 0);
      const resize = () => {
        const rect = canvas.getBoundingClientRect();
        const ratio = Math.min(window.devicePixelRatio || 1, quality === "mobile" ? 1 : 1.5);
        canvas.width = Math.max(1, Math.round(rect.width * ratio));
        canvas.height = Math.max(1, Math.round(rect.height * ratio));
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.uniform2f(resolution, canvas.width, canvas.height);
      };
      const tick = (now: number) => {
        frame = 0;
        if (disposed || !visible || document.hidden) { stop(); return; }
        if (lastTime) elapsed += Math.min(now - lastTime, 64) / 1000;
        lastTime = now;
        if (now - previousDraw >= 1000 / (quality === "mobile" ? 30 : 45)) {
          previousDraw = now;
          gl.uniform1f(time, elapsed * (orb ? .42 : .28));
          pointer.x += (pointer.targetX - pointer.x) * .045;
          pointer.y += (pointer.targetY - pointer.y) * .045;
          gl.uniform2f(pointerUniform, pointer.x, pointer.y);
          gl.uniform1f(glow, options.current.blown ? .5 : .8);
          gl.clear(gl.COLOR_BUFFER_BIT);
          gl.drawArrays(gl.TRIANGLES, 0, 3);
        }
        canvas.dataset.renderState = "running";
        frame = requestAnimationFrame(tick);
      };
      const start = () => {
        if (!frame && visible && !document.hidden && !disposed) frame = requestAnimationFrame(tick);
      };
      const visibility = () => { if (document.hidden) stop(); else start(); };
      // Listen on the section, leaving the decorative canvas non-interactive.
      const section = canvas.closest("section");
      const move = (event: PointerEvent) => {
        if (quality === "mobile" || event.pointerType === "touch") return;
        const bounds = canvas.getBoundingClientRect();
        pointer.targetX = .72 + ((event.clientX - bounds.left) / Math.max(bounds.width, 1) - .72) * .22;
        pointer.targetY = .42 + (1 - (event.clientY - bounds.top) / Math.max(bounds.height, 1) - .42) * .22;
      };
      const resetPointer = () => { pointer.targetX = .72; pointer.targetY = .42; };
      const contextLost = (event: Event) => {
        event.preventDefault();
        stop();
        options.current.onUnavailable();
      };
      const observer = new ResizeObserver(resize);
      const intersection = new IntersectionObserver(([entry]) => {
        visible = entry?.isIntersecting ?? false;
        if (visible) start(); else stop();
      });
      resize();
      observer.observe(canvas);
      intersection.observe(canvas);
      section?.addEventListener("pointermove", move, { passive: true });
      section?.addEventListener("pointerleave", resetPointer);
      document.addEventListener("visibilitychange", visibility);
      canvas.addEventListener("webglcontextlost", contextLost);
      return () => {
        observer.disconnect();
        intersection.disconnect();
        section?.removeEventListener("pointermove", move);
        section?.removeEventListener("pointerleave", resetPointer);
        document.removeEventListener("visibilitychange", visibility);
        canvas.removeEventListener("webglcontextlost", contextLost);
        dispose();
      };
    } catch {
      dispose();
      options.current.onUnavailable();
    }
  }, [effect, active, quality]);

  return <canvas ref={canvasRef} className="scene-webgl" data-effect={effect} data-render-state="paused" aria-hidden="true" />;
}
