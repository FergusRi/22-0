import type { ReactNode } from "react";
import { getNationTheme, themeStyle } from "../../data/nationThemes";

type ChampionMatchFrameProps = {
  championYear: number;
  championNation: string;
  progress?: string;
  children: ReactNode;
};

export function ChampionMatchFrame({
  championYear,
  championNation,
  progress,
  children,
}: ChampionMatchFrameProps) {
  const theme = getNationTheme(championNation);

  return (
    <div
      className="champion-match"
      style={themeStyle(championNation)}
    >
      <header className="champion-match__hero">
        <span className="champion-match__trophy" aria-hidden="true">
          🏆
        </span>
        <div className="champion-match__titles">
          <span className="champion-match__year">{championYear} World Cup Champions</span>
          <span className="champion-match__nation">
            <span className="champion-match__flag" aria-hidden="true">
              {theme.flag}
            </span>
            {championNation} {championYear}
          </span>
        </div>
        {progress ? (
          <span className="champion-match__progress">{progress}</span>
        ) : null}
      </header>
      <div className="champion-match__body">{children}</div>
    </div>
  );
}
