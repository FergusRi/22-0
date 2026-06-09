import { worldCupChampions, GAUNTLET_TOTAL } from "../../data/worldCupChampions";
import { formatGauntletRecord, GRAIL_RECORD } from "./gauntletRecord";
import { getPreMatchRead } from "../simulation/preMatchRead";
import type { TeamRatings, TournamentTeam } from "../types/game";
import { championLabel, championToOpponent } from "./championToOpponent";

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/** Per-tie win chance — aligned with engine feel, not exact sim odds. */
export function matchWinChance(user: TournamentTeam, opponent: TournamentTeam): number {
  const read = getPreMatchRead(user, opponent, true);
  const chanceByVerdict: Record<string, number> = {
    heavy_favourite: 0.78,
    favourite: 0.62,
    even: 0.48,
    underdog: 0.35,
    heavy_underdog: 0.22,
  };
  const base = chanceByVerdict[read.verdict] ?? 0.48;
  const ovrNudge = clamp((user.overall - opponent.overall) * 0.012, -0.12, 0.12);
  return clamp(base + ovrNudge, 0.15, 0.88);
}

export type GauntletTierId =
  | "early"
  | "giant"
  | "contender"
  | "deep"
  | "so_close"
  | "grail";

export type GauntletTier = {
  id: GauntletTierId;
  label: string;
  minWins: number;
  hype: string;
};

export const GAUNTLET_TIERS: GauntletTier[] = [
  { id: "early", label: "Early exit", minWins: 0, hype: "Back to the draft board" },
  { id: "giant", label: "Giant killer", minWins: 4, hype: "A few legends toppled" },
  { id: "contender", label: "Contender", minWins: 8, hype: "Real gauntlet threat" },
  { id: "deep", label: "Deep run", minWins: 14, hype: "Elite company" },
  { id: "so_close", label: "So close", minWins: 18, hype: "The grail was in sight" },
  { id: "grail", label: `${GRAIL_RECORD} GRAIL`, minWins: 22, hype: "Every champion beaten" },
];

export type GauntletProjection = {
  projectedWins: number;
  projectedLosses: number;
  projectedRecord: string;
  chaseScore: number;
  tier: GauntletTier;
  nextTier: GauntletTier | null;
  winsToNextTier: number;
  grailHype: string;
  firstOpponent: string;
  toughestOpponent: string;
  trapOpponent: string;
};

export function projectGauntletRun(
  userTeam: TournamentTeam,
  ratings: TeamRatings,
): GauntletProjection {
  let expectedWins = 0;

  let toughest = { label: "", chance: 1 };
  let trap = { label: "", chance: 1 };

  for (const champion of worldCupChampions) {
    const opponent = championToOpponent(champion);
    const label = championLabel(champion);
    const winChance = matchWinChance(userTeam, opponent);

    expectedWins += winChance;

    if (winChance < toughest.chance) {
      toughest = { label, chance: winChance };
    }
    if (winChance < trap.chance && champion.year >= 1970) {
      trap = { label, chance: winChance };
    }
  }

  const projectedWins = Math.round(expectedWins);
  const projectedLosses = GAUNTLET_TOTAL - projectedWins;
  const projectedRecord = formatGauntletRecord(projectedWins, projectedLosses);

  const tier =
    [...GAUNTLET_TIERS].reverse().find((t) => projectedWins >= t.minWins) ??
    GAUNTLET_TIERS[0];
  const tierIndex = GAUNTLET_TIERS.findIndex((t) => t.id === tier.id);
  const nextTier = GAUNTLET_TIERS[tierIndex + 1] ?? null;
  const winsToNextTier = nextTier ? Math.max(0, nextTier.minWins - projectedWins) : 0;

  let grailHype: string;
  if (ratings.overall >= 90) {
    grailHype = `Elite squad — the ${GRAIL_RECORD} grail is live`;
  } else if (ratings.overall >= 86) {
    grailHype = "Strong XI — a deep run is on the table";
  } else if (ratings.overall >= 82) {
    grailHype = "Solid team — chase a double-digit run";
  } else {
    grailHype = "Underdog energy — every win is an upset";
  }

  return {
    projectedWins,
    projectedLosses,
    projectedRecord,
    chaseScore: ratings.overall,
    tier,
    nextTier,
    winsToNextTier,
    grailHype,
    firstOpponent: championLabel(worldCupChampions[0]),
    toughestOpponent: toughest.label,
    trapOpponent: trap.label || toughest.label,
  };
}

export function tierForWins(wins: number): GauntletTier {
  return (
    [...GAUNTLET_TIERS].reverse().find((t) => wins >= t.minWins) ?? GAUNTLET_TIERS[0]
  );
}

export function runHypeLine(wins: number, losses: number, total: number): string | null {
  if (losses > 0) return null;
  if (wins === total) return `${GRAIL_RECORD} — GRAIL!`;
  if (wins === total - 1) return "ONE WIN FROM THE GRAIL";
  if (wins === 18) return "SO CLOSE TERRITORY";
  if (wins === 14) return "DEEP RUN UNLOCKED";
  if (wins === 10) return "HALFWAY THERE";
  if (wins === 8) return "CONTENDER STATUS";
  if (wins === 4) return "GIANT KILLER";
  if (wins > 0 && wins % 5 === 0) return `${wins} CHAMPIONS DOWN`;
  return null;
}
