import type { WorldCupChampion } from "../../data/worldCupChampions";
import type { Player } from "../types/game";
import { resolveChampionLineup } from "./championLineup";

/** The champion's real World Cup starting XI (11 players in formation order). */
export function getChampionSquad(champion: WorldCupChampion): Player[] {
  return resolveChampionLineup(champion).players;
}
