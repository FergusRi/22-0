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

function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3;
}

export function RevealTicker({
  items,
  pickTarget,
  onComplete,
  buttonLabel = "Reveal",
  runningLabel = "Revealing…",
  durationMs = 2900,
  completeDelayMs = 0,
  themeNation,
}: RevealTickerProps) {
  const [phase, setPhase] = useState<"idle" | "running" | "done">("idle");
  const [offset, setOffset] = useState(0);
  const rafRef = useRef<number | undefined>(undefined);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const strip = useMemo(() => {
    if (items.length === 0) return [];
    const expanded: RevealItem[] = [];
    for (let r = 0; r < 14; r += 1) {
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

    const minScroll = items.length * 5;
    const candidates = landIndices.filter((index) => index >= minScroll);
    const landIndex =
      candidates[candidates.length - 1] ??
      landIndices[landIndices.length - 1] ??
      0;

    const targetOffset = landIndex * ITEM_H - CENTER_OFFSET;
    const startOffset = 0;
    const startTime = performance.now();

    setPhase("running");

    function frame(now: number) {
      const t = Math.min(1, (now - startTime) / durationMs);
      setOffset(startOffset + (targetOffset - startOffset) * easeOutCubic(t));

      if (t < 1) {
        rafRef.current = requestAnimationFrame(frame);
      } else {
        setPhase("done");
        timerRef.current = setTimeout(() => onComplete(targetId), completeDelayMs);
      }
    }

    rafRef.current = requestAnimationFrame(frame);
  }

  return (
    <div
      className={`reveal ${themeNation ? "reveal--themed" : ""}`}
      style={themeNation ? themeStyle(themeNation) : undefined}
    >
      <div className="reveal__viewport">
        <div className="reveal__highlight" aria-hidden="true" />
        <div
          className={`reveal__strip ${phase === "running" ? "reveal__strip--running" : ""}`}
          style={{ transform: `translateY(-${offset}px)` }}
        >
          {strip.map((item, index) => (
            <div
              key={`${item.id}-${index}`}
              className={[
                "reveal__item",
                item.muted ? "reveal__item--muted" : "",
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
      </div>

      {phase !== "done" ? (
        <button
          type="button"
          className="btn btn--start reveal__button"
          onClick={start}
          disabled={phase === "running"}
        >
          {phase === "running" ? runningLabel : buttonLabel}
        </button>
      ) : null}
    </div>
  );
}
