import { historicalTeams } from "../../data/historical/index";
import type { FormationFocus, Player } from "../types/game";

export type NationProfile = {
  nation: string;
  attack: number;
  midfield: number;
  defence: number;
  goalkeeping: number;
  strength: FormationFocus;
  strengthLabel: string;
  blurb: string;
};

const STRENGTH_LABEL: Record<FormationFocus, string> = {
  attack: "Attack",
  midfield: "Midfield",
  defence: "Defence",
  balanced: "Balanced",
};

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return Math.round(values.reduce((sum, v) => sum + v, 0) / values.length);
}

function byPosition(players: Player[]) {
  return {
    GK: players.filter((p) => p.position === "GK"),
    DEF: players.filter((p) => p.position === "DEF"),
    MID: players.filter((p) => p.position === "MID"),
    FWD: players.filter((p) => p.position === "FWD"),
  };
}

/** Rates a nation by the quality of players in each natural position group. */
function poolRatings(players: Player[]) {
  const groups = byPosition(players);
  const attackPool = groups.FWD.length > 0 ? groups.FWD : players;
  const midfieldPool = groups.MID.length > 0 ? groups.MID : players;
  const defencePool = groups.DEF.length > 0 ? groups.DEF : players;
  const gkPool = groups.GK.length > 0 ? groups.GK : players;

  return {
    attack: average(attackPool.map((p) => p.attack)),
    midfield: average(midfieldPool.map((p) => p.midfield)),
    defence: average(defencePool.map((p) => p.defence)),
    goalkeeping: average(gkPool.map((p) => p.goalkeeping)),
  };
}

function pickStrength(
  attack: number,
  midfield: number,
  defence: number,
): FormationFocus {
  const spread = Math.max(attack, midfield, defence) - Math.min(attack, midfield, defence);
  if (spread <= 3) return "balanced";

  if (attack >= midfield && attack >= defence) return "attack";
  if (midfield >= attack && midfield >= defence) return "midfield";
  return "defence";
}

function blurbFor(nation: string, strength: FormationFocus): string {
  switch (strength) {
    case "attack":
      return `${nation}'s World Cup history is rich in forwards and goal threats — lean into an attacking shape.`;
    case "midfield":
      return `${nation} has engine-room talent across the decades — a midfield-heavy setup could dominate.`;
    case "defence":
      return `${nation}'s legacy is built on disciplined defenders and keepers — consider locking it down at the back.`;
    default:
      return `${nation}'s pool is well rounded — you can shape the XI however you like.`;
  }
}

const cache = new Map<string, NationProfile>();

export function getNationProfile(nation: string): NationProfile {
  const cached = cache.get(nation);
  if (cached) return cached;

  const players = historicalTeams
    .filter((team) => team.nation === nation)
    .flatMap((team) => team.players);

  const { attack, midfield, defence, goalkeeping } = poolRatings(players);
  const strength = pickStrength(attack, midfield, defence);

  const profile: NationProfile = {
    nation,
    attack,
    midfield,
    defence,
    goalkeeping,
    strength,
    strengthLabel: STRENGTH_LABEL[strength],
    blurb: blurbFor(nation, strength),
  };

  cache.set(nation, profile);
  return profile;
}

export function formationMatchesNation(
  formationFocus: FormationFocus,
  profile: NationProfile,
): boolean {
  if (formationFocus === profile.strength) return true;
  if (profile.strength === "balanced" && formationFocus === "balanced") return true;
  return false;
}
