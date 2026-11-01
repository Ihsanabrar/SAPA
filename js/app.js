// ============================================================
// SAPA - UI Components + App Initialization
// ============================================================

const UI = {
  formatRupiah(n) { return 'Rp ' + n.toLocaleString('id-ID'); },
  escapeHTML(value) {
    return String(value ?? '').replace(/[&<>"']/g, char => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[char]);
  },
  formatTanggal(ts) { return new Date(ts).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }); },
  formatWaktu(ts) {
    const diff = Date.now() - ts;
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'Baru saja';
    if (m < 60) return `${m} menit lalu`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h} jam lalu`;
    const d = Math.floor(h / 24);
    return `${d} hari lalu`;
  },

  toast(message, type = 'info', duration = 3000) {
    let container = document.getElementById('toastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toastContainer';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    const icons = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' };
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<span class="toast-icon">${icons[type] || 'ℹ'}</span><span>${message}</span>`;
    container.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  },

  modal({ title, content, actions = [], size = 'md', onClose }) {
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    const actionsHtml = actions.map((a, i) =>
      `<button class="btn-primary btn-sm ${a.className || ''}" data-action="${i}">${a.label}</button>`
    ).join('');
    backdrop.innerHTML = `
      <div class="modal modal-${size}">
        <div class="modal-header"><h3>${title}</h3><button class="modal-close">✕</button></div>
        <div class="modal-body">${content}</div>
        ${actions.length ? `<div class="modal-footer">${actionsHtml}</div>` : ''}
      </div>
    `;
    document.body.appendChild(backdrop);
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => backdrop.classList.add('show'));

    const close = () => {
      backdrop.classList.remove('show');
      document.body.style.overflow = '';
      setTimeout(() => backdrop.remove(), 250);
      if (onClose) onClose();
    };
    backdrop.querySelector('.modal-close').onclick = close;
    backdrop.onclick = (e) => { if (e.target === backdrop) close(); };
    actions.forEach((a, i) => {
      const btn = backdrop.querySelector(`[data-action="${i}"]`);
      if (btn) btn.onclick = () => {
        if (a.onClick) a.onClick(close, backdrop);
        else close();
      };
    });
    return { close, element: backdrop };
  },

  drawer({ title, content, side = 'right', onClose }) {
    const backdrop = document.createElement('div');
    backdrop.className = 'drawer-backdrop';
    backdrop.innerHTML = `
      <div class="drawer drawer-${side}">
        <div class="drawer-header"><h3>${title}</h3><button class="modal-close">✕</button></div>
        <div class="drawer-body">${content}</div>
      </div>
    `;
    document.body.appendChild(backdrop);
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => backdrop.classList.add('show'));
    const close = () => {
      backdrop.classList.remove('show');
      document.body.style.overflow = '';
      setTimeout(() => backdrop.remove(), 250);
      if (onClose) onClose();
    };
    backdrop.querySelector('.modal-close').onclick = close;
    backdrop.onclick = (e) => { if (e.target === backdrop) close(); };
    return { close, element: backdrop };
  },

  confirm(message, onConfirm) {
    this.modal({
      title: 'Konfirmasi',
      size: 'sm',
      content: `<p style="padding: 8px 0;">${message}</p>`,
      actions: [
        { label: 'Batal', className: 'btn-ghost' },
        { label: 'Ya, Lanjutkan', onClick: (close) => { close(); onConfirm(); } }
      ]
    });
  }
};
window.UI = UI;

// ============ AUTH SCREEN ============
function showLoginScreen() {
  const existing = document.getElementById('loginScreen');
  if (existing) existing.remove();
  const screen = document.createElement('div');
  screen.id = 'loginScreen';
  screen.className = 'login-screen';
  screen.innerHTML = `
    <div class="login-card">
      <div class="login-brand">
        <div class="logo-mark" style="width:48px;height:48px;font-size:1.3rem;">S</div>
        <h1>SAPA<span style="color:var(--secondary);">.</span></h1>
      </div>
      <p class="login-sub">Sentral Aplikasi Pelayanan Akademik</p>
      <form id="loginForm" class="login-form">
        <div class="form-group">
          <label>Email</label>
          <input type="email" id="loginEmail" class="form-input" value="admin@gmail.com" required>
        </div>
        <div class="form-group">
          <label>Password</label>
          <input type="password" id="loginPassword" class="form-input" value="demo123" required>
        </div>
        <button type="submit" class="btn-primary" style="width:100%;justify-content:center;">Masuk</button>
      </form>
      <p class="login-hint">💡 Demo: gunakan kredensial di atas</p>
    </div>
  `;
  document.body.appendChild(screen);
  document.body.style.overflow = 'hidden';

  screen.querySelector('#loginForm').onsubmit = (e) => {
    e.preventDefault();
    const email = screen.querySelector('#loginEmail').value;
    const pass = screen.querySelector('#loginPassword').value;
    const result = SAPA.Auth.login(email, pass);
    if (result.ok) {
      screen.remove();
      document.body.style.overflow = '';
      UI.toast(`Selamat datang, ${result.user.nama.split(' ')[0]}!`, 'success');
      setTimeout(() => renderAll(), 100);
      initAppFeatures();
    } else {
      UI.toast(result.message, 'error');
    }
  };
}

// ============ RENDER HELPERS ============
function renderAll() {
  if (!SAPA.Auth.isLoggedIn()) return showLoginScreen();
  renderUserInfo();
  renderNotifications();
  renderNextClass();
  renderServices();
  renderProducts();
  renderNews();
  updateCartBadge();
  renderHeroNotifs();
}

function renderUserInfo() {
  const user = SAPA.Auth.getUser();
  if (!user) return;
  
  document.querySelectorAll('.avatar').forEach(el => {
    el.textContent = user.avatar || 'R';
    el.title = user.nama;
  });

  const cardHeader = document.querySelector('.student-card-header strong');
  if (cardHeader) cardHeader.textContent = user.nama;
  const cardSub = document.querySelector('.student-card-header span:not(.status-badge)');
  if (cardSub) cardSub.textContent = `${user.prodi} · ${user.angkatan}`;
  const avatarEl = document.querySelector('.student-avatar');
  if (avatarEl) avatarEl.textContent = user.avatar || 'R';
  
  const statValues = document.querySelectorAll('.mini-stat-value');
  if (statValues[0]) statValues[0].textContent = SAPA.KHS.getIPK(); // Panggil IPK dinamis
  if (statValues[1]) statValues[1].textContent = `${SAPA.KHS.getTotalSKS()}/${user.sksMaks || 144}`;
}

function renderNotifications() {
  const unread = SAPA.Notif.unreadCount();
  document.querySelectorAll('.notif-dot').forEach(el => {
    el.style.display = unread > 0 ? 'block' : 'none';
  });
  document.querySelectorAll('.notif-btn').forEach(btn => btn.onclick = showNotifPanel);
}

function renderHeroNotifs() {
  const container = document.getElementById('heroNotifs');
  if (!container) return;
  
  const notifs = SAPA.Notif.getAll().slice(0, 2); 
  
  if (notifs.length === 0) {
    container.style.display = 'none'; 
    return;
  }
  
  container.style.display = 'flex'; 
  container.innerHTML = notifs.map(n => `
    <div class="notif-item ${n.tipe === 'success' ? 'success' : 'warning'}">
      <span>${n.tipe === 'success' ? '✓' : '⏰'}</span> ${n.judul}
    </div>
  `).join('');
}

function renderNextClass() {
  const el = document.querySelector('.next-class strong');
  if (!el) return;
  const next = SAPA.Jadwal.nextClass();
  if (next) {
    el.textContent = `${next.nama} · ${next.jam.split('-')[0]} (${next.hari})`;
  } else {
    el.textContent = 'Belum ada jadwal';
  }
}

function renderServices() {
  document.querySelectorAll('.service-card').forEach(card => {
    card.onclick = (e) => {
      if (e.target.closest('button') || card.tagName === 'A') return;
      e.preventDefault();
      openServiceByTitle(card.querySelector('h3')?.textContent?.trim());
    };
  });
}

function openSellProductForm() {
  const modal = UI.modal({
    title: 'Jual produk', size: 'md',
    content: `
      <p class="seller-form-intro">Tambahkan produk atau jasa untuk ditawarkan di SAPA Market.</p>
      <form id="sellerProductForm">
        <div class="form-group">
          <label for="sellerProductName">Nama produk</label>
          <input class="form-input" id="sellerProductName" name="nama" minlength="3" maxlength="70" autocomplete="off" required>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="sellerProductCategory">Kategori</label>
            <select class="form-select" id="sellerProductCategory" name="kategori" required>
              <option value="">Pilih kategori</option><option>Merchandise</option><option>Buku</option>
              <option>Event</option><option>Kantin</option><option>Jasa</option><option>Lainnya</option>
            </select>
          </div>
          <div class="form-group">
            <label for="sellerProductPrice">Harga (Rp)</label>
            <input class="form-input" id="sellerProductPrice" name="harga" type="number" min="1" max="100000000" step="1" inputmode="numeric" required>
          </div>
        </div>
        <div class="form-group">
          <label for="sellerProductStock">Jumlah stok</label>
          <input class="form-input" id="sellerProductStock" name="stok" type="number" min="1" max="5000" step="1" inputmode="numeric" required>
        </div>
        <div class="form-group">
          <label for="sellerProductDescription">Deskripsi <span class="seller-optional">(opsional)</span></label>
          <textarea class="form-textarea" id="sellerProductDescription" name="deskripsi" maxlength="240" rows="3"></textarea>
        </div>
        <p class="seller-storage-note">Prototype SAPA: listing tersimpan di browser ini.</p>
        <p class="seller-form-error" id="sellerProductError" role="alert" hidden></p>
      </form>
    `,
    actions: [
      { label: 'Batal', className: 'btn-ghost' },
      { label: 'Tambahkan produk', onClick: (close, element) => {
        const form = element.querySelector('#sellerProductForm');
        if (!form.reportValidity()) return;
        const result = SAPA.Market.addProduct(Object.fromEntries(new FormData(form)));
        if (!result.ok) {
          const error = element.querySelector('#sellerProductError');
          error.textContent = result.message;
          error.hidden = false;
          return;
        }
        renderProducts();
        UI.toast('Produk ditambahkan ke SAPA Market.', 'success');
        close();
      }}
    ]
  });
  modal.element.querySelector('#sellerProductForm').addEventListener('submit', event => {
    event.preventDefault();
    modal.element.querySelector('[data-action="1"]').click();
  });
}

function renderProducts() {
  const grid = document.querySelector('.product-grid');
  if (!grid) return;
  const escape = UI.escapeHTML;
  const products = SAPA.Market.products();
  grid.innerHTML = products.map(p => `
    <div class="product-card" data-id="${escape(p.id)}">
      <div class="product-img" style="background: ${escape(p.warna)};">
        <button class="wishlist-btn ${window.Wishlist && Wishlist.has(p.id) ? 'active' : ''}" data-wishlist="${escape(p.id)}" aria-label="Simpan ${escape(p.nama)} ke wishlist">
          <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
        </button>
        ${escape(p.emoji || '📦')}
      </div>
      <span class="product-cat">${escape(p.kategori)}</span>
      <h4>${escape(p.nama)}</h4>
      <div class="product-price"><strong>${UI.formatRupiah(Number(p.harga) || 0)}</strong></div>
      <div class="product-seller">${escape(p.penjual || 'SAPA Market')} · Stok ${Number(p.stok) || 0}</div>
      ${p.deskripsi ? `<p class="product-description">${escape(p.deskripsi)}</p>` : ''}
      <button class="btn-add" data-id="${escape(p.id)}">+ Keranjang</button>
    </div>
  `).join('');

  grid.querySelectorAll('.btn-add').forEach(btn => {
    btn.onclick = () => {
      const result = SAPA.Market.addToCart(btn.dataset.id);
      if (!result.ok) return UI.toast(result.message, 'warning');
      updateCartBadge();
      UI.toast('Ditambahkan ke keranjang ✓', 'success');
      btn.textContent = '✓ Ditambahkan';
      setTimeout(() => btn.textContent = '+ Keranjang', 1500);
    };
  });
  if (window.Wishlist) {
    grid.querySelectorAll('[data-wishlist]').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const added = Wishlist.toggle(btn.dataset.wishlist);
        btn.classList.toggle('active', added);
        UI.toast(added ? 'Masuk Wishlist ❤️' : 'Dihapus dari Wishlist', 'success');
      };
    });
  }
}
function renderNews() {
  document.querySelectorAll('.news-item, .news-featured').forEach(el => {
    el.onclick = (e) => {
      e.preventDefault();
      UI.modal({
        title: el.querySelector('h3, h4')?.textContent?.trim() || 'Berita',
        content: `<p style="color:var(--text-muted);margin-bottom:16px;">Artikel lengkap akan segera tersedia.</p>`,
        actions: [{ label: 'Tutup' }]
      });
    };
  });
}

function updateCartBadge() {
  const badge = document.getElementById('cartBadge');
  if (badge) {
    const count = SAPA.Market.cartCount();
    badge.textContent = count;
    badge.style.display = count > 0 ? 'grid' : 'none';
  }
}

// ============ NOTIF PANEL ============
function showNotifPanel() {
  const notifs = SAPA.Notif.getAll();
  const content = notifs.length === 0
    ? `<div class="empty-state"><div class="empty-icon">🔔</div><p>Belum ada notifikasi</p></div>`
    : notifs.map(n => `
        <div class="notif-row ${n.dibaca ? '' : 'unread'}" data-id="${n.id}">
          <div class="notif-dot-icon notif-${n.tipe}"></div>
          <div class="notif-content">
            <strong>${n.judul}</strong>
            <p>${n.pesan}</p>
            <span class="notif-time">${UI.formatWaktu(n.waktu)}</span>
          </div>
        </div>
      `).join('');

  const drawer = UI.drawer({
    title: 'Notifikasi',
    content: `
      <div class="notif-panel-actions"><button class="btn-ghost btn-sm" id="markAllRead">Tandai dibaca</button></div>
      <div class="notif-list">${content}</div>
    `
  });

  setTimeout(() => {
    const markAll = drawer.element.querySelector('#markAllRead');
    if (markAll) markAll.onclick = () => {
      SAPA.Notif.markAllRead();
      renderNotifications();
      drawer.close();
    };
    drawer.element.querySelectorAll('.notif-row').forEach(row => {
      row.onclick = () => {
        SAPA.Notif.markRead(row.dataset.id);
        renderNotifications();
        row.classList.remove('unread');
      };
    });
  }, 50);
}

// ============ SERVICE DISPATCHER ============
function openServiceByTitle(title) {
  const map = {
    'Isi KRS': openKRS, 'Lihat KHS': openKHS, 'Jadwal Kuliah': openJadwal,
    'Beasiswa': openBeasiswa, 'Surat Akademik': openSurat, 'Perpustakaan': openPerpus,
    'Pembayaran UKT': openUKT, 'Layanan Kesehatan': openKesehatan
  };
  if (map[title]) map[title]();
  else UI.toast(`Layanan "${title}" akan segera hadir`, 'info');
}

// ============ MODUL: KRS ============
function openKRS() {
  const courses = SAPA.KRS.getAvailable();
  const status = SAPA.KRS.getStatus();

  const content = `
    <div class="krs-header">
      <div class="krs-info">
        <span class="badge badge-${status === 'submitted' ? 'success' : 'info'}">
          Status: ${status === 'submitted' ? 'Sudah Diajukan' : 'Draft'}
        </span>
        <div class="krs-sks">
          <span class="krs-sks-value">${SAPA.KRS.totalSKS()}</span>
          <span class="krs-sks-label">/ 24 SKS</span>
        </div>
      </div>
      <p style="font-size:.85rem;color:var(--text-muted);margin-top:8px;">Centang matkul yang ingin diambil.</p>
    </div>
    <div class="krs-tabs">
      <button class="krs-tab active" data-cat="all">Semua</button>
      <button class="krs-tab" data-cat="Wajib">Wajib</button>
      <button class="krs-tab" data-cat="Pilihan">Pilihan</button>
    </div>
    <div class="krs-list" id="krsList">
      ${renderKRSList(courses, SAPA.KRS.getDraft(), 'all')}
    </div>
  `;

  const modal = UI.modal({
    title: 'Isi KRS Semester Genap 2025/2026',
    size: 'lg',
    content,
    actions: [
      { label: 'Batal' },
      { label: status === 'submitted' ? 'Reset KRS' : 'Ajukan KRS', onClick: (close) => {
        if (SAPA.KRS.getStatus() === 'submitted') {
          UI.confirm('Reset KRS ke draft?', () => {
            SAPA.KRS.reset();
            close();
            UI.toast('KRS direset', 'info');
            renderNextClass();
            renderUserInfo();
          });
        } else {
          // BUG FIX: Cek data terbaru langsung dari storage
          const currentDraft = SAPA.KRS.getDraft();
          if (currentDraft.length === 0) { 
            UI.toast('Pilih minimal 1 matkul dulu', 'warning'); 
            return; 
          }
          
          const res = SAPA.KRS.submit();
          if (res.ok) {
            UI.toast('KRS berhasil diajukan! ✓', 'success');
            close();
            renderNotifications();
            renderNextClass();
            renderUserInfo();
          } else {
            UI.toast(res.message, 'error');
          }
        }
      }}
    ]
  });

  modal.element.querySelectorAll('.krs-tab').forEach(tab => {
    tab.onclick = () => {
      modal.element.querySelectorAll('.krs-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      modal.element.querySelector('#krsList').innerHTML = renderKRSList(courses, SAPA.KRS.getDraft(), tab.dataset.cat);
      bindKRSItems(modal);
    };
  });
  bindKRSItems(modal);
}

function renderKRSList(courses, draft, cat) {
  const filtered = cat === 'all' ? courses : courses.filter(c => c.kategori === cat);
  if (filtered.length === 0) return `<div class="empty-state"><div class="empty-icon">📚</div><p>Tidak ada matkul</p></div>`;
  
  return filtered.map(c => {
    const isIn = draft.includes(c.id);
    const full = c.terisi >= c.kuota;
    return `
      <label class="krs-item ${isIn ? 'selected' : ''} ${full ? 'disabled' : ''}">
        <input type="checkbox" data-id="${c.id}" ${isIn ? 'checked' : ''} ${full ? 'disabled' : ''}>
        <div class="krs-item-info">
          <strong>${c.nama}</strong>
          <span class="krs-meta">${c.kode} · ${c.sks} SKS · ${c.dosen}</span>
          <span class="krs-meta">📅 ${c.hari} ${c.jam} · 📍 ${c.ruang}</span>
        </div>
        <div class="krs-item-badge">
          ${full ? '<span class="badge badge-danger">Penuh</span>' :
            isIn ? '<span class="badge badge-success">✓ Dipilih</span>' :
            `<span class="badge badge-info">${c.terisi}/${c.kuota}</span>`}
        </div>
      </label>
    `;
  }).join('');
}

function bindKRSItems(modal) {
  modal.element.querySelectorAll('.krs-item input[type="checkbox"]').forEach(cb => {
    cb.onchange = () => {
      const id = cb.dataset.id;
      if (cb.checked) {
        const res = SAPA.KRS.add(id);
        if (!res.ok) {
          cb.checked = false;
          UI.toast(res.message, 'error');
          return;
        }
        UI.toast('Ditambahkan ✓', 'success');
      } else {
        SAPA.KRS.remove(id);
      }
      const sksEl = modal.element.querySelector('.krs-sks-value');
      if (sksEl) sksEl.textContent = SAPA.KRS.totalSKS();
      
      const label = cb.closest('.krs-item');
      const badge = label.querySelector('.krs-item-badge');
      const course = SAPA.KRS.getAvailable().find(c => c.id === id);
      if (cb.checked) {
        label.classList.add('selected');
        if (badge) badge.innerHTML = '<span class="badge badge-success">✓ Dipilih</span>';
      } else {
        label.classList.remove('selected');
        if (badge && course) badge.innerHTML = `<span class="badge badge-info">${course.terisi}/${course.kuota}</span>`;
      }
    };
  });
}

// ============ MODUL: KHS ============
function openKHS() {
  const all = SAPA.KHS.getAll();
  const ipk = SAPA.KHS.getIPK();
  const totalSKS = SAPA.KHS.getTotalSKS();
  const totalMutu = SAPA.KHS.getTotalMutu();

  if (all.length === 0) {
    return UI.modal({
      title: 'Kartu Hasil Studi',
      size: 'md',
      content: `<div class="empty-state" style="padding:40px 20px;"><div class="empty-icon" style="font-size:3rem;">📊</div><h3>Belum Ada Nilai</h3><p>Kamu belum memiliki riwayat nilai semester sebelumnya.</p></div>`,
      actions: [{ label: 'Tutup' }]
    });
  }

  const content = `
    <div class="khs-summary">
      <div class="khs-stat"><span>IPK Kumulatif</span><strong>${ipk}</strong></div>
      <div class="khs-stat"><span>Total SKS</span><strong>${totalSKS}</strong></div>
      <div class="khs-stat"><span>Total Mutu</span><strong>${totalMutu.toFixed(1)}</strong></div>
    </div>
    <div class="khs-semesters">
      ${all.slice().reverse().map(sm => `
        <details class="khs-semester" ${sm === all[all.length-1] ? 'open' : ''}>
          <summary><div><strong>Semester ${sm.semester}</strong><span class="khs-summary-meta">${sm.sks} SKS · IP ${sm.ip.toFixed(2)}</span></div><span class="khs-chevron">▾</span></summary>
          <table class="data-table">
            <thead><tr><th>Kode</th><th>Mata Kuliah</th><th>SKS</th><th>Nilai</th><th>Mutu</th></tr></thead>
            <tbody>${sm.mk.map(m => `<tr><td>${m.kode}</td><td>${m.nama}</td><td>${m.sks}</td><td><span class="badge badge-${m.nilai.startsWith('A') ? 'success' : 'info'}">${m.nilai}</span></td><td>${(m.mutu * m.sks).toFixed(1)}</td></tr>`).join('')}</tbody>
          </table>
        </details>
      `).join('')}
    </div>
  `;
  UI.modal({ title: 'Kartu Hasil Studi', size: 'lg', content, actions: [{ label: 'Tutup' }] });
}

// ============ MODUL: JADWAL ============
function openJadwal() {
  const byHari = SAPA.Jadwal.byHari();
  const days = ['Senin','Selasa','Rabu','Kamis','Jumat'];
  
  if (SAPA.Jadwal.getAll().length === 0) {
    return UI.modal({
      title: 'Jadwal Kuliah',
      size: 'md',
      content: `<div class="empty-state" style="padding:40px 20px;"><div class="empty-icon" style="font-size:3rem;">🗓️</div><h3>Belum Ada Jadwal</h3><p>Silakan isi KRS terlebih dahulu untuk melihat jadwal kuliahmu.</p><button class="btn-primary" style="margin-top:16px;" onclick="this.closest('.modal-backdrop').querySelector('.modal-close').click(); setTimeout(openKRS, 300)">Isi KRS Sekarang</button></div>`,
      actions: [{ label: 'Tutup' }]
    });
  }

  const content = `
    <div class="jadwal-grid">
      ${days.map(d => `
        <div class="jadwal-col">
          <div class="jadwal-day">${d}</div>
          ${byHari[d] && byHari[d].length ? byHari[d].sort((a,b) => a.jam.localeCompare(b.jam)).map(c => `
            <div class="jadwal-card">
              <div class="jadwal-time">${c.jam}</div>
              <strong>${c.nama}</strong>
              <span class="jadwal-meta">${c.ruang}</span>
            </div>
          `).join('') : '<div class="jadwal-empty">Kosong</div>'}
        </div>
      `).join('')}
    </div>
  `;
  UI.modal({ title: 'Jadwal Kuliah Mingguan', size: 'lg', content, actions: [{ label: 'Tutup' }] });
}

// ============ MODUL: BEASISWA ============
function openBeasiswa() {
  const list = SAPA.Beasiswa.list();
  const applied = SAPA.Beasiswa.getApplied();

  const content = `
    ${applied.length ? `
      <div class="applied-section">
        <h4>📋 Pengajuan Saya (${applied.length})</h4>
        ${applied.map(a => `<div class="applied-item"><div><strong>${a.nama}</strong><span class="applied-date">${UI.formatTanggal(a.tanggal)}</span></div><span class="badge badge-warning">${a.status}</span></div>`).join('')}
      </div>
    ` : ''}
    <h4 style="margin:16px 0 12px;">🎓 Beasiswa Tersedia</h4>
    <div class="beasiswa-list">
      ${list.map(b => {
        const isApplied = SAPA.Beasiswa.isApplied(b.id);
        const daysLeft = Math.ceil((new Date(b.deadline) - Date.now()) / 86400000);
        return `
          <div class="beasiswa-card">
            <div class="beasiswa-header">
              <div><h4>${b.nama}</h4><p class="beasiswa-penyelenggara">${b.penyelenggara}</p></div>
              ${daysLeft <= 7 ? `<span class="badge badge-warning">${daysLeft} hari lagi</span>` : `<span class="badge badge-success">Dibuka</span>`}
            </div>
            <p class="beasiswa-desc">${b.deskripsi}</p>
            <div class="beasiswa-meta"><span>💰 ${b.nominal}</span><span>📅 ${new Date(b.deadline).toLocaleDateString('id-ID')}</span></div>
            <button class="btn-primary btn-sm" data-apply="${b.id}" ${isApplied ? 'disabled' : ''}>${isApplied ? '✓ Sudah Diajukan' : 'Daftar Sekarang'}</button>
          </div>
        `;
      }).join('')}
    </div>
  `;

  const modal = UI.modal({ title: 'Beasiswa', size: 'lg', content, actions: [{ label: 'Tutup' }] });
  modal.element.querySelectorAll('[data-apply]').forEach(btn => {
    btn.onclick = () => {
      const id = btn.dataset.apply;
      const b = list.find(x => x.id === id);
      UI.modal({
        title: 'Konfirmasi Pendaftaran',
        size: 'sm',
        content: `<p>Yakin ingin mendaftar <strong>${b.nama}</strong>?</p>`,
        actions: [
          { label: 'Batal' },
          { label: 'Kirim', onClick: (close) => {
            const res = SAPA.Beasiswa.apply(id);
            if (res.ok) {
              UI.toast('Pendaftaran berhasil ✓', 'success');
              close(); modal.close(); setTimeout(openBeasiswa, 200); renderNotifications();
            } else { UI.toast(res.message, 'error'); }
          }}
        ]
      });
    };
  });
}

// ============ MODUL: SURAT ============
function openSurat() {
  const list = SAPA.Surat.list();
  const content = `
    <form id="suratForm" class="surat-form">
      <div class="form-group"><label>Jenis Surat</label><select class="form-select" id="suratJenis" required><option value="">-- Pilih --</option>${SAPA.Surat.types.map(t => `<option value="${t}">${t}</option>`).join('')}</select></div>
      <div class="form-group"><label>Keperluan</label><textarea class="form-textarea" id="suratKeperluan" rows="3" required></textarea></div>
      <button type="submit" class="btn-primary" style="width:100%;justify-content:center;">Ajukan Surat</button>
    </form>
    ${list.length ? `<div class="surat-history"><h4>📄 Riwayat</h4>${list.map(s => `<div class="surat-item"><div><strong>${s.jenis}</strong><p class="surat-keperluan">${s.keperluan}</p><span class="surat-date">${UI.formatTanggal(s.tanggal)}</span></div><span class="badge badge-warning">${s.status}</span></div>`).join('')}</div>` : ''}
  `;
  const modal = UI.modal({ title: 'Surat Akademik', size: 'md', content, actions: [{ label: 'Tutup' }] });
  modal.element.querySelector('#suratForm').onsubmit = (e) => {
    e.preventDefault();
    const jenis = modal.element.querySelector('#suratJenis').value;
    const keperluan = modal.element.querySelector('#suratKeperluan').value;
    const res = SAPA.Surat.submit(jenis, keperluan);
    if (res.ok) { UI.toast('Surat diajukan ✓', 'success'); modal.close(); renderNotifications(); setTimeout(openSurat, 200); }
    else { UI.toast(res.message, 'error'); }
  };
}

// ============ MODUL: PERPUSTAKAAN ============
const BOOKS = [
  { id: 'bk1', judul: 'Clean Code', penulis: 'Robert C. Martin', tahun: 2008, tersedia: true },
  { id: 'bk2', judul: 'Introduction to Algorithms', penulis: 'Cormen et al.', tahun: 2009, tersedia: true },
  { id: 'bk3', judul: 'Design Patterns', penulis: 'Gang of Four', tahun: 1994, tersedia: false }
];
function openPerpus() {
  const borrowed = SAPA.DB.get('borrowedBooks', []);
  const content = `
    ${borrowed.length ? `<div class="borrowed-section"><h4>📚 Dipinjam</h4>${borrowed.map(b => `<div class="borrowed-item"><div><strong>${b.judul}</strong><span class="surat-date">Kembali: ${UI.formatTanggal(b.tanggal + 14*86400000)}</span></div><button class="btn-ghost btn-sm" data-return="${b.id}">Kembalikan</button></div>`).join('')}</div>` : ''}
    <h4 style="margin:16px 0 12px;">📖 Katalog</h4>
    <div class="book-list">
      ${BOOKS.map(b => {
        const isBorrowed = borrowed.some(x => x.id === b.id);
        return `<div class="book-item"><div class="book-emoji">📕</div><div class="book-info"><strong>${b.judul}</strong><span class="book-meta">${b.penulis}</span><span class="badge badge-${b.tersedia ? 'success' : 'danger'}" style="width:fit-content;margin-top:4px;">${b.tersedia ? 'Tersedia' : 'Dipinjam'}</span></div><button class="btn-primary btn-sm" data-borrow="${b.id}" ${!b.tersedia || isBorrowed ? 'disabled' : ''}>${isBorrowed ? '✓ Dipinjam' : b.tersedia ? 'Pinjam' : 'Kosong'}</button></div>`;
      }).join('')}
    </div>
  `;
  const modal = UI.modal({ title: 'Perpustakaan', size: 'lg', content, actions: [{ label: 'Tutup' }] });
  modal.element.querySelectorAll('[data-borrow]').forEach(btn => {
    btn.onclick = () => {
      const book = BOOKS.find(b => b.id === btn.dataset.borrow);
      const list = SAPA.DB.get('borrowedBooks', []);
      list.push({ id: book.id, judul: book.judul, tanggal: Date.now() });
      SAPA.DB.set('borrowedBooks', list);
      UI.toast('Buku dipinjam ✓', 'success'); modal.close(); renderNotifications(); setTimeout(openPerpus, 200);
    };
  });
  modal.element.querySelectorAll('[data-return]').forEach(btn => {
    btn.onclick = () => {
      SAPA.DB.set('borrowedBooks', SAPA.DB.get('borrowedBooks', []).filter(b => b.id !== btn.dataset.return));
      UI.toast('Buku dikembalikan ✓', 'success'); modal.close(); setTimeout(openPerpus, 200);
    };
  });
}

// ============ MODUL: UKT ============
function openUKT() {
  const user = SAPA.Auth.getUser();
  const content = `
    <div class="ukt-card">
      <div class="ukt-header"><span>Tagihan Semester Genap</span><span class="badge badge-warning">Belum Dibayar</span></div>
      <div class="ukt-amount">Rp 5.000.000</div>
      <div class="ukt-detail">
        <div><span>Nama</span><strong>${user.nama}</strong></div>
        <div><span>NPM</span><strong>${user.npm}</strong></div>
        <div><span>Jatuh Tempo</span><strong>15 Desember 2025</strong></div>
      </div>
      <button class="btn-primary" id="payBtn" style="width:100%;justify-content:center;margin-top:16px;">Bayar Sekarang</button>
    </div>
  `;
  const modal = UI.modal({ title: 'Pembayaran UKT', size: 'md', content, actions: [{ label: 'Tutup' }] });
  modal.element.querySelector('#payBtn').onclick = () => {
    UI.confirm('Bayar UKT sebesar Rp 5.000.000?', () => {
      SAPA.Notif.add('Pembayaran UKT Berhasil', 'UKT semester genap telah dibayar.', 'success');
      renderNotifications(); UI.toast('Pembayaran berhasil ✓', 'success'); modal.close();
    });
  };
}

// ============ MODUL: KESEHATAN ============
function openKesehatan() {
  const content = `
    <div class="health-card">
      <p>Layanan kesehatan kampus tersedia untuk mahasiswa.</p>
      <div class="form-group" style="margin-top:16px;"><label>Keluhan</label><textarea class="form-textarea" id="healthComplaint" rows="3"></textarea></div>
      <div class="form-group"><label>Jadwal</label><select class="form-select" id="healthSlot"><option>Senin, 10:00</option><option>Rabu, 09:00</option></select></div>
    </div>
  `;
  const modal = UI.modal({
    title: 'Klinik Kampus', size: 'md', content,
    actions: [
      { label: 'Batal' },
      { label: 'Booking', onClick: (close, m) => {
        const complaint = m.querySelector('#healthComplaint').value;
        const slot = m.querySelector('#healthSlot').value;
        if (!complaint.trim()) { UI.toast('Isi keluhan', 'warning'); return; }
        SAPA.Notif.add('Booking Klinik', `Jadwal: ${slot}`, 'success');
        renderNotifications(); UI.toast('Konsultasi dibooking ✓', 'success'); close();
      }}
    ]
  });
}

// ============ CART DRAWER ============
function openCart() {
  const cart = SAPA.Market.getCart();
  const products = SAPA.Market.products();

  if (cart.length === 0) {
    return UI.modal({
      title: 'Keranjang', size: 'sm',
      content: `<div class="empty-state"><div class="empty-icon">🛒</div><p>Keranjang kosong</p></div>`,
      actions: [{ label: 'Tutup' }]
    });
  }

  const content = `
    <div class="cart-list">
      ${cart.map(item => {
        const p = products.find(x => x.id === item.id);
        if (!p) return '';
        return `<div class="cart-item"><div class="cart-item-img" style="background:${UI.escapeHTML(p.warna)};">${UI.escapeHTML(p.emoji)}</div><div class="cart-item-info"><strong>${UI.escapeHTML(p.nama)}</strong><span>${UI.formatRupiah(p.harga)}</span></div><div class="cart-item-qty"><button data-qty="${UI.escapeHTML(item.id)}" data-dir="-1">−</button><span>${item.qty}</span><button data-qty="${UI.escapeHTML(item.id)}" data-dir="1">+</button></div><button class="cart-remove" data-remove="${UI.escapeHTML(item.id)}">✕</button></div>`;
      }).join('')}
    </div>
    <div class="cart-total"><span>Total</span><strong>${UI.formatRupiah(SAPA.Market.cartTotal())}</strong></div>
  `;

  const drawer = UI.drawer({ title: 'Keranjang', content: content + `<div class="cart-checkout"><button class="btn-primary" id="checkoutBtn" style="width:100%;justify-content:center;">Checkout</button></div>` });

  setTimeout(() => {
    drawer.element.querySelectorAll('[data-qty]').forEach(btn => {
      btn.onclick = () => {
        const item = SAPA.Market.getCart().find(i => i.id === btn.dataset.qty);
        SAPA.Market.updateQty(btn.dataset.qty, item.qty + parseInt(btn.dataset.dir));
        updateCartBadge(); drawer.close(); setTimeout(openCart, 100);
      };
    });
    drawer.element.querySelectorAll('[data-remove]').forEach(btn => {
      btn.onclick = () => { SAPA.Market.removeFromCart(btn.dataset.remove); updateCartBadge(); drawer.close(); setTimeout(openCart, 100); };
    });
    drawer.element.querySelector('#checkoutBtn').onclick = () => {
      const res = SAPA.Market.checkout();
      if (res.ok) {
        drawer.close(); updateCartBadge(); renderNotifications();
        UI.modal({
          title: '✅ Pesanan Berhasil', size: 'sm',
          content: `<div class="empty-state"><div class="empty-icon">🎉</div><h3>Terima kasih!</h3><p>Order ID: <strong>${res.order.id}</strong></p><p>Total: <strong>${UI.formatRupiah(res.order.total)}</strong></p></div>`,
          actions: [{ label: 'Selesai' }]
        });
      } else { UI.toast(res.message, 'error'); }
    };
  }, 50);
}

// ============ GLOBAL SEARCH ============
function initSearch() {
  const input = document.getElementById('heroSearch');
  const box = document.getElementById('searchSuggestions');
  if (!input || !box) return;

  function searchAll(query) {
    if (!query) return [];
    const q = query.toLowerCase();
    const results = [];
    SAPA.KRS.getAvailable().forEach(c => { if (c.nama.toLowerCase().includes(q)) results.push({ type: 'Matkul', label: c.nama, action: openKRS }); });
    SAPA.Beasiswa.list().forEach(b => { if (b.nama.toLowerCase().includes(q)) results.push({ type: 'Beasiswa', label: b.nama, action: openBeasiswa }); });
    SAPA.Market.products().forEach(p => { if (p.nama.toLowerCase().includes(q)) results.push({ type: 'Produk', label: p.nama, action: () => { SAPA.Market.addToCart(p.id); updateCartBadge(); UI.toast('Masuk keranjang ✓', 'success'); } }); });
    return results.slice(0, 8);
  }

  let currentResults = [];
  input.addEventListener('input', (e) => {
    const q = e.target.value.trim();
    if (!q) { box.classList.remove('active'); return; }
    currentResults = searchAll(q);
    box.innerHTML = currentResults.length === 0 ? `<div class="search-empty">Tidak ditemukan</div>` : currentResults.map((r, i) => `<a href="#" class="search-item" data-idx="${i}"><span class="search-type">${UI.escapeHTML(r.type)}</span><span>${UI.escapeHTML(r.label)}</span></a>`).join('');
    box.classList.add('active');
    box.querySelectorAll('.search-item').forEach(item => {
      item.onclick = (e) => { e.preventDefault(); const r = currentResults[parseInt(item.dataset.idx)]; if (r) r.action(); box.classList.remove('active'); input.value = ''; };
    });
  });
  document.addEventListener('click', (e) => { if (!e.target.closest('.hero-search')) box.classList.remove('active'); });
}

// ============ INIT ============

function initAppFeatures() {
  initSearch();

  const cartBtn = document.getElementById('cartBtn');
  if (cartBtn) cartBtn.onclick = openCart;

  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  if (hamburger && navLinks) hamburger.onclick = () => navLinks.classList.toggle('open');

  document.querySelectorAll('.hero-tags a').forEach(a => {
    a.onclick = (e) => {
      e.preventDefault();
      const text = a.textContent.trim();
      if (text.includes('KRS')) openKRS();
      else if (text.includes('KHS')) openKHS();
      else if (text.includes('Jaket')) { SAPA.Market.addToCart('p1'); updateCartBadge(); UI.toast('Masuk keranjang ✓', 'success'); }
      else if (text.includes('Beasiswa')) openBeasiswa();
    };
  });

  const help = document.getElementById('floatingHelp');
  if (help) help.onclick = () => UI.modal({ title: 'Bantuan', size: 'sm', content: `<p>Email: sapa@kampus.ac.id</p><p>Telp: 0812-3456-7890</p>`, actions: [{ label: 'Tutup' }] });

  document.querySelectorAll('.cta-box .btn-primary').forEach(btn => {
    btn.onclick = (e) => { e.preventDefault(); UI.toast('Hubungi sapa@kampus.ac.id', 'info'); };
  });

  // Counter animation
  const statNumbers = document.querySelectorAll('.stat-number');
  if (statNumbers.length > 0) {
    // Set threshold ke 0.1 (lebih sensitif) agar animasi langsung jalan saat mulai terlihat
    const counterObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseFloat(el.dataset.count);
        const decimal = parseInt(el.dataset.decimal || 0);
        const start = performance.now();
        function update(t) {
          const p = Math.min((t - start) / 1500, 1);
          const val = target * (1 - Math.pow(1 - p, 3));
          el.textContent = decimal > 0 ? val.toFixed(decimal) : Math.floor(val).toLocaleString('id-ID');
          if (p < 1) requestAnimationFrame(update);
        }
        requestAnimationFrame(update);
        counterObserver.unobserve(el);
      });
    }, { threshold: 0.1 });
    statNumbers.forEach(el => counterObserver.observe(el));
  }
}

document.addEventListener('DOMContentLoaded', () => {
  SAPA.initData();
  if (!SAPA.Auth.isLoggedIn()) return showLoginScreen();

  renderAll();
  initSearch();
  const addProductBtn = document.getElementById('addProductBtn');
  if (addProductBtn) addProductBtn.onclick = openSellProductForm;

  const cartBtn = document.getElementById('cartBtn');
  if (cartBtn) cartBtn.onclick = openCart;

  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  if (hamburger && navLinks) hamburger.onclick = () => navLinks.classList.toggle('open');

  document.querySelectorAll('.hero-tags a').forEach(a => {
    a.onclick = (e) => {
      e.preventDefault();
      const text = a.textContent.trim();
      if (text.includes('KRS')) openKRS();
      else if (text.includes('KHS')) openKHS();
      else if (text.includes('Jaket')) { SAPA.Market.addToCart('p1'); updateCartBadge(); UI.toast('Masuk keranjang ✓', 'success'); }
      else if (text.includes('Beasiswa')) openBeasiswa();
    };
  });

  const help = document.getElementById('floatingHelp');
  if (help) help.onclick = () => UI.modal({ title: 'Bantuan', size: 'sm', content: `<p>Email: sapa@kampus.ac.id</p><p>Telp: 0812-3456-7890</p>`, actions: [{ label: 'Tutup' }] });

  document.querySelectorAll('.cta-box .btn-primary').forEach(btn => {
    btn.onclick = (e) => { e.preventDefault(); UI.toast('Hubungi sapa@kampus.ac.id', 'info'); };
  });

  // Counter animation
  const statNumbers = document.querySelectorAll('.stat-number');
  const counterObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseFloat(el.dataset.count);
      const decimal = parseInt(el.dataset.decimal || 0);
      const start = performance.now();
      function update(t) {
        const p = Math.min((t - start) / 1500, 1);
        const val = target * (1 - Math.pow(1 - p, 3));
        el.textContent = decimal > 0 ? val.toFixed(decimal) : Math.floor(val).toLocaleString('id-ID');
        if (p < 1) requestAnimationFrame(update);
      }
      requestAnimationFrame(update);
      counterObserver.unobserve(el);
    });
  }, { threshold: 0.5 });
  statNumbers.forEach(el => counterObserver.observe(el));
});