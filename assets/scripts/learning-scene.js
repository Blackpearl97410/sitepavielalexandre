(() => {
  const demo = document.querySelector('.learning-demo');
  if (!demo) return;
  const toggle = demo.querySelector('.learning-toggle');
  const map = demo.querySelector('.learning-map');
  const steps = [...demo.querySelectorAll('.learning-step')];
  const planes = [...demo.querySelectorAll('.learning-plane')];
  const hint = demo.querySelector('.learning-hint');
  let three = null, selected = 0;
  demo.classList.add('is-enhanced');
  toggle.hidden = false;
  const setOpen = open => {
    demo.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    map.inert = !open;
    map.setAttribute('aria-hidden', String(!open));
    hint.textContent = open ? 'Réduire la vue' : three ? 'Explorer la vue 3D' : 'Explorer les 5 composantes';
    three?.setOpen(open);
  };
  const select = index => {
    selected = index;
    steps.forEach((step, i) => step.setAttribute('aria-pressed', String(i === index)));
    planes.forEach((plane, i) => plane.classList.toggle('is-selected', i === index));
    three?.select(index);
  };
  toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
  steps.forEach((step, index) => { step.disabled = false; step.addEventListener('click', () => select(index)); });
  demo.addEventListener('keydown', event => {
    if (event.key !== 'Escape' || !demo.classList.contains('is-open')) return;
    setOpen(false);
    toggle.focus();
  });
  setOpen(false);
  select(0);
  // A local module is loaded near the viewport; the CSS view stays usable if it fails.
  if ('IntersectionObserver' in window && 'WebGL2RenderingContext' in window && location.protocol !== 'file:') {
    const loader = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      loader.disconnect();
      import('./learning-three.mjs').then(module => module.createLearningScene({
        demo, toggle, steps,
        onFallback() { three = null; setOpen(demo.classList.contains('is-open')); }
      })).then(scene => {
        if (!scene) return;
        three = scene;
        three.select(selected);
        setOpen(demo.classList.contains('is-open'));
      }).catch(() => { demo.classList.remove('has-webgl'); demo.querySelector('.learning-webgl')?.remove(); });
    }, { rootMargin: '300px' });
    loader.observe(demo);
  }
  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      demo.classList.add('is-arriving');
      observer.disconnect();
    }, { threshold: .2 });
    observer.observe(demo);
  }
})();
