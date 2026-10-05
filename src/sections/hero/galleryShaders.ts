export const galleryVertex = `
attribute vec2 position;
varying vec2 vUv;
void main() { vUv = position * .5 + .5; gl_Position = vec4(position, 0., 1.); }
`;

export const galleryFragment = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uRelief;
uniform sampler2D uFlowers;
uniform sampler2D uBrush;
uniform vec2 uResolution;
uniform vec2 uPointer;
uniform vec2 uOrigin;
uniform float uNight;
uniform float uTime;
uniform float uStill;

vec2 cover(vec2 uv, float mobileCenter) {
  float aspect = uResolution.x / uResolution.y;
  vec2 size = aspect > 1.777 ? vec2(1., 1.777 / aspect) : vec2(aspect / 1.777, 1.);
  // The mobile crop keeps the sculpted pair of cats within reach.
  vec2 center = vec2(mix(mobileCenter, .5, smoothstep(.6, 1.5, aspect)), .5);
  return (uv - .5) * size + center;
}
float grain(vec2 p) { return fract(sin(dot(p, vec2(12.9898,78.233))) * 43758.5453); }
void main() {
  vec2 uv = vec2(vUv.x, 1. - vUv.y);
  float field = texture2D(uBrush, uv).r;
  float reveal = smoothstep(.04, .82, field);
  reveal = mix(reveal, .46, uStill);
  vec2 parallax = (uPointer - .5) * vec2(.003, .004) * reveal;
  vec3 raw = texture2D(uRelief, cover(uv, .74) + parallax).rgb;
  float sculpt = dot(raw, vec3(.299,.587,.114));
  vec3 plaster = vec3(.898,.887,.867);
  float noise = (grain(gl_FragCoord.xy) - .5) * .014;
  vec3 wall = plaster + noise;
  vec3 raised = plaster + (sculpt - .825) * .85 + noise * .4;
  vec3 daylight = mix(wall, raised, max(.015, reveal));

  vec2 nightUv = (uv - .5) * .94 + .5;
  vec2 camera = (uPointer - .5) * vec2(.043, .033) * (1. - uStill);
  // A continuous depth field keeps petals intact while foreground branches travel farther.
  float depth = smoothstep(.2, .75, length((uv - .5) * vec2(1., .8)));
  float sway = sin(uv.y * 4. + uv.x * 3. + uTime * .55) * .004 * (1. - uStill);
  nightUv += camera * (.25 + depth) + vec2(sway * (1. - uv.y), sway * .25);
  vec3 night = texture2D(uFlowers, cover(nightUv, .61)).rgb;
  float light = exp(-length((uv - uPointer) * vec2(uResolution.x / uResolution.y,1.)) * 2.8);
  night *= .44 + light * .5;
  night += noise * .15;
  float radius = uNight * 2.5;
  float dist = length((uv - uOrigin) * vec2(uResolution.x / uResolution.y, 1.));
  float iris = 1. - smoothstep(radius - .16, radius + .12, dist);
  iris *= smoothstep(0., .07, uNight);
  iris = mix(iris, 1., smoothstep(.92,1.,uNight));
  gl_FragColor = vec4(mix(daylight, night, iris), 1.);
}
`;
