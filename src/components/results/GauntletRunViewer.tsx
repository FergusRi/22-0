import { useEffect, useMemo, useState } from "react";
import { getNationTheme } from "../../data/nationThemes";
import { squadMatchupPlayers, userMatchupPlayers } from "../../lib/gauntlet/matchupLineup";
import { formatGauntletRecord, matchOutcome } from "../../lib/gauntlet/gauntletRecord";
import { gauntletHeadline, gauntletTier } from "../../lib/gauntlet/gauntletLabel";
import type { DraftPick, Formation, GauntletResult } from "../../lib/types/game";
import { GauntletPathList } from "./GauntletPathList";
import { GauntletSimHud } from "./GauntletSimHud";
import { MatchupTable } from "./MatchupTable";

type GauntletRunViewerProps = {
  result: GauntletResult;
  nation: string;
  formation: Formation;
  picks: DraftPick[];
  ratingsOvr: number;
  onFinish: () => void;
};

const TICK_MS = 1200;

function tallyRecord(result: GauntletResult, count: number) {
  let wins = 0;
  let losses = 0;
  for (let i = 0; i < count; i += 1) {
    if (matchOutcome(result.userTeamId, result.matches[i].match) === "win") {
      wins += 1;
    } else {
      losses += 1;
    }
  }
  return { wins, losses };
}

function scoreline(userId: string, match: GauntletResult["matches"][0]["match"]): string {
  const userIsA = match.teamA.id === userId;
  const u = userIsA ? match.teamAGoals : match.teamBGoals;
  const o = userIsA ? match.teamBGoals : match.teamAGoals;
  let line = `${u}–${o}`;
  if (match.decidedBy === "penalties") line += " (pens)";
  else if (match.decidedBy === "extra-time") line += " (a.e.t.)";
  return line;
}

export function GauntletRunViewer({
  result,
  nation,
  formation,
  picks,
  ratingsOvr,
  onFinish,
}: GauntletRunViewerProps) {
  const [revealed, setRevealed] = useState(0);
  const [done, setDone] = useState(false);

  const matches = result.matches;

  useEffect(() => {
    if (done) return;
    if (revealed >= matches.length) {
      const t = setTimeout(() => setDone(true), 800);
      return () => clearTimeout(t);
    }

    const t = setTimeout(() => setRevealed((n) => n + 1), TICK_MS);
    return () => clearTimeout(t);
  }, [revealed, done, matches.length]);

  const live = useMemo(() => tallyRecord(result, revealed), [result, revealed]);
  const latest = revealed > 0 ? matches[revealed - 1] : null;
  const latestWon =
    latest && matchOutcome(result.userTeamId, latest.match) === "win";
  const latestTheme = latest ? getNationTheme(latest.championNation) : null;

  return (
    <div className="run-viewer run-viewer--skip">
      <GauntletSimHud
        wins={live.wins}
        losses={live.losses}
        tieLabel={
          latest
            ? `Tie ${revealed} of ${matches.length} · ${latest.championLabel}`
            : undefined
        }
      />

      {latest && latestTheme ? (
        <div
          className={`run-viewer__spotlight ${
            latestWon ? "run-viewer__spotlight--win" : "run-viewer__spotlight--loss"
          }`}
        >
          <div className="run-viewer__spotlight-score">
            <span className="run-viewer__spotlight-flag" aria-hidden="true">
              {latestTheme.flag}
            </span>
            <span className="run-viewer__spotlight-champ">{latest.championLabel}</span>
            <span className="run-viewer__spotlight-line">
              {scoreline(result.userTeamId, latest.match)}
            </span>
            <span className="run-viewer__spotlight-verdict">
              {latestWon ? "Win" : "Loss"}
            </span>
          </div>

          <MatchupTable
            user={{
              nation,
              ovr: ratingsOvr,
              players: userMatchupPlayers(formation, picks),
            }}
            opponent={{
              nation: latest.championNation,
              subtitle: String(latest.championYear),
              ovr: latest.match.teamA.id === result.userTeamId
                ? latest.match.teamB.overall
                : latest.match.teamA.overall,
              players: squadMatchupPlayers(latest.championSquad),
            }}
            compact
          />
        </div>
      ) : (
        <p className="run-viewer__waiting">Rolling results…</p>
      )}

      <GauntletPathList result={result} revealedCount={revealed} />

      {done ? (
        <div
          className={`run-viewer__final ${
            result.completed ? "run-viewer__final--grail" : ""
          }`}
        >
          <span className="run-viewer__final-tier">{gauntletTier(result)}</span>
          <span className="run-viewer__final-line">
            {gauntletHeadline(result)} · {formatGauntletRecord(result.wins, result.losses)}
          </span>
          <button type="button" className="btn btn--primary" onClick={onFinish}>
            View full results
          </button>
        </div>
      ) : (
        <button type="button" className="link-button" onClick={onFinish}>
          Skip to end
        </button>
      )}
    </div>
  );
}
