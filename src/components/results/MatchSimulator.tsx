import { useEffect, useMemo, useRef, useState } from "react";
import { getNationTheme } from "../../data/nationThemes";
import { GAUNTLET_TOTAL } from "../../data/worldCupChampions";
import { GRAIL_RECORD } from "../../lib/gauntlet/gauntletRecord";
import { squadMatchupPlayers, userMatchupPlayers } from "../../lib/gauntlet/matchupLineup";
import { getPreMatchRead } from "../../lib/simulation/preMatchRead";
import type { DraftPick, Formation, GauntletResult, MatchResult, Player } from "../../lib/types/game";
import { ChampionMatchFrame } from "./ChampionMatchFrame";
import { GauntletSimHud } from "./GauntletSimHud";
import { MatchupTable, type MatchupSide } from "./MatchupTable";
import { PreMatchRead } from "./PreMatchRead";

type SimMatch = {
  key: string;
  stageLabel: string;
  championYear: number;
  championNation: string;
  championSquad: Player[];
  progress?: string;
  match: MatchResult;
  isKnockout: boolean;
  isFinal: boolean;
};

type MatchSimulatorProps = {
  gauntlet: GauntletResult;
  nation: string;
  formation: Formation;
  picks: DraftPick[];
  onFinish: () => void;
};

function tallyThrough(sequence: SimMatch[], through: number, userId: string) {
  let wins = 0;
  let losses = 0;
  for (let i = 0; i < through; i += 1) {
    if (perspective(sequence[i].match, userId).won) wins += 1;
    else losses += 1;
  }
  return { wins, losses };
}

function buildGauntletSequence(result: GauntletResult): SimMatch[] {
  return result.matches.map((gm) => ({
    key: `champ-${gm.championYear}`,
    stageLabel: gm.championLabel,
    championYear: gm.championYear,
    championNation: gm.championNation,
    championSquad: gm.championSquad,
    progress: `Champion ${gm.round} of ${GAUNTLET_TOTAL}`,
    match: gm.match,
    isKnockout: true,
    isFinal: gm.round === GAUNTLET_TOTAL,
  }));
}

function perspective(match: MatchResult, userId: string) {
  const userIsA = match.teamA.id === userId;
  return {
    userIsA,
    userTeam: userIsA ? match.teamA : match.teamB,
    opp: userIsA ? match.teamB : match.teamA,
    userGoals: userIsA ? match.teamAGoals : match.teamBGoals,
    oppGoals: userIsA ? match.teamBGoals : match.teamAGoals,
    won: match.winnerId === userId,
  };
}

type Outcome = {
  text: string;
  tone: "win" | "draw" | "loss" | "champ";
};

function outcomeFor(item: SimMatch, userId: string, grailHit: boolean): Outcome {
  const { userGoals, oppGoals, won } = perspective(item.match, userId);

  if (item.isKnockout) {
    if (won) {
      if (item.isFinal && grailHit) {
        return { text: `${GRAIL_RECORD} — Grail!`, tone: "champ" };
      }
      if (item.isFinal) {
        return { text: "Final tie won", tone: "win" };
      }
      return { text: "Win — on to the next champion", tone: "win" };
    }
    return { text: `Loss vs ${item.stageLabel}`, tone: "loss" };
  }

  if (userGoals > oppGoals) return { text: "Win", tone: "win" };
  if (userGoals === oppGoals) return { text: "Draw", tone: "draw" };
  return { text: "Loss", tone: "loss" };
}

export function MatchSimulator({
  gauntlet,
  nation,
  formation,
  picks,
  onFinish,
}: MatchSimulatorProps) {
  const sequence = useMemo(() => buildGauntletSequence(gauntlet), [gauntlet]);
  const userId = gauntlet.userTeamId;

  const [step, setStep] = useState(0);
  const [started, setStarted] = useState(false);

  if (sequence.length === 0) {
    return (
      <div className="match-sim">
        <button type="button" className="btn btn--primary" onClick={onFinish}>
          View Full Results
        </button>
      </div>
    );
  }

  const item = sequence[step];
  const isLast = step >= sequence.length - 1;
  const view = perspective(item.match, userId);
  const preMatch = getPreMatchRead(view.userTeam, view.opp, item.isKnockout);
  const record = tallyThrough(sequence, step, userId);
  const matchup = {
    user: {
      nation,
      ovr: view.userTeam.overall,
      players: userMatchupPlayers(formation, picks),
    },
    opponent: {
      nation: item.championNation,
      subtitle: String(item.championYear),
      ovr: view.opp.overall,
      players: squadMatchupPlayers(item.championSquad),
    },
  };

  function handleNext() {
    if (isLast) {
      onFinish();
      return;
    }
    setStep((s) => s + 1);
    setStarted(false);
  }

  return (
    <div className="match-sim">
      <GauntletSimHud
        wins={record.wins}
        losses={record.losses}
        tieLabel={`Tie ${step + 1} of ${sequence.length} · ${item.stageLabel}`}
      />

      <ol className="match-sim__timeline">
        {sequence.map((seqItem, i) => {
          const done = i < step;
          const seqView = perspective(seqItem.match, userId);
          const seqOutcome = done ? outcomeFor(seqItem, userId, gauntlet.completed) : null;
          const pipTheme = getNationTheme(seqItem.championNation);
          return (
            <li
              key={seqItem.key}
              className={[
                "match-sim__pip",
                i === step ? "match-sim__pip--current" : "",
                seqOutcome ? `match-sim__pip--${seqOutcome.tone}` : "",
              ]
                .filter(Boolean)
                .join(" ")}
              title={`${pipTheme.flag} ${seqItem.stageLabel}`}
            >
              {done ? `${seqView.userGoals}-${seqView.oppGoals}` : pipTheme.flag}
            </li>
          );
        })}
      </ol>

      {!started ? (
        <ChampionMatchFrame
          championYear={item.championYear}
          championNation={item.championNation}
          progress={item.progress}
        >
          <div className="match-card match-card--preview">
            <MatchupTable user={matchup.user} opponent={matchup.opponent} />
            <PreMatchRead read={preMatch} />
            <button
              type="button"
              className="btn btn--start match-card__kickoff"
              onClick={() => setStarted(true)}
            >
              Kick Off
            </button>
          </div>
        </ChampionMatchFrame>
      ) : (
        <ChampionMatchFrame
          championYear={item.championYear}
          championNation={item.championNation}
          progress={item.progress}
        >
          <LiveMatch
            key={item.key}
            item={item}
            userId={userId}
            isLast={isLast}
            grailHit={gauntlet.completed}
            matchup={matchup}
            onNext={handleNext}
          />
        </ChampionMatchFrame>
      )}

      <button type="button" className="link-button" onClick={onFinish}>
        Skip to end
      </button>
    </div>
  );
}

type LiveMatchProps = {
  item: SimMatch;
  userId: string;
  isLast: boolean;
  grailHit: boolean;
  matchup: { user: MatchupSide; opponent: MatchupSide };
  onNext: () => void;
};

type LivePhase = "live" | "penalties" | "fulltime";

/** Real-time length of a simulated 90- or 120-minute match. */
const MATCH_MS = { regular: 6200, extra: 8200 } as const;
const PEN_KICK_MS = 1250;
const PEN_START_MS = 900;

function LiveMatch({ item, userId, isLast, grailHit, matchup, onNext }: LiveMatchProps) {
  const { match } = item;
  const view = perspective(match, userId);
  const goals = match.goals;
  const matchMinutes = match.decidedBy === "normal" ? 90 : 120;
  const durationMs = matchMinutes > 90 ? MATCH_MS.extra : MATCH_MS.regular;
  const minutesPerMs = matchMinutes / durationMs;
  const penKicks = match.shootout?.kicks ?? [];
  const userTheme = getNationTheme(view.userTeam.nation);
  const oppTheme = getNationTheme(view.opp.nation);

  const [clock, setClock] = useState(0);
  const [revealed, setRevealed] = useState(0);
  const [penRevealed, setPenRevealed] = useState(0);
  const [phase, setPhase] = useState<LivePhase>("live");
  const [flashKey, setFlashKey] = useState(0);
  const [penFlashKey, setPenFlashKey] = useState(0);

  const rafId = useRef<number | undefined>(undefined);
  const startTs = useRef<number | undefined>(undefined);
  const revealedRef = useRef(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const liveDone = useRef(false);

  function clearTimers() {
    timers.current.forEach((t) => clearTimeout(t));
    timers.current = [];
  }

  function schedule(fn: () => void, ms: number) {
    const t = setTimeout(fn, ms);
    timers.current.push(t);
    return t;
  }

  function beginPenalties() {
    setPhase("penalties");
    setPenRevealed(0);

    schedule(() => {
      let index = 0;
      const revealKick = () => {
        if (index >= penKicks.length) {
          schedule(() => setPhase("fulltime"), 500);
          return;
        }
        index += 1;
        setPenRevealed(index);
        setPenFlashKey((k) => k + 1);
        schedule(revealKick, PEN_KICK_MS);
      };
      revealKick();
    }, PEN_START_MS);
  }

  function endLivePlay() {
    if (liveDone.current) return;
    liveDone.current = true;
    if (rafId.current) cancelAnimationFrame(rafId.current);
    setClock(matchMinutes);
    revealedRef.current = goals.length;
    setRevealed(goals.length);

    if (match.shootout) {
      beginPenalties();
    } else {
      setPhase("fulltime");
    }
  }

  useEffect(() => {
    function frame(now: number) {
      if (startTs.current === undefined) startTs.current = now;
      const elapsed = now - startTs.current;
      const minute = Math.min(matchMinutes, Math.floor(elapsed * minutesPerMs));
      setClock(minute);

      while (
        revealedRef.current < goals.length &&
        goals[revealedRef.current].minute <= minute
      ) {
        revealedRef.current += 1;
        setRevealed(revealedRef.current);
        setFlashKey((k) => k + 1);
      }

      if (minute >= matchMinutes) {
        endLivePlay();
        return;
      }
      rafId.current = requestAnimationFrame(frame);
    }

    rafId.current = requestAnimationFrame(frame);
    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
      clearTimers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function skipMatch() {
    clearTimers();
    liveDone.current = true;
    if (rafId.current) cancelAnimationFrame(rafId.current);
    setClock(matchMinutes);
    revealedRef.current = goals.length;
    setRevealed(goals.length);
    if (match.shootout) {
      setPenRevealed(penKicks.length);
    }
    setPhase("fulltime");
  }

  const shownGoals = goals.slice(0, revealed);
  const shownPens = penKicks.slice(0, penRevealed);
  const userScore = shownGoals.filter((g) => g.teamId === view.userTeam.id).length;
  const oppScore = shownGoals.filter((g) => g.teamId === view.opp.id).length;
  const userPensLive = shownPens.filter(
    (k) => k.teamId === view.userTeam.id && k.scored,
  ).length;
  const oppPensLive = shownPens.filter(
    (k) => k.teamId === view.opp.id && k.scored,
  ).length;
  const inExtraTime = clock > 90 && phase === "live";
  const progressPct = Math.min(100, (clock / matchMinutes) * 100);
  const inShootout = phase === "penalties" || (phase === "fulltime" && match.shootout);
  const latestGoal = shownGoals.length > 0 ? shownGoals[shownGoals.length - 1] : null;
  const latestPen = shownPens.length > 0 ? shownPens[shownPens.length - 1] : null;

  const outcome = outcomeFor(item, userId, grailHit);

  return (
    <div className={`live-match live-match--${phase}`}>
      <MatchupTable user={matchup.user} opponent={matchup.opponent} compact />
      {phase === "live" && latestGoal && flashKey > 0 ? (
        <div
          key={flashKey}
          className={`goal-flash ${
            latestGoal.teamId === view.userTeam.id ? "goal-flash--user" : ""
          }`}
        >
          <span className="goal-flash__label">GOAL!</span>
          <span className="goal-flash__scorer">{latestGoal.scorerName}</span>
          <span className="goal-flash__min">{latestGoal.minute}&rsquo;</span>
        </div>
      ) : null}

      {phase === "penalties" && latestPen && penFlashKey > 0 ? (
        <div
          key={`pen-${penFlashKey}`}
          className={`goal-flash goal-flash--pen ${
            latestPen.scored ? "goal-flash--scored" : "goal-flash--missed"
          }`}
        >
          <span className="goal-flash__label">
            {latestPen.scored ? "Scores!" : "Saved!"}
          </span>
          <span className="goal-flash__scorer">{latestPen.kickerName}</span>
        </div>
      ) : null}

      {inShootout ? (
        <div className="live-match__clock">
          <span className="live-match__pens-label">Penalties</span>
          {phase === "fulltime" ? (
            <span className="live-match__ft">FT</span>
          ) : null}
        </div>
      ) : (
        <>
          <div className="live-match__clock">
            <span className="live-match__minute" key={clock}>
              {clock}&rsquo;
            </span>
            {phase === "fulltime" ? (
              <span className="live-match__ft">FT</span>
            ) : inExtraTime ? (
              <span className="live-match__et">extra time</span>
            ) : null}
          </div>
          <div className="live-match__bar">
            <span className="live-match__bar-fill" style={{ width: `${progressPct}%` }} />
            <span className="live-match__bar-half" />
          </div>
        </>
      )}

      <div className="live-match__scoreboard">
        <span className="live-match__team live-match__team--user">
          <span className="live-match__flag" aria-hidden="true">
            {userTheme.flag}
          </span>
          {view.userTeam.nation}
        </span>
        {inShootout ? (
          <span className="live-match__score live-match__score--pens">
            <span className="live-match__num" key={`pu-${userPensLive}-${penFlashKey}`}>
              {userPensLive}
            </span>
            <span className="live-match__colon">–</span>
            <span className="live-match__num" key={`po-${oppPensLive}-${penFlashKey}`}>
              {oppPensLive}
            </span>
          </span>
        ) : (
          <span className="live-match__score">
            <span className="live-match__num" key={`u-${userScore}-${flashKey}`}>
              {userScore}
            </span>
            <span className="live-match__colon">:</span>
            <span className="live-match__num" key={`o-${oppScore}-${flashKey}`}>
              {oppScore}
            </span>
          </span>
        )}
        <span className="live-match__team live-match__team--opp">
          <span className="live-match__flag" aria-hidden="true">
            {oppTheme.flag}
          </span>
          {view.opp.nation}
        </span>
      </div>

      {inShootout && phase !== "fulltime" ? (
        <p className="live-match__pens-hint">
          {penRevealed === 0 ? "Spot kicks about to begin…" : "Next kick…"}
        </p>
      ) : null}

      <div className="live-match__feed">
        {phase === "penalties" || (phase === "fulltime" && match.shootout)
          ? [...shownPens].reverse().map((kick, i) => {
              const isUser = kick.teamId === view.userTeam.id;
              return (
                <div
                  key={`pen-${shownPens.length - i}-${kick.teamId}`}
                  className={[
                    "pen-line",
                    kick.scored ? "pen-line--scored" : "pen-line--missed",
                    isUser ? "pen-line--user" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <span className="pen-line__icon" aria-hidden="true">
                    {kick.scored ? "✓" : "✗"}
                  </span>
                  <span className="pen-line__kicker">{kick.kickerName}</span>
                  <span className="pen-line__result">
                    {kick.scored ? "Scores!" : "Saved"}
                  </span>
                </div>
              );
            })
          : null}

        {phase === "live" && shownGoals.length === 0 ? (
          <div className="goal-line goal-line--muted">No goals yet…</div>
        ) : null}

        {phase === "live"
          ? [...shownGoals].reverse().map((g, i) => {
              const isUser = g.teamId === view.userTeam.id;
              return (
                <div
                  key={`${g.minute}-${g.teamId}-${i}`}
                  className={`goal-line ${isUser ? "goal-line--user" : ""}`}
                >
                  <span className="goal-line__ball" aria-hidden="true">
                    ⚽
                  </span>
                  <span className="goal-line__min">{g.minute}&rsquo;</span>
                  <span className="goal-line__scorer">{g.scorerName}</span>
                  {g.period === "extra-time" ? (
                    <span className="goal-line__et">a.e.t.</span>
                  ) : null}
                </div>
              );
            })
          : null}
      </div>

      <div className="live-match__footer">
        {phase === "fulltime" ? (
          <>
            <span className={`outcome-chip outcome-chip--${outcome.tone}`}>
              {outcome.text}
              {match.shootout ? (
                <em className="outcome-chip__suffix"> on penalties</em>
              ) : null}
            </span>
            <button type="button" className="btn btn--primary" onClick={onNext}>
              {isLast ? "See Full Results" : "Next Champion"}
            </button>
          </>
        ) : (
          <button type="button" className="link-button" onClick={skipMatch}>
            Skip match
          </button>
        )}
      </div>
    </div>
  );
}
