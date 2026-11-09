import { deflateSync } from 'node:zlib';

// Theme + Hue palettes matching src/styles/tokens.css & ICON_SYSTEM_INSTRUCTIONS.md
export const clayPalettes = {
  night: {
    rim: [156, 195, 255, 0.60],
    shadow: [0, 0, 0, 0.18],
    innerEdge: 0,
    hues: {
      blue:     { base: '#9CC3FF', shade: '#5B8DEF', hi: '#D6E6FF', on: '#0B0B0A' },
      lime:     { base: '#C6F36B', shade: '#8DBA2E', hi: '#E9FFC2', on: '#0B0B0A' },
      violet:   { base: '#C4B1FF', shade: '#8B6FE8', hi: '#E7DEFF', on: '#0B0B0A' },
      teal:     { base: '#7FE0D0', shade: '#2FA394', hi: '#C9F5EE', on: '#0B0B0A' },
      amber:    { base: '#FBCB6A', shade: '#D9952B', hi: '#FFE9B8', on: '#0B0B0A' },
      coral:    { base: '#FF9F87', shade: '#E0664B', hi: '#FFD6CB', on: '#0B0B0A' },
      rose:     { base: '#F7A8C8', shade: '#D6608F', hi: '#FDDDEA', on: '#0B0B0A' },
      graphite: { base: '#CFCCC3', shade: '#8E8B83', hi: '#F2F0EA', on: '#0B0B0A' },
    },
  },
  paper: {
    rim: [255, 255, 255, 0.80],
    shadow: [14, 26, 51, 0.10],
    innerEdge: 0,
    hues: {
      blue:     { base: '#2F62C9', shade: '#1F4699', hi: '#8FB2F2', on: '#FFFFFF' },
      lime:     { base: '#4D7A00', shade: '#365700', hi: '#B5E35A', on: '#FFFFFF' },
      violet:   { base: '#6A4BD1', shade: '#4B30A3', hi: '#B9A6F5', on: '#FFFFFF' },
      teal:     { base: '#0F7C6E', shade: '#0A5A50', hi: '#7FD3C6', on: '#FFFFFF' },
      amber:    { base: '#A85C00', shade: '#7A4300', hi: '#F5C065', on: '#FFFFFF' },
      coral:    { base: '#C2410C', shade: '#922F07', hi: '#F7A487', on: '#FFFFFF' },
      rose:     { base: '#B3306A', shade: '#86204E', hi: '#F0A0C2', on: '#FFFFFF' },
      graphite: { base: '#0E1A33', shade: '#050C1C', hi: '#8C97AD', on: '#F5F7FB' },
    },
  },
  glass: {
    rim: [243, 238, 255, 0.70],
    shadow: [14, 26, 51, 0.10],
    innerEdge: 0.55,
    hues: {
      lime:     { base: '#A3FF00', shade: '#6FB300', hi: '#DBFF99', on: '#202021' },
      blue:     { base: '#A8C7FF', shade: '#5E8BE0', hi: '#DCE8FF', on: '#202021' },
      violet:   { base: '#CDB8FF', shade: '#8F6FE6', hi: '#EDE4FF', on: '#202021' },
      teal:     { base: '#8FE3D3', shade: '#3AA897', hi: '#D4F7F0', on: '#202021' },
      amber:    { base: '#FFD27A', shade: '#D99A2B', hi: '#FFEDC2', on: '#202021' },
      coral:    { base: '#FFB09C', shade: '#E26F55', hi: '#FFDCD3', on: '#202021' },
      rose:     { base: '#FFB8D4', shade: '#DB6A97', hi: '#FFE2EE', on: '#202021' },
      graphite: { base: '#D9D6E0', shade: '#8C8899', hi: '#F3F1F7', on: '#202021' },
    },
  },
};

function hexToRgb(hex) {
  const clean = hex.replace('#', '');
  return [
    Number.parseInt(clean.slice(0, 2), 16),
    Number.parseInt(clean.slice(2, 4), 16),
    Number.parseInt(clean.slice(4, 6), 16),
  ];
}

// Minimal CRC32 table for PNG chunks
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  crcTable[n] = c >>> 0;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

export function encodePNG(width, height, rgba) {
  const raw = Buffer.alloc(height * (1 + width * 4));
  for (let y = 0; y < height; y++) {
    const rowStart = y * (1 + width * 4);
    raw[rowStart] = 0; // filter type 0
    const srcStart = y * width * 4;
    rgba.copy(raw, rowStart + 1, srcStart, srcStart + width * 4);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  const compressed = deflateSync(raw, { level: 6 });
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', compressed),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

// Convert SVG arc endpoint parameterization to polyline points
function sampleArc(x1, y1, rx, ry, phiDeg, largeArc, sweep, x2, y2, steps = 20) {
  if (rx === 0 || ry === 0 || (x1 === x2 && y1 === y2)) return [[x2, y2]];
  rx = Math.abs(rx);
  ry = Math.abs(ry);
  const phi = (phiDeg * Math.PI) / 180;
  const cosPhi = Math.cos(phi);
  const sinPhi = Math.sin(phi);
  const dx2 = (x1 - x2) / 2;
  const dy2 = (y1 - y2) / 2;
  const x1p = cosPhi * dx2 + sinPhi * dy2;
  const y1p = -sinPhi * dx2 + cosPhi * dy2;

  let lambda = (x1p * x1p) / (rx * rx) + (y1p * y1p) / (ry * ry);
  if (lambda > 1) {
    const s = Math.sqrt(lambda);
    rx *= s;
    ry *= s;
  }
  const rx2 = rx * rx;
  const ry2 = ry * ry;
  const x1p2 = x1p * x1p;
  const y1p2 = y1p * y1p;
  let factor = Math.max(0, (rx2 * ry2 - rx2 * y1p2 - ry2 * x1p2) / (rx2 * y1p2 + ry2 * x1p2));
  factor = Math.sqrt(factor) * (largeArc === sweep ? -1 : 1);
  const cxp = (factor * rx * y1p) / ry;
  const cyp = (factor * -ry * x1p) / rx;
  const cx = cosPhi * cxp - sinPhi * cyp + (x1 + x2) / 2;
  const cy = sinPhi * cxp + cosPhi * cyp + (y1 + y2) / 2;

  const angle = (ux, uy, vx, vy) => {
    const dot = ux * vx + uy * vy;
    const len = Math.hypot(ux, uy) * Math.hypot(vx, vy);
    let ang = Math.acos(Math.max(-1, Math.min(1, dot / (len || 1))));
    if (ux * vy - uy * vx < 0) ang = -ang;
    return ang;
  };
  const theta1 = angle(1, 0, (x1p - cxp) / rx, (y1p - cyp) / ry);
  let dtheta = angle((x1p - cxp) / rx, (y1p - cyp) / ry, (-x1p - cxp) / rx, (-y1p - cyp) / ry);
  if (!sweep && dtheta > 0) dtheta -= 2 * Math.PI;
  if (sweep && dtheta < 0) dtheta += 2 * Math.PI;

  const pts = [];
  for (let i = 1; i <= steps; i++) {
    const t = theta1 + (dtheta * i) / steps;
    const cosT = Math.cos(t);
    const sinT = Math.sin(t);
    pts.push([
      cosPhi * rx * cosT - sinPhi * ry * sinT + cx,
      sinPhi * rx * cosT + cosPhi * ry * sinT + cy,
    ]);
  }
  return pts;
}

export function parseSvgPolygons(d) {
  if (!d) return [];
  const tokens = d.match(/[a-zA-Z]|[-+]?(?:\d+\.?\d*|\.\d+)/g) || [];
  const polys = [];
  let current = [];
  let i = 0;
  let cmd = 'M';
  let cx = 0;
  let cy = 0;
  let sx = 0;
  let sy = 0;

  const nextNum = () => Number.parseFloat(tokens[i++]);
  const isCmd = (tok) => tok && /^[a-zA-Z]$/.test(tok);

  while (i < tokens.length) {
    if (isCmd(tokens[i])) cmd = tokens[i++];
    switch (cmd) {
      case 'M':
      case 'm': {
        if (current.length > 2) polys.push(current);
        const nx = nextNum();
        const ny = nextNum();
        cx = cmd === 'm' ? cx + nx : nx;
        cy = cmd === 'm' ? cy + ny : ny;
        sx = cx;
        sy = cy;
        current = [[cx, cy]];
        cmd = cmd === 'm' ? 'l' : 'L';
        break;
      }
      case 'L':
      case 'l': {
        const nx = nextNum();
        const ny = nextNum();
        cx = cmd === 'l' ? cx + nx : nx;
        cy = cmd === 'l' ? cy + ny : ny;
        current.push([cx, cy]);
        break;
      }
      case 'H':
      case 'h': {
        const nx = nextNum();
        cx = cmd === 'h' ? cx + nx : nx;
        current.push([cx, cy]);
        break;
      }
      case 'V':
      case 'v': {
        const ny = nextNum();
        cy = cmd === 'v' ? cy + ny : ny;
        current.push([cx, cy]);
        break;
      }
      case 'C':
      case 'c': {
        const x1 = cmd === 'c' ? cx + nextNum() : nextNum();
        const y1 = cmd === 'c' ? cy + nextNum() : nextNum();
        const x2 = cmd === 'c' ? cx + nextNum() : nextNum();
        const y2 = cmd === 'c' ? cy + nextNum() : nextNum();
        const x = cmd === 'c' ? cx + nextNum() : nextNum();
        const y = cmd === 'c' ? cy + nextNum() : nextNum();
        for (let s = 1; s <= 12; s++) {
          const t = s / 12;
          const mt = 1 - t;
          current.push([
            mt * mt * mt * cx + 3 * mt * mt * t * x1 + 3 * mt * t * t * x2 + t * t * t * x,
            mt * mt * mt * cy + 3 * mt * mt * t * y1 + 3 * mt * t * t * y2 + t * t * t * y,
          ]);
        }
        cx = x;
        cy = y;
        break;
      }
      case 'Q':
      case 'q': {
        const x1 = cmd === 'q' ? cx + nextNum() : nextNum();
        const y1 = cmd === 'q' ? cy + nextNum() : nextNum();
        const x = cmd === 'q' ? cx + nextNum() : nextNum();
        const y = cmd === 'q' ? cy + nextNum() : nextNum();
        for (let s = 1; s <= 10; s++) {
          const t = s / 10;
          const mt = 1 - t;
          current.push([
            mt * mt * cx + 2 * mt * t * x1 + t * t * x,
            mt * mt * cy + 2 * mt * t * y1 + t * t * y,
          ]);
        }
        cx = x;
        cy = y;
        break;
      }
      case 'A':
      case 'a': {
        const rx = nextNum();
        const ry = nextNum();
        const rot = nextNum();
        const large = nextNum();
        const sweep = nextNum();
        const x = cmd === 'a' ? cx + nextNum() : nextNum();
        const y = cmd === 'a' ? cy + nextNum() : nextNum();
        for (const pt of sampleArc(cx, cy, rx, ry, rot, large, sweep, x, y, 18)) current.push(pt);
        cx = x;
        cy = y;
        break;
      }
      case 'Z':
      case 'z': {
        if (current.length > 0) {
          current.push([sx, sy]);
          polys.push(current);
          current = [];
        }
        cx = sx;
        cy = sy;
        break;
      }
      default:
        i++;
        break;
    }
  }
  if (current.length > 1) polys.push(current);
  return polys;
}

function pointInPolysEvenOdd(x, y, polys) {
  let inside = false;
  for (const poly of polys) {
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const xi = poly[i][0], yi = poly[i][1];
      const xj = poly[j][0], yj = poly[j][1];
      const intersect = ((yi > y) !== (yj > y)) && (x < ((xj - xi) * (y - yi)) / (yj - yi + 1e-12) + xi);
      if (intersect) inside = !inside;
    }
  }
  return inside;
}

function distToSegments(x, y, polys) {
  let minD2 = Infinity;
  for (const poly of polys) {
    for (let i = 0; i < poly.length - 1; i++) {
      const x1 = poly[i][0], y1 = poly[i][1];
      const x2 = poly[i + 1][0], y2 = poly[i + 1][1];
      const dx = x2 - x1;
      const dy = y2 - y1;
      const len2 = dx * dx + dy * dy;
      const t = len2 > 0 ? Math.max(0, Math.min(1, ((x - x1) * dx + (y - y1) * dy) / len2)) : 0;
      const px = x1 + t * dx;
      const py = y1 + t * dy;
      const d2 = (x - px) * (x - px) + (y - py) * (y - py);
      if (d2 < minD2) minD2 = d2;
    }
  }
  return Math.sqrt(minD2);
}

// Precompute 3D soft-clay geometry & lighting at a target pixel size
export function buildClayGeometry(icon, size = 96) {
  const bodyPolys = parseSvgPolygons(icon.filled || icon.plate);
  const detailPolys = parseSvgPolygons(icon.detail || '');
  // 12% padding around the 24x24 icon box so shadows and extrusion never clip
  const pad = size * 0.14;
  const scale = (size - pad * 2) / 24;
  // Orthographic camera: elevation 22°, azimuth -28° -> screen-space extrusion offset per unit depth
  const extSteps = Math.max(4, Math.round(size * 0.065));
  const stepX = (size * 0.055) / extSteps;
  const stepY = (size * 0.048) / extSteps;
  const bevelRadius = 1.65; // in 24x24 units (~8% of live area)

  const heightMap = new Float32Array(size * size);
  const mask = new Float32Array(size * size);
  const detailMask = new Float32Array(size * size);

  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size; px++) {
      const gx = (px - pad) / scale;
      const gy = (py - pad) / scale;
      const idx = py * size + px;
      if (gx < -2 || gx > 26 || gy < -2 || gy > 26) continue;
      const inside = pointInPolysEvenOdd(gx, gy, bodyPolys);
      const d = distToSegments(gx, gy, bodyPolys);
      const signed = inside ? d : -d;
      // Anti-aliased coverage
      const cov = Math.max(0, Math.min(1, 0.5 + signed * scale * 0.85));
      mask[idx] = cov;
      if (cov > 0) {
        // 4-segment soft bevel profile
        const t = Math.max(0, Math.min(1, (signed + 0.25) / bevelRadius));
        const smooth = 1 - Math.pow(1 - t, 2.6);
        let h = smooth * 3.2;
        if (detailPolys.length > 0) {
          const dDet = distToSegments(gx, gy, detailPolys);
          const inDet = pointInPolysEvenOdd(gx, gy, detailPolys) || dDet < 0.85;
          if (inDet) {
            const dt = Math.max(0, Math.min(1, (0.95 - dDet) * 1.6));
            detailMask[idx] = dt;
            h += dt * 0.65; // float 4% forward
          }
        }
        heightMap[idx] = h;
      }
    }
  }

  // Composite extruded side walls + front face + contact shadow
  const sideMask = new Float32Array(size * size);
  const shadowMask = new Float32Array(size * size);
  for (let s = extSteps; s >= 1; s--) {
    const ox = Math.round(s * stepX);
    const oy = Math.round(s * stepY);
    for (let y = 0; y < size; y++) {
      const sy = y - oy;
      if (sy < 0 || sy >= size) continue;
      for (let x = 0; x < size; x++) {
        const sx = x - ox;
        if (sx < 0 || sx >= size) continue;
        const c = mask[sy * size + sx];
        if (c > sideMask[y * size + x]) sideMask[y * size + x] = c;
      }
    }
  }

  // Soft contact shadow offset downward
  const shOffsetY = Math.round(size * 0.075);
  const shOffsetX = Math.round(size * 0.025);
  const blurR = Math.max(2, Math.round(size * 0.045));
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let sum = 0;
      let count = 0;
      for (let by = -blurR; by <= blurR; by += 2) {
        for (let bx = -blurR; bx <= blurR; bx += 2) {
          const sx = x - shOffsetX + bx;
          const sy = y - shOffsetY + by;
          if (sx >= 0 && sx < size && sy >= 0 && sy < size) {
            sum += Math.max(mask[sy * size + sx], sideMask[sy * size + sx]);
          }
          count++;
        }
      }
      shadowMask[y * size + x] = sum / count;
    }
  }

  // Surface normals & lighting factors
  // Key light top-left (-0.55, -0.62, 0.56), Rim light back-right (0.68, 0.45, 0.58)
  const kdBuf = new Float32Array(size * size);
  const ksBuf = new Float32Array(size * size);
  const krimBuf = new Float32Array(size * size);
  const innerEdgeBuf = new Float32Array(size * size);

  for (let y = 1; y < size - 1; y++) {
    for (let x = 1; x < size - 1; x++) {
      const idx = y * size + x;
      if (mask[idx] <= 0.01) continue;
      const dzdx = (heightMap[idx + 1] - heightMap[idx - 1]) * 0.65;
      const dzdy = (heightMap[(y + 1) * size + x] - heightMap[(y - 1) * size + x]) * 0.65;
      const invLen = 1 / Math.hypot(dzdx, dzdy, 1);
      const nx = -dzdx * invLen;
      const ny = -dzdy * invLen;
      const nz = invLen;

      const keyDot = Math.max(0, nx * -0.55 + ny * -0.62 + nz * 0.56);
      const fillDot = Math.max(0, nx * 0.35 + ny * 0.25 + nz * 0.90) * 0.30;
      kdBuf[idx] = Math.min(1, keyDot * 0.82 + fillDot + 0.15);

      // Half-vector specular for matte clay (roughness .55, specular .3)
      const hx = -0.32, hy = -0.36, hz = 0.88;
      const specDot = Math.max(0, nx * hx + ny * hy + nz * hz);
      ksBuf[idx] = Math.pow(specDot, 14) * 0.32;

      // Back-right rim light
      const rimDot = Math.max(0, nx * 0.72 + ny * 0.52 + (1 - nz) * 0.45);
      krimBuf[idx] = Math.pow(rimDot, 2.2);

      // 0.5px inner edge for Glass theme
      const edgeGrad = Math.hypot(mask[idx + 1] - mask[idx - 1], mask[(y + 1) * size + x] - mask[(y - 1) * size + x]);
      innerEdgeBuf[idx] = Math.min(1, edgeGrad * 0.9);
    }
  }

  return { size, mask, sideMask, shadowMask, detailMask, kdBuf, ksBuf, krimBuf, innerEdgeBuf };
}

export function shadeClayRender(geom, themeName, hueName) {
  const { size, mask, sideMask, shadowMask, detailMask, kdBuf, ksBuf, krimBuf, innerEdgeBuf } = geom;
  const theme = clayPalettes[themeName];
  const hue = theme.hues[hueName];
  const base = hexToRgb(hue.base);
  const shade = hexToRgb(hue.shade);
  const hi = hexToRgb(hue.hi);
  const on = hexToRgb(hue.on);
  const [rimR, rimG, rimB, rimA] = theme.rim;
  const [shR, shG, shB, shA] = theme.shadow;

  const rgba = Buffer.alloc(size * size * 4);

  for (let i = 0; i < size * size; i++) {
    const fgCov = mask[i];
    const sideCov = sideMask[i];
    const bodyCov = Math.max(fgCov, sideCov);
    const shCov = shadowMask[i] * shA * (1 - bodyCov);

    if (bodyCov <= 0.005 && shCov <= 0.005) continue;

    // Extruded side wall color (shade + subtle rim)
    let r = shade[0];
    let g = shade[1];
    let b = shade[2];

    if (fgCov > 0.01) {
      const kd = kdBuf[i];
      const ks = ksBuf[i];
      const krim = krimBuf[i] * rimA;
      // Blend shade -> base -> hi + subsurface (.05)
      const mixBase = Math.min(1, kd * 1.15);
      let fr = shade[0] * (1 - mixBase) + base[0] * mixBase;
      let fg = shade[1] * (1 - mixBase) + base[1] * mixBase;
      let fb = shade[2] * (1 - mixBase) + base[2] * mixBase;

      // Specular & top-left highlight
      const hiMix = Math.min(1, ks + Math.max(0, kd - 0.65) * 0.65);
      fr = fr * (1 - hiMix) + hi[0] * hiMix;
      fg = fg * (1 - hiMix) + hi[1] * hiMix;
      fb = fb * (1 - hiMix) + hi[2] * hiMix;

      // Rim light
      fr = fr * (1 - krim) + rimR * krim;
      fg = fg * (1 - krim) + rimG * krim;
      fb = fb * (1 - krim) + rimB * krim;

      // Floating detail layer (+4% forward)
      const det = detailMask[i];
      if (det > 0.01) {
        const detMix = det * 0.88;
        fr = fr * (1 - detMix) + on[0] * detMix;
        fg = fg * (1 - detMix) + on[1] * detMix;
        fb = fb * (1 - detMix) + on[2] * detMix;
      }

      // Glass 0.5px white inner edge
      if (theme.innerEdge > 0 && innerEdgeBuf[i] > 0.05) {
        const ie = innerEdgeBuf[i] * theme.innerEdge;
        fr = fr * (1 - ie) + 255 * ie;
        fg = fg * (1 - ie) + 255 * ie;
        fb = fb * (1 - ie) + 255 * ie;
      }

      const blend = fgCov / (bodyCov || 1);
      r = r * (1 - blend) + fr * blend;
      g = g * (1 - blend) + fg * blend;
      b = b * (1 - blend) + fb * blend;
    }

    const totalA = Math.min(1, bodyCov + shCov);
    const outR = (r * bodyCov + shR * shCov) / (totalA || 1);
    const outG = (g * bodyCov + shG * shCov) / (totalA || 1);
    const outB = (b * bodyCov + shB * shCov) / (totalA || 1);

    const p = i * 4;
    rgba[p] = Math.max(0, Math.min(255, Math.round(outR)));
    rgba[p + 1] = Math.max(0, Math.min(255, Math.round(outG)));
    rgba[p + 2] = Math.max(0, Math.min(255, Math.round(outB)));
    rgba[p + 3] = Math.max(0, Math.min(255, Math.round(totalA * 255)));
  }

  return encodePNG(size, size, rgba);
}
