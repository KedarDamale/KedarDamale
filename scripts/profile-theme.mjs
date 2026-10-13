export const theme = Object.freeze({
  background: '#0d1726', panel: '#132238', border: '#2a3d56',
  text: '#e6edf7', muted: '#a6b5ca', mint: '#64ffda', violet: '#b69cff',
  amber: '#ffd57a', levels: ['#1b2b41', '#174c4e', '#237f74', '#39b89b', '#64ffda'],
});

export const escapeXml = value => String(value).replace(/[&<>"']/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;',
})[character]);

export function text(x, y, value, { size = 18, fill = theme.text, weight = 400, mono = false, anchor = 'start' } = {}) {
  return `<text x="${x}" y="${y}" fill="${fill}" font-family="${mono ? 'DejaVu Sans Mono, monospace' : 'DejaVu Sans, Arial, sans-serif'}" font-size="${size}" font-weight="${weight}" text-anchor="${anchor}">${escapeXml(value)}</text>`;
}

export function svg(width, height, title, description, content) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title description">
<title id="title">${escapeXml(title)}</title><desc id="description">${escapeXml(description)}</desc>
<rect x="1" y="1" width="${width - 2}" height="${height - 2}" rx="18" fill="${theme.background}" stroke="${theme.border}"/>
${content}
</svg>\n`;
}
