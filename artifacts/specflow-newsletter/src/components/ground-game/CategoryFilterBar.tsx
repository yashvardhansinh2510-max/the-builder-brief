import { Category, Country } from "@/lib/ground-game-data";

const CATEGORIES: Category[] = [
  "AI-Augmented Offline",
  "Micro-Manufacturing",
  "Health & Wellness",
  "Trade & Home Services",
  "Food & Hospitality",
  "Education & Coaching",
  "Family Business Transformation",
];

interface CategoryFilterBarProps {
  activeCategories: Set<Category>;
  onToggle: (cat: Category) => void;
  onClearAll: () => void;
  filteredCount: number;
  activeCountry: Country;
}

export function CategoryFilterBar({
  activeCategories,
  onToggle,
  onClearAll,
  filteredCount,
  activeCountry,
}: CategoryFilterBarProps) {
  const isAll = activeCategories.size === 0;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={onClearAll}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors border flex-shrink-0 ${
            isAll
              ? "bg-primary text-white border-primary"
              : "bg-transparent text-muted-foreground border-border hover:border-foreground/20 hover:text-foreground"
          }`}
        >
          All
        </button>
        {CATEGORIES.map((cat) => {
          const isActive = activeCategories.has(cat);
          return (
            <button
              key={cat}
              onClick={() => onToggle(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors border flex-shrink-0 ${
                isActive
                  ? "bg-primary/10 text-primary border-primary/30"
                  : "bg-transparent text-muted-foreground border-border hover:border-foreground/20 hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>
      <p className="mt-3 text-[11px] text-muted-foreground/60 font-mono">
        Showing {filteredCount} idea{filteredCount !== 1 ? "s" : ""} ·{" "}
        {activeCountry} ·{" "}
        {isAll ? "All Categories" : `${activeCategories.size} filter${activeCategories.size !== 1 ? "s" : ""} active`}
      </p>
    </div>
  );
}
