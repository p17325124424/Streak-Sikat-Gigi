import { Badge, BrushingRecord, ReminderConfig, ToothbrushCharacter, UserStats } from '../types';

const STATS_KEY = 'gigijuara_user_stats';
const RECORDS_KEY = 'gigijuara_brushing_records';
const REMINDER_KEY = 'gigijuara_reminder_config';
const TOOTHBRUSHES_KEY = 'gigijuara_toothbrushes';
const BADGES_KEY = 'gigijuara_badges';

export const INITIAL_TOOTHBRUSHES: ToothbrushCharacter[] = [
  {
    id: 'classic-blue',
    name: 'Sikat Juara Biru',
    theme: 'Klasik',
    icon: '🪥',
    requiredStreak: 0,
    description: 'Sikat gigi andalan pertama untuk memulai petualangan senyum bersih!',
    brushColor: '#0284c7',
    bristleColor: '#38bdf8',
    unlocked: true,
  },
  {
    id: 'dino-rex',
    name: 'Dino Rex Hijau',
    theme: 'Dinosaurus',
    icon: '🦖',
    requiredStreak: 3,
    description: 'Kekuatan T-Rex melibas kuman sisa makanan hingga bersih tak bersisa!',
    brushColor: '#16a34a',
    bristleColor: '#4ade80',
    unlocked: false,
  },
  {
    id: 'space-rocket',
    name: 'Roket Galaksi',
    theme: 'Astronot',
    icon: '🚀',
    requiredStreak: 7,
    description: 'Meluncur cepat membersihkan sela-sela gigi secepat roket antariksa!',
    brushColor: '#6366f1',
    bristleColor: '#a855f7',
    unlocked: false,
  },
  {
    id: 'rainbow-unicorn',
    name: 'Unicorn Pelangi',
    theme: 'Pelangi Manis',
    icon: '🦄',
    requiredStreak: 14,
    description: 'Sentuhan lembut bulu sikat ajaib berkilau dengan busa warna-warni!',
    brushColor: '#ec4899',
    bristleColor: '#f472b6',
    unlocked: false,
  },
  {
    id: 'lightning-hero',
    name: 'Pahlawan Kilat',
    theme: 'Superhero',
    icon: '⚡',
    requiredStreak: 21,
    description: 'Kekuatan petir pahlawan super membasmi karang gigi membandel!',
    brushColor: '#eab308',
    bristleColor: '#facc15',
    unlocked: false,
  },
  {
    id: 'golden-crown',
    name: 'Mahkota Emas Juara',
    theme: 'Legenda Gigi Sehat',
    icon: '👑',
    requiredStreak: 30,
    description: 'Sikat emas legendaris para master sikat gigi disiplin 30 hari!',
    brushColor: '#f59e0b',
    bristleColor: '#fbbf24',
    unlocked: false,
  },
];

export const INITIAL_BADGES: Badge[] = [
  {
    id: 'badge-first-brush',
    title: 'Langkah Pertama',
    description: 'Selesaikan sikat gigi 2 menit pertamamu!',
    icon: '🦷',
    requiredStreak: 0,
    unlocked: false,
  },
  {
    id: 'badge-streak-3',
    title: 'Pejuang Gigi 3 Hari',
    description: 'Pertahankan streak sikat gigi selama 3 hari berturut-turut.',
    icon: '🥉',
    requiredStreak: 3,
    unlocked: false,
  },
  {
    id: 'badge-streak-7',
    title: 'Juara Seminggu Sehat',
    description: 'Konsisten sikat gigi pagi dan malam selama 7 hari berturut-turut!',
    icon: '🥈',
    requiredStreak: 7,
    unlocked: false,
  },
  {
    id: 'badge-streak-14',
    title: 'Ksatria Senyum Cemerlang',
    description: 'Dua minggu tanpa bolong merawat gigi dengan penuh semangat!',
    icon: '🥇',
    requiredStreak: 14,
    unlocked: false,
  },
  {
    id: 'badge-streak-30',
    title: 'Master Gigi Berlian',
    description: 'Capai streak luar biasa 30 hari! Dokter gigi pun bangga padamu.',
    icon: '💎',
    requiredStreak: 30,
    unlocked: false,
  },
  {
    id: 'badge-morning-night',
    title: 'Kombinasi Sempurna',
    description: 'Selesaikan sikat gigi pagi dan malam dalam 1 hari yang sama.',
    icon: '✨',
    requiredStreak: 1,
    unlocked: false,
  },
];

export function getTodayKey(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export const Storage = {
  getStats(): UserStats {
    try {
      const data = localStorage.getItem(STATS_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        const today = getTodayKey();
        if (parsed.lastBrushedDate !== today) {
          // If a new day has arrived, check if yesterday was skipped
          const lastDate = parsed.lastBrushedDate;
          if (lastDate) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yKey = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
            if (lastDate !== yKey && lastDate !== today) {
              // Streak broken
              parsed.currentStreak = 0;
            }
          }
          parsed.todayRecords = { morning: false, night: false };
        }
        return parsed;
      }
    } catch {
      // Ignore
    }

    return {
      currentStreak: 0,
      bestStreak: 0,
      totalStars: 50,
      totalSessions: 0,
      selectedToothbrushId: 'classic-blue',
      todayRecords: {
        morning: false,
        night: false,
      },
    };
  },

  saveStats(stats: UserStats) {
    try {
      localStorage.setItem(STATS_KEY, JSON.stringify(stats));
    } catch {
      // Ignore
    }
  },

  getRecords(): Record<string, BrushingRecord> {
    try {
      const data = localStorage.getItem(RECORDS_KEY);
      if (data) return JSON.parse(data);
    } catch {
      // Ignore
    }
    return {};
  },

  saveRecord(record: BrushingRecord) {
    try {
      const records = Storage.getRecords();
      records[record.date] = record;
      localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
    } catch {
      // Ignore
    }
  },

  getToothbrushes(): ToothbrushCharacter[] {
    try {
      const data = localStorage.getItem(TOOTHBRUSHES_KEY);
      if (data) return JSON.parse(data);
    } catch {
      // Ignore
    }
    return INITIAL_TOOTHBRUSHES;
  },

  saveToothbrushes(brushes: ToothbrushCharacter[]) {
    try {
      localStorage.setItem(TOOTHBRUSHES_KEY, JSON.stringify(brushes));
    } catch {
      // Ignore
    }
  },

  getBadges(): Badge[] {
    try {
      const data = localStorage.getItem(BADGES_KEY);
      if (data) return JSON.parse(data);
    } catch {
      // Ignore
    }
    return INITIAL_BADGES;
  },

  saveBadges(badges: Badge[]) {
    try {
      localStorage.setItem(BADGES_KEY, JSON.stringify(badges));
    } catch {
      // Ignore
    }
  },

  getReminderConfig(): ReminderConfig {
    try {
      const data = localStorage.getItem(REMINDER_KEY);
      if (data) return JSON.parse(data);
    } catch {
      // Ignore
    }
    return {
      morningTime: '06:30',
      morningEnabled: true,
      nightTime: '20:30',
      nightEnabled: true,
      soundEnabled: true,
      notificationsAllowed: false,
    };
  },

  saveReminderConfig(config: ReminderConfig) {
    try {
      localStorage.setItem(REMINDER_KEY, JSON.stringify(config));
    } catch {
      // Ignore
    }
  },
};
