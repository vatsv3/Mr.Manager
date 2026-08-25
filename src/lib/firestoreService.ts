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
import { INITIAL_PLAYERS, INITIAL_MATCHES, INITIAL_RATING_LOGS } from '../data/mockData';

const PLAYERS_COL = 'players';
const MATCHES_COL = 'matches';
const RATING_LOGS_COL = 'ratingLogs';

/**
 * Seed initial mock data into Firestore if collections are empty.
 */
export async function seedFirestoreIfEmpty() {
  try {
    const playersSnap = await getDocs(collection(db, PLAYERS_COL));
    if (playersSnap.empty) {
      const batch = writeBatch(db);
      INITIAL_PLAYERS.forEach(p => {
        const ref = doc(db, PLAYERS_COL, p.id);
        batch.set(ref, p);
      });
      INITIAL_MATCHES.forEach(m => {
        const ref = doc(db, MATCHES_COL, m.id);
        batch.set(ref, m);
      });
      INITIAL_RATING_LOGS.forEach(l => {
        const ref = doc(db, RATING_LOGS_COL, l.id);
        batch.set(ref, l);
      });
      await batch.commit();
    }
  } catch (err: unknown) {
    // Gracefully ignore offline warnings as Firestore will operate in local persistence mode
    const msg = err instanceof Error ? err.message : String(err);
    if (!msg.includes('unavailable') && !msg.includes('offline')) {
      console.warn('Firestore initial seeding notification:', msg);
    }
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
            list.push(docSnap.data() as Player);
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
        if (!snapshot.empty) {
          const list: Match[] = [];
          snapshot.forEach(docSnap => {
            list.push(docSnap.data() as Match);
          });
          callback(list);
        }
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
          list.push(docSnap.data() as RatingLog);
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
 * Firestore Mutations with background retry & offline resilience
 */
export async function syncPlayerToFirestore(player: Player) {
  try {
    await setDoc(doc(db, PLAYERS_COL, player.id), player);
  } catch (err) {
    console.warn('Player cached locally, pending sync:', err);
  }
}

export async function deletePlayerFromFirestore(playerId: string) {
  try {
    await deleteDoc(doc(db, PLAYERS_COL, playerId));
  } catch (err) {
    console.warn('Player deletion cached locally, pending sync:', err);
  }
}

export async function syncMatchToFirestore(match: Match) {
  try {
    await setDoc(doc(db, MATCHES_COL, match.id), match);
  } catch (err) {
    console.warn('Match cached locally, pending sync:', err);
  }
}

export async function deleteMatchFromFirestore(matchId: string) {
  try {
    await deleteDoc(doc(db, MATCHES_COL, matchId));
  } catch (err) {
    console.warn('Match deletion cached locally, pending sync:', err);
  }
}

export async function syncRatingLogToFirestore(log: RatingLog) {
  try {
    await setDoc(doc(db, RATING_LOGS_COL, log.id), log);
  } catch (err) {
    console.warn('Rating log cached locally, pending sync:', err);
  }
}

export async function deleteRatingLogFromFirestore(logId: string) {
  try {
    await deleteDoc(doc(db, RATING_LOGS_COL, logId));
  } catch (err) {
    console.warn('Rating log deletion cached locally, pending sync:', err);
  }
}

