import { getNationTheme } from "../../data/nationThemes";
import type { NationProfile } from "../../lib/nations/nationProfile";

type NationStrengthsProps = {
  profile: NationProfile;
};

const BARS = [
  { key: "attack", label: "ATT", valueKey: "attack" as const },
  { key: "midfield", label: "MID", valueKey: "midfield" as const },
  { key: "defence", label: "DEF", valueKey: "defence" as const },
  { key: "goalkeeping", label: "GK", valueKey: "goalkeeping" as const },
];

export function NationStrengths({ profile }: NationStrengthsProps) {
  const theme = getNationTheme(profile.nation);
  const maxVal = Math.max(
    profile.attack,
    profile.midfield,
    profile.defence,
    profile.goalkeeping,
    1,
  );

  return (
    <div className="nation-strengths">
      <div className="nation-strengths__header">
        <span className="nation-strengths__flag" aria-hidden="true">
          {theme.flag}
        </span>
        <div className="nation-strengths__titles">
          <span className="nation-strengths__nation">{profile.nation}</span>
          <span className="nation-strengths__tag">
            Pool strength: <strong>{profile.strengthLabel}</strong>
          </span>
        </div>
      </div>
      <p className="nation-strengths__blurb">{profile.blurb}</p>
      <div className="nation-strengths__bars">
        {BARS.map((bar) => {
          const value = profile[bar.valueKey];
          const isTop =
            bar.valueKey !== "goalkeeping"
              ? profile.strength === bar.valueKey
              : false;
          return (
            <div key={bar.key} className="nation-strengths__bar-row">
              <span
                className={`nation-strengths__bar-label ${
                  isTop ? "nation-strengths__bar-label--top" : ""
                }`}
              >
                {bar.label}
              </span>
              <div className="nation-strengths__bar-track">
                <span
                  className={`nation-strengths__bar-fill ${
                    isTop ? "nation-strengths__bar-fill--top" : ""
                  }`}
                  style={{ width: `${(value / maxVal) * 100}%` }}
                />
              </div>
              <span className="nation-strengths__bar-val">{value}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
