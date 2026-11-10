import React, { useRef, useEffect, useState, useMemo, memo } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";

/**
 * Separable 2D box dilation (max filter) on a binary Uint8Array mask.
 */
function dilateBinaryMask(src, width, height, radius) {
  const horiz = new Uint8Array(width * height);
  const out = new Uint8Array(width * height);

  for (let y = 0; y < height; y++) {
    const row = y * width;
    let count = 0;
    for (let x = 0; x <= Math.min(radius, width - 1); x++) {
      count += src[row + x];
    }
    for (let x = 0; x < width; x++) {
      horiz[row + x] = count > 0 ? 1 : 0;
      const rem = x - radius;
      const add = x + radius + 1;
      if (rem >= 0) count -= src[row + rem];
      if (add < width) count += src[row + add];
    }
  }

  for (let x = 0; x < width; x++) {
    let count = 0;
    for (let y = 0; y <= Math.min(radius, height - 1); y++) {
      count += horiz[y * width + x];
    }
    for (let y = 0; y < height; y++) {
      out[y * width + x] = count > 0 ? 1 : 0;
      const rem = y - radius;
      const add = y + radius + 1;
      if (rem >= 0) count -= horiz[rem * width + x];
      if (add < height) count += horiz[add * width + x];
    }
  }

  return out;
}

/**
 * Separable 2D binary erosion (min filter) with given radius.
 */
function erodeBinaryMask(src, width, height, radius) {
  const horiz = new Uint8Array(width * height);
  const out = new Uint8Array(width * height);

  for (let y = 0; y < height; y++) {
    const row = y * width;
    let count = 0;
    for (let x = 0; x <= Math.min(radius, width - 1); x++) {
      count += src[row + x];
    }
    for (let x = 0; x < width; x++) {
      const win = Math.min(width - 1, x + radius) - Math.max(0, x - radius) + 1;
      horiz[row + x] = count === win ? 1 : 0;
      const rem = x - radius;
      const add = x + radius + 1;
      if (rem >= 0) count -= src[row + rem];
      if (add < width) count += src[row + add];
    }
  }

  for (let x = 0; x < width; x++) {
    let count = 0;
    for (let y = 0; y <= Math.min(radius, height - 1); y++) {
      count += horiz[y * width + x];
    }
    for (let y = 0; y < height; y++) {
      const win = Math.min(height - 1, y + radius) - Math.max(0, y - radius) + 1;
      out[y * width + x] = count === win ? 1 : 0;
      const rem = y - radius;
      const add = y + radius + 1;
      if (rem >= 0) count -= horiz[rem * width + x];
      if (add < height) count += horiz[add * width + x];
    }
  }

  return out;
}

/**
 * Separable 3-pass box blur approximating a Gaussian blur on Float32Array [0..1].
 */
function smoothMaskFloat(srcBinary, width, height, radius, passes = 3) {
  let bufA = new Float32Array(width * height);
  let bufB = new Float32Array(width * height);
  for (let i = 0; i < bufA.length; i++) bufA[i] = srcBinary[i];

  for (let p = 0; p < passes; p++) {
    // Horizontal
    for (let y = 0; y < height; y++) {
      const row = y * width;
      let sum = 0;
      for (let x = 0; x <= Math.min(radius, width - 1); x++) {
        sum += bufA[row + x];
      }
      for (let x = 0; x < width; x++) {
        const win = Math.min(width - 1, x + radius) - Math.max(0, x - radius) + 1;
        bufB[row + x] = sum / win;
        const rem = x - radius;
        const add = x + radius + 1;
        if (rem >= 0) sum -= bufA[row + rem];
        if (add < width) sum += bufA[row + add];
      }
    }
    // Vertical
    for (let x = 0; x < width; x++) {
      let sum = 0;
      for (let y = 0; y <= Math.min(radius, height - 1); y++) {
        sum += bufB[y * width + x];
      }
      for (let y = 0; y < height; y++) {
        const win = Math.min(height - 1, y + radius) - Math.max(0, y - radius) + 1;
        bufA[y * width + x] = sum / win;
        const rem = y - radius;
        const add = y + radius + 1;
        if (rem >= 0) sum -= bufB[rem * width + x];
        if (add < height) sum += bufB[add * width + x];
      }
    }
  }

  return bufA;
}

function smoothstepJS(edge0, edge1, x) {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

/**
 * Cleans jagged background crust and matte halo from the loaded base image in memory
 * without touching any files in client/public/hero/.
 */
function buildCleanBaseTexture(img) {
  const width = img.naturalWidth || img.width;
  const height = img.naturalHeight || img.height;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(img, 0, 0, width, height);

  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  const total = width * height;

  const origA = new Float32Array(total);
  const bright = new Uint8Array(total);
  const workA = new Uint8Array(total);
  const dark = new Uint8Array(total);

  for (let i = 0; i < total; i++) {
    const o = i * 4;
    const r = data[o];
    const g = data[o + 1];
    const b = data[o + 2];
    const a = data[o + 3];
    origA[i] = a / 255;
    if (a > 128) workA[i] = 1;
    if (r > 72 && a > 204) bright[i] = 1;
    if (r < 70 && g < 42 && b < 40) dark[i] = 1;
  }

  // Peel dark background crust attached near warm lit hair (y < 670, or right hair curl y < 860 && x > 590)
  const brightNear = dilateBinaryMask(bright, width, height, 18);
  const dist = new Uint8Array(total);
  const queue = new Int32Array(total);
  let qHead = 0;
  let qTail = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      if (!workA[idx] || !dark[idx] || !brightNear[idx]) continue;
      const inHair = y < 670 || (y < 860 && x > 590);
      if (!inHair) continue;

      const isEdge =
        x === 0 ||
        x === width - 1 ||
        y === 0 ||
        y === height - 1 ||
        !workA[idx - 1] ||
        !workA[idx + 1] ||
        !workA[idx - width] ||
        !workA[idx + width];

      if (isEdge) {
        dist[idx] = 1;
        workA[idx] = 0;
        queue[qTail++] = idx;
      }
    }
  }

  while (qHead < qTail) {
    const idx = queue[qHead++];
    const d = dist[idx];
    if (d >= 22) continue;

    const x = idx % width;
    const y = (idx - x) / width;

    const tryPush = (nx, ny) => {
      if (nx < 0 || nx >= width || ny < 0 || ny >= height) return;
      const nIdx = ny * width + nx;
      if (!workA[nIdx] || !dark[nIdx] || !brightNear[nIdx]) return;
      if (!(ny < 670 || (ny < 860 && nx > 590))) return;
      dist[nIdx] = d + 1;
      workA[nIdx] = 0;
      queue[qTail++] = nIdx;
    };

    tryPush(x - 1, y);
    tryPush(x + 1, y);
    tryPush(x, y - 1);
    tryPush(x, y + 1);
  }

  // Morphological opening (radius 2) + Gaussian-like smoothing on contour
  const eroded = erodeBinaryMask(workA, width, height, 2);
  const opened = dilateBinaryMask(eroded, width, height, 2);
  const blurred = smoothMaskFloat(opened, width, height, 2, 3);

  // Propagate clean interior RGB outward 6px into smoothed boundary to prevent dark matte fringe
  const validRgb = new Uint8Array(total);
  for (let i = 0; i < total; i++) {
    if (workA[i] && origA[i] > 0.9) validRgb[i] = 1;
  }

  let frontier = [];
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      if (validRgb[idx]) continue;
      if (
        validRgb[idx - 1] ||
        validRgb[idx + 1] ||
        validRgb[idx - width] ||
        validRgb[idx + width]
      ) {
        frontier.push(idx);
      }
    }
  }

  for (let pass = 0; pass < 6 && frontier.length > 0; pass++) {
    const nextFrontier = [];
    const updates = [];
    for (let k = 0; k < frontier.length; k++) {
      const idx = frontier[k];
      if (validRgb[idx]) continue;
      const x = idx % width;
      const y = (idx - x) / width;
      let rs = 0;
      let gs = 0;
      let bs = 0;
      let cnt = 0;

      const sampleN = (nIdx) => {
        if (validRgb[nIdx]) {
          const o = nIdx * 4;
          rs += data[o];
          gs += data[o + 1];
          bs += data[o + 2];
          cnt++;
        }
      };
      if (x > 0) sampleN(idx - 1);
      if (x < width - 1) sampleN(idx + 1);
      if (y > 0) sampleN(idx - width);
      if (y < height - 1) sampleN(idx + width);

      if (cnt > 0) {
        updates.push(idx, Math.round(rs / cnt), Math.round(gs / cnt), Math.round(bs / cnt));
      }
    }

    for (let u = 0; u < updates.length; u += 4) {
      const idx = updates[u];
      const o = idx * 4;
      data[o] = updates[u + 1];
      data[o + 1] = updates[u + 2];
      data[o + 2] = updates[u + 3];
      validRgb[idx] = 1;

      const x = idx % width;
      const y = (idx - x) / width;
      if (x > 0 && !validRgb[idx - 1]) nextFrontier.push(idx - 1);
      if (x < width - 1 && !validRgb[idx + 1]) nextFrontier.push(idx + 1);
      if (y > 0 && !validRgb[idx - width]) nextFrontier.push(idx - width);
      if (y < height - 1 && !validRgb[idx + width]) nextFrontier.push(idx + width);
    }
    frontier = nextFrontier;
  }

  // Write final smoothed alpha back into ImageData
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      const smoothA = smoothstepJS(0.52, 0.78, blurred[idx]);
      const cleanOrig = smoothstepJS(0.55, 0.92, origA[idx]);
      const shirtBlend = x <= 590 ? Math.max(0, Math.min(1, (y - 670) / 40)) : 0;
      const finalA =
        smoothA * (1 - shirtBlend) + Math.min(cleanOrig, smoothA) * shirtBlend;
      data[idx * 4 + 3] = Math.round(finalA * 255);
    }
  }

  ctx.putImageData(imageData, 0, 0);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.flipY = false;
  tex.premultiplyAlpha = false;
  tex.generateMipmaps = false;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.wrapS = THREE.ClampToEdgeWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.needsUpdate = true;
  return tex;
}

const VERTEX_SHADER = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FRAGMENT_SHADER = /* glsl */ `
  uniform sampler2D uBaseTex;
  uniform sampler2D uIrisLeftTex;
  uniform sampler2D uIrisRightTex;
  uniform sampler2D uMaskTex;

  uniform vec2 uSize;
  uniform vec2 uHeadPivot;
  uniform vec2 uHeadWeight;
  uniform float uRollRad;
  uniform vec2 uHeadShift;
  uniform vec2 uFaceCenter;
  uniform vec2 uFaceSigma;
  uniform vec2 uFaceShift;

  uniform vec2 uIrisLeftCenter;
  uniform vec2 uIrisLeftSpriteCenter;
  uniform float uIrisLeftSpriteSize;

  uniform vec2 uIrisRightCenter;
  uniform vec2 uIrisRightSpriteCenter;
  uniform float uIrisRightSpriteSize;

  uniform float uIrisShiftX;
  uniform float uIrisShiftUp;
  uniform float uIrisShiftDown;

  uniform vec2 uHead;
  uniform vec2 uEye;

  varying vec2 vUv;

  vec4 sampleIris(
    sampler2D spriteTex,
    vec2 q,
    vec2 irisCenter,
    vec2 spriteCenter,
    float spriteSize,
    vec2 eyeOffset
  ) {
    vec2 s = q - (irisCenter + eyeOffset) + spriteCenter;
    if (s.x >= 0.0 && s.x < spriteSize && s.y >= 0.0 && s.y < spriteSize) {
      return texture2D(spriteTex, s / spriteSize);
    }
    return vec4(0.0);
  }

  void main() {
    // Pixel coordinates in rig space (origin top-left, y points down)
    vec2 p = vec2(vUv.x, 1.0 - vUv.y) * uSize;

    // Head region weight
    float w = 1.0 - smoothstep(uHeadWeight.x, uHeadWeight.y, p.y);

    // Head rotation around pivot + head shift
    vec2 r = p - uHeadPivot;
    float theta = uRollRad * uHead.x;
    float cosT = cos(theta);
    float sinT = sin(theta);
    vec2 rotR = vec2(r.x * cosT - r.y * sinT, r.x * sinT + r.y * cosT);
    vec2 dHead = w * (rotR - r + uHeadShift * uHead);

    // Gaussian facial parallax shift
    vec2 fNorm = (p - uFaceCenter) / uFaceSigma;
    float g = exp(-dot(fNorm, fNorm));
    vec2 dFace = g * w * (uFaceShift * uHead);

    // Displaced sample coordinate
    vec2 q = p - dHead - dFace;
    if (q.x < 0.0 || q.x > uSize.x || q.y < 0.0 || q.y > uSize.y) {
      gl_FragColor = vec4(0.0);
      return;
    }

    vec2 qUv = q / uSize;
    vec4 base = texture2D(uBaseTex, qUv);
    vec4 mask = texture2D(uMaskTex, qUv);

    // Iris shift inside eye opening
    float eyeOffsetY = uEye.y < 0.0 ? uIrisShiftUp * uEye.y : uIrisShiftDown * uEye.y;
    vec2 eyeOffset = vec2(uIrisShiftX * uEye.x, eyeOffsetY);

    vec4 spL = sampleIris(
      uIrisLeftTex,
      q,
      uIrisLeftCenter,
      uIrisLeftSpriteCenter,
      uIrisLeftSpriteSize,
      eyeOffset
    );
    vec4 spR = sampleIris(
      uIrisRightTex,
      q,
      uIrisRightCenter,
      uIrisRightSpriteCenter,
      uIrisRightSpriteSize,
      eyeOffset
    );

    vec3 rgb = base.rgb;
    float alphaL = spL.a * mask.r;
    rgb = mix(rgb, spL.rgb, alphaL);

    float alphaR = spR.a * mask.g;
    rgb = mix(rgb, spR.rgb, alphaR);

    gl_FragColor = vec4(rgb, base.a);
    #include <colorspace_fragment>
  }
`;

function AvatarPlane({ rig, containerRef, isPaused, onReady }) {
  const { viewport, invalidate } = useThree();
  const [textures, setTextures] = useState(null);
  const materialRef = useRef(null);
  const hasNotifiedReadyRef = useRef(false);

  const stateRef = useRef({
    mode: "mouse", // "mouse" | "idle" | "outside" | "touch"
    targetX: 0,
    targetY: 0,
    cx: 0,
    cy: 0,
    ex: 0,
    ey: 0,
    lastMouseTime: performance.now(),
  });

  // Load textures with exact colorSpace, flipY=false, premultiplyAlpha=false
  useEffect(() => {
    let cancelled = false;
    const loader = new THREE.TextureLoader();

    const loadCleanBase = (url) =>
      new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          try {
            resolve(buildCleanBaseTexture(img));
          } catch (err) {
            reject(err);
          }
        };
        img.onerror = reject;
        img.src = url;
      });

    const loadSrgbSprite = (url) =>
      new Promise((resolve, reject) => {
        loader.load(
          url,
          (tex) => {
            tex.colorSpace = THREE.SRGBColorSpace;
            tex.flipY = false;
            tex.premultiplyAlpha = false;
            tex.wrapS = THREE.ClampToEdgeWrapping;
            tex.wrapT = THREE.ClampToEdgeWrapping;
            tex.generateMipmaps = false;
            tex.minFilter = THREE.LinearFilter;
            tex.magFilter = THREE.LinearFilter;
            tex.needsUpdate = true;
            resolve(tex);
          },
          undefined,
          reject
        );
      });

    const loadLinearMask = (url) =>
      new Promise((resolve, reject) => {
        loader.load(
          url,
          (tex) => {
            tex.colorSpace = THREE.NoColorSpace;
            tex.flipY = false;
            tex.premultiplyAlpha = false;
            tex.generateMipmaps = false;
            tex.minFilter = THREE.LinearFilter;
            tex.magFilter = THREE.LinearFilter;
            tex.wrapS = THREE.ClampToEdgeWrapping;
            tex.wrapT = THREE.ClampToEdgeWrapping;
            tex.needsUpdate = true;
            resolve(tex);
          },
          undefined,
          reject
        );
      });

    const eyeMaskFile = rig.files.eyeMask.split(" ")[0];

    Promise.all([
      loadCleanBase(`/hero/${rig.files.base}`),
      loadSrgbSprite(`/hero/${rig.files.irisLeft}`),
      loadSrgbSprite(`/hero/${rig.files.irisRight}`),
      loadLinearMask(`/hero/${eyeMaskFile}`),
    ])
      .then(([baseTex, irisLeftTex, irisRightTex, maskTex]) => {
        if (cancelled) {
          baseTex.dispose();
          irisLeftTex.dispose();
          irisRightTex.dispose();
          maskTex.dispose();
          return;
        }
        setTextures({ baseTex, irisLeftTex, irisRightTex, maskTex });
      })
      .catch(() => {
        // Keep static <img> placeholder visible if loading fails
      });

    return () => {
      cancelled = true;
    };
  }, [rig]);

  // Dispose textures on unmount
  useEffect(() => {
    return () => {
      if (textures) {
        textures.baseTex.dispose();
        textures.irisLeftTex.dispose();
        textures.irisRightTex.dispose();
        textures.maskTex.dispose();
      }
    };
  }, [textures]);

  const uniforms = useMemo(() => {
    if (!textures) return null;
    return {
      uBaseTex: { value: textures.baseTex },
      uIrisLeftTex: { value: textures.irisLeftTex },
      uIrisRightTex: { value: textures.irisRightTex },
      uMaskTex: { value: textures.maskTex },

      uSize: { value: new THREE.Vector2(rig.size[0], rig.size[1]) },
      uHeadPivot: { value: new THREE.Vector2(rig.headPivot[0], rig.headPivot[1]) },
      uHeadWeight: {
        value: new THREE.Vector2(rig.headWeight.fullAboveY, rig.headWeight.zeroBelowY),
      },
      uRollRad: { value: THREE.MathUtils.degToRad(rig.amplitude.rollDeg) },
      uHeadShift: {
        value: new THREE.Vector2(rig.amplitude.headShift[0], rig.amplitude.headShift[1]),
      },
      uFaceCenter: { value: new THREE.Vector2(rig.face.center[0], rig.face.center[1]) },
      uFaceSigma: { value: new THREE.Vector2(rig.face.sigma[0], rig.face.sigma[1]) },
      uFaceShift: {
        value: new THREE.Vector2(rig.amplitude.faceShift[0], rig.amplitude.faceShift[1]),
      },

      uIrisLeftCenter: {
        value: new THREE.Vector2(rig.irises.left.center[0], rig.irises.left.center[1]),
      },
      uIrisLeftSpriteCenter: {
        value: new THREE.Vector2(
          rig.irises.left.spriteCenter[0],
          rig.irises.left.spriteCenter[1]
        ),
      },
      uIrisLeftSpriteSize: { value: rig.irises.left.spriteSize },

      uIrisRightCenter: {
        value: new THREE.Vector2(rig.irises.right.center[0], rig.irises.right.center[1]),
      },
      uIrisRightSpriteCenter: {
        value: new THREE.Vector2(
          rig.irises.right.spriteCenter[0],
          rig.irises.right.spriteCenter[1]
        ),
      },
      uIrisRightSpriteSize: { value: rig.irises.right.spriteSize },

      uIrisShiftX: { value: rig.amplitude.irisShift.x },
      uIrisShiftUp: { value: rig.amplitude.irisShift.up },
      uIrisShiftDown: { value: rig.amplitude.irisShift.down },

      uHead: { value: new THREE.Vector2(0, 0) },
      uEye: { value: new THREE.Vector2(0, 0) },
    };
  }, [textures, rig]);

  // Render first frame and notify parent once textures & uniforms are mounted
  useEffect(() => {
    if (!uniforms) return;
    invalidate();
    if (!hasNotifiedReadyRef.current) {
      hasNotifiedReadyRef.current = true;
      onReady?.();
    }
  }, [uniforms, invalidate, onReady]);

  // Wake frameloop when resuming from off-screen or hidden tab
  useEffect(() => {
    if (!isPaused && uniforms) {
      invalidate();
    }
  }, [isPaused, uniforms, invalidate]);

  // Global pointer & touch tracking relative to her face position on screen
  useEffect(() => {
    if (!uniforms) return;

    const faceFracX = rig.face.center[0] / rig.size[0];
    const faceFracY = rig.face.center[1] / rig.size[1];

    let idleTimerId = null;

    const scheduleIdleLookAround = () => {
      if (idleTimerId) clearTimeout(idleTimerId);
      idleTimerId = setTimeout(() => {
        if (stateRef.current.mode === "mouse") {
          stateRef.current.mode = "idle";
          if (!isPaused) invalidate();
        }
      }, 2500);
    };

    const computeNormalizedOffset = (clientX, clientY) => {
      const el = containerRef?.current;
      let faceX = window.innerWidth * 0.5;
      let faceY = window.innerHeight * 0.45;
      if (el) {
        const rect = el.getBoundingClientRect();
        faceX = rect.left + rect.width * faceFracX;
        faceY = rect.top + rect.height * faceFracY;
      }
      const halfW = Math.max(window.innerWidth * 0.5, 1);
      const halfH = Math.max(window.innerHeight * 0.5, 1);
      return {
        tx: THREE.MathUtils.clamp((clientX - faceX) / halfW, -1, 1),
        ty: THREE.MathUtils.clamp((clientY - faceY) / halfH, -1, 1),
      };
    };

    const handlePointerMove = (e) => {
      if (e.pointerType === "touch") return;
      const { tx, ty } = computeNormalizedOffset(e.clientX, e.clientY);
      stateRef.current.mode = "mouse";
      stateRef.current.targetX = tx;
      stateRef.current.targetY = ty;
      stateRef.current.lastMouseTime = performance.now();
      scheduleIdleLookAround();
      if (!isPaused) invalidate();
    };

    const handlePointerLeaveWindow = () => {
      if (idleTimerId) clearTimeout(idleTimerId);
      stateRef.current.mode = "outside";
      stateRef.current.targetX = 0;
      stateRef.current.targetY = 0;
      if (!isPaused) invalidate();
    };

    const handleTouchStart = (e) => {
      if (idleTimerId) clearTimeout(idleTimerId);
      const touch = e.touches[0];
      if (!touch) return;
      const { tx, ty } = computeNormalizedOffset(touch.clientX, touch.clientY);
      stateRef.current.mode = "touch";
      stateRef.current.targetX = tx;
      stateRef.current.targetY = ty;
      if (!isPaused) invalidate();
    };

    const handleTouchMove = (e) => {
      if (idleTimerId) clearTimeout(idleTimerId);
      const touch = e.touches[0];
      if (!touch) return;
      const { tx, ty } = computeNormalizedOffset(touch.clientX, touch.clientY);
      stateRef.current.mode = "touch";
      stateRef.current.targetX = tx;
      stateRef.current.targetY = ty;
      if (!isPaused) invalidate();
    };

    const handleTouchEnd = () => {
      stateRef.current.mode = "idle";
      if (!isPaused) invalidate();
    };

    scheduleIdleLookAround();

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    document.addEventListener("mouseleave", handlePointerLeaveWindow);
    window.addEventListener("blur", handlePointerLeaveWindow);
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });
    window.addEventListener("touchcancel", handleTouchEnd, { passive: true });

    return () => {
      if (idleTimerId) clearTimeout(idleTimerId);
      window.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("mouseleave", handlePointerLeaveWindow);
      window.removeEventListener("blur", handlePointerLeaveWindow);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("touchcancel", handleTouchEnd);
    };
  }, [uniforms, rig, containerRef, isPaused, invalidate]);

  useFrame((_, delta) => {
    if (!materialRef.current || !uniforms || isPaused) return;

    const dt = Math.min(delta, 0.05);
    const s = stateRef.current;
    const now = performance.now();

    if (s.mode === "mouse" && now - s.lastMouseTime >= 2500) {
      s.mode = "idle";
    }

    let desX = s.targetX;
    let desY = s.targetY;

    if (s.mode === "idle") {
      const t = now * 0.001;
      desX = Math.sin(t * 0.55) * 0.42 + Math.sin(t * 0.23 + 1.1) * 0.16;
      desY = Math.sin(t * 0.37 + 0.6) * 0.28;
    }

    s.cx = THREE.MathUtils.damp(s.cx, desX, rig.smoothing.headLambda, dt);
    s.cy = THREE.MathUtils.damp(s.cy, desY, rig.smoothing.headLambda, dt);
    s.ex = THREE.MathUtils.damp(s.ex, desX, rig.smoothing.eyeLambda, dt);
    s.ey = THREE.MathUtils.damp(s.ey, desY, rig.smoothing.eyeLambda, dt);

    materialRef.current.uniforms.uHead.value.set(s.cx, s.cy);
    materialRef.current.uniforms.uEye.value.set(s.ex, s.ey);

    const stillMoving =
      s.mode === "idle" ||
      Math.abs(s.cx - desX) > 0.0005 ||
      Math.abs(s.cy - desY) > 0.0005 ||
      Math.abs(s.ex - desX) > 0.0005 ||
      Math.abs(s.ey - desY) > 0.0005;

    if (stillMoving) {
      invalidate();
    }
  });

  if (!uniforms) return null;

  return (
    <mesh scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={VERTEX_SHADER}
        fragmentShader={FRAGMENT_SHADER}
        uniforms={uniforms}
        transparent
        blending={THREE.NormalBlending}
        premultipliedAlpha={false}
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  );
}

/**
 * Lazy-loaded R3F Ortho Canvas rendering the rigged illustrated avatar on a single plane.
 */
function HeroCanvas({
  rig,
  containerRef,
  isVisible = true,
  shouldReduceMotion = false,
  onReady,
}) {
  const [isTabActive, setIsTabActive] = useState(
    typeof document !== "undefined" ? !document.hidden : true
  );

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsTabActive(!document.hidden);
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const isPaused = !isVisible || !isTabActive || shouldReduceMotion;

  return (
    <Canvas
      orthographic
      dpr={[1, 1.75]}
      frameloop="demand"
      camera={{ position: [0, 0, 10], zoom: 1, near: 0.1, far: 100 }}
      gl={{
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
        premultipliedAlpha: true,
      }}
      className="w-full h-full pointer-events-none"
    >
      <AvatarPlane
        rig={rig}
        containerRef={containerRef}
        isPaused={isPaused}
        onReady={onReady}
      />
    </Canvas>
  );
}

export default memo(HeroCanvas);
