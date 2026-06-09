import { GAUNTLET_TOTAL } from "../../data/worldCupChampions";
import { gauntletHeadline, gauntletTier } from "../../lib/gauntlet/gauntletLabel";
import { formatGauntletRecord } from "../../lib/gauntlet/gauntletRecord";
import type { GauntletProjection } from "../../lib/gauntlet/gauntletProjection";
import type { GauntletResult } from "../../lib/types/game";
import { GauntletPathList } from "./GauntletPathList";

type GauntletResultsProps = {
  result: GauntletResult;
  projection?: GauntletProjection | null;
};

export function GauntletResults({ result, projection }: GauntletResultsProps) {
  const headline = gauntletHeadline(result);
  const tier = gauntletTier(result);
  const record = formatGauntletRecord(result.wins, result.losses);
  const beatProjection =
    projection && result.wins > projection.projectedWins;
  const missedGrail = !result.completed && projection;

  return (
    <div className="gauntlet-results">
      <div
        className={`gauntlet-banner ${
          result.completed ? "gauntlet-banner--legend" : ""
        }`}
      >
        <span className="gauntlet-banner__tier">{tier}</span>
        <span className="gauntlet-banner__record">{record}</span>
        <span className="gauntlet-banner__headline">{headline}</span>
        <span className="gauntlet-banner__sub">
          {result.completed
            ? `All ${GAUNTLET_TOTAL} World Cup winners defeated`
            : `${GAUNTLET_TOTAL} ties played`}
        </span>
        {projection ? (
          <span
            className={`gauntlet-banner__compare ${
              beatProjection ? "gauntlet-banner__compare--beat" : ""
            }`}
          >
            Projected ~{projection.projectedRecord}
            {beatProjection ? " — beat the projection!" : null}
            {missedGrail && result.wins < projection.projectedWins
              ? " — below projection"
              : null}
            {result.completed ? " — GRAIL HIT!" : null}
          </span>
        ) : null}
      </div>

      <GauntletPathList result={result} />
    </div>
  );
}
