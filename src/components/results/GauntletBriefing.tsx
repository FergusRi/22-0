import { getNationTheme } from "../../data/nationThemes";
import { GAUNTLET_TOTAL } from "../../data/worldCupChampions";
import { GRAIL_RECORD } from "../../lib/gauntlet/gauntletRecord";
import {
  GAUNTLET_TIERS,
  type GauntletProjection,
} from "../../lib/gauntlet/gauntletProjection";
import type { TeamRatings } from "../../lib/types/game";

type GauntletBriefingProps = {
  nation: string;
  ratings: TeamRatings;
  projection: GauntletProjection;
  onRun: () => void;
};

export function GauntletBriefing({
  nation,
  ratings,
  projection,
  onRun,
}: GauntletBriefingProps) {
  const theme = getNationTheme(nation);

  return (
    <div className="gauntlet-briefing">
      <div className="gauntlet-briefing__hero">
        <span className="gauntlet-briefing__flag" aria-hidden="true">
          {theme.flag}
        </span>
        <span className="gauntlet-briefing__chase">Vs all past winners</span>
        <span className="gauntlet-briefing__grail">{GRAIL_RECORD}</span>
      </div>

      <div className="gauntlet-briefing__scorecard">
        <div className="gauntlet-briefing__rating-block">
          <span className="gauntlet-briefing__rating-label">Squad rating</span>
          <span className="gauntlet-briefing__rating-value">{ratings.overall}</span>
        </div>
        <div className="gauntlet-briefing__divider" aria-hidden="true" />
        <div className="gauntlet-briefing__rating-block">
          <span className="gauntlet-briefing__rating-label">Projected run</span>
          <span className="gauntlet-briefing__projected">
            ~{projection.projectedRecord}
          </span>
        </div>
      </div>

      <p className="gauntlet-briefing__hype">{projection.grailHype}</p>

      <div className="gauntlet-briefing__ladder">
        {GAUNTLET_TIERS.filter((t) => t.id !== "grail").map((tier) => {
          const active = tier.id === projection.tier.id;
          const passed = projection.projectedWins >= tier.minWins;
          return (
            <div
              key={tier.id}
              className={[
                "gauntlet-briefing__rung",
                active ? "gauntlet-briefing__rung--active" : "",
                passed && !active ? "gauntlet-briefing__rung--passed" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <span className="gauntlet-briefing__rung-wins">{tier.minWins}+</span>
              <span className="gauntlet-briefing__rung-label">{tier.label}</span>
            </div>
          );
        })}
        <div
          className={`gauntlet-briefing__rung gauntlet-briefing__rung--grail ${
            projection.projectedWins >= GAUNTLET_TOTAL
              ? "gauntlet-briefing__rung--active"
              : ""
          }`}
        >
          <span className="gauntlet-briefing__rung-wins">{GRAIL_RECORD}</span>
          <span className="gauntlet-briefing__rung-label">Grail</span>
        </div>
      </div>

      {projection.nextTier ? (
        <p className="gauntlet-briefing__target">
          <strong>{projection.winsToNextTier}</strong> more projected wins to reach{" "}
          <strong>{projection.nextTier.label}</strong>
        </p>
      ) : null}

      <ul className="gauntlet-briefing__intel">
        <li>
          <span className="gauntlet-briefing__intel-key">Opens vs</span>
          {projection.firstOpponent}
        </li>
        <li>
          <span className="gauntlet-briefing__intel-key">Toughest tie</span>
          {projection.toughestOpponent}
        </li>
        <li>
          <span className="gauntlet-briefing__intel-key">Watch out for</span>
          {projection.trapOpponent}
        </li>
      </ul>

      <button type="button" className="btn btn--start gauntlet-briefing__run" onClick={onRun}>
        Run the Gauntlet
      </button>
    </div>
  );
}
