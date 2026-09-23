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

const categoryOrder = ['All work', 'AI & research', 'Computer vision', 'IoT & geospatial', 'Automation', 'Full-stack apps', 'Developer tools'];

function makeTextElement(tag, className, value) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  element.textContent = value;
  return element;
}

function makeCard(project, metadata) {
  const card = document.createElement('article');
  card.className = 'repo-card';
  const top = document.createElement('div');
  top.className = 'repo-card-top';
  top.append(makeTextElement('span', '', project.category));
  top.append(makeTextElement('span', 'repo-language', metadata?.language || project.language));
  card.append(top);
  card.append(makeTextElement('h4', '', project.title));
  card.append(makeTextElement('p', '', project.description));

  const bottom = document.createElement('div');
  bottom.className = 'repo-card-bottom';
  const stats = [];
  if (metadata && Number.isFinite(metadata.stargazers_count) && metadata.stargazers_count > 0) {
    stats.push(`★ ${metadata.stargazers_count}`);
  }
  if (metadata?.updated_at) {
    const updated = new Date(metadata.updated_at);
    if (!Number.isNaN(updated.valueOf())) stats.push(`Updated ${new Intl.DateTimeFormat('en', { month: 'short', year: 'numeric' }).format(updated)}`);
  }
  bottom.append(makeTextElement('span', '', stats.join(' · ') || project.stack));
  const link = makeTextElement('a', 'repo-card-link', 'View repo ↗');
  link.href = `https://github.com/KedarDamale/${encodeURIComponent(project.name)}`;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.setAttribute('aria-label', `Open ${project.title} on GitHub`);
  bottom.append(link);
  card.append(bottom);
  card.dataset.search = `${project.title} ${project.name} ${project.category} ${project.description} ${project.stack}`.toLowerCase();
  card.dataset.category = project.category;
  return card;
}

export function initCatalogue() {
  const grid = document.querySelector('[data-repo-grid]');
  const filterRoot = document.querySelector('[data-repo-filters]');
  const searchInput = document.querySelector('#repo-search');
  const status = document.querySelector('[data-repo-status]');
  const emptyMessage = document.querySelector('[data-repo-empty]');
  if (!grid || !filterRoot || !status) return;

  let selectedCategory = 'All work';
  let query = '';
  let metadata = new Map();

  const filters = categoryOrder.filter((category) => category === 'All work' || repositories.some((project) => project.category === category));
  filters.forEach((category) => {
    const button = makeTextElement('button', 'repo-filter', category);
    button.type = 'button';
    button.setAttribute('aria-pressed', String(category === selectedCategory));
    button.addEventListener('click', () => {
      selectedCategory = category;
      filterRoot.querySelectorAll('.repo-filter').forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
      render();
    });
    filterRoot.append(button);
  });

  function render() {
    grid.replaceChildren();
    let visibleCount = 0;
    repositories.forEach((project) => {
      const card = makeCard(project, metadata.get(project.name));
      const matchesCategory = selectedCategory === 'All work' || project.category === selectedCategory;
      const matchesQuery = !query || card.dataset.search.includes(query);
      card.hidden = !matchesCategory || !matchesQuery;
      if (!card.hidden) visibleCount += 1;
      grid.append(card);
    });
    if (emptyMessage) emptyMessage.hidden = visibleCount !== 0;
    status.dataset.results = String(visibleCount);
    if (!status.dataset.live) status.textContent = `${visibleCount} code-backed public repositories · curated locally`;
  }

  searchInput?.addEventListener('input', () => {
    query = searchInput.value.trim().toLowerCase();
    render();
  });
  render();

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 6500);
  fetch('https://api.github.com/users/KedarDamale/repos?type=owner&per_page=100&sort=updated', {
    headers: { Accept: 'application/vnd.github+json' },
    signal: controller.signal,
  }).then((response) => {
    if (!response.ok) throw new Error(`GitHub returned ${response.status}`);
    return response.json();
  }).then((items) => {
    if (!Array.isArray(items)) throw new Error('GitHub returned an unexpected response');
    const approvedNames = new Set(repositories.map((project) => project.name));
    metadata = new Map(items
      .filter((item) => !item.private && approvedNames.has(item.name))
      .map((item) => [item.name, item]));
    status.dataset.live = 'true';
    status.textContent = `Live GitHub metadata · ${repositories.length} verified public repositories · empty and scaffold-only repositories excluded`;
    render();
  }).catch(() => {
    status.textContent = `Local catalogue ready · ${repositories.length} verified public repositories · GitHub metadata is temporarily unavailable`;
  }).finally(() => window.clearTimeout(timeout));
}
