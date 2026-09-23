export function initMotion() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
  const targets = [...document.querySelectorAll('[data-reveal]')];
  if (!targets.length) return;
  document.body.classList.add('motion-ready');
  const observer = new IntersectionObserver((entries, instance) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      instance.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: .08 });
  targets.forEach((target) => observer.observe(target));
}
