    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ===== Trigger checkmark draw-in =====
    window.addEventListener('load', () => {
      const progress = document.getElementById('checkProgress');
      const tick = document.getElementById('checkTick');
      const burst = document.getElementById('checkBurst');
      if (progress) setTimeout(() => progress.classList.add('drawn'), 100);
      if (tick)     setTimeout(() => tick.classList.add('drawn'), 100);
      if (burst)    setTimeout(() => burst.classList.add('drawn'), 100);

      // ===== Staged confetti bursts =====
      if (!reduceMotion && typeof confetti === 'function') {
        const gold = ['#F5C518', '#FFFFFF', '#FFD700'];
        setTimeout(() => confetti({ particleCount: 90, spread: 70, origin: { y: 0.45 }, colors: gold }), 1500);
        setTimeout(() => confetti({ particleCount: 60, spread: 110, origin: { y: 0.6 }, colors: gold, angle: 60 }), 1800);
        setTimeout(() => confetti({ particleCount: 60, spread: 110, origin: { y: 0.6 }, colors: gold, angle: 120 }), 1800);
      }
    });

    // ===== Custom cursor (idle-aware) =====
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorRing = document.querySelector('.cursor-ring');
    let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0, cursorActive = false;

    function animateRing() {
      ringX += (mouseX - ringX) * 0.15;
      ringY += (mouseY - ringY) * 0.15;
      cursorRing.style.left = ringX - 20 + 'px';
      cursorRing.style.top = ringY - 20 + 'px';
      if (Math.abs(mouseX - ringX) < 0.5 && Math.abs(mouseY - ringY) < 0.5) { cursorActive = false; return; }
      requestAnimationFrame(animateRing);
    }
    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX; mouseY = e.clientY;
      cursorDot.style.left = mouseX - 4 + 'px';
      cursorDot.style.top = mouseY - 4 + 'px';
      if (!cursorActive) { cursorActive = true; requestAnimationFrame(animateRing); }
    }, { passive: true });

    document.querySelectorAll('a, button, .stat-item, .next-card, .timeline-step').forEach(el => {
      el.addEventListener('mouseenter', () => cursorRing.classList.add('hover'));
      el.addEventListener('mouseleave', () => cursorRing.classList.remove('hover'));
    });

    // ===== Magnetic buttons =====
    document.querySelectorAll('.magnetic-btn').forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const r = btn.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        btn.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px)`;
      });
      btn.addEventListener('mouseleave', () => btn.style.transform = 'translate(0,0)');
    });

    // ===== Mouse-follow glow =====
    const glow = document.getElementById('heroGlow');
    const hero = document.getElementById('hero');
    if (glow && hero) {
      hero.addEventListener('mousemove', (e) => {
        const r = hero.getBoundingClientRect();
        glow.style.left = (e.clientX - r.left) + 'px';
        glow.style.top = (e.clientY - r.top) + 'px';
        glow.style.opacity = '1';
      }, { passive: true });
      hero.addEventListener('mouseleave', () => glow.style.opacity = '0');
    }

    // ===== Parallax ambient shapes =====
    if (!reduceMotion) {
      const shapes = document.querySelectorAll('.shape');
      document.addEventListener('mousemove', (e) => {
        const x = (e.clientX / window.innerWidth - 0.5);
        const y = (e.clientY / window.innerHeight - 0.5);
        shapes.forEach(s => {
          const speed = parseFloat(s.dataset.speed) || 0.05;
          s.style.marginLeft = (x * speed * 1200) + 'px';
          s.style.marginTop = (y * speed * 1200) + 'px';
        });
      }, { passive: true });
    }

    // ===== Typed transmission log =====
    const typedEl = document.querySelector('[data-typed]');
    const lines = [
      'OK // signal_acquired',
      'LOG // payload_received_from_contact_form',
      'ROUTE // dispatched_to_strategy_desk',
      'QUEUE // position_01 — no one ahead of you',
      'NEXT // human_reply_within_24h'
    ];
    if (typedEl && !reduceMotion) {
      let li = 0, ci = 0, deleting = false;
      const speed = 32, pause = 1100, delSpeed = 16;
      (function tick() {
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
      })();
    } else if (typedEl) {
      typedEl.textContent = lines[0];
    }

    // ===== Count-up stats =====
    if (!reduceMotion) {
      const statNumbers = document.querySelectorAll('.stat-number');
      const animateStats = () => {
        statNumbers.forEach(stat => {
          const target = parseInt(stat.getAttribute('data-target'), 10);
          const duration = 1600;
          const start = performance.now();
          const step = (now) => {
            const p = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            stat.textContent = Math.floor(eased * target).toLocaleString();
            if (p < 1) requestAnimationFrame(step);
            else stat.textContent = target.toLocaleString();
          };
          requestAnimationFrame(step);
        });
      };
      // run once the hero settles
      setTimeout(animateStats, 1400);
    } else {
      document.querySelectorAll('.stat-number').forEach(s => s.textContent = s.getAttribute('data-target'));
    }

    // ===== Scroll progress =====
    const sp = document.getElementById('scrollProgress');
    window.addEventListener('scroll', () => {
      const d = document.documentElement.scrollHeight - window.innerHeight;
      sp.style.width = ((d > 0 ? window.scrollY / d : 0) * 100) + '%';
    }, { passive: true });

    // ===== Mobile menu with focus trap =====
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileLinks = document.querySelectorAll('#mobile-menu a, #mobile-menu button');

    function openMobileMenu() {
      mobileMenu.setAttribute('aria-hidden', 'false');
      setTimeout(() => { const f = mobileMenu.querySelector('a, button'); if (f) f.focus(); }, 100);
    }
    function closeMobileMenu() {
      mobileMenu.setAttribute('aria-hidden', 'true');
      hamburger.focus();
    }
    hamburger.addEventListener('click', () => {
      const isOpen = mobileMenu.getAttribute('aria-hidden') === 'false';
      isOpen ? closeMobileMenu() : openMobileMenu();
    });
    mobileLinks.forEach(l => l.addEventListener('click', closeMobileMenu));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileMenu.getAttribute('aria-hidden') === 'false') closeMobileMenu();
      if (e.key === 'Tab' && mobileMenu.getAttribute('aria-hidden') === 'false') {
        const f = mobileMenu.querySelectorAll('a, button');
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
