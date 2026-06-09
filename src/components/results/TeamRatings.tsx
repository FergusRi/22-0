import type { TeamRatings as TeamRatingsType } from "../../lib/types/game";

type TeamRatingsProps = {
  ratings: TeamRatingsType;
  compact?: boolean;
};

const LINES: { key: keyof Omit<TeamRatingsType, "overall">; label: string }[] = [
  { key: "attack", label: "ATT" },
  { key: "midfield", label: "MID" },
  { key: "defence", label: "DEF" },
  { key: "goalkeeping", label: "GK" },
];

export function TeamRatings({ ratings, compact = false }: TeamRatingsProps) {
  return (
    <div className={`team-ratings ${compact ? "team-ratings--compact" : ""}`}>
      <div className="team-ratings__lines">
        {LINES.map(({ key, label }) => (
          <div className="rating-pill" key={key}>
            <span className="rating-pill__label">{label}</span>
            <span className="rating-pill__value">{ratings[key]}</span>
          </div>
        ))}
      </div>
      <div className="team-ratings__overall">
        <span className="team-ratings__overall-label">OVR</span>
        <span className="team-ratings__overall-value">{ratings.overall}</span>
      </div>
    </div>
  );
}
