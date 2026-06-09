export type NationTheme = {
  flag: string;
  primary: string;
  secondary: string;
  glow: string;
};

const DEFAULT: NationTheme = {
  flag: "🏆",
  primary: "#1c8a4d",
  secondary: "#0a1a12",
  glow: "rgba(34, 197, 94, 0.25)",
};

export const nationThemes: Record<string, NationTheme> = {
  Uruguay: { flag: "🇺🇾", primary: "#5b9bd5", secondary: "#ffffff", glow: "rgba(91, 155, 213, 0.3)" },
  Italy: { flag: "🇮🇹", primary: "#009246", secondary: "#ce2b37", glow: "rgba(0, 146, 70, 0.28)" },
  Germany: { flag: "🇩🇪", primary: "#1a1a1a", secondary: "#dd0000", glow: "rgba(221, 0, 0, 0.22)" },
  Brazil: { flag: "🇧🇷", primary: "#009c3b", secondary: "#ffdf00", glow: "rgba(255, 223, 0, 0.22)" },
  England: { flag: "🇬🇧", primary: "#ffffff", secondary: "#ce1124", glow: "rgba(206, 17, 36, 0.2)" },
  Argentina: { flag: "🇦🇷", primary: "#74acdf", secondary: "#ffffff", glow: "rgba(116, 172, 223, 0.28)" },
  France: { flag: "🇫🇷", primary: "#0055a4", secondary: "#ef4135", glow: "rgba(0, 85, 164, 0.28)" },
  Spain: { flag: "🇪🇸", primary: "#c60b1e", secondary: "#ffc400", glow: "rgba(198, 11, 30, 0.25)" },
  Netherlands: { flag: "🇳🇱", primary: "#ff6600", secondary: "#21468b", glow: "rgba(255, 102, 0, 0.22)" },
  Portugal: { flag: "🇵🇹", primary: "#006600", secondary: "#ff0000", glow: "rgba(0, 102, 0, 0.22)" },
  Croatia: { flag: "🇭🇷", primary: "#ff0000", secondary: "#ffffff", glow: "rgba(255, 0, 0, 0.18)" },
  Belgium: { flag: "🇧🇪", primary: "#ef3340", secondary: "#fdda25", glow: "rgba(239, 51, 64, 0.22)" },
};

export function getNationTheme(nation: string): NationTheme {
  return nationThemes[nation] ?? DEFAULT;
}

export function themeStyle(nation: string): Record<string, string> {
  const t = getNationTheme(nation);
  return {
    "--nation-primary": t.primary,
    "--nation-secondary": t.secondary,
    "--nation-glow": t.glow,
    "--champ-primary": t.primary,
    "--champ-secondary": t.secondary,
    "--champ-glow": t.glow,
  };
}
