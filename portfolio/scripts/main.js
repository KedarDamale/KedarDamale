import { initNavigation } from './modules/navigation.js';
import { initMotion } from './modules/motion.js';
import { initTheme } from './modules/theme.js';

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
  initTheme();
  initNavigation();
  initMotion();
} catch (error) {
  console.error(error);
  document.body.classList.add('components-failed');
}
