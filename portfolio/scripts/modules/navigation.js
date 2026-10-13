export function initNavigation() {
  const button = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.site-nav');
  const header = document.querySelector('.site-header');
  const backdrop = document.querySelector('.menu-backdrop');
  const navLinks = [...document.querySelectorAll('.site-nav li a')];
  const mobile = window.matchMedia('(max-width: 768px)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const pageContent = [...document.querySelectorAll('main, .site-footer, .side-rail')];
  let open = false;
  let previousY = window.scrollY;

  function setMenu(isOpen, restoreFocus = false) {
    open = isOpen;
    nav?.classList.toggle('is-open', open);
    button?.setAttribute('aria-expanded', String(open));
    button?.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
    document.body.classList.toggle('menu-open', open);
    pageContent.forEach(element => { element.inert = open; });
    if (nav) nav.inert = mobile.matches && !open;
    if (open) header?.classList.remove('is-hidden');
    if (restoreFocus) button?.focus();
  }
  button?.addEventListener('click', () => setMenu(!open));
  backdrop?.addEventListener('click', () => setMenu(false, true));
  navLinks.forEach(link => link.addEventListener('click', () => {
    setMenu(false);
    const target = document.getElementById(new URL(link.href).hash.slice(1));
    if (target && mobile.matches) {
      target.tabIndex = -1;
      target.focus({ preventScroll: true });
    }
  }));
  document.addEventListener('keydown', event => {
    if (!open) return;
    if (event.key === 'Escape') { setMenu(false, true); return; }
    if (event.key !== 'Tab') return;
    const focusable = [button, ...nav.querySelectorAll('a, button')].filter(Boolean);
    const first = focusable[0];
    const last = focusable.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
  mobile.addEventListener('change', () => setMenu(false));
  setMenu(false);

  function updateHeader() {
    const y = Math.max(0, window.scrollY);
    header?.classList.toggle('is-scrolled', y >= 50);
    if (Math.abs(y - previousY) > 8 || y < 50) {
      header?.classList.toggle('is-hidden', y > previousY && y > 100 && !open && !reducedMotion.matches && !header.contains(document.activeElement));
      previousY = y;
    }
  }
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });
  header?.addEventListener('focusin', () => header.classList.remove('is-hidden'));

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        navLinks.forEach(link => {
          const active = new URL(link.href).hash === `#${entry.target.id}`;
          link.classList.toggle('is-active', active);
          if (active) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-25% 0px -55% 0px', threshold: 0 });
    document.querySelectorAll('main section[id]').forEach(section => observer.observe(section));
  }
  // Component fetching delays native fragment navigation until targets exist.
  const initialTarget = document.getElementById(location.hash.slice(1));
  if (initialTarget) initialTarget.scrollIntoView({ behavior: 'instant' });
}
