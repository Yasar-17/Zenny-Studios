    const API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.protocol === 'file:')
      ? 'http://localhost:3000/api'
      : '/api';

    let enquiriesCache = [];
    let currentFilter = 'all';
    let currentSearch = '';
    let currentEnquiryId = null;
    let currentAdminEmail = '';

    function apiHeaders() {
      return { 'Content-Type': 'application/json' };
    }

    async function apiFetch(url, options = {}) {
      const res = await fetch(API_BASE + url, {
        ...options,
        credentials: 'include',
        headers: { ...apiHeaders(), ...options.headers },
      });

      if (res.status === 401) {
        const data = await res.json().catch(() => ({}));
        if (data.code === 'TOKEN_EXPIRED') {
          const refreshed = await refreshSession();
          if (refreshed) return apiFetch(url, options);
          showToast('Session expired. Please sign in again.', 'info');
        }
        clearSession();
        showView('loginView');
        throw new Error('Not authenticated');
      }

      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(error.error || 'Request failed');
      }

      return res.json();
    }

    async function refreshSession() {
      try {
        const data = await fetch(API_BASE + '/auth/refresh', {
          method: 'POST',
          credentials: 'include',
        }).then(r => r.ok ? r.json() : null);

        if (data) {
          currentAdminEmail = data.email;
          return true;
        }
      } catch (err) {
        // silent fail, will fall back to login
      }
      return false;
    }

    function clearSession() {
      currentAdminEmail = '';
      fetch(API_BASE + '/auth/logout', { method: 'POST', credentials: 'include' }).catch(() => {});
    }

    async function validateSession() {
      try {
        const data = await apiFetch('/auth/me');
        currentAdminEmail = data.email;
        return true;
      } catch (err) {
        return false;
      }
    }

    async function fetchEnquiries() {
      enquiriesCache = await apiFetch('/enquiries');
      return enquiriesCache;
    }

    function getEnquiries() {
      return enquiriesCache;
    }

    function showToast(message, type) {
      const toast = document.getElementById('toast');
      const colors = {
        success: 'bg-green-500/20 border-green-500/40 text-green-400',
        error: 'bg-red-500/20 border-red-500/40 text-red-400',
        info: 'bg-gold/20 border-gold/40 text-gold'
      };
      toast.className = `fixed bottom-6 right-6 z-[100] px-5 py-3 border text-sm rounded-none ${colors[type] || colors.info} toast`;
      toast.textContent = message;
      toast.classList.remove('hidden');
      setTimeout(() => {
        toast.classList.add('toast-out');
        setTimeout(() => toast.classList.add('hidden'), 300);
      }, 3000);
    }

    function showView(viewId) {
      document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
      document.getElementById(viewId).classList.add('active');
    }

    function formatDate(isoString) {
      const d = new Date(isoString);
      const now = new Date();
      const diff = now - d;
      const mins = Math.floor(diff / 60000);
      const hours = Math.floor(diff / 3600000);
      const days = Math.floor(diff / 86400000);

      if (mins < 1) return 'Just now';
      if (mins < 60) return `${mins}m ago`;
      if (hours < 24) return `${hours}h ago`;
      if (days < 7) return `${days}d ago`;
      return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined });
    }

    function formatFullDate(isoString) {
      return new Date(isoString).toLocaleString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }

    function isToday(isoString) {
      const d = new Date(isoString);
      const now = new Date();
      return d.toDateString() === now.toDateString();
    }

    function updateStats() {
      const enquiries = getEnquiries();
      const total = enquiries.length;
      const unread = enquiries.filter(e => !e.is_read).length;
      const read = total - unread;
      const today = enquiries.filter(e => isToday(e.date)).length;

      document.getElementById('statTotal').textContent = total;
      document.getElementById('statNew').textContent = unread;
      document.getElementById('statRead').textContent = read;
      document.getElementById('statToday').textContent = today;
    }

    function renderEnquiries() {
      const enquiries = getEnquiries();
      const container = document.getElementById('enquiriesList');
      const emptyState = document.getElementById('emptyState');

      let filtered = enquiries;

      if (currentFilter === 'unread') filtered = filtered.filter(e => !e.is_read);
      else if (currentFilter === 'read') filtered = filtered.filter(e => e.is_read);

      if (currentSearch) {
        const q = currentSearch.toLowerCase();
        filtered = filtered.filter(e =>
          e.name.toLowerCase().includes(q) ||
          e.email.toLowerCase().includes(q) ||
          e.phone.includes(q) ||
          (e.company && e.company.toLowerCase().includes(q)) ||
          (e.service && e.service.toLowerCase().includes(q)) ||
          e.message.toLowerCase().includes(q)
        );
      }

      if (filtered.length === 0) {
        container.innerHTML = '';
        emptyState.classList.remove('hidden');
        return;
      }

      emptyState.classList.add('hidden');

      container.innerHTML = filtered.map(e => `
        <div class="route bg-card border ${e.is_read ? 'border-white/10' : 'border-gold/30'} p-5 cursor-pointer group" role="button" tabindex="0" data-enquiry="${e.id}" aria-label="View enquiry from ${escapeHtml(e.name)}">
          <div class="flex items-start justify-between gap-4">
            <div class="flex items-start gap-4 min-w-0 flex-1">
              <div class="w-10 h-10 bg-gold/10 border border-gold/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span class="font-display text-gold text-lg">${escapeHtml(e.name.charAt(0).toUpperCase())}</span>
              </div>
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-3 mb-1">
                  <h3 class="text-white font-semibold text-base truncate ${e.is_read ? 'text-white/60' : 'text-white'}">${escapeHtml(e.name)}</h3>
                  ${!e.is_read ? '<span class="badge-new w-2 h-2 bg-gold rounded-full flex-shrink-0"></span>' : ''}
                </div>
                <p class="text-white/40 text-sm truncate">${escapeHtml(e.email)}</p>
                <p class="text-white/50 text-sm mt-2 line-clamp-1">${escapeHtml(e.message)}</p>
                <div class="flex items-center gap-3 mt-3">
                  ${e.service ? `<span class="text-gold/70 text-xs border border-gold/20 px-2 py-0.5">${escapeHtml(e.service)}</span>` : ''}
                  ${e.company ? `<span class="text-white/30 text-xs">${escapeHtml(e.company)}</span>` : ''}
                </div>
              </div>
            </div>
            <div class="text-right flex-shrink-0 relative z-10">
              <p class="text-white/30 text-xs">${formatDate(e.date)}</p>
              <svg class="arrow w-4 h-4 text-white/20 group-hover:text-gold transition-colors duration-300 mt-2 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
            </div>
          </div>
        </div>
      `).join('');
    }

    function escapeHtml(str) {
      if (!str) return '';
      const div = document.createElement('div');
      div.textContent = str;
      return div.innerHTML;
    }

    function viewEnquiry(id) {
      const enquiries = getEnquiries();
      const enquiry = enquiries.find(e => e.id === id);
      if (!enquiry) return;

      currentEnquiryId = id;

      if (!enquiry.is_read) {
        apiFetch('/enquiries/' + encodeURIComponent(id) + '/read', {
          method: 'PATCH'
        }).then(() => {
          enquiry.is_read = true;
          updateStats();
          renderEnquiries();
        }).catch(() => {});
      }

      const detailContent = document.getElementById('detailContent');

      const mailtoHref = 'mailto:' + enquiry.email + '?subject=' + encodeURIComponent('Re: Your enquiry at Zenny Studios');
      const phoneDigits = (enquiry.phone || '').replace(/[^\d]/g, '').replace(/^00/, '');
      const contactHref = phoneDigits ? 'https://wa.me/' + phoneDigits : 'tel:' + (enquiry.phone || '');

      detailContent.innerHTML = `
        <div class="mb-8">
          <p class="text-gold text-sm uppercase tracking-[0.3em] mb-3">Enquiry Details</p>
          <h2 class="font-display text-4xl sm:text-5xl md:text-6xl text-white leading-[0.9]">
            ${escapeHtml(enquiry.name)}
          </h2>
          <p class="text-white/40 text-sm mt-3">${formatFullDate(enquiry.date)}</p>
        </div>

        <div class="space-y-6">
          <div class="bg-card border border-white/10 p-6">
            <h3 class="text-gold text-xs uppercase tracking-[0.2em] mb-4">Contact Information</h3>
            <div class="grid sm:grid-cols-2 gap-6">
              <div>
                <p class="text-white/40 text-xs uppercase tracking-wider mb-1">Name</p>
                <p class="text-white text-base">${escapeHtml(enquiry.name)}</p>
              </div>
              <div>
                <p class="text-white/40 text-xs uppercase tracking-wider mb-1">Email</p>
                <a href="mailto:${escapeHtml(enquiry.email)}" class="text-gold hover:text-white transition-colors duration-300 text-base">${escapeHtml(enquiry.email)}</a>
              </div>
              <div>
                <p class="text-white/40 text-xs uppercase tracking-wider mb-1">Phone</p>
                <a href="tel:${escapeHtml(enquiry.phone)}" class="text-gold hover:text-white transition-colors duration-300 text-base">${escapeHtml(enquiry.phone)}</a>
              </div>
              ${enquiry.company ? `
              <div>
                <p class="text-white/40 text-xs uppercase tracking-wider mb-1">Company</p>
                <p class="text-white text-base">${escapeHtml(enquiry.company)}</p>
              </div>` : ''}
            </div>
          </div>

          ${enquiry.service ? `
          <div class="bg-card border border-white/10 p-6">
            <h3 class="text-gold text-xs uppercase tracking-[0.2em] mb-4">Service Interested In</h3>
            <span class="inline-block bg-gold/10 border border-gold/20 text-gold px-4 py-2 text-sm">${escapeHtml(enquiry.service)}</span>
          </div>` : ''}

          <div class="bg-card border border-white/10 p-6">
            <h3 class="text-gold text-xs uppercase tracking-[0.2em] mb-4">Message</h3>
            <p class="text-white/80 text-base leading-relaxed whitespace-pre-wrap">${escapeHtml(enquiry.message)}</p>
          </div>

          <div class="flex flex-col sm:flex-row gap-3 pt-4">
            <a href="${escapeHtml(mailtoHref)}" class="magnetic-btn group relative bg-gold text-dark font-display text-lg px-8 py-3 text-center overflow-hidden">
              <span class="relative z-10 flex items-center justify-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                Reply via Email
              </span>
              <div class="absolute inset-0 bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
            </a>
            <a href="${escapeHtml(contactHref)}" target="_blank" rel="noopener noreferrer" class="magnetic-btn group relative border-2 border-gold text-gold font-display text-lg px-8 py-3 text-center overflow-hidden">
              <span class="relative z-10 group-hover:text-dark transition-colors duration-300 flex items-center justify-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                Call / WhatsApp
              </span>
              <div class="absolute inset-0 bg-gold transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
            </a>
          </div>
        </div>
      `;

      showView('detailView');
      window.scrollTo(0, 0);
    }

    async function deleteEnquiry(id) {
      if (!confirm('Are you sure you want to delete this enquiry? This cannot be undone.')) return;
      try {
        await apiFetch('/enquiries/' + encodeURIComponent(id), { method: 'DELETE' });
        enquiriesCache = enquiriesCache.filter(e => e.id !== id);
        showToast('Enquiry deleted', 'success');
        updateStats();
        renderEnquiries();
        showView('dashboardView');
      } catch (err) {
        showToast(err.message || 'Failed to delete enquiry', 'error');
      }
    }

    function markAllRead() {
      apiFetch('/enquiries/read-all', { method: 'PATCH' }).then(() => {
        enquiriesCache.forEach(e => e.is_read = true);
        updateStats();
        renderEnquiries();
      }).catch(() => {});
    }

    document.getElementById('loginForm').addEventListener('submit', async function(e) {
      e.preventDefault();
      const email = document.getElementById('loginEmail').value.trim();
      const password = document.getElementById('loginPassword').value;
      const errorEl = document.getElementById('loginError');
      const submitBtn = this.querySelector('button[type="submit"]');

      submitBtn.disabled = true;
      submitBtn.textContent = 'Signing in...';

      try {
        const res = await fetch(API_BASE + '/auth/login', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (res.ok) {
          currentAdminEmail = data.email;
          errorEl.classList.add('hidden');
          document.getElementById('adminEmail').textContent = data.email;
          await fetchEnquiries();
          updateStats();
          renderEnquiries();
          showView('dashboardView');
          showToast('Welcome back!', 'success');
        } else {
          errorEl.textContent = data.error || 'Invalid email or password.';
          errorEl.classList.remove('hidden');
        }
      } catch (err) {
        errorEl.textContent = 'Unable to connect to server. Please try again.';
        errorEl.classList.remove('hidden');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Access Dashboard';
      }
    });

    document.getElementById('togglePassword').addEventListener('click', function() {
      const input = document.getElementById('loginPassword');
      const eyeIcon = document.getElementById('eyeIcon');
      const eyeOffIcon = document.getElementById('eyeOffIcon');
      if (input.type === 'password') {
        input.type = 'text';
        eyeIcon.classList.add('hidden');
        eyeOffIcon.classList.remove('hidden');
      } else {
        input.type = 'password';
        eyeIcon.classList.remove('hidden');
        eyeOffIcon.classList.add('hidden');
      }
    });

    document.getElementById('logoutBtn').addEventListener('click', async function() {
      clearSession();
      document.getElementById('loginForm').reset();
      showView('loginView');
      showToast('Logged out successfully', 'info');
    });

    document.getElementById('backToDashboard').addEventListener('click', function() {
      updateStats();
      renderEnquiries();
      showView('dashboardView');
    });

    document.getElementById('deleteEnquiryBtn').addEventListener('click', function() {
      if (currentEnquiryId) deleteEnquiry(currentEnquiryId);
    });

    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        currentFilter = this.dataset.filter;
        renderEnquiries();
      });
    });

    document.getElementById('searchInput').addEventListener('input', function() {
      currentSearch = this.value.trim();
      renderEnquiries();
    });

    document.getElementById('enquiriesList').addEventListener('click', function(e) {
      const row = e.target.closest('[data-enquiry]');
      if (!row) return;
      viewEnquiry(row.dataset.enquiry);
    });

    document.getElementById('enquiriesList').addEventListener('keydown', function(e) {
      const row = e.target.closest('[data-enquiry]');
      if (!row) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        viewEnquiry(row.dataset.enquiry);
      }
    });

    document.getElementById('markAllReadBtn').addEventListener('click', function() {
      const unreadCount = enquiriesCache.filter(e => !e.is_read).length;
      if (unreadCount === 0) {
        showToast('Nothing to mark â€” all caught up.', 'info');
        return;
      }
      markAllRead();
      showToast('Marked ' + unreadCount + ' as read', 'success');
    });

    (async function init() {
      const authenticated = await validateSession();
      if (authenticated) {
        document.getElementById('adminEmail').textContent = currentAdminEmail;
        try {
          await fetchEnquiries();
          updateStats();
          renderEnquiries();
          showView('dashboardView');
        } catch (err) {
          showView('loginView');
        }
      } else {
        showView('loginView');
      }
    })();

    // Re-init magnetic on dynamically rendered content
    const _origShowView = showView;
    showView = function(id) {
      _origShowView(id);
      initMagnetic(document.getElementById(id));
    };
