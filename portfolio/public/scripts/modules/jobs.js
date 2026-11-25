export function initJobs() {
  const tablist = document.querySelector('.job-tabs');
  if (!tablist) return;
  const tabs = [...tablist.querySelectorAll('[role="tab"]')];
  const mobile = window.matchMedia('(max-width: 600px)');
  const updateOrientation = () => tablist.setAttribute('aria-orientation', mobile.matches ? 'horizontal' : 'vertical');
  updateOrientation();
  mobile.addEventListener('change', updateOrientation);

  function selectTab(selected, focus = false) {
    tabs.forEach(tab => {
      const active = tab === selected;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      const panel = document.getElementById(tab.getAttribute('aria-controls'));
      if (panel) panel.hidden = !active;
    });
    if (focus) selected.focus();
  }
  tabs.forEach(tab => tab.addEventListener('click', () => selectTab(tab)));
  tablist.addEventListener('keydown', event => {
    const current = tabs.indexOf(document.activeElement);
    if (current < 0) return;
    const nextKey = mobile.matches ? 'ArrowRight' : 'ArrowDown';
    const previousKey = mobile.matches ? 'ArrowLeft' : 'ArrowUp';
    let next;
    if (event.key === nextKey) next = (current + 1) % tabs.length;
    else if (event.key === previousKey) next = (current - 1 + tabs.length) % tabs.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = tabs.length - 1;
    else return;
    event.preventDefault();
    selectTab(tabs[next], true);
  });
}
