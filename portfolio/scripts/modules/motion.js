export function initMotion() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !window.gsap) return;

  const { gsap } = window;
  if (window.ScrollTrigger) gsap.registerPlugin(window.ScrollTrigger);

  gsap.from('.site-header', { y: -18, opacity: 0, duration: .65, ease: 'power2.out' });
  gsap.from('.hero-title .line > span', { yPercent: 115, duration: .9, stagger: .12, ease: 'power4.out', delay: .15 });
  gsap.from('.hero-portrait', { scale: 1.06, autoAlpha: 0, duration: 1.1, ease: 'power3.out', delay: .1 });
  gsap.from('.hero-title-outline', { autoAlpha: 0, duration: 1, ease: 'power2.out', delay: .6 });

  document.querySelectorAll('[data-reveal]').forEach((element) => {
    gsap.from(element, {
      y: 32,
      opacity: 0,
      duration: .7,
      ease: 'power2.out',
      scrollTrigger: { trigger: element, start: 'top 84%', once: true },
    });
  });
}
