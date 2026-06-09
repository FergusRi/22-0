import { squadsFromJson, type NationSquadsJson } from "../../lib/historical/squadBuilder";
import type { HistoricalTeam } from "../../lib/types/game";
import argentinaSquads from "./squads/argentina.json";
import belgiumSquads from "./squads/belgium.json";
import brazilSquads from "./squads/brazil.json";
import croatiaSquads from "./squads/croatia.json";
import englandSquads from "./squads/england.json";
import franceSquads from "./squads/france.json";
import germanySquads from "./squads/germany.json";
import italySquads from "./squads/italy.json";
import netherlandsSquads from "./squads/netherlands.json";
import portugalSquads from "./squads/portugal.json";
import spainSquads from "./squads/spain.json";
import uruguaySquads from "./squads/uruguay.json";

function asSquads(data: unknown): NationSquadsJson {
  return data as NationSquadsJson;
}

const NATION_SQUADS: [string, NationSquadsJson][] = [
  ["Argentina", asSquads(argentinaSquads)],
  ["Belgium", asSquads(belgiumSquads)],
  ["Brazil", asSquads(brazilSquads)],
  ["Croatia", asSquads(croatiaSquads)],
  ["England", asSquads(englandSquads)],
  ["France", asSquads(franceSquads)],
  ["Germany", asSquads(germanySquads)],
  ["Italy", asSquads(italySquads)],
  ["Netherlands", asSquads(netherlandsSquads)],
  ["Portugal", asSquads(portugalSquads)],
  ["Spain", asSquads(spainSquads)],
  ["Uruguay", asSquads(uruguaySquads)],
];

export const historicalTeams: HistoricalTeam[] = NATION_SQUADS.flatMap(
  ([nation, squads]) => squadsFromJson(nation, squads),
);

export function getHistoricalTeamsByNation(nation: string): HistoricalTeam[] {
  return historicalTeams.filter((team) => team.nation === nation);
}
