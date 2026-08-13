// =========================================
//   KKN UNISNU XXI - LOCAL STORAGE MODULE
//   Shared data layer for Berita Acara
// =========================================

const KKN_STORAGE_KEY = 'kkn_unisnu_xxi_data';

// Default sample data
const defaultData = {
  beritaAcara: [
    {
      id: 'ba-001',
      nomor: '001/BA/KKN-UNISNU-XXI/VII/2026',
      judul: 'Pembukaan dan Penerjunan KKN UNISNU XXI',
      tanggal: '2026-07-05',
      jam: '08.00',
      jamSelesai: '11.00',
      lokasi: 'Balai Desa Buaran, Kec. Mayong, Jepara',
      agenda: 'Upacara penerjunan resmi mahasiswa KKN UNISNU XXI ke Desa Buaran oleh Rektor UNISNU Jepara dan serah terima kepada Kepala Desa Buaran.',
      hasil: 'Mahasiswa KKN UNISNU XXI resmi diterima oleh Kepala Desa Buaran. Kegiatan berlangsung khidmat dan dihadiri oleh seluruh perangkat desa.',
      peserta: [
        { nama: 'Ahmad Habibi', jabatan: 'Ketua KKN', hadir: true },
        { nama: 'Nur Rahmawati', jabatan: 'Sekretaris', hadir: true },
        { nama: 'Siti Fatimah', jabatan: 'Bendahara', hadir: true },
        { nama: 'Pak Sugiono', jabatan: 'Kepala Desa Buaran', hadir: true },
        { nama: 'Pak Drs. H. Mahmud', jabatan: 'DPL UNISNU', hadir: true },
      ],
      penandatangan: {
        kiri: { jabatan: 'Dosen Pembimbing Lapangan', nama: 'Drs. H. Mahmud, M.Pd.' },
        kanan: { jabatan: 'Ketua KKN', nama: 'Ahmad Habibi' }
      },
      createdAt: new Date('2026-07-05').toISOString()
    },
    {
      id: 'ba-002',
      nomor: '002/BA/KKN-UNISNU-XXI/VII/2026',
      judul: 'Koordinasi Awal dengan Perangkat Desa',
      tanggal: '2026-07-07',
      jam: '13.00',
      jamSelesai: '15.30',
      lokasi: 'Kantor Desa Buaran',
      agenda: 'Koordinasi awal dengan perangkat desa Buaran terkait rencana program kerja KKN, pembagian tugas, dan penjadwalan kegiatan selama masa KKN.',
      hasil: 'Disepakati kalender kegiatan KKN bersama perangkat desa. Perangkat desa sangat terbuka dan mendukung seluruh program kerja yang direncanakan.',
      peserta: [
        { nama: 'Ahmad Habibi', jabatan: 'Ketua KKN', hadir: true },
        { nama: 'Nur Rahmawati', jabatan: 'Sekretaris', hadir: true },
        { nama: 'Pak Sugiono', jabatan: 'Kepala Desa', hadir: true },
        { nama: 'Pak Sumarno', jabatan: 'Sekdes', hadir: true },
        { nama: 'Ibu Kartini', jabatan: 'Kaur Pembangunan', hadir: true },
      ],
      penandatangan: {
        kiri: { jabatan: 'Kepala Desa Buaran', nama: 'Sugiono' },
        kanan: { jabatan: 'Ketua KKN', nama: 'Ahmad Habibi' }
      },
      createdAt: new Date('2026-07-07').toISOString()
    },
    {
      id: 'ba-003',
      nomor: '003/BA/KKN-UNISNU-XXI/VII/2026',
      judul: 'Kegiatan Bimbingan Belajar Perdana',
      tanggal: '2026-07-10',
      jam: '15.30',
      jamSelesai: '17.00',
      lokasi: 'SD Negeri Buaran 01',
      agenda: 'Pelaksanaan program bimbingan belajar perdana bagi siswa SD di Desa Buaran, meliputi mata pelajaran Matematika, Bahasa Indonesia, dan IPA.',
      hasil: 'Bimbingan belajar perdana diikuti oleh 32 siswa kelas 4-6 SD Negeri Buaran 01. Antusias siswa sangat tinggi. Program dijadwalkan setiap Selasa dan Kamis pukul 15.30-17.00.',
      peserta: [
        { nama: 'Dewi Kartika', jabatan: 'PJ Program Bimbel', hadir: true },
        { nama: 'Yusuf Setiawan', jabatan: 'Tutor Matematika', hadir: true },
        { nama: 'Indah Novia', jabatan: 'Tutor Bahasa Indonesia', hadir: true },
        { nama: 'Bapak Suyitno', jabatan: 'Kepala SDN Buaran 01', hadir: true },
        { nama: '32 Siswa Kelas 4-6', jabatan: 'Peserta Bimbel', hadir: true },
      ],
      penandatangan: {
        kiri: { jabatan: 'Kepala SDN Buaran 01', nama: 'Suyitno, S.Pd.' },
        kanan: { jabatan: 'PJ Program Bimbel', nama: 'Dewi Kartika' }
      },
      createdAt: new Date('2026-07-10').toISOString()
    }
  ]
};

const Storage = {
  getData() {
    try {
      const raw = localStorage.getItem(KKN_STORAGE_KEY);
      if (!raw) {
        this.setData(defaultData);
        return defaultData;
      }
      return JSON.parse(raw);
    } catch (e) {
      return defaultData;
    }
  },

  setData(data) {
    localStorage.setItem(KKN_STORAGE_KEY, JSON.stringify(data));
  },

  getBeritaAcara() {
    return this.getData().beritaAcara || [];
  },

  addBeritaAcara(ba) {
    const data = this.getData();
    data.beritaAcara = data.beritaAcara || [];
    ba.id = 'ba-' + Date.now();
    ba.createdAt = new Date().toISOString();
    data.beritaAcara.unshift(ba);
    this.setData(data);
    return ba;
  },

  updateBeritaAcara(id, updatedBa) {
    const data = this.getData();
    const idx = data.beritaAcara.findIndex(b => b.id === id);
    if (idx !== -1) {
      data.beritaAcara[idx] = { ...data.beritaAcara[idx], ...updatedBa };
      this.setData(data);
      return data.beritaAcara[idx];
    }
    return null;
  },

  deleteBeritaAcara(id) {
    const data = this.getData();
    data.beritaAcara = data.beritaAcara.filter(b => b.id !== id);
    this.setData(data);
  },

  getBeritaAcaraById(id) {
    return this.getBeritaAcara().find(b => b.id === id) || null;
  }
};
