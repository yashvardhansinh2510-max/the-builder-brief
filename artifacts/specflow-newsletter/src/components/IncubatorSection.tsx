import { motion } from "framer-motion";
import { Shield, Rocket, Target, Users, ArrowRight, Zap, Briefcase, ChevronRight, Binary, Fingerprint } from "lucide-react";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { MagneticButton } from "@/components/ui/magnetic-button";

const engineModules = [
  {
    icon: Binary,
    title: "Build — Week 1 to Live",
    desc: "We sit alongside you through architecture, stack decisions, and your first deploy. You ship a working product in 7 days or we diagnose why not.",
    stat: "7-Day Ship"
  },
  {
    icon: Fingerprint,
    title: "Revenue — First $10k",
    desc: "We open our network, join your first sales calls, and help you close your founding customers. We don't count it as done until you have paying users.",
    stat: "Revenue-First"
  },
  {
    icon: Target,
    title: "Exit — The Right Conversation",
    desc: "We introduce you to acquirers when the time is right, on your terms. Every decision from Day 1 is made with the exit multiple in mind.",
    stat: "Exit-Positioned"
  },
];

export function IncubatorSection() {
  return (
    <section className="py-32 px-6 relative bg-background overflow-hidden">
      {/* Background Architectural Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none opacity-20">
        <div className="absolute top-0 left-0 w-px h-full bg-gradient-to-b from-transparent via-border to-transparent" />
        <div className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-transparent via-border to-transparent" />
        <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-[0.2em] mb-6 font-sans"
          >
            <Shield className="w-3.5 h-3.5" /> Selection Status: OPEN
          </motion.div>
          <h2 className="font-serif text-5xl md:text-7xl mb-6 tracking-tight leading-[0.9]">
            Built for founders<br />
            <span className="italic text-primary">serious about exits.</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto leading-relaxed font-sans">
            We don't run workshops. We take 3–5 ventures per cohort, work alongside you for 6 months, and we're not done until you have revenue and a clear path to your first acquisition conversation.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Main Module */}
          <SpotlightCard
            className="lg:col-span-12 p-10 md:p-16 rounded-[2.5rem] bg-card border border-card-border relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <h3 className="font-serif text-4xl md:text-5xl mb-6 tracking-tight leading-none">
                  We co-build<br />your <span className="italic font-serif text-primary">first exit.</span>
                </h3>
                <p className="text-muted-foreground mb-10 leading-relaxed font-sans text-lg">
                  The Incubator isn't a program — it's a co-founder arrangement. We take 3–5 ventures per cohort. Our team builds with you: architecture, GTM strategy, first revenue, and the exit positioning that gets acquirers to call you.
                </p>
                <div className="flex flex-wrap gap-4 mb-10">
                  <Badge variant="Stat" label="$10M+ Equity Managed" />
                  <Badge variant="Stat" label="YC Style Vetting" />
                  <Badge variant="Stat" label="48h V1 Delivery" />
                </div>
                <MagneticButton 
                  onClick={() => window.dispatchEvent(new CustomEvent('open-lead-modal'))}
                  className="h-16 px-10 rounded-full bg-foreground text-background font-bold text-base hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3 group font-sans"
                >
                  Apply for Incubation <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </MagneticButton>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                 {engineModules.map((m, i) => (
                   <SpotlightCard
                    key={i}
                    className="p-6 rounded-2xl bg-background border border-border group/card hover:border-primary/20 transition-all flex items-center justify-between"
                   >
                     <div className="flex gap-4 items-center">
                       <div className="w-10 h-10 rounded-lg bg-card border border-border flex items-center justify-center shrink-0">
                         <m.icon className="w-5 h-5 text-primary opacity-40 group-hover/card:opacity-100 transition-opacity" />
                       </div>
                       <div>
                         <h4 className="font-serif text-xl tracking-tight leading-none mb-1">{m.title}</h4>
                         <p className="text-xs text-muted-foreground font-sans">{m.desc}</p>
                       </div>
                     </div>
                     <span className="text-[9px] font-bold uppercase tracking-widest text-primary opacity-60 hidden md:block">{m.stat}</span>
                   </SpotlightCard>
                 ))}
              </div>
            </div>
          </SpotlightCard>
        </div>

        {/* Exclusive Footer */}
        <div className="mt-16 flex flex-col md:flex-row items-center justify-between border-t border-border/40 pt-10 px-6 gap-6 opactiy-60">
           <div className="flex items-center gap-6">
             <div className="flex -space-x-3">
               {[1,2,3,4].map(i => (
                 <img key={i} src={`https://i.pravatar.cc/100?u=${i}`} className="w-10 h-10 rounded-full border-2 border-background grayscale" />
               ))}
               <div className="w-10 h-10 rounded-full border-2 border-background bg-card flex items-center justify-center text-[10px] font-bold">+12</div>
             </div>
             <p className="text-xs text-muted-foreground font-sans tracking-tight">Active founders currently in the Foundry.</p>
           </div>
           <div className="flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
             <span className="text-[10px] font-bold uppercase tracking-[0.2em] font-sans">Next Intake: August 2026</span>
           </div>
        </div>
      </div>
    </section>
  );
}

function Badge({ variant, label }: { variant: string, label: string }) {
  return (
    <div className="px-4 py-2 rounded-xl bg-background border border-border flex items-center gap-2">
       <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
       <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground font-sans">{label}</span>
    </div>
  );
}
