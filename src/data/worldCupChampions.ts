import type { TeamRatings } from "../lib/types/game";

/**
 * Every men's World Cup winning campaign, 1930–2022 (22 tournaments).
 * Each champion uses their real World Cup starting XI via `championLineups`.
 */
export type WorldCupChampion = {
  year: number;
  nation: string;
  teamId: string;
  /** @deprecated Only for legacy references — ratings come from the real lineup. */
  fallbackRatings?: Omit<TeamRatings, "overall">;
};

export const GAUNTLET_TOTAL = 22;

export const worldCupChampions: WorldCupChampion[] = [
  { year: 1930, nation: "Uruguay", teamId: "uruguay-1930" },
  { year: 1934, nation: "Italy", teamId: "italy-1934" },
  { year: 1938, nation: "Italy", teamId: "italy-1938" },
  { year: 1950, nation: "Uruguay", teamId: "uruguay-1950" },
  { year: 1954, nation: "Germany", teamId: "germany-1954" },
  { year: 1958, nation: "Brazil", teamId: "brazil-1958" },
  { year: 1962, nation: "Brazil", teamId: "brazil-1962" },
  { year: 1966, nation: "England", teamId: "england-1966" },
  { year: 1970, nation: "Brazil", teamId: "brazil-1970" },
  { year: 1974, nation: "Germany", teamId: "germany-1974" },
  { year: 1978, nation: "Argentina", teamId: "argentina-1978" },
  { year: 1982, nation: "Italy", teamId: "italy-1982" },
  { year: 1986, nation: "Argentina", teamId: "argentina-1986" },
  { year: 1990, nation: "Germany", teamId: "germany-1990" },
  { year: 1994, nation: "Brazil", teamId: "brazil-1994" },
  { year: 1998, nation: "France", teamId: "france-1998" },
  { year: 2002, nation: "Brazil", teamId: "brazil-2002" },
  { year: 2006, nation: "Italy", teamId: "italy-2006" },
  { year: 2010, nation: "Spain", teamId: "spain-2010" },
  { year: 2014, nation: "Germany", teamId: "germany-2014" },
  { year: 2018, nation: "France", teamId: "france-2018" },
  { year: 2022, nation: "Argentina", teamId: "argentina-2022" },
];
