import { useEffect, useMemo, useState } from "react";

type WorldCupFact = {
  emoji: string;
  text: string;
};

const GENERAL_FACTS: WorldCupFact[] = [
  { emoji: "🐐", text: "Pelé is the only player to win three World Cups — 1958, 1962 and 1970." },
  { emoji: "⚽", text: "Just Fontaine scored 13 goals at the 1958 World Cup, still the record for a single tournament." },
  { emoji: "🧤", text: "The fastest World Cup goal was scored by Hakan Şükür after just 11 seconds in 2002." },
  { emoji: "👑", text: "Miroslav Klose holds the all-time World Cup scoring record with 16 goals across four tournaments." },
  { emoji: "🧮", text: "Only eight different nations have ever won the World Cup since it began in 1930." },
  { emoji: "🌍", text: "The 2010 World Cup in South Africa was the first ever held on the African continent." },
  { emoji: "🥅", text: "The 1930 and 1950 finals never used a single substitute — subs weren't allowed until 1970." },
  { emoji: "📺", text: "The 1954 World Cup in Switzerland was the first to ever be broadcast on television." },
];

const NATION_FACTS: Record<string, WorldCupFact[]> = {
  Brazil: [
    { emoji: "🇧🇷", text: "Brazil are the only nation to play in every World Cup, and they've lifted it a record five times." },
    { emoji: "🌟", text: "Brazil's 1970 side is widely called the greatest team ever, winning every game on the way to the title." },
    { emoji: "💔", text: "Brazil's 7-1 semi-final loss to Germany in 2014 came on home soil in Belo Horizonte." },
  ],
  Argentina: [
    { emoji: "🇦🇷", text: "Argentina have won three World Cups — 1978, 1986 and 2022." },
    { emoji: "💍", text: "Maradona's 'Hand of God' and 'Goal of the Century' both came in the same 1986 quarter-final." },
    { emoji: "🐐", text: "Lionel Messi finally lifted the trophy in 2022, scoring in the final and the shoot-out." },
  ],
  Germany: [
    { emoji: "🇩🇪", text: "Germany have won the World Cup four times, level with Italy." },
    { emoji: "🔥", text: "The 1954 'Miracle of Bern' saw West Germany beat the mighty Hungary 3-2 from 2-0 down." },
    { emoji: "👑", text: "Germany's Miroslav Klose is the World Cup's all-time top scorer with 16 goals." },
  ],
  Italy: [
    { emoji: "🇮🇹", text: "Italy have won four World Cups and didn't concede an open-play goal en route to the 2006 title." },
    { emoji: "🧱", text: "Italy went a record 1,142 minutes without conceding across the 1990 World Cup." },
    { emoji: "🎯", text: "Italy beat France on penalties to win the 2006 final after Zidane's famous red card." },
  ],
  France: [
    { emoji: "🇫🇷", text: "France won their first World Cup in 1998 as hosts, then won it again in 2018." },
    { emoji: "⚡", text: "Kylian Mbappé scored a hat-trick in the 2022 final and still finished on the losing side." },
    { emoji: "🎩", text: "Zinedine Zidane scored twice in the 1998 final to beat Brazil 3-0 in Paris." },
  ],
  Spain: [
    { emoji: "🇪🇸", text: "Spain won their only World Cup in 2010, with Andrés Iniesta scoring the winner in extra time." },
    { emoji: "🎶", text: "Spain's tiki-taka side won the 2008 Euros, 2010 World Cup and 2012 Euros back-to-back." },
    { emoji: "🧤", text: "Iker Casillas captained and kept goal for Spain's 2010 winners, conceding just twice all tournament." },
  ],
  England: [
    { emoji: "🏴", text: "England won their only World Cup in 1966 on home soil, beating West Germany 4-2." },
    { emoji: "🎩", text: "Geoff Hurst is the only man to score a hat-trick in a World Cup final, in 1966." },
    { emoji: "🥅", text: "England reached the semi-finals in 2018 and 1990, their best runs away from home." },
  ],
  Netherlands: [
    { emoji: "🇳🇱", text: "The Netherlands have reached three World Cup finals (1974, 1978, 2010) but never won one." },
    { emoji: "🌀", text: "Johan Cruyff's 'Total Football' Dutch side of 1974 revolutionised the game." },
    { emoji: "🥉", text: "The Dutch finished third at the 2014 World Cup in Brazil." },
  ],
  Portugal: [
    { emoji: "🇵🇹", text: "Portugal's best World Cup finish was third place in 1966, led by the great Eusébio." },
    { emoji: "⚽", text: "Eusébio was the top scorer at the 1966 World Cup with nine goals." },
    { emoji: "🐐", text: "Cristiano Ronaldo has appeared at a record five different World Cups for Portugal." },
  ],
  Uruguay: [
    { emoji: "🇺🇾", text: "Uruguay won the very first World Cup on home soil in 1930, beating Argentina 4-2." },
    { emoji: "🏆", text: "Uruguay shocked hosts Brazil to win the 1950 final, the famous 'Maracanazo'." },
    { emoji: "⭐", text: "Despite their small size, Uruguay have won the World Cup twice — 1930 and 1950." },
  ],
  Croatia: [
    { emoji: "🇭🇷", text: "Croatia reached the World Cup final in 2018, losing 4-2 to France." },
    { emoji: "🥉", text: "Croatia also finished third in 1998 and 2022, remarkable for a nation of four million." },
    { emoji: "🎯", text: "Croatia won three straight knockout games on penalties on the way to the 2018 final." },
  ],
  Belgium: [
    { emoji: "🇧🇪", text: "Belgium's 'Golden Generation' finished third at the 2018 World Cup, their best ever result." },
    { emoji: "📈", text: "Belgium topped the FIFA world rankings from 2018, despite never winning a major trophy." },
    { emoji: "⚡", text: "Belgium's 3-2 comeback win over Japan in 2018 was settled by a last-second counter-attack." },
  ],
};

function shuffle<T>(input: T[]): T[] {
  const arr = [...input];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

type WorldCupFactsProps = {
  /** When set, facts about this nation are shown first. */
  nation?: string;
};

export function WorldCupFacts({ nation }: WorldCupFactsProps) {
  const facts = useMemo(() => {
    const nationFacts = nation ? NATION_FACTS[nation] ?? [] : [];
    const biased = shuffle(nationFacts);
    const general = shuffle(GENERAL_FACTS);
    return [...biased, ...general];
    // Re-randomise whenever the nation changes (i.e. each fresh roll).
  }, [nation]);

  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
    const id = setInterval(() => {
      setIndex((n) => (n + 1) % facts.length);
    }, 6000);
    return () => clearInterval(id);
  }, [facts]);

  const fact = facts[index];
  if (!fact) return null;

  return (
    <aside className="wc-facts" aria-label="World Cup facts">
      <span className="wc-facts__label">
        {nation ? `${nation} · Did you know?` : "Did you know?"}
      </span>
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
