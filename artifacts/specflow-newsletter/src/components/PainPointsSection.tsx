import { motion } from "framer-motion";
import { AlertCircle, Search, Clock, Zap } from "lucide-react";

const pains = [
  {
    icon: Search,
    title: "The 'Idea' Ghosting",
    desc: "You have the skills, but the right idea never shows up. You spend weeks 'brainstorming' and end up with zero progress.",
    accent: "text-primary"
  },
  {
    icon: Clock,
    title: "Analysis Paralysis",
    desc: "You over-analyze markets until someone else builds it first. You're stuck in a loop of research without execution.",
    accent: "text-primary"
  },
  {
    icon: Zap,
    title: "The 'Side-Project' Cemetery",
    desc: "A graveyard of domains and half-finished repos. You build features that no one wants because you skipped validation.",
    accent: "text-primary"
  }
];

export function PainPointsSection() {
  return (
    <section className="py-24 px-6 max-w-6xl mx-auto relative">
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[120px] pointer-events-none rounded-full" />
      
      <div className="text-center mb-16">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest mb-6"
        >
          <AlertCircle className="w-3.5 h-3.5" /> Stop Building Toys
        </motion.div>
        <h2 className="font-serif text-4xl md:text-6xl mb-6 tracking-tight">
          Why 99% of builders <br />
          <span className="italic text-muted-foreground font-serif">never ship profit.</span>
        </h2>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-sans">
          The problem isn't your code. It's the conviction. You're building solutions for problems that don't exist.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {pains.map((pain, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            className="group p-8 rounded-2xl bg-card border border-card-border hover:border-primary/20 transition-all duration-300"
          >
            <div className={`w-12 h-12 rounded-xl bg-background border border-border flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-300`}>
              <pain.icon className={`w-6 h-6 ${pain.accent}`} />
            </div>
            <h3 className="font-serif text-2xl mb-4 tracking-tight">{pain.title}</h3>
            <p className="text-muted-foreground leading-relaxed font-sans">
              {pain.desc}
            </p>
          </motion.div>
        ))}
      </div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mt-20 p-12 rounded-[2.5rem] bg-card border border-primary/20 text-center relative overflow-hidden"
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-primary/5 blur-[100px] pointer-events-none rounded-full" />
        
        <h3 className="font-serif text-3xl md:text-4xl mb-6 relative z-10 leading-snug">
          We don't give you ideas. <br />
          We give you <span className="text-primary italic font-serif">conviction.</span>
        </h3>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto relative z-10 mb-10 font-sans">
          The Build Brief isn't just a newsletter. It's a system designed to force you to execute on proven opportunities.
        </p>
        
        <div className="flex flex-wrap justify-center gap-12 relative z-10">
          <div className="flex flex-col items-center">
            <span className="text-4xl font-serif text-foreground">0</span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-sans font-bold">Fluff</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-4xl font-serif text-foreground">100%</span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-sans font-bold">Execution</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-4xl font-serif text-foreground">48h</span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-sans font-bold">To V1</span>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
