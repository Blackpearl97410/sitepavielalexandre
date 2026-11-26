(() => {
  const visuals = [...document.querySelectorAll('#capabilities .service__media')];
  if (!visuals.length || !('IntersectionObserver' in window)) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const pointer = matchMedia('(hover: hover) and (pointer: fine)');
  const resetters = [];
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('is-revealed');
      observer.unobserve(entry.target);
    }
  }, { threshold: 0.12 });

  for (const visual of visuals) {
    visual.classList.add('visual-motion');
    if (reduced.matches) visual.classList.add('is-revealed');
    else observer.observe(visual);
    let frame = 0;
    let x = 0;
    let y = 0;
    let bounds;
    const reset = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      bounds = null;
      visual.style.removeProperty('--visual-rx');
      visual.style.removeProperty('--visual-ry');
    };
    resetters.push(reset);
    visual.addEventListener('pointerenter', () => {
      if (!reduced.matches && pointer.matches) bounds = visual.getBoundingClientRect();
    });
    visual.addEventListener('pointermove', event => {
      if (reduced.matches || !pointer.matches || event.pointerType === 'touch') return;
      bounds ||= visual.getBoundingClientRect();
      x = Math.max(-1, Math.min(1, (event.clientX - bounds.left) / bounds.width * 2 - 1));
      y = Math.max(-1, Math.min(1, (event.clientY - bounds.top) / bounds.height * 2 - 1));
      if (frame) return;
      frame = requestAnimationFrame(() => {
        visual.style.setProperty('--visual-rx', `${(-y * 1.6).toFixed(2)}deg`);
        visual.style.setProperty('--visual-ry', `${(x * 2.2).toFixed(2)}deg`);
        frame = 0;
      });
    });
    visual.addEventListener('pointerleave', reset);
    visual.addEventListener('pointercancel', reset);
  }
  const resetAll = () => resetters.forEach(reset => reset());
  // Invalidate pointer geometry after scrolling or resizing, without measuring on each move.
  window.addEventListener('scroll', resetAll, { passive: true });
  window.addEventListener('resize', resetAll, { passive: true });
  pointer.addEventListener('change', resetAll);
  reduced.addEventListener('change', () => {
    resetAll();
    if (!reduced.matches) return;
    observer.disconnect();
    visuals.forEach(visual => visual.classList.add('is-revealed'));
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) resetAll();
  });
})();
