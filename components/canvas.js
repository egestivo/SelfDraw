// Small reusable canvas component (ES module)
// Provides a programmatic canvas that supports drawing and exporting image data.

export function createCanvas(container, opts = {}) {
  // container: DOM element or selector
  const el = typeof container === 'string' ? document.querySelector(container) : container;
  if (!el) throw new Error('createCanvas: container not found');

  const canvas = document.createElement('canvas');
  canvas.width = opts.width || 800;
  canvas.height = opts.height || 600;
  canvas.style.touchAction = 'none';
  el.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  ctx.lineWidth = opts.lineWidth || 2;
  ctx.lineCap = 'round';

  let drawing = false;

  function pointerDown(e) {
    drawing = true;
    ctx.beginPath();
    const p = getPoint(e);
    ctx.moveTo(p.x, p.y);
  }

  function pointerMove(e) {
    if (!drawing) return;
    const p = getPoint(e);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
  }

  function pointerUp() {
    drawing = false;
  }

  function getPoint(e) {
    const rect = canvas.getBoundingClientRect();
    const client = e.touches ? e.touches[0] : e;
    return { x: client.clientX - rect.left, y: client.clientY - rect.top };
  }

  canvas.addEventListener('pointerdown', pointerDown);
  canvas.addEventListener('pointermove', pointerMove);
  canvas.addEventListener('pointerup', pointerUp);
  canvas.addEventListener('pointerleave', pointerUp);

  return {
    canvas,
    ctx,
    clear() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    },
    toDataURL(type = 'image/png') {
      return canvas.toDataURL(type);
    },
  };
}

export default { createCanvas };
