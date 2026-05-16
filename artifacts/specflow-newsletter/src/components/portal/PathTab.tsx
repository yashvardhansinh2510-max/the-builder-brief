import { FOUNDRY_PATH_TIERS } from "@/lib/portal-config";

export default function PathTab() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {FOUNDRY_PATH_TIERS.map((tier) => (
        <div
          key={tier.title}
          className="bg-card/40 border border-border/20 p-8 rounded-[2.5rem] relative group hover:border-primary/30 transition-all backdrop-blur-sm"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <tier.icon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif text-2xl mb-0.5">{tier.title}</h3>
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary">
                {tier.sub}
              </p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed mb-6">
            {tier.detail}
          </p>
          <div className="p-3 bg-primary/5 rounded-xl border border-primary/10 text-center font-bold text-[10px] uppercase tracking-tighter text-primary">
            POWERED BY: {tier.val}
          </div>
        </div>
      ))}
    </div>
  );
}
