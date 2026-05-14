import {
  Boxes,
  ExternalLink,
  Sparkles,
  Terminal,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { arsenalTools, type Tool } from "@/lib/arsenal";

interface ArsenalTabProps {
  products: any[];
  ownedProducts: any[];
  isPro: boolean;
  onDeploy: (tool: Tool) => void;
  onUpgradeClick: () => void;
}

export default function ArsenalTab({
  products,
  ownedProducts,
  isPro,
  onDeploy,
  onUpgradeClick,
}: ArsenalTabProps) {
  return (
    <div className="space-y-12">
      {/* Premium Marketplace Section */}
      <div>
        <div className="flex items-center gap-3 mb-8">
          <Sparkles className="w-6 h-6 text-primary" />
          <h2 className="font-serif text-4xl">Premium Blueprints</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => {
            const isOwned = ownedProducts.some(
              (p) => p.productId === product.id,
            );
            return (
              <div
                key={product.id}
                className="p-8 rounded-[2.5rem] bg-card border border-border/40 relative overflow-hidden group hover:border-primary/40 transition-all"
              >
                <div className="absolute top-0 right-0 p-8 text-primary/10 group-hover:scale-110 transition-transform">
                  <Boxes className="w-16 h-16" />
                </div>
                <div className="relative z-10">
                  <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
                    {product.category.toUpperCase()}
                  </Badge>
                  <h3 className="font-serif text-2xl mb-2">{product.name}</h3>
                  <p className="text-xs text-muted-foreground mb-8 line-clamp-2">
                    {product.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xl font-bold">
                      ${product.price}
                    </span>
                    {isOwned ? (
                      <button className="px-6 py-3 rounded-xl bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                        OWNED
                      </button>
                    ) : (
                      <button className="px-6 py-3 rounded-xl bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-primary/20">
                        ACQUIRE_ASSET
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="h-px bg-border/40" />

      <div className="relative">
        <div className="flex items-center gap-3 mb-8">
          <Terminal className="w-6 h-6 text-primary" />
          <h2 className="font-serif text-4xl">Operator Tooling</h2>
        </div>
        <div
          className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${!isPro ? "pointer-events-none select-none opacity-40" : ""}`}
        >
          {arsenalTools.map((tool) => (
            <div
              key={tool.id}
              className="p-8 rounded-[2.5rem] bg-background border border-border/60 group relative overflow-hidden shadow-lg shadow-black/[0.02]"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <p className="font-mono text-4xl font-black">{tool.logo}</p>
              </div>
              <div className="relative z-10 h-full flex flex-col">
                <div className="mb-8">
                  <Badge
                    variant="outline"
                    className="border-primary/20 text-primary text-[8px] tracking-[0.2em] mb-4"
                  >
                    {tool.category.toUpperCase()} TOOL
                  </Badge>
                  <h3 className="font-serif text-3xl mb-2">{tool.name}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed font-sans">
                    {tool.description}
                  </p>
                </div>
                <div className="mt-auto">
                  <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 mb-6">
                    <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-primary mb-1">
                      Founder Advantage
                    </p>
                    <p className="text-[11px] font-medium italic">
                      {tool.perk}
                    </p>
                  </div>
                  <button
                    onClick={() => onDeploy(tool)}
                    className="w-full py-4 border border-border/60 hover:border-primary/40 rounded-2xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all"
                  >
                    Deploy Stack <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* Coming Soon overlay for Free tier */}
        {!isPro && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-card/90 backdrop-blur-md border border-primary/20 rounded-[3rem] p-12 text-center shadow-2xl shadow-primary/10 max-w-sm mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Boxes className="w-8 h-8 text-primary" />
              </div>
              <Badge className="bg-primary text-white border-none text-[8px] tracking-[0.3em] mb-4">
                PRO & MAX EXCLUSIVE
              </Badge>
              <h3 className="font-serif text-3xl mb-3">Leverage Arsenal</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Full tool integrations and one-click deployment rails are
                locked. Upgrade to access.
              </p>
              <button
                onClick={onUpgradeClick}
                className="mt-6 w-full py-4 bg-primary text-white rounded-full text-[10px] font-bold uppercase tracking-widest hover:scale-105 transition-transform"
              >
                Unlock Arsenal
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
