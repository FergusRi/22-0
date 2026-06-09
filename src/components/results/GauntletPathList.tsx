import { getNationTheme } from "../../data/nationThemes";
import { matchOutcome } from "../../lib/gauntlet/gauntletRecord";
import type { GauntletResult } from "../../lib/types/game";

type GauntletPathListProps = {
  result: GauntletResult;
  /** Show only the first N ties (sequential sim). Omit to show all. */
  revealedCount?: number;
};

function scoreline(
  userId: string,
  match: GauntletResult["matches"][0]["match"],
): string {
  const userIsA = match.teamA.id === userId;
  const u = userIsA ? match.teamAGoals : match.teamBGoals;
  const o = userIsA ? match.teamBGoals : match.teamAGoals;
  let line = `${u}–${o}`;
  if (match.decidedBy === "penalties") line += " (pens)";
  else if (match.decidedBy === "extra-time") line += " (a.e.t.)";
  return line;
}

export function GauntletPathList({ result, revealedCount }: GauntletPathListProps) {
  const visible =
    revealedCount === undefined
      ? result.matches
      : result.matches.slice(0, revealedCount);

  return (
    <ol className="gauntlet-path">
      {visible.map((gm) => {
        const won = matchOutcome(result.userTeamId, gm.match) === "win";
        const theme = getNationTheme(gm.championNation);
        const userIsA = gm.match.teamA.id === result.userTeamId;
        const userGoals = userIsA ? gm.match.teamAGoals : gm.match.teamBGoals;
        const userScorers = gm.match.goals
          .filter((g) => g.teamId === result.userTeamId)
          .map((g) => g.scorerName);

        return (
          <li
            key={gm.championYear}
            className={[
              "gauntlet-path__item",
              won ? "gauntlet-path__item--win" : "gauntlet-path__item--loss",
              revealedCount !== undefined ? "gauntlet-path__item--reveal" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            style={{ borderLeftColor: theme.primary }}
          >
            <span className="gauntlet-path__champ">
              <span className="gauntlet-path__flag" aria-hidden="true">
                {theme.flag}
              </span>
              {gm.championLabel}
            </span>
            <span className="gauntlet-path__score">
              {scoreline(result.userTeamId, gm.match)}
            </span>
            {won && userGoals > 0 && userScorers.length > 0 ? (
              <span className="gauntlet-path__scorers">{userScorers.join(", ")}</span>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
