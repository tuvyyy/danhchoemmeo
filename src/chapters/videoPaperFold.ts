/** A temporary, scroll-driven mesh of the current video frame. No idle render loop. */
export function videoPaperFold(stage: HTMLElement) {
  const video = stage.querySelector<HTMLVideoElement>("video");
  if (!video || video.readyState < 2) return null;
  const canvas = document.createElement("canvas");
  canvas.className = "garden-video-fold";
  canvas.setAttribute("aria-hidden", "true");
  Object.assign(canvas.style, {
    position: "absolute", left: "-15%", top: "-55%", width: "130%", height: "210%",
    zIndex: "3", pointerEvents: "none", filter: "drop-shadow(0 16px 20px #0005)",
  });
  const gl = canvas.getContext("webgl", { alpha: true, premultipliedAlpha: false, antialias: true });
  if (!gl) return null;
  const shaders: WebGLShader[] = [];
  const buffers: WebGLBuffer[] = [];
  let program: WebGLProgram | null = null;
  let texture: WebGLTexture | null = null;
  const dispose = () => {
    canvas.remove();
    buffers.forEach(buffer => gl.deleteBuffer(buffer));
    shaders.forEach(shader => gl.deleteShader(shader));
    gl.deleteTexture(texture); gl.deleteProgram(program);
    gl.getExtension("WEBGL_lose_context")?.loseContext();
  };
  try {
    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type)!;
      shaders.push(shader); gl.shaderSource(shader, source); gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error("Fold shader unavailable");
      return shader;
    };
    program = gl.createProgram()!;
    gl.attachShader(program, compile(gl.VERTEX_SHADER, `
      precision mediump float;
      attribute vec2 uv; uniform float fold; varying vec2 vUv; varying float light;
      void main() {
        vUv = uv;
        vec2 p = uv * 2.0 - 1.0;
        float centre = max(0.0, 1.0 - abs(p.x));
        float grip = pow(1.0 - uv.y, 1.25);
        // A grip at the bottom centre gathers the ENTIRE lower edge into one V tip.
        // The shoulders remain wide, so this reads as paper being pulled through a slot.
        float phase = atan(p.x, (uv.y + 0.14) * 1.4) * 15.0 + uv.y * 5.0;
        float crease = sin(phase) * 0.05 + sin(phase * 1.83 + uv.y * 7.0) * 0.018;
        float tension = fold * (0.3 + grip * 0.7);
        p.y += fold * (0.5 * abs(p.x) * grip - 0.23 * centre * grip - 0.1 * centre * uv.y);
        p.x *= 1.0 - fold * (0.12 + 0.82 * grip);
        p.x += crease * tension * 0.32;
        p.y += crease * tension * 0.45;
        float depth = tension * (crease + 0.085 * sin(phase * 0.52));
        p /= 1.0 - depth * 0.4;
        light = 1.0 + tension * (0.2 * cos(phase) + 0.085 * cos(phase * 1.83 + uv.y * 7.0) - 0.08 * grip);
        gl_Position = vec4(p.x / 1.3, p.y / 2.1, 0.0, 1.0);
      }
    `));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, `
      precision mediump float;
      uniform sampler2D film; uniform float fold; uniform vec2 fit; uniform vec2 anchor;
      varying vec2 vUv; varying float light;
      void main() {
        vec2 sampleUv = (vUv - anchor) / fit + anchor;
        vec3 color = vec3(0.063, 0.086, 0.063);
        if (sampleUv.x >= 0.0 && sampleUv.x <= 1.0 && sampleUv.y >= 0.0 && sampleUv.y <= 1.0)
          color = texture2D(film, sampleUv).rgb;
        color = mix(color, vec3(0.93, 0.86, 0.72), fold * 0.22) * light;
        vec2 edge = abs(vUv - 0.5) - vec2(0.484, 0.475);
        float rounded = length(max(edge, 0.0)) + min(max(edge.x, edge.y), 0.0) - 0.016;
        float alpha = (1.0 - smoothstep(-0.002, 0.002, rounded)) * (1.0 - fold * 0.18);
        gl_FragColor = vec4(color, alpha);
      }
    `));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) || "Fold program unavailable");
    gl.useProgram(program);
    const vertices: number[] = [];
    const columns = 80, rows = 40;
    for (let y = 0; y < rows; y++) for (let x = 0; x < columns; x++) {
      vertices.push(x / columns, y / rows, (x + 1) / columns, y / rows, x / columns, (y + 1) / rows,
        x / columns, (y + 1) / rows, (x + 1) / columns, y / rows, (x + 1) / columns, (y + 1) / rows);
    }
    const buffer = gl.createBuffer()!; buffers.push(buffer);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    const uv = gl.getAttribLocation(program, "uv");
    gl.enableVertexAttribArray(uv); gl.vertexAttribPointer(uv, 2, gl.FLOAT, false, 0, 0);
    texture = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.uniform1i(gl.getUniformLocation(program, "film"), 0);
    const ratio = video.videoWidth / video.videoHeight / (stage.offsetWidth / stage.offsetHeight);
    const style = getComputedStyle(video);
    const fit = style.objectFit === "cover" ? Math.max : Math.min;
    gl.uniform2f(gl.getUniformLocation(program, "fit"), fit(1, ratio), fit(1, 1 / ratio));
    const position = style.objectPosition.split(" ").map(value => parseFloat(value) / 100);
    gl.uniform2f(gl.getUniformLocation(program, "anchor"), position[0] || .5, 1 - (position[1] || .5));
    const fold = gl.getUniformLocation(program, "fold");
    const pixelRatio = Math.min(devicePixelRatio, 1.5);
    canvas.width = Math.round(stage.offsetWidth * 1.3 * pixelRatio);
    canvas.height = Math.round(stage.offsetHeight * 2.1 * pixelRatio);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 0);
    // Hold one crisp video frame for the whole gesture; reversal retraces exactly.
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);
    if (gl.getError() !== gl.NO_ERROR) throw new Error("Video texture unavailable");
    const paint = (amount: number) => {
      gl.clear(gl.COLOR_BUFFER_BIT); gl.uniform1f(fold, amount);
      gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 2);
      canvas.dataset.fold = amount.toFixed(4);
    };
    paint(0); stage.append(canvas);
    return { paint, dispose };
  } catch {
    dispose();
    return null;
  }
}
