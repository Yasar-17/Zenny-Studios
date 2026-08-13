(function () {
  const STORAGE_KEY = 'zenny-theme';
  const root = document.documentElement;

  function getPreferredTheme() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
    return 'dark';
  }

  function applyTheme(theme, skipStorage) {
    root.setAttribute('data-theme', theme);
    if (!skipStorage) localStorage.setItem(STORAGE_KEY, theme);
  }

  applyTheme(getPreferredTheme());

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-theme-toggle]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const current = root.getAttribute('data-theme') || 'dark';
        applyTheme(current === 'dark' ? 'light' : 'dark');
      });
    });

    initScrollReveal();
  });

  function initScrollReveal() {
    const els = document.querySelectorAll('[data-aos]');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion || !('IntersectionObserver' in window) || els.length === 0) return;

    els.forEach(function (el) {
      const delay = parseInt(el.getAttribute('data-aos-delay') || '0', 10) + 'ms';
      el.style.opacity = '0';
      el.style.transform = 'translateY(28px)';
      el.style.transition =
        'opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1) ' + delay +
        ', transform 0.7s cubic-bezier(0.16, 1, 0.3, 1) ' + delay;
    });

    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
        io.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    els.forEach(function (el) { io.observe(el); });
  }

  
  window.addEventListener('storage', function (e) {
    if (e.key === STORAGE_KEY && e.newValue) {
      applyTheme(e.newValue, true);
    }
  });
})();
