import type { WorldCupChampion } from "../../data/worldCupChampions";
import type { TournamentTeam } from "../types/game";
import {
  championLineupToTeam,
  resolveChampionLineup,
} from "./championLineup";

/** Builds sim-ready ratings for a World Cup winning campaign. */
export function championToOpponent(champion: WorldCupChampion): TournamentTeam {
  const { ratings } = resolveChampionLineup(champion);
  return championLineupToTeam(champion, ratings);
}

export function championLabel(champion: WorldCupChampion): string {
  return `${champion.nation} ${champion.year}`;
}
