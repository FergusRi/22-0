import type { GauntletResult } from "../types/game";
import { formatGauntletRecord, GRAIL_RECORD } from "./gauntletRecord";
import { tierForWins } from "./gauntletProjection";

export function gauntletHeadline(result: GauntletResult): string {
  const record = formatGauntletRecord(result.wins, result.losses);
  if (result.completed) {
    return `${record} — Beat every World Cup winner`;
  }
  return `${record} vs all past winners`;
}

export function gauntletTier(result: GauntletResult): string {
  if (result.completed) return `${GRAIL_RECORD} GRAIL`;
  return tierForWins(result.wins).label.toUpperCase();
}
