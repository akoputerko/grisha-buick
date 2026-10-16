const no = document.querySelector('#no');
const yes = document.querySelector('#yes');
const popup = document.querySelector('#celebration');
const mobileLayout = matchMedia('(max-width: 600px), (hover: none) and (pointer: coarse)');
const escapeSpace = document.createElement('div');
escapeSpace.id = 'escape-space';
escapeSpace.setAttribute('aria-hidden', 'true');
document.body.append(escapeSpace);
let mobileSide = Math.random() < .5;
function escapeButton(event) {
  event?.preventDefault();
  if (event?.pointerType === 'touch' || mobileLayout.matches) {
    if (!no.classList.contains('escaped')) {
      const spacer = document.createElement('span');
      spacer.style.cssText = `display:block;width:${no.offsetWidth}px;height:${no.offsetHeight}px;flex-shrink:0`;
      no.before(spacer);
    }
    document.body.classList.add('touch-escape');
    // Reserve a visible, content-free area, independent of the main scroll position.
    const rail = escapeSpace.getBoundingClientRect();
    const width = no.offsetWidth, height = no.offsetHeight;
    if (rail.height) {
      const current = no.getBoundingClientRect();
      const side = current.x + width / 2 < innerWidth / 2;
      mobileSide = no.classList.contains('escaped') ? side : mobileSide;
      no.classList.add('escaped');
      no.style.left = `${mobileSide ? innerWidth - width - 16 : 16}px`;
      no.style.top = `${rail.top + (rail.height - height) / 2 - 3}px`;
      no.style.visibility = '';
      return;
    }
  }
  const box = no.getBoundingClientRect();
  if (!no.classList.contains('escaped')) {
    const spacer = document.createElement('span');
    spacer.style.cssText = `display:block;width:${box.width}px;height:${box.height}px;flex-shrink:0`;
    no.before(spacer);
  }
  const margin = 16, width = box.width, height = box.height;
  const maxX = Math.max(margin, innerWidth - width - margin);
  const maxY = Math.max(margin, innerHeight - height - margin);
  const px = Number.isFinite(event?.clientX) ? event.clientX : box.x + width / 2;
  const py = Number.isFinite(event?.clientY) ? event.clientY : box.y + height / 2;
  // Use visible content rectangles, not full-width text containers.
  const obstacles = [];
  document.querySelectorAll('header, footer, h1, .eyebrow, .subtitle, .hero, .hero > *, #yes, .hint').forEach(element => {
    if (element.closest('dialog')) return;
    if (element.matches('.hero, .hero > *, #yes')) {
      obstacles.push(element.getBoundingClientRect());
    } else {
      const range = document.createRange();
      range.selectNodeContents(element);
      obstacles.push(...range.getClientRects());
    }
  });
  const gap = 12;
  const isClear = p => obstacles.every(r =>
    p.x + width + gap <= r.left || p.x >= r.right + gap ||
    p.y + height + gap <= r.top || p.y >= r.bottom + gap);
  // Obstacle edges give us every available rectangular gap, including narrow ones.
  const xs = new Set([margin, maxX]);
  const ys = new Set([margin, maxY]);
  for (const r of obstacles) {
    xs.add(r.left - width - gap); xs.add(r.right + gap);
    ys.add(r.top - height - gap); ys.add(r.bottom + gap);
  }
  const candidates = [];
  // Sample throughout the viewport so the destination varies beyond corner positions.
  for (let i = 0; i < 500; i++) {
    const p = {x: margin + Math.random() * (maxX - margin), y: margin + Math.random() * (maxY - margin)};
    if (isClear(p)) candidates.push(p);
  }
  for (const x of xs) for (const y of ys) {
    const p = {x, y};
    if (x >= margin && x <= maxX && y >= margin && y <= maxY && isClear(p)) candidates.push(p);
  }
  const safe = candidates.filter(p => {
    const dx = Math.max(p.x - px, 0, px - p.x - width);
    const dy = Math.max(p.y - py, 0, py - p.y - height);
    return Math.hypot(dx, dy) > 75 && Math.hypot(p.x - box.x, p.y - box.y) > 60;
  });
  const target = safe[Math.floor(Math.random() * safe.length)];
  // Keep the current position if the desktop viewport has no other safe destination.
  if (!target) {
    return;
  }
  no.style.visibility = '';
  no.classList.add('escaped');
  no.style.left = `${target.x}px`;
  no.style.top = `${target.y}px`;
}
// Move before the pointer reaches the button, rather than waiting for a hover.
window.addEventListener('pointermove', event => {
  if (popup.open || event.pointerType === 'touch') return;
  const box = no.getBoundingClientRect();
  if (event.clientX > box.left - 65 && event.clientX < box.right + 65 && event.clientY > box.top - 65 && event.clientY < box.bottom + 65) escapeButton(event);
});
no.addEventListener('pointerenter', event => {
  if (event.pointerType === 'mouse' && !mobileLayout.matches) escapeButton(event);
});
no.addEventListener('pointerdown', escapeButton);
// Pointer taps are handled once on pointerdown; click covers keyboard activation.
no.addEventListener('click', event => {
  event.preventDefault();
  if (event.detail === 0) escapeButton(event);
});
for (const type of ['resize', 'scroll']) window.addEventListener(type, () => {
  if (no.classList.contains('escaped')) escapeButton();
}, {passive:true});
if (window.visualViewport) visualViewport.addEventListener('resize', () => {
  if (no.classList.contains('escaped')) escapeButton();
});
yes.addEventListener('click', () => {
  if (!popup.open) popup.showModal();
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const container = document.querySelector('#confetti');
  container.replaceChildren();
  for (let i = 0; i < 55; i++) {
    const piece = document.createElement('span');
    piece.className = 'confetto';
    piece.style.cssText = `left:${Math.random()*100}%;background:${['#829052','#d9b76b','#edb5a3','#fffdf5'][i%4]};animation-delay:${Math.random()*.5}s;--drift:${Math.random()*240-120}px`;
    container.append(piece);
    piece.addEventListener('animationend', () => piece.remove());
  }
});
document.querySelectorAll('.close,.done').forEach(button => button.addEventListener('click', () => popup.close()));
popup.addEventListener('click', event => { if(event.target === popup) { const box = popup.getBoundingClientRect(); if(event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) popup.close(); } });
