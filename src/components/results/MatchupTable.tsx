import { getNationTheme } from "../../data/nationThemes";

export type MatchupPlayer = {
  role: string;
  name: string;
  ovr: number;
  position?: "GK" | "DEF" | "MID" | "FWD";
};

export type MatchupSide = {
  nation: string;
  subtitle?: string;
  ovr: number;
  players: MatchupPlayer[];
};

type MatchupTableProps = {
  user: MatchupSide;
  opponent: MatchupSide;
  compact?: boolean;
};

const POS_CLASS: Record<string, string> = {
  GK: "matchup-table__pos--gk",
  DEF: "matchup-table__pos--def",
  MID: "matchup-table__pos--mid",
  FWD: "matchup-table__pos--fwd",
};

function sideHeader(side: MatchupSide) {
  const theme = getNationTheme(side.nation);
  return (
    <div className="matchup-table__side-head">
      <span className="matchup-table__flag" aria-hidden="true">
        {theme.flag}
      </span>
      <div className="matchup-table__side-meta">
        <span className="matchup-table__nation">{side.nation}</span>
        {side.subtitle ? (
          <span className="matchup-table__subtitle">{side.subtitle}</span>
        ) : null}
      </div>
      <span className="matchup-table__ovr">{side.ovr}</span>
    </div>
  );
}

function posClass(player: MatchupPlayer): string {
  if (player.position) return POS_CLASS[player.position] ?? "";
  const role = player.role.toUpperCase();
  if (role === "GK") return POS_CLASS.GK;
  if (["LB", "RB", "CB", "LWB", "RWB", "DEF"].some((p) => role.startsWith(p))) {
    return POS_CLASS.DEF;
  }
  if (["ST", "LW", "RW", "FWD"].some((p) => role.startsWith(p))) {
    return POS_CLASS.FWD;
  }
  return POS_CLASS.MID;
}

function playerRow(player: MatchupPlayer, compact: boolean) {
  const positionClass = posClass(player);
  return (
    <tr key={`${player.role}-${player.name}`}>
      <td className={["matchup-table__pos", positionClass].filter(Boolean).join(" ")}>
        {player.role}
      </td>
      <td className="matchup-table__name">{player.name}</td>
      {!compact ? <td className="matchup-table__ovr-cell">{player.ovr}</td> : null}
    </tr>
  );
}

export function MatchupTable({ user, opponent, compact = false }: MatchupTableProps) {
  const maxRows = Math.max(user.players.length, opponent.players.length);

  return (
    <div className={`matchup-table ${compact ? "matchup-table--compact" : ""}`}>
      <div className="matchup-table__headers">
        {sideHeader(user)}
        <span className="matchup-table__vs">vs</span>
        {sideHeader(opponent)}
      </div>

      <div className="matchup-table__grid">
        <table className="matchup-table__xi">
          <thead>
            <tr>
              <th>Pos</th>
              <th>Player</th>
              {!compact ? <th>OVR</th> : null}
            </tr>
          </thead>
          <tbody>
            {user.players.map((p) => playerRow(p, compact))}
          </tbody>
        </table>

        <table className="matchup-table__xi">
          <thead>
            <tr>
              <th>Pos</th>
              <th>Player</th>
              {!compact ? <th>OVR</th> : null}
            </tr>
          </thead>
          <tbody>
            {opponent.players.map((p) => playerRow(p, compact))}
          </tbody>
        </table>
      </div>

      {maxRows === 0 ? (
        <p className="matchup-table__empty">Lineups unavailable</p>
      ) : null}
    </div>
  );
}
