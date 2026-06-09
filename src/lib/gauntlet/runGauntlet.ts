import { worldCupChampions } from "../../data/worldCupChampions";
import { simulateMatch } from "../simulation/simulateMatch";
import { defaultRandom, type RandomSource } from "../simulation/random";
import type { GauntletResult, Player, TournamentTeam } from "../types/game";
import { championLabel, championToOpponent } from "./championToOpponent";
import { getChampionSquad } from "./championSquad";
import { isGrailRecord, matchOutcome } from "./gauntletRecord";

/**
 * Runs the full champion gauntlet: one tie vs every World Cup winner in
 * chronological order. All 22 are played — record is W-0-L (knockout, no draws).
 */
export function runGauntlet(
  userTeam: TournamentTeam,
  userSquad: Player[],
  rng: RandomSource = defaultRandom,
): GauntletResult {
  const matches: GauntletResult["matches"] = [];
  let wins = 0;
  let losses = 0;

  for (let i = 0; i < worldCupChampions.length; i += 1) {
    const champion = worldCupChampions[i];
    const opponent = championToOpponent(champion);
    const championSquad = getChampionSquad(champion);
    const match = simulateMatch(userTeam, opponent, rng, {
      varianceScale: 0.45,
      rosters: { teamA: userSquad, teamB: championSquad },
    });

    matches.push({
      championYear: champion.year,
      championNation: champion.nation,
      championLabel: championLabel(champion),
      championSquad,
      round: i + 1,
      match,
    });

    if (matchOutcome(userTeam.id, match) === "win") wins += 1;
    else losses += 1;
  }

  return {
    matches,
    wins,
    losses,
    completed: isGrailRecord(wins, losses),
    userTeamId: userTeam.id,
    userNation: userTeam.nation,
    userSquad,
  };
}
