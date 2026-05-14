import { Lock } from "lucide-react";
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

interface CountrySelectorProps {
  activeCountry: Country;
  userTier: string;
  onCountryChange: (country: Country) => void;
  onLockedClick: () => void;
}

export function CountrySelector({ activeCountry, userTier, onCountryChange, onLockedClick }: CountrySelectorProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
      {COUNTRIES.map((country) => {
        const isLocked = userTier === "free" && country !== "India";
        const isActive = activeCountry === country;
        return (
          <button
            key={country}
            onClick={() => (isLocked ? onLockedClick() : onCountryChange(country))}
            className={`flex items-center gap-1.5 whitespace-nowrap px-4 py-2 rounded-full text-xs font-semibold transition-all border flex-shrink-0 ${
              isActive
                ? "bg-primary text-white border-primary shadow-sm"
                : isLocked
                ? "bg-card/50 text-muted-foreground/40 border-border/40 cursor-pointer hover:border-primary/30 hover:text-muted-foreground/60"
                : "bg-card text-muted-foreground border-border hover:text-foreground hover:border-foreground/20"
            }`}
          >
            <span className="text-sm leading-none">{FLAGS[country]}</span>
            {country}
            {isLocked && (
              <span className="flex items-center gap-0.5 ml-0.5">
                <Lock className="w-2.5 h-2.5" />
                <span className="text-[9px] font-black uppercase tracking-wider">Pro</span>
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
