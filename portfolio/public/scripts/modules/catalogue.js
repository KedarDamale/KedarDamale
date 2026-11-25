const repositories = [
  {
    name: 'NeuroTribe', title: 'NeuroTRIBE', category: 'AI & research', language: 'Python',
    description: 'Reproducible cortical-response analysis for an ADHD research question using movie-fMRI data.',
    stack: 'Python · Docker · Neuroimaging',
  },
  {
    name: 'Chessablanka', title: 'Chessablanka', category: 'Computer vision', language: 'Jupyter Notebook',
    description: 'Detect chess positions from board photos and connect the resulting position to Stockfish.',
    stack: 'YOLOv8 · OpenCV · Stockfish',
  },
  {
    name: 'ESP32-DBSCAN-Cattle-Monitoring-System', title: 'Cattle Monitoring', category: 'IoT & geospatial', language: 'TypeScript',
    description: 'GPS/RSSI telemetry, density-based grazing-zone analysis, and a live cattle-monitoring dashboard.',
    stack: 'ESP32 · DBSCAN · Flask',
  },
  {
    name: 'automated_reconcillation', title: 'Automated Reconciliation', category: 'Automation', language: 'Python',
    description: 'Fuzzy-match purchase and tax records, then produce review-ready reconciliation reports.',
    stack: 'Python · Polars · Fuzzy matching',
  },
  {
    name: 'Automated-UI-flow-maker', title: 'Automated UI Flow Maker', category: 'Automation', language: 'Python',
    description: 'A code-backed experiment in expressing interface interactions as repeatable UI flows.',
    stack: 'Python · UI automation',
  },
  {
    name: 'StudyONE', title: 'StudyONE', category: 'Full-stack apps', language: 'JavaScript',
    description: 'A full-stack study platform bringing student productivity and collaboration tools together.',
    stack: 'MERN · Speech-to-text · Collaboration',
  },
  {
    name: 'StudyONE-DrawingBoard', title: 'StudyONE Drawing Board', category: 'Full-stack apps', language: 'TypeScript',
    description: 'A focused drawing-board companion for collaborative learning and visual explanations.',
    stack: 'TypeScript · Client / server',
  },
  {
    name: 'MarksMania', title: 'MarksMania', category: 'Full-stack apps', language: 'JavaScript',
    description: 'A substantial JavaScript learning and assessment application with a full-stack codebase.',
    stack: 'JavaScript · Web application',
  },
  {
    name: 'GroceryShopONE', title: 'GroceryShopONE', category: 'Full-stack apps', language: 'Python',
    description: 'A Flask web application for managing a shop and keeping operational records online.',
    stack: 'Python · Flask',
  },
  {
    name: 'Music-Downloader', title: 'Music Downloader', category: 'Developer tools', language: 'Python',
    description: 'A compact, code-backed Python utility for downloading audio from supported sources.',
    stack: 'Python · Utility',
  },
];

function makeTextElement(tag, className, value) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  element.textContent = value;
  return element;
}

function makeIcon(name, className = 'icon') {
  const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  icon.setAttribute('class', className);
  icon.setAttribute('aria-hidden', 'true');
  const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
  use.setAttribute('href', `assets/icons.svg#${name}`);
  icon.append(use);
  return icon;
}

function makeCard(project) {
  const card = document.createElement('article');
  card.className = 'repo-card';
  const top = document.createElement('div');
  top.className = 'repo-card-top';
  top.append(makeIcon('folder', 'icon repo-folder'));
  const source = document.createElement('a');
  source.className = 'repo-card-link';
  source.href = `https://github.com/KedarDamale/${encodeURIComponent(project.name)}`;
  source.target = '_blank';
  source.rel = 'noopener noreferrer';
  source.setAttribute('aria-label', `Open ${project.title} source on GitHub`);
  source.append(makeIcon('github'));
  top.append(source);
  card.append(top);
  const title = document.createElement('h3');
  const titleLink = makeTextElement('a', 'repo-title-link', project.title);
  titleLink.href = source.href;
  titleLink.target = '_blank';
  titleLink.rel = 'noopener noreferrer';
  title.append(titleLink);
  card.append(title, makeTextElement('p', '', project.description));
  const stack = document.createElement('div');
  stack.className = 'repo-card-bottom';
  project.stack.split(' · ').forEach(tech => stack.append(makeTextElement('span', '', tech)));
  card.append(stack);
  return card;
}

export function initCatalogue() {
  const grid = document.querySelector('[data-repo-grid]');
  if (!grid) return;
  const moreButton = document.querySelector('[data-repo-more]');
  const limit = Number(grid.dataset.repoLimit) || Infinity;
  const featured = new Set(['Chessablanka', 'NeuroTribe', 'ESP32-DBSCAN-Cattle-Monitoring-System']);
  const projects = repositories.filter(project => !featured.has(project.name));
  let expanded = false;

  function render() {
    const visible = projects.slice(0, expanded ? Infinity : limit);
    grid.replaceChildren(...visible.map(makeCard));
    if (moreButton) {
      moreButton.hidden = projects.length <= limit;
      moreButton.textContent = expanded ? 'Show Less' : 'Show More';
      moreButton.setAttribute('aria-expanded', String(expanded));
    }
  }
  moreButton?.addEventListener('click', () => {
    expanded = !expanded;
    render();
    if (!expanded) moreButton.scrollIntoView({ block: 'center', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  });
  render();
}
