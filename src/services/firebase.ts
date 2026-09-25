import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  User 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDocFromServer, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  query, 
  orderBy, 
  limit, 
  getDocs,
  where 
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { UserProfile, GameScoreRecord, DailyChallengeRecord } from '../types';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Critical: getFirestore with database ID from config as mandated
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Error handling conforming to Firebase skill instructions
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

// Connection test on boot
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('Firebase connection verified.');
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is currently offline.');
    }
    return false;
  }
}

// Automatically test connection when module loads
testConnection();

// Authentication Helpers
export async function loginWithGoogle(): Promise<User> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (err: unknown) {
    console.error('Google Sign In failed:', err);
    throw err;
  }
}

export async function logoutUser(): Promise<void> {
  await firebaseSignOut(auth);
}

// User Profile Operations
export async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
  const path = `users/${userId}`;
  try {
    const snap = await getDoc(doc(db, 'users', userId));
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  const path = `users/${profile.userId}`;
  try {
    const docRef = doc(db, 'users', profile.userId);
    const existing = await getDoc(docRef);
    if (existing.exists()) {
      await updateDoc(docRef, {
        ...profile,
        updatedAt: new Date().toISOString(),
      });
    } else {
      await setDoc(docRef, {
        ...profile,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Game Scores & Leaderboards
export async function recordMatchScore(record: GameScoreRecord): Promise<void> {
  const path = `scores/${record.scoreId}`;
  try {
    await setDoc(doc(db, 'scores', record.scoreId), record);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function fetchTopScores(limitCount = 15): Promise<GameScoreRecord[]> {
  const path = 'scores';
  try {
    const q = query(collection(db, 'scores'), orderBy('score', 'desc'), limit(limitCount));
    const querySnapshot = await getDocs(q);
    const records: GameScoreRecord[] = [];
    querySnapshot.forEach((d) => {
      records.push(d.data() as GameScoreRecord);
    });
    return records;
  } catch (error) {
    console.warn('Could not fetch online leaderboard:', error);
    return [];
  }
}

// Daily Challenge
export async function recordDailyChallengeCompletion(record: DailyChallengeRecord): Promise<void> {
  const path = `dailyRecords/${record.recordId}`;
  try {
    await setDoc(doc(db, 'dailyRecords', record.recordId), record);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function fetchDailyLeaderboard(dateStr: string): Promise<DailyChallengeRecord[]> {
  const path = 'dailyRecords';
  try {
    const q = query(
      collection(db, 'dailyRecords'),
      where('challengeDate', '==', dateStr),
      orderBy('score', 'desc'),
      limit(20)
    );
    const querySnapshot = await getDocs(q);
    const records: DailyChallengeRecord[] = [];
    querySnapshot.forEach((d) => {
      records.push(d.data() as DailyChallengeRecord);
    });
    return records;
  } catch (error) {
    console.warn('Could not fetch daily records:', error);
    return [];
  }
}
