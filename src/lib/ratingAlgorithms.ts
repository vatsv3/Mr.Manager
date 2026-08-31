import { RatingLog, PlayerMatchComputedStats, Match } from '../types';

export interface FairPlayRatingResult {
  playerId: string;
  rawAvg: number;
  fairPlayAvg: number;
  ratingCount: number;
  outlierCount: number;
  outliersDetected: {
    voterId: string;
    voterName: string;
    rating: number;
    reason: 'HATE_DOWNVOTE' | 'FAVORITISM_UPVOTE';
    adjustment: number;
  }[];
  teammateBiasOffset: number;
  voterTendencyOffset: number;
  confidenceScore: number; // 0 to 100%
}

export interface MatchBiasAnalysis {
  matchId: string;
  totalVotes: number;
  outliersMitigated: number;
  playerRatings: Record<string, FairPlayRatingResult>;
}

/**
 * Adaptive Consensus FairPlay Algorithm (Optimized for 1 to 10 Voters)
 *
 * Core Principles:
 * 1. Respect Consensus:
 *    - If a player genuinely played poorly and receives [3.0, 3.5, 4.0, 3.0], the consensus is LOW.
 *      The algorithm maintains the low rating (~3.4). It is NOT treated as hate.
 *    - If a defender/midfielder has a 10/10 masterclass with 0 goals/assists and receives [8.5, 9.0, 8.5, 8.5],
 *      the consensus is HIGH. The algorithm maintains the pure rating (~8.6).
 *
 * 2. Neutralize Isolated Outliers (Trolling / Spite):
 *    - If 4 players vote [8.5, 8.5, 9.0, 8.0] and 1 angry opponent spite-votes [1.0],
 *      the isolated 1.0 is flagged (> 2.0 away from squad consensus) and soft-winsorized.
 *
 * 3. Soft Voter Calibration (Max ±0.3 pt adjustment):
 *    - Adjusts mildly for notoriously strict or lenient voters without distorting player ranks.
 */
export function calculateFairPlayRatings(
  match: Match,
  logs: RatingLog[]
): MatchBiasAnalysis {
  const matchLogs = logs.filter(l => l.matchId === match.id);
  const totalVotes = matchLogs.length;

  const allSpots = [
    ...match.teamA.lineup.map(s => ({ ...s, team: 'teamA' as const })),
    ...match.teamB.lineup.map(s => ({ ...s, team: 'teamB' as const })),
  ];

  // 1. Calculate Voter Tendencies across the match
  const voterRatingsMap: Record<string, number[]> = {};
  matchLogs.forEach(l => {
    if (!voterRatingsMap[l.voterId]) voterRatingsMap[l.voterId] = [];
    voterRatingsMap[l.voterId].push(l.rating);
  });

  const voterMeans: Record<string, number> = {};
  Object.entries(voterRatingsMap).forEach(([voterId, ratings]) => {
    const sum = ratings.reduce((a, b) => a + b, 0);
    voterMeans[voterId] = sum / ratings.length;
  });

  // Global match average baseline
  const allRatingsList = matchLogs.map(l => l.rating);
  const globalMatchMean =
    allRatingsList.length > 0
      ? allRatingsList.reduce((a, b) => a + b, 0) / allRatingsList.length
      : 7.0;

  const playerRatings: Record<string, FairPlayRatingResult> = {};
  let totalOutliersMitigated = 0;

  allSpots.forEach(spot => {
    const pLogs = matchLogs.filter(l => l.ratedPlayerId === spot.playerId);
    const count = pLogs.length;

    if (count === 0) {
      playerRatings[spot.playerId] = {
        playerId: spot.playerId,
        rawAvg: 0,
        fairPlayAvg: 0,
        ratingCount: 0,
        outlierCount: 0,
        outliersDetected: [],
        teammateBiasOffset: 0,
        voterTendencyOffset: 0,
        confidenceScore: 0,
      };
      return;
    }

    const rawValues = pLogs.map(l => l.rating);
    const rawSum = rawValues.reduce((a, b) => a + b, 0);
    const rawAvg = Number((rawSum / count).toFixed(1));

    const outliers: FairPlayRatingResult['outliersDetected'] = [];
    let adjustedRatings: number[] = [];

    // Case 1: Very small sample size (1 to 3 voters) - Trust the raw votes directly
    if (count <= 3) {
      adjustedRatings = [...rawValues];
    } else {
      // Case 2: 4 to 10 voters - Check for isolated deviation against peer consensus
      const sortedRatings = [...rawValues].sort((a, b) => a - b);
      
      // Calculate Median (Peer Consensus Anchor)
      const median =
        count % 2 === 0
          ? (sortedRatings[count / 2 - 1] + sortedRatings[count / 2]) / 2
          : sortedRatings[Math.floor(count / 2)];

      // Calculate Median Absolute Deviation (MAD) to measure consensus agreement
      const absDeviations = sortedRatings.map(r => Math.abs(r - median)).sort((a, b) => a - b);
      const mad =
        count % 2 === 0
          ? (absDeviations[count / 2 - 1] + absDeviations[count / 2]) / 2
          : absDeviations[Math.floor(count / 2)];

      // Dynamic tolerance boundary based on consensus spread (minimum 1.8 points)
      const dynamicSpread = Math.max(1.8, mad * 2.2);
      const lowerBoundary = Math.max(1.0, median - dynamicSpread);
      const upperBoundary = Math.min(10.0, median + dynamicSpread);

      pLogs.forEach(log => {
        let val = log.rating;
        const voterMean = voterMeans[log.voterId] || globalMatchMean;
        
        // Gentle voter leniency offset (capped strictly at ±0.3 pt)
        const rawOffset = (globalMatchMean - voterMean) * 0.15;
        const voterOffset = Math.max(-0.3, Math.min(0.3, rawOffset));

        // Isolated Hate Downvote Check:
        // Only triggered if rating is significantly below both the lower boundary AND the median by > 2.0 pts
        if (log.rating < lowerBoundary && (median - log.rating) > 2.0) {
          outliers.push({
            voterId: log.voterId,
            voterName: log.voterName,
            rating: log.rating,
            reason: 'HATE_DOWNVOTE',
            adjustment: Number((lowerBoundary - log.rating).toFixed(1)),
          });
          val = lowerBoundary; // Winsorize up to the consensus boundary
          totalOutliersMitigated++;
        }
        // Isolated Favoritism Upvote Check:
        // Only triggered if rating is significantly above both the upper boundary AND the median by > 2.0 pts
        else if (log.rating > upperBoundary && (log.rating - median) > 2.0) {
          outliers.push({
            voterId: log.voterId,
            voterName: log.voterName,
            rating: log.rating,
            reason: 'FAVORITISM_UPVOTE',
            adjustment: Number((log.rating - upperBoundary).toFixed(1)),
          });
          val = upperBoundary; // Winsorize down to the consensus boundary
          totalOutliersMitigated++;
        }

        // Apply gentle voter tendency offset
        val = Math.min(10.0, Math.max(1.0, val + voterOffset));
        adjustedRatings.push(val);
      });
    }

    const fairPlaySum = adjustedRatings.reduce((a, b) => a + b, 0);
    const fairPlayAvg = Number((fairPlaySum / adjustedRatings.length).toFixed(1));

    // Confidence metric (based on voter count relative to squad size)
    const confidenceScore = Math.min(100, Math.round((count / Math.max(1, allSpots.length - 1)) * 100));

    playerRatings[spot.playerId] = {
      playerId: spot.playerId,
      rawAvg,
      fairPlayAvg,
      ratingCount: count,
      outlierCount: outliers.length,
      outliersDetected: outliers,
      teammateBiasOffset: 0,
      voterTendencyOffset: Number((fairPlayAvg - rawAvg).toFixed(1)),
      confidenceScore,
    };
  });

  return {
    matchId: match.id,
    totalVotes,
    outliersMitigated: totalOutliersMitigated,
    playerRatings,
  };
}
