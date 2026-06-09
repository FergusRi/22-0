import type { Formation } from "../../lib/types/game";

const LINE_CLASS: Record<string, string> = {
  GK: "formation-preview__dot--gk",
  DEF: "formation-preview__dot--def",
  MID: "formation-preview__dot--mid",
  FWD: "formation-preview__dot--fwd",
};

type FormationPreviewProps = {
  formation: Formation;
};

export function FormationPreview({ formation }: FormationPreviewProps) {
  return (
    <div className="formation-preview" aria-hidden="true">
      <div className="formation-preview__pitch">
        <div className="formation-preview__halfway" />
        {formation.slots.map((slot) => (
          <span
            key={slot.id}
            className={[
              "formation-preview__dot",
              LINE_CLASS[slot.line] ?? "",
            ]
              .filter(Boolean)
              .join(" ")}
            style={{ left: `${slot.x ?? 50}%`, bottom: `${slot.y ?? 50}%` }}
          />
        ))}
      </div>
    </div>
  );
}
