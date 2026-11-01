// ============================================================
// SAPA - Data Layer & Business Logic (Fresh State)
// ============================================================

const DB = {
  get(key, fallback = null) {
    try {
      const v = localStorage.getItem(`sapa_${key}`);
      return v ? JSON.parse(v) : fallback;
    } catch { return fallback; }
  },
  set(key, value) { localStorage.setItem(`sapa_${key}`, JSON.stringify(value)); },
  remove(key) { localStorage.removeItem(`sapa_${key}`); },
  clear() {
    Object.keys(localStorage)
      .filter(k => k.startsWith('sapa_'))
      .forEach(k => localStorage.removeItem(k));
  }
};

// ============ SEED DATA (Hanya Profil & Master Data) ============
const SEED_USER = {
  id: 'mhs-001',
  nama: 'Muhammad Ihsan Abrar',
  npm: '2561209005',
  prodi: 'Bisnis Digital',
  fakultas: 'Fakultas FISIP',
  angkatan: 2025,
  semester: 3,
  email: '2561209005@student.univrab.ac.id',
  telepon: '0812-3456-7890',
  alamat: 'Jl. Musyawarah No. 8C, Pekanbaru',
  avatar: 'M',
  role: 'mahasiswa'
};

const SEED_COURSES = [
  { id: 'c1', kode: 'IF601', nama: 'Pemrograman Web Lanjut', sks: 3, dosen: 'Dr. Ahmad Fauzi', hari: 'Senin', jam: '09:30-12:00', ruang: 'Lab IF-2', kuota: 40, terisi: 32, kategori: 'Wajib' },
  { id: 'c2', kode: 'IF602', nama: 'Basis Data Terdistribusi', sks: 3, dosen: 'Ir. Siti Nurhaliza, M.T.', hari: 'Senin', jam: '13:00-15:30', ruang: 'Ruang B-201', kuota: 40, terisi: 28, kategori: 'Wajib' },
  { id: 'c3', kode: 'IF603', nama: 'Kecerdasan Buatan', sks: 3, dosen: 'Dr. Budi Santoso', hari: 'Selasa', jam: '08:00-10:30', ruang: 'Ruang A-101', kuota: 45, terisi: 40, kategori: 'Wajib' },
  { id: 'c4', kode: 'IF604', nama: 'Rekayasa Perangkat Lunak', sks: 3, dosen: 'Dewi Kartika, M.Kom.', hari: 'Selasa', jam: '10:30-13:00', ruang: 'Ruang B-105', kuota: 40, terisi: 25, kategori: 'Wajib' },
  { id: 'c5', kode: 'IF605', nama: 'Keamanan Informasi', sks: 3, dosen: 'Rizal Hakim, Ph.D.', hari: 'Rabu', jam: '08:00-10:30', ruang: 'Lab Cyber', kuota: 30, terisi: 22, kategori: 'Wajib' },
  { id: 'c6', kode: 'IF606', nama: 'Mobile Programming', sks: 3, dosen: 'Andi Wijaya, M.T.', hari: 'Rabu', jam: '13:00-15:30', ruang: 'Lab Mobile', kuota: 35, terisi: 30, kategori: 'Pilihan' },
  { id: 'c7', kode: 'IF607', nama: 'Cloud Computing', sks: 3, dosen: 'Dr. Maya Sari', hari: 'Kamis', jam: '08:00-10:30', ruang: 'Lab Cloud', kuota: 30, terisi: 18, kategori: 'Pilihan' },
  { id: 'c8', kode: 'IF608', nama: 'UI/UX Design', sks: 2, dosen: 'Putri Anggraini, M.Ds.', hari: 'Kamis', jam: '10:30-12:20', ruang: 'Studio Design', kuota: 25, terisi: 20, kategori: 'Pilihan' },
  { id: 'c9', kode: 'IF609', nama: 'Data Mining', sks: 3, dosen: 'Dr. Hendra Gunawan', hari: 'Jumat', jam: '08:00-10:30', ruang: 'Lab Data', kuota: 30, terisi: 24, kategori: 'Pilihan' },
  { id: 'c10', kode: 'IF610', nama: 'Etika Profesi IT', sks: 2, dosen: 'Prof. Sri Rahayu', hari: 'Jumat', jam: '10:30-12:20', ruang: 'Ruang C-301', kuota: 50, terisi: 42, kategori: 'Wajib' }
];

const SEED_BEASISWA = [
  { id: 'b1', nama: 'Beasiswa Unggulan 2026', penyelenggara: 'Kemendikbud', deadline: '2026-12-30', nominal: 'Rp 12.000.000/tahun', kuota: 100, deskripsi: 'Beasiswa untuk mahasiswa berprestasi akademik dengan IPK minimal 3.5.', syarat: ['IPK ≥ 3.5', 'Semester 4-8', 'Tidak sedang menerima beasiswa lain'], status: 'open' },
  { id: 'b2', nama: 'Beasiswa Bank Indonesia', penyelenggara: 'Bank Indonesia', deadline: '2026-12-15', nominal: 'Rp 1.000.000/bulan', kuota: 50, deskripsi: 'Program beasiswa untuk mahasiswa dari keluarga kurang mampu berprestasi.', syarat: ['IPK ≥ 3.25', 'Ekonomi kurang mampu', 'Aktif organisasi'], status: 'open' },
  { id: 'b3', nama: 'Beasiswa Djarum Plus', penyelenggara: 'Djarum Foundation', deadline: '2027-01-20', nominal: 'Rp 8.000.000/tahun', kuota: 200, deskripsi: 'Beasiswa dengan pelatihan soft skill dan networking.', syarat: ['IPK ≥ 3.0', 'Semester 2-6', 'Aktif organisasi'], status: 'open' }
];

const SEED_PRODUCTS = [
  { id: 'p1', nama: 'Jaket Almamater', harga: 185000, hargaAsli: 230000, kategori: 'Merchandise', emoji: '🧥', warna: 'linear-gradient(135deg,#244367,#2E527C)', stok: 50 },
  { id: 'p2', nama: 'Kaos Fakultas Teknik', harga: 75000, hargaAsli: 95000, kategori: 'Merchandise', emoji: '👕', warna: 'linear-gradient(135deg,#0EA5E9,#0284C7)', stok: 100 },
  { id: 'p3', nama: 'Algoritma & Struktur Data', harga: 89000, hargaAsli: null, kategori: 'Buku', emoji: '📘', warna: 'linear-gradient(135deg,#FFC107,#E6AC00)', stok: 30 },
  { id: 'p4', nama: 'Tiket Festival Inovasi', harga: 45000, hargaAsli: 60000, kategori: 'Event', emoji: '🎫', warna: 'linear-gradient(135deg,#10B981,#059669)', stok: 200 },
  { id: 'p5', nama: 'Voucher Kantin Rp 50rb', harga: 45000, hargaAsli: 50000, kategori: 'Kantin', emoji: '☕', warna: 'linear-gradient(135deg,#F59E0B,#D97706)', stok: 500 }
];

// ============ INIT ============
function initData() {
  if (!DB.get('initialized')) {
    DB.set('user', SEED_USER);
    DB.set('courses', SEED_COURSES);
    DB.set('beasiswa', SEED_BEASISWA);
    DB.set('products', SEED_PRODUCTS);
    
    // DATA AKADEMIK & TRANSAKSI KOSONG
    DB.set('khs', []); 
    DB.set('notifications', []);
    DB.set('surat', []);
    DB.set('beasiswaApplied', []);
    DB.set('krsDraft', []);
    DB.set('krsStatus', 'draft');
    DB.set('cart', []);
    DB.set('orders', []);
    DB.set('borrowedBooks', []);
    DB.set('wishlist', []);
    
    DB.set('initialized', true);
  }
}

// ============ MODULES ============

const Auth = {
  login(email, password) {
    if (email && password.length >= 3) {
      DB.set('auth', true);
      const user = DB.get('user');
      user.lastLogin = Date.now();
      DB.set('user', user);
      return { ok: true, user };
    }
    return { ok: false, message: 'Email dan password wajib diisi (min 3 karakter).' };
  },
  logout() {
    DB.set('auth', false);
    window.location.href = 'index.html';
  },
  isLoggedIn() { return DB.get('auth', false); },
  getUser() { return DB.get('user'); },
  updateUser(patch) {
    const u = { ...DB.get('user'), ...patch };
    DB.set('user', u);
    return u;
  }
};

const Notif = {
  getAll() { return DB.get('notifications', []).sort((a,b) => b.waktu - a.waktu); },
  unreadCount() { return this.getAll().filter(n => !n.dibaca).length; },
  add(judul, pesan, tipe = 'info') {
    const list = DB.get('notifications', []);
    list.push({ id: 'n' + Date.now(), judul, pesan, tipe, waktu: Date.now(), dibaca: false });
    DB.set('notifications', list);
  },
  markRead(id) {
    const list = DB.get('notifications', []);
    const n = list.find(x => x.id === id);
    if (n) n.dibaca = true;
    DB.set('notifications', list);
  },
  markAllRead() {
    const list = DB.get('notifications', []).map(n => ({ ...n, dibaca: true }));
    DB.set('notifications', list);
  }
};

const KRS = {
  getAvailable() { return DB.get('courses', []); },
  getDraft() { return DB.get('krsDraft', []); },
  getStatus() { return DB.get('krsStatus', 'draft'); },
  isInDraft(id) { return this.getDraft().includes(id); },
  totalSKS() {
    const draft = this.getDraft();
    return this.getAvailable()
      .filter(c => draft.includes(c.id))
      .reduce((s, c) => s + c.sks, 0);
  },
  add(id) {
    const course = this.getAvailable().find(c => c.id === id);
    if (!course) return { ok: false, message: 'Matkul tidak ditemukan' };
    const draft = this.getDraft();
    if (draft.includes(id)) return { ok: false, message: 'Sudah ada di KRS' };
    if (course.terisi >= course.kuota) return { ok: false, message: 'Kuota penuh' };
    if (this.totalSKS() + course.sks > 24) return { ok: false, message: 'Melebihi batas 24 SKS' };
    
    const bentrok = this.getAvailable().filter(c =>
      draft.includes(c.id) && c.hari === course.hari && this.jamBentrok(c.jam, course.jam)
    );
    if (bentrok.length > 0) return { ok: false, message: `Bentrok dengan ${bentrok[0].nama}` };
    
    draft.push(id);
    DB.set('krsDraft', draft);
    return { ok: true };
  },
  remove(id) {
    const draft = this.getDraft().filter(x => x !== id);
    DB.set('krsDraft', draft);
    return { ok: true };
  },
  jamBentrok(j1, j2) {
    const [a1, b1] = j1.split('-').map(t => t.replace(':','')).map(Number);
    const [a2, b2] = j2.split('-').map(t => t.replace(':','')).map(Number);
    return a1 < b2 && a2 < b1;
  },
  submit() {
    const draft = this.getDraft();
    if (draft.length === 0) return { ok: false, message: 'KRS masih kosong' };
    DB.set('krsStatus', 'submitted');
    Notif.add('KRS Berhasil Diajukan', `KRS dengan ${this.totalSKS()} SKS menunggu persetujuan Dosen PA.`, 'info');
    return { ok: true };
  },
  reset() {
    DB.set('krsDraft', []);
    DB.set('krsStatus', 'draft');
  }
};

const KHS = {
  getAll() { return DB.get('khs', []); },
  getIPK() {
    const all = this.getAll();
    if (all.length === 0) return '0.00';
    const totalMutu = all.reduce((s, sm) => s + sm.mk.reduce((a, m) => a + (m.mutu * m.sks), 0), 0);
    const totalSKS = all.reduce((s, sm) => s + sm.mk.reduce((a, m) => a + m.sks, 0), 0);
    return totalSKS ? (totalMutu / totalSKS).toFixed(2) : '0.00';
  },
  getTotalSKS() {
    const all = this.getAll();
    if (all.length === 0) return 0;
    return all.reduce((s, sm) => s + sm.mk.reduce((a, m) => a + m.sks, 0), 0);
  },
  getTotalMutu() {
    const all = this.getAll();
    if (all.length === 0) return 0;
    return all.reduce((s, sm) => s + sm.mk.reduce((a, m) => a + (m.mutu * m.sks), 0), 0);
  }
};

const Jadwal = {
  getAll() {
    const krsIds = KRS.getDraft();
    return KRS.getAvailable().filter(c => krsIds.includes(c.id));
  },
  byHari() {
    const days = ['Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
    const map = {};
    days.forEach(d => map[d] = []);
    this.getAll().forEach(c => {
      if (map[c.hari]) map[c.hari].push(c);
    });
    return map;
  },
  nextClass() {
    const all = this.getAll();
    if (all.length === 0) return null;
    const now = new Date();
    const dayNames = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
    const today = dayNames[now.getDay()];
    const currentTime = now.getHours() * 100 + now.getMinutes();
    const todayClasses = all
      .filter(c => c.hari === today)
      .map(c => {
        const [start, end] = c.jam.split('-');
        return { ...c, startTime: parseInt(start.replace(':','')), endTime: parseInt(end.replace(':','')), start };
      })
      .filter(c => c.endTime > currentTime)
      .sort((a,b) => a.startTime - b.startTime);
    if (todayClasses.length) return todayClasses[0];
    
    const dayOrder = ['Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
    const todayIdx = dayOrder.indexOf(today);
    for (let i = 1; i <= 7; i++) {
      const nextDay = dayOrder[(todayIdx + i) % dayOrder.length];
      const nextClasses = all.filter(c => c.hari === nextDay).sort((a,b) => a.jam.localeCompare(b.jam));
      if (nextClasses.length) return { ...nextClasses[0], isNextDay: true };
    }
    return null;
  }
};

const Beasiswa = {
  list() { return DB.get('beasiswa', []); },
  getApplied() { return DB.get('beasiswaApplied', []); },
  isApplied(id) { return this.getApplied().some(a => a.id === id); },
  apply(id, catatan = '') {
    if (this.isApplied(id)) return { ok: false, message: 'Sudah pernah mendaftar' };
    const b = this.list().find(x => x.id === id);
    if (!b) return { ok: false, message: 'Beasiswa tidak ditemukan' };
    if (b.status === 'closed') return { ok: false, message: 'Pendaftaran sudah ditutup' };
    const applied = this.getApplied();
    applied.push({ id, nama: b.nama, tanggal: Date.now(), catatan, status: 'Diproses' });
    DB.set('beasiswaApplied', applied);
    Notif.add('Pendaftaran Beasiswa Terkirim', `Pendaftaran ${b.nama} berhasil dikirim. Cek status berkala.`, 'success');
    return { ok: true };
  }
};

const Surat = {
  types: ['Surat Keterangan Aktif', 'Surat Keterangan Cuti', 'Surat Keterangan Lulus', 'Surat Pengantar Magang', 'Surat Rekomendasi'],
  list() { return DB.get('surat', []).sort((a,b) => b.tanggal - a.tanggal); },
  submit(jenis, keperluan) {
    if (!jenis || !keperluan) return { ok: false, message: 'Jenis dan keperluan wajib diisi' };
    const list = DB.get('surat', []);
    const req = {
      id: 's' + Date.now(),
      jenis, keperluan,
      tanggal: Date.now(),
      status: 'Diproses',
      estimasi: '2-3 hari kerja'
    };
    list.push(req);
    DB.set('surat', list);
    Notif.add('Pengajuan Surat Diterima', `${jenis} sedang diproses. Estimasi 2-3 hari kerja.`, 'info');
    return { ok: true, data: req };
  }
};

const Market = {
  products() { return DB.get('products', []); },
  addProduct({ nama, kategori, harga, stok, deskripsi }) {
    const name = String(nama || '').trim();
    const category = String(kategori || '');
    const price = Number(harga);
    const quantity = Number(stok);
    const description = String(deskripsi || '').trim().slice(0, 240);
    const categories = {
      'Merchandise': ['🎒', 'linear-gradient(135deg,#244367,#2E527C)'],
      'Buku': ['📘', 'linear-gradient(135deg,#FFC107,#E6AC00)'],
      'Event': ['🎟️', 'linear-gradient(135deg,#10B981,#059669)'],
      'Kantin': ['🥤', 'linear-gradient(135deg,#F59E0B,#D97706)'],
      'Jasa': ['🧰', 'linear-gradient(135deg,#0EA5E9,#0284C7)'],
      'Lainnya': ['📦', 'linear-gradient(135deg,#64748B,#475569)']
    };
    if (name.length < 3 || name.length > 70) return { ok: false, message: 'Nama produk harus 3–70 karakter.' };
    if (!Object.prototype.hasOwnProperty.call(categories, category)) return { ok: false, message: 'Pilih kategori produk.' };
    if (!Number.isSafeInteger(price) || price < 1 || price > 100000000) return { ok: false, message: 'Harga harus antara Rp 1 dan Rp 100.000.000.' };
    if (!Number.isSafeInteger(quantity) || quantity < 1 || quantity > 5000) return { ok: false, message: 'Stok harus antara 1 dan 5.000.' };
    const user = Auth.getUser();
    const product = {
      id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      nama: name, kategori: category, harga: price, hargaAsli: null, stok: quantity,
      deskripsi: description, penjual: user?.nama || 'Mahasiswa SAPA', sellerId: user?.id || '',
      emoji: categories[category][0], warna: categories[category][1]
    };
    try {
      DB.set('products', [product, ...this.products()]);
      return { ok: true, data: product };
    } catch {
      return { ok: false, message: 'Produk belum tersimpan. Ruang penyimpanan browser mungkin penuh.' };
    }
  },
  getCart() { return DB.get('cart', []); },
  cartCount() { return this.getCart().reduce((s, i) => s + i.qty, 0); },
  cartTotal() {
    return this.getCart().reduce((s, i) => {
      const p = this.products().find(x => x.id === i.id);
      return s + (p ? p.harga * i.qty : 0);
    }, 0);
  },
  addToCart(id) {
    const cart = this.getCart();
    const existing = cart.find(i => i.id === id);
    if (existing) existing.qty += 1;
    else cart.push({ id, qty: 1 });
    DB.set('cart', cart);
    return { ok: true };
  },
  removeFromCart(id) {
    const cart = this.getCart().filter(i => i.id !== id);
    DB.set('cart', cart);
    return { ok: true };
  },
  updateQty(id, qty) {
    const cart = this.getCart();
    const item = cart.find(i => i.id === id);
    if (item) {
      if (qty <= 0) return this.removeFromCart(id);
      item.qty = qty;
    }
    DB.set('cart', cart);
    return { ok: true };
  },
  checkout() {
    const cart = this.getCart();
    if (cart.length === 0) return { ok: false, message: 'Keranjang kosong' };
    const order = {
      id: 'ORD' + Date.now().toString().slice(-8),
      items: cart.map(i => {
        const p = this.products().find(x => x.id === i.id);
        return { ...p, qty: i.qty, subtotal: p.harga * i.qty };
      }),
      total: this.cartTotal(),
      tanggal: Date.now(),
      status: 'Diproses'
    };
    const orders = DB.get('orders', []);
    orders.push(order);
    DB.set('orders', orders);
    DB.set('cart', []);
    Notif.add('Pesanan Berhasil', `Order ${order.id} sedang diproses. Total: ${UI.formatRupiah(order.total)}`, 'success');
    return { ok: true, order };
  },
  orders() { return DB.get('orders', []).sort((a,b) => b.tanggal - a.tanggal); }
};

window.SAPA = { DB, Auth, Notif, KRS, KHS, Jadwal, Beasiswa, Surat, Market, initData };