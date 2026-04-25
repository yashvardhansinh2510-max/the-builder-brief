import { motion } from "framer-motion";
import { CpuArchitecture } from "@/components/ui/cpu-architecture";
import { Zap, Server, BrainCircuit } from "lucide-react";

export function EngineShowcaseSection() {
  return (
    <section className="py-24 px-6 max-w-6xl mx-auto overflow-hidden relative">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-20">
        
        {/* Left Side: Copy */}
        <div className="flex-1 space-y-6 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-bold uppercase tracking-widest text-primary">
            <Zap className="w-3.5 h-3.5" />
            Intelligence Engine
          </div>
          
          <h2 className="font-serif text-4xl md:text-5xl leading-[1.1]">
            Powered by top-tier <span className="italic text-primary/90">cloud models.</span>
          </h2>
          
          <p className="text-muted-foreground text-lg leading-relaxed max-w-md">
            Your venture blueprints aren't generated in a vacuum. The engine connects directly to the world's most capable AI — <strong className="text-foreground font-medium">Anthropic's Claude</strong> and <strong className="text-foreground font-medium">Google's Gemini</strong> — to process live market data, synthesize research, and output actionable execution steps.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="p-4 rounded-2xl bg-card border border-border/40">
              <BrainCircuit className="w-5 h-5 text-primary mb-3" />
              <p className="font-serif text-lg mb-1">Deep Context</p>
              <p className="text-xs text-muted-foreground">Claude handles nuanced strategy and blueprinting.</p>
            </div>
            <div className="p-4 rounded-2xl bg-card border border-border/40">
              <Server className="w-5 h-5 text-primary mb-3" />
              <p className="font-serif text-lg mb-1">Live Research</p>
              <p className="text-xs text-muted-foreground">Gemini scans active market gaps and competitors.</p>
            </div>
          </div>
        </div>

        {/* Right Side: CPU Animation */}
        <div className="flex-1 w-full max-w-md mx-auto aspect-square relative z-10 flex items-center justify-center p-8 rounded-[2rem] bg-card/40 border border-border/50 backdrop-blur-sm shadow-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(var(--primary),0.15)_0%,transparent_70%)] pointer-events-none" />
          <CpuArchitecture 
            text="ENGINE"
            animateLines={true}
            animateMarkers={true}
            animateText={true}
          />
        </div>

      </div>
    </section>
  );
}
