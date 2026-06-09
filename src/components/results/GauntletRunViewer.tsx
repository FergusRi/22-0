import { useEffect, useMemo, useState } from "react";
import {
  GRAIL_RECORD,
  formatGauntletRecord,
  matchOutcome,
} from "../../lib/gauntlet/gauntletRecord";
import { gauntletHeadline, gauntletTier } from "../../lib/gauntlet/gauntletLabel";
import type { GauntletResult } from "../../lib/types/game";
import { GauntletPathList } from "./GauntletPathList";

type GauntletRunViewerProps = {
  result: GauntletResult;
  onFinish: () => void;
};

const TICK_MS = 900;

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

export function GauntletRunViewer({ result, onFinish }: GauntletRunViewerProps) {
  const [revealed, setRevealed] = useState(0);
  const [done, setDone] = useState(false);

  const matches = result.matches;

  useEffect(() => {
    if (done) return;
    if (revealed >= matches.length) {
      const t = setTimeout(() => setDone(true), 600);
      return () => clearTimeout(t);
    }

    const t = setTimeout(() => setRevealed((n) => n + 1), TICK_MS);
    return () => clearTimeout(t);
  }, [revealed, done, matches.length]);

  const live = useMemo(() => tallyRecord(result, revealed), [result, revealed]);
  const record = formatGauntletRecord(
    done ? result.wins : live.wins,
    done ? result.losses : live.losses,
  );

  return (
    <div className="run-viewer run-viewer--sim">
      <div className="run-viewer__header">
        <span className="run-viewer__label">Vs all past winners</span>
        <span className="run-viewer__record">{record}</span>
        <span className="run-viewer__grail">Chasing {GRAIL_RECORD}</span>
      </div>

      <GauntletPathList result={result} revealedCount={revealed} />

      {done ? (
        <div
          className={`run-viewer__final ${
            result.completed ? "run-viewer__final--grail" : ""
          }`}
        >
          <span className="run-viewer__final-tier">{gauntletTier(result)}</span>
          <span className="run-viewer__final-line">{gauntletHeadline(result)}</span>
          <button type="button" className="btn btn--primary" onClick={onFinish}>
            Continue
          </button>
        </div>
      ) : (
        <button type="button" className="link-button" onClick={onFinish}>
          Skip to all results
        </button>
      )}
    </div>
  );
}
