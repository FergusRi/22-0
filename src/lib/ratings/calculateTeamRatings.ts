import type {
  DraftPick,
  Formation,
  FormationLine,
  Player,
  TeamRatings,
} from "../types/game";
import { getPositionPenalty } from "./applyPositionPenalty";

const OVERALL_WEIGHTS = {
  attack: 0.3,
  midfield: 0.3,
  defence: 0.25,
  goalkeeping: 0.15,
} as const;

/**
 * Returns the player's effective rating for a given line, after applying
 * any out-of-position penalty. We use the player's headline `overall`
 * rating as the base and subtract the penalty.
 */
function effectiveRating(player: Player, line: FormationLine, penalty: number): number {
  const base = baseRatingForLine(player, line);
  return clamp(base - penalty);
}

/**
 * Picks the most relevant base attribute for the line the player is filling.
 * A defender slotted in midfield contributes their midfield attribute (then
 * gets the adjacency penalty on top), which keeps things intuitive.
 */
function baseRatingForLine(player: Player, line: FormationLine): number {
  switch (line) {
    case "GK":
      return player.goalkeeping;
    case "DEF":
      return player.defence;
    case "MID":
      return player.midfield;
    case "FWD":
      return player.attack;
  }
}

function clamp(value: number): number {
  return Math.max(0, Math.min(99, Math.round(value)));
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

/**
 * Calculates the four line ratings plus an overall rating for a drafted XI.
 *
 * Each pick is matched to its assigned slot, an out-of-position penalty is
 * applied, and the resulting effective rating is bucketed by the slot's line.
 */
export function calculateTeamRatings(
  formation: Formation,
  draftPicks: DraftPick[],
): TeamRatings {
  const slotsById = new Map(formation.slots.map((slot) => [slot.id, slot]));

  const buckets: Record<FormationLine, number[]> = {
    GK: [],
    DEF: [],
    MID: [],
    FWD: [],
  };

  for (const pick of draftPicks) {
    const slot = slotsById.get(pick.slotId);
    if (!slot) continue;
    const penalty = getPositionPenalty(pick.player, slot);
    buckets[slot.line].push(effectiveRating(pick.player, slot.line, penalty));
  }

  const attack = clamp(average(buckets.FWD));
  const midfield = clamp(average(buckets.MID));
  const defence = clamp(average(buckets.DEF));
  const goalkeeping = clamp(average(buckets.GK));

  const overall = clamp(
    attack * OVERALL_WEIGHTS.attack +
      midfield * OVERALL_WEIGHTS.midfield +
      defence * OVERALL_WEIGHTS.defence +
      goalkeeping * OVERALL_WEIGHTS.goalkeeping,
  );

  return { attack, midfield, defence, goalkeeping, overall };
}
