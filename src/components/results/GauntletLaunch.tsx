import { GAUNTLET_TOTAL } from "../../data/worldCupChampions";
import { GRAIL_RECORD } from "../../lib/gauntlet/gauntletRecord";
import type { GauntletProjection } from "../../lib/gauntlet/gauntletProjection";

type GauntletLaunchProps = {
  nation: string;
  projection: GauntletProjection;
  onSim: () => void;
  onSkip: () => void;
};

export function GauntletLaunch({
  nation,
  projection,
  onSim,
  onSkip,
}: GauntletLaunchProps) {
  return (
    <div className="gauntlet-launch">
      <span className="gauntlet-launch__label">Run locked in</span>
      <h2 className="gauntlet-launch__title">{nation} vs all past winners</h2>
      <p className="gauntlet-launch__sub">
        {GAUNTLET_TOTAL} champions. Every tie is played. Chase{" "}
        <strong>{GRAIL_RECORD}</strong>.
      </p>

      <div className="gauntlet-launch__projected">
        <span className="gauntlet-launch__projected-label">You were projected</span>
        <span className="gauntlet-launch__projected-value">
          ~{projection.projectedRecord}
        </span>
      </div>

      <div className="gauntlet-launch__actions">
        <button type="button" className="btn btn--start" onClick={onSim}>
          Sim
        </button>
        <button type="button" className="btn btn--primary" onClick={onSkip}>
          Skip
        </button>
      </div>

      <p className="gauntlet-launch__hint">
        Sim reveals each result one after another. Skip shows every result at once.
      </p>
    </div>
  );
}
