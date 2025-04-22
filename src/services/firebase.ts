import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, get, update } from 'firebase/database';

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.FIREBASE_DATABASE_URL,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const userRefPath = (jid: string) => {
  const num = jid.split('@')[0];
  return `wausers/${num}`;
};

const GLOBAL_CTFD_CONFIG_PATH = 'global/ctfd_config';
const GLOBAL_BLOODS_PATH = 'global/bloods';

export interface CtfdConfig {
  url?: string;
  api_key?: string;
}

export type UserRecord = {
  initialized: boolean;
  username: string;
  role: 'user' | 'admin';
  settings?: {
    ctfd_url?: string;
    ctfd_token?: string;
  };
};

export async function getCtfdConfig(): Promise<CtfdConfig> {
  const snap = await get(ref(db, GLOBAL_CTFD_CONFIG_PATH));
  return snap.exists() ? snap.val() : {};
}

export async function setCtfdConfig(config: CtfdConfig): Promise<void> {
  await update(ref(db, GLOBAL_CTFD_CONFIG_PATH), config);
}


export const getUserRecord = async (
  jid: string
): Promise<UserRecord | null> => {
  const snap = await get(ref(db, userRefPath(jid)));
  return snap.exists() ? (snap.val() as UserRecord) : null;
};

export const isUserInitialized = async (
  jid: string
): Promise<boolean> => {
  const snap = await get(ref(db, userRefPath(jid)));
  return snap.exists() && (snap.val() as UserRecord).initialized === true;
};

export const initializeUser = async (
  jid: string,
  username: string
): Promise<void> => {
  const r = ref(db, userRefPath(jid));
  await set(r, { initialized: true, username, role: 'user' });
};

export const updateUserSettings = async (
  jid: string,
  settings: {
    ctfd_url?: string;
    ctfd_token?: string;
  }
): Promise<void> => {
  const settingsRef = ref(db, `${userRefPath(jid)}/settings`);
  await update(settingsRef, settings);
};

export const getUserSettings = async (
  jid: string
): Promise<UserRecord['settings'] | null> => {
  const snap = await get(ref(db, `${userRefPath(jid)}/settings`));
  return snap.exists() ? (snap.val() as UserRecord['settings']) : null;
};

export const setUserRole = async (
  targetJid: string,
  role: 'admin' | 'user'
): Promise<string> => {
  try {
    const r = ref(db, userRefPath(targetJid));
    await update(r, { role });
    return `✅ Role untuk ${targetJid} diset ke *${role}*`;
  } catch (e) {
    return `❌ Gagal set role: ${e}`;
  }
};


// const GLOBAL_SOLVED_CHALLENGES_PATH = 'global/solvedChallenges';

// export async function getGlobalSolvedChallenges(): Promise<Record<string, boolean>> {
//   const snap = await get(ref(db, GLOBAL_SOLVED_CHALLENGES_PATH));
//   return snap.exists() ? snap.val() : {};
// }

// export async function setGlobalSolvedChallenge(challengeId: number, userId: number): Promise<void> {
//   const solveKey = `${challengeId}_${userId}`;
//   const updates = {
//     [solveKey]: true
//   };
//   await update(ref(db, GLOBAL_SOLVED_CHALLENGES_PATH), updates);
// }

export async function getGlobalBloods(): Promise<Record<number, number[]>> {
  const snap = await get(ref(db, GLOBAL_BLOODS_PATH));
  return snap.exists() ? snap.val() as Record<number, number[]> : {};
}

export async function setGlobalBlood(
  challengeId: number,
  userId: number
): Promise<void> {
  const childPath = `${GLOBAL_BLOODS_PATH}/${challengeId}`;
  const snap = await get(ref(db, childPath));
  const current: number[] = snap.exists() ? snap.val() as number[] : [];

  //push nek blm ada
  if (!current.includes(userId) && current.length < 3) {
    current.push(userId);
    await set(ref(db, childPath), current);
  }
}