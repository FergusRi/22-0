import type { Player } from "../types/game";
import type { RandomSource } from "./random";

function scoringWeight(player: Player): number {
  if (player.position === "GK") return 0;
  if (player.position === "FWD") return player.attack + 28;
  if (player.position === "MID") return player.midfield + player.attack * 0.45 + 12;
  return player.defence * 0.35 + 4;
}

function pickWeighted(players: Player[], rng: RandomSource): Player {
  const pool = players.filter((p) => scoringWeight(p) > 0);
  const candidates = pool.length > 0 ? pool : players;
  const weights = candidates.map((p) => Math.max(1, scoringWeight(p)));
  const total = weights.reduce((sum, w) => sum + w, 0);
  let roll = rng() * total;
  for (let i = 0; i < candidates.length; i += 1) {
    roll -= weights[i];
    if (roll <= 0) return candidates[i];
  }
  return candidates[candidates.length - 1];
}

export function pickGoalScorer(squad: Player[], rng: RandomSource): string {
  if (squad.length === 0) return "Unknown";
  return pickWeighted(squad, rng).name;
}

export function pickPenaltyTaker(squad: Player[], rng: RandomSource): string {
  if (squad.length === 0) return "Unknown";
  const outfield = squad.filter((p) => p.position !== "GK");
  const pool = outfield.length > 0 ? outfield : squad;
  const weights = pool.map((p) => p.overall);
  const total = weights.reduce((sum, w) => sum + w, 0);
  let roll = rng() * total;
  for (let i = 0; i < pool.length; i += 1) {
    roll -= weights[i];
    if (roll <= 0) return pool[i].name;
  }
  return pool[pool.length - 1].name;
}
