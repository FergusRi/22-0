import type { HistoricalTeam } from "../types/game";
import { personKey } from "./personKey";

/**
 * Picks a random historical team for the given nation.
 *
 * Rules:
 * - Only teams from the selected nation are eligible.
 * - The same historical team can appear multiple times across rounds.
 * - A team is only eligible if it still has at least one player whose *person*
 *   has not been drafted yet, so the draft never offers a fully-exhausted team.
 *
 * `pickedPersonKeys` is a set of `personKey(player)` values.
 */
export function getRandomHistoricalTeam(
  teams: HistoricalTeam[],
  nation: string,
  pickedPersonKeys: Set<string>,
): HistoricalTeam {
  const eligible = teams.filter(
    (team) =>
      team.nation === nation &&
      team.players.some((player) => !pickedPersonKeys.has(personKey(player))),
  );

  if (eligible.length === 0) {
    throw new Error(`No eligible historical teams for ${nation}`);
  }

  return eligible[Math.floor(Math.random() * eligible.length)];
}
