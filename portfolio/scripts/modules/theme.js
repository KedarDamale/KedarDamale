const storageKey = 'kedar-portfolio-theme';

export function initTheme() {
  const root = document.documentElement;
  const toggle = document.querySelector('.theme-toggle');
  let savedTheme = null;
  try { savedTheme = localStorage.getItem(storageKey); } catch { /* Storage may be unavailable in private contexts. */ }
  if (savedTheme === 'light' || savedTheme === 'dark') root.dataset.theme = savedTheme;

  const updateToggle = () => {
    const isDark = root.dataset.theme !== 'light';
    toggle?.setAttribute('aria-pressed', String(!isDark));
    toggle?.setAttribute('aria-label', isDark ? 'Switch to light theme' : 'Switch to dark theme');
    toggle?.setAttribute('title', isDark ? 'Switch to light theme' : 'Switch to dark theme');
  };

  updateToggle();
  toggle?.addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem(storageKey, root.dataset.theme); } catch { /* Theme still changes for this page view. */ }
    updateToggle();
  });
}
