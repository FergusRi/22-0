import type { PreMatchRead as PreMatchReadType } from "../../lib/simulation/preMatchRead";

type PreMatchReadProps = {
  read: PreMatchReadType;
};

export function PreMatchRead({ read }: PreMatchReadProps) {
  return (
    <div className={`prematch prematch--${read.verdict}`}>
      <span className="prematch__badge">{read.label}</span>
      <p className="prematch__headline">{read.headline}</p>
      <ul className="prematch__hints">
        {read.hints.map((hint) => (
          <li key={hint}>{hint}</li>
        ))}
      </ul>
    </div>
  );
}
