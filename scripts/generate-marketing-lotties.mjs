/**
 * Generates compact brand-aligned Lottie JSON for marketing sections.
 * Run: node scripts/generate-marketing-lotties.mjs
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, "../public/lottie");

const BRAND = {
  sea: [11 / 255, 143 / 255, 216 / 255],
  sky: [14 / 255, 165 / 255, 233 / 255],
  navy: [11 / 255, 30 / 255, 72 / 255],
  mint: [74 / 255, 222 / 255, 128 / 255],
};

function rgba([r, g, b], a = 1) {
  return [r, g, b, a];
}

function base(name, w, h, op, layers) {
  return {
    v: "5.7.4",
    fr: 60,
    ip: 0,
    op,
    w,
    h,
    nm: name,
    ddd: 0,
    assets: [],
    layers,
  };
}

function rectLayer({
  ind,
  name,
  x,
  y,
  w,
  h,
  color,
  radius = 0,
  scaleYKeyframes,
  opacityKeyframes,
  delay = 0,
  duration = 90,
}) {
  const op = delay + duration;
  return {
    ddd: 0,
    ind,
    ty: 4,
    nm: name,
    sr: 1,
    ks: {
      o: opacityKeyframes
        ? { a: 1, k: opacityKeyframes }
        : { a: 0, k: 100 },
      r: { a: 0, k: 0 },
      p: { a: 0, k: [x, y, 0] },
      a: { a: 0, k: [0, h / 2, 0] },
      s: scaleYKeyframes
        ? {
            a: 1,
            k: scaleYKeyframes.map(({ t, s }) => ({
              t,
              s: [100, s, 100],
              i: { x: [0.42], y: [1] },
              o: { x: [0.58], y: [0] },
            })),
          }
        : { a: 0, k: [100, 100, 100] },
    },
    ao: 0,
    ip: delay,
    op,
    st: delay,
    bm: 0,
    shapes: [
      {
        ty: "gr",
        it: [
          {
            ty: "rc",
            d: 1,
            s: { a: 0, k: [w, h] },
            p: { a: 0, k: [0, 0] },
            r: { a: 0, k: radius },
            nm: "Rect",
          },
          {
            ty: "fl",
            c: { a: 0, k: rgba(color) },
            o: { a: 0, k: 100 },
            r: 1,
            nm: "Fill",
          },
          {
            ty: "tr",
            p: { a: 0, k: [0, 0] },
            a: { a: 0, k: [0, 0] },
            s: { a: 0, k: [100, 100] },
            r: { a: 0, k: 0 },
            o: { a: 0, k: 100 },
            nm: "Transform",
          },
        ],
        nm: name,
        np: 2,
        cix: 2,
        bm: 0,
      },
    ],
  };
}

function ellipseLayer({ ind, name, x, y, size, color, scaleKeyframes, delay = 0, duration = 120 }) {
  return {
    ddd: 0,
    ind,
    ty: 4,
    nm: name,
    sr: 1,
    ks: {
      o: { a: 0, k: 100 },
      r: { a: 0, k: 0 },
      p: { a: 0, k: [x, y, 0] },
      a: { a: 0, k: [0, 0, 0] },
      s: scaleKeyframes
        ? {
            a: 1,
            k: scaleKeyframes.map(({ t, s }) => ({
              t,
              s: [s, s, 100],
              i: { x: [0.42], y: [1] },
              o: { x: [0.58], y: [0] },
            })),
          }
        : { a: 0, k: [100, 100, 100] },
    },
    ao: 0,
    ip: delay,
    op: delay + duration,
    st: delay,
    bm: 0,
    shapes: [
      {
        ty: "gr",
        it: [
          {
            d: 1,
            ty: "el",
            s: { a: 0, k: [size, size] },
            p: { a: 0, k: [0, 0] },
            nm: "Ellipse",
          },
          {
            ty: "fl",
            c: { a: 0, k: rgba(color) },
            o: { a: 0, k: 100 },
            r: 1,
            nm: "Fill",
          },
          {
            ty: "tr",
            p: { a: 0, k: [0, 0] },
            a: { a: 0, k: [0, 0] },
            s: { a: 0, k: [100, 100] },
            r: { a: 0, k: 0 },
            o: { a: 0, k: 100 },
            nm: "Transform",
          },
        ],
        nm: name,
        np: 2,
        cix: 2,
        bm: 0,
      },
    ],
  };
}

function strokeCircleLayer({ ind, name, x, y, size, color, trimKeyframes, width = 3 }) {
  return {
    ddd: 0,
    ind,
    ty: 4,
    nm: name,
    sr: 1,
    ks: {
      o: { a: 0, k: 100 },
      r: { a: 0, k: 0 },
      p: { a: 0, k: [x, y, 0] },
      a: { a: 0, k: [0, 0, 0] },
      s: { a: 0, k: [100, 100, 100] },
    },
    ao: 0,
    ip: 0,
    op: 150,
    st: 0,
    bm: 0,
    shapes: [
      {
        ty: "gr",
        it: [
          {
            d: 1,
            ty: "el",
            s: { a: 0, k: [size, size] },
            p: { a: 0, k: [0, 0] },
            nm: "Ellipse",
          },
          {
            ty: "st",
            c: { a: 0, k: rgba(color) },
            o: { a: 0, k: 100 },
            w: { a: 0, k: width },
            lc: 2,
            lj: 2,
            nm: "Stroke",
          },
          {
            ty: "tr",
            p: { a: 0, k: [0, 0] },
            a: { a: 0, k: [0, 0] },
            s: { a: 0, k: [100, 100] },
            r: { a: 0, k: 0 },
            o: { a: 0, k: 100 },
            nm: "Transform",
          },
        ],
        nm: name,
        np: 2,
        cix: 2,
        bm: 0,
      },
      {
        ty: "tm",
        s: { a: 0, k: 0 },
        e: {
          a: 1,
          k: trimKeyframes.map(({ t, s }) => ({
            t,
            s: [s],
            i: { x: [0.42], y: [1] },
            o: { x: [0.58], y: [0] },
          })),
        },
        o: { a: 0, k: 0 },
        m: 1,
        nm: "Trim",
      },
    ],
  };
}

function checkLayer({ ind, x, y, color, delay = 30 }) {
  return {
    ddd: 0,
    ind,
    ty: 4,
    nm: "Check",
    sr: 1,
    ks: {
      o: { a: 0, k: 100 },
      r: { a: 0, k: 0 },
      p: { a: 0, k: [x, y, 0] },
      a: { a: 0, k: [0, 0, 0] },
      s: { a: 0, k: [100, 100, 100] },
    },
    ao: 0,
    ip: delay,
    op: 150,
    st: delay,
    bm: 0,
    shapes: [
      {
        ty: "gr",
        it: [
          {
            ind: 0,
            ty: "sh",
            ks: {
              a: 0,
              k: {
                i: [[0, 0], [0, 0], [0, 0]],
                o: [[0, 0], [0, 0], [0, 0]],
                v: [[-18, 2], [-6, 14], [20, -12]],
                c: false,
              },
            },
            nm: "Path",
          },
          {
            ty: "st",
            c: { a: 0, k: rgba(color) },
            o: { a: 0, k: 100 },
            w: { a: 0, k: 4 },
            lc: 2,
            lj: 2,
            nm: "Stroke",
          },
          {
            ty: "tr",
            p: { a: 0, k: [0, 0] },
            a: { a: 0, k: [0, 0] },
            s: { a: 0, k: [100, 100] },
            r: { a: 0, k: 0 },
            o: { a: 0, k: 100 },
            nm: "Transform",
          },
        ],
        nm: "Check",
        np: 2,
        cix: 2,
        bm: 0,
      },
      {
        ty: "tm",
        s: { a: 0, k: 0 },
        e: {
          a: 1,
          k: [
            { t: delay, s: [0], i: { x: [0.42], y: [1] }, o: { x: [0.58], y: [0] } },
            { t: delay + 45, s: [100], i: { x: [0.42], y: [1] }, o: { x: [0.58], y: [0] } },
          ],
        },
        o: { a: 0, k: 0 },
        m: 1,
        nm: "Trim",
      },
    ],
  };
}

const compareBars = base("Compare Bars", 240, 180, 150, [
  rectLayer({
    ind: 1,
    name: "Bar 1",
    x: 52,
    y: 140,
    w: 36,
    h: 80,
    color: BRAND.sea,
    radius: 8,
    delay: 0,
    scaleYKeyframes: [
      { t: 0, s: 8 },
      { t: 50, s: 55 },
      { t: 120, s: 55 },
      { t: 150, s: 8 },
    ],
  }),
  rectLayer({
    ind: 2,
    name: "Bar 2",
    x: 102,
    y: 140,
    w: 36,
    h: 100,
    color: BRAND.sky,
    radius: 8,
    delay: 8,
    scaleYKeyframes: [
      { t: 8, s: 8 },
      { t: 58, s: 78 },
      { t: 120, s: 78 },
      { t: 150, s: 8 },
    ],
  }),
  rectLayer({
    ind: 3,
    name: "Bar 3",
    x: 152,
    y: 140,
    w: 36,
    h: 70,
    color: BRAND.navy,
    radius: 8,
    delay: 16,
    scaleYKeyframes: [
      { t: 16, s: 8 },
      { t: 66, s: 48 },
      { t: 120, s: 48 },
      { t: 150, s: 8 },
    ],
  }),
  ellipseLayer({
    ind: 4,
    name: "Glow",
    x: 120,
    y: 150,
    size: 160,
    color: BRAND.sky,
    scaleKeyframes: [
      { t: 0, s: 60 },
      { t: 75, s: 100 },
      { t: 150, s: 60 },
    ],
    opacityKeyframes: [
      { t: 0, s: [8] },
      { t: 75, s: [18] },
      { t: 150, s: [8] },
    ],
  }),
]);

const loanApproved = base("Loan Approved", 200, 200, 150, [
  ellipseLayer({
    ind: 1,
    name: "Glow",
    x: 100,
    y: 100,
    size: 140,
    color: BRAND.sky,
    scaleKeyframes: [
      { t: 0, s: 70 },
      { t: 75, s: 105 },
      { t: 150, s: 70 },
    ],
    opacityKeyframes: [
      { t: 0, s: [12] },
      { t: 75, s: [28] },
      { t: 150, s: [12] },
    ],
  }),
  strokeCircleLayer({
    ind: 2,
    name: "Ring",
    x: 100,
    y: 100,
    size: 96,
    color: BRAND.sea,
    width: 4,
    trimKeyframes: [
      { t: 0, s: 0 },
      { t: 40, s: 100 },
      { t: 150, s: 100 },
    ],
  }),
  checkLayer({ ind: 3, x: 100, y: 104, color: BRAND.mint, delay: 35 }),
]);

const globeOrbit = base("Globe Orbit", 200, 200, 180, [
  strokeCircleLayer({
    ind: 1,
    name: "Orbit",
    x: 100,
    y: 100,
    size: 120,
    color: BRAND.sea,
    width: 2,
    trimKeyframes: [
      { t: 0, s: 0 },
      { t: 60, s: 100 },
      { t: 180, s: 100 },
    ],
  }),
  strokeCircleLayer({
    ind: 2,
    name: "Core",
    x: 100,
    y: 100,
    size: 64,
    color: BRAND.navy,
    width: 3,
    trimKeyframes: [
      { t: 0, s: 0 },
      { t: 30, s: 100 },
      { t: 180, s: 100 },
    ],
  }),
  {
    ddd: 0,
    ind: 3,
    ty: 4,
    nm: "Satellite",
    sr: 1,
    ks: {
      o: { a: 0, k: 100 },
      r: {
        a: 1,
        k: [
          { t: 0, s: [0], i: { x: [0.42], y: [1] }, o: { x: [0.58], y: [0] } },
          { t: 180, s: [360], i: { x: [0.42], y: [1] }, o: { x: [0.58], y: [0] } },
        ],
      },
      p: { a: 0, k: [100, 100, 0] },
      a: { a: 0, k: [0, 0, 0] },
      s: { a: 0, k: [100, 100, 100] },
    },
    ao: 0,
    ip: 0,
    op: 180,
    st: 0,
    bm: 0,
    shapes: [
      {
        ty: "gr",
        it: [
          {
            d: 1,
            ty: "el",
            s: { a: 0, k: [14, 14] },
            p: { a: 0, k: [58, 0] },
            nm: "Dot",
          },
          {
            ty: "fl",
            c: { a: 0, k: rgba(BRAND.sky) },
            o: { a: 0, k: 100 },
            r: 1,
            nm: "Fill",
          },
          {
            ty: "tr",
            p: { a: 0, k: [0, 0] },
            a: { a: 0, k: [0, 0] },
            s: { a: 0, k: [100, 100] },
            r: { a: 0, k: 0 },
            o: { a: 0, k: 100 },
            nm: "Transform",
          },
        ],
        nm: "Satellite",
        np: 2,
        cix: 2,
        bm: 0,
      },
    ],
  },
]);

const searchEmpty = base("Search Empty", 200, 200, 150, [
  ellipseLayer({
    ind: 1,
    name: "Glow",
    x: 88,
    y: 88,
    size: 110,
    color: BRAND.sky,
    scaleKeyframes: [
      { t: 0, s: 80 },
      { t: 75, s: 100 },
      { t: 150, s: 80 },
    ],
    opacityKeyframes: [
      { t: 0, s: [10] },
      { t: 75, s: [22] },
      { t: 150, s: [10] },
    ],
  }),
  strokeCircleLayer({
    ind: 2,
    name: "Lens",
    x: 88,
    y: 88,
    size: 72,
    color: BRAND.sea,
    width: 5,
    trimKeyframes: [
      { t: 0, s: 0 },
      { t: 45, s: 100 },
      { t: 150, s: 100 },
    ],
  }),
  {
    ddd: 0,
    ind: 3,
    ty: 4,
    nm: "Handle",
    sr: 1,
    ks: {
      o: { a: 0, k: 100 },
      r: { a: 0, k: 45 },
      p: { a: 0, k: [88, 88, 0] },
      a: { a: 0, k: [0, 0, 0] },
      s: { a: 0, k: [100, 100, 100] },
    },
    ao: 0,
    ip: 20,
    op: 150,
    st: 20,
    bm: 0,
    shapes: [
      {
        ty: "gr",
        it: [
          {
            ind: 0,
            ty: "sh",
            ks: {
              a: 0,
              k: {
                i: [[0, 0], [0, 0]],
                o: [[0, 0], [0, 0]],
                v: [[28, 28], [48, 48]],
                c: false,
              },
            },
            nm: "Path",
          },
          {
            ty: "st",
            c: { a: 0, k: rgba(BRAND.navy) },
            o: { a: 0, k: 100 },
            w: { a: 0, k: 5 },
            lc: 2,
            lj: 2,
            nm: "Stroke",
          },
          {
            ty: "tr",
            p: { a: 0, k: [0, 0] },
            a: { a: 0, k: [0, 0] },
            s: { a: 0, k: [100, 100] },
            r: { a: 0, k: 0 },
            o: { a: 0, k: 100 },
            nm: "Transform",
          },
        ],
        nm: "Handle",
        np: 2,
        cix: 2,
        bm: 0,
      },
      {
        ty: "tm",
        s: { a: 0, k: 0 },
        e: {
          a: 1,
          k: [
            { t: 20, s: [0], i: { x: [0.42], y: [1] }, o: { x: [0.58], y: [0] } },
            { t: 50, s: [100], i: { x: [0.42], y: [1] }, o: { x: [0.58], y: [0] } },
          ],
        },
        o: { a: 0, k: 0 },
        m: 1,
        nm: "Trim",
      },
    ],
  },
]);

const livePulse = base("Live Pulse", 120, 120, 120, [
  ellipseLayer({
    ind: 1,
    name: "Ring Outer",
    x: 60,
    y: 60,
    size: 48,
    color: BRAND.mint,
    scaleKeyframes: [
      { t: 0, s: 80 },
      { t: 60, s: 140 },
      { t: 120, s: 80 },
    ],
    opacityKeyframes: [
      { t: 0, s: [40] },
      { t: 60, s: [0] },
      { t: 120, s: [40] },
    ],
  }),
  ellipseLayer({
    ind: 2,
    name: "Ring Inner",
    x: 60,
    y: 60,
    size: 32,
    color: BRAND.mint,
    scaleKeyframes: [
      { t: 0, s: 90 },
      { t: 60, s: 120 },
      { t: 120, s: 90 },
    ],
    opacityKeyframes: [
      { t: 0, s: [60] },
      { t: 60, s: [10] },
      { t: 120, s: [60] },
    ],
  }),
  ellipseLayer({
    ind: 3,
    name: "Dot",
    x: 60,
    y: 60,
    size: 16,
    color: BRAND.mint,
    scaleKeyframes: [
      { t: 0, s: 100 },
      { t: 60, s: 100 },
      { t: 120, s: 100 },
    ],
  }),
]);

mkdirSync(outDir, { recursive: true });

const files = {
  "compare-bars.json": compareBars,
  "loan-approved.json": loanApproved,
  "globe-orbit.json": globeOrbit,
  "search-empty.json": searchEmpty,
  "live-pulse.json": livePulse,
};

for (const [name, data] of Object.entries(files)) {
  writeFileSync(join(outDir, name), JSON.stringify(data));
}
