import { useEffect, useMemo, useState } from 'react';
import { Link, Route, Routes } from 'react-router-dom';
import { ADMIN_EMAIL, supabase } from './lib/supabase';

const DRIVERS = [
  {
    id: 'driver-1',
    nama: 'Kace',
    nomorHp: '6282115642318',
  },
  {
    id: 'driver-2',
    nama: 'Agi',
    nomorHp: '6282124527658',
  },
];

const APK_DOWNLOAD_URL =
  'https://github.com/LuthfiIrhamZulafa/lapar-manten-apk/releases/download/v1.0.0/lapar-manten.apk';

const DRIVER_STATUSES = [
  'Mencari Driver',
  'Driver ke Resto',
  'Sedang Diantar',
  'Selesai',
];

function formatRupiah(nilai) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Number(nilai || 0));
}

function formatTanggal(tanggal) {
  if (!tanggal) return '-';

  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(tanggal));
}

function formatTanggalPesan(tanggal) {
  if (!tanggal) return '-';

  const date = new Date(tanggal);

  const tahun = date.getFullYear();
  const bulan = String(date.getMonth() + 1).padStart(2, '0');
  const hari = String(date.getDate()).padStart(2, '0');
  const jam = String(date.getHours()).padStart(2, '0');
  const menit = String(date.getMinutes()).padStart(2, '0');

  return `${tahun}-${bulan}-${hari} ${jam}:${menit}`;
}

function formatTotalPesan(nilai) {
  return `Rp ${Number(nilai || 0)}`;
}

function ambilCatatanBersih(item) {
  const catatan = String(item.catatan || '').trim();
  const namaMenu = String(item.nama_menu || '').trim();

  if (!catatan) {
    return '-';
  }

  const catatanKecil = catatan.toLowerCase();
  const awalan = `${namaMenu}:`.toLowerCase();

  if (namaMenu && catatanKecil.startsWith(awalan)) {
    return catatan.substring(catatan.indexOf(':') + 1).trim();
  }

  return catatan;
}

function buatPesanDriver(item) {
  const nomorNota = item.id ?? item.order_id ?? '-';
  const jumlah = item.jumlah ?? 1;
  const namaMenu = item.nama_menu || '-';
  const detailPesanan = item.detail_pesanan || '-';
  const catatan = ambilCatatanBersih(item);

  const lokasi =
    item.latitude_tujuan != null &&
    item.longitude_tujuan != null
      ? `https://www.google.com/maps/search/?api=1&query=${item.latitude_tujuan},${item.longitude_tujuan}`
      : '-';

  return [
    '📢 *ORDERAN LAPAR MANTEN BARU!*',
    '',
    `🆔 *Nota:* #${nomorNota}`,
    `⏰ *Waktu Order:* ${formatTanggalPesan(item.created_at)}`,
    '',
    '🍽️ *Rincian Pesanan:*',
    `• ${namaMenu} (${jumlah} Porsi)`,
    `Detail: ${detailPesanan}`,
    '',
    '📌 *Catatan:*',
    catatan,
    '',
    `💳 *Metode Pembayaran:* ${item.metode_pembayaran || '-'}`,
    `💰 *Total Bayar:* ${formatTotalPesan(item.total_harga)}`,
    '',
    `👤 *Nama Penerima:* ${item.nama_penerima || '-'}`,
    `📞 *No HP:* ${item.no_hp_penerima || '-'}`,
    '🏠 *Alamat Lengkap:*',
    item.alamat_lengkap_manual || '-',
    '',
    '📍 *Lokasi Pengantaran:*',
    lokasi,
    '',
    'Silakan konfirmasi ke admin jika orderan ini sudah siap diantar!',
  ].join('\n');
}

function LandingPage() {
  return (
    <div className="site-page">
      <header className="site-header">
        <Link className="brand" to="/">
          <img src="/logo-lapar-manten.png" alt="Logo Lapar Manten" />
          <div>
            <strong>Lapar Manten</strong>
            <span>Delivery Sumedang</span>
          </div>
        </Link>

        <nav>
          <a href="#layanan">Layanan</a>
          <a href="#cara-pesan">Cara Pesan</a>
          <a href={APK_DOWNLOAD_URL}>Download Aplikasi</a>
          <Link className="admin-link" to="/admin">
            Login Admin
          </Link>
        </nav>
      </header>

      <main>
        <section className="hero">
          <div className="hero-content">
            <span className="eyebrow">Antar makanan wilayah Sumedang</span>
            <h1>Makanan favorit datang langsung ke lokasi Anda.</h1>
            <p>
              Pesan makanan melalui aplikasi Lapar Manten dan pantau status
              pesanan sampai driver mengantarkan ke tujuan.
            </p>

            <div className="hero-buttons">
              <a className="button primary" href={APK_DOWNLOAD_URL}>
                Download Aplikasi Android
              </a>

              <a className="button secondary" href="#cara-pesan">
                Cara Memesan
              </a>

              <Link className="button secondary" to="/admin">
                Login Admin
              </Link>
            </div>
          </div>

          <div className="hero-logo">
            <img src="/logo-lapar-manten.png" alt="Lapar Manten Delivery" />
          </div>
        </section>

        <section className="section" id="layanan">
          <div className="section-heading">
            <span>Layanan kami</span>
            <h2>Pengiriman makanan yang mudah dan aman</h2>
          </div>

          <div className="feature-grid">
            <article className="feature-card">
              <div className="feature-number">01</div>
              <h3>Pilih makanan</h3>
              <p>Pelanggan memilih makanan melalui aplikasi Lapar Manten.</p>
            </article>

            <article className="feature-card">
              <div className="feature-number">02</div>
              <h3>Konfirmasi pembayaran</h3>
              <p>Admin memeriksa pesanan dan bukti pembayaran pelanggan.</p>
            </article>

            <article className="feature-card">
              <div className="feature-number">03</div>
              <h3>Diantar driver</h3>
              <p>Admin meneruskan data pesanan kepada driver yang dipilih.</p>
            </article>
          </div>
        </section>

        <section className="section steps-section" id="cara-pesan">
          <div>
            <span className="eyebrow">Cara memesan</span>
            <h2>Tiga langkah untuk menerima pesanan</h2>
          </div>

          <ol className="steps">
            <li>Buka aplikasi Lapar Manten.</li>
            <li>Pilih menu dan selesaikan pembayaran.</li>
            <li>Tunggu admin mengirimkan pesanan kepada driver.</li>
          </ol>
        </section>
      </main>

      <footer>
        <img src="/logo-lapar-manten.png" alt="" />
        <p>© 2026 Lapar Manten Delivery.</p>
      </footer>
    </div>
  );
}

function LoginAdmin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [pesanError, setPesanError] = useState('');

  async function login(event) {
    event.preventDefault();

    setLoading(true);
    setPesanError('');

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      setPesanError('Email atau kata sandi admin salah.');
    }

    setLoading(false);
  }

  return (
    <div className="login-page">
      <Link className="back-link" to="/">
        ← Kembali ke landing page
      </Link>

      <form className="login-card" onSubmit={login}>
        <img src="/logo-lapar-manten.png" alt="Logo Lapar Manten" />

        <h1>Login Admin</h1>

        <p>Masuk menggunakan akun admin Supabase.</p>

        <label>
          Email admin
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="admin@email.com"
            required
          />
        </label>

        <label>
          Kata sandi
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Masukkan kata sandi"
            required
          />
        </label>

        {pesanError && <div className="error-message">{pesanError}</div>}

        <button className="button primary" disabled={loading}>
          {loading ? 'Sedang masuk...' : 'Masuk sebagai Admin'}
        </button>
      </form>
    </div>
  );
}

function AdminDashboard({ session }) {
  const [pesanan, setPesanan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorPesanan, setErrorPesanan] = useState('');
  const [pencarian, setPencarian] = useState('');
  const [filterStatus, setFilterStatus] = useState('Semua');
  const [urutan, setUrutan] = useState('terbaru');
  const [driverTerpilih, setDriverTerpilih] = useState({});
  const [sedangDiproses, setSedangDiproses] = useState('');

  async function ambilPesanan() {
    const { data, error } = await supabase
      .from('pemesanan')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      setErrorPesanan(`Gagal mengambil pesanan: ${error.message}`);
    } else {
      setPesanan(data || []);
      setErrorPesanan('');
    }

    setLoading(false);
  }

  useEffect(() => {
    ambilPesanan();

    const channel = supabase
      .channel('pemesanan-admin')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pemesanan',
        },
        () => {
          ambilPesanan();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const pesananTampil = useMemo(() => {
    const kata = pencarian.trim().toLowerCase();

    const hasil = pesanan.filter((item) => {
      const cocokPencarian =
        !kata ||
        String(item.order_id || '').toLowerCase().includes(kata) ||
        String(item.nama_menu || '').toLowerCase().includes(kata) ||
        String(item.nama_penerima || '').toLowerCase().includes(kata) ||
        String(item.no_hp_penerima || '').toLowerCase().includes(kata);

      const cocokStatus =
        filterStatus === 'Semua' || item.status === filterStatus;

      return cocokPencarian && cocokStatus;
    });

    return [...hasil].sort((a, b) => {
      const tanggalA = new Date(a.created_at || 0).getTime();
      const tanggalB = new Date(b.created_at || 0).getTime();

      return urutan === 'terbaru'
        ? tanggalB - tanggalA
        : tanggalA - tanggalB;
    });
  }, [pesanan, pencarian, filterStatus, urutan]);

  async function updatePesanan(item, perubahan) {
    const orderId = item.order_id;
    setSedangDiproses(String(orderId));

    const { error } = await supabase
      .from('pemesanan')
      .update(perubahan)
      .eq('order_id', orderId);

    setSedangDiproses('');

    if (error) {
      alert(`Gagal memperbarui pesanan: ${error.message}`);
      return false;
    }

    await ambilPesanan();
    return true;
  }

  async function kirimKeDriver(item) {
  const orderId = String(item.order_id);
  const idDriver = driverTerpilih[orderId];

  if (!idDriver) {
    alert('Pilih driver terlebih dahulu.');
    return;
  }

  const driver = DRIVERS.find(
    (data) => data.id === idDriver,
  );

  if (!driver) {
    alert('Data driver tidak ditemukan.');
    return;
  }

  if (
    !driver.nomorHp ||
    driver.nomorHp === '6281234567890'
  ) {
    alert(
      'Nomor driver masih nomor contoh. Ganti nomor driver di App.jsx.',
    );
    return;
  }

  const pesan = buatPesanDriver(item);

  const urlWhatsApp =
    `https://wa.me/${driver.nomorHp}` +
    `?text=${encodeURIComponent(pesan)}`;

  // Harus dibuka langsung saat tombol diklik.
  // Jangan diletakkan setelah await.
  const tabWhatsApp = window.open(
    'about:blank',
    '_blank',
  );

  if (!tabWhatsApp) {
    alert(
      'Browser memblokir WhatsApp. Izinkan pop-up untuk website ini, kemudian coba lagi.',
    );
    return;
  }

  tabWhatsApp.document.title = 'Membuka WhatsApp';
  tabWhatsApp.document.body.innerHTML =
    '<p style="font-family:Arial;padding:24px">Membuka WhatsApp driver...</p>';

  const berhasil = await updatePesanan(item, {
    nama_driver: driver.nama,
    no_hp_driver: driver.nomorHp,
    status_driver:
      item.status_driver || 'Mencari Driver',
  });

  if (!berhasil) {
    tabWhatsApp.close();
    return;
  }

  tabWhatsApp.location.href = urlWhatsApp;
}

  async function logout() {
    await supabase.auth.signOut();
  }

  return (
    <div className="admin-page">
      <header className="admin-header">
        <div className="brand">
          <img src="/logo-lapar-manten.png" alt="" />
          <div>
            <strong>Admin Lapar Manten</strong>
            <span>{session.user.email}</span>
          </div>
        </div>

        <button className="button danger-outline" onClick={logout}>
          Keluar
        </button>
      </header>

      <main className="dashboard">
        <div className="dashboard-title">
          <div>
            <span className="eyebrow">Dashboard admin</span>
            <h1>Daftar Pesanan</h1>
          </div>

          <button className="button secondary" onClick={ambilPesanan}>
            Muat Ulang
          </button>
        </div>

        <section className="summary-grid">
          <div className="summary-card">
            <span>Total pesanan</span>
            <strong>{pesanan.length}</strong>
          </div>

          <div className="summary-card">
            <span>Menunggu konfirmasi</span>
            <strong>
              {
                pesanan.filter(
                  (item) => item.status === 'Menunggu Konfirmasi',
                ).length
              }
            </strong>
          </div>

          <div className="summary-card">
            <span>Sudah dikonfirmasi</span>
            <strong>
              {
                pesanan.filter(
                  (item) => item.status === 'Dikonfirmasi',
                ).length
              }
            </strong>
          </div>
        </section>

        <section className="filter-bar">
          <input
            value={pencarian}
            onChange={(event) => setPencarian(event.target.value)}
            placeholder="Cari nomor pesanan, menu, atau penerima"
          />

          <select
            value={filterStatus}
            onChange={(event) => setFilterStatus(event.target.value)}
          >
            <option value="Semua">Semua status</option>
            <option value="Menunggu Konfirmasi">
              Menunggu Konfirmasi
            </option>
            <option value="Dikonfirmasi">Dikonfirmasi</option>
            <option value="Dibatalkan">Dibatalkan</option>
          </select>

          <select
            value={urutan}
            onChange={(event) => setUrutan(event.target.value)}
          >
            <option value="terbaru">Pesanan terbaru</option>
            <option value="terlama">Pesanan terlama</option>
          </select>
        </section>

        {loading && <p>Memuat pesanan...</p>}

        {errorPesanan && (
          <div className="error-message">{errorPesanan}</div>
        )}

        {!loading && !errorPesanan && pesananTampil.length === 0 && (
          <div className="empty-state">Belum ada pesanan.</div>
        )}

        <section className="orders-grid">
          {pesananTampil.map((item) => {
            const orderId = String(item.order_id);
            const sedangLoading = sedangDiproses === orderId;

            return (
              <article className="order-card" key={orderId}>
                <div className="order-top">
                  <div>
                    <span className="order-id">
                      #{item.order_id || '-'}
                    </span>
                    <h2>{item.nama_menu || 'Pesanan'}</h2>
                  </div>

                  <span className="status-badge">
                    {item.status || 'Belum ada status'}
                  </span>
                </div>

                <div className="order-details">
                  <p>
                    <span>Penerima</span>
                    <strong>{item.nama_penerima || '-'}</strong>
                  </p>

                  <p>
                    <span>Nomor HP</span>
                    <strong>{item.no_hp_penerima || '-'}</strong>
                  </p>

                  <p>
                    <span>Jumlah</span>
                    <strong>{item.jumlah || '-'}</strong>
                  </p>

                  <p>
                    <span>Total</span>
                    <strong>{formatRupiah(item.total_harga)}</strong>
                  </p>

                  <p>
                    <span>Alamat</span>
                    <strong>{item.alamat_lengkap_manual || '-'}</strong>
                  </p>

                  <p>
                    <span>Dibuat</span>
                    <strong>{formatTanggal(item.created_at)}</strong>
                  </p>

                  <p>
                    <span>Driver</span>
                    <strong>{item.nama_driver || 'Belum dipilih'}</strong>
                  </p>

                  <p>
                    <span>Status driver</span>
                    <strong>{item.status_driver || 'Mencari Driver'}</strong>
                  </p>
                </div>

                {item.bukti_transfer &&
                  String(item.bukti_transfer).startsWith('http') && (
                    <a
                      className="proof-link"
                      href={item.bukti_transfer}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Lihat bukti pembayaran
                    </a>
                  )}

                <div className="order-actions">
                  <button
                    className="button success"
                    disabled={sedangLoading}
                    onClick={() =>
                      updatePesanan(item, {
                        status: 'Dikonfirmasi',
                      })
                    }
                  >
                    Konfirmasi
                  </button>

                  <button
                    className="button danger"
                    disabled={sedangLoading}
                    onClick={() =>
                      updatePesanan(item, {
                        status: 'Dibatalkan',
                      })
                    }
                  >
                    Batalkan
                  </button>
                </div>

                <div className="driver-box">
                  <label>Pilih driver</label>

                  <select
                    value={driverTerpilih[orderId] || ''}
                    onChange={(event) =>
                      setDriverTerpilih((sebelumnya) => ({
                        ...sebelumnya,
                        [orderId]: event.target.value,
                      }))
                    }
                  >
                    <option value="">Pilih salah satu driver</option>
                    {DRIVERS.map((driver) => (
                      <option key={driver.id} value={driver.id}>
                        {driver.nama}
                      </option>
                    ))}
                  </select>

                  <button
                    className="button whatsapp"
                    disabled={sedangLoading}
                    onClick={() => kirimKeDriver(item)}
                  >
                    Kirim Pesanan ke WhatsApp Driver
                  </button>

                  <div className="driver-status-section">
                    <label>Status pengantaran</label>

                    <select
                      value={item.status_driver || 'Mencari Driver'}
                      disabled={sedangLoading}
                      onChange={(event) =>
                        updatePesanan(item, {
                          status_driver: event.target.value,
                        })
                      }
                    >
                      {DRIVER_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      </main>
    </div>
  );
}

function AdminPage() {
  const [session, setSession] = useState(null);
  const [memeriksaLogin, setMemeriksaLogin] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setMemeriksaLogin(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, sessionBaru) => {
      setSession(sessionBaru);
      setMemeriksaLogin(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (memeriksaLogin) {
    return <div className="page-loading">Memeriksa akun admin...</div>;
  }

  if (!session) {
    return <LoginAdmin />;
  }

  const emailLogin = session.user.email?.toLowerCase();
  const emailAdmin = ADMIN_EMAIL?.toLowerCase();

  if (emailLogin !== emailAdmin) {
    return (
      <div className="login-page">
        <div className="login-card">
          <h1>Akses ditolak</h1>

          <p>Akun ini bukan akun admin Lapar Manten.</p>

          <button
            className="button danger"
            onClick={() => supabase.auth.signOut()}
          >
            Keluar
          </button>
        </div>
      </div>
    );
  }

  return <AdminDashboard session={session} />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/admin" element={<AdminPage />} />
    </Routes>
  );
}