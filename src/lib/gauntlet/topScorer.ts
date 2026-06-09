import type { GauntletResult } from "../types/game";

export type ScorerStat = {
  name: string;
  goals: number;
};

/** Returns the user's top gauntlet scorer, or null if they scored none. */
export function getTopScorer(result: GauntletResult): ScorerStat | null {
  const counts = new Map<string, number>();

  for (const gm of result.matches) {
    for (const goal of gm.match.goals) {
      if (goal.teamId !== result.userTeamId) continue;
      counts.set(goal.scorerName, (counts.get(goal.scorerName) ?? 0) + 1);
    }
  }

  if (counts.size === 0) return null;

  let top: ScorerStat = { name: "", goals: 0 };
  for (const [name, goals] of counts) {
    if (goals > top.goals) top = { name, goals };
  }
  return top;
}

export function getTotalUserGoals(result: GauntletResult): number {
  let total = 0;
  for (const gm of result.matches) {
    const userIsA = gm.match.teamA.id === result.userTeamId;
    total += userIsA ? gm.match.teamAGoals : gm.match.teamBGoals;
  }
  return total;
}
