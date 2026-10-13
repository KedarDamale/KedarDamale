import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { theme as t, escapeXml, text, svg } from './profile-theme.mjs';

// Editorial profile content: change only when the user requests a profile edit.
const output = fileURLToPath(new URL('../assets/profile/', import.meta.url));
const devicons = JSON.parse(await readFile(new URL('./vendor/devicon.json', import.meta.url), 'utf8'));
const line = (x1, y1, x2, y2, color = t.border) => `<path d="M${x1} ${y1}L${x2} ${y2}" stroke="${color}"/>`;
const panel = (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="${t.panel}" stroke="${t.border}"/>`;
const label = (x, y, value) => text(x, y, value, { size: 13, mono: true, fill: t.mint });
await mkdir(output, { recursive: true });
async function save(name, width, height, title, description, content) {
  await writeFile(`${output}/${name}.svg`, svg(width, height, title, description, content));
}

const orbit = `<g transform="translate(790 166)" fill="none">
  <circle r="99" stroke="${t.border}"/><circle r="66" stroke="${t.border}" stroke-dasharray="4 8"/>
  <path d="M-88 -44L-42 51L30 4L76 -62M-42 51L70 64M30 4L-5 -84" stroke="${t.mint}" stroke-width="2" opacity=".65"/>
  <circle cx="-88" cy="-44" r="7" fill="${t.mint}"/><circle cx="-42" cy="51" r="8" fill="${t.mint}"/>
  <circle cx="30" cy="4" r="12" fill="${t.mint}"/><circle cx="76" cy="-62" r="7" fill="${t.violet}"/>
  <circle cx="70" cy="64" r="6" fill="${t.violet}"/><circle cx="-5" cy="-84" r="6" fill="${t.amber}"/>
</g>`;
await save('header', 960, 340, 'Kedar Damale — Applied Data Scientist and ML & GenAI Engineer',
  'I turn complex data into useful systems: machine learning, analytical agents, and financial automation.',
  `${label(36, 47, 'DATA SCIENCE / MACHINE LEARNING / GENAI')}
  ${text(34, 121, 'Kedar Damale.', { size: 58, weight: 700 })}
  ${text(36, 173, 'Complex data. Useful systems.', { size: 28, fill: t.mint })}
  ${text(36, 216, 'Building analytical agents, machine learning,', { size: 20, fill: t.muted })}
  ${text(36, 246, 'and automation for real business workflows.', { size: 20, fill: t.muted })}
  ${line(36, 275, 630, 275)}${text(36, 307, 'RESEARCH  →  ENGINEERING  →  IMPACT', { size: 14, mono: true, fill: t.muted })}${orbit}`);

const metrics = [
  ['3M+', 'Pharma records', 'Agentic analytics'], ['10K+', 'Invoices reconciled', 'Financial automation'],
  ['>99.9%', 'Less processing time', 'Versus manual workflow'], ['98.57%', 'Detection accuracy', '500+ chess test images'],
];
await save('impact', 960, 174, 'Selected engineering impact',
  '3M+ pharmaceutical records; 10,000+ invoices; over 99.9% less reconciliation processing time; 98.57% chess detection accuracy on 500+ test images.',
  metrics.map(([value, title, detail], i) => {
    const x = 30 + i * 238;
    return `${i ? `<path d="M${x - 14} 28V145" stroke="${t.border}"/>` : ''}
    ${text(x, 69, value, { size: 36, weight: 700, fill: i === 3 ? t.violet : t.mint })}
    ${text(x, 108, title, { size: 16, weight: 700 })}${text(x, 138, detail, { size: 13, fill: t.muted })}`;
  }).join('\n'));

const jobs = [
  ['01 / FINANCIAL AUTOMATION', 'Propelligence Advisors', 'Automation Developer', 'MAY 2025 — JAN 2026', ['Purchase records → tax reconciliation', 'Polars, fuzzy matching, automated reports']],
  ['02 / ML + GENAI', 'Globalspace Technologies', 'ML & GenAI Engineer', 'JAN 2026 — PRESENT', ['Pharma intelligence and analytical agents', 'Forecasting, simulations, enterprise AI']],
];
await save('experience', 960, 256, 'From financial automation to ML and GenAI engineering',
  'Propelligence Advisors, May 2025 to January 2026: Automation Developer. Globalspace Technologies, January 2026 to present: ML & GenAI Engineer.',
  jobs.map(([section, company, role, dates, details], i) => {
    const x = 24 + i * 468;
    return `${panel(x, 24, 444, 208)}${label(x + 20, 52, section)}
    ${text(x + 20, 87, company, { size: 22, weight: 700 })}${text(x + 20, 115, role, { size: 17 })}
    ${text(x + 20, 142, dates, { size: 12, mono: true, fill: t.violet })}${line(x + 20, 158, x + 423, 158)}
    ${details.map((detail, j) => text(x + 20, 184 + j * 25, detail, { size: 15, fill: t.muted })).join('')}`;
  }).join('\n'));

const projects = [
  { name: 'chessablanka', title: 'Chessablanka', category: 'COMPUTER VISION', lines: ['Read a physical chessboard from a photo,', 'rebuild its position, and connect to Stockfish.'], stack: 'YOLOv8 · OpenCV · Stockfish', evidence: '98.57%', detail: 'Detection accuracy across 500+ test images' },
  { name: 'neurotribe', title: 'NeuroTRIBE', category: 'NEUROIMAGING / RESEARCH', lines: ['Compare cortical responses in ADHD and', 'matched cohorts with movie-fMRI data.'], stack: 'Python · TRIBE v2 · Docker', evidence: 'Reproducible', detail: 'Containerized cohort analysis' },
  { name: 'cattle-monitoring', title: 'Cattle Monitoring', category: 'IOT / GEOSPATIAL ML', lines: ['Track herd movement with GPS and RSSI;', 'use DBSCAN to identify grazing zones.'], stack: 'ESP32 · DBSCAN · Flask', evidence: 'Telemetry → insight', detail: 'Distributed devices and a live dashboard' },
  { name: 'reconciliation', title: 'Automated Reconciliation', category: 'FINANCIAL AUTOMATION', lines: ['Match purchase registers against tax data', 'and produce reports for audit review.'], stack: 'Python · Polars · RapidFuzz', evidence: '10,000+', detail: 'Invoices processed through automated matching' },
];
for (const project of projects) {
  await save(project.name, 460, 256, project.title, `${project.lines.join(' ')} ${project.stack}. ${project.evidence}: ${project.detail}.`,
    `${label(24, 37, project.category)}${text(24, 76, project.title, { size: 24, weight: 700 })}
    ${project.lines.map((value, i) => text(24, 112 + i * 24, value, { size: 17, fill: t.muted })).join('')}
    ${text(24, 169, project.stack, { size: 13, mono: true, fill: t.violet })}${line(24, 185, 436, 185)}
    ${text(24, 218, project.evidence, { size: 24, weight: 700, fill: t.mint })}
    ${text(24, 241, project.detail, { size: 13, fill: t.muted })}`);
}

function icon(name, x, y) {
  if (!devicons[name]) {
    const paths = {
      rag: '<path d="M5 7h12q7 0 7 5q0-5 7-5h12v32H31q-7 0-7 4q0-4-7-4H5zM24 12v31M10 16h8m-8 7h8m12-7h8m-8 7h8"/>',
      langgraph: '<path d="M10 9L38 9L24 24L10 39L38 39L24 24z"/><circle cx="10" cy="9" r="4"/><circle cx="38" cy="9" r="4"/><circle cx="24" cy="24" r="4"/><circle cx="10" cy="39" r="4"/><circle cx="38" cy="39" r="4"/>',
      mcp: '<path d="M14 8v10m20-10v10M9 18h30v6q0 12-15 12T9 24zM24 36v7"/>',
      tools: '<rect x="4" y="7" width="40" height="34" rx="5"/><path d="M11 17l7 7-7 7m13 0h11"/>',
    };
    return `<svg x="${x}" y="${y}" width="40" height="40" viewBox="0 0 48 48" fill="none" stroke="${t.mint}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">${paths[name]}</svg>`;
  }
  let source = devicons[name].slice(devicons[name].indexOf('<svg'));
  if (/<(?:script|foreignObject|image)\b/i.test(source) || /(?:href|src)=["']https?:/i.test(source)) throw new Error(`Unsafe external icon: ${name}`);
  const viewBox = source.match(/viewBox="([^"]+)"/)?.[1] || '0 0 128 128';
  let inner = source.slice(source.indexOf('>') + 1, source.lastIndexOf('</svg>'));
  // These two original wordmarks use dark fills that disappear on dark cards.
  if (name === 'amazonwebservices') inner = inner.replace(/#252f3e/gi, t.text);
  if (name === 'pandas') inner = inner.replace(/#130754/gi, t.violet);
  inner = inner.replace(/id="([^"]+)"/g, `id="${name}-$1"`).replace(/url\(#([^)]+)\)/g, `url(#${name}-$1)`).replace(/(?:xlink:href|href)="#([^"]+)"/g, `href="#${name}-$1"`);
  return `<svg x="${x}" y="${y}" width="40" height="40" viewBox="${escapeXml(viewBox)}">${inner}</svg>`;
}
const rows = [
  ['ML & COMPUTER VISION', [['python', 'Python'], ['pytorch', 'PyTorch'], ['numpy', 'NumPy'], ['pandas', 'pandas'], ['scikitlearn', 'scikit-learn'], ['opencv', 'OpenCV']]],
  ['GENAI & AGENTS', [['rag', 'RAG'], ['langgraph', 'LangGraph'], ['mcp', 'MCP'], ['tools', 'Tool calling']]],
  ['APIS & DATA SYSTEMS', [['fastapi', 'FastAPI'], ['postgresql', 'PostgreSQL'], ['mongodb', 'MongoDB'], ['redis', 'Redis']]],
  ['BUILD & SHIP', [['docker', 'Docker'], ['amazonwebservices', 'AWS'], ['git', 'Git'], ['linux', 'Linux'], ['typescript', 'TypeScript'], ['react', 'React']]],
];
await save('stack', 960, 584, 'Languages and tools', rows.map(([name, entries]) => `${name}: ${entries.map(([, label]) => label).join(', ')}`).join('. '),
  rows.map(([name, entries], row) => {
    const y = 39 + row * 140;
    return `${label(28, y, name)}${entries.map(([id, name], column) => {
      const x = 28 + column * 151;
      return `${panel(x, y + 16, 130, 95)}${icon(id, x + 45, y + 26)}${text(x + 65, y + 95, name, { size: 14, anchor: 'middle' })}`;
    }).join('')}`;
  }).join('\n'));
for (const [, entries] of rows) {
  for (const [id, name] of entries) {
    await save(`tool-${id}`, 130, 106, name, `${name} — part of Kedar Damale's engineering stack.`,
      `${icon(id, 45, 16)}${text(65, 87, name, { size: 14, anchor: 'middle' })}`);
  }
}
console.log(`Generated 8 profile panels and 20 tool tiles in ${output}.`);
