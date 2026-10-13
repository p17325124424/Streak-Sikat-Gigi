import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Users, 
  Flame, 
  Star, 
  Sparkles, 
  Search, 
  RefreshCw, 
  Crown, 
  CheckCircle2, 
  Calendar, 
  AlertCircle,
  Award
} from 'lucide-react';
import { CloudUserProfile, fetchAllUsersForSuperAdmin, SUPER_ADMIN_EMAIL } from '../firebase';

interface SuperAdminPanelProps {
  currentUserEmail?: string;
  onClose: () => void;
}

export const SuperAdminPanel: React.FC<SuperAdminPanelProps> = ({ currentUserEmail, onClose }) => {
  const [users, setUsers] = useState<CloudUserProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadUsers = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const data = await fetchAllUsersForSuperAdmin();
      setUsers(data);
    } catch (err) {
      console.error(err);
      setErrorMessage('Gagal memuat data pengguna dari cloud. Pastikan hak akses Super Admin valid.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    return (
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.displayName && u.displayName.toLowerCase().includes(q))
    );
  });

  const totalUsersCount = users.length;
  const totalSessionsCount = users.reduce((acc, u) => acc + (u.totalSessions || 0), 0);
  const totalStarsCount = users.reduce((acc, u) => acc + (u.totalStars || 0), 0);
  const highestStreak = users.reduce((max, u) => Math.max(max, u.bestStreak || 0), 0);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Super Admin Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500 via-rose-600 to-indigo-700 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-amber-200 text-xs font-black uppercase tracking-wider border border-white/30">
              <Crown className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
              <span>Panel Super Admin</span>
            </div>
            <h2 className="font-display font-black text-2xl sm:text-3xl tracking-tight">
              Pusat Kendali Pengguna GigiJuara 👑
            </h2>
            <p className="text-xs sm:text-sm text-sky-100 max-w-xl">
              Memantau data akun Gmail masing-masing pengguna, kebiasaan sikat gigi 2x sehari, total streak, dan progres kebersihan gigi anak.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={loadUsers}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-bold text-xs transition border border-white/20 shadow-xs cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Segarkan Data</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl bg-white text-slate-800 font-bold text-xs shadow-md hover:bg-slate-100 transition cursor-pointer"
            >
              Tutup Panel
            </button>
          </div>
        </div>

        {/* Admin identifier */}
        <div className="mt-4 pt-4 border-t border-white/20 flex flex-wrap items-center justify-between text-[11px] text-white/80 gap-2">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
            <span>Masuk Sebagai Super Admin: <strong>{currentUserEmail}</strong></span>
          </div>
          <span className="bg-emerald-400/30 px-2.5 py-0.5 rounded-full text-emerald-200 font-bold border border-emerald-300/40">
            Akses Penuh Firestore Terverifikasi ✓
          </span>
        </div>
      </div>

      {/* Aggregate Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-5 rounded-3xl border border-sky-100 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Total Pengguna Gmail</span>
            <div className="p-2.5 rounded-2xl bg-sky-100 text-sky-700">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="font-display font-black text-2xl sm:text-3xl text-slate-900">
              {totalUsersCount}
            </div>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">Akun tersinkronisasi cloud</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-sky-100 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Total Sesi Sikat</span>
            <div className="p-2.5 rounded-2xl bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="font-display font-black text-2xl sm:text-3xl text-emerald-600">
              {totalSessionsCount}
            </div>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">Sesi 2 menit terlaksana</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-sky-100 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Streak Tertinggi</span>
            <div className="p-2.5 rounded-2xl bg-rose-100 text-rose-700">
              <Flame className="w-5 h-5 fill-rose-500" />
            </div>
          </div>
          <div className="mt-3">
            <div className="font-display font-black text-2xl sm:text-3xl text-rose-600">
              {highestStreak} Hari
            </div>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">Disiplin sikat gigi terlama</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-sky-100 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Total Bintang</span>
            <div className="p-2.5 rounded-2xl bg-amber-100 text-amber-700">
              <Star className="w-5 h-5 fill-amber-400" />
            </div>
          </div>
          <div className="mt-3">
            <div className="font-display font-black text-2xl sm:text-3xl text-amber-500">
              {totalStarsCount}
            </div>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">Hadiah dikumpulkan anak</p>
          </div>
        </div>
      </div>

      {/* User Search & Table */}
      <div className="bg-white rounded-3xl border border-sky-100 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-sky-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-display font-black text-lg text-slate-800">
              Daftar Akun Pengguna & Status Sikat Gigi
            </h3>
            <p className="text-xs text-slate-500">
              Setiap baris menyimpan data progres masing-masing Gmail secara terisolasi dan aman.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari email Gmail / nama..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-sky-400 focus:bg-white transition"
            />
          </div>
        </div>

        {errorMessage && (
          <div className="m-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-extrabold uppercase text-slate-500 tracking-wider">
                <th className="py-3 px-4">Pengguna (Gmail)</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4 text-center">Streak Saat Ini</th>
                <th className="py-3 px-4 text-center">Rekor Streak</th>
                <th className="py-3 px-4 text-center">Total Sesi</th>
                <th className="py-3 px-4 text-center">Bintang ⭐</th>
                <th className="py-3 px-4">Terakhir Sikat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <RefreshCw className="w-6 h-6 animate-spin text-sky-500" />
                      <span>Memuat data pengguna dari Firestore...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Tidak ada akun yang sesuai dengan pencarian.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isSuper = u.role === 'superadmin' || u.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();

                  return (
                    <tr key={u.userId} className="hover:bg-sky-50/50 transition">
                      {/* User Info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          {u.photoURL ? (
                            <img
                              src={u.photoURL}
                              alt={u.displayName}
                              className="w-9 h-9 rounded-full object-cover border border-slate-200"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-sky-400 to-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                              {u.displayName?.charAt(0).toUpperCase() || 'U'}
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              <span>{u.displayName || 'Pengguna'}</span>
                              {isSuper && <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />}
                            </div>
                            <div className="text-[11px] text-slate-500 font-mono">{u.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="py-3.5 px-4">
                        {isSuper ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-extrabold text-[10px] border border-amber-200">
                            👑 Super Admin
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 font-bold text-[10px]">
                            Pengguna Juara
                          </span>
                        )}
                      </td>

                      {/* Current Streak */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center gap-1 font-bold text-rose-600">
                          <Flame className="w-3.5 h-3.5 fill-rose-500" />
                          <span>{u.currentStreak || 0} Hari</span>
                        </span>
                      </td>

                      {/* Best Streak */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="font-bold text-slate-800">
                          {u.bestStreak || 0} Hari
                        </span>
                      </td>

                      {/* Total Sessions */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="font-extrabold text-emerald-600">
                          {u.totalSessions || 0}x
                        </span>
                      </td>

                      {/* Stars */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="font-black text-amber-600 flex items-center justify-center gap-1">
                          <span>⭐</span>
                          <span>{u.totalStars || 0}</span>
                        </span>
                      </td>

                      {/* Last Brushed Date */}
                      <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                        {u.lastBrushedDate ? (
                          <div className="flex items-center gap-1 text-slate-700 font-medium">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>{u.lastBrushedDate}</span>
                          </div>
                        ) : (
                          <span className="italic text-slate-400">Belum ada</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
