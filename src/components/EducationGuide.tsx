import React, { useState } from 'react';
import { BookOpen, Sparkles, Smartphone, WifiOff, ShieldCheck, Heart, RefreshCw } from 'lucide-react';

export const EducationGuide: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'techniques' | 'monsters' | 'offline_guide'>('techniques');

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Tab Switcher */}
      <div className="flex flex-wrap items-center gap-2 bg-white p-3 rounded-3xl shadow-sm border border-sky-100">
        <button
          onClick={() => setActiveSection('techniques')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-display font-bold text-xs md:text-sm transition ${
            activeSection === 'techniques'
              ? 'bg-sky-500 text-white shadow-md'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Cara Sikat Gigi yang Benar</span>
        </button>

        <button
          onClick={() => setActiveSection('monsters')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-display font-bold text-xs md:text-sm transition ${
            activeSection === 'monsters'
              ? 'bg-purple-600 text-white shadow-md'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Ensiklopedia Kuman Gigi</span>
        </button>

        <button
          onClick={() => setActiveSection('offline_guide')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-display font-bold text-xs md:text-sm transition ${
            activeSection === 'offline_guide'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <WifiOff className="w-4 h-4" />
          <span>Panduan Uji Coba Offline (PWA)</span>
        </button>
      </div>

      {/* 4 Langkah Sikat Gigi yang Benar */}
      {activeSection === 'techniques' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="bg-gradient-to-r from-sky-500 to-blue-600 rounded-3xl p-6 text-white shadow-lg">
            <h3 className="font-display font-black text-2xl">
              Panduan Dokter Gigi: 4 Langkah Senyum Sehat 🌟
            </h3>
            <p className="mt-1 text-xs md:text-sm text-sky-100">
              Menyikat gigi bukan sekadar cepat-cepatan, tetapi membersihkan seluruh permukaan gigi secara merata!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Step 1 */}
            <div className="bg-white p-5 rounded-3xl shadow-sm border border-sky-100 flex gap-4">
              <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-700 font-display font-black text-xl flex items-center justify-center flex-shrink-0">
                1
              </div>
              <div>
                <h4 className="font-display font-bold text-base text-slate-800">
                  Gerakan Memutar 45 Derajat 🔄
                </h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Posisikan bulu sikat miring 45 derajat di perbatasan gusi dan gigi. Gerakkan sikat dengan putaran lembut melingkar kecil, bukan maju mundur terlalu keras.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-5 rounded-3xl shadow-sm border border-sky-100 flex gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 font-display font-black text-xl flex items-center justify-center flex-shrink-0">
                2
              </div>
              <div>
                <h4 className="font-display font-bold text-base text-slate-800">
                  Bersihkan Seluruh 4 Kuadran ⏱️
                </h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Bagi mulut menjadi 4 bagian (kanan atas, kiri atas, kiri bawah, kanan bawah). Sikat masing-masing bagian selama 30 detik untuk mencapai durasi ideal 2 menit.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-5 rounded-3xl shadow-sm border border-sky-100 flex gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-800 font-display font-black text-xl flex items-center justify-center flex-shrink-0">
                3
              </div>
              <div>
                <h4 className="font-display font-bold text-base text-slate-800">
                  Jangan Lupa Sikat Lidah 👅
                </h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Bakteri penyebab bau mulut sering menempel di permukaan lidah. Bersihkan lidah dengan lembut dari bagian belakang ke depan.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="bg-white p-5 rounded-3xl shadow-sm border border-sky-100 flex gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 font-display font-black text-xl flex items-center justify-center flex-shrink-0">
                4
              </div>
              <div>
                <h4 className="font-display font-bold text-base text-slate-800">
                  Ganti Sikat Tiap 3 Bulan 🪥
                </h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Bulu sikat yang mekar tidak efektif membersihkan plak dan bisa melukai gusi. Ganti sikat gigi setiap 3 bulan sekali atau setelah sakit sembuh.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ensiklopedia Kuman Gigi */}
      {activeSection === 'monsters' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl p-6 text-white shadow-lg">
            <h3 className="font-display font-black text-2xl">
              Kenali Musuh Gigimu! 👾
            </h3>
            <p className="mt-1 text-xs md:text-sm text-purple-100">
              Inilah monster mikroba yang bersembunyi di sela gigimu saat lupa sikat gigi!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Monster 1 */}
            <div className="bg-white p-5 rounded-3xl shadow-sm border border-rose-100 flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-rose-500 text-white flex items-center justify-center text-3xl flex-shrink-0 shadow-md">
                🍬
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-display font-bold text-base text-slate-800">
                    Kuman Gula (Streptococcus)
                  </h4>
                  <span className="text-[10px] bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full font-bold">
                    Musuh Permen
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Menyukai sisa cokelat, permen, dan biskuit. Mereka memakan gula lalu menghasilkan asam berbahaya yang melubangi lapisan email gigi terluar.
                </p>
              </div>
            </div>

            {/* Monster 2 */}
            <div className="bg-white p-5 rounded-3xl shadow-sm border border-amber-100 flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-500 text-white flex items-center justify-center text-3xl flex-shrink-0 shadow-md">
                👾
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-display font-bold text-base text-slate-800">
                    Plak Kuning Lengket
                  </h4>
                  <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">
                    Lapisan Lendir
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Lapisan tipis licin berisi jutaan kuman. Jika dibiarkan lebih dari 24 jam tanpa sikat gigi, plak akan mengeras menjadi karang gigi yang keras!
                </p>
              </div>
            </div>

            {/* Monster 3 */}
            <div className="bg-white p-5 rounded-3xl shadow-sm border border-purple-100 flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-purple-600 text-white flex items-center justify-center text-3xl flex-shrink-0 shadow-md">
                🧪
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-display font-bold text-base text-slate-800">
                    Asam Pengikis Gigi
                  </h4>
                  <span className="text-[10px] bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full font-bold">
                    Penyebab Ngilu
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Zat asam membuat gigi rapuh dan sensitif saat minum air dingin atau manis. Pasta gigi berfluoride adalah pelindung terbaik dari serangan asam ini.
                </p>
              </div>
            </div>

            {/* Monster 4 */}
            <div className="bg-white p-5 rounded-3xl shadow-sm border border-cyan-100 flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-cyan-600 text-white flex items-center justify-center text-3xl flex-shrink-0 shadow-md">
                👹
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-display font-bold text-base text-slate-800">
                    Monster Karang Gigi (Calculus)
                  </h4>
                  <span className="text-[10px] bg-cyan-100 text-cyan-800 px-2 py-0.5 rounded-full font-bold">
                    Karang Keras
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Karang gigi mengeras seperti batu di sela gigi dan gusi. Hanya bisa dibersihkan dengan perawatan scaling oleh dokter gigi profesional.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Panduan Uji Coba Offline (PWA) */}
      {activeSection === 'offline_guide' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-3xl p-6 text-white shadow-lg">
            <h3 className="font-display font-black text-2xl">
              Panduan Menguji Website Secara Offline (PWA) 📱💻
            </h3>
            <p className="mt-1 text-xs md:text-sm text-emerald-100">
              Aplikasi ini telah dilengkapi Service Worker (`service-worker.js`), Web App Manifest (`manifest.json`), dan LocalStorage sehingga 100% dapat dijalankan tanpa koneksi internet.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Cara 1: Laptop / Chrome DevTools */}
            <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  💻
                </div>
                <h4 className="font-display font-bold text-base text-slate-800">
                  Uji di Komputer / Laptop (DevTools)
                </h4>
              </div>

              <ol className="text-xs text-slate-600 space-y-2 list-decimal list-inside leading-relaxed">
                <li>Buka website ini di Google Chrome / Edge / Firefox.</li>
                <li>Tekan tombol <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-800">F12</code> atau klik kanan lalu pilih <strong>Inspect (Periksa)</strong>.</li>
                <li>Masuk ke tab <strong>Network (Jaringan)</strong>.</li>
                <li>Ubah status jaringan dari <em>"No throttling"</em> menjadi <strong>"Offline"</strong>.</li>
                <li>Tekan tombol Refresh (<code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-800">Ctrl + R</code> / <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-800">F5</code>).</li>
                <li><strong className="text-emerald-700">Hasil:</strong> Halaman web tetap terbuka sempurna, game 2 menit dapat dimainkan, suara Web Audio API berbunyi, dan streak tersimpan!</li>
              </ol>
            </div>

            {/* Cara 2: Smartphone Android / iPhone */}
            <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-800 flex items-center justify-center font-bold">
                  📲
                </div>
                <h4 className="font-display font-bold text-base text-slate-800">
                  Uji di Smartphone (Mode Pesawat)
                </h4>
              </div>

              <ol className="text-xs text-slate-600 space-y-2 list-decimal list-inside leading-relaxed">
                <li>Buka website di browser Chrome (Android) atau Safari (iPhone).</li>
                <li>Klik tombol <strong>"Install Aplikasi"</strong> di bagian atas atau opsi "Tambah ke Layar Utama".</li>
                <li>Setelah ikon GigiJuara muncul di layar utama HP, aktifkan <strong>Mode Pesawat (Airplane Mode)</strong> atau matikan WiFi dan Kuota Data.</li>
                <li>Buka aplikasi GigiJuara dari ikon di layar HP.</li>
                <li><strong className="text-sky-700">Hasil:</strong> Aplikasi terbuka seperti aplikasi asli (native app) dengan layar penuh, tanpa internet!</li>
              </ol>
            </div>
          </div>

          {/* Architecture Overview */}
          <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200">
            <h4 className="font-display font-bold text-base text-slate-800 mb-2">
              Struktur Berkas PWA GigiJuara
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-sky-50 rounded-2xl border border-sky-100">
                <span className="font-mono font-bold text-sky-700 block">/manifest.json</span>
                <span className="text-slate-600 text-[11px] mt-1 block">Konfigurasi nama, ikon PWA 192/512px, warna tema & mode standalone.</span>
              </div>
              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100">
                <span className="font-mono font-bold text-emerald-700 block">/service-worker.js</span>
                <span className="text-slate-600 text-[11px] mt-1 block">Menyimpan cache offline (cache-first), menangani navigasi & notifikasi.</span>
              </div>
              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-100">
                <span className="font-mono font-bold text-amber-800 block">localStorage</span>
                <span className="text-slate-600 text-[11px] mt-1 block">Menyimpan daily streak, bintang, rekor sikat gigi pagi/malam, dan pengaturan jam.</span>
              </div>
              <div className="p-3 bg-purple-50 rounded-2xl border border-purple-100">
                <span className="font-mono font-bold text-purple-700 block">Web Audio API</span>
                <span className="text-slate-600 text-[11px] mt-1 block">Efek suara prosedural sintetis (sikat gigi, gelembung pop, lonceng, fanfare) tanpa unduh file eksternal.</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
