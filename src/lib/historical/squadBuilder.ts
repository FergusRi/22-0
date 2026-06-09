import type { HistoricalTeam, Player, PlayerPosition } from "../types/game";

/** Compact squad line: position, player name, overall rating. */
export type SquadEntry = [PlayerPosition, string, number];

export type NationSquadsJson = Record<string, SquadEntry[]>;

function nationSlug(nation: string): string {
  return nation.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

function playerSlug(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function buildPlayer(
  nation: string,
  year: number,
  position: PlayerPosition,
  name: string,
  overall: number,
): Player {
  const id = `${nationSlug(nation)}-${year}-${playerSlug(name)}`;

  if (position === "GK") {
    return {
      id,
      name,
      nation,
      worldCupYear: year,
      position,
      attack: 12,
      midfield: 22,
      defence: 45,
      goalkeeping: overall,
      overall,
    };
  }

  if (position === "DEF") {
    return {
      id,
      name,
      nation,
      worldCupYear: year,
      position,
      attack: Math.round(overall * 0.55),
      midfield: Math.round(overall * 0.62),
      defence: overall,
      goalkeeping: 8,
      overall,
    };
  }

  if (position === "MID") {
    return {
      id,
      name,
      nation,
      worldCupYear: year,
      position,
      attack: Math.round(overall * 0.85),
      midfield: overall,
      defence: Math.round(overall * 0.7),
      goalkeeping: 8,
      overall,
    };
  }

  return {
    id,
    name,
    nation,
    worldCupYear: year,
    position,
    attack: overall,
    midfield: Math.round(overall * 0.72),
    defence: 38,
    goalkeeping: 8,
    overall,
  };
}

export function buildHistoricalTeam(
  nation: string,
  year: number,
  entries: SquadEntry[],
): HistoricalTeam {
  return {
    id: `${nationSlug(nation)}-${year}`,
    nation,
    year,
    players: entries.map(([position, name, overall]) =>
      buildPlayer(nation, year, position, name, overall),
    ),
  };
}

export function squadsFromJson(nation: string, data: NationSquadsJson): HistoricalTeam[] {
  return Object.entries(data)
    .map(([year, entries]) => buildHistoricalTeam(nation, Number(year), entries))
    .sort((a, b) => a.year - b.year);
}
