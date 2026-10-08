export async function initResumeLinks() {
  const links = document.querySelectorAll('[data-resume-link]');
  if (!links.length) return;

  try {
    const response = await fetch('output/resumes.json', { cache: 'no-store' });
    if (!response.ok) throw new Error(`Unable to load resume list: ${response.status}`);
    const filenames = await response.json();
    const latest = filenames
      .filter((name) => typeof name === 'string' && /^resume-\d{8}\.pdf$/.test(name))
      .sort()
      .at(-1);
    if (!latest) throw new Error('No dated resume PDFs found');

    links.forEach((link) => {
      link.href = `output/${latest}`;
    });
  } catch (error) {
    console.warn('Could not update resume links; keeping the fallback URL.', error);
  }
}
