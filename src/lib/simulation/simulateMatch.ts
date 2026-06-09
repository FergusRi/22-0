import type {
  GoalEvent,
  MatchResult,
  PenaltyKick,
  Player,
  TournamentTeam,
} from "../types/game";
import { pickGoalScorer, pickPenaltyTaker } from "./assignScorers";
import { defaultRandom, samplePoisson, type RandomSource } from "./random";

// The exact weighting is intentionally kept internal and never surfaced in the UI.
const ATTACK_WEIGHT = 0.55;
const MIDFIELD_WEIGHT = 0.45;
const DEFENCE_WEIGHT = 0.6;
const GOALKEEPING_WEIGHT = 0.4;

// Baseline goals expectation for an evenly matched contest.
const BASE_GOALS = 1.35;
const MAX_GOALS = 6;

function offensivePower(team: TournamentTeam): number {
  return team.attack * ATTACK_WEIGHT + team.midfield * MIDFIELD_WEIGHT;
}

function defensivePower(team: TournamentTeam): number {
  return team.defence * DEFENCE_WEIGHT + team.goalkeeping * GOALKEEPING_WEIGHT;
}

function expectedGoals(
  attacker: TournamentTeam,
  defender: TournamentTeam,
  rng: RandomSource,
  varianceScale = 1,
): number {
  const ratio = offensivePower(attacker) / Math.max(1, defensivePower(defender));
  const noiseSpan = 0.5 * varianceScale;
  const noise = 0.75 + noiseSpan / 2 + rng() * noiseSpan;
  const lambda = BASE_GOALS * Math.pow(ratio, 1.6) * noise;
  return Math.min(lambda, MAX_GOALS);
}

function cap(goals: number): number {
  return Math.min(goals, MAX_GOALS);
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

type SquadRosters = {
  teamA: Player[];
  teamB: Player[];
};

/** Appends `count` goal events for a team within a minute window. */
function addGoals(
  goals: GoalEvent[],
  teamId: string,
  squad: Player[] | undefined,
  count: number,
  minMinute: number,
  maxMinute: number,
  period: GoalEvent["period"],
  rng: RandomSource,
): void {
  const span = maxMinute - minMinute;
  for (let i = 0; i < count; i += 1) {
    goals.push({
      minute: minMinute + Math.floor(rng() * (span + 1)),
      teamId,
      period,
      scorerName: squad ? pickGoalScorer(squad, rng) : "Unknown",
    });
  }
}

/**
 * Light penalty shootout: each side takes five kicks (conversion nudged by
 * composure vs the opposing keeper), then sudden death until one side edges it.
 */
function simulateShootout(
  teamA: TournamentTeam,
  teamB: TournamentTeam,
  rosters: SquadRosters | undefined,
  rng: RandomSource,
): { teamAScore: number; teamBScore: number; winnerId: string; kicks: PenaltyKick[] } {
  const convA = clamp(0.78 + (teamA.overall - teamB.goalkeeping) / 320, 0.6, 0.92);
  const convB = clamp(0.78 + (teamB.overall - teamA.goalkeeping) / 320, 0.6, 0.92);
  const kicks: PenaltyKick[] = [];

  let teamAScore = 0;
  let teamBScore = 0;

  function takeKick(team: TournamentTeam, conv: number, squad?: Player[]): boolean {
    const scored = rng() < conv;
    kicks.push({
      teamId: team.id,
      scored,
      kickerName: squad ? pickPenaltyTaker(squad, rng) : "Unknown",
    });
    return scored;
  }

  for (let i = 0; i < 5; i += 1) {
    if (takeKick(teamA, convA, rosters?.teamA)) teamAScore += 1;
    if (takeKick(teamB, convB, rosters?.teamB)) teamBScore += 1;
  }

  while (teamAScore === teamBScore) {
    if (takeKick(teamA, convA, rosters?.teamA)) teamAScore += 1;
    if (takeKick(teamB, convB, rosters?.teamB)) teamBScore += 1;
  }

  return {
    teamAScore,
    teamBScore,
    winnerId: teamAScore > teamBScore ? teamA.id : teamB.id,
    kicks,
  };
}

/**
 * Simulates a knockout tie — draws are resolved via extra time and, if needed,
 * penalties.
 */
type SimulateOptions = {
  /** 0 = no extra noise, 1 = default match-day variance. */
  varianceScale?: number;
  rosters?: SquadRosters;
};

export function simulateMatch(
  teamA: TournamentTeam,
  teamB: TournamentTeam,
  rng: RandomSource = defaultRandom,
  options: SimulateOptions = {},
): MatchResult {
  const varianceScale = options.varianceScale ?? 1;
  const rosters = options.rosters;

  let teamAGoals = cap(
    samplePoisson(expectedGoals(teamA, teamB, rng, varianceScale), rng),
  );
  let teamBGoals = cap(
    samplePoisson(expectedGoals(teamB, teamA, rng, varianceScale), rng),
  );

  const goals: GoalEvent[] = [];
  addGoals(goals, teamA.id, rosters?.teamA, teamAGoals, 1, 90, "regular", rng);
  addGoals(goals, teamB.id, rosters?.teamB, teamBGoals, 1, 90, "regular", rng);

  const result: MatchResult = {
    teamA,
    teamB,
    teamAGoals,
    teamBGoals,
    decidedBy: "normal",
    goals,
  };

  const finalise = () => {
    goals.sort((a, b) => a.minute - b.minute);
    result.goals = goals;
  };

  if (teamAGoals === teamBGoals) {
    // Extra time: one more low-scoring mini-period.
    const rawExtraA = samplePoisson(
      expectedGoals(teamA, teamB, rng, varianceScale) * 0.35,
      rng,
    );
    const rawExtraB = samplePoisson(
      expectedGoals(teamB, teamA, rng, varianceScale) * 0.35,
      rng,
    );
    const extraA = cap(teamAGoals + rawExtraA) - teamAGoals;
    const extraB = cap(teamBGoals + rawExtraB) - teamBGoals;
    addGoals(goals, teamA.id, rosters?.teamA, extraA, 91, 120, "extra-time", rng);
    addGoals(goals, teamB.id, rosters?.teamB, extraB, 91, 120, "extra-time", rng);
    teamAGoals += extraA;
    teamBGoals += extraB;
    result.teamAGoals = teamAGoals;
    result.teamBGoals = teamBGoals;

    if (teamAGoals !== teamBGoals) {
      result.decidedBy = "extra-time";
      result.winnerId = teamAGoals > teamBGoals ? teamA.id : teamB.id;
      finalise();
      return result;
    }

    // Penalties.
    const shootout = simulateShootout(teamA, teamB, rosters, rng);
    result.decidedBy = "penalties";
    result.shootout = {
      teamAScore: shootout.teamAScore,
      teamBScore: shootout.teamBScore,
      kicks: shootout.kicks,
    };
    result.winnerId = shootout.winnerId;
    finalise();
    return result;
  }

  result.winnerId = teamAGoals > teamBGoals ? teamA.id : teamB.id;
  finalise();
  return result;
}
