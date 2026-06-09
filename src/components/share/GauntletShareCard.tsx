import { getNationTheme, themeStyle } from "../../data/nationThemes";
import { formatGauntletRecord } from "../../lib/gauntlet/gauntletRecord";
import { gauntletHeadline, gauntletTier } from "../../lib/gauntlet/gauntletLabel";
import { getTopScorer, getTotalUserGoals } from "../../lib/gauntlet/topScorer";
import type { DraftPick, Formation, GauntletResult, TeamRatings } from "../../lib/types/game";

type GauntletShareCardProps = {
  nation: string;
  formation: Formation;
  picks: DraftPick[];
  ratings: TeamRatings;
  result: GauntletResult;
};

function surname(name: string): string {
  const parts = name.trim().split(" ");
  return parts.length === 1 ? parts[0] : parts.slice(1).join(" ");
}

const POS_CLASS: Record<string, string> = {
  GK: "share-card__pos--gk",
  DEF: "share-card__pos--def",
  MID: "share-card__pos--mid",
  FWD: "share-card__pos--fwd",
};

export function GauntletShareCard({
  nation,
  formation,
  picks,
  ratings,
  result,
}: GauntletShareCardProps) {
  const theme = getNationTheme(nation);
  const topScorer = getTopScorer(result);
  const totalGoals = getTotalUserGoals(result);
  const picksBySlot = new Map(picks.map((pick) => [pick.slotId, pick]));

  return (
    <div
      className={`share-card share-card--gauntlet ${
        result.completed ? "share-card--legend" : ""
      }`}
      id="share-card"
      style={themeStyle(nation)}
    >
      <div className="share-card__hero">
        <span className="share-card__trophy" aria-hidden="true">
          🏆
        </span>
        <span className="share-card__mode">World Cup Gauntlet</span>
      </div>

      <div className="share-card__nation-row">
        <span className="share-card__flag" aria-hidden="true">
          {theme.flag}
        </span>
        <span className="share-card__nation">{nation}</span>
      </div>

      <div className="share-card__gauntlet-record">
        {formatGauntletRecord(result.wins, result.losses)}
      </div>
      <div className="share-card__gauntlet-tier">{gauntletTier(result)}</div>
      <p className="share-card__gauntlet-line">{gauntletHeadline(result)}</p>

      {topScorer ? (
        <div className="share-card__scorer">
          <span className="share-card__scorer-label">Top scorer</span>
          <span className="share-card__scorer-name">{topScorer.name}</span>
          <span className="share-card__scorer-stat">
            {topScorer.goals} goal{topScorer.goals === 1 ? "" : "s"}
            {totalGoals > topScorer.goals ? ` · ${totalGoals} team total` : ""}
          </span>
        </div>
      ) : null}

      <div className="share-card__lineup-head">
        <span>Your XI</span>
        <span className="share-card__formation">{formation.name}</span>
      </div>

      <ul className="share-card__lineup">
        {formation.slots.map((slot) => {
          const pick = picksBySlot.get(slot.id);
          if (!pick) return null;
          return (
            <li key={slot.id} className="share-card__lineup-row">
              <span
                className={[
                  "share-card__pos",
                  POS_CLASS[pick.player.position] ?? "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {slot.label}
              </span>
              <span className="share-card__lineup-name">
                {surname(pick.player.name)}
              </span>
              <span className="share-card__lineup-year">
                {pick.player.worldCupYear}
              </span>
              <span className="share-card__lineup-ovr">{pick.player.overall}</span>
            </li>
          );
        })}
      </ul>

      <div className="share-card__stats">
        <div className="share-card__stat">
          <span className="share-card__stat-val">{ratings.overall}</span>
          <span className="share-card__stat-lbl">OVR</span>
        </div>
        <div className="share-card__stat">
          <span className="share-card__stat-val">{ratings.attack}</span>
          <span className="share-card__stat-lbl">ATT</span>
        </div>
        <div className="share-card__stat">
          <span className="share-card__stat-val">{ratings.midfield}</span>
          <span className="share-card__stat-lbl">MID</span>
        </div>
        <div className="share-card__stat">
          <span className="share-card__stat-val">{ratings.defence}</span>
          <span className="share-card__stat-lbl">DEF</span>
        </div>
        <div className="share-card__stat">
          <span className="share-card__stat-val">{ratings.goalkeeping}</span>
          <span className="share-card__stat-lbl">GK</span>
        </div>
      </div>
    </div>
  );
}
