import { formationMatchesNation } from "../../lib/nations/nationProfile";
import type { NationProfile } from "../../lib/nations/nationProfile";
import type { Formation, FormationFocus } from "../../lib/types/game";
import { FormationPreview } from "./FormationPreview";

type FormationSelectorProps = {
  formations: Formation[];
  selectedId: string | null;
  nationProfile: NationProfile;
  onSelect: (formation: Formation) => void;
};

const FOCUS_LABEL: Record<FormationFocus, string> = {
  attack: "Attacking",
  midfield: "Midfield",
  defence: "Defensive",
  balanced: "Balanced",
};

export function FormationSelector({
  formations,
  selectedId,
  nationProfile,
  onSelect,
}: FormationSelectorProps) {
  return (
    <div className="formation-selector">
      {formations.map((formation) => {
        const selected = formation.id === selectedId;
        const recommended = formationMatchesNation(formation.focus, nationProfile);
        return (
          <button
            type="button"
            key={formation.id}
            className={[
              "formation-option",
              selected ? "formation-option--selected" : "",
              recommended ? "formation-option--recommended" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={() => onSelect(formation)}
            aria-pressed={selected}
          >
            {recommended ? (
              <span className="formation-option__badge">Fits {nationProfile.nation}</span>
            ) : null}
            <FormationPreview formation={formation} />
            <span className="formation-option__name">{formation.name}</span>
            <span className="formation-option__focus">{FOCUS_LABEL[formation.focus]}</span>
            <span className="formation-option__desc">{formation.description}</span>
          </button>
        );
      })}
    </div>
  );
}
