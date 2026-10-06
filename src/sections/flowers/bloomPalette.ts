import type { BloomCanvasFrame } from '@/lib/assets/preloadBloomSequence';

export type BloomPalette = 'pink' | 'ivory' | 'midnight';

function createRenderer() {
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: false, antialias: false, preserveDrawingBuffer: true });
  if (!gl) return null;
  const compile = (type: number, code: string) => {
    const shader = gl.createShader(type)!;
    gl.shaderSource(shader, code); gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error('Bloom palette shader unavailable');
    return shader;
  };
  const program = gl.createProgram()!;
  gl.attachShader(program, compile(gl.VERTEX_SHADER, `
    attribute vec2 point; varying vec2 uv;
    void main(){ uv=(point+1.0)*0.5;gl_Position=vec4(point,0.0,1.0); }
  `));
  gl.attachShader(program, compile(gl.FRAGMENT_SHADER, `
    precision mediump float;uniform sampler2D flower;uniform float palette;varying vec2 uv;
    void main(){
      vec4 source=texture2D(flower,uv);
      float warm=max(0.0,source.r-source.g);
      // Coral at the petal throat is pigment too. Blue/red separates it from
      // orange pollen without leaving a pink seam on ivory or midnight petals.
      float petal=smoothstep(0.015,0.10,warm)*smoothstep(0.18,0.42,source.b/max(source.r,0.01));
      float light=dot(source.rgb,vec3(0.2126,0.7152,0.0722));
      vec3 ivory=vec3(0.98,0.98,0.92)*(light*0.72+0.21);
      vec3 midnight=vec3(0.035,0.068,0.11)+pow(light,1.15)*vec3(0.18,0.235,0.295);
      // Only pink pigment changes; leaf greens, gold stamens, alpha and petal relief stay intact.
      gl_FragColor=vec4(mix(source.rgb,palette<1.5?ivory:midnight,petal),source.a);
    }
  `));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;
  gl.useProgram(program);
  const buffer = gl.createBuffer()!; gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW);
  const point = gl.getAttribLocation(program, 'point');
  gl.enableVertexAttribArray(point); gl.vertexAttribPointer(point, 2, gl.FLOAT, false, 0, 0);
  const texture = gl.createTexture()!; gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.uniform1i(gl.getUniformLocation(program, 'flower'), 0);
  const color = gl.getUniformLocation(program, 'palette');
  let previous: BloomCanvasFrame | null = null;
  return { canvas, draw(image: BloomCanvasFrame, palette: BloomPalette, width: number, height: number) {
    if (gl.isContextLost()) throw new Error('Bloom palette context lost');
    const ratio = Math.min(devicePixelRatio, 1.5);
    const w = Math.ceil(width * ratio), h = Math.ceil(height * ratio);
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
    gl.viewport(0, 0, w, h);
    if (previous !== image) { gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image); previous = image; }
    gl.uniform1f(color, palette === 'ivory' ? 1 : 2);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  } };
}

// One shared renderer; all colors reuse the same 60 decoded photographic frames.
let renderer: ReturnType<typeof createRenderer> | undefined;
export function drawBloomFrame(context: CanvasRenderingContext2D, image: BloomCanvasFrame, palette: BloomPalette, width: number, height: number) {
  if (palette === 'pink') { context.drawImage(image, 0, 0, width, height); return 'original'; }
  try {
    if (renderer === undefined) renderer = createRenderer();
    if (renderer) {
      renderer.draw(image, palette, width, height);
      context.drawImage(renderer.canvas, 0, 0, width, height);
      return 'webgl';
    }
  } catch { renderer = null; }
  // Keep the actual opening frames available even on devices without WebGL.
  context.save();
  context.filter = palette === 'ivory' ? 'saturate(.08) brightness(1.24)' : 'hue-rotate(250deg) saturate(.7) brightness(.64)';
  context.drawImage(image, 0, 0, width, height); context.restore();
  return 'filter';
}
