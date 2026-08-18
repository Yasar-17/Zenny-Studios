    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ===== Custom cursor =====
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorRing = document.querySelector('.cursor-ring');
    let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0, cursorActive = false;

    function animateRing() {
      ringX += (mouseX - ringX) * 0.15;
      ringY += (mouseY - ringY) * 0.15;
      cursorRing.style.left = ringX - 20 + 'px';
      cursorRing.style.top = ringY - 20 + 'px';
      if (Math.abs(mouseX - ringX) < 0.5 && Math.abs(mouseY - ringY) < 0.5) {
        cursorActive = false; return;
      }
      requestAnimationFrame(animateRing);
    }
    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX; mouseY = e.clientY;
      cursorDot.style.left = mouseX - 4 + 'px';
      cursorDot.style.top = mouseY - 4 + 'px';
      if (!cursorActive) { cursorActive = true; requestAnimationFrame(animateRing); }
    }, { passive: true });

    // Delegated hover for cursor ring (works on dynamic content)
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest('a, button, .route, .ghost-letter, .filter-btn, .stat-card, input')) {
        cursorRing.classList.add('hover');
      }
    });
    document.addEventListener('mouseout', (e) => {
      if (e.target.closest('a, button, .route, .ghost-letter, .filter-btn, .stat-card, input')) {
        cursorRing.classList.remove('hover');
      }
    });

    // ===== Magnetic buttons (idempotent, scoped) =====
    function initMagnetic(root) {
      root = root || document;
      root.querySelectorAll('.magnetic-btn:not([data-magnetic])').forEach(btn => {
        btn.setAttribute('data-magnetic', '');
        if (reduceMotion) return;
        btn.addEventListener('mousemove', (e) => {
          const r = btn.getBoundingClientRect();
          const x = e.clientX - r.left - r.width / 2;
          const y = e.clientY - r.top - r.height / 2;
          btn.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px)`;
        });
        btn.addEventListener('mouseleave', () => btn.style.transform = 'translate(0,0)');
      });
    }
    initMagnetic(document);

    // ===== Parallax ghost letter (login) =====
    const ghost = document.getElementById('ghostLetter');
    const loginView = document.getElementById('loginView');
    if (ghost && loginView && !reduceMotion) {
      loginView.addEventListener('mousemove', (e) => {
        const r = loginView.getBoundingClientRect();
        const cx = (e.clientX - r.left - r.width / 2) / r.width;
        const cy = (e.clientY - r.top - r.height / 2) / r.height;
        ghost.style.transform = `translate(${-cx * 18}px, ${-cy * 14}px) translateY(-50%)`;
      });
      loginView.addEventListener('mouseleave', () => {
        ghost.style.transform = 'translate(0,0) translateY(-50%)';
      });
    }

    // ===== Parallax ambient shapes =====
    if (!reduceMotion) {
      const shapes = document.querySelectorAll('.shape');
      document.addEventListener('mousemove', (e) => {
        const x = (e.clientX / window.innerWidth - 0.5);
        const y = (e.clientY / window.innerHeight - 0.5);
        shapes.forEach(s => {
          if (!s.dataset.speed) return;
          const speed = parseFloat(s.dataset.speed);
          s.style.marginLeft = (x * speed * 1200) + 'px';
          s.style.marginTop = (y * speed * 1200) + 'px';
        });
      }, { passive: true });
    }

    // ===== Typed status log (login) =====
    const typedEl = document.querySelector('#loginView [data-typed]');
    const lines = [
      'AUTH // session_token.undefined',
      'ROUTE // admin/dashboard',
      'GUARD // credentials_required',
      'NEXT // enter_keys_to_proceed'
    ];
    if (typedEl) {
      if (reduceMotion) {
        typedEl.textContent = lines[0];
      } else {
        let li = 0, ci = 0, deleting = false;
        const speed = 34, pause = 900, delSpeed = 18;
        function tick() {
          const full = lines[li];
          if (!deleting) {
            typedEl.textContent = full.slice(0, ++ci);
            if (ci === full.length) { deleting = true; setTimeout(tick, pause); return; }
            setTimeout(tick, speed);
          } else {
            typedEl.textContent = full.slice(0, --ci);
            if (ci === 0) { deleting = false; li = (li + 1) % lines.length; }
            setTimeout(tick, delSpeed);
          }
        }
        tick();
      }
    }

    // ===== Scroll progress =====
    const sp = document.getElementById('scrollProgress');
    window.addEventListener('scroll', () => {
      const d = document.documentElement.scrollHeight - window.innerHeight;
      sp.style.width = (d > 0 ? ((window.scrollY / d) * 100) : 0) + '%';
    }, { passive: true });
