import { GAUNTLET_TOTAL } from "../../data/worldCupChampions";
import type { MatchResult } from "../types/game";

/** Perfect gauntlet — 22 wins, 0 draws, 0 losses (38-0-0 style; draws always 0). */
export const GRAIL_RECORD = `${GAUNTLET_TOTAL}-0-0`;

export function formatGauntletRecord(wins: number, losses: number): string {
  return `${wins}-0-${losses}`;
}

export function matchOutcome(
  userTeamId: string,
  match: MatchResult,
): "win" | "loss" {
  if (match.winnerId) {
    return match.winnerId === userTeamId ? "win" : "loss";
  }
  const userIsA = match.teamA.id === userTeamId;
  const userGoals = userIsA ? match.teamAGoals : match.teamBGoals;
  const oppGoals = userIsA ? match.teamBGoals : match.teamAGoals;
  return userGoals >= oppGoals ? "win" : "loss";
}

export function isGrailRecord(wins: number, losses: number): boolean {
  return wins === GAUNTLET_TOTAL && losses === 0;
}
