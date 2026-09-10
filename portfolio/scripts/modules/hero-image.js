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
    const pixelCount = canvas.width * canvas.height;
    const background = new Uint8Array(pixelCount);
    const queue = new Int32Array(pixelCount);
    let queueStart = 0;
    let queueEnd = 0;

    for (let pixel = 0; pixel < pixelCount; pixel += 1) {
      const index = pixel * 4;
      const red = pixels.data[index];
      const green = pixels.data[index + 1];
      const blue = pixels.data[index + 2];
      const brightness = (red + green + blue) / 3;
      const colorSpread = Math.max(red, green, blue) - Math.min(red, green, blue);

      // Candidate pixels are the neutral checkerboard squares. We only remove
      // candidates connected to an image edge, never pixels inside the face.
      if (brightness > 118 && colorSpread < 16) background[pixel] = 1;
    }

    const markEdgePixel = (pixel) => {
      if (background[pixel] === 1) {
        background[pixel] = 2;
        queue[queueEnd] = pixel;
        queueEnd += 1;
      }
    };

    for (let x = 0; x < canvas.width; x += 1) {
      markEdgePixel(x);
      markEdgePixel((canvas.height - 1) * canvas.width + x);
    }
    for (let y = 1; y < canvas.height - 1; y += 1) {
      markEdgePixel(y * canvas.width);
      markEdgePixel(y * canvas.width + canvas.width - 1);
    }

    const markNeighbour = (pixel) => {
      if (background[pixel] === 1) {
        background[pixel] = 2;
        queue[queueEnd] = pixel;
        queueEnd += 1;
      }
    };

    while (queueStart < queueEnd) {
      const pixel = queue[queueStart];
      queueStart += 1;
      const x = pixel % canvas.width;
      if (pixel >= canvas.width) markNeighbour(pixel - canvas.width);
      if (pixel < pixelCount - canvas.width) markNeighbour(pixel + canvas.width);
      if (x > 0) markNeighbour(pixel - 1);
      if (x < canvas.width - 1) markNeighbour(pixel + 1);
    }

    for (let pixel = 0; pixel < pixelCount; pixel += 1) {
      if (background[pixel] === 2) pixels.data[pixel * 4 + 3] = 0;
    }

    context.putImageData(pixels, 0, 0);
    portrait.src = canvas.toDataURL('image/png');
    portrait.classList.add('is-clean');
  } catch {
    // Keep the original image visible if the browser cannot process the asset.
  }
}
