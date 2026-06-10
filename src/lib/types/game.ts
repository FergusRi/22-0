export type PlayerPosition = "GK" | "DEF" | "MID" | "FWD";

export type Player = {
  id: string;
  name: string;
  nation: string;
  worldCupYear: number;
  position: PlayerPosition;
  attack: number;
  midfield: number;
  defence: number;
  goalkeeping: number;
  overall: number;
};

export type HistoricalTeam = {
  id: string;
  nation: string;
  year: number;
  players: Player[];
};

export type FormationLine = "GK" | "DEF" | "MID" | "FWD";

export type FormationSlot = {
  id: string;
  label: string;
  line: FormationLine;
  /** Pitch coordinates as percentages (0-100). x = left->right, y = goal-line(own)->attack. */
  x?: number;
  y?: number;
};

export type FormationFocus = "attack" | "midfield" | "defence" | "balanced";

export type Formation = {
  id: string;
  name: string;
  description: string;
  focus: FormationFocus;
  slots: FormationSlot[];
};

export type DraftPick = {
  round: number;
  historicalTeamId: string;
  historicalTeamNation: string;
  historicalTeamYear: number;
  player: Player;
  slotId: string;
};

export type TeamRatings = {
  attack: number;
  midfield: number;
  defence: number;
  goalkeeping: number;
  overall: number;
};

export type TournamentTeam = {
  id: string;
  nation: string;
  group: string;
  attack: number;
  midfield: number;
  defence: number;
  goalkeeping: number;
  overall: number;
  isUserTeam?: boolean;
};

export type GoalEvent = {
  /** Match minute the goal was scored (1-120). */
  minute: number;
  /** Id of the team that scored. */
  teamId: string;
  period: "regular" | "extra-time";
  scorerName: string;
};

export type PenaltyKick = {
  teamId: string;
  scored: boolean;
  kickerName: string;
};

export type Shootout = {
  teamAScore: number;
  teamBScore: number;
  /** Alternating kicks in shootout order (A, B, A, B, …). */
  kicks: PenaltyKick[];
};

export type MatchResult = {
  teamA: TournamentTeam;
  teamB: TournamentTeam;
  teamAGoals: number;
  teamBGoals: number;
  winnerId?: string;
  decidedBy?: "normal" | "extra-time" | "penalties";
  /** Chronological goals across regulation + extra time (excludes shootout). */
  goals: GoalEvent[];
  /** Present only when the tie went to penalties. */
  shootout?: Shootout;
};

export type GauntletMatch = {
  championYear: number;
  championNation: string;
  championLabel: string;
  championSquad: Player[];
  round: number;
  match: MatchResult;
};

export type GauntletResult = {
  matches: GauntletMatch[];
  wins: number;
  losses: number;
  /** True when the run hits 22-0. */
  completed: boolean;
  userTeamId: string;
  userNation: string;
  userSquad: Player[];
};
