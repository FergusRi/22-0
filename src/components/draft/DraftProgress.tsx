type DraftProgressProps = {
  round: number;
  total: number;
  nation: string;
};

export function DraftProgress({ round, total, nation }: DraftProgressProps) {
  return (
    <div className="draft-progress">
      <div className="draft-progress__labels">
        <span className="draft-progress__nation">{nation}</span>
        <span className="draft-progress__round">
          Round {round} of {total}
        </span>
      </div>
      <div className="draft-progress__bar" role="progressbar" aria-valuenow={round} aria-valuemin={1} aria-valuemax={total}>
        {Array.from({ length: total }, (_, i) => (
          <span
            key={i}
            className={[
              "draft-progress__pip",
              i < round - 1 ? "draft-progress__pip--done" : "",
              i === round - 1 ? "draft-progress__pip--current" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          />
        ))}
      </div>
    </div>
  );
}
