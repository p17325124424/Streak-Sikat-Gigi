/**
 * GigiJuara - Edukasi & Pengingat Sikat Gigi PWA
 * @license Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Storage, getTodayKey } from './utils/storage';
import { sound } from './utils/audio';
import { ToothbrushCharacter, UserStats } from './types';
import { BrushingGame } from './components/BrushingGame';
import { StreakTracker } from './components/StreakTracker';
import { ShopAndBadges } from './components/ShopAndBadges';
import { EducationGuide } from './components/EducationGuide';
import { ReminderModal } from './components/ReminderModal';
import { SuperAdminPanel } from './components/SuperAdminPanel';
import { PWAInstallButton } from './components/PWAInstallButton';
import { OfflineIndicator } from './components/OfflineIndicator';
import { 
  auth, 
  loginWithGmail, 
  logoutUser, 
  isUserSuperAdmin, 
  syncUserProfile, 
  saveUserStatsToCloud, 
  fetchUserRecordsFromCloud,
  CloudUserProfile,
  SUPER_ADMIN_EMAIL
} from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { 
  Gamepad2, 
  Calendar, 
  Award, 
  BookOpen, 
  Bell, 
  Flame, 
  Star, 
  Sparkles,
  Info,
  Clock,
  X,
  Crown,
  LogOut,
  UserCheck,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';

export default function App() {
  const [stats, setStats] = useState<UserStats>(Storage.getStats());
  const [activeTab, setActiveTab] = useState<'game' | 'streak' | 'rewards' | 'education' | 'superadmin'>('game');
  const [isReminderOpen, setIsReminderOpen] = useState<boolean>(false);
  const [activeReminderAlert, setActiveReminderAlert] = useState<{
    title: string;
    message: string;
  } | null>(null);

  // Authentication & Cloud State
  const [user, setUser] = useState<User | null>(null);
  const [cloudProfile, setCloudProfile] = useState<CloudUserProfile | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState<boolean>(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Check if current user is Super Admin
  const isSuper = isUserSuperAdmin(user) || cloudProfile?.role === 'superadmin';

  // Active equipped toothbrush
  const toothbrushes = Storage.getToothbrushes();
  const currentEquippedBrush = 
    toothbrushes.find((b) => b.id === stats.selectedToothbrushId) || toothbrushes[0];

  // Refresh stats & badges helper
  const handleUpdateStats = (newStats: UserStats) => {
    setStats(newStats);
    Storage.saveStats(newStats);
    if (user) {
      saveUserStatsToCloud(user.uid, newStats).catch((err) =>
        console.warn('Sync stats error:', err)
      );
    }
  };

  const handleCheckBadges = () => {
    // Badges updated in storage, stats synchronized
    setStats(Storage.getStats());
  };

  // Close user dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Listen to Firebase Auth state for Gmail accounts
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          // Sync or create profile for this specific Gmail account
          const profile = await syncUserProfile(firebaseUser);
          setCloudProfile(profile);

          // Restore stats associated with this specific Gmail account
          const userCloudStats: UserStats = {
            currentStreak: profile.currentStreak || 0,
            bestStreak: profile.bestStreak || 0,
            totalStars: profile.totalStars || 0,
            totalSessions: profile.totalSessions || 0,
            selectedToothbrushId: profile.selectedToothbrushId || 'brush-classic',
            lastBrushedDate: profile.lastBrushedDate || undefined,
            todayRecords: { morning: false, night: false },
          };

          // Fetch records associated with this specific Gmail account
          try {
            const cloudRecords = await fetchUserRecordsFromCloud(firebaseUser.uid);
            const today = getTodayKey();
            if (cloudRecords[today]) {
              userCloudStats.todayRecords = {
                morning: cloudRecords[today].morning,
                night: cloudRecords[today].night,
              };
            }
            // Save to local storage for offline fast access
            Object.values(cloudRecords).forEach((rec) => Storage.saveRecord(rec));
          } catch (recErr) {
            console.warn('Could not fetch cloud records:', recErr);
          }

          setStats(userCloudStats);
          Storage.saveStats(userCloudStats);
        } catch (err) {
          console.error('Error syncing Gmail user profile:', err);
        }
      } else {
        setCloudProfile(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Handle Gmail Login
  const handleGmailLogin = async () => {
    setIsLoggingIn(true);
    try {
      await loginWithGmail();
    } catch (err) {
      console.error('Failed to log in with Gmail:', err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    try {
      await logoutUser();
      setUser(null);
      setCloudProfile(null);
      setIsUserMenuOpen(false);
      setActiveTab('game');
      // Reset to guest local stats
      setStats(Storage.getStats());
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Background interval checker for offline local reminders
  useEffect(() => {
    const checkSchedule = () => {
      const config = Storage.getReminderConfig();
      const currentStats = Storage.getStats();
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const currentTimeStr = `${hours}:${minutes}`;

      // Morning reminder
      if (
        config.morningEnabled &&
        currentTimeStr === config.morningTime &&
        !currentStats.todayRecords?.morning
      ) {
        triggerReminderAlert(
          '☀️ Waktunya Sikat Gigi Pagi!',
          'Setelah sarapan, ayo bersihkan kuman selama 2 menit agar gigimu sehat dan segar!'
        );
      }

      // Night reminder
      if (
        config.nightEnabled &&
        currentTimeStr === config.nightTime &&
        !currentStats.todayRecords?.night
      ) {
        triggerReminderAlert(
          '🌙 Waktunya Sikat Gigi Malam!',
          'Sebelum tidur, basmi kuman gigi yang suka berpesta semalaman!'
        );
      }
    };

    // Check once per minute
    const interval = setInterval(checkSchedule, 60000);
    // Also check on mount
    checkSchedule();

    return () => clearInterval(interval);
  }, []);

  const triggerReminderAlert = (title: string, message: string) => {
    sound.playReminderChime();
    setActiveReminderAlert({ title, message });

    // Local Notification
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
          navigator.serviceWorker.ready.then((reg) => {
            reg.showNotification(title, {
              body: message,
              icon: '/pwa-192x192.png',
              tag: 'brushing-daily-reminder',
            });
          });
        } else {
          new Notification(title, {
            body: message,
            icon: '/pwa-192x192.png',
          });
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-sky-100/40 to-white text-slate-800 flex flex-col justify-between selection:bg-sky-200">
      {/* Top Floating Offline Notification Banner if scheduled time fired */}
      {activeReminderAlert && (
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white px-4 py-3 shadow-lg z-50 flex items-center justify-between animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-3 max-w-3xl mx-auto">
            <span className="text-2xl animate-bounce">⏰</span>
            <div>
              <div className="font-display font-extrabold text-sm">{activeReminderAlert.title}</div>
              <div className="text-xs text-amber-100">{activeReminderAlert.message}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setActiveReminderAlert(null);
                setActiveTab('game');
              }}
              className="px-3 py-1 bg-white text-amber-900 rounded-xl text-xs font-bold hover:bg-amber-100 transition shadow-xs cursor-pointer"
            >
              Mulai Sikat Gigi
            </button>
            <button
              onClick={() => setActiveReminderAlert(null)}
              className="p-1 rounded-full text-white/80 hover:bg-white/20 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main App Navigation Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-sky-100 shadow-xs">
        <div className="max-w-5xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
          {/* Logo & Title */}
          <div
            onClick={() => setActiveTab('game')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white flex items-center justify-center text-xl shadow-md border-2 border-white group-hover:scale-105 transition-transform">
              🦷
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-display font-black text-lg md:text-xl text-sky-950 tracking-tight leading-none">
                  GigiJuara
                </h1>
                <span className="px-1.5 py-0.5 rounded-md bg-sky-100 text-sky-700 text-[10px] font-extrabold uppercase tracking-wider">
                  PWA
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                Game & Pengingat Sikat Gigi 2 Menit
              </p>
            </div>
          </div>

          {/* Quick HUD: Streak + Stars + Auth (Gmail & Super Admin) + Reminder + Install */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {/* Streak Counter */}
            <button
              onClick={() => setActiveTab('streak')}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-xs transition cursor-pointer shadow-xs"
              title="Lihat Daily Streak"
            >
              <Flame className="w-4 h-4 text-rose-500 fill-rose-500" />
              <span className="hidden xs:inline">{stats.currentStreak} Hari</span>
              <span className="xs:hidden">{stats.currentStreak}d</span>
            </button>

            {/* Stars Counter */}
            <button
              onClick={() => setActiveTab('rewards')}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 font-bold text-xs transition cursor-pointer shadow-xs"
              title="Koleksi Hadiah Bintang"
            >
              <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
              <span>{stats.totalStars}</span>
            </button>

            {/* GMAIL AUTH & SUPER ADMIN PROFILE SECTION */}
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition cursor-pointer shadow-xs ${
                    isSuper 
                      ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-300 text-amber-900' 
                      : 'bg-sky-50 border-sky-200 text-sky-900'
                  }`}
                  title={user.email || 'Akun Gmail Anda'}
                >
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt="Avatar"
                      className="w-5 h-5 rounded-full object-cover border border-white"
                    />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-sky-500 text-white flex items-center justify-center text-[10px]">
                      {user.displayName?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}

                  <span className="hidden md:inline max-w-[100px] truncate font-medium">
                    {user.displayName || user.email?.split('@')[0]}
                  </span>

                  {isSuper ? (
                    <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                  ) : (
                    <ChevronDown className="w-3 h-3 text-slate-500" />
                  )}
                </button>

                {/* Dropdown User Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-sky-100 p-3 z-50 text-left animate-in fade-in zoom-in-95 duration-150">
                    <div className="pb-2.5 mb-2 border-b border-slate-100">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-slate-900 truncate">
                          {user.displayName || 'Pengguna GigiJuara'}
                        </span>
                        {isSuper && (
                          <span className="px-1.5 py-0.2 bg-amber-100 text-amber-800 text-[9px] font-black rounded-full border border-amber-200 flex items-center gap-0.5">
                            <Crown className="w-2.5 h-2.5 fill-amber-500" />
                            Admin
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate font-mono mt-0.5">
                        {user.email}
                      </div>
                      <div className="mt-1 text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" />
                        <span>Data tersimpan sesuai akun Gmail</span>
                      </div>
                    </div>

                    {/* Quick Access to Super Admin Panel if permitted */}
                    {isSuper && (
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          setActiveTab('superadmin');
                        }}
                        className="w-full mb-1.5 flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold hover:from-amber-600 hover:to-orange-600 transition shadow-xs cursor-pointer"
                      >
                        <Crown className="w-3.5 h-3.5 fill-white" />
                        <span>Buka Panel Super Admin</span>
                      </button>
                    )}

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-bold transition cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Keluar dari Akun Gmail</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={handleGmailLogin}
                disabled={isLoggingIn}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-500 via-red-600 to-amber-500 hover:from-rose-600 hover:to-red-700 text-white font-bold text-xs transition cursor-pointer shadow-sm active:scale-95 disabled:opacity-50"
                title="Masuk dengan Akun Gmail Anda untuk menyimpan data ke Cloud"
              >
                <svg className="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24">
                  <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"/>
                </svg>
                <span className="hidden sm:inline">
                  {isLoggingIn ? 'Menghubungkan...' : 'Masuk Gmail'}
                </span>
                <span className="sm:hidden">
                  {isLoggingIn ? '...' : 'Gmail'}
                </span>
              </button>
            )}

            {/* Reminder Settings Trigger */}
            <button
              onClick={() => setIsReminderOpen(true)}
              className="p-2 rounded-xl bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-700 transition cursor-pointer relative"
              title="Atur Jam Pengingat Sikat Gigi"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping"></span>
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full"></span>
            </button>

            {/* PWA In-App Install Button */}
            <PWAInstallButton />
          </div>
        </div>

        {/* Tab Navigation Menu */}
        <div className="max-w-5xl mx-auto px-4 pt-1 pb-2 flex items-center justify-center sm:justify-start gap-1 sm:gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('game')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl font-display font-bold text-xs md:text-sm whitespace-nowrap transition cursor-pointer ${
              activeTab === 'game'
                ? 'bg-sky-500 text-white shadow-md'
                : 'text-slate-600 hover:bg-sky-100/60'
            }`}
          >
            <Gamepad2 className="w-4 h-4" />
            <span>Game 2 Menit</span>
          </button>

          <button
            onClick={() => setActiveTab('streak')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl font-display font-bold text-xs md:text-sm whitespace-nowrap transition cursor-pointer ${
              activeTab === 'streak'
                ? 'bg-sky-500 text-white shadow-md'
                : 'text-slate-600 hover:bg-sky-100/60'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Kalender Streak</span>
          </button>

          <button
            onClick={() => setActiveTab('rewards')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl font-display font-bold text-xs md:text-sm whitespace-nowrap transition cursor-pointer ${
              activeTab === 'rewards'
                ? 'bg-sky-500 text-white shadow-md'
                : 'text-slate-600 hover:bg-sky-100/60'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Sikat & Lencana</span>
          </button>

          <button
            onClick={() => setActiveTab('education')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl font-display font-bold text-xs md:text-sm whitespace-nowrap transition cursor-pointer ${
              activeTab === 'education'
                ? 'bg-sky-500 text-white shadow-md'
                : 'text-slate-600 hover:bg-sky-100/60'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Tips & Uji Offline</span>
          </button>

          {/* Super Admin Tab */}
          {isSuper && (
            <button
              onClick={() => setActiveTab('superadmin')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl font-display font-bold text-xs md:text-sm whitespace-nowrap transition cursor-pointer ${
                activeTab === 'superadmin'
                  ? 'bg-gradient-to-r from-amber-500 to-rose-600 text-white shadow-md'
                  : 'bg-amber-100/60 text-amber-900 hover:bg-amber-100'
              }`}
            >
              <Crown className="w-4 h-4 text-amber-400 fill-amber-300" />
              <span>Super Admin</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-5 md:py-6">
        {activeTab === 'game' && (
          <BrushingGame
            stats={stats}
            selectedToothbrush={currentEquippedBrush}
            onUpdateStats={handleUpdateStats}
            onCheckBadges={handleCheckBadges}
            onOpenShop={() => setActiveTab('rewards')}
          />
        )}

        {activeTab === 'streak' && (
          <StreakTracker
            stats={stats}
            onStartSession={() => {
              setActiveTab('game');
            }}
          />
        )}

        {activeTab === 'rewards' && (
          <ShopAndBadges
            stats={stats}
            selectedToothbrushId={stats.selectedToothbrushId}
            onSelectToothbrush={(brush) => {
              const updatedStats = { ...stats, selectedToothbrushId: brush.id };
              handleUpdateStats(updatedStats);
            }}
            onUpdateStats={handleUpdateStats}
          />
        )}

        {activeTab === 'education' && <EducationGuide />}

        {activeTab === 'superadmin' && isSuper && (
          <SuperAdminPanel
            currentUserEmail={user?.email || SUPER_ADMIN_EMAIL}
            onClose={() => setActiveTab('game')}
          />
        )}
      </main>

      {/* Bottom Footer */}
      <footer className="mt-8 border-t border-sky-100 bg-white/70 backdrop-blur-xs py-4 text-center text-xs text-slate-500">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-sky-800">GigiJuara PWA</span>
            <span>— Sahabat Senyum Sehat & Gigi Berkilau Anak Indonesia 🇮🇩</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>Offline-Ready (PWA)</span>
            <span>•</span>
            <span>Tersinkronisasi Cloud Firestore</span>
            <span>•</span>
            <span>Rekomendasi 2 Menit PDGI</span>
          </div>
        </div>
      </footer>

      {/* Offline Reminder Modal */}
      <ReminderModal
        isOpen={isReminderOpen}
        onClose={() => setIsReminderOpen(false)}
        onSaved={() => {
          // Refresh reminder triggers
        }}
      />

      {/* Offline State Toast Indicator */}
      <OfflineIndicator />
    </div>
  );
}
