// ============================================================
// SAPA — Page-specific logic (profil, pesanan, pengaturan)
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  if (!SAPA.Auth.isLoggedIn()) {
    showLoginScreen();
    return;
  }

  const page = document.body.dataset.page;

  if (page === 'profil') renderProfilPage();
  if (page === 'pesanan') renderPesananPage();
  if (page === 'pengaturan') renderPengaturanPage();
});

// ============ HALAMAN PROFIL ============
function renderProfilPage() {
  const user = SAPA.Auth.getUser();
  const khsAll = SAPA.KHS.getAll();
  const wishlist = SAPA.DB.get('wishlist', []);
  const ipk = Number(user.ipk ?? SAPA.KHS.getIPK()) || 0;
  const sksLulus = Number(user.sksLulus ?? SAPA.KHS.getTotalSKS()) || 0;
  const sksMaks = Number(user.sksMaks) || 144;

  const container = document.getElementById('pageContent');
  container.innerHTML = `
    <div class="profile-hero">
      <div class="profile-hero-avatar">${user.avatar || 'R'}</div>
      <div class="profile-hero-info">
        <h1>${user.nama}</h1>
        <p>${UI.escapeHTML(user.npm)} · ${UI.escapeHTML(user.prodi)}</p>
        <div class="profile-hero-badges">
          <span class="badge">${user.fakultas}</span>
          <span class="badge">Angkatan ${user.angkatan}</span>
          <span class="badge">Semester ${user.semester}</span>
        </div>
      </div>
    </div>

    <div class="profile-stats-grid">
      <div class="profile-stat">
        <span class="profile-stat-value">${ipk.toFixed(2)}</span>
        <span class="profile-stat-label">IPK Kumulatif</span>
      </div>
      <div class="profile-stat">
        <span class="profile-stat-value">${sksLulus}</span>
        <span class="profile-stat-label">SKS Lulus</span>
      </div>
      <div class="profile-stat">
        <span class="profile-stat-value">${khsAll.length}</span>
        <span class="profile-stat-label">Semester Ditempuh</span>
      </div>
      <div class="profile-stat">
        <span class="profile-stat-value">${wishlist.length}</span>
        <span class="profile-stat-label">Item Wishlist</span>
      </div>
    </div>

    <div class="page-card">
      <h2><span class="icon">📝</span> Informasi Pribadi</h2>
      <form id="profilForm">
        <div class="info-grid">
          <div class="form-group">
            <label>Nama Lengkap</label>
            <input class="form-input" name="nama" value="${user.nama}" required>
          </div>
          <div class="form-group">
            <label for="profileNpm">NPM</label>
            <input class="form-input" id="profileNpm" name="npm" type="text" inputmode="numeric" maxlength="20" autocomplete="off" value="${UI.escapeHTML(user.npm || '')}" required>
          </div>
          <div class="form-group">
            <label>Email</label>
            <input class="form-input" type="email" name="email" value="${user.email}" required>
          </div>
          <div class="form-group">
            <label>Telepon</label>
            <input class="form-input" name="telepon" value="${user.telepon}">
          </div>
          <div class="form-group" style="grid-column: 1 / -1;">
            <label>Alamat</label>
            <textarea class="form-textarea" name="alamat" rows="2">${user.alamat}</textarea>
          </div>
        </div>
        <div style="text-align:right;margin-top:16px;">
          <button type="submit" class="btn-primary">Simpan Perubahan</button>
        </div>
      </form>
    </div>

    <div class="page-card">
      <h2><span class="icon">🎓</span> Informasi Akademik</h2>
      <div class="info-grid">
        <div class="info-row">
          <span class="info-label">Program Studi</span>
          <span class="info-value">${user.prodi}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Fakultas</span>
          <span class="info-value">${user.fakultas}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Angkatan</span>
          <span class="info-value">${user.angkatan}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Semester Aktif</span>
          <span class="info-value">${user.semester}</span>
        </div>
        <div class="info-row">
          <span class="info-label">SKS Maksimal</span>
          <span class="info-value">${sksMaks} SKS</span>
        </div>
        <div class="info-row">
          <span class="info-label">Status</span>
          <span class="info-value" style="color:var(--success);">Aktif</span>
        </div>
      </div>
    </div>
  `;

  // Form submit
  document.getElementById('profilForm').onsubmit = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    SAPA.Auth.updateUser({
      nama: fd.get('nama'),
      npm: String(fd.get('npm') || '').trim(),
      email: fd.get('email'),
      telepon: fd.get('telepon'),
      alamat: fd.get('alamat'),
      avatar: fd.get('nama').charAt(0).toUpperCase()
    });
    UI.toast('Profil berhasil disimpan ✓', 'success');
    setTimeout(() => location.reload(), 800);
  };
}

// ============ HALAMAN PESANAN ============
function renderPesananPage() {
  const orders = SAPA.Market.orders();
  const container = document.getElementById('pageContent');

  if (orders.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="padding:80px 20px;">
        <div class="empty-icon" style="font-size:4rem;">📦</div>
        <h2 style="margin:16px 0 8px;color:var(--text);">Belum Ada Pesanan</h2>
        <p style="margin-bottom:20px;">Yuk mulai belanja kebutuhan kampusmu!</p>
        <a href="index.html#market" class="btn-primary">Belanja Sekarang →</a>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div style="margin-bottom:20px;">
      <h1 style="font-size:1.4rem;margin-bottom:4px;">Pesanan Saya</h1>
      <p style="color:var(--text-muted);font-size:.9rem;">Total ${orders.length} pesanan</p>
    </div>

    <div id="ordersList">
      ${orders.map(order => `
        <div class="order-card">
          <div class="order-header">
            <div>
              <div class="order-id">${order.id}</div>
              <div class="order-date">${UI.formatTanggal(order.tanggal)}</div>
            </div>
            <span class="badge badge-${order.status === 'Diproses' ? 'warning' : order.status === 'Dikirim' ? 'info' : 'success'}">
              ${order.status}
            </span>
          </div>
          <div class="order-items">
            ${order.items.map(item => `
              <div class="order-item">
                <div class="order-item-img" style="background:${item.warna};">${UI.escapeHTML(item.emoji)}</div>
                <div class="order-item-info">
                  <strong>${UI.escapeHTML(item.nama)}</strong>
                  <span>${item.qty}× ${UI.formatRupiah(item.harga)}</span>
                </div>
                <strong style="font-size:.85rem;">${UI.formatRupiah(item.subtotal)}</strong>
              </div>
            `).join('')}
          </div>
          <div class="order-footer">
            <div class="order-total">
              Total: <strong>${UI.formatRupiah(order.total)}</strong>
            </div>
            <button class="btn-ghost btn-sm" data-detail="${order.id}">Lihat Detail</button>
          </div>
        </div>
      `).join('')}
    </div>
  `;

  container.querySelectorAll('[data-detail]').forEach(btn => {
    btn.onclick = () => {
      const order = orders.find(o => o.id === btn.dataset.detail);
      showOrderDetail(order);
    };
  });
}

function showOrderDetail(order) {
  const content = `
    <div style="margin-bottom:16px;">
      <div style="font-size:.8rem;color:var(--text-muted);">Order ID</div>
      <div style="font-size:1.1rem;font-weight:800;color:var(--primary);">${order.id}</div>
    </div>
    <div style="margin-bottom:16px;">
      <div style="font-size:.8rem;color:var(--text-muted);">Tanggal</div>
      <div style="font-weight:600;">${new Date(order.tanggal).toLocaleString('id-ID')}</div>
    </div>
    <div style="margin-bottom:16px;">
      <div style="font-size:.8rem;color:var(--text-muted);margin-bottom:8px;">Status</div>
      <span class="badge badge-warning">${order.status}</span>
    </div>
    <div style="border-top:1px solid var(--border);padding-top:16px;">
      <div style="font-size:.8rem;color:var(--text-muted);margin-bottom:8px;">Item</div>
      ${order.items.map(item => `
        <div class="order-item" style="padding:8px 0;">
          <div class="order-item-img" style="background:${item.warna};">${UI.escapeHTML(item.emoji)}</div>
          <div class="order-item-info">
            <strong>${UI.escapeHTML(item.nama)}</strong>
            <span>${item.qty} × ${UI.formatRupiah(item.harga)}</span>
          </div>
          <strong>${UI.formatRupiah(item.subtotal)}</strong>
        </div>
      `).join('')}
    </div>
    <div style="border-top:1px solid var(--border);padding-top:16px;margin-top:16px;display:flex;justify-content:space-between;align-items:center;">
      <span style="font-weight:600;">Total</span>
      <strong style="font-size:1.3rem;color:var(--primary);">${UI.formatRupiah(order.total)}</strong>
    </div>
  `;

  UI.modal({
    title: 'Detail Pesanan',
    size: 'md',
    content,
    actions: [
      { label: 'Cetak Invoice', className: 'btn-ghost', onClick: () => window.print() },
      { label: 'Tutup' }
    ]
  });
}

// ============ HALAMAN PENGATURAN ============
function renderPengaturanPage() {
  const currentTheme = Theme.get();
  const notifPref = SAPA.DB.get('notifPref', true);
  const user = SAPA.Auth.getUser();

  const container = document.getElementById('pageContent');
  container.innerHTML = `
    <div style="margin-bottom:20px;">
      <h1 style="font-size:1.4rem;margin-bottom:4px;">Pengaturan</h1>
      <p style="color:var(--text-muted);font-size:.9rem;">Kelola preferensi aplikasi kamu</p>
    </div>

    <div class="page-card">
      <h2><span class="icon">🎨</span> Tampilan</h2>
      <div class="settings-item">
        <div class="settings-info">
          <strong>Tema Aplikasi</strong>
          <p>Pilih tema terang, gelap, atau otomatis mengikuti sistem</p>
        </div>
        <select class="form-select" id="themeSelect" style="width:auto;min-width:140px;">
          <option value="light" ${currentTheme === 'light' ? 'selected' : ''}>☀️ Terang</option>
          <option value="dark" ${currentTheme === 'dark' ? 'selected' : ''}>🌙 Gelap</option>
          <option value="auto" ${currentTheme === 'auto' ? 'selected' : ''}>⚙️ Otomatis</option>
        </select>
      </div>
    </div>

    <div class="page-card">
      <h2><span class="icon">🔔</span> Notifikasi</h2>
      <div class="settings-item">
        <div class="settings-info">
          <strong>Notifikasi In-App</strong>
          <p>Tampilkan notifikasi untuk aktivitas penting</p>
        </div>
        <button class="toggle-switch ${notifPref ? 'on' : ''}" id="notifToggle" aria-label="Toggle notifikasi"></button>
      </div>
      <div class="settings-item">
        <div class="settings-info">
          <strong>Hapus Semua Notifikasi</strong>
          <p>Bersihkan riwayat notifikasi yang sudah ada</p>
        </div>
        <button class="btn-ghost btn-sm" id="clearNotifs">Hapus</button>
      </div>
    </div>

    <div class="page-card">
      <h2><span class="icon">💾</span> Data</h2>
      <div class="settings-item">
        <div class="settings-info">
          <strong>Reset Data Aplikasi</strong>
          <p>Hapus semua data lokal dan mulai dari awal</p>
        </div>
        <button class="btn-danger btn-sm" id="resetData">Reset Data</button>
      </div>
      <div class="settings-item">
        <div class="settings-info">
          <strong>Export Data</strong>
          <p>Unduh semua data kamu sebagai file JSON</p>
        </div>
        <button class="btn-ghost btn-sm" id="exportData">Export</button>
      </div>
    </div>

    <div class="page-card">
      <h2><span class="icon">ℹ️</span> Tentang</h2>
      <div class="settings-item">
        <div class="settings-info">
          <strong>SAPA v1.0.0</strong>
          <p>Sentral Aplikasi Pelayanan Akademik</p>
        </div>
        <span class="badge badge-info">Production</span>
      </div>
      <div class="settings-item">
        <div class="settings-info">
          <strong>Mode Demo</strong>
          <p>Data demo digunakan. Login dengan email apa saja.</p>
        </div>
      </div>
    </div>
  `;

  // Theme change
  document.getElementById('themeSelect').onchange = (e) => {
    Theme.set(e.target.value);
    UI.toast('Tema diperbarui ✓', 'success');
  };

  // Notif toggle
  const notifBtn = document.getElementById('notifToggle');
  notifBtn.onclick = () => {
    const current = SAPA.DB.get('notifPref', true);
    SAPA.DB.set('notifPref', !current);
    notifBtn.classList.toggle('on');
    UI.toast(`Notifikasi ${!current ? 'diaktifkan' : 'dimatikan'}`, 'success');
  };

  // Clear notifs
  document.getElementById('clearNotifs').onclick = () => {
    UI.confirm('Hapus semua notifikasi?', () => {
      SAPA.DB.set('notifications', []);
      UI.toast('Semua notifikasi dihapus', 'success');
    });
  };

  // Reset
  document.getElementById('resetData').onclick = () => {
    UI.modal({
      title: '⚠️ Reset Data',
      size: 'sm',
      content: `
        <p style="color:var(--danger);font-weight:600;margin-bottom:12px;">Perhatian!</p>
        <p>Ini akan menghapus <strong>SEMUA</strong> data termasuk:</p>
        <ul style="margin:12px 0;padding-left:20px;font-size:.85rem;line-height:1.8;">
          <li>Data login & profil</li>
          <li>KRS & jadwal</li>
          <li>Keranjang & pesanan</li>
          <li>Beasiswa & surat</li>
          <li>Notifikasi & wishlist</li>
        </ul>
        <p style="font-size:.85rem;color:var(--text-muted);">Data tidak bisa dikembalikan.</p>
      `,
      actions: [
        { label: 'Batal' },
        { label: 'Ya, Reset Sekarang', onClick: () => {
          SAPA.DB.clear();
          localStorage.removeItem('sapa_auth');
          UI.toast('Data berhasil direset. Reload...', 'success');
          setTimeout(() => location.href = 'index.html', 1000);
        }}
      ]
    });
  };

  // Export
  document.getElementById('exportData').onclick = () => {
    const data = {};
    Object.keys(localStorage)
      .filter(k => k.startsWith('sapa_'))
      .forEach(k => { data[k] = JSON.parse(localStorage.getItem(k)); });
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sapa-backup-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    UI.toast('Data berhasil diexport ✓', 'success');
  };
}