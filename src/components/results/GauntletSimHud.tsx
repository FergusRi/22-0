import { GRAIL_RECORD, formatGauntletRecord } from "../../lib/gauntlet/gauntletRecord";

type GauntletSimHudProps = {
  wins: number;
  losses: number;
  tieLabel?: string;
};

export function GauntletSimHud({ wins, losses, tieLabel }: GauntletSimHudProps) {
  return (
    <div className="gauntlet-sim-hud">
      <div className="gauntlet-sim-hud__main">
        <span className="gauntlet-sim-hud__record">{formatGauntletRecord(wins, losses)}</span>
        <span className="gauntlet-sim-hud__grail">Chasing {GRAIL_RECORD}</span>
      </div>
      {tieLabel ? <span className="gauntlet-sim-hud__tie">{tieLabel}</span> : null}
    </div>
  );
}
