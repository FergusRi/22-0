import type { Formation, FormationSlot, Player } from "../../lib/types/game";

type FormationPitchProps = {
  formation: Formation;
  playersBySlot: Record<string, Player | undefined>;
  showRatings: boolean;
  selectableSlotIds?: Set<string>;
  onSlotClick?: (slot: FormationSlot) => void;
};

function surname(name: string): string {
  const parts = name.trim().split(" ");
  return parts.length === 1 ? parts[0] : parts.slice(1).join(" ");
}

export function FormationPitch({
  formation,
  playersBySlot,
  showRatings,
  selectableSlotIds,
  onSlotClick,
}: FormationPitchProps) {
  return (
    <div className="pitch" role="group" aria-label={`${formation.name} formation`}>
      <div className="pitch__lines" aria-hidden="true">
        <div className="pitch__halfway" />
        <div className="pitch__center-circle" />
        <div className="pitch__box pitch__box--top" />
        <div className="pitch__box pitch__box--bottom" />
      </div>

      {formation.slots.map((slot) => {
        const player = playersBySlot[slot.id];
        const selectable = selectableSlotIds?.has(slot.id) ?? false;
        const lineClass = player
          ? `slot--line-${slot.line.toLowerCase()}`
          : `slot--line-${slot.line.toLowerCase()}-empty`;
        const className = [
          "slot",
          player ? "slot--filled" : "slot--empty",
          lineClass,
          selectable ? "slot--selectable" : "",
        ]
          .filter(Boolean)
          .join(" ");

        return (
          <button
            type="button"
            key={slot.id}
            className={className}
            style={{ left: `${slot.x ?? 50}%`, bottom: `${slot.y ?? 50}%` }}
            onClick={() => selectable && onSlotClick?.(slot)}
            disabled={!selectable}
          >
            <span className="slot__token">
              {player ? (
                <>
                  <span className="slot__name">{surname(player.name)}</span>
                  <span className="slot__meta">
                    {player.worldCupYear}
                    {showRatings ? ` · ${player.overall}` : ""}
                  </span>
                </>
              ) : (
                <span className="slot__label">{slot.label}</span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
