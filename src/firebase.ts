import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut,
  onAuthStateChanged,
  User 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  getDocs, 
  getDocFromServer,
  query,
  orderBy,
  limit
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { UserStats, BrushingRecord } from './types';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId); /* CRITICAL: The app will break without this line */
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Designated Super Admin Email from runtime
export const SUPER_ADMIN_EMAIL = 'p17325124424@student.poltekkesbandung.ac.id';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map((provider) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test connection on boot
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
testConnection();

// Check if a user is Super Admin
export function isUserSuperAdmin(user: User | null): boolean {
  if (!user || !user.email) return false;
  return user.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
}

// Sign In With Gmail / Google Popup
export async function loginWithGmail(): Promise<User> {
  try {
    googleProvider.setCustomParameters({ prompt: 'select_account' });
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Bootstrap or sync user profile
    await syncUserProfile(user);

    return user;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

// Logout
export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

export interface CloudUserProfile {
  userId: string;
  email: string;
  displayName: string;
  photoURL: string;
  role: 'superadmin' | 'user';
  currentStreak: number;
  bestStreak: number;
  totalStars: number;
  totalSessions: number;
  selectedToothbrushId: string;
  lastBrushedDate?: string;
  createdAt: string;
  updatedAt: string;
}

// Sync or fetch user profile on login
export async function syncUserProfile(user: User): Promise<CloudUserProfile> {
  const userRef = doc(db, 'users', user.uid);
  const path = `users/${user.uid}`;

  try {
    const snap = await getDoc(userRef);
    const isSuper = isUserSuperAdmin(user);
    const now = new Date().toISOString();

    if (!snap.exists()) {
      const newProfile: CloudUserProfile = {
        userId: user.uid,
        email: user.email || '',
        displayName: user.displayName || user.email?.split('@')[0] || 'Juara Cilik',
        photoURL: user.photoURL || '',
        role: isSuper ? 'superadmin' : 'user',
        currentStreak: 0,
        bestStreak: 0,
        totalStars: 20,
        totalSessions: 0,
        selectedToothbrushId: 'brush-classic',
        createdAt: now,
        updatedAt: now,
      };

      await setDoc(userRef, newProfile);

      // If super admin, mark in /admins registry too
      if (isSuper) {
        try {
          await setDoc(doc(db, 'admins', user.uid), {
            email: user.email,
            role: 'superadmin',
            createdAt: now,
          });
        } catch {
          // Non-fatal if already set
        }
      }

      return newProfile;
    } else {
      const existing = snap.data() as CloudUserProfile;
      // Auto upgrade role if designated email
      if (isSuper && existing.role !== 'superadmin') {
        await updateDoc(userRef, { role: 'superadmin', updatedAt: now });
        existing.role = 'superadmin';
      }
      return existing;
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
  }
}

// Save stats to cloud
export async function saveUserStatsToCloud(userId: string, stats: UserStats): Promise<void> {
  const userRef = doc(db, 'users', userId);
  const path = `users/${userId}`;

  try {
    await updateDoc(userRef, {
      currentStreak: stats.currentStreak,
      bestStreak: stats.bestStreak,
      totalStars: stats.totalStars,
      totalSessions: stats.totalSessions,
      selectedToothbrushId: stats.selectedToothbrushId,
      lastBrushedDate: stats.lastBrushedDate || '',
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

// Save daily record to cloud subcollection
export async function saveRecordToCloud(userId: string, record: BrushingRecord): Promise<void> {
  const recordRef = doc(db, 'users', userId, 'records', record.date);
  const path = `users/${userId}/records/${record.date}`;

  try {
    await setDoc(recordRef, {
      ...record,
      userId,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

// Fetch all daily records for user
export async function fetchUserRecordsFromCloud(userId: string): Promise<Record<string, BrushingRecord>> {
  const recordsRef = collection(db, 'users', userId, 'records');
  const path = `users/${userId}/records`;

  try {
    const snap = await getDocs(recordsRef);
    const records: Record<string, BrushingRecord> = {};
    snap.forEach((d) => {
      records[d.id] = d.data() as BrushingRecord;
    });
    return records;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

// Fetch all registered users for Super Admin dashboard
export async function fetchAllUsersForSuperAdmin(): Promise<CloudUserProfile[]> {
  const usersRef = collection(db, 'users');
  const path = 'users';

  try {
    const snap = await getDocs(usersRef);
    const users: CloudUserProfile[] = [];
    snap.forEach((d) => {
      users.push(d.data() as CloudUserProfile);
    });
    return users;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}
