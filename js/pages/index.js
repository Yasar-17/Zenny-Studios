    // Hero Mouse-Following Gradient
    const heroGradient = document.getElementById('heroGradient');
    const heroSection = document.getElementById('hero');

    if (heroGradient && heroSection) {
      heroSection.addEventListener('mousemove', (e) => {
        const rect = heroSection.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        heroGradient.style.left = x + 'px';
        heroGradient.style.top = y + 'px';
        heroGradient.style.opacity = '1';
      });

      heroSection.addEventListener('mouseleave', () => {
        heroGradient.style.opacity = '0';
      });
    }

    // Interactive Words - Add slight movement on hover
    const interactiveWords = document.querySelectorAll('.interactive-word');
    interactiveWords.forEach(word => {
      word.addEventListener('mouseenter', () => {
        word.style.transform = 'translateY(-8px) scale(1.02)';
        word.style.color = '#F5C518';
        word.style.transition = 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
      });
      word.addEventListener('mouseleave', () => {
        word.style.transform = 'translateY(0) scale(1)';
        word.style.color = '';
      });
    });

    // Custom Cursor
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorRing = document.querySelector('.cursor-ring');

    let mouseX = 0, mouseY = 0;
    let ringX = 0, ringY = 0;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursorDot.style.left = mouseX - 4 + 'px';
      cursorDot.style.top = mouseY - 4 + 'px';
    });

    function animateRing() {
      ringX += (mouseX - ringX) * 0.15;
      ringY += (mouseY - ringY) * 0.15;
      cursorRing.style.left = ringX - 20 + 'px';
      cursorRing.style.top = ringY - 20 + 'px';
      requestAnimationFrame(animateRing);
    }
    animateRing();

    // Cursor hover effect on interactive elements
    const interactiveElements = document.querySelectorAll('a, button, .tilt-card, .group');
    interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', () => cursorRing.classList.add('hover'));
      el.addEventListener('mouseleave', () => cursorRing.classList.remove('hover'));
    });

    // Scroll Progress Bar
    const scrollProgress = document.getElementById('scrollProgress');
    window.addEventListener('scroll', () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      scrollProgress.style.width = scrollPercent + '%';
    });

    // Navbar scroll effect
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        navbar.classList.add('backdrop-blur-md', 'bg-dark/90');
      } else {
        navbar.classList.remove('backdrop-blur-md', 'bg-dark/90');
      }
    });

    // Mobile menu with focus trap
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileLinks = document.querySelectorAll('#mobile-menu a, #mobile-menu button');

    function openMobileMenu() {
      mobileMenu.setAttribute('aria-hidden', 'false');
      hamburger.classList.add('active');
      setTimeout(() => {
        const first = mobileMenu.querySelector('a, button');
        if (first) first.focus();
      }, 100);
    }

    function closeMobileMenu() {
      mobileMenu.setAttribute('aria-hidden', 'true');
      hamburger.classList.remove('active');
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

    // Magnetic Button Effect
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

    // Tilt Card Effect
    const tiltCards = document.querySelectorAll('.tilt-card');
    tiltCards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = (y - centerY) / 20;
        const rotateY = (centerX - x) / 20;
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
      });
    });

    // Parallax Effect on Scroll
    const parallaxLayers = document.querySelectorAll('.parallax-layer');
    window.addEventListener('scroll', () => {
      parallaxLayers.forEach(layer => {
        const speed = layer.getAttribute('data-speed') || 0.1;
        const y = window.scrollY * speed;
        layer.style.transform = `translateY(${y}px)`;
      });
    });

    // Stats count-up animation
    const statsSection = document.getElementById('stats');
    const statNumbers = document.querySelectorAll('.stat-number');
    let hasAnimated = false;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      statNumbers.forEach(stat => {
        stat.textContent = parseInt(stat.getAttribute('data-target'), 10).toLocaleString();
      });
    } else {
      const animateStats = () => {
        statNumbers.forEach(stat => {
          const target = parseInt(stat.getAttribute('data-target'));
          const duration = 2000;
          const increment = target / (duration / 16);
          let current = 0;

          const updateCount = () => {
            current += increment;
            if (current < target) {
              stat.textContent = Math.floor(current).toLocaleString();
              requestAnimationFrame(updateCount);
            } else {
              stat.textContent = target.toLocaleString();
            }
          };

          updateCount();
        });
      };

      const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !hasAnimated) {
            hasAnimated = true;
            animateStats();
          }
        });
      }, { threshold: 0.5 });

      statsObserver.observe(statsSection);
    }

    // Smooth reveal on scroll for text
    const revealElements = document.querySelectorAll('[data-aos]');
    revealElements.forEach(el => {
      el.style.willChange = 'transform, opacity';
    });
