import { Country } from "@/lib/ground-game-data";

const FLAGS: Record<Country, string> = {
  India: "🇮🇳",
  "United States": "🇺🇸",
  "United Kingdom": "🇬🇧",
  Australia: "🇦🇺",
  UAE: "🇦🇪",
  "Southeast Asia": "🌏",
  "Rest of World": "🌍",
};

const COUNTRIES: Country[] = [
  "India",
  "United States",
  "United Kingdom",
  "Australia",
  "UAE",
  "Southeast Asia",
  "Rest of World",
];

// Approximate (cx, cy) positions on a 400x200 viewBox world map
const PIN_POSITIONS: Record<Country, { cx: number; cy: number }> = {
  "United States":   { cx: 80,  cy: 80  },
  "United Kingdom":  { cx: 188, cy: 55  },
  India:             { cx: 272, cy: 100 },
  UAE:               { cx: 252, cy: 95  },
  "Southeast Asia":  { cx: 308, cy: 108 },
  Australia:         { cx: 318, cy: 148 },
  "Rest of World":   { cx: 200, cy: 100 },
};

interface CountrySelectorProps {
  activeCountry: Country;
  userTier: string;
  onCountryChange: (country: Country) => void;
  onLockedClick: () => void;
}

export function CountrySelector({
  activeCountry,
  userTier,
  onCountryChange,
  onLockedClick,
}: CountrySelectorProps) {
  const isLocked = (country: Country) => userTier === "free" && country !== "India";

  const handlePin = (country: Country) => {
    if (isLocked(country)) {
      onLockedClick();
    } else {
      onCountryChange(country);
    }
  };

  return (
    <div className="w-full">
      {/* SVG World Map — hidden on xs, shown sm+ */}
      <div className="hidden sm:block w-full mb-4">
        <svg
          viewBox="0 0 400 200"
          className="w-full max-w-lg mx-auto"
          aria-label="Country selector map"
        >
          <rect x="0" y="0" width="400" height="200" rx="12" fill="transparent" />

          {COUNTRIES.filter(c => c !== "Rest of World").map(country => {
            const pos = PIN_POSITIONS[country];
            const active = activeCountry === country;
            const locked = isLocked(country);
            return (
              <g
                key={country}
                onClick={() => handlePin(country)}
                className="cursor-pointer"
                role="button"
                aria-label={country}
              >
                <circle
                  cx={pos.cx}
                  cy={pos.cy}
                  r={active ? 10 : 7}
                  className={`transition-all ${
                    active
                      ? "fill-primary stroke-primary/30 stroke-[4]"
                      : locked
                      ? "fill-muted stroke-border"
                      : "fill-card stroke-border hover:fill-primary/20 hover:stroke-primary"
                  }`}
                />
                <text
                  x={pos.cx}
                  y={pos.cy + 4}
                  textAnchor="middle"
                  fontSize="8"
                  className="pointer-events-none select-none fill-foreground"
                >
                  {FLAGS[country]}
                </text>
                {locked && (
                  <text
                    x={pos.cx}
                    y={pos.cy + 18}
                    textAnchor="middle"
                    fontSize="7"
                    className="pointer-events-none select-none fill-muted-foreground"
                  >
                    🔒
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Fallback dropdown — always shown on xs, hidden sm+ */}
      <div className="sm:hidden">
        <select
          value={activeCountry}
          onChange={e => {
            const c = e.target.value as Country;
            if (isLocked(c)) onLockedClick();
            else onCountryChange(c);
          }}
          className="w-full px-4 py-2.5 border border-border rounded-xl bg-card text-foreground text-sm"
        >
          {COUNTRIES.map(c => (
            <option key={c} value={c}>
              {FLAGS[c]} {c} {isLocked(c) ? "🔒 Pro" : ""}
            </option>
          ))}
        </select>
      </div>

      {/* Active country label */}
      <p className="text-center text-sm font-medium mt-2">
        {FLAGS[activeCountry]} {activeCountry}
      </p>
    </div>
  );
}
