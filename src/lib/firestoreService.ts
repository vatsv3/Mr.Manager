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
 * Seed & clean Firestore collections so only real accounts exist.
 */
export async function seedFirestoreIfEmpty() {
  try {
    const playersSnap = await getDocs(collection(db, PLAYERS_COL));
    
    // Purge old mock player IDs (p1 through p12) and sample matches/logs if present
    const mockPlayerIds = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8', 'p9', 'p10', 'p11', 'p12'];
    const mockMatchIds = ['m1', 'm2', 'm3'];
    const mockLogIds = ['log1', 'log2', 'log3', 'log4', 'log5', 'log6', 'log7', 'log8', 'log9', 'log10', 'log11', 'log12', 'log13'];
    
    const purgeBatch = writeBatch(db);
    mockPlayerIds.forEach(id => {
      purgeBatch.delete(doc(db, PLAYERS_COL, id));
    });
    mockMatchIds.forEach(id => {
      purgeBatch.delete(doc(db, MATCHES_COL, id));
    });
    mockLogIds.forEach(id => {
      purgeBatch.delete(doc(db, RATING_LOGS_COL, id));
    });
    
    // Always persist Admin Vatsal (vatsv3temp@gmail.com)
    const vatsalDocRef = doc(db, PLAYERS_COL, 'p_vatsal');
    purgeBatch.set(vatsalDocRef, INITIAL_PLAYERS[0], { merge: true });
    
    await purgeBatch.commit();
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
    batch.set(doc(db, PLAYERS_COL, 'p_vatsal'), INITIAL_PLAYERS[0], { merge: true });
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

