import { getNationTheme } from "../../data/nationThemes";
import type { HistoricalTeam, Player } from "../../lib/types/game";
import { PlayerCard } from "./PlayerCard";

type DraftRoundProps = {
  round: number;
  totalRounds: number;
  nation: string;
  historicalTeam: HistoricalTeam;
  isPlayerTaken: (player: Player) => boolean;
  selectedPlayerId: string | null;
  showRatings: boolean;
  onSelectPlayer: (player: Player) => void;
};

export function DraftRound({
  round,
  totalRounds,
  nation,
  historicalTeam,
  isPlayerTaken,
  selectedPlayerId,
  showRatings,
  onSelectPlayer,
}: DraftRoundProps) {
  const userTheme = getNationTheme(nation);
  const squadTheme = getNationTheme(historicalTeam.nation);

  return (
    <div className="draft-round">
      <div className="draft-round__header">
        <div className="draft-round__squad-badge">
          <span className="draft-round__squad-flag" aria-hidden="true">
            {squadTheme.flag}
          </span>
          <div className="draft-round__squad-meta">
            <span className="draft-round__squad-year">{historicalTeam.year}</span>
            <span className="draft-round__squad-label">
              {historicalTeam.nation} World Cup squad
            </span>
          </div>
        </div>
        <h2 className="draft-round__nation">
          <span className="draft-round__nation-flag" aria-hidden="true">
            {userTheme.flag}
          </span>
          {nation}
        </h2>
        <span className="draft-round__counter">
          Pick {round} of {totalRounds}
        </span>
      </div>

      <div className="player-grid">
        {historicalTeam.players.map((player) => {
          const taken = isPlayerTaken(player);
          return (
            <PlayerCard
              key={player.id}
              player={player}
              showRatings={showRatings}
              disabled={taken}
              selected={player.id === selectedPlayerId}
              onClick={() => onSelectPlayer(player)}
            />
          );
        })}
      </div>
    </div>
  );
}
