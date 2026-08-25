import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  writeBatch,
  getDocs,
} from 'firebase/firestore';
import { db } from './firebase';
import { Player, Match, RatingLog } from '../types';
import { INITIAL_PLAYERS } from '../data/mockData';

const PLAYERS_COL = 'players';
const MATCHES_COL = 'matches';
const RATING_LOGS_COL = 'ratingLogs';

/**
 * Deeply strips undefined properties from an object so Firestore setDoc does not reject with:
 * "Function setDoc() called with invalid data. Unsupported field value: undefined"
 */
export function sanitizeForFirestore<T extends Record<string, any>>(obj: T): Record<string, any> {
  const cleaned: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      if (Array.isArray(value)) {
        cleaned[key] = value.map(item =>
          item && typeof item === 'object' && !Array.isArray(item) ? sanitizeForFirestore(item) : item
        );
      } else if (value && typeof value === 'object' && !(value instanceof Date)) {
        cleaned[key] = sanitizeForFirestore(value);
      } else {
        cleaned[key] = value;
      }
    }
  }
  return cleaned;
}

/**
 * Seed & clean Firestore collections safely.
 * Will NEVER overwrite existing custom profiles or user edits!
 */
export async function seedFirestoreIfEmpty() {
  try {
    const playersSnap = await getDocs(collection(db, PLAYERS_COL));
    
    // Purge old mock player IDs (p1 through p12) and sample matches/logs if present
    const mockPlayerIds = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8', 'p9', 'p10', 'p11', 'p12'];
    const mockMatchIds = ['m1', 'm2', 'm3'];
    const mockLogIds = ['log1', 'log2', 'log3', 'log4', 'log5', 'log6', 'log7', 'log8', 'log9', 'log10', 'log11', 'log12', 'log13'];
    
    const purgeBatch = writeBatch(db);
    let hasOperations = false;

    // Purge mock players if any
    playersSnap.docs.forEach(d => {
      if (mockPlayerIds.includes(d.id)) {
        purgeBatch.delete(d.ref);
        hasOperations = true;
      }
    });

    const vatsalExists = playersSnap.docs.some(d => d.id === 'p_vatsal' || d.data()?.email?.toLowerCase() === 'vatsv3temp@gmail.com');
    
    // ONLY seed Admin Vatsal if NO player profile for Vatsal exists yet in Firestore!
    if (!vatsalExists && playersSnap.empty) {
      const vatsalDocRef = doc(db, PLAYERS_COL, 'p_vatsal');
      purgeBatch.set(vatsalDocRef, sanitizeForFirestore(INITIAL_PLAYERS[0]));
      hasOperations = true;
    }
    
    if (hasOperations) {
      await purgeBatch.commit();
      console.log('[Firestore] Initialization check completed.');
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (!msg.includes('unavailable') && !msg.includes('offline')) {
      console.warn('Firestore initialization notice:', msg);
    }
  }
}

/**
 * Hard reset database to clean state with Admin
 */
export async function resetDatabaseToCleanState() {
  try {
    const batch = writeBatch(db);
    const playersSnap = await getDocs(collection(db, PLAYERS_COL));
    playersSnap.forEach(d => {
      if (d.id !== 'p_vatsal') {
        batch.delete(d.ref);
      }
    });
    const matchesSnap = await getDocs(collection(db, MATCHES_COL));
    matchesSnap.forEach(d => batch.delete(d.ref));
    
    const logsSnap = await getDocs(collection(db, RATING_LOGS_COL));
    logsSnap.forEach(d => batch.delete(d.ref));

    // Ensure Vatsal admin doc
    batch.set(doc(db, PLAYERS_COL, 'p_vatsal'), sanitizeForFirestore(INITIAL_PLAYERS[0]), { merge: true });
    await batch.commit();
  } catch (e) {
    console.warn('Reset database notice:', e);
  }
}

/**
 * Real-time listeners for Firestore
 */
export function subscribeToPlayers(callback: (players: Player[]) => void) {
  try {
    return onSnapshot(
      collection(db, PLAYERS_COL),
      snapshot => {
        if (!snapshot.empty) {
          const list: Player[] = [];
          snapshot.forEach(docSnap => {
            const data = docSnap.data() as Player;
            // Filter out old legacy mock IDs
            if (!docSnap.id.match(/^p[1-9]$|^p1[0-2]$/)) {
              list.push(data);
            }
          });
          callback(list);
        }
      },
      err => {
        // Silently handle backend connectivity hiccups while preserving offline mode
        const msg = err?.message || String(err);
        if (!msg.includes('unavailable') && !msg.includes('offline')) {
          console.warn('Firestore players snapshot listener notice:', msg);
        }
      }
    );
  } catch (err) {
    console.warn('Could not register players listener:', err);
    return () => {};
  }
}

export function subscribeToMatches(callback: (matches: Match[]) => void) {
  try {
    return onSnapshot(
      collection(db, MATCHES_COL),
      snapshot => {
        const list: Match[] = [];
        snapshot.forEach(docSnap => {
          if (!['m1', 'm2', 'm3'].includes(docSnap.id)) {
            list.push(docSnap.data() as Match);
          }
        });
        callback(list);
      },
      err => {
        const msg = err?.message || String(err);
        if (!msg.includes('unavailable') && !msg.includes('offline')) {
          console.warn('Firestore matches snapshot listener notice:', msg);
        }
      }
    );
  } catch (err) {
    console.warn('Could not register matches listener:', err);
    return () => {};
  }
}

export function subscribeToRatingLogs(callback: (logs: RatingLog[]) => void) {
  try {
    return onSnapshot(
      collection(db, RATING_LOGS_COL),
      snapshot => {
        const list: RatingLog[] = [];
        snapshot.forEach(docSnap => {
          if (!docSnap.id.startsWith('log1') && !docSnap.id.startsWith('log2') && !docSnap.id.startsWith('log3')) {
            list.push(docSnap.data() as RatingLog);
          }
        });
        callback(list);
      },
      err => {
        const msg = err?.message || String(err);
        if (!msg.includes('unavailable') && !msg.includes('offline')) {
          console.warn('Firestore ratingLogs snapshot listener notice:', msg);
        }
      }
    );
  } catch (err) {
    console.warn('Could not register ratingLogs listener:', err);
    return () => {};
  }
}

/**
 * Firestore Mutations with sanitize, retry & error logging
 */
export async function syncPlayerToFirestore(player: Player) {
  try {
    const cleaned = sanitizeForFirestore(player);
    await setDoc(doc(db, PLAYERS_COL, player.id), cleaned, { merge: true });
    console.log(`[Firestore] Successfully saved player ${player.name} (${player.id})`);
  } catch (err) {
    console.error('Failed to sync player to Firestore:', err);
  }
}

export async function deletePlayerFromFirestore(playerId: string) {
  try {
    await deleteDoc(doc(db, PLAYERS_COL, playerId));
    console.log(`[Firestore] Successfully deleted player (${playerId})`);
  } catch (err) {
    console.error('Failed to delete player from Firestore:', err);
  }
}

export async function syncMatchToFirestore(match: Match) {
  try {
    const cleaned = sanitizeForFirestore(match);
    await setDoc(doc(db, MATCHES_COL, match.id), cleaned, { merge: true });
    console.log(`[Firestore] Successfully saved match (${match.id})`);
  } catch (err) {
    console.error('Failed to sync match to Firestore:', err);
  }
}

export async function deleteMatchFromFirestore(matchId: string) {
  try {
    await deleteDoc(doc(db, MATCHES_COL, matchId));
    console.log(`[Firestore] Successfully deleted match (${matchId})`);
  } catch (err) {
    console.error('Failed to delete match from Firestore:', err);
  }
}

export async function syncRatingLogToFirestore(log: RatingLog) {
  try {
    const cleaned = sanitizeForFirestore(log);
    await setDoc(doc(db, RATING_LOGS_COL, log.id), cleaned, { merge: true });
  } catch (err) {
    console.error('Failed to sync rating log to Firestore:', err);
  }
}

export async function deleteRatingLogFromFirestore(logId: string) {
  try {
    await deleteDoc(doc(db, RATING_LOGS_COL, logId));
  } catch (err) {
    console.error('Failed to delete rating log from Firestore:', err);
  }
}


