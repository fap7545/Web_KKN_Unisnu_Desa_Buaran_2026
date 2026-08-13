// =========================================
//   KKN UNISNU XXI - BERITA ACARA JS
// =========================================

// ---- State ----
let currentPage = 1;
const itemsPerPage = 10;
let filteredList = [];
let editingId = null;
let deletingId = null;
let viewingBA = null;
let pesertaCount = 0;

// ---- Init ----
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initMobileNav();
  initDefaultPeserta();
  renderBA();
  updateStats();
  handleURLParam();
});

function handleURLParam() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  if (id) {
    const ba = Storage.getBeritaAcaraById(id);
    if (ba) viewBA(ba);
  }
}

// ---- Render ----
function renderBA() {
  const mode = document.getElementById('ba-view-mode')?.value || 'table';
  const tableView = document.getElementById('ba-table-view');
  const cardView = document.getElementById('ba-card-view');

  if (tableView) tableView.style.display = mode === 'table' ? '' : 'none';
  if (cardView) cardView.style.display = mode === 'card' ? '' : 'none';

  const search = (document.getElementById('ba-search')?.value || '').toLowerCase();
  const bulanFilter = document.getElementById('ba-filter-bulan')?.value || '';

  const allBA = Storage.getBeritaAcara();
  filteredList = allBA.filter(ba => {
    const matchSearch = !search ||
      ba.judul?.toLowerCase().includes(search) ||
      ba.nomor?.toLowerCase().includes(search) ||
      ba.lokasi?.toLowerCase().includes(search) ||
      ba.agenda?.toLowerCase().includes(search);

    const matchBulan = !bulanFilter || (ba.tanggal && ba.tanggal.split('-')[1] === bulanFilter);

    return matchSearch && matchBulan;
  });

  const total = filteredList.length;
  const totalPages = Math.ceil(total / itemsPerPage);
  if (currentPage > totalPages) currentPage = Math.max(1, totalPages);

  const start = (currentPage - 1) * itemsPerPage;
  const pageItems = filteredList.slice(start, start + itemsPerPage);

  if (mode === 'table') renderTable(pageItems, total, start);
  else renderCards(pageItems, total);

  renderPagination(totalPages);
}

function renderTable(items, total, start) {
  const tbody = document.getElementById('ba-tbody');
  if (!tbody) return;

  if (!items.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7">
          <div class="empty-state">
            <div class="empty-icon">📋</div>
            <h3>Belum Ada Berita Acara</h3>
            <p>Mulai buat berita acara kegiatan KKN Anda</p>
            <button class="btn btn-primary" onclick="openModalTambah()">✚ Tambah Berita Acara</button>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = items.map((ba, i) => `
    <tr>
      <td class="no-col">${start + i + 1}</td>
      <td style="font-size:0.78rem;color:var(--text-muted);max-width:160px;">${ba.nomor || '-'}</td>
      <td class="title-col">
        <div style="font-weight:600;cursor:pointer;color:var(--text);" onclick="viewBA(${JSON.stringify(ba).split('"').join('&quot;')})">
          ${escHtml(ba.judul)}
        </div>
      </td>
      <td class="date-col">
        <div>${formatDate(ba.tanggal)}</div>
        <div style="font-size:0.75rem;color:var(--text-dim);">${ba.jam || ''} ${ba.jamSelesai ? '– ' + ba.jamSelesai : ''}</div>
      </td>
      <td class="lokasi-col" style="max-width:150px;">
        <div style="font-size:0.82rem;color:var(--text-muted);">📍 ${escHtml(ba.lokasi)}</div>
      </td>
      <td style="text-align:center;">
        <span class="badge badge-primary" style="font-size:0.7rem;">${ba.peserta ? ba.peserta.length : 0} org</span>
      </td>
      <td>
        <div class="ba-table-actions">
          <button class="btn-icon btn-view" title="Lihat Detail" onclick="viewBAById('${ba.id}')">👁️</button>
          <button class="btn-icon btn-edit" title="Edit" onclick="openModalEdit('${ba.id}')">✏️</button>
          <button class="btn-icon btn-print" title="Cetak" onclick="printBAById('${ba.id}')">🖨️</button>
          <button class="btn-icon btn-delete" title="Hapus" onclick="confirmDelete('${ba.id}', '${escHtml(ba.judul)}')">🗑️</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function renderCards(items, total) {
  const container = document.getElementById('ba-card-container');
  if (!container) return;

  if (!items.length) {
    container.innerHTML = `
      <div style="grid-column:1/-1;">
        <div class="empty-state">
          <div class="empty-icon">📋</div>
          <h3>Belum Ada Berita Acara</h3>
          <p>Mulai buat berita acara kegiatan KKN Anda</p>
          <button class="btn btn-primary" onclick="openModalTambah()">✚ Tambah Berita Acara</button>
        </div>
      </div>
    `;
    return;
  }

  container.innerHTML = items.map(ba => `
    <div class="ba-card">
      <div class="ba-card-top">
        <div>
          <div class="ba-number">${ba.nomor || ''}</div>
          <div class="ba-title">${escHtml(ba.judul)}</div>
        </div>
        <div class="ba-date-badge">${formatDate(ba.tanggal)}</div>
      </div>
      <div class="ba-card-body">
        <p>${ba.agenda ? escHtml(ba.agenda.substring(0, 100)) + (ba.agenda.length > 100 ? '...' : '') : '-'}</p>
        <div class="ba-footer">
          <div class="ba-lokasi">📍 ${escHtml(ba.lokasi)}</div>
          <div style="display:flex;gap:0.5rem;">
            <button class="btn-icon btn-view" onclick="viewBAById('${ba.id}')" title="Lihat">👁️</button>
            <button class="btn-icon btn-edit" onclick="openModalEdit('${ba.id}')" title="Edit">✏️</button>
            <button class="btn-icon btn-print" onclick="printBAById('${ba.id}')" title="Cetak">🖨️</button>
            <button class="btn-icon btn-delete" onclick="confirmDelete('${ba.id}', '${escHtml(ba.judul)}')" title="Hapus">🗑️</button>
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

function renderPagination(totalPages) {
  const pag = document.getElementById('ba-pagination');
  if (!pag || totalPages <= 1) { if (pag) pag.innerHTML = ''; return; }

  let html = `
    <button class="page-btn" ${currentPage === 1 ? 'disabled' : ''} onclick="goPage(${currentPage - 1})">←</button>
  `;
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
      html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="goPage(${i})">${i}</button>`;
    } else if (i === currentPage - 2 || i === currentPage + 2) {
      html += `<span class="page-btn" style="cursor:default;">…</span>`;
    }
  }
  html += `<button class="page-btn" ${currentPage === totalPages ? 'disabled' : ''} onclick="goPage(${currentPage + 1})">→</button>`;
  pag.innerHTML = html;
}

function goPage(page) {
  currentPage = page;
  renderBA();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function filterBA() {
  currentPage = 1;
  renderBA();
}

// ---- Stats ----
function updateStats() {
  const list = Storage.getBeritaAcara();
  const statTotal = document.getElementById('stat-total');
  const statBulan = document.getElementById('stat-bulan');
  const statPeserta = document.getElementById('stat-peserta');

  if (statTotal) statTotal.textContent = list.length;

  if (statBulan) {
    if (list.length) {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
      const dates = list.map(b => b.tanggal).filter(Boolean).sort();
      const first = new Date(dates[0]);
      const last = new Date(dates[dates.length - 1]);
      if (!isNaN(first)) statBulan.textContent = `${months[first.getMonth()]}–${months[last.getMonth()]} ${last.getFullYear()}`;
    } else {
      statBulan.textContent = '-';
    }
  }

  if (statPeserta) {
    const total = list.reduce((acc, b) => acc + (b.peserta ? b.peserta.length : 0), 0);
    statPeserta.textContent = total;
  }
}

// ---- Form Modal ----
function openModalTambah() {
  editingId = null;
  document.getElementById('modal-form-title').textContent = '✍️ Tambah Berita Acara';
  document.getElementById('ba-form').reset();
  document.getElementById('ba-id').value = '';
  resetPesertaList();
  initDefaultPeserta();

  // Auto-generate nomor
  const list = Storage.getBeritaAcara();
  const nextNum = String(list.length + 1).padStart(3, '0');
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  const romMonth = toRoman(new Date().getMonth() + 1);
  document.getElementById('ba-nomor').value = `${nextNum}/BA/KKN-UNISNU-XXI/${romMonth}/2026`;
  document.getElementById('ba-tanggal').value = new Date().toISOString().split('T')[0];

  // Default penandatangan
  document.getElementById('ttd-kiri-jabatan').value = 'Dosen Pembimbing Lapangan';
  document.getElementById('ttd-kiri-nama').value = 'Drs. H. Mahmud, M.Pd.';
  document.getElementById('ttd-kanan-jabatan').value = 'Ketua KKN';
  document.getElementById('ttd-kanan-nama').value = 'Ahmad Habibi';

  openModal('modal-form');
}

function openModalEdit(id) {
  const ba = Storage.getBeritaAcaraById(id);
  if (!ba) return;

  editingId = id;
  document.getElementById('modal-form-title').textContent = '✏️ Edit Berita Acara';
  document.getElementById('ba-id').value = id;
  document.getElementById('ba-nomor').value = ba.nomor || '';
  document.getElementById('ba-judul').value = ba.judul || '';
  document.getElementById('ba-tanggal').value = ba.tanggal || '';
  document.getElementById('ba-jam').value = ba.jam || '';
  document.getElementById('ba-jam-selesai').value = ba.jamSelesai || '';
  document.getElementById('ba-lokasi').value = ba.lokasi || '';
  document.getElementById('ba-agenda').value = ba.agenda || '';
  document.getElementById('ba-hasil').value = ba.hasil || '';

  // Penandatangan
  document.getElementById('ttd-kiri-jabatan').value = ba.penandatangan?.kiri?.jabatan || '';
  document.getElementById('ttd-kiri-nama').value = ba.penandatangan?.kiri?.nama || '';
  document.getElementById('ttd-kanan-jabatan').value = ba.penandatangan?.kanan?.jabatan || '';
  document.getElementById('ttd-kanan-nama').value = ba.penandatangan?.kanan?.nama || '';

  // Peserta
  resetPesertaList();
  if (ba.peserta && ba.peserta.length) {
    ba.peserta.forEach(p => addPesertaRow(p.nama, p.jabatan));
  } else {
    initDefaultPeserta();
  }

  openModal('modal-form');
}

function submitBA(e) {
  e.preventDefault();

  const pesertaRows = document.querySelectorAll('.peserta-row');
  const peserta = [];
  pesertaRows.forEach(row => {
    const nama = row.querySelector('.p-nama')?.value.trim();
    const jabatan = row.querySelector('.p-jabatan')?.value.trim();
    if (nama) peserta.push({ nama, jabatan: jabatan || '-', hadir: true });
  });

  const data = {
    nomor: document.getElementById('ba-nomor').value.trim(),
    judul: document.getElementById('ba-judul').value.trim(),
    tanggal: document.getElementById('ba-tanggal').value,
    jam: document.getElementById('ba-jam').value,
    jamSelesai: document.getElementById('ba-jam-selesai').value,
    lokasi: document.getElementById('ba-lokasi').value.trim(),
    agenda: document.getElementById('ba-agenda').value.trim(),
    hasil: document.getElementById('ba-hasil').value.trim(),
    peserta,
    penandatangan: {
      kiri: {
        jabatan: document.getElementById('ttd-kiri-jabatan').value.trim(),
        nama: document.getElementById('ttd-kiri-nama').value.trim()
      },
      kanan: {
        jabatan: document.getElementById('ttd-kanan-jabatan').value.trim(),
        nama: document.getElementById('ttd-kanan-nama').value.trim()
      }
    }
  };

  if (editingId) {
    Storage.updateBeritaAcara(editingId, data);
    showToast('Berita acara berhasil diperbarui!', 'success');
  } else {
    Storage.addBeritaAcara(data);
    showToast('Berita acara berhasil ditambahkan!', 'success');
  }

  closeModal('modal-form');
  renderBA();
  updateStats();
}

// ---- Peserta Rows ----
function initDefaultPeserta() {
  const defaultPeserta = [
    { nama: 'Ahmad Habibi', jabatan: 'Ketua KKN' },
    { nama: 'Nur Rahmawati', jabatan: 'Sekretaris' },
  ];
  defaultPeserta.forEach(p => addPesertaRow(p.nama, p.jabatan));
}

function resetPesertaList() {
  const container = document.getElementById('peserta-list');
  if (container) container.innerHTML = '';
  pesertaCount = 0;
}

function addPesertaRow(nama = '', jabatan = '') {
  const container = document.getElementById('peserta-list');
  if (!container) return;
  pesertaCount++;
  const idx = pesertaCount;
  const row = document.createElement('div');
  row.className = 'peserta-row form-row';
  row.style.cssText = 'margin-bottom:0.75rem;align-items:center;gap:0.75rem;';
  row.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:center;width:28px;height:28px;background:var(--bg-card2);border-radius:6px;font-size:0.75rem;color:var(--text-muted);flex-shrink:0;font-weight:700;">${idx}</div>
    <div style="flex:1.5;">
      <input type="text" class="form-input p-nama" placeholder="Nama peserta" value="${escHtml(nama)}" />
    </div>
    <div style="flex:1;">
      <input type="text" class="form-input p-jabatan" placeholder="Jabatan/status" value="${escHtml(jabatan)}" />
    </div>
    <button type="button" onclick="this.parentElement.remove()" style="width:32px;height:32px;border-radius:8px;background:rgba(239,68,68,0.12);color:#f87171;border:1px solid rgba(239,68,68,0.2);display:flex;align-items:center;justify-content:center;flex-shrink:0;cursor:pointer;font-size:1rem;transition:var(--transition);" title="Hapus">✕</button>
  `;
  container.appendChild(row);
}

// ---- View Detail ----
function viewBAById(id) {
  const ba = Storage.getBeritaAcaraById(id);
  if (ba) viewBA(ba);
}

function viewBA(ba) {
  if (typeof ba === 'string') {
    try { ba = JSON.parse(ba); } catch(e) { return; }
  }
  viewingBA = ba;

  const body = document.getElementById('modal-detail-body');
  if (!body) return;

  const pesertaRows = (ba.peserta || []).map((p, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${escHtml(p.nama)}</td>
      <td>${escHtml(p.jabatan || '-')}</td>
      <td style="text-align:center;">${p.hadir !== false ? '✅' : '❌'}</td>
    </tr>
  `).join('');

  body.innerHTML = `
    <div class="ba-print-document" id="ba-document-preview">
      <!-- Document Header -->
      <div class="ba-doc-header">
        <div class="ba-doc-logo">🎓</div>
        <div class="ba-doc-header-text">
          <h2>KULIAH KERJA NYATA (KKN) UNISNU XXI</h2>
          <p>Universitas Islam Nahdlatul Ulama (UNISNU) Jepara<br/>
          Desa Buaran, Kecamatan Mayong, Kabupaten Jepara · Tahun 2026</p>
        </div>
      </div>

      <!-- Title -->
      <div class="ba-doc-title-section">
        <h1>BERITA ACARA</h1>
        <div class="ba-doc-number">Nomor: ${escHtml(ba.nomor || '-')}</div>
      </div>

      <!-- Body -->
      <div class="ba-doc-body">
        <p class="ba-doc-intro">
          Pada hari ini, <strong>${formatDateLong(ba.tanggal)}</strong>, telah dilaksanakan kegiatan sebagaimana tercatat dalam berita acara ini.
        </p>

        <div class="ba-doc-content-title">I. INFORMASI KEGIATAN</div>
        <table class="ba-doc-table">
          <tr>
            <td>Judul Kegiatan</td><td>:</td>
            <td><strong>${escHtml(ba.judul)}</strong></td>
          </tr>
          <tr>
            <td>Tanggal</td><td>:</td>
            <td>${formatDateLong(ba.tanggal)}</td>
          </tr>
          <tr>
            <td>Waktu</td><td>:</td>
            <td>${ba.jam || '-'}${ba.jamSelesai ? ' s.d. ' + ba.jamSelesai + ' WIB' : ' WIB'}</td>
          </tr>
          <tr>
            <td>Lokasi</td><td>:</td>
            <td>${escHtml(ba.lokasi)}</td>
          </tr>
          <tr>
            <td>Jumlah Peserta</td><td>:</td>
            <td>${ba.peserta ? ba.peserta.length : 0} orang</td>
          </tr>
        </table>

        <div class="ba-doc-content-title">II. URAIAN KEGIATAN</div>
        <div class="ba-doc-content-text">${escHtml(ba.agenda || '-')}</div>

        ${ba.hasil ? `
        <div class="ba-doc-content-title">III. HASIL KEGIATAN</div>
        <div class="ba-doc-content-text">${escHtml(ba.hasil)}</div>
        ` : ''}

        ${ba.peserta && ba.peserta.length ? `
        <div class="ba-doc-peserta-section">
          <h4>IV. DAFTAR HADIR PESERTA</h4>
          <table class="peserta-table">
            <thead>
              <tr>
                <th style="width:40px;">No</th>
                <th>Nama</th>
                <th>Jabatan/Status</th>
                <th style="width:80px;text-align:center;">Hadir</th>
              </tr>
            </thead>
            <tbody>
              ${pesertaRows}
            </tbody>
          </table>
        </div>
        ` : ''}

        <!-- Signatures -->
        <div class="ba-doc-sign-section">
          <h4>PENANDATANGAN</h4>
          <div class="sign-grid">
            <div class="sign-item">
              <div class="sign-label">${escHtml(ba.penandatangan?.kiri?.jabatan || 'Mengetahui')}</div>
              <div class="sign-name-blank"></div>
              <div class="sign-name">${escHtml(ba.penandatangan?.kiri?.nama || '')}</div>
            </div>
            <div class="sign-item">
              <div class="sign-label">${escHtml(ba.penandatangan?.kanan?.jabatan || 'Pelaksana')}</div>
              <div class="sign-name-blank"></div>
              <div class="sign-name">${escHtml(ba.penandatangan?.kanan?.nama || '')}</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  `;

  openModal('modal-detail');
}

function printBeritaAcara() {
  if (!viewingBA) return;
  const docEl = document.getElementById('ba-document-preview');
  if (!docEl) return;

  const printArea = document.getElementById('print-area');
  printArea.innerHTML = docEl.outerHTML;
  printArea.style.display = 'block';

  // Override styles for print
  document.body.classList.add('printing');
  window.print();
  document.body.classList.remove('printing');
  printArea.style.display = 'none';
  printArea.innerHTML = '';
}

function printBAById(id) {
  const ba = Storage.getBeritaAcaraById(id);
  if (!ba) return;
  viewBA(ba);
  setTimeout(() => {
    printBeritaAcara();
  }, 400);
}

// ---- Delete ----
function confirmDelete(id, judul) {
  deletingId = id;
  const text = document.getElementById('delete-confirm-text');
  if (text) text.innerHTML = `Berita acara "<strong>${escHtml(judul)}</strong>" akan dihapus permanen.`;

  const btn = document.getElementById('btn-confirm-delete');
  btn.onclick = () => {
    Storage.deleteBeritaAcara(deletingId);
    closeModal('modal-delete');
    renderBA();
    updateStats();
    showToast('Berita acara berhasil dihapus.', 'info');
    deletingId = null;
  };

  openModal('modal-delete');
}

// ---- Modal Helpers ----
function openModal(id) {
  const el = document.getElementById(id);
  if (el) {
    el.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (el) {
    el.classList.remove('open');
    document.body.style.overflow = '';
  }
}

// Close on overlay click
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-overlay')) {
    closeModal(e.target.id);
  }
});

// Close on Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.open').forEach(m => closeModal(m.id));
  }
});

// ---- Utility ----
function formatDate(dateStr) {
  if (!dateStr) return '-';
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function formatDateLong(dateStr) {
  if (!dateStr) return '-';
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function toRoman(num) {
  const map = { 1:'I',2:'II',3:'III',4:'IV',5:'V',6:'VI',7:'VII',8:'VIII',9:'IX',10:'X',11:'XI',12:'XII' };
  return map[num] || String(num);
}

function escHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  const icon = document.getElementById('toast-icon');
  const text = document.getElementById('toast-text');
  if (!toast) return;
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  toast.className = `toast toast-${type} show`;
  if (icon) icon.textContent = icons[type] || '✅';
  if (text) text.textContent = message;
  setTimeout(() => toast.classList.remove('show'), 3500);
}

// ---- Print styles override ----
const printStyle = document.createElement('style');
printStyle.textContent = `
  @media print {
    body > *:not(#print-area) { display: none !important; }
    #print-area { display: block !important; }
    .ba-print-document { font-family: 'Times New Roman', serif !important; }
    .ba-doc-header { background: white !important; color: black !important; }
    .sign-name-blank { height: 50px; border-bottom: 1px solid black; margin: 0 0.5rem 0.4rem; }
  }
`;
document.head.appendChild(printStyle);
