import type { TournamentTeam } from "../types/game";

// Aligned with the hidden match engine — never expose raw xG to the player.
const ATTACK_WEIGHT = 0.55;
const MIDFIELD_WEIGHT = 0.45;
const DEFENCE_WEIGHT = 0.6;
const GOALKEEPING_WEIGHT = 0.4;
const BASE_GOALS = 1.35;

export type PreMatchVerdict =
  | "heavy_favourite"
  | "favourite"
  | "even"
  | "underdog"
  | "heavy_underdog";

export type PreMatchRead = {
  verdict: PreMatchVerdict;
  label: string;
  headline: string;
  hints: string[];
};

function offensivePower(team: TournamentTeam): number {
  return team.attack * ATTACK_WEIGHT + team.midfield * MIDFIELD_WEIGHT;
}

function defensivePower(team: TournamentTeam): number {
  return team.defence * DEFENCE_WEIGHT + team.goalkeeping * GOALKEEPING_WEIGHT;
}

/** Deterministic expected goals (no match-day noise). */
function expectedGoals(attacker: TournamentTeam, defender: TournamentTeam): number {
  const ratio = offensivePower(attacker) / Math.max(1, defensivePower(defender));
  return BASE_GOALS * Math.pow(ratio, 1.6);
}

function buildHints(user: TournamentTeam, opp: TournamentTeam, isKnockout: boolean): string[] {
  const hints: string[] = [];

  if (user.attack >= opp.defence + 6) {
    hints.push("Your attack should trouble their defence");
  } else if (opp.defence >= user.attack + 6) {
    hints.push("Their back line looks hard to break down");
  }

  if (user.midfield >= opp.midfield + 6) {
    hints.push("Midfield control is on your side");
  } else if (opp.midfield >= user.midfield + 6) {
    hints.push("They could dominate the middle of the park");
  }

  if (user.defence + user.goalkeeping >= opp.attack + 8) {
    hints.push("Solid at the back — tough to score against");
  } else if (opp.attack >= user.defence + 6) {
    hints.push("Their attack poses a real threat");
  }

  if (hints.length === 0) {
    hints.push("Fine margins — one moment could decide it");
  }

  if (isKnockout) {
    hints.push("Level after 90' goes to extra time and penalties");
  }

  return hints.slice(0, isKnockout ? 2 : 2);
}

/**
 * Qualitative pre-match read for the user team vs an opponent.
 * Gives a feel for the matchup without exposing the simulation formula.
 */
export function getPreMatchRead(
  user: TournamentTeam,
  opponent: TournamentTeam,
  isKnockout: boolean,
): PreMatchRead {
  const userXG = expectedGoals(user, opponent);
  const oppXG = expectedGoals(opponent, user);
  const edge = userXG - oppXG;

  let verdict: PreMatchVerdict;
  let label: string;
  let headline: string;

  if (edge >= 0.75) {
    verdict = "heavy_favourite";
    label = "Strong favourite";
    headline = `${user.nation} should control this one`;
  } else if (edge >= 0.22) {
    verdict = "favourite";
    label = "Favoured";
    headline = `Edge to ${user.nation}, but nothing is guaranteed`;
  } else if (edge <= -0.75) {
    verdict = "heavy_underdog";
    label = "Long shot";
    headline = `${opponent.nation} look the stronger side`;
  } else if (edge <= -0.22) {
    verdict = "underdog";
    label = "Underdog";
    headline = `${opponent.nation} enter as slight favourites`;
  } else {
    verdict = "even";
    label = "Even contest";
    headline = "Too close to call — could go either way";
  }

  return {
    verdict,
    label,
    headline,
    hints: buildHints(user, opponent, isKnockout),
  };
}
