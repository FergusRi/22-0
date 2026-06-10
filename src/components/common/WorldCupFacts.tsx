import { useEffect, useMemo, useState } from "react";

type WorldCupFact = {
  emoji: string;
  text: string;
};

const FACTS: WorldCupFact[] = [
  { emoji: "🇧🇷", text: "Brazil are the only nation to play in every World Cup, and they've lifted it a record five times." },
  { emoji: "🐐", text: "Pelé is the only player to win three World Cups — 1958, 1962 and 1970." },
  { emoji: "⚽", text: "Just Fontaine scored 13 goals at the 1958 World Cup, still the record for a single tournament." },
  { emoji: "🧤", text: "The fastest World Cup goal was scored by Hakan Şükür after just 11 seconds in 2002." },
  { emoji: "🏆", text: "Uruguay won the very first World Cup on home soil in 1930, beating Argentina 4-2." },
  { emoji: "🇩🇪", text: "Germany's 7-1 demolition of Brazil in 2014 is the heaviest semi-final defeat in World Cup history." },
  { emoji: "👑", text: "Miroslav Klose holds the all-time World Cup scoring record with 16 goals across four tournaments." },
  { emoji: "🇮🇹", text: "Italy went a record 1,142 minutes without conceding across the 1990 World Cup." },
  { emoji: "🔥", text: "The 1954 final saw West Germany overturn a 2-0 deficit to beat the mighty Hungary 3-2." },
  { emoji: "🎯", text: "Argentina's 2022 final win over France went to penalties after a 3-3 thriller — Mbappé scored a hat-trick." },
  { emoji: "🧮", text: "Only eight different nations have ever won the World Cup since it began in 1930." },
  { emoji: "🌍", text: "The 2010 World Cup in South Africa was the first ever held on the African continent." },
  { emoji: "💍", text: "Diego Maradona's 'Hand of God' and 'Goal of the Century' both came in the same 1986 quarter-final." },
  { emoji: "🥅", text: "The 1930 and 1950 finals never used a single substitute — subs weren't allowed until 1970." },
  { emoji: "🇫🇷", text: "France won their first World Cup in 1998 as hosts, then won it again 20 years later in 2018." },
];

export function WorldCupFacts() {
  const facts = useMemo(() => {
    const shuffled = [...FACTS];
    for (let i = shuffled.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, []);

  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((n) => (n + 1) % facts.length);
    }, 6000);
    return () => clearInterval(id);
  }, [facts.length]);

  const fact = facts[index];

  return (
    <aside className="wc-facts" aria-label="World Cup facts">
      <span className="wc-facts__label">Did you know?</span>
      <p key={index} className="wc-facts__text">
        <span className="wc-facts__emoji" aria-hidden="true">
          {fact.emoji}
        </span>
        {fact.text}
      </p>
      <div className="wc-facts__dots" aria-hidden="true">
        {facts.map((_, i) => (
          <span
            key={i}
            className={
              i === index ? "wc-facts__dot wc-facts__dot--on" : "wc-facts__dot"
            }
          />
        ))}
      </div>
    </aside>
  );
}
