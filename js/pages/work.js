    // Custom Cursor — idle-aware RAF (stops when mouse is still)
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorRing = document.querySelector('.cursor-ring');
    let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;
    let cursorActive = false;

    function animateRing() {
      ringX += (mouseX - ringX) * 0.15;
      ringY += (mouseY - ringY) * 0.15;
      cursorRing.style.left = ringX - 20 + 'px';
      cursorRing.style.top = ringY - 20 + 'px';
      if (Math.abs(mouseX - ringX) < 0.5 && Math.abs(mouseY - ringY) < 0.5) {
        cursorActive = false;
        return;
      }
      requestAnimationFrame(animateRing);
    }

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursorDot.style.left = mouseX - 4 + 'px';
      cursorDot.style.top = mouseY - 4 + 'px';
      if (!cursorActive) {
        cursorActive = true;
        requestAnimationFrame(animateRing);
      }
    }, { passive: true });

    const interactiveElements = document.querySelectorAll('a, button, .work-card');
    interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', () => cursorRing.classList.add('hover'));
      el.addEventListener('mouseleave', () => cursorRing.classList.remove('hover'));
    });

    // Scroll Progress + Navbar effect — single passive listener, rAF-batched
    const scrollProgress = document.getElementById('scrollProgress');
    const navbar = document.getElementById('navbar');
    let scrollTicking = false;

    function onScroll() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      scrollProgress.style.width = (docHeight > 0 ? (scrollTop / docHeight) * 100 : 0) + '%';
      if (scrollTop > 50) {
        navbar.classList.add('backdrop-blur-md', 'bg-dark/90');
      } else {
        navbar.classList.remove('backdrop-blur-md', 'bg-dark/90');
      }
      scrollTicking = false;
    }

    window.addEventListener('scroll', () => {
      if (!scrollTicking) {
        scrollTicking = true;
        requestAnimationFrame(onScroll);
      }
    }, { passive: true });

    // Mobile menu with focus trap
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileLinks = document.querySelectorAll('#mobile-menu a, #mobile-menu button');

    function openMobileMenu() {
      mobileMenu.setAttribute('aria-hidden', 'false');
      setTimeout(() => {
        const first = mobileMenu.querySelector('a, button');
        if (first) first.focus();
      }, 100);
    }

    function closeMobileMenu() {
      mobileMenu.setAttribute('aria-hidden', 'true');
      hamburger.focus();
    }

    hamburger.addEventListener('click', () => {
      const isOpen = mobileMenu.getAttribute('aria-hidden') === 'false';
      isOpen ? closeMobileMenu() : openMobileMenu();
    });

    mobileLinks.forEach(link => {
      link.addEventListener('click', closeMobileMenu);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileMenu.getAttribute('aria-hidden') === 'false') {
        closeMobileMenu();
      }
      if (e.key === 'Tab' && mobileMenu.getAttribute('aria-hidden') === 'false') {
        const focusable = mobileMenu.querySelectorAll('a, button');
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    });

    // Magnetic buttons
    const magneticBtns = document.querySelectorAll('.magnetic-btn');
    magneticBtns.forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'translate(0, 0)';
      });
    });

    // Portfolio filter
    const filterBtns = document.querySelectorAll('.filter-btn');
    const portfolioCards = document.querySelectorAll('.work-card');
    const filterStatus = document.getElementById('filter-status');

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => {
          b.classList.remove('active', 'bg-gold', 'text-dark');
          b.classList.add('border-2', 'border-white/20', 'text-white/70');
          b.setAttribute('aria-pressed', 'false');
        });
        btn.classList.add('active', 'bg-gold', 'text-dark');
        btn.classList.remove('border-2', 'border-white/20', 'text-white/70');
        btn.setAttribute('aria-pressed', 'true');

        const filter = btn.getAttribute('data-filter');
        let visibleCount = 0;

        portfolioCards.forEach(card => {
          const category = card.getAttribute('data-category') || '';
          if (filter === 'all' || category.includes(filter)) {
            card.classList.remove('hidden-filter');
            visibleCount++;
          } else {
            card.classList.add('hidden-filter');
          }
        });

        if (filterStatus) {
          filterStatus.textContent = `Showing ${visibleCount} project${visibleCount !== 1 ? 's' : ''} in ${filter === 'all' ? 'all categories' : filter}`;
        }
      });
    });

    document.querySelectorAll('.work-card').forEach(card => {
      const video = card.querySelector('video');
      if (!video) return;
      card.addEventListener('mouseenter', () => {
        video.currentTime = 0;
        video.play().catch(() => {});
      });
      card.addEventListener('mouseleave', () => {
        video.pause();
        video.currentTime = 0;
      });
    });

