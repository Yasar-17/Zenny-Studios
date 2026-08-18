    const scrollProgress = document.getElementById('scrollProgress');
    window.addEventListener('scroll', () => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      scrollProgress.style.width = (window.scrollY / docHeight) * 100 + '%';
    });
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('backdrop-blur-md', window.scrollY > 50);
      navbar.classList.toggle('bg-dark/90', window.scrollY > 50);
    });
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileLinks = document.querySelectorAll('#mobile-menu a, #mobile-menu button');
    function openMobileMenu() { mobileMenu.setAttribute('aria-hidden', 'false'); }
    function closeMobileMenu() { mobileMenu.setAttribute('aria-hidden', 'true'); }
    hamburger.addEventListener('click', () => { const isOpen = mobileMenu.getAttribute('aria-hidden') === 'false'; isOpen ? closeMobileMenu() : openMobileMenu(); });
    mobileLinks.forEach(link => { link.addEventListener('click', closeMobileMenu); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && mobileMenu.getAttribute('aria-hidden') === 'false') { closeMobileMenu(); } });

    // Hero Mouse-Following Gradient
    const heroGradient = document.getElementById('heroGradient');
    const heroSection = document.getElementById('hero');
    if (heroGradient && heroSection) {
      heroSection.addEventListener('mousemove', (e) => {
        const rect = heroSection.getBoundingClientRect();
        heroGradient.style.left = (e.clientX - rect.left) + 'px';
        heroGradient.style.top = (e.clientY - rect.top) + 'px';
        heroGradient.style.opacity = '1';
      });
      heroSection.addEventListener('mouseleave', () => { heroGradient.style.opacity = '0'; });
    }

    // Parallax Effect on Scroll
    const parallaxLayers = document.querySelectorAll('.parallax-layer');
    window.addEventListener('scroll', () => {
      parallaxLayers.forEach(layer => {
        const speed = layer.getAttribute('data-speed') || 0.1;
        layer.style.transform = `translateY(${window.scrollY * speed}px)`;
      });
    });
