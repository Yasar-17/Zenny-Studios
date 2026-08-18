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

    document.querySelectorAll('a, button, .error-digit, .route').forEach(el => {
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

    // ===== Parallax 404 digits =====
    const stack = document.getElementById('errorStack');
    const digits = document.querySelectorAll('.error-digit');
    const hero = document.getElementById('hero');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const digitState = Array.from(digits).map(() => ({
      px: 0, py: 0,   // parallax offset
      ry: 0, rx: 0,   // parallax rotation
      tx: 0, ty: 0,   // per-digit hover tilt
      gx: 0, gy: 0    // glitch jitter
    }));

    function renderDigits() {
      digits.forEach((d, i) => {
        const s = digitState[i];
        d.style.transform =
          `translate(${s.px + s.tx + s.gx}px, ${s.py + s.ty + s.gy}px)` +
          ` rotateY(${s.ry}deg) rotateX(${s.rx}deg)`;
      });
    }

    if (stack && hero && !reduceMotion) {
      hero.addEventListener('mousemove', (e) => {
        const r = hero.getBoundingClientRect();
        const cx = (e.clientX - r.left - r.width / 2) / r.width;
        const cy = (e.clientY - r.top - r.height / 2) / r.height;
        digits.forEach((d, i) => {
          const depth = (i - 1) * 24;
          const s = digitState[i];
          s.px = cx * depth;
          s.py = cy * depth;
          s.ry = cx * 6;
          s.rx = -cy * 6;
        });
        renderDigits();
      });
      hero.addEventListener('mouseleave', () => {
        digits.forEach((d, i) => {
          const s = digitState[i];
          s.px = 0; s.py = 0; s.ry = 0; s.rx = 0;
        });
        renderDigits();
      });

      // Per-digit hover tilt
      digits.forEach((d, i) => {
        d.addEventListener('mousemove', (e) => {
          const r = d.getBoundingClientRect();
          const dx = (e.clientX - r.left - r.width / 2) / (r.width / 2);
          const dy = (e.clientY - r.top - r.height / 2) / (r.height / 2);
          const s = digitState[i];
          s.tx = dx * 12;
          s.ty = dy * 12;
          renderDigits();
        });
        d.addEventListener('mouseleave', () => {
          const s = digitState[i];
          s.tx = 0; s.ty = 0;
          renderDigits();
        });
      });

      // Glitch on click (easter egg)
      stack.addEventListener('click', (e) => {
        burstAt(e.clientX, e.clientY);
        stack.classList.add('glitch');
        let n = 0;
        const tick = setInterval(() => {
          digits.forEach((d, i) => {
            const s = digitState[i];
            s.gx = (Math.random() - 0.5) * 10;
            s.gy = (Math.random() - 0.5) * 8;
          });
          renderDigits();
          n++;
          if (n > 5) {
            clearInterval(tick);
            stack.classList.remove('glitch');
            digits.forEach((d, i) => { digitState[i].gx = 0; digitState[i].gy = 0; });
            renderDigits();
          }
        }, 60);
      });
    }

    // ===== Keyboard easter egg: type "404" =====
    const keySeq = ['4', '0', '4'];
    let keyPos = 0;
    document.addEventListener('keydown', (e) => {
      const k = e.key;
      if (k === keySeq[keyPos]) {
        const el = digits[keyPos];
        if (el) { el.classList.add('pressed'); setTimeout(() => el.classList.remove('pressed'), 260); }
        keyPos++;
        if (keyPos === keySeq.length) {
          keyPos = 0;
          stack.classList.add('glitch');
          setTimeout(() => stack.classList.remove('glitch'), 320);
        }
      } else if (/^[0-9]$/.test(k)) {
        keyPos = 0;
        digits.forEach(d => {
          d.classList.add('wrong');
          setTimeout(() => d.classList.remove('wrong'), 220);
        });
      }
    });

    // ===== Particle burst =====
    function burstAt(x, y) {
      if (reduceMotion) return;
      const colors = ['#F5C518', '#ff3b3b', '#00e0ff', '#ffffff'];
      const count = 20;
      for (let i = 0; i < count; i++) {
        const p = document.createElement('span');
        p.className = 'particle';
        const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
        const dist = 40 + Math.random() * 80;
        const size = 4 + Math.random() * 6;
        p.style.left = x + 'px';
        p.style.top = y + 'px';
        p.style.width = size + 'px';
        p.style.height = size + 'px';
        p.style.setProperty('--dx', Math.cos(angle) * dist + 'px');
        p.style.setProperty('--dy', Math.sin(angle) * dist + 'px');
        p.style.background = colors[i % colors.length];
        document.body.appendChild(p);
        p.addEventListener('animationend', () => p.remove());
      }
    }

    // ===== Konami code: recover the route =====
    const konamiSeq = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    let konamiPos = 0;
    const recoveredOverlay = document.getElementById('recoveredOverlay');
    let recovered = false;

    function recoverSystem() {
      if (recovered) return;
      recovered = true;
      digits.forEach((d, i) => {
        d.classList.add('pressed');
        d.style.setProperty('transition-delay', (i * 120) + 'ms');
      });
      setTimeout(() => digits.forEach(d => {
        d.classList.remove('pressed');
        d.style.transitionDelay = '';
      }), 1400);
      if (recoveredOverlay) {
        recoveredOverlay.setAttribute('aria-hidden', 'false');
        recoveredOverlay.classList.add('show');
        setTimeout(() => {
          recoveredOverlay.classList.remove('show');
          recoveredOverlay.setAttribute('aria-hidden', 'true');
        }, 4500);
      }
    }

    document.addEventListener('keydown', (e) => {
      const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if (k === konamiSeq[konamiPos]) {
        konamiPos++;
        if (konamiPos === konamiSeq.length) {
          konamiPos = 0;
          recoverSystem();
        }
      } else {
        konamiPos = (k === konamiSeq[0]) ? 1 : 0;
      }
    });

    // ===== Parallax ambient shapes (mouse) =====
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

    // ===== Radar + live signal meter =====
    const meter = document.getElementById('signalMeter');
    const signalLabel = document.getElementById('signalLabel');
    const barEls = meter ? Array.from(meter.querySelectorAll('.signal-bar')) : [];
    const signalStates = [
      { label: 'LOST', level: 0 },
      { label: 'FAINT', level: 1 },
      { label: 'WEAK', level: 2 },
      { label: 'OK', level: 3 },
      { label: 'STRONG', level: 4 }
    ];

    function renderSignal(state) {
      if (!meter) return;
      barEls.forEach((b, i) => b.classList.toggle('lit', i < state.level));
      signalLabel.textContent = state.label;
    }

    if (meter) {
      meter.addEventListener('click', () => {
        renderSignal({ label: 'BOOSTED', level: 5 });
        barEls.forEach(b => b.classList.add('boost'));
        setTimeout(() => {
          barEls.forEach(b => b.classList.remove('boost'));
          if (!reduceMotion) renderSignal(signalStates[Math.floor(Math.random() * signalStates.length)]);
        }, 900);
      });
      if (!reduceMotion) {
        let idx = 1;
        setInterval(() => {
          idx = Math.max(0, Math.min(signalStates.length - 1, idx + Math.floor(Math.random() * 3) - 1));
          renderSignal(signalStates[idx]);
        }, 1800);
      } else {
        renderSignal(signalStates[3]);
      }
    }

    // ===== Escape routes: 3D tilt + teleport on click =====
    const routes = document.querySelectorAll('.route');
    const hoverOK = window.matchMedia('(hover: hover)').matches;

    routes.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        if (!hoverOK || reduceMotion) return;
        const r = card.getBoundingClientRect();
        const rx = (e.clientX - r.left) / r.width - 0.5;
        const ry = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(800px) rotateY(${rx * 8}deg) rotateX(${-ry * 8}deg) translateY(-4px)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
      card.addEventListener('click', (e) => {
        if (card.classList.contains('teleporting')) { e.preventDefault(); return; }
        e.preventDefault();
        card.classList.add('teleporting');
        setTimeout(() => { window.location.href = card.getAttribute('href'); }, 450);
      });
    });

    // ===== Typed status log =====
    const typedEl = document.querySelector('[data-typed]');
    const lines = [
      'ERR // route_not_found',
      'SRC // zenny_studio/routes.map',
      'TRACE // last_known_position: undefined',
      'REASON // this_path_was_never_built',
      'NEXT // choose_an_escape_route',
      'HINT // â†‘â†‘â†“â†“â†â†’â†â†’ba'
    ];
    if (typedEl && !reduceMotion) {
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
    } else if (typedEl) {
      typedEl.textContent = lines[0];
    }

    // ===== Scroll progress (in case the page grows) =====
    const sp = document.getElementById('scrollProgress');
    window.addEventListener('scroll', () => {
      const d = document.documentElement.scrollHeight - window.innerHeight;
      sp.style.width = ((d > 0 ? window.scrollY / d : 0) * 100) + '%';
    }, { passive: true });
