import type { FormationSlot, Player } from "../types/game";

/**
 * Position assignment rules:
 * - Goalkeepers can only be placed in a GK slot.
 * - Outfield players cannot be placed in the GK slot.
 * - Outfield players can be placed in any outfield slot (penalties applied later).
 */
export function canAssignToSlot(player: Player, slot: FormationSlot): boolean {
  if (player.position === "GK") return slot.line === "GK";
  if (slot.line === "GK") return false;
  return true;
}
