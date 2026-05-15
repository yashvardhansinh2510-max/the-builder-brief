import { Category, Country } from "@/lib/ground-game-data";

const CATEGORIES: Category[] = [
  "Food & Hospitality",
  "Health & Wellness",
  "Trade & Home Services",
  "Education & Coaching",
  "Micro-Manufacturing",
  "Family Business Transformation",
  "AI-Augmented Offline",
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
      <div className="flex gap-2 flex-wrap items-center">
        <button
          onClick={onClearAll}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all flex-shrink-0 ${
            isAll
              ? "bg-primary text-white border-primary"
              : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"
          }`}
        >
          All
        </button>
        {CATEGORIES.map((cat) => {
          const active = activeCategories.has(cat);
          return (
            <button
              key={cat}
              onClick={() => onToggle(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all flex-shrink-0 ${
                active
                  ? "bg-primary/10 text-primary border-primary/30"
                  : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>
      <p className="mt-2.5 text-[11px] text-muted-foreground/60 font-mono">
        Showing {filteredCount} idea{filteredCount !== 1 ? "s" : ""} ·{" "}
        {activeCountry} ·{" "}
        {isAll
          ? "All Categories"
          : `${activeCategories.size} filter${activeCategories.size !== 1 ? "s" : ""} active`}
      </p>
    </div>
  );
}
