export function initNavigation() {
  const menuButton = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.site-nav');
  const navLinks = [...document.querySelectorAll('.site-nav a[href^="#"]')];

  menuButton?.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('is-open');
    menuButton.setAttribute('aria-expanded', String(isOpen));
  });

  navLinks.forEach((link) => link.addEventListener('click', () => {
    nav.classList.remove('is-open');
    menuButton?.setAttribute('aria-expanded', 'false');
  }));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((link) => link.classList.toggle('is-active', link.getAttribute('href') === `#${entry.target.id}`));
    });
  }, { rootMargin: '-40% 0px -50% 0px' });

  document.querySelectorAll('main section[id]').forEach((section) => observer.observe(section));
}
