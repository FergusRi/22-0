import { getNationTheme } from "../../data/nationThemes";
import { supportedNations } from "../../data/nations";
import { GAUNTLET_TOTAL, worldCupChampions } from "../../data/worldCupChampions";
import { GRAIL_RECORD } from "../../lib/gauntlet/gauntletRecord";

export type EraFilter = "all" | "classic" | "modern";

type StartScreenProps = {
  showRatings: boolean;
  onToggleRatings: () => void;
  eraFilter: EraFilter;
  onChangeEra: (era: EraFilter) => void;
  onStart: () => void;
};

const STEPS = [
  {
    num: "1",
    title: "Draw your nation",
    desc: "Spin for one of 12 footballing powers.",
  },
  {
    num: "2",
    title: "Draft your XI",
    desc: "11 rounds — pick legends from real World Cup squads.",
  },
  {
    num: "3",
    title: "Run the gauntlet",
    desc: `All ${GAUNTLET_TOTAL} champions. Every tie played. Win or lose.`,
  },
  {
    num: "4",
    title: "Chase the grail",
    desc: `Perfect run: ${GRAIL_RECORD}. No one has done it.`,
  },
] as const;

export function StartScreen({
  showRatings,
  onToggleRatings,
  eraFilter,
  onChangeEra,
  onStart,
}: StartScreenProps) {
  const championStrip = [...worldCupChampions, ...worldCupChampions];

  return (
    <div className="start-screen">
      <header className="start-hero">
        <span className="start-hero__badge">
          <span className="start-hero__trophy" aria-hidden="true">
            🏆
          </span>
          World Cup Gauntlet
        </span>
        <h1 className="start-hero__hook">Can you become the champion of champions?</h1>
        <p className="start-hero__sub">
          Build a nation&apos;s all-time XI, then beat every World Cup winner in history —
          from Uruguay &apos;30 to Argentina &apos;22.
        </p>
      </header>

      <div className="start-grail-card">
        <span className="start-grail-card__label">The grail</span>
        <span className="start-grail-card__record">{GRAIL_RECORD}</span>
        <span className="start-grail-card__hint">
          {GAUNTLET_TOTAL} wins · {GAUNTLET_TOTAL} knockout ties · zero losses
        </span>
      </div>

      <section className="start-champions" aria-label="World Cup winners you must beat">
        <div className="start-champions__head">
          <span className="start-champions__title">Your opponents</span>
          <span className="start-champions__count">{GAUNTLET_TOTAL} champions</span>
        </div>
        <div className="start-champions__track-wrap">
          <div className="start-champions__track">
            {championStrip.map((champ, index) => {
              const theme = getNationTheme(champ.nation);
              return (
                <span
                  key={`${champ.year}-${index}`}
                  className="start-champions__chip"
                  style={{ borderColor: theme.primary }}
                >
                  <span className="start-champions__flag" aria-hidden="true">
                    {theme.flag}
                  </span>
                  <span className="start-champions__name">{champ.nation}</span>
                  <span className="start-champions__year">{champ.year}</span>
                </span>
              );
            })}
          </div>
        </div>
      </section>

      <section className="start-steps" aria-label="How to play">
        <h2 className="start-steps__heading">How it works</h2>
        <ol className="start-steps__list">
          {STEPS.map((step) => (
            <li key={step.num} className="start-steps__item">
              <span className="start-steps__num">{step.num}</span>
              <div className="start-steps__body">
                <span className="start-steps__title">{step.title}</span>
                <span className="start-steps__desc">{step.desc}</span>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <div className="start-stats">
        <div className="start-stats__item">
          <span className="start-stats__value">{supportedNations.length}</span>
          <span className="start-stats__label">Nations</span>
        </div>
        <div className="start-stats__item">
          <span className="start-stats__value">{GAUNTLET_TOTAL}</span>
          <span className="start-stats__label">Champions</span>
        </div>
        <div className="start-stats__item">
          <span className="start-stats__value">11</span>
          <span className="start-stats__label">Draft rounds</span>
        </div>
        <div className="start-stats__item start-stats__item--grail">
          <span className="start-stats__value">{GRAIL_RECORD}</span>
          <span className="start-stats__label">Perfect run</span>
        </div>
      </div>

      <section className="start-screen__controls">
        <label className="toggle">
          <input type="checkbox" checked={showRatings} onChange={onToggleRatings} />
          <span>Show player ratings</span>
        </label>

        <label className="era-filter">
          <span>Era</span>
          <select
            value={eraFilter}
            onChange={(event) => onChangeEra(event.target.value as EraFilter)}
          >
            <option value="all">All eras</option>
            <option value="classic">Classic (pre-1990)</option>
            <option value="modern">Modern (1990+)</option>
          </select>
        </label>
      </section>

      <button type="button" className="btn btn--start start-cta" onClick={onStart}>
        <span className="start-cta__main">Draw your nation</span>
        <span className="start-cta__sub">The gauntlet awaits</span>
      </button>
    </div>
  );
}
