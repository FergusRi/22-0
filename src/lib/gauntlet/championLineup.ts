import { championLineupsByYear } from "../../data/championLineups";
import type { WorldCupChampion } from "../../data/worldCupChampions";
import { historicalTeams } from "../../data/historical/index";
import { getFormationById } from "../formations/formations";
import { calculateTeamRatings } from "../ratings/calculateTeamRatings";
import type {
  DraftPick,
  Formation,
  HistoricalTeam,
  Player,
  TeamRatings,
  TournamentTeam,
} from "../types/game";

export type ResolvedChampionLineup = {
  formation: Formation;
  picks: DraftPick[];
  players: Player[];
  ratings: TeamRatings;
};

function findTeam(champion: WorldCupChampion): HistoricalTeam {
  if (!champion.teamId) {
    throw new Error(`Champion ${champion.year} ${champion.nation} has no teamId`);
  }
  const team = historicalTeams.find((t) => t.id === champion.teamId);
  if (!team) {
    throw new Error(`Missing historical team ${champion.teamId}`);
  }
  return team;
}

function playerByName(team: HistoricalTeam, name: string): Player {
  const player = team.players.find((p) => p.name === name);
  if (!player) {
    throw new Error(
      `Champion ${team.id}: lineup references unknown player "${name}"`,
    );
  }
  return player;
}

/** Resolves a champion's real World Cup starting XI with correct formation slots. */
export function resolveChampionLineup(
  champion: WorldCupChampion,
): ResolvedChampionLineup {
  const def = championLineupsByYear[champion.year];
  if (!def) {
    throw new Error(`No lineup defined for ${champion.nation} ${champion.year}`);
  }

  const formation = getFormationById(def.formationId);
  if (!formation) {
    throw new Error(`Unknown formation ${def.formationId} for ${champion.year}`);
  }

  const team = findTeam(champion);
  const usedNames = new Set<string>();

  const picks: DraftPick[] = formation.slots.map((slot) => {
    const name = def.slots[slot.id];
    if (!name) {
      throw new Error(
        `Champion ${champion.year}: missing player for slot ${slot.id}`,
      );
    }
    if (usedNames.has(name)) {
      throw new Error(
        `Champion ${champion.year}: duplicate player "${name}" in lineup`,
      );
    }
    usedNames.add(name);

    const player = playerByName(team, name);
    return {
      round: 0,
      historicalTeamId: team.id,
      historicalTeamNation: team.nation,
      historicalTeamYear: team.year,
      player,
      slotId: slot.id,
    };
  });

  const ratings = calculateTeamRatings(formation, picks);

  return {
    formation,
    picks,
    players: picks.map((p) => p.player),
    ratings,
  };
}

export function championLineupToTeam(
  champion: WorldCupChampion,
  ratings: TeamRatings,
): TournamentTeam {
  const id = champion.teamId ?? `champion-${champion.year}`;
  return {
    id,
    nation: champion.nation,
    group: "GAUNTLET",
    ...ratings,
  };
}
