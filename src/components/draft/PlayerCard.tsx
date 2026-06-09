import type { Player } from "../../lib/types/game";

type PlayerCardProps = {
  player: Player;
  showRatings: boolean;
  disabled?: boolean;
  selected?: boolean;
  onClick?: () => void;
};

const POSITION_CLASS: Record<Player["position"], string> = {
  GK: "pos-gk",
  DEF: "pos-def",
  MID: "pos-mid",
  FWD: "pos-fwd",
};

export function PlayerCard({
  player,
  showRatings,
  disabled = false,
  selected = false,
  onClick,
}: PlayerCardProps) {
  const className = [
    "player-card",
    selected ? "player-card--selected" : "",
    disabled ? "player-card--disabled" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type="button"
      className={`${className} player-card--${player.position.toLowerCase()}`}
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
    >
      <div className="player-card__top">
        <span className={`player-card__pos ${POSITION_CLASS[player.position]}`}>
          {player.position}
        </span>
        {showRatings && <span className="player-card__ovr">{player.overall}</span>}
      </div>
      <div className="player-card__name">{player.name}</div>
      <div className="player-card__year">{player.nation} · {player.worldCupYear}</div>
      {disabled && <div className="player-card__taken">Picked</div>}
    </button>
  );
}
