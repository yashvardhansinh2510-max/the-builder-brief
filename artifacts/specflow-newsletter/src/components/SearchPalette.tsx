import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { Vault, FileText, Map, ArrowRight, Clock, X } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001/api";
const RECENT_KEY = "search_recent";
const MAX_RECENT = 5;

interface SearchResult {
  id: string;
  title: string;
  description?: string;
  href: string;
  type: "vault" | "brief" | "blueprint";
}

function getRecent(): SearchResult[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
  } catch {
    return [];
  }
}

function addRecent(item: SearchResult) {
  const prev = getRecent().filter((r) => r.id !== item.id);
  const next = [item, ...prev].slice(0, MAX_RECENT);
  localStorage.setItem(RECENT_KEY, JSON.stringify(next));
}

const TYPE_ICON = {
  vault: Map,
  brief: FileText,
  blueprint: Vault,
};

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SearchPalette({ open, onOpenChange }: Props) {
  const [, setLocation] = useLocation();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [recent, setRecent] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) setRecent(getRecent());
  }, [open]);

  const search = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); return; }
    setLoading(true);
    try {
      const [vaultsRes, briefsRes, blueprintsRes] = await Promise.allSettled([
        fetch(`${API_BASE}/vaults?q=${encodeURIComponent(q)}&pageSize=5`).then((r) =>
          r.ok ? r.json() : { vaults: [] }
        ),
        fetch(`${API_BASE}/briefs?q=${encodeURIComponent(q)}&pageSize=3`).then((r) =>
          r.ok ? r.json() : { briefs: [] }
        ),
        fetch(`${API_BASE}/blueprints?q=${encodeURIComponent(q)}&pageSize=3`).then((r) =>
          r.ok ? r.json() : { blueprints: [] }
        ),
      ]);

      const mapped: SearchResult[] = [];
      if (vaultsRes.status === "fulfilled") {
        (vaultsRes.value.vaults ?? []).forEach((v: any) =>
          mapped.push({ id: `v-${v.id}`, title: v.title, description: v.tagline, href: `/vault/${v.id}`, type: "vault" })
        );
      }
      if (briefsRes.status === "fulfilled") {
        (briefsRes.value.briefs ?? []).forEach((b: any) =>
          mapped.push({ id: `b-${b.id}`, title: b.title, description: b.summary, href: `/archive/${b.slug || b.id}`, type: "brief" })
        );
      }
      if (blueprintsRes.status === "fulfilled") {
        (blueprintsRes.value.blueprints ?? []).forEach((bp: any) =>
          mapped.push({ id: `bp-${bp.id}`, title: bp.title, description: bp.description, href: `/blueprints/${bp.id}`, type: "blueprint" })
        );
      }
      setResults(mapped);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => search(query), 200);
    return () => clearTimeout(t);
  }, [query, search]);

  const navigate = (item: SearchResult) => {
    addRecent(item);
    setRecent(getRecent());
    onOpenChange(false);
    setQuery("");
    setLocation(item.href);
  };

  const byType = (type: SearchResult["type"]) => results.filter((r) => r.type === type);

  return (
    <CommandDialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) setQuery(""); }}>
      <CommandInput
        placeholder="Search vaults, briefs, blueprints..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList className="max-h-[420px]">
        {!query && recent.length > 0 && (
          <CommandGroup heading="Recent">
            {recent.map((item) => {
              const Icon = TYPE_ICON[item.type];
              return (
                <CommandItem key={item.id} onSelect={() => navigate(item)} className="gap-3">
                  <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{item.title}</p>
                  </div>
                  <Icon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                </CommandItem>
              );
            })}
          </CommandGroup>
        )}

        {query && !loading && results.length === 0 && (
          <CommandEmpty>
            No results. Try searching &ldquo;SaaS&rdquo;, &ldquo;AI&rdquo;, &ldquo;founder&rdquo;&hellip;
          </CommandEmpty>
        )}

        {byType("vault").length > 0 && (
          <CommandGroup heading="Vaults">
            {byType("vault").map((item) => (
              <CommandItem key={item.id} onSelect={() => navigate(item)} className="gap-3">
                <Map className="w-4 h-4 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{item.title}</p>
                  {item.description && (
                    <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                  )}
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {byType("brief").length > 0 && (
          <>
            {byType("vault").length > 0 && <CommandSeparator />}
            <CommandGroup heading="Briefs">
              {byType("brief").map((item) => (
                <CommandItem key={item.id} onSelect={() => navigate(item)} className="gap-3">
                  <FileText className="w-4 h-4 text-amber-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{item.title}</p>
                    {item.description && (
                      <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                    )}
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {byType("blueprint").length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Blueprints">
              {byType("blueprint").map((item) => (
                <CommandItem key={item.id} onSelect={() => navigate(item)} className="gap-3">
                  <Vault className="w-4 h-4 text-violet-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{item.title}</p>
                    {item.description && (
                      <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                    )}
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {loading && (
          <div className="px-4 py-6 text-center text-xs text-muted-foreground animate-pulse">
            Searching...
          </div>
        )}
      </CommandList>

      <div className="border-t border-border px-3 py-2 flex items-center gap-4 text-[10px] text-muted-foreground">
        <span><kbd className="px-1 py-0.5 rounded bg-muted font-mono">↑↓</kbd> navigate</span>
        <span><kbd className="px-1 py-0.5 rounded bg-muted font-mono">↵</kbd> open</span>
        <span><kbd className="px-1 py-0.5 rounded bg-muted font-mono">Esc</kbd> close</span>
      </div>
    </CommandDialog>
  );
}
