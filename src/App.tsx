import { useMemo, useState } from "react";
import { DraftProgress } from "./components/draft/DraftProgress";
import { DraftRound } from "./components/draft/DraftRound";
import { FormationPitch } from "./components/draft/FormationPitch";
import { RevealTicker, type RevealItem } from "./components/draft/RevealTicker";
import { WorldCupFacts } from "./components/common/WorldCupFacts";
import { FormationSelector } from "./components/formation/FormationSelector";
import { NationStrengths } from "./components/formation/NationStrengths";
import { getNationProfile } from "./lib/nations/nationProfile";
import { getNationTheme, themeStyle } from "./data/nationThemes";
import { GauntletBriefing } from "./components/results/GauntletBriefing";
import { GauntletLaunch } from "./components/results/GauntletLaunch";
import { GauntletResults } from "./components/results/GauntletResults";
import { GauntletRunViewer } from "./components/results/GauntletRunViewer";
import { MatchSimulator } from "./components/results/MatchSimulator";
import { TeamRatings } from "./components/results/TeamRatings";
import { projectGauntletRun } from "./lib/gauntlet/gauntletProjection";
import { GauntletShareCard } from "./components/share/GauntletShareCard";
import { historicalTeams } from "./data/historical/index";
import { supportedNations } from "./data/nations";
import { worldCupAppearances } from "./data/worldCupAppearances";
import type { EraFilter } from "./components/start/StartScreen";
import { StartScreen } from "./components/start/StartScreen";
import { canAssignToSlot } from "./lib/draft/canAssignToSlot";
import { getRandomHistoricalTeam } from "./lib/draft/getRandomHistoricalTeam";
import { getRandomNation } from "./lib/draft/getRandomNation";
import { personKey } from "./lib/draft/personKey";
import { formations } from "./lib/formations/formations";
import { runGauntlet } from "./lib/gauntlet/runGauntlet";
import { calculateTeamRatings } from "./lib/ratings/calculateTeamRatings";
import type {
  DraftPick,
  Formation,
  FormationSlot,
  GauntletResult,
  HistoricalTeam,
  Player,
  TeamRatings as TeamRatingsType,
  TournamentTeam,
} from "./lib/types/game";

type GameStep =
  | "start"
  | "nation"
  | "formation"
  | "draft"
  | "review"
  | "ratings"
  | "simulation"
  | "result";

type DraftPhase = "reveal" | "pick";

const TOTAL_ROUNDS = 11;

function nationId(nation: string): string {
  return nation.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

function buildUserTeam(nation: string, ratings: TeamRatingsType): TournamentTeam {
  return {
    id: nationId(nation),
    nation,
    group: "USER",
    ...ratings,
    isUserTeam: true,
  };
}

function teamsForEra(teams: HistoricalTeam[], era: EraFilter): HistoricalTeam[] {
  if (era === "classic") return teams.filter((t) => t.year < 1990);
  if (era === "modern") return teams.filter((t) => t.year >= 1990);
  return teams;
}

function nationCampaigns(nation: string, era: EraFilter): HistoricalTeam[] {
  const all = historicalTeams.filter((team) => team.nation === nation);
  const eraFiltered = teamsForEra(all, era);
  const pool = eraFiltered.length > 0 ? eraFiltered : all;
  return [...pool].sort((a, b) => a.year - b.year);
}

export default function App() {
  const [step, setStep] = useState<GameStep>("start");
  const [selectedFormation, setSelectedFormation] = useState<Formation | null>(null);
  const [showRatings, setShowRatings] = useState(true);
  const [eraFilter, setEraFilter] = useState<EraFilter>("all");

  const [nation, setNation] = useState<string | null>(null);
  const [draftPhase, setDraftPhase] = useState<DraftPhase>("reveal");
  const [currentRound, setCurrentRound] = useState(1);
  const [currentHistoricalTeam, setCurrentHistoricalTeam] =
    useState<HistoricalTeam | null>(null);
  const [draftPicks, setDraftPicks] = useState<DraftPick[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [ratings, setRatings] = useState<TeamRatingsType | null>(null);
  const [gauntletResult, setGauntletResult] = useState<GauntletResult | null>(null);
  const [simPhase, setSimPhase] = useState<"choose" | "live" | "skip" | "results">("choose");

  const pickedPersonKeys = useMemo(
    () => new Set(draftPicks.map((pick) => personKey(pick.player))),
    [draftPicks],
  );

  const playersBySlot = useMemo(() => {
    const map: Record<string, Player | undefined> = {};
    for (const pick of draftPicks) {
      map[pick.slotId] = pick.player;
    }
    return map;
  }, [draftPicks]);

  const filledSlotIds = useMemo(
    () => new Set(draftPicks.map((pick) => pick.slotId)),
    [draftPicks],
  );

  const selectableSlotIds = useMemo(() => {
    if (!selectedFormation || !selectedPlayer) return new Set<string>();
    return new Set(
      selectedFormation.slots
        .filter(
          (slot) =>
            !filledSlotIds.has(slot.id) && canAssignToSlot(selectedPlayer, slot),
        )
        .map((slot) => slot.id),
    );
  }, [selectedFormation, selectedPlayer, filledSlotIds]);

  const nationRevealItems: RevealItem[] = useMemo(
    () =>
      supportedNations.map((name) => ({
        id: name,
        label: name,
        sublabel: "World Cup nation",
        emoji: getNationTheme(name).flag,
      })),
    [],
  );

  const yearRevealItems: RevealItem[] = useMemo(() => {
    if (!nation) return [];

    const playableYears = new Set(
      nationCampaigns(nation, eraFilter).map((team) => team.year),
    );

    const squadYears = historicalTeams
      .filter((team) => team.nation === nation)
      .map((team) => team.year);
    const years = Array.from(
      new Set([...(worldCupAppearances[nation] ?? []), ...squadYears]),
    ).sort((a, b) => a - b);

    const flag = getNationTheme(nation).flag;
    return years.map((year) => ({
      id: String(year),
      label: String(year),
      sublabel: playableYears.has(year) ? `${nation} squad` : "No squad on file",
      emoji: flag,
      muted: !playableYears.has(year),
    }));
  }, [nation, eraFilter]);

  const isPlayerTaken = (player: Player) =>
    pickedPersonKeys.has(personKey(player));

  const nationProfile = useMemo(
    () => (nation ? getNationProfile(nation) : null),
    [nation],
  );

  const gauntletProjection = useMemo(() => {
    if (!nation || !ratings) return null;
    return projectGauntletRun(buildUserTeam(nation, ratings), ratings);
  }, [nation, ratings]);

  function handleStart() {
    setNation(null);
    setSelectedFormation(null);
    setStep("nation");
  }

  function handleNationResult(result: string) {
    setNation(result);
    setSelectedFormation(null);
  }

  function beginDraft() {
    if (!selectedFormation) return;
    setDraftPicks([]);
    setCurrentRound(1);
    setSelectedPlayer(null);
    setCurrentHistoricalTeam(null);
    setDraftPhase("reveal");
    setStep("draft");
  }

  function pickTeamYear(): string {
    if (!nation) return yearRevealItems.find((item) => !item.muted)?.id ?? "";
    const pool = nationCampaigns(nation, eraFilter);
    return String(getRandomHistoricalTeam(pool, nation, pickedPersonKeys).year);
  }

  function handleTeamResult(yearId: string) {
    if (!nation) return;
    const year = Number(yearId);
    const team = historicalTeams.find(
      (t) => t.nation === nation && t.year === year,
    );
    if (!team) return;
    setCurrentHistoricalTeam(team);
    setSelectedPlayer(null);
    setDraftPhase("pick");
  }

  function handleAssignSlot(slot: FormationSlot) {
    if (!selectedPlayer || !currentHistoricalTeam || !nation) return;
    if (!selectableSlotIds.has(slot.id)) return;

    const pick: DraftPick = {
      round: currentRound,
      historicalTeamId: currentHistoricalTeam.id,
      historicalTeamNation: currentHistoricalTeam.nation,
      historicalTeamYear: currentHistoricalTeam.year,
      player: selectedPlayer,
      slotId: slot.id,
    };

    const nextPicks = [...draftPicks, pick];
    setDraftPicks(nextPicks);
    setSelectedPlayer(null);

    if (nextPicks.length >= TOTAL_ROUNDS) {
      setCurrentHistoricalTeam(null);
      setStep("review");
      return;
    }

    setCurrentRound(currentRound + 1);
    setCurrentHistoricalTeam(null);
    setDraftPhase("reveal");
  }

  function handleCalculateRatings() {
    if (!selectedFormation) return;
    setRatings(calculateTeamRatings(selectedFormation, draftPicks));
    setStep("ratings");
  }

  function handleEnterGauntlet() {
    if (!nation || !ratings) return;
    const userTeam = buildUserTeam(nation, ratings);
    const result = runGauntlet(
      userTeam,
      draftPicks.map((pick) => pick.player),
    );
    setGauntletResult(result);
    setSimPhase("choose");
    setStep("simulation");
  }

  function handlePlayAgain() {
    setStep("start");
    setSelectedFormation(null);
    setNation(null);
    setDraftPhase("reveal");
    setCurrentRound(1);
    setCurrentHistoricalTeam(null);
    setDraftPicks([]);
    setSelectedPlayer(null);
    setRatings(null);
    setGauntletResult(null);
    setSimPhase("choose");
  }

  return (
    <div className="app">
      <div className="app__shell">
        {step === "start" && (
          <StartScreen
            showRatings={showRatings}
            onToggleRatings={() => setShowRatings((v) => !v)}
            eraFilter={eraFilter}
            onChangeEra={setEraFilter}
            onStart={handleStart}
          />
        )}

        {step === "nation" && (
          <div className="reveal-screen">
            <h2 className="screen-title">Draw your nation</h2>
            <p className="reveal-subtitle">Who are you building for?</p>
            {!nation ? (
              <>
                <RevealTicker
                  items={nationRevealItems}
                  pickTarget={() => getRandomNation(supportedNations)}
                  onComplete={handleNationResult}
                  buttonLabel="Draw nation"
                  runningLabel="Drawing…"
                  durationMs={1700}
                  completeDelayMs={280}
                />
                <WorldCupFacts />
              </>
            ) : (
              <div
                className="nation-reveal nation-reveal--result"
                style={themeStyle(nation)}
              >
                <span className="nation-reveal__label">You are</span>
                <span className="nation-reveal__flag" aria-hidden="true">
                  {getNationTheme(nation).flag}
                </span>
                <h3 className="nation-reveal__nation">{nation}</h3>
                <p className="nation-reveal__hint">
                  Pick a formation that suits {nation}&apos;s strengths, then draft
                  11 players from their World Cup history.
                </p>
                <button
                  type="button"
                  className="btn btn--start"
                  onClick={() => setStep("formation")}
                >
                  Choose formation
                </button>
              </div>
            )}
          </div>
        )}

        {step === "formation" && nation && nationProfile && (
          <div className="formation-screen" style={themeStyle(nation)}>
            <NationStrengths profile={nationProfile} />
            <section className="formation-screen__section">
              <h2 className="formation-screen__label">Choose a formation</h2>
              <p className="formation-screen__hint">
                Formations marked &ldquo;Fits {nation}&rdquo; play to your pool&apos;s
                strongest line.
              </p>
              <FormationSelector
                formations={formations}
                selectedId={selectedFormation?.id ?? null}
                nationProfile={nationProfile}
                onSelect={setSelectedFormation}
              />
            </section>
            <button
              type="button"
              className="btn btn--start"
              onClick={beginDraft}
              disabled={!selectedFormation}
            >
              {selectedFormation ? "Begin Draft" : "Pick a formation"}
            </button>
          </div>
        )}

        {step === "draft" && nation && selectedFormation && draftPhase === "reveal" && (
          <div className="draft-flow" style={themeStyle(nation)}>
            <DraftProgress round={currentRound} total={TOTAL_ROUNDS} nation={nation} />
            <div className="reveal-screen">
              <h2 className="screen-title">Reveal your squad</h2>
              <p className="reveal-subtitle">Which {nation} World Cup year is up?</p>
              <RevealTicker
                key={`year-${currentRound}`}
                items={yearRevealItems}
                pickTarget={pickTeamYear}
                onComplete={handleTeamResult}
                buttonLabel="Reveal squad"
                runningLabel="Revealing…"
                durationMs={1800}
                completeDelayMs={380}
                themeNation={nation}
              />
              <WorldCupFacts />
            </div>
          </div>
        )}

        {step === "draft" &&
          nation &&
          selectedFormation &&
          draftPhase === "pick" &&
          currentHistoricalTeam && (
            <div className="draft-flow draft-flow--pick" style={themeStyle(nation)}>
              <DraftProgress round={currentRound} total={TOTAL_ROUNDS} nation={nation} />
              <div className="draft-screen">
              <DraftRound
                round={currentRound}
                totalRounds={TOTAL_ROUNDS}
                nation={nation}
                historicalTeam={currentHistoricalTeam}
                isPlayerTaken={isPlayerTaken}
                selectedPlayerId={selectedPlayer?.id ?? null}
                showRatings={showRatings}
                onSelectPlayer={setSelectedPlayer}
              />
              <div className="draft-screen__pitch">
                <p className="draft-hint">
                  {selectedPlayer
                    ? selectableSlotIds.size > 0
                      ? `Place ${selectedPlayer.name} in a highlighted slot.`
                      : `No valid slot left for ${selectedPlayer.name}. Pick another player.`
                    : "Select a player, then choose a slot on the pitch."}
                </p>
                <FormationPitch
                  formation={selectedFormation}
                  playersBySlot={playersBySlot}
                  showRatings={showRatings}
                  selectableSlotIds={selectableSlotIds}
                  onSlotClick={handleAssignSlot}
                />
              </div>
              </div>
            </div>
          )}

        {step === "review" && selectedFormation && nation && (
          <div className="review-screen">
            <h2 className="screen-title">{nation} — Your XI</h2>
            <FormationPitch
              formation={selectedFormation}
              playersBySlot={playersBySlot}
              showRatings={showRatings}
            />
            <button type="button" className="btn btn--primary" onClick={handleCalculateRatings}>
              Calculate Ratings
            </button>
          </div>
        )}

        {step === "ratings" && ratings && nation && gauntletProjection && (
          <div className="ratings-screen">
            <h2 className="screen-title">{nation} — Squad locked</h2>
            <TeamRatings ratings={ratings} />
            <GauntletBriefing
              nation={nation}
              ratings={ratings}
              projection={gauntletProjection}
              onRun={handleEnterGauntlet}
            />
          </div>
        )}

        {step === "simulation" && gauntletResult && gauntletProjection && simPhase === "choose" && nation && (
          <div className="simulation-screen">
            <GauntletLaunch
              nation={nation}
              projection={gauntletProjection}
              onSim={() => setSimPhase("live")}
              onSkip={() => setSimPhase("skip")}
            />
          </div>
        )}

        {step === "simulation" &&
          gauntletResult &&
          simPhase === "live" &&
          nation &&
          selectedFormation && (
            <div className="simulation-screen">
              <h2 className="screen-title">Live gauntlet</h2>
              <MatchSimulator
                gauntlet={gauntletResult}
                nation={nation}
                formation={selectedFormation}
                picks={draftPicks}
                onFinish={() => setSimPhase("results")}
              />
            </div>
          )}

        {step === "simulation" &&
          gauntletResult &&
          simPhase === "skip" &&
          nation &&
          selectedFormation &&
          ratings && (
            <div className="simulation-screen">
              <h2 className="screen-title">Gauntlet results</h2>
              <GauntletRunViewer
                result={gauntletResult}
                nation={nation}
                formation={selectedFormation}
                picks={draftPicks}
                ratingsOvr={ratings.overall}
                onFinish={() => setSimPhase("results")}
              />
            </div>
          )}

        {step === "simulation" && gauntletResult && simPhase === "results" && (
          <div className="simulation-screen">
            <h2 className="screen-title">Gauntlet Result</h2>
            <GauntletResults result={gauntletResult} projection={gauntletProjection} />
            <button type="button" className="btn btn--primary" onClick={() => setStep("result")}>
              View Share Card
            </button>
          </div>
        )}

        {step === "result" && gauntletResult && ratings && nation && selectedFormation && (
          <div className="result-screen">
            <GauntletShareCard
              nation={nation}
              formation={selectedFormation}
              picks={draftPicks}
              ratings={ratings}
              result={gauntletResult}
            />
            <button type="button" className="btn btn--primary" onClick={handlePlayAgain}>
              Play Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
