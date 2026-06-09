import type { Player } from "../types/game";

/**
 * Identity of the *person* behind a player entry, independent of which World Cup
 * year the card is from. Used so the same footballer cannot be drafted twice
 * (e.g. picking Hazard 2014 locks out Hazard 2018).
 */
export function personKey(player: Player): string {
  return `${player.nation}:${player.name}`.toLowerCase();
}
