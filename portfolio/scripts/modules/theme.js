const storageKey = 'kedar-portfolio-theme';

export function initTheme() {
  const root = document.documentElement;
  const toggle = document.querySelector('.theme-toggle');
  const savedTheme = localStorage.getItem(storageKey);

  if (savedTheme === 'light' || savedTheme === 'dark') root.dataset.theme = savedTheme;

  const updateToggle = () => {
    const isDark = root.dataset.theme === 'dark';
    toggle?.setAttribute('aria-pressed', String(isDark));
    toggle?.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
    if (toggle) toggle.querySelector('[aria-hidden="true"]').textContent = isDark ? '◐' : '☀';
  };

  updateToggle();
  toggle?.addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem(storageKey, root.dataset.theme);
    updateToggle();
  });
}
