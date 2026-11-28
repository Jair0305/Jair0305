// Pure SVG renderers. No dependencies: every function returns an SVG string.
import { readFileSync } from "node:fs";
import { constellations, journey, orbitColor, profile } from "./data.mjs";

const ICONS = new URL("./icons/", import.meta.url);

const SANS = "'Segoe UI', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif";
const MONO = "ui-monospace, 'SF Mono', SFMono-Regular, 'Cascadia Code', Consolas, 'Liberation Mono', monospace";

export const themes = {
  dark: {
    name: "dark",
    bg0: "#05070d",
    bg1: "#0a1122",
    ink: "#f8fafc",
    muted: "#94a3b8",
    faint: "#475569",
    line: "rgba(148,163,184,0.16)",
    panel: "rgba(148,163,184,0.035)",
    accent: "#5eead4",
    accentInk: "#99f6e4",
    chip: "#0c1424",
    star: "#e2e8f0",
    orbit: orbitColor,
  },
  light: {
    name: "light",
    bg0: "#f8fafc",
    bg1: "#e6edf6",
    ink: "#0b1220",
    muted: "#475569",
    faint: "#94a3b8",
    line: "rgba(15,23,42,0.12)",
    panel: "rgba(255,255,255,0.65)",
    accent: "#0d9488",
    accentInk: "#0f766e",
    chip: "#ffffff",
    star: "#64748b",
    orbit: {
      origin: "#0284c7",
      foundations: "#0d9488",
      experimentation: "#0369a1",
      data: "#0891b2",
      security: "#e11d48",
      community: "#b45309",
      nightly: "#4f46e5",
      institutional: "#7c3aed",
      product: "#16a34a",
      future: "#0f172a",
    },
  },
};

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const f = (n) => Math.round(n * 10) / 10;

function rng(seed) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function frame(th, w, h, body, { defs = "", css = "", title = "", bare = false } = {}) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(title)}">
<title>${esc(title)}</title>
<defs>
  <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="${th.bg0}"/><stop offset="1" stop-color="${th.bg1}"/>
  </linearGradient>
  <clipPath id="frame"><rect width="${w}" height="${h}" rx="16"/></clipPath>
  ${defs}
</defs>
<style>
  .sans{font-family:${SANS}} .mono{font-family:${MONO}}
  .tw1{animation:tw 3.2s ease-in-out infinite} .tw2{animation:tw 4.6s ease-in-out 1.1s infinite} .tw3{animation:tw 6s ease-in-out 2.3s infinite}
  @keyframes tw{0%,100%{opacity:.15}50%{opacity:1}}
  ${css}
  @media (prefers-reduced-motion: reduce){*{animation:none!important}}
</style>
<g clip-path="url(#frame)">
  ${bare ? "" : `<rect width="${w}" height="${h}" fill="url(#bg)"/>`}
  ${body}
</g>
${bare ? "" : `<rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" rx="16" fill="none" stroke="${th.line}"/>`}
</svg>
`;
}

function starfield(th, w, h, count, seed) {
  const r = rng(seed);
  let out = "";
  for (let i = 0; i < count; i++) {
    const cls = i % 4 === 0 ? ` class="tw${(i % 3) + 1}"` : "";
    out += `<circle cx="${f(r() * w)}" cy="${f(r() * h)}" r="${f(0.4 + r() * 1.1)}" fill="${th.star}" opacity="${f(0.2 + r() * 0.6)}"${cls}/>`;
  }
  return out;
}

const moonGradient = (id) => `<radialGradient id="${id}" cx="0.36" cy="0.32" r="0.75">
    <stop offset="0" stop-color="#f8fafc"/><stop offset="0.55" stop-color="#cbd5e1"/><stop offset="1" stop-color="#64748b"/>
  </radialGradient>`;

function moon(th, cx, cy, r, id = "moonG") {
  const craters = [
    [-0.32, -0.18, 0.16],
    [0.22, 0.28, 0.12],
    [0.3, -0.35, 0.08],
    [-0.12, 0.42, 0.07],
    [0.05, -0.02, 0.1],
  ];
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#${id})"/>
  ${craters.map(([dx, dy, s]) => `<circle cx="${f(cx + dx * r)}" cy="${f(cy + dy * r)}" r="${f(s * r)}" fill="#94a3b8" opacity="0.35"/>`).join("")}
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#moonShade)"/>`;
}

const moonShade = `<radialGradient id="moonShade" cx="0.3" cy="0.28" r="0.95">
    <stop offset="0.55" stop-color="#020617" stop-opacity="0"/><stop offset="1" stop-color="#020617" stop-opacity="0.55"/>
  </radialGradient>`;

/* ───────────────────────── header ───────────────────────── */

export function renderHeader(th) {
  const W = 1200;
  const H = 360;
  const cx = 945;
  const cy = 180;
  const lineCycle = 4 * profile.now.length;

  const nowLines = profile.now
    .map((line, i) => {
      // Each line owns a 4s window: 1.2s typing wipe, hold, 0.4s wipe out.
      const t0 = i / profile.now.length;
      const t3 = (i + 1) / profile.now.length;
      const keyTimes = [0, t0, t0 + 1.2 / lineCycle, t3 - 0.4 / lineCycle, t3, 1].map((n) => Math.round(n * 1000) / 1000);
      return `<clipPath id="nowClip${i}"><rect x="64" y="236" height="34" width="${i === 0 ? 600 : 0}">
        <animate attributeName="width" values="0;0;600;600;0;0" keyTimes="${keyTimes.join(";")}" dur="${lineCycle}s" begin="-1.5s" repeatCount="indefinite"/>
      </rect></clipPath>
      <text x="${64 + 88}" y="258" class="mono" font-size="16" fill="${th.ink}" clip-path="url(#nowClip${i})" opacity="0.92">${esc(line)}</text>`;
    })
    .join("\n");

  const defs = `${moonGradient("moonG")}${moonShade}
  <radialGradient id="halo"><stop offset="0" stop-color="${th.accent}" stop-opacity="0.32"/><stop offset="1" stop-color="${th.accent}" stop-opacity="0"/></radialGradient>
  <radialGradient id="dotGlow"><stop offset="0" stop-color="${th.accent}" stop-opacity="0.9"/><stop offset="1" stop-color="${th.accent}" stop-opacity="0"/></radialGradient>`;

  const body = `
  ${starfield(th, W, H, 120, 7)}
  <circle cx="${cx}" cy="${cy}" r="170" fill="url(#halo)"/>
  <circle cx="${cx}" cy="${cy}" r="118" fill="none" stroke="${th.accent}" stroke-opacity="0.3"/>
  <circle cx="${cx}" cy="${cy}" r="196" fill="none" stroke="${th.accent}" stroke-opacity="0.2" stroke-dasharray="2 7"/>
  <circle cx="${cx}" cy="${cy}" r="288" fill="none" stroke="${th.orbit.nightly}" stroke-opacity="0.18"/>
  <g>
    <animateTransform attributeName="transform" type="rotate" from="0 ${cx} ${cy}" to="360 ${cx} ${cy}" dur="36s" repeatCount="indefinite"/>
    <g transform="translate(${cx + 196} ${cy}) rotate(90)">
      <rect x="-3" y="-4" width="6" height="8" rx="1.5" fill="${th.ink}"/>
      <rect x="-15" y="-2.5" width="10" height="5" fill="${th.accent}" opacity="0.8"/>
      <rect x="5" y="-2.5" width="10" height="5" fill="${th.accent}" opacity="0.8"/>
    </g>
  </g>
  <g>
    <animateTransform attributeName="transform" type="rotate" from="200 ${cx} ${cy}" to="-160 ${cx} ${cy}" dur="90s" repeatCount="indefinite"/>
    <circle cx="${cx + 288}" cy="${cy}" r="26" fill="url(#dotGlow)" opacity="0.6"/>
    <circle cx="${cx + 288}" cy="${cy}" r="8" fill="${th.accent}"/>
  </g>
  ${moon(th, cx, cy, 70)}

  <text x="64" y="92" class="mono" font-size="13" letter-spacing="3" fill="${th.accentInk}">${esc(profile.eyebrow)}</text>
  <text x="62" y="160" class="sans" font-size="58" font-weight="700" fill="${th.ink}" letter-spacing="-1">${esc(profile.name)}</text>
  ${profile.subtitle.map((l, i) => `<text x="64" y="${196 + i * 24}" class="sans" font-size="19" fill="${th.muted}">${esc(l)}</text>`).join("")}

  <text x="64" y="258" class="mono" font-size="16" fill="${th.accent}">$ now ▸</text>
  ${nowLines}

  <circle cx="70" cy="302" r="4" fill="${th.accent}"/>
  <circle cx="70" cy="302" r="4" fill="none" stroke="${th.accent}">
    <animate attributeName="r" values="4;12" dur="2.4s" repeatCount="indefinite"/>
    <animate attributeName="opacity" values="0.8;0" dur="2.4s" repeatCount="indefinite"/>
  </circle>
  <text x="86" y="307" class="mono" font-size="13" fill="${th.muted}">personal log online  ·  ${esc(profile.location)}  ·  ${esc(profile.portfolio)}</text>`;

  return frame(th, W, H, body, { defs, title: `${profile.name} — ${profile.eyebrow}` });
}

/* ───────────────────────── journey route ───────────────────────── */

function smoothPath(pts) {
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const [p1, p2] = [pts[i], pts[i + 1]];
    const p3 = pts[i + 2] ?? p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${f(c1[0])} ${f(c1[1])} ${f(c2[0])} ${f(c2[1])} ${f(p2[0])} ${f(p2[1])}`;
  }
  return d;
}

function body(th, kind, x, y, c) {
  const shade = `<circle cx="${x}" cy="${y}" r="R" fill="url(#bodyShade)"/>`;
  switch (kind) {
    case "nebula":
      return `<g filter="url(#blur)"><circle cx="${x - 6}" cy="${y - 3}" r="11" fill="${c}" opacity="0.5"/><circle cx="${x + 7}" cy="${y + 4}" r="9" fill="${th.orbit.nightly}" opacity="0.4"/><circle cx="${x}" cy="${y}" r="7" fill="${c}" opacity="0.6"/></g>
      <circle cx="${x}" cy="${y}" r="2.6" fill="${th.ink}" class="tw1"/>`;
    case "planet":
      return `<circle cx="${x}" cy="${y}" r="11" fill="${c}"/>${shade.replace("R", 11)}`;
    case "asteroid":
      return `<path d="M${x - 11} ${y - 2} L${x - 5} ${y - 10} L${x + 6} ${y - 9} L${x + 11} ${y - 1} L${x + 7} ${y + 8} L${x - 4} ${y + 10} Z" fill="${c}" opacity="0.85"/>${shade.replace("R", 11)}
      <circle cx="${x + 3}" cy="${y - 3}" r="2" fill="#020617" opacity="0.25"/>`;
    case "probes":
      return `<ellipse cx="${x}" cy="${y}" rx="19" ry="7" fill="none" stroke="${c}" stroke-opacity="0.6" transform="rotate(-20 ${x} ${y})"/>
      <circle cx="${x}" cy="${y}" r="6" fill="${th.faint}"/>
      <g><animateTransform attributeName="transform" type="rotate" from="0 ${x} ${y}" to="360 ${x} ${y}" dur="7s" repeatCount="indefinite"/><circle cx="${x + 17}" cy="${y}" r="2.6" fill="${c}"/></g>`;
    case "giant":
      return `<circle cx="${x}" cy="${y}" r="15" fill="${c}"/>${shade.replace("R", 15)}
      <ellipse cx="${x}" cy="${y}" rx="27" ry="7" fill="none" stroke="${c}" stroke-width="2" opacity="0.85" transform="rotate(-16 ${x} ${y})"/>`;
    case "radar":
      return `<circle cx="${x}" cy="${y}" r="6" fill="none" stroke="${c}"><animate attributeName="r" values="6;26" dur="3s" repeatCount="indefinite"/><animate attributeName="opacity" values="0.7;0" dur="3s" repeatCount="indefinite"/></circle>
      <path d="M${x - 10} ${y - 4} A11 11 0 0 0 ${x + 6} ${y + 10}" fill="none" stroke="${c}" stroke-width="3" stroke-linecap="round"/>
      <line x1="${x - 2}" y1="${y + 2}" x2="${x + 5}" y2="${y - 6}" stroke="${c}" stroke-width="1.6"/><circle cx="${x + 6}" cy="${y - 7}" r="2" fill="${c}"/>
      <line x1="${x - 3}" y1="${y + 6}" x2="${x - 6}" y2="${y + 13}" stroke="${th.faint}" stroke-width="2"/>`;
    case "station":
      return `<g><animateTransform attributeName="transform" type="rotate" from="0 ${x} ${y}" to="360 ${x} ${y}" dur="24s" repeatCount="indefinite"/>
      ${[0, 90, 180, 270].map((a) => `<g transform="rotate(${a} ${x} ${y})"><line x1="${x}" y1="${y}" x2="${x + 15}" y2="${y}" stroke="${c}" stroke-width="2"/><rect x="${x + 14}" y="${y - 3.5}" width="6" height="7" rx="1" fill="${c}"/></g>`).join("")}</g>
      <circle cx="${x}" cy="${y}" r="7" fill="${th.chip}" stroke="${c}" stroke-width="2"/>`;
    case "comet":
      return `<path d="M${x - 4} ${y - 6} L${x - 38} ${y - 20} L${x - 6} ${y + 5} Z" fill="url(#tail)"/>
      <circle cx="${x}" cy="${y}" r="7" fill="${c}"/><circle cx="${x}" cy="${y}" r="13" fill="${c}" opacity="0.18"/>`;
    case "moon":
      return `<circle cx="${x}" cy="${y}" r="20" fill="${c}" opacity="0.12"/>${moon(th, x, y, 13, "moonG")}`;
    case "megastructure":
      return `${[
        [-12, 22],
        [-3, 32],
        [6, 18],
      ]
        .map(([dx, h]) => `<rect x="${x + dx}" y="${y + 13 - h}" width="7" height="${h}" rx="1" fill="${th.chip}" stroke="${c}" stroke-width="1.4"/>`)
        .join("")}
      ${[
        [-9, 0],
        [0, -12],
        [0, 4],
        [9, 6],
        [0, -4],
      ]
        .map(([dx, dy], i) => `<rect x="${x + dx - 1}" y="${y + dy - 1}" width="2" height="2" fill="${th.accent}" class="tw${(i % 3) + 1}"/>`)
        .join("")}`;
    case "shipyard":
      return `<rect x="${x - 16}" y="${y - 13}" width="32" height="26" rx="2" fill="none" stroke="${c}" stroke-opacity="0.55" stroke-dasharray="3 3"/>
      <path d="M${x - 10} ${y + 6} L${x + 11} ${y} L${x - 10} ${y - 6} L${x - 6} ${y} Z" fill="${c}"/>`;
    case "portal":
      return `<circle cx="${x}" cy="${y}" r="13" fill="none" stroke="${c}" stroke-width="1.6" stroke-dasharray="4 4"><animateTransform attributeName="transform" type="rotate" from="0 ${x} ${y}" to="360 ${x} ${y}" dur="10s" repeatCount="indefinite"/></circle>
      <circle cx="${x}" cy="${y}" r="5" fill="${c}"><animate attributeName="opacity" values="1;0.3;1" dur="2.4s" repeatCount="indefinite"/></circle>`;
    default:
      return `<circle cx="${x}" cy="${y}" r="9" fill="${c}"/>`;
  }
}

export function renderRoute(th) {
  const W = 1200;
  const H = 330;
  const x0 = 78;
  const x1 = 1122;
  const step = (x1 - x0) / (journey.length - 1);
  const pts = journey.map((_, i) => [x0 + i * step, 188 + Math.sin(i * 0.95 + 0.4) * 30]);
  const d = smoothPath(pts);

  const defs = `${moonGradient("moonG")}${moonShade}
  <radialGradient id="bodyShade" cx="0.32" cy="0.3" r="0.9"><stop offset="0.45" stop-color="#020617" stop-opacity="0"/><stop offset="1" stop-color="#020617" stop-opacity="0.55"/></radialGradient>
  <linearGradient id="tail" x1="1" y1="0.6" x2="0" y2="0"><stop offset="0" stop-color="${th.orbit.community}" stop-opacity="0.8"/><stop offset="1" stop-color="${th.orbit.community}" stop-opacity="0"/></linearGradient>
  <filter id="blur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3.5"/></filter>
  <path id="route" d="${d}"/>`;

  const css = `.flow{stroke-dasharray:3 13;animation:flow 2.2s linear infinite}@keyframes flow{to{stroke-dashoffset:-16}}`;

  const stations = journey
    .map((s, i) => {
      const [x, y] = pts[i];
      const c = th.orbit[s.orbit];
      const up = i % 2 === 0;
      const yYear = up ? y - 34 : y + 42;
      const yName = up ? y - 50 : y + 58;
      return `<g>
      ${body(th, s.body, f(x), f(y), c)}
      <text x="${f(x)}" y="${f(yYear)}" text-anchor="middle" class="mono" font-size="11" letter-spacing="1" fill="${c}">${esc(s.year)}</text>
      <text x="${f(x)}" y="${f(yName)}" text-anchor="middle" class="sans" font-size="13" font-weight="600" fill="${th.ink}">${esc(s.name)}</text>
    </g>`;
    })
    .join("\n");

  const body_ = `
  ${starfield(th, W, H, 70, 21)}
  <text x="40" y="46" class="mono" font-size="13" letter-spacing="3" fill="${th.accentInk}">ORBIT LOG</text>
  <text x="152" y="46" class="mono" font-size="13" fill="${th.muted}">2014 → next  ·  every station is a real stage of the route</text>
  <use href="#route" fill="none" stroke="${th.line}" stroke-width="2"/>
  <use href="#route" fill="none" stroke="${th.accent}" stroke-opacity="0.7" stroke-width="2" stroke-linecap="round" class="flow"/>
  ${stations}
  <g>
    <animateMotion dur="34s" repeatCount="indefinite" rotate="auto"><mpath href="#route"/></animateMotion>
    <path d="M-18 0 L-4 -1.5 L-4 1.5 Z" fill="${th.accent}" opacity="0.5"/>
    <path d="M7 0 L-5 -5 L-2 0 L-5 5 Z" fill="${th.ink}"/>
  </g>
  <text x="${W - 40}" y="${H - 26}" text-anchor="end" class="mono" font-size="12" fill="${th.muted}">fly the full route in 3D → ${esc(profile.portfolio)}/explore</text>`;

  return frame(th, W, H, body_, { defs, css, title: "Orbit log: Jair's journey from 2014 to now" });
}

/* ───────────────────────── stack constellations ───────────────────────── */

const iconCache = new Map();
function iconUri(name, tint) {
  const key = `${name}:${tint}`;
  if (!iconCache.has(key)) {
    const raw = readFileSync(new URL(`${name}.svg`, ICONS), "utf8")
      .replace(/<title>[\s\S]*?<\/title>/g, "")
      .replace(/\sfill="[^"]*"/g, "")
      .replace(/<svg\b/, `<svg fill="${tint}"`);
    iconCache.set(key, `data:image/svg+xml;base64,${Buffer.from(raw).toString("base64")}`);
  }
  return iconCache.get(key);
}

export function renderStack(th) {
  const W = 1200;
  const cols = 3;
  const cellW = 388;
  const cellH = 214;
  const gap = 18;
  const H = 2 * cellH + gap;
  const tintIndex = th.name === "dark" ? 0 : 1;
  const r = rng(99);

  const panels = constellations
    .map((con, ci) => {
      const px = (ci % cols) * (cellW + gap);
      const py = Math.floor(ci / cols) * (cellH + gap);
      const c = th.orbit[con.orbit];
      const n = con.stars.length;
      const perRow = Math.ceil(n / 2);
      const span = cellW - 92;
      const sx = perRow > 1 ? span / (perRow - 1) : 0;

      const nodes = con.stars.map((s, i) => {
        const row = i < perRow ? 0 : 1;
        const idx = row === 0 ? i : i - perRow;
        const rowCount = row === 0 ? perRow : n - perRow;
        const offset = row === 1 && rowCount < perRow ? sx / 2 : 0;
        return {
          ...s,
          x: px + 46 + idx * sx + offset + (r() - 0.5) * 10,
          y: py + (row === 0 ? 102 : 166) + (r() - 0.5) * 10,
        };
      });
      // Snake through the nodes so each constellation reads as one connected figure.
      const order = [...nodes.slice(0, perRow), ...nodes.slice(perRow).reverse()];
      const links = order
        .slice(1)
        .map((nd, i) => `<line x1="${f(order[i].x)}" y1="${f(order[i].y)}" x2="${f(nd.x)}" y2="${f(nd.y)}" stroke="${c}" stroke-opacity="0.35" stroke-dasharray="2 4"/>`)
        .join("");

      const stars = nodes
        .map(
          (nd, i) => `<g>
        <circle cx="${f(nd.x)}" cy="${f(nd.y)}" r="21" fill="${th.chip}" stroke="${c}" stroke-opacity="0.45"/>
        <image href="${iconUri(nd.icon, nd.tint[tintIndex])}" x="${f(nd.x - 11)}" y="${f(nd.y - 11)}" width="22" height="22"/>
        <text x="${f(nd.x)}" y="${f(nd.y + 35)}" text-anchor="middle" class="mono" font-size="10.5" fill="${th.muted}">${esc(nd.label)}</text>
        ${i % 3 === 0 ? `<circle cx="${f(nd.x + 15)}" cy="${f(nd.y - 15)}" r="1.6" fill="${c}" class="tw${(i % 3) + 1}"/>` : ""}
      </g>`,
        )
        .join("");

      return `<g>
      <rect x="${px + 0.5}" y="${py + 0.5}" width="${cellW - 1}" height="${cellH - 1}" rx="14" fill="${th.panel}" stroke="${th.line}"/>
      <circle cx="${px + 26}" cy="${py + 30}" r="4" fill="${c}"/>
      <text x="${px + 38}" y="${py + 34}" class="mono" font-size="12" letter-spacing="2.5" fill="${c}">${esc(con.title.toUpperCase())}</text>
      <text x="${px + 22}" y="${py + 56}" class="sans" font-size="13" fill="${th.muted}">${esc(con.note)}</text>
      ${links}${stars}
    </g>`;
    })
    .join("\n");

  // Panels carry their own fill, so the canvas stays transparent and blends into the page.
  return frame(th, W, H, panels, { title: "Tech constellations", bare: true });
}

/* ───────────────────────── telemetry ───────────────────────── */

export function renderTelemetry(th, t) {
  const W = 1200;
  const H = 300;
  const cx = 200;
  const cy = 152;
  const r0 = 50;
  const maxLen = 74;
  const weeks = t.weeks;
  const maxWeek = Math.max(1, ...weeks.map((w) => w.count));
  const stepA = (Math.PI * 2) / weeks.length;

  const bars = weeks
    .map((w, i) => {
      const a = -Math.PI / 2 + i * stepA;
      const norm = Math.sqrt(w.count / maxWeek);
      const len = w.count ? 6 + norm * maxLen : 0;
      const [cos, sin] = [Math.cos(a), Math.sin(a)];
      if (!len) return `<circle cx="${f(cx + cos * (r0 + 4))}" cy="${f(cy + sin * (r0 + 4))}" r="1.3" fill="${th.faint}" opacity="0.6"/>`;
      return `<line x1="${f(cx + cos * (r0 + 4))}" y1="${f(cy + sin * (r0 + 4))}" x2="${f(cx + cos * (r0 + 4 + len))}" y2="${f(cy + sin * (r0 + 4 + len))}" stroke="${th.accent}" stroke-opacity="${f(0.35 + norm * 0.65)}" stroke-width="4" stroke-linecap="round"/>`;
    })
    .join("");

  const months = weeks
    .map((w, i) => ({ i, m: new Date(`${w.start}T00:00:00Z`).getUTCMonth() }))
    .filter((w, k, arr) => k === 0 || w.m !== arr[k - 1].m)
    .slice(1)
    .map(({ i, m }) => {
      const a = -Math.PI / 2 + i * stepA;
      return `<text x="${f(cx + Math.cos(a) * 142)}" y="${f(cy + Math.sin(a) * 142 + 4)}" text-anchor="middle" class="mono" font-size="10" fill="${th.faint}">${"JFMAMJJASOND"[m]}</text>`;
    })
    .join("");

  const fmt = (n) => n.toLocaleString("en-US");
  const stats = [
    ["contributions", fmt(t.total), "last 12 months"],
    ["active days", fmt(t.activeDays), "with commits"],
    ["longest streak", `${t.longestStreak}d`, "in a row"],
    ["pull requests", fmt(t.pullRequests), "last 12 months"],
    ["public repos", fmt(t.publicRepos), "owned"],
    ["in orbit since", String(t.since), "on GitHub"],
  ]
    .map(([label, value, hint], i) => {
      const x = 440 + (i % 2) * 190;
      const y = 108 + Math.floor(i / 2) * 64;
      return `<text x="${x}" y="${y - 30}" class="mono" font-size="10.5" letter-spacing="1.5" fill="${th.muted}">${esc(label.toUpperCase())}</text>
      <text x="${x}" y="${y}" class="sans" font-size="28" font-weight="700" fill="${th.ink}">${esc(value)}</text>
      <text x="${x + 6 + value.length * 16}" y="${y}" class="mono" font-size="10" fill="${th.faint}">${esc(hint)}</text>`;
    })
    .join("");

  const langX = 830;
  const langW = 330;
  let acc = 0;
  const segs = t.languages
    .map((l) => {
      const w = (l.share / 100) * langW;
      const seg = `<rect x="${f(langX + acc)}" y="68" width="${f(Math.max(w - 2, 1))}" height="10" fill="${l.color}"/>`;
      acc += w;
      return seg;
    })
    .join("");
  const legend = t.languages
    .map(
      (l, i) => `<circle cx="${langX + 5}" cy="${106 + i * 27}" r="5" fill="${l.color}"/>
      <text x="${langX + 20}" y="${110 + i * 27}" class="sans" font-size="14" fill="${th.ink}">${esc(l.name)}</text>
      <text x="${langX + langW}" y="${110 + i * 27}" text-anchor="end" class="mono" font-size="12" fill="${th.muted}">${l.share.toFixed(1)}%</text>`,
    )
    .join("");

  const defs = `${moonGradient("moonG")}${moonShade}
  <clipPath id="langBar"><rect x="${langX}" y="68" width="${langW}" height="10" rx="5"/></clipPath>`;

  const body_ = `
  ${starfield(th, W, H, 50, 5)}
  <circle cx="${cx}" cy="${cy}" r="${r0 + 4 + maxLen + 2}" fill="none" stroke="${th.line}"/>
  <g>
    <animateTransform attributeName="transform" type="rotate" from="0 ${cx} ${cy}" to="360 ${cx} ${cy}" dur="12s" repeatCount="indefinite"/>
    <line x1="${cx}" y1="${cy - r0}" x2="${cx}" y2="${cy - r0 - maxLen - 6}" stroke="${th.accent}" stroke-opacity="0.35" stroke-width="1.5"/>
  </g>
  ${bars}${months}
  ${moon(th, cx, cy, 42)}
  <text x="${cx}" y="${cy + 6}" text-anchor="middle" class="sans" font-size="22" font-weight="700" fill="#0f172a">${fmt(t.total)}</text>
  <text x="${cx}" y="${cy + 20}" text-anchor="middle" class="mono" font-size="8.5" fill="#334155">contribs</text>

  <line x1="410" y1="36" x2="410" y2="${H - 36}" stroke="${th.line}"/>
  <text x="440" y="48" class="mono" font-size="13" letter-spacing="3" fill="${th.accentInk}">TELEMETRY</text>
  ${stats}

  <line x1="800" y1="36" x2="800" y2="${H - 36}" stroke="${th.line}"/>
  <text x="${langX}" y="48" class="mono" font-size="13" letter-spacing="3" fill="${th.accentInk}">LANGUAGE SPECTRUM</text>
  <g clip-path="url(#langBar)"><rect x="${langX}" y="68" width="${langW}" height="10" fill="${th.line}"/>${segs}</g>
  ${legend}
  <text x="${W - 40}" y="${H - 18}" text-anchor="end" class="mono" font-size="10" fill="${th.faint}">synced ${esc(t.syncedAt)} · github graphql</text>`;

  return frame(th, W, H, body_, { defs, title: `GitHub telemetry: ${t.total} contributions in the last 12 months` });
}
