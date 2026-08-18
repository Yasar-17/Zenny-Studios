    // Custom Cursor
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorRing = document.querySelector('.cursor-ring');
    let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;

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

    const interactiveElements = document.querySelectorAll('a, button, input, textarea, select, .info-card, .faq-item');
    interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', () => cursorRing.classList.add('hover'));
      el.addEventListener('mouseleave', () => cursorRing.classList.remove('hover'));
    });

    // Scroll Progress
    const scrollProgress = document.getElementById('scrollProgress');
    window.addEventListener('scroll', () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      scrollProgress.style.width = (docHeight > 0 ? (scrollTop / docHeight) * 100 : 0) + '%';
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
        btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'translate(0, 0)';
      });
    });

    // Live working hours status (IST)
    (function () {
      const statusEl = document.getElementById('hoursStatus');
      const statusText = document.getElementById('hoursStatusText');
      if (!statusEl || !statusText) return;
      const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Kolkata',
        weekday: 'short',
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23'
      }).formatToParts(new Date());
      const value = (t) => (parts.find(p => p.type === t) || {}).value;
      const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(value('weekday'));
      const hour = Number(value('hour')) + Number(value('minute')) / 60;
      const isOpen = day >= 1 && day <= 5 && hour >= 10 && hour < 19;
      statusText.textContent = isOpen ? 'Open now' : 'Closed now';
      statusEl.classList.toggle('is-open', isOpen);
    })();

    // Form validation and submission
    const contactForm = document.getElementById('contactForm');
    const submitBtn = document.getElementById('submitBtn');
    const submitText = document.getElementById('submitText');
    const formStatus = document.getElementById('formStatus');

    function validateField(input) {
      const group = input.closest('.group');
      const errorMsg = group.querySelector('.error-message');
      const value = input.value.trim();

      if (!input.required) return true;

      let valid = true;
      if (!value) {
        valid = false;
      } else if (input.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        valid = false;
      } else if (input.type === 'tel' && value.length < 6) {
        valid = false;
      }

      input.setAttribute('aria-invalid', String(!valid));
      if (errorMsg) {
        if (valid) {
          errorMsg.classList.remove('visible');
          input.classList.remove('error');
          input.setAttribute('aria-describedby', '');
        } else {
          errorMsg.classList.add('visible');
          input.classList.add('error');
          input.setAttribute('aria-describedby', errorMsg.id);
        }
      }
      return valid;
    }

    document.querySelectorAll('#contactForm input[required], #contactForm textarea[required]').forEach(input => {
      input.addEventListener('blur', function() { validateField(this); });
      input.addEventListener('input', function() {
        if (this.getAttribute('aria-invalid') === 'true') validateField(this);
      });
    });

    contactForm.addEventListener('submit', async function(e) {
      e.preventDefault();

      
      const honeypot = document.getElementById('website');
      if (honeypot && honeypot.value) {
        return;
      }

      let allValid = true;
      document.querySelectorAll('#contactForm input[required], #contactForm textarea[required]').forEach(input => {
        if (!validateField(input)) allValid = false;
      });

      if (!allValid) {
        const firstError = document.querySelector('[aria-invalid="true"]');
        if (firstError) firstError.focus();
        formStatus.textContent = 'Please fill in all required fields correctly.';
        formStatus.className = 'text-red-400 text-sm text-center';
        return;
      }

      submitBtn.disabled = true;
      submitBtn.classList.add('opacity-80', 'cursor-not-allowed');
      submitText.textContent = 'Sending...';
      formStatus.textContent = 'Sending your message...';
      formStatus.className = 'text-gold text-sm text-center';

      // Two independent delivery channels, fired in parallel:
      //  1) FormSubmit email (browser → formsubmit.co/ajax/<studio inbox>)
      //  2) DB save via the Zenny API (browser → /api/enquiries → Supabase)
      // Promise.allSettled ensures a failing channel never blocks the other.
      async function submitViaFormSubmit(data) {
        const r = await fetch('https://formsubmit.co/ajax/zennysstudios@gmail.com', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({
            _subject: 'New enquiry from ' + (data.name || 'unknown') + ' \u2014 ' + (data.service || 'General'),
            _template: 'table',
            _captcha: 'false',
            name: data.name,
            email: data.email,
            phone: data.phone,
            company: data.company || '',
            service: data.service || '',
            message: data.message
          })
        });
        const json = await r.json().catch(() => null);
        if (!r.ok || !json || json.success !== 'true') {
          throw new Error('FormSubmit delivery failed');
        }
      }

      try {
        const API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.protocol === 'file:')
          ? 'http://localhost:3000/api'
          : '/api';

        const formData = {
          name: document.getElementById('name').value.trim(),
          email: document.getElementById('email').value.trim(),
          phone: document.getElementById('phone').value.trim(),
          company: document.getElementById('company').value.trim() || null,
          service: document.getElementById('service').value || null,
          message: document.getElementById('message').value.trim(),
        };

        const results = await Promise.allSettled([
          submitViaFormSubmit(formData),
          fetch(API_BASE + '/enquiries', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
          }).then(res => {
            if (!res.ok) throw new Error('Enquiry API rejected');
          }),
        ]);

        // Redirect as long as at least one channel delivered; show the error
        // state only when both failed.
        const anySucceeded = results.some(r => r.status === 'fulfilled');

        if (anySucceeded) {
          window.location.href = '/thank-you.html';
        } else {
          formStatus.textContent = 'Something went wrong. Please try again or email us directly.';
          formStatus.className = 'text-red-400 text-sm text-center';
          submitBtn.disabled = false;
          submitBtn.classList.remove('opacity-80', 'cursor-not-allowed');
          submitText.textContent = 'Send It \u2192';
        }
      } catch (err) {
        formStatus.textContent = 'Unable to connect. Please try again or email us directly.';
        formStatus.className = 'text-red-400 text-sm text-center';
        submitBtn.disabled = false;
        submitBtn.classList.remove('opacity-80', 'cursor-not-allowed');
        submitText.textContent = 'Send It \u2192';
      }
    });
