// ============================================================
// SAPA — Enhancements (Dark Mode, Storage Sync, A11y, PWA)
// ============================================================

(function() {
  'use strict';

  // ============ THEME ============
  const Theme = {
    get() { return SAPA.DB.get('theme', 'auto'); },
    set(val) {
      SAPA.DB.set('theme', val);
      this.apply();
    },
    apply() {
      const pref = this.get();
      let actual = pref;
      if (pref === 'auto') {
        actual = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      document.documentElement.setAttribute('data-theme', actual);
      // Update meta theme-color
      const meta = document.querySelector('meta[name="theme-color"]');
      if (meta) meta.content = actual === 'dark' ? '#0F172A' : '#FFFFFF';
    },
    toggle() {
      const current = document.documentElement.getAttribute('data-theme');
      this.set(current === 'dark' ? 'light' : 'dark');
    }
  };
  window.Theme = Theme;
  Theme.apply();

  // Follow system theme changes if in 'auto' mode
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (Theme.get() === 'auto') Theme.apply();
  });

  // ============ STORAGE SYNC (cross-tab) ============
  window.addEventListener('storage', (e) => {
    if (!e.key || !e.key.startsWith('sapa_')) return;
    const key = e.key.replace('sapa_', '');
    // Refresh relevant UI tanpa full reload
    if (typeof renderNotifications === 'function') renderNotifications();
    if (typeof updateCartBadge === 'function') updateCartBadge();
    if (typeof renderUserInfo === 'function') renderUserInfo();
    // Toast notif kalau tema berubah dari tab lain
    if (key === 'theme') Theme.apply();
  });

  // ============ FOCUS TRAP untuk MODAL ============
  const FocusTrap = {
    active: null,
    activate(container) {
      this.deactivate();
      const focusables = container.querySelectorAll(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusables.length) return;
      this.active = {
        container,
        first: focusables[0],
        last: focusables[focusables.length - 1],
        prevFocus: document.activeElement
      };
      // Focus first element
      setTimeout(() => this.active?.first?.focus(), 50);
    },
    deactivate() {
      if (this.active?.prevFocus) {
        try { this.active.prevFocus.focus(); } catch {}
      }
      this.active = null;
    },
    handleKey(e) {
      if (!this.active || e.key !== 'Tab') return;
      const { first, last } = this.active;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };
  window.FocusTrap = FocusTrap;

  document.addEventListener('keydown', (e) => FocusTrap.handleKey(e));

  // Patch UI.modal untuk auto focus trap
  if (window.UI && UI.modal) {
    const originalModal = UI.modal;
    UI.modal = function(opts) {
      const result = originalModal.apply(this, arguments);
      FocusTrap.activate(result.element);
      const origClose = result.close;
      result.close = () => { FocusTrap.deactivate(); origClose(); };
      return result;
    };
  }

  // ============ ESC CLOSE (global) ============
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      // Close topmost modal/drawer
      const backdrops = document.querySelectorAll('.modal-backdrop.show, .drawer-backdrop.show, .search-modal-overlay.show');
      if (backdrops.length) {
        const last = backdrops[backdrops.length - 1];
        const closeBtn = last.querySelector('.modal-close');
        if (closeBtn) closeBtn.click();
      }
    }
  });

  // ============ GLOBAL SEARCH (Ctrl+K) ============
  function openGlobalSearch() {
    if (document.getElementById('globalSearchOverlay')) return;

    const overlay = document.createElement('div');
    overlay.id = 'globalSearchOverlay';
    overlay.className = 'search-modal-overlay';
    overlay.innerHTML = `
      <div class="search-modal" role="dialog" aria-label="Pencarian">
        <div class="search-modal-input-wrap">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input type="text" class="search-modal-input" id="globalSearchInput" placeholder="Cari layanan, matkul, produk, beasiswa..." autofocus>
          <button class="search-modal-close">ESC</button>
        </div>
        <div class="search-modal-results" id="globalSearchResults">
          <div class="search-no-result">Mulai mengetik untuk mencari...</div>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => overlay.classList.add('show'));

    const close = () => {
      overlay.classList.remove('show');
      document.body.style.overflow = '';
      setTimeout(() => overlay.remove(), 200);
    };

    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
    overlay.querySelector('.search-modal-close').onclick = close;

    const input = overlay.querySelector('#globalSearchInput');
    const results = overlay.querySelector('#globalSearchResults');

    input.addEventListener('input', () => {
      const q = input.value.trim().toLowerCase();
      if (!q) {
        results.innerHTML = '<div class="search-no-result">Mulai mengetik untuk mencari...</div>';
        return;
      }

      const groups = {};

      // Services
      const services = [
        { label: 'Isi KRS', icon: '📋', action: () => openKRS() },
        { label: 'Lihat KHS', icon: '📊', action: () => openKHS() },
        { label: 'Jadwal Kuliah', icon: '🗓️', action: () => openJadwal() },
        { label: 'Beasiswa', icon: '🎓', action: () => openBeasiswa() },
        { label: 'Surat Akademik', icon: '📄', action: () => openSurat() },
        { label: 'Perpustakaan', icon: '📚', action: () => openPerpus() },
        { label: 'Pembayaran UKT', icon: '💳', action: () => openUKT() },
        { label: 'Layanan Kesehatan', icon: '🏥', action: () => openKesehatan() }
      ];
      services.forEach(s => {
        if (s.label.toLowerCase().includes(q)) {
          groups['Layanan'] = groups['Layanan'] || [];
          groups['Layanan'].push(s);
        }
      });

      // Courses
      SAPA.KRS.getAvailable().forEach(c => {
        if (c.nama.toLowerCase().includes(q) || c.kode.toLowerCase().includes(q)) {
          groups['Mata Kuliah'] = groups['Mata Kuliah'] || [];
          groups['Mata Kuliah'].push({
            label: c.nama, sub: `${c.kode} · ${c.sks} SKS`,
            icon: '📖', action: () => openKRS()
          });
        }
      });

      // Products
      SAPA.Market.products().forEach(p => {
        if (p.nama.toLowerCase().includes(q)) {
          groups['Produk'] = groups['Produk'] || [];
          groups['Produk'].push({
            label: p.nama, sub: UI.formatRupiah(p.harga),
            icon: p.emoji, action: () => {
              SAPA.Market.addToCart(p.id);
              if (typeof updateCartBadge === 'function') updateCartBadge();
              UI.toast('Ditambahkan ke keranjang ✓', 'success');
            }
          });
        }
      });

      // Beasiswa
      SAPA.Beasiswa.list().forEach(b => {
        if (b.nama.toLowerCase().includes(q) || b.penyelenggara.toLowerCase().includes(q)) {
          groups['Beasiswa'] = groups['Beasiswa'] || [];
          groups['Beasiswa'].push({
            label: b.nama, sub: b.penyelenggara,
            icon: '🎓', action: () => openBeasiswa()
          });
        }
      });

      // Render
      const keys = Object.keys(groups);
      if (keys.length === 0) {
        results.innerHTML = `<div class="search-no-result">Tidak ada hasil untuk "<strong>${UI.escapeHTML(input.value)}</strong>"</div>`;
        return;
      }

      results.innerHTML = keys.map(k => `
        <div class="search-group">${UI.escapeHTML(k)}</div>
        ${groups[k].map((r, i) => `
          <div class="search-result" data-group="${UI.escapeHTML(k)}" data-idx="${i}">
            <div class="search-result-icon">${UI.escapeHTML(r.icon)}</div>
            <div class="search-result-info">
              <strong>${UI.escapeHTML(r.label)}</strong>
              ${r.sub ? `<span>${r.sub}</span>` : ''}
            </div>
          </div>
        `).join('')}
      `).join('');

      results.querySelectorAll('.search-result').forEach(el => {
        el.onclick = () => {
          const group = el.dataset.group;
          const idx = parseInt(el.dataset.idx);
          const item = groups[group][idx];
          close();
          setTimeout(() => item.action(), 150);
        };
      });
    });

    // Focus trap
    FocusTrap.activate(overlay.querySelector('.search-modal'));
    const origClose = close;
    const closeWrapper = () => { FocusTrap.deactivate(); origClose(); };
    overlay.querySelector('.search-modal-close').onclick = closeWrapper;
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closeWrapper(); });

    setTimeout(() => input.focus(), 100);
  }

  window.openGlobalSearch = openGlobalSearch;

  // Ctrl+K / Cmd+K anywhere
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      openGlobalSearch();
    }
    // "/" shortcut
    if (e.key === '/' && !['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName)) {
      e.preventDefault();
      openGlobalSearch();
    }
  });

  // ============ WISHLIST ============
  const Wishlist = {
    get() { return SAPA.DB.get('wishlist', []); },
    has(id) { return this.get().includes(id); },
    toggle(id) {
      const list = this.get();
      const idx = list.indexOf(id);
      if (idx >= 0) list.splice(idx, 1);
      else list.push(id);
      SAPA.DB.set('wishlist', list);
      return idx < 0; // true if added
    }
  };
  window.Wishlist = Wishlist;

  // ============ OFFLINE DETECTION ============
  function initOfflineBanner() {
    const banner = document.createElement('div');
    banner.className = 'offline-banner';
    banner.textContent = '⚠️ Kamu sedang offline. Beberapa fitur mungkin tidak tersedia.';
    document.body.appendChild(banner);

    const update = () => {
      banner.classList.toggle('show', !navigator.onLine);
    };
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    update();
  }

  // ============ GLOBAL ERROR HANDLER ============
  window.addEventListener('error', (e) => {
    console.error('[SAPA Error]', e.error);
    if (window.UI && UI.toast) {
      UI.toast('Terjadi kesalahan. Silakan refresh halaman.', 'error', 5000);
    }
  });

  window.addEventListener('unhandledrejection', (e) => {
    console.error('[SAPA Promise Error]', e.reason);
  });

  // ============ PWA ============
  let deferredInstallPrompt = null;

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
    // Show prompt after 30s
    if (!SAPA.DB.get('installPromptDismissed')) {
      setTimeout(() => showInstallPrompt(), 30000);
    }
  });

  function showInstallPrompt() {
    if (!deferredInstallPrompt || document.getElementById('installPrompt')) return;
    const prompt = document.createElement('div');
    prompt.id = 'installPrompt';
    prompt.className = 'install-prompt';
    prompt.innerHTML = `
      <div class="install-prompt-icon">📱</div>
      <div class="install-prompt-content">
        <strong>Install SAPA</strong>
        <p>Akses lebih cepat dari homescreen</p>
      </div>
      <div class="install-prompt-actions">
        <button class="btn-primary btn-sm" id="installBtn">Install</button>
        <button class="install-prompt-close" aria-label="Tutup">✕</button>
      </div>
    `;
    document.body.appendChild(prompt);
    requestAnimationFrame(() => prompt.classList.add('show'));

    prompt.querySelector('#installBtn').onclick = async () => {
      if (!deferredInstallPrompt) return;
      deferredInstallPrompt.prompt();
      const { outcome } = await deferredInstallPrompt.userChoice;
      deferredInstallPrompt = null;
      prompt.remove();
      if (outcome === 'accepted') {
        UI.toast('Terima kasih telah install SAPA! 🎉', 'success');
      }
    };
    prompt.querySelector('.install-prompt-close').onclick = () => {
      prompt.remove();
      SAPA.DB.set('installPromptDismissed', true);
    };
  }

  // Register service worker
  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').catch(err => {
        console.warn('SW registration failed:', err);
      });
    });
  }

  // ============ INIT ON DOM READY ============
  document.addEventListener('DOMContentLoaded', () => {
    initOfflineBanner();

    // Wire avatar dropdown
    setTimeout(() => {
      document.querySelectorAll('.avatar').forEach(avatar => {
        // Wrap avatar
        if (avatar.parentElement?.classList.contains('avatar-wrap')) return;
        const wrap = document.createElement('div');
        wrap.className = 'avatar-wrap';
        avatar.parentElement.insertBefore(wrap, avatar);
        wrap.appendChild(avatar);

        // Build menu
        const menu = document.createElement('div');
        menu.className = 'avatar-menu';
        menu.innerHTML = `
          <div class="avatar-menu-header">
            <strong>${SAPA.Auth.getUser()?.nama || 'Pengguna'}</strong>
            <span>${UI.escapeHTML(SAPA.Auth.getUser()?.npm || '')}</span>
          </div>
          <a href="profil.html" class="avatar-menu-item">👤 Profil Saya</a>
          <a href="pesanan.html" class="avatar-menu-item">📦 Pesanan Saya</a>
          <a href="pengaturan.html" class="avatar-menu-item">⚙️ Pengaturan</a>
          <div class="avatar-menu-divider"></div>
          <button class="avatar-menu-item danger" id="logoutMenuBtn">🚪 Logout</button>
        `;
        wrap.appendChild(menu);

        avatar.onclick = (e) => {
          e.preventDefault();
          e.stopPropagation();
          menu.classList.toggle('open');
        };

        document.addEventListener('click', (e) => {
          if (!wrap.contains(e.target)) menu.classList.remove('open');
        });

        menu.querySelector('#logoutMenuBtn').onclick = () => {
          UI.confirm('Yakin ingin logout?', () => SAPA.Auth.logout());
        };
      });
    }, 200);

    // Wire theme toggle buttons (if exist)
    document.querySelectorAll('.theme-toggle').forEach(btn => {
      btn.onclick = () => Theme.toggle();
    });

    // Wire search toggle to global search
    document.querySelectorAll('[aria-label="Cari"], .search-toggle').forEach(btn => {
      btn.onclick = openGlobalSearch;
    });
  });

})();