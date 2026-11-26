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
 function measure() { loopWidth = original.getBoundingClientRect().width + 24; sync(); }
 new ResizeObserver(measure).observe(rail);
 new IntersectionObserver(entries => { visible = entries[0].isIntersecting; sync(); }, { threshold: .1 }).observe(rail);
 rail.addEventListener('pointerenter', event => { if (event.pointerType === 'mouse') { hovered = true; sync(); } });
 rail.addEventListener('pointerleave', () => { hovered = false; sync(); });
 rail.addEventListener('pointerdown', () => { touching = true; sync(); });
 window.addEventListener('pointerup', () => { touching = false; sync(); }, { passive: true });
 window.addEventListener('pointercancel', () => { touching = false; sync(); }, { passive: true });
 section.addEventListener('focusin', event => { focused = true; if (event.target !== pause) resumeWhileFocused = false; sync(); });
 section.addEventListener('focusout', event => { focused = section.contains(event.relatedTarget); sync(); });
 pause.addEventListener('click', () => {
  paused = !paused;
  resumeWhileFocused = !paused;
  pause.setAttribute('aria-pressed', String(paused));
  pause.textContent = paused ? 'Reprendre' : 'Pause';
  sync();
 });
 controls.querySelector('[data-tools-previous]').addEventListener('click', () => rail.scrollBy({ left: -rail.clientWidth * .7, behavior: motion.matches ? 'smooth' : 'instant' }));
 controls.querySelector('[data-tools-next]').addEventListener('click', () => rail.scrollBy({ left: rail.clientWidth * .7, behavior: motion.matches ? 'smooth' : 'instant' }));
 motion.addEventListener('change', sync);
 document.addEventListener('visibilitychange', sync);
 measure();
})();
