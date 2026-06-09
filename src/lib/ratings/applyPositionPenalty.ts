import type { FormationSlot, Player } from "../types/game";

/**
 * Penalty (in rating points) applied when a player is used out of position.
 * - Same line: no penalty.
 * - Adjacent line: small penalty.
 * - Wrong line (e.g. DEF as FWD): large penalty.
 * - GK mismatches are prevented by canAssignToSlot, but handled defensively here.
 */
export function getPositionPenalty(player: Player, slot: FormationSlot): number {
  if (player.position === slot.line) return 0;

  // A GK played outfield (or an outfielder in goal) is heavily penalised.
  if (player.position === "GK" || slot.line === "GK") return 30;

  if (
    (player.position === "DEF" && slot.line === "MID") ||
    (player.position === "MID" && slot.line === "DEF") ||
    (player.position === "MID" && slot.line === "FWD") ||
    (player.position === "FWD" && slot.line === "MID")
  ) {
    return 8;
  }

  return 18;
}
