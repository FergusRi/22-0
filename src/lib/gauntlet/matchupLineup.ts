import type { DraftPick, Formation, Player } from "../types/game";

export function userMatchupPlayers(
  formation: Formation,
  picks: DraftPick[],
): { role: string; name: string; ovr: number; position: Player["position"] }[] {
  const picksBySlot = new Map(picks.map((p) => [p.slotId, p]));
  return formation.slots
    .map((slot) => {
      const pick = picksBySlot.get(slot.id);
      if (!pick) return null;
      return {
        role: slot.label,
        name: pick.player.name,
        ovr: pick.player.overall,
        position: pick.player.position,
      };
    })
    .filter(
      (row): row is { role: string; name: string; ovr: number; position: Player["position"] } =>
        row !== null,
    );
}

export function squadMatchupPlayers(
  squad: Player[],
): { role: string; name: string; ovr: number; position: Player["position"] }[] {
  return squad.map((player) => ({
    role: player.position,
    name: player.name,
    ovr: player.overall,
    position: player.position,
  }));
}
