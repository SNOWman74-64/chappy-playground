export const particleVertex = /* glsl */`
uniform float uTime;
uniform float uCollapse;
uniform float uBurst;
uniform vec2 uPointer;
uniform float uPixelRatio;

attribute float aSeed;
attribute float aSize;
attribute float aHue;

varying float vAlpha;
varying float vSeed;
varying float vHue;
varying float vHeat;

void main() {
  vec3 p = position;
  float baseRadius = length(p.xz);
  float angle = atan(p.z, p.x);
  float collapse = smoothstep(0.0, 1.0, uCollapse);

  angle += uTime * (0.075 + 0.46 / (baseRadius + 0.55));
  angle += collapse * (2.3 + 8.2 / (baseRadius + 0.8));

  float collapsedRadius = 0.10 + baseRadius * 0.075;
  float radius = mix(baseRadius, collapsedRadius, collapse);
  radius *= 1.0 + uBurst * (0.75 + aSeed * 2.5);

  p.x = cos(angle) * radius;
  p.z = sin(angle) * radius;
  p.y = p.y * (1.0 - collapse * 0.72);
  p.y += sin(angle * 3.0 + uTime * 1.45 + aSeed * 12.0) * 0.045 * (1.0 - collapse);

  vec2 field = p.xz - uPointer * 3.2;
  float fieldDistance = dot(field, field);
  float well = exp(-fieldDistance * 0.18) * (1.0 - collapse);
  vec2 fieldDirection = normalize(field + vec2(0.0001));
  p.xz += fieldDirection * well * sin(uTime * 2.2 + aSeed * 6.2831) * 0.24;
  p.y += well * (0.42 + 0.22 * sin(uTime * 2.0 + aSeed * 10.0));

  vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  float perspective = clamp(255.0 / max(1.0, -mvPosition.z), 0.45, 6.0);
  gl_PointSize = aSize * perspective * uPixelRatio * (1.0 + collapse * 0.85);

  vAlpha = clamp(1.12 - baseRadius / 12.0, 0.20, 1.0);
  vSeed = aSeed;
  vHue = aHue;
  vHeat = clamp(collapse * 0.86 + exp(-radius * 1.25), 0.0, 1.0);
}
`;

export const particleFragment = /* glsl */`
precision highp float;
varying float vAlpha;
varying float vSeed;
varying float vHue;
varying float vHeat;

void main() {
  vec2 d = gl_PointCoord - 0.5;
  float r = length(d);
  float soft = 1.0 - smoothstep(0.04, 0.50, r);
  if (soft < 0.01) discard;

  vec3 cyan = vec3(0.18, 0.76, 1.0);
  vec3 violet = vec3(0.64, 0.32, 1.0);
  vec3 ice = vec3(0.80, 0.94, 1.0);
  vec3 cold = mix(cyan, violet, vHue);
  cold = mix(cold, ice, smoothstep(0.72, 1.0, vSeed) * 0.55);

  vec3 hotA = vec3(1.0, 0.20, 0.07);
  vec3 hotB = vec3(1.0, 0.92, 0.56);
  vec3 hot = mix(hotA, hotB, vSeed);
  vec3 color = mix(cold, hot, vHeat);
  float core = 1.0 - smoothstep(0.0, 0.22, r);
  color *= 1.05 + core * 2.0;
  gl_FragColor = vec4(color, soft * vAlpha);
}
`;

export const rimVertex = /* glsl */`
varying vec3 vNormal;
varying vec3 vViewDirection;
void main() {
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  vNormal = normalize(normalMatrix * normal);
  vViewDirection = normalize(-mvPosition.xyz);
  gl_Position = projectionMatrix * mvPosition;
}
`;

export const rimFragment = /* glsl */`
precision highp float;
uniform float uTime;
uniform float uCollapse;
varying vec3 vNormal;
varying vec3 vViewDirection;
void main() {
  float fresnel = pow(1.0 - abs(dot(vNormal, vViewDirection)), 2.35);
  float pulse = 0.82 + 0.18 * sin(uTime * 3.0);
  vec3 cold = vec3(0.12, 0.72, 1.0);
  vec3 hot = vec3(1.0, 0.28, 0.06);
  vec3 color = mix(cold, hot, uCollapse);
  gl_FragColor = vec4(color * fresnel * pulse * 2.2, fresnel * 0.92);
}
`;

export const diskVertex = /* glsl */`
varying vec2 vLocal;
void main() {
  vLocal = position.xy;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const diskFragment = /* glsl */`
precision highp float;
uniform float uTime;
uniform float uCollapse;
varying vec2 vLocal;
void main() {
  float radius = length(vLocal);
  float angle = atan(vLocal.y, vLocal.x);
  float streakA = 0.5 + 0.5 * sin(angle * 28.0 - uTime * 4.8 + radius * 9.0);
  float streakB = 0.5 + 0.5 * sin(angle * 11.0 + uTime * 2.2 - radius * 16.0);
  float radial = (1.0 - smoothstep(0.75, 3.8, radius)) * smoothstep(0.58, 1.0, radius);
  float gaps = smoothstep(0.16, 0.72, streakA * 0.7 + streakB * 0.3);
  vec3 cold = vec3(0.12, 0.64, 1.0);
  vec3 warm = vec3(1.0, 0.29, 0.04);
  vec3 color = mix(cold, warm, smoothstep(0.2, 1.0, uCollapse + streakA * 0.34));
  float alpha = radial * (0.08 + gaps * 0.56) * (1.0 - uCollapse * 0.32);
  gl_FragColor = vec4(color * (1.2 + gaps), alpha);
}
`;

export const lensShader = {
  uniforms: {
    tDiffuse: { value: null },
    uStrength: { value: 0.18 },
    uCollapse: { value: 0 },
    uCenter: { value: null },
    uTime: { value: 0 }
  },
  vertexShader: /* glsl */`
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */`
    precision highp float;
    uniform sampler2D tDiffuse;
    uniform float uStrength;
    uniform float uCollapse;
    uniform vec2 uCenter;
    varying vec2 vUv;

    void main() {
      vec2 center = uCenter;
      vec2 d = vUv - center;
      float radius = length(d);
      vec2 direction = normalize(d + vec2(0.00001));
      float mask = 1.0 - smoothstep(0.015, 0.42, radius);
      float bend = mask * uStrength * (0.010 + uCollapse * 0.020) / (radius + 0.09);
      vec2 uv = vUv - direction * bend;
      float chroma = mask * (0.0012 + uCollapse * 0.0028);
      float red = texture2D(tDiffuse, uv + direction * chroma).r;
      float green = texture2D(tDiffuse, uv).g;
      float blue = texture2D(tDiffuse, uv - direction * chroma).b;
      vec3 color = vec3(red, green, blue);
      float horizon = exp(-pow((radius - 0.092 - uCollapse * 0.022) * 34.0, 2.0));
      color += horizon * mix(vec3(0.08, 0.56, 1.0), vec3(1.0, 0.22, 0.04), uCollapse) * 0.72;
      gl_FragColor = vec4(color, 1.0);
    }
  `
};
