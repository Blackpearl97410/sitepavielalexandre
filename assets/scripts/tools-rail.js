(() => {
 'use strict';
 const section = document.getElementById('outils');
 if (!section) return;
 const rail = section.querySelector('.tools-rail');
 const track = section.querySelector('.tools-rail__track');
 const original = track.querySelector('ul');
 const controls = section.querySelector('.tools-controls');
 const pause = controls.querySelector('[data-tools-pause]');
 const motion = matchMedia('(prefers-reduced-motion: no-preference)');
 const copy = original.cloneNode(true);
 copy.setAttribute('aria-hidden', 'true');
 copy.inert = true;
 copy.querySelectorAll('img').forEach(img => { img.alt = ''; });
 track.append(copy);
 controls.hidden = false;
 let loopWidth = 0, visible = false, paused = false, hovered = false, focused = false;
 let resumeWhileFocused = false, touching = false, frame = 0, last = 0, cursor = 0;
 function tick(time) {
  const elapsed = Math.min(50,time - last);
  last = time;
  cursor += elapsed * .025;
  if (cursor >= loopWidth) cursor -= loopWidth;
  rail.scrollLeft = cursor;
  frame = requestAnimationFrame(tick);
 }
 function sync() {
  const moving = motion.matches && visible && !paused && !hovered && !touching && (!focused || resumeWhileFocused) && !document.hidden && loopWidth > rail.clientWidth;
  section.classList.toggle('tools-is-moving', moving);
  pause.hidden = !motion.matches;
  if (moving && !frame) { cursor = rail.scrollLeft; last = performance.now(); frame = requestAnimationFrame(tick); }
  if (!moving && frame) { cancelAnimationFrame(frame); frame = 0; }
 }
 function setPaused(value) {
  paused = value;
  resumeWhileFocused = !paused;
  pause.setAttribute('aria-pressed', String(paused));
  pause.textContent = paused ? 'Reprendre' : 'Pause';
  sync();
 }
 function measure() { loopWidth = original.getBoundingClientRect().width + 24; sync(); }
 new ResizeObserver(measure).observe(rail);
 new IntersectionObserver(entries => { visible = entries[0].isIntersecting; sync(); }, { threshold: .1 }).observe(rail);
 rail.addEventListener('pointerenter', event => { if (event.pointerType === 'mouse') { hovered = true; sync(); } });
 rail.addEventListener('pointerleave', () => { hovered = false; sync(); });
 rail.addEventListener('pointerdown', event => {
  touching = true;
  // Native touch scrolling cancels pointer events before the finger is lifted.
  // Stay paused through that cancellation and through the browser's momentum.
  if (event.pointerType === 'touch' || event.pointerType === 'pen') setPaused(true);
  else sync();
 }, { passive: true });
 rail.addEventListener('touchstart', () => { touching = true; setPaused(true); }, { passive: true });
 window.addEventListener('pointerup', () => { touching = false; sync(); }, { passive: true });
 window.addEventListener('pointercancel', () => { touching = false; sync(); }, { passive: true });
 window.addEventListener('touchend', () => { touching = false; sync(); }, { passive: true });
 window.addEventListener('touchcancel', () => { touching = false; sync(); }, { passive: true });
 rail.addEventListener('wheel', event => {
  if (Math.abs(event.deltaX) > 1 || event.shiftKey) setPaused(true);
 }, { passive: true });
 section.addEventListener('focusin', event => { focused = true; if (event.target !== pause) resumeWhileFocused = false; sync(); });
 section.addEventListener('focusout', event => { focused = section.contains(event.relatedTarget); sync(); });
 pause.addEventListener('click', () => {
  setPaused(!paused);
 });
 controls.querySelector('[data-tools-previous]').addEventListener('click', () => {
  setPaused(true);
  rail.scrollBy({ left: -rail.clientWidth * .7, behavior: motion.matches ? 'smooth' : 'instant' });
 });
 controls.querySelector('[data-tools-next]').addEventListener('click', () => {
  setPaused(true);
  rail.scrollBy({ left: rail.clientWidth * .7, behavior: motion.matches ? 'smooth' : 'instant' });
 });
 motion.addEventListener('change', sync);
 document.addEventListener('visibilitychange', sync);
 measure();
})();
