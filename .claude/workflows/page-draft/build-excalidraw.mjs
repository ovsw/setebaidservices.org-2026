// Builds flow.excalidraw from flow-data.mjs: boxes on a grid, each
// arrow a straight two-point line bound to its boxes, so moving a box drags
// its arrows. Run: node .claude/workflows/page-draft/build-excalidraw.mjs
import { writeFileSync } from "node:fs";

const dir = new URL(".", import.meta.url).pathname.replace(/\/$/, "");
const FONT = 5; // Excalifont

import { nodes as rawNodes, phases, edges } from "./flow-data.mjs";

// ---- geometry --------------------------------------------------------------
function size(node) {
  const { id, cx, y, kind, text, ...o } = node;
  const w = o.w ?? (kind === "diamond" ? 300 : kind === "pill" ? 280 : 320);
  const fontSize = 16;
  const perLine = Math.floor((kind === "diamond" ? w * 0.55 : w - 28) / (fontSize * 0.5));
  const lines = wrap(text, perLine);
  const textH = lines.length * fontSize * 1.25;
  const h = kind === "diamond" ? Math.max(150, textH + 80) : kind === "pill" ? 52 : textH + 28;
  return { id, kind, x: cx - w / 2, y, w, h, cx, cy: y + h / 2, text, lines, fontSize, ...o };
}
function wrap(text, perLine) {
  const out = [];
  for (const para of text.split("\n")) {
    let line = "";
    for (const word of para.split(" ")) {
      if ((line + " " + word).trim().length > perLine && line) {
        out.push(line);
        line = word;
      } else line = (line + " " + word).trim();
    }
    out.push(line);
  }
  return out;
}
function border(node, tx, ty) {
  const dx = tx - node.cx, dy = ty - node.cy;
  const hw = node.w / 2, hh = node.h / 2;
  let t;
  if (node.kind === "diamond") t = 1 / (Math.abs(dx) / hw + Math.abs(dy) / hh);
  else t = Math.min(hw / Math.abs(dx || 1e-9), hh / Math.abs(dy || 1e-9));
  return [node.cx + dx * t, node.cy + dy * t];
}

// ---- excalidraw elements ---------------------------------------------------
let seedCounter = 1;
const base = (type, x, y, w, h, o = {}) => ({
  id: o.id, type, x, y, width: w, height: h, angle: 0,
  strokeColor: o.stroke ?? "#1e1e1e", backgroundColor: o.fill ?? "#ffffff",
  fillStyle: "solid", strokeWidth: o.strokeWidth ?? 1, strokeStyle: o.strokeStyle ?? "solid",
  roughness: 1, opacity: 100, groupIds: [], frameId: null, roundness: o.roundness ?? null,
  seed: seedCounter++, version: 1, versionNonce: seedCounter++, isDeleted: false,
  boundElements: [], updated: 1, link: null, locked: false,
});
const textEl = (id, x, y, w, h, text, o = {}) => ({
  ...base("text", x, y, w, h, { id, stroke: o.color ?? "#1e1e1e", fill: "transparent" }),
  text, originalText: o.original ?? text, fontSize: o.fontSize ?? 16, fontFamily: FONT,
  textAlign: o.align ?? "center", verticalAlign: o.valign ?? "middle",
  containerId: o.containerId ?? null, autoResize: true, lineHeight: 1.25,
});

const elements = [];
const shapeById = {};

for (const [id, label, x1, y1, x2, y2, fill, stroke] of phases) {
  const rect = base("rectangle", x1, y1, x2 - x1, y2 - y1, { id, fill, stroke });
  const lab = textEl(`${id}-label`, x1 + 16, y1 + 8, label.length * 11, 25, label, { fontSize: 20, color: stroke, align: "left" });
  elements.push(rect, lab);
  shapeById[id] = { id, kind: "box", x: x1, y: y1, w: x2 - x1, h: y2 - y1, cx: (x1 + x2) / 2, cy: (y1 + y2) / 2 };
}

const nodes = rawNodes.map(size);
for (const node of nodes) {
  const type = node.kind === "diamond" ? "diamond" : "rectangle";
  const shape = base(type, node.x, node.y, node.w, node.h, {
    id: node.id, fill: node.fill ?? "#ffffff", stroke: node.stroke ?? "#1e1e1e",
    roundness: node.kind === "pill" ? { type: 3 } : node.kind === "box" ? { type: 3 } : null,
  });
  const text = node.lines.join("\n");
  const tw = Math.min(node.w - 20, Math.max(...node.lines.map((l) => l.length)) * node.fontSize * 0.5 + 10);
  const th = node.lines.length * node.fontSize * 1.25;
  const t = textEl(`${node.id}-text`, node.cx - tw / 2, node.cy - th / 2, tw, th, text, {
    containerId: node.id, color: node.color, original: node.text, fontSize: node.fontSize,
  });
  shape.boundElements.push({ id: t.id, type: "text" });
  elements.push(shape, t);
  shapeById[node.id] = node;
  node.el = shape;
}

for (const edge of edges) {
  const a = shapeById[edge.from], b = shapeById[edge.to];
  const [sx, sy] = border(a, b.cx, b.cy);
  const [ex, ey] = border(b, a.cx, a.cy);
  const id = edge.id ?? `arrow-${edge.from}-${edge.to}`;
  const arrow = {
    ...base("arrow", sx, sy, Math.abs(ex - sx), Math.abs(ey - sy), {
      id, fill: "transparent", strokeStyle: edge.dashed ? "dashed" : "solid", strokeWidth: edge.dashed ? 1 : 2,
    }),
    points: [[0, 0], [ex - sx, ey - sy]],
    lastCommittedPoint: null,
    startBinding: { elementId: a.id, focus: 0, gap: 4 },
    endBinding: { elementId: b.id, focus: 0, gap: 4 },
    startArrowhead: null, endArrowhead: "arrow", elbowed: false,
  };
  elements.push(arrow);
  for (const s of [a, b]) {
    const el = elements.find((x) => x.id === s.id);
    el.boundElements.push({ id, type: "arrow" });
  }
  if (edge.label) {
    const mx = (sx + ex) / 2, my = (sy + ey) / 2;
    const w = edge.label.length * 8 + 8;
    elements.push(textEl(`${id}-label`, mx - w / 2 + 12, my - 22, w, 20, edge.label, { fontSize: 14, color: "#495057" }));
  }
}

const file = { type: "excalidraw", version: 2, source: "page-draft/build-excalidraw.mjs", elements, appState: { viewBackgroundColor: "#ffffff", gridSize: 20 }, files: {} };
writeFileSync(`${dir}/flow.excalidraw`, JSON.stringify(file, null, 1));
console.log(`wrote flow.excalidraw: ${nodes.length} boxes, ${edges.length} arrows, ${phases.length} phase frames`);
