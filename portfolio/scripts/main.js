import { initNavigation } from './modules/navigation.js';
import { initMotion } from './modules/motion.js';
import { initCatalogue } from './modules/catalogue.js';
import { initResumeLinks } from './modules/resume.js';
import { initJobs } from './modules/jobs.js';

const componentSlots = [...document.querySelectorAll('[data-component]')];

async function loadComponents() {
  await Promise.all(componentSlots.map(async (slot) => {
    const name = slot.dataset.component;
    const response = await fetch(`components/${name}.html`);
    if (!response.ok) throw new Error(`Unable to load ${name}`);
    slot.innerHTML = await response.text();
  }));
}

try {
  await loadComponents();
  void initResumeLinks();
  initNavigation();
  initJobs();
  initCatalogue();
  initMotion();
  document.body.classList.add('intro-ready');
} catch (error) {
  console.error('Portfolio setup failed:', error);
  document.body.classList.add('components-failed');
  const message = document.createElement('p');
  message.className = 'component-error';
  message.textContent = 'This portfolio could not load. Please refresh, or contact damalekedar@gmail.com.';
  document.querySelector('main')?.append(message);
}
