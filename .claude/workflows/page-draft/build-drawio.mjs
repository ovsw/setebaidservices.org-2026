// Builds flow.drawio from flow-data.mjs. draw.io routes the arrows itself
// (orthogonal edges from source to target), so only the boxes have positions.
// Run: node .claude/workflows/page-draft/build-drawio.mjs
//
// flow.drawio is edited by hand once it exists. This script never overwrites
// it. To start over, delete the file first, on purpose.
import { existsSync, writeFileSync } from "node:fs";
import { nodes, phases, edges } from "./flow-data.mjs";

const dir = new URL(".", import.meta.url).pathname.replace(/\/$/, "");
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
// draw.io stores HTML inside the XML attribute, so the tags are escaped as well.
const html = (text) => esc(esc(text).split("\n").map((l, i) => (i === 0 ? `<b>${l}</b>` : l)).join("<br>"));

const cells = ['<mxCell id="0"/>', '<mxCell id="1" parent="0"/>'];

for (const [id, label, x1, y1, x2, y2, fill, stroke] of phases) {
  cells.push(
    `<mxCell id="${id}" value="${esc(label)}" style="rounded=0;whiteSpace=wrap;html=1;fillColor=${fill};strokeColor=${stroke};fontColor=${stroke};fontSize=16;fontStyle=1;verticalAlign=top;align=left;spacingLeft=10;spacingTop=4;container=0;" vertex="1" parent="1"><mxGeometry x="${x1}" y="${y1}" width="${x2 - x1}" height="${y2 - y1}" as="geometry"/></mxCell>`,
  );
}

for (const node of nodes) {
  const w = node.w ?? (node.kind === "diamond" ? 300 : node.kind === "pill" ? 280 : 320);
  const lines = node.text.length / (node.kind === "diamond" ? 22 : 38) + node.text.split("\n").length;
  const h = node.kind === "diamond" ? Math.max(150, lines * 18 + 60) : node.kind === "pill" ? 52 : Math.max(60, lines * 18 + 20);
  const fill = node.fill ?? "#ffffff";
  const stroke = node.stroke ?? "#1e1e1e";
  const color = node.color ?? "#1e1e1e";
  const shape = node.kind === "diamond" ? "rhombus;" : node.kind === "pill" ? "rounded=1;arcSize=50;" : "rounded=1;arcSize=12;";
  const value = node.kind === "pill" || node.kind === "diamond" ? esc(node.text) : html(node.text);
  cells.push(
    `<mxCell id="${node.id}" value="${value}" style="${shape}whiteSpace=wrap;html=1;fillColor=${fill};strokeColor=${stroke};fontColor=${color};fontSize=13;" vertex="1" parent="1"><mxGeometry x="${node.cx - w / 2}" y="${node.y}" width="${w}" height="${h}" as="geometry"/></mxCell>`,
  );
}

for (const edge of edges) {
  const id = `arrow-${edge.from}-${edge.to}`;
  const dashed = edge.dashed ? "dashed=1;" : "";
  cells.push(
    `<mxCell id="${id}" value="${esc(edge.label)}" style="edgeStyle=orthogonalEdgeStyle;rounded=1;orthogonalLoop=1;jettySize=auto;html=1;endArrow=block;endFill=1;strokeWidth=${edge.dashed ? 1 : 2};${dashed}fontSize=12;fontColor=#495057;" edge="1" parent="1" source="${edge.from}" target="${edge.to}"><mxGeometry relative="1" as="geometry"/></mxCell>`,
  );
}

const xml = `<mxfile host="page-draft/build-drawio.mjs" modified="2026-09-05T00:00:00.000Z" version="24.0.0">
  <diagram id="page-draft" name="page-draft">
    <mxGraphModel dx="0" dy="0" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="0" pageScale="1" math="0" shadow="0">
      <root>
        ${cells.join("\n        ")}
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>
`;
if (existsSync(`${dir}/flow.drawio`)) {
  console.error("flow.drawio already exists and is edited by hand. Not overwriting it. Delete it first if you really want a fresh one.");
  process.exit(1);
}
writeFileSync(`${dir}/flow.drawio`, xml);
console.log(`wrote flow.drawio: ${nodes.length} boxes, ${edges.length} arrows, ${phases.length} phase frames`);
