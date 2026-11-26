/* Original card deck inspired by the Halden homepage hero. */
(() => {
  'use strict';
  const section = document.getElementById('work');
  if (!section) return;
  const cards = [...section.querySelectorAll('.offer-card')];
  const frame = section.querySelector('.work__window');
  const head = section.querySelector('.work__head');
  const motion = matchMedia('(prefers-reduced-motion: no-preference)');
  let active = 0, grid = false, visible = false, paused = false, hovered = false;
  let focused = false, resumeWhileFocused = false, busy = false, timer = 0, dealTimer = 0;
  let touch = null, suppressClickUntil = 0;
  const nav = document.createElement('div');
  nav.className = 'offers-navigation';
  nav.innerHTML = '<div class="offers-navigation__count"><span data-count>01 / 08</span><span class="offers-navigation__line" aria-hidden="true"><span></span></span></div><p class="offers-navigation__title" aria-live="off" aria-atomic="true"></p><div class="offers-navigation__actions"><button type="button" data-previous aria-label="Offre précédente">←</button><button type="button" data-next aria-label="Offre suivante">→</button><button type="button" data-pause aria-pressed="false" aria-label="Pause">Pause</button><button type="button" class="offers-navigation__all">Voir toutes les offres</button></div><p class="offers-navigation__hint">Huit façons de passer à la pratique.</p>';
  head.append(nav);
  const previous = nav.querySelector('[data-previous]');
  const next = nav.querySelector('[data-next]');
  const pause = nav.querySelector('[data-pause]');
  const all = nav.querySelector('.offers-navigation__all');
  const title = nav.querySelector('.offers-navigation__title');
  const count = nav.querySelector('[data-count]');
  const line = nav.querySelector('.offers-navigation__line span');
  const poses = [[0, 0, 0], [-8, -3, -6], [8, -6, 5], [2, -10, -2]];
  const detailsOpen = () => cards[active].querySelector('details').open;
  const modulo = n => (n + cards.length) % cards.length;

  function schedule() {
    clearTimeout(timer);
    if (grid || touch || !motion.matches || !visible || paused || hovered || (focused && !resumeWhileFocused) || busy || detailsOpen() || document.hidden) return;
    timer = setTimeout(() => change(active + 1, false), 4200);
  }
  function layout(announce = false) {
    title.setAttribute('aria-live', announce ? 'polite' : 'off');
    title.textContent = cards[active].querySelector('h3').textContent;
    count.textContent = `${String(active + 1).padStart(2, '0')} / ${String(cards.length).padStart(2, '0')}`;
    line.style.width = `${(active + 1) / cards.length * 100}%`;
    cards.forEach((card, i) => {
      const rank = modulo(i - active);
      const pose = poses[Math.min(rank, 3)];
      const spread = hovered && motion.matches ? 1.65 : 1;
      card.style.setProperty('--offer-x', `${pose[0] * spread}%`);
      card.style.setProperty('--offer-y', `${pose[1] * spread}%`);
      card.style.setProperty('--offer-angle', `${pose[2] * spread}deg`);
      card.style.setProperty('--offer-opacity', rank < 4 ? '1' : '0');
      card.style.zIndex = String(cards.length - rank);
      card.classList.toggle('is-front', i === active);
      card.inert = !grid && i !== active;
      if (grid) card.removeAttribute('aria-hidden');
      else card.setAttribute('aria-hidden', String(i !== active));
      if (i !== active) card.querySelector('details').open = false;
    });
  }
  function change(index, manual = true, instant = false) {
    if (busy || grid) return;
    const target = modulo(index);
    if (target === active) return;
    clearTimeout(timer);
    if (cards[active].contains(document.activeElement)) next.focus({ preventScroll: true });
    const outgoing = cards[active];
    outgoing.querySelector('details').open = false;
    if (!motion.matches || instant) {
      active = target;
      layout(manual);
      schedule();
      return;
    }
    busy = true;
    outgoing.classList.add('is-dealing');
    outgoing.style.setProperty('--offer-x', index < active ? '-3%' : '3%');
    outgoing.style.setProperty('--offer-y', '20%');
    outgoing.style.setProperty('--offer-angle', index < active ? '-18deg' : '18deg');
    dealTimer = setTimeout(() => {
      outgoing.classList.remove('is-dealing');
      active = target;
      layout(manual);
      dealTimer = setTimeout(() => { busy = false; schedule(); }, 500);
    }, 300);
  }
  function configure() {
    clearTimeout(timer);
    clearTimeout(dealTimer);
    busy = false;
    touch = null;
    cards.forEach(card => card.classList.remove('is-dealing'));
    section.classList.toggle('offers-deck', !grid);
    section.classList.toggle('offers-grid', grid);
    nav.hidden = false;
    all.textContent = grid ? 'Revenir à la pile animée' : 'Voir toutes les offres';
    pause.hidden = grid || !motion.matches;
    nav.querySelector('.offers-navigation__hint').textContent = matchMedia('(pointer: coarse)').matches
      ? 'Balayez une carte vers la gauche ou la droite.'
      : 'Huit façons de passer à la pratique.';
    layout();
    schedule();
  }
  previous.addEventListener('click', () => change(active - 1));
  next.addEventListener('click', () => change(active + 1));
  pause.addEventListener('click', () => {
    paused = !paused;
    resumeWhileFocused = !paused;
    pause.setAttribute('aria-pressed', String(paused));
    pause.textContent = paused ? 'Reprendre' : 'Pause';
    pause.setAttribute('aria-label', paused ? 'Reprendre' : 'Pause');
    schedule();
  });
  all.addEventListener('click', () => {
    grid = !grid;
    configure();
    if (grid) cards[active].querySelector('summary').focus({ preventScroll: true });
  });
  frame.addEventListener('pointerenter', event => {
    if (event.pointerType !== 'mouse') return;
    hovered = true;
    if (!busy) layout();
    schedule();
  });
  frame.addEventListener('pointerleave', () => {
    hovered = false;
    if (!busy) layout();
    schedule();
  });
  // Keep vertical scrolling and pinch zoom native; only a clear lateral touch changes cards.
  frame.addEventListener('pointerdown', event => {
    suppressClickUntil = 0;
    if (touch) { touch = null; schedule(); return; }
    if (event.pointerType !== 'touch' || !event.isPrimary || grid || busy || detailsOpen()) return;
    if (event.target.closest('.offer-card__copy, a, button, input')) return;
    touch = { id: event.pointerId, x: event.clientX, y: event.clientY, axis: null };
    schedule();
  }, { passive: true });
  frame.addEventListener('pointermove', event => {
    if (!touch || event.pointerId !== touch.id || touch.axis) return;
    const dx = Math.abs(event.clientX - touch.x), dy = Math.abs(event.clientY - touch.y);
    if (Math.max(dx, dy) < 10) return;
    if (dy > dx) touch.axis = 'vertical';
    else if (dx > dy * 1.35) touch.axis = 'horizontal';
  }, { passive: true });
  frame.addEventListener('pointerup', event => {
    if (!touch || event.pointerId !== touch.id) return;
    const dx = event.clientX - touch.x, dy = event.clientY - touch.y;
    const horizontal = touch.axis === 'horizontal';
    touch = null;
    const threshold = Math.max(42, Math.min(72, frame.clientWidth * .18));
    if (horizontal && Math.abs(dx) >= threshold && Math.abs(dx) > Math.abs(dy) * 1.35) {
      suppressClickUntil = performance.now() + 500;
      change(active + (dx < 0 ? 1 : -1));
    } else schedule();
  }, { passive: true });
  frame.addEventListener('pointercancel', () => { touch = null; schedule(); }, { passive: true });
  frame.addEventListener('click', event => {
    if (!event.detail || performance.now() >= suppressClickUntil) return;
    suppressClickUntil = 0;
    event.preventDefault();
    event.stopImmediatePropagation();
  }, true);
  section.addEventListener('focusin', event => {
    focused = true;
    if (event.target !== pause) resumeWhileFocused = false;
    schedule();
  });
  section.addEventListener('focusout', event => {
    focused = section.contains(event.relatedTarget);
    schedule();
  });
  cards.forEach(card => card.querySelector('details').addEventListener('toggle', schedule));
  document.addEventListener('visibilitychange', schedule);
  motion.addEventListener('change', configure);
  new IntersectionObserver(entries => {
    visible = entries[0].intersectionRatio >= .2;
    schedule();
  }, { threshold: .2 }).observe(section);

  function revealHash(focus = false) {
    if (location.hash !== '#formation-ia') return;
    clearTimeout(dealTimer);
    busy = false;
    grid = false;
    active = cards.findIndex(card => card.id === 'formation-ia');
    configure();
    const top = section.getBoundingClientRect().top + scrollY - 78;
    if (window.motionKit?.wheel?.jump) window.motionKit.wheel.jump(top);
    else scrollTo({ top, behavior: 'instant' });
    if (focus) cards[active].querySelector('summary').focus({ preventScroll: true });
  }
  document.addEventListener('click', event => {
    const anchor = event.target.closest('a[href="#formation-ia"]');
    if (!anchor) return;
    event.preventDefault();
    if (location.hash !== '#formation-ia') history.pushState(null, '', '#formation-ia');
    revealHash(true);
  });
  window.addEventListener('hashchange', () => revealHash());
  window.addEventListener('load', () => revealHash(), { once: true });
  configure();
  revealHash();
})();
