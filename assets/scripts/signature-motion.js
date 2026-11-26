(() => {
  const section = document.querySelector('.signature');
  if (!section) return;
  const scene = section.querySelector('.signature__scene');
  const portrait = section.querySelector('.signature__portrait');
  const cursor = section.querySelector('.signature__cursor');
  const colorButton = section.querySelector('.signature__effect-toggle');
  colorButton.hidden = false;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  let frame = 0, lastTime = 0, point = null, needsMeasure = true, bounds = null;
  const current = { x: 0, y: 0, px: 0, py: 0 };
  const clamp = value => Math.max(-1, Math.min(1, value));
  const measure = () => {
    bounds = { root: section.getBoundingClientRect(), scene: scene.getBoundingClientRect(), portrait: portrait.getBoundingClientRect() };
    needsMeasure = false;
  };
  const schedule = () => {
    if (!frame && fine.matches && !reduce.matches && !document.hidden) frame = requestAnimationFrame(update);
  };
  function update(time) {
    frame = 0;
    if (needsMeasure || !bounds) measure();
    const root = bounds.root, box = bounds.scene, face = bounds.portrait;
    const active = point && point.x >= root.left && point.x <= root.right && point.y >= root.top && point.y <= root.bottom;
    const target = active ? {
      x: point.x - root.left,
      y: point.y - root.top,
      px: clamp(((point.x - box.left) / box.width - .5) * 2) * 6,
      py: clamp(((point.y - box.top) / box.height - .5) * 2) * 3
    } : { x: current.x, y: current.y, px: 0, py: 0 };
    const dt = lastTime ? Math.min(64, time - lastTime) : 16.7;
    const alpha = 1 - Math.exp(-dt / 65);
    lastTime = time;
    let moving = false;
    for (const key of Object.keys(current)) {
      const delta = target[key] - current[key];
      current[key] += delta * alpha;
      if (Math.abs(target[key] - current[key]) < .05) current[key] = target[key];
      else moving = true;
    }
    section.classList.toggle('is-pointer', !!active);
    section.style.setProperty('--signature-px', `${current.px.toFixed(2)}px`);
    section.style.setProperty('--signature-py', `${current.py.toFixed(2)}px`);
    if (active) {
      section.style.setProperty('--signature-x', `${(current.x + root.left - box.left).toFixed(2)}px`);
      section.style.setProperty('--signature-y', `${(current.y + root.top - box.top).toFixed(2)}px`);
      section.style.setProperty('--portrait-spot-x', `${(current.x + root.left - face.left - current.px).toFixed(2)}px`);
      section.style.setProperty('--portrait-spot-y', `${(current.y + root.top - face.top - current.py).toFixed(2)}px`);
      cursor.style.transform = `translate3d(${current.x.toFixed(2)}px,${current.y.toFixed(2)}px,0)`;
    }
    if (moving) schedule();
    else lastTime = 0;
  }
  const leave = () => {
    point = null;
    section.classList.remove('is-pointer', 'is-link');
    schedule();
  };
  const stop = () => {
    cancelAnimationFrame(frame);
    frame = 0;
    lastTime = 0;
    point = null;
    current.px = current.py = 0;
    section.style.setProperty('--signature-px', '0px');
    section.style.setProperty('--signature-py', '0px');
    section.classList.remove('is-pointer', 'is-link');
    if (reduce.matches) section.classList.remove('is-ready');
  };
  section.addEventListener('pointerenter', () => { needsMeasure = true; });
  section.addEventListener('pointermove', event => {
    if (!fine.matches || reduce.matches || event.pointerType === 'touch') return;
    if (!point) { measure(); current.x = event.clientX - bounds.root.left; current.y = event.clientY - bounds.root.top; }
    point = { x: event.clientX, y: event.clientY };
    section.classList.toggle('is-link', !!event.target.closest('a,button'));
    schedule();
  }, { passive: true });
  section.addEventListener('pointerleave', leave);
  section.addEventListener('focusin', () => { section.classList.add('is-seen'); leave(); });
  colorButton.addEventListener('click', () => {
    const enabled = colorButton.getAttribute('aria-pressed') !== 'true';
    colorButton.setAttribute('aria-pressed', String(enabled));
    colorButton.textContent = enabled ? 'Retirer la couleur' : 'Colorer le portrait';
    section.classList.toggle('is-color-fixed', enabled);
  });
  addEventListener('scroll', () => { needsMeasure = true; if (point) schedule(); }, { passive: true });
  addEventListener('resize', () => { needsMeasure = true; if (point) schedule(); }, { passive: true });
  portrait.addEventListener('transitionend', () => { needsMeasure = true; if (point) schedule(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
  reduce.addEventListener('change', stop);
  fine.addEventListener('change', stop);
  if (!reduce.matches && 'IntersectionObserver' in window) {
    section.classList.add('is-ready');
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      section.classList.add('is-seen');
      needsMeasure = true;
      observer.disconnect();
    }, { threshold: .12 });
    observer.observe(scene);
  }
})();
