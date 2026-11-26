(() => {
  'use strict';
  const key = 'ap_cookie_preferences_v1';
  const lifetime = 180 * 24 * 60 * 60 * 1000;
  const read = () => {
    try {
      const value = JSON.parse(localStorage.getItem(key));
      const now = Date.now();
      if (value?.version === 1 && typeof value.youtube === 'boolean' &&
          Number.isFinite(value.updatedAt) && value.updatedAt <= now &&
          value.expiresAt === value.updatedAt + lifetime && value.expiresAt > now) return value;
    } catch { /* Storage may be unavailable. Optional content remains blocked. */ }
    return null;
  };
  let preference = read();
  let opener = null;
  const banner = document.createElement('section');
  banner.className = 'consent-banner';
  banner.hidden = true;
  banner.setAttribute('aria-labelledby', 'consent-title');
  banner.innerHTML = `<h2 id="consent-title">Vos choix cookies</h2>
    <p>YouTube et ses cookies uniquement avec votre accord. <a class="consent-more" href="cookies.html">Détails</a></p>
    <div class="consent-actions"><button class="consent-button" type="button" data-cookie-reject>Refuser</button><button class="consent-button" type="button" data-cookie-accept>Autoriser YouTube</button></div>`;
  document.body.append(banner);
  const apply = () => {
    const allowed = preference?.youtube === true;
    const player = document.getElementById('certification-player');
    if (player) {
      const template = player.querySelector('template');
      const placeholder = player.querySelector('.consent-video');
      let iframe = player.querySelector('iframe');
      if (allowed && !iframe && template) {
        iframe = template.content.querySelector('iframe').cloneNode(true);
        iframe.src = iframe.dataset.consentSrc;
        iframe.removeAttribute('data-consent-src');
        player.append(iframe);
      } else if (!allowed && iframe) iframe.remove();
      if (placeholder) placeholder.hidden = allowed;
      player.classList.toggle('is-enabled', allowed);
    }
    document.querySelectorAll('[data-cookie-status]').forEach(element => {
      element.textContent = preference ? (allowed ? 'YouTube est autorisé.' : 'YouTube reste désactivé.') : 'YouTube est désactivé tant que vous ne donnez pas votre accord.';
    });
    banner.hidden = preference !== null;
  };
  const choose = youtube => {
    const updatedAt = Date.now();
    preference = { version: 1, youtube, updatedAt, expiresAt: updatedAt + lifetime };
    try { localStorage.setItem(key, JSON.stringify(preference)); } catch { /* The choice still applies to this page. */ }
    apply();
    if (opener?.isConnected) opener.focus();
    opener = null;
  };
  const open = trigger => {
    opener = trigger instanceof HTMLElement ? trigger : null;
    banner.hidden = false;
    banner.querySelector('button').focus();
  };
  document.addEventListener('click', event => {
    const control = event.target instanceof Element ? event.target.closest('[data-cookie-open],[data-cookie-accept],[data-cookie-reject]') : null;
    if (!control) return;
    event.preventDefault();
    if (control.hasAttribute('data-cookie-open')) open(control);
    else choose(control.hasAttribute('data-cookie-accept'));
  });
  banner.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    banner.hidden = true;
    opener?.focus();
    opener = null;
  });
  addEventListener('storage', event => {
    if (event.key !== key && event.key !== null) return;
    preference = read();
    apply();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) return;
    const current = read();
    // Keep a page-local decision if browser storage is unavailable.
    if (current || preference?.expiresAt <= Date.now()) { preference = current; apply(); }
  });
  window.APPrivacy = { open: () => open(null), getPreferences: () => preference ? { ...preference } : null };
  apply();
})();
