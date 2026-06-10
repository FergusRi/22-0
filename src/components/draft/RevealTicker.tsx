import { useEffect, useMemo, useRef, useState } from "react";
import { themeStyle } from "../../data/nationThemes";

export type RevealItem = {
  id: string;
  label: string;
  sublabel?: string;
  emoji?: string;
  /** Can flash on the ticker but will never be the landing result. */
  muted?: boolean;
};

type RevealTickerProps = {
  items: RevealItem[];
  /** Returns the id the ticker must land on. */
  pickTarget: () => string;
  onComplete: (id: string) => void;
  buttonLabel?: string;
  runningLabel?: string;
  durationMs?: number;
  /** Pause on the result before firing onComplete. */
  completeDelayMs?: number;
  /** Applies nation-themed colours to the ticker frame. */
  themeNation?: string;
};

const ITEM_H = 76;
const CENTER_OFFSET = ITEM_H;

/** Single smooth ease-out — no late creep through extra items. */
function easeSpin(t: number): number {
  return 1 - (1 - t) ** 4;
}

function centeredIndex(offset: number): number {
  return Math.round((offset + CENTER_OFFSET) / ITEM_H);
}

export function RevealTicker({
  items,
  pickTarget,
  onComplete,
  buttonLabel = "Reveal",
  runningLabel = "Revealing…",
  durationMs = 1850,
  completeDelayMs = 0,
  themeNation,
}: RevealTickerProps) {
  const [phase, setPhase] = useState<"idle" | "running" | "done">("idle");
  const [offset, setOffset] = useState(0);
  const [tickPulse, setTickPulse] = useState(0);
  const rafRef = useRef<number | undefined>(undefined);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const lastTickIndex = useRef(0);
  const landIndexRef = useRef(0);
  const targetOffsetRef = useRef(0);
  const targetIdRef = useRef("");

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const strip = useMemo(() => {
    if (items.length === 0) return [];
    const expanded: RevealItem[] = [];
    for (let r = 0; r < 10; r += 1) {
      expanded.push(...items);
    }
    return expanded;
  }, [items]);

  function start() {
    if (phase !== "idle" || items.length === 0) return;

    const targetId = pickTarget();
    const landIndices = strip
      .map((item, index) =>
        item.id === targetId && !item.muted ? index : -1,
      )
      .filter((index) => index >= 0);

    const minScroll = items.length * 4;
    const candidates = landIndices.filter((index) => index >= minScroll);
    const landIndex =
      candidates[candidates.length - 1] ??
      landIndices[landIndices.length - 1] ??
      0;

    const targetOffset = landIndex * ITEM_H - CENTER_OFFSET;
    const startTime = performance.now();
    lastTickIndex.current = 0;
    landIndexRef.current = landIndex;
    targetOffsetRef.current = targetOffset;
    targetIdRef.current = targetId;

    setPhase("running");
    setTickPulse(0);

    function finish() {
      setOffset(targetOffsetRef.current);
      rafRef.current = requestAnimationFrame(() => {
        setPhase("done");
        timerRef.current = setTimeout(
          () => onComplete(targetIdRef.current),
          completeDelayMs,
        );
      });
    }

    function frame(now: number) {
      const t = Math.min(1, (now - startTime) / durationMs);
      const eased = easeSpin(t);
      const nextOffset = targetOffsetRef.current * eased;
      setOffset(nextOffset);

      const tickIndex = centeredIndex(nextOffset);
      if (tickIndex !== lastTickIndex.current) {
        lastTickIndex.current = tickIndex;
        setTickPulse((n) => n + 1);
      }

      if (t >= 1) {
        finish();
        return;
      }

      rafRef.current = requestAnimationFrame(frame);
    }

    rafRef.current = requestAnimationFrame(frame);
  }

  const canStart = phase === "idle";
  const landIndex = landIndexRef.current;
  const highlightIndex =
    phase === "done"
      ? landIndex
      : phase === "running"
        ? centeredIndex(offset)
        : -1;

  return (
    <div
      className={[
        "reveal",
        themeNation ? "reveal--themed" : "",
        phase === "running" ? "reveal--running" : "",
        phase === "done" ? "reveal--landed" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={themeNation ? themeStyle(themeNation) : undefined}
    >
      <button
        type="button"
        className="reveal__viewport"
        onClick={canStart ? start : undefined}
        disabled={!canStart}
        aria-label={canStart ? buttonLabel : undefined}
      >
        <span className="reveal__pointer reveal__pointer--left" aria-hidden="true" />
        <span className="reveal__pointer reveal__pointer--right" aria-hidden="true" />
        <div
          key={phase === "running" ? tickPulse : "landed"}
          className={[
            "reveal__highlight",
            phase === "running" && tickPulse > 0 ? "reveal__highlight--pulse" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          aria-hidden="true"
        />
        <div
          className="reveal__strip"
          style={{ transform: `translate3d(0, -${offset}px, 0)` }}
        >
          {strip.map((item, index) => (
            <div
              key={`${item.id}-${index}`}
              className={[
                "reveal__item",
                item.muted ? "reveal__item--muted" : "",
                index === highlightIndex && phase !== "idle"
                  ? "reveal__item--active"
                  : "",
                index === highlightIndex && phase === "done"
                  ? "reveal__item--winner"
                  : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {item.emoji ? (
                <span className="reveal__emoji" aria-hidden="true">
                  {item.emoji}
                </span>
              ) : null}
              <span className="reveal__label">{item.label}</span>
              {item.sublabel ? (
                <span className="reveal__sub">{item.sublabel}</span>
              ) : null}
            </div>
          ))}
        </div>
      </button>

      {phase === "done" ? (
        <p className="reveal__locked" aria-live="polite">
          Locked in
        </p>
      ) : (
        <button
          type="button"
          className="btn btn--start reveal__button"
          onClick={start}
          disabled={phase === "running"}
        >
          {phase === "running" ? runningLabel : buttonLabel}
        </button>
      )}
    </div>
  );
}
