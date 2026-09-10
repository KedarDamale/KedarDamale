function waitForImage(image) {
  if (image.complete && image.naturalWidth) return Promise.resolve();
  return new Promise((resolve, reject) => {
    image.addEventListener('load', resolve, { once: true });
    image.addEventListener('error', reject, { once: true });
  });
}

export async function cleanHeroPortrait() {
  const portrait = document.querySelector('[data-hero-image] img');
  if (!portrait) return;

  try {
    await waitForImage(portrait);

    const canvas = document.createElement('canvas');
    canvas.width = portrait.naturalWidth;
    canvas.height = portrait.naturalHeight;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    context.drawImage(portrait, 0, 0);

    const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
    for (let index = 0; index < pixels.data.length; index += 4) {
      const red = pixels.data[index];
      const green = pixels.data[index + 1];
      const blue = pixels.data[index + 2];
      const brightness = (red + green + blue) / 3;
      const colorSpread = Math.max(red, green, blue) - Math.min(red, green, blue);

      // The source uses neutral light/dark checkerboard squares. Remove only
      // those neutral, bright pixels and preserve the coloured skin and suit.
      if (brightness > 118 && colorSpread < 16) pixels.data[index + 3] = 0;
    }

    context.putImageData(pixels, 0, 0);
    portrait.src = canvas.toDataURL('image/png');
    portrait.classList.add('is-clean');
  } catch {
    // Keep the original image visible if the browser cannot process the asset.
  }
}
