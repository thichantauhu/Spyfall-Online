(() => {
  const srcFor = name => `/assets/${encodeURIComponent(name)}.webp`;

  function apply(el, name) {
    if (!el || !name) return;
    const src = srcFor(name);
    el.style.setProperty('background-image', `url("${src}")`, 'important');
    el.style.setProperty('background-size', 'cover', 'important');
    el.style.setProperty('background-position', 'center', 'important');
    el.style.setProperty('background-repeat', 'no-repeat', 'important');
  }

  function patch() {
    document.querySelectorAll('.location-card').forEach(card => {
      apply(card, card.dataset.location);
    });

    const nameEl = document.getElementById('locationModalName');
    const imageEl = document.getElementById('locationModalImage');
    if (nameEl && imageEl) apply(imageEl, nameEl.textContent.trim());
  }

  new MutationObserver(patch).observe(document.documentElement, {
    childList: true,
    subtree: true
  });

  patch();
  document.addEventListener('click', () => setTimeout(patch, 30));
})();
