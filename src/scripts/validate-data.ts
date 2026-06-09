import { championLineupsByYear } from "../data/championLineups";
import { historicalTeams } from "../data/historical/index";
import { supportedNations } from "../data/nations";
import { worldCupAppearances } from "../data/worldCupAppearances";
import { GAUNTLET_TOTAL, worldCupChampions } from "../data/worldCupChampions";
import { formations } from "../lib/formations/formations";
import { resolveChampionLineup } from "../lib/gauntlet/championLineup";

type Problem = string;

const problems: Problem[] = [];
const warnings: Problem[] = [];

function check(condition: boolean, message: Problem): void {
  if (!condition) problems.push(message);
}

// --- Historical teams -------------------------------------------------------
const seenPlayerIds = new Set<string>();
const seenTeamIds = new Set<string>();

for (const team of historicalTeams) {
  check(
    team.players.length === 11,
    `Historical team ${team.id} has ${team.players.length} players (expected 11)`,
  );
  check(!seenTeamIds.has(team.id), `Duplicate historical team id: ${team.id}`);
  seenTeamIds.add(team.id);

  check(
    supportedNations.includes(team.nation),
    `Historical team ${team.id} has unsupported nation "${team.nation}"`,
  );

  const gkCount = team.players.filter((p) => p.position === "GK").length;
  check(gkCount >= 1, `Historical team ${team.id} has no goalkeeper`);

  for (const player of team.players) {
    check(
      !seenPlayerIds.has(player.id),
      `Duplicate player id: ${player.id}`,
    );
    seenPlayerIds.add(player.id);

    check(
      player.nation === team.nation,
      `Player ${player.id} nation "${player.nation}" != team nation "${team.nation}"`,
    );
    check(
      player.worldCupYear === team.year,
      `Player ${player.id} year ${player.worldCupYear} != team year ${team.year}`,
    );

    for (const [attr, value] of Object.entries({
      attack: player.attack,
      midfield: player.midfield,
      defence: player.defence,
      goalkeeping: player.goalkeeping,
      overall: player.overall,
    })) {
      check(
        value >= 0 && value <= 99,
        `Player ${player.id} has out-of-range ${attr}: ${value}`,
      );
    }
  }
}

// Every World Cup appearance year must have a playable squad.
for (const nation of supportedNations) {
  const expectedYears = worldCupAppearances[nation] ?? [];
  const squadYears = new Set(
    historicalTeams.filter((t) => t.nation === nation).map((t) => t.year),
  );

  for (const year of expectedYears) {
    check(
      squadYears.has(year),
      `Nation "${nation}" missing squad for World Cup ${year}`,
    );
  }

  for (const year of squadYears) {
    check(
      expectedYears.includes(year),
      `Nation "${nation}" has unexpected squad year ${year} (not in worldCupAppearances)`,
    );
  }
}

// --- Gauntlet champions -----------------------------------------------------
check(
  worldCupChampions.length === GAUNTLET_TOTAL,
  `Gauntlet has ${worldCupChampions.length} champions (expected ${GAUNTLET_TOTAL})`,
);

const championYears = new Set<number>();
for (const champion of worldCupChampions) {
  check(!championYears.has(champion.year), `Duplicate champion year: ${champion.year}`);
  championYears.add(champion.year);
  check(Boolean(champion.teamId), `Champion ${champion.year} has no teamId`);
  check(
    historicalTeams.some((t) => t.id === champion.teamId),
    `Champion ${champion.year} references missing team ${champion.teamId}`,
  );
  check(
    Boolean(championLineupsByYear[champion.year]),
    `Champion ${champion.year} has no lineup in championLineups`,
  );
  try {
    const lineup = resolveChampionLineup(champion);
    check(
      lineup.players.length === 11,
      `Champion ${champion.year} lineup has ${lineup.players.length} players`,
    );
  } catch (error) {
    problems.push(
      `Champion ${champion.year} lineup invalid: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}

// --- Formations -------------------------------------------------------------
for (const formation of formations) {
  check(
    formation.slots.length === 11,
    `Formation ${formation.id} has ${formation.slots.length} slots (expected 11)`,
  );
  const gkSlots = formation.slots.filter((s) => s.line === "GK").length;
  check(gkSlots === 1, `Formation ${formation.id} has ${gkSlots} GK slots (expected 1)`);
  const slotIds = new Set(formation.slots.map((s) => s.id));
  check(
    slotIds.size === formation.slots.length,
    `Formation ${formation.id} has duplicate slot ids`,
  );
}

// --- Report -----------------------------------------------------------------
for (const warning of warnings) {
  console.warn(`WARN: ${warning}`);
}

if (problems.length > 0) {
  console.error(`\nData validation FAILED with ${problems.length} problem(s):`);
  for (const problem of problems) {
    console.error(`  - ${problem}`);
  }
  process.exit(1);
}

console.log(
  `Data validation passed: ${historicalTeams.length} historical teams, ` +
    `${seenPlayerIds.size} players, ${worldCupChampions.length} gauntlet champions, ` +
    `${formations.length} formations.`,
);
