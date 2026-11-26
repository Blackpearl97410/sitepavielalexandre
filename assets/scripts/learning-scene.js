(() => {
  const demo = document.querySelector('.learning-demo');
  if (!demo) return;
  const toggle = demo.querySelector('.learning-toggle');
  const map = demo.querySelector('.learning-map');
  const steps = [...demo.querySelectorAll('.learning-step')];
  const planes = [...demo.querySelectorAll('.learning-plane')];
  const hint = demo.querySelector('.learning-hint');
  demo.classList.add('is-enhanced');
  toggle.hidden = false;
  const setOpen = open => {
    demo.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    map.inert = !open;
    map.setAttribute('aria-hidden', String(!open));
    hint.textContent = open ? 'Réduire la vue' : 'Explorer les 5 composantes';
  };
  const select = index => {
    steps.forEach((step, i) => step.setAttribute('aria-pressed', String(i === index)));
    planes.forEach((plane, i) => plane.classList.toggle('is-selected', i === index));
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
  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      demo.classList.add('is-arriving');
      observer.disconnect();
    }, { threshold: .2 });
    observer.observe(demo);
  }
})();
