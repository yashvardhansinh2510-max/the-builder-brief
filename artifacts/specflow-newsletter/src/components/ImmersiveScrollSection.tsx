import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, useVelocity, useSpring, useInView } from "framer-motion";
import { ArrowUpRight, Database, Zap } from "lucide-react";
import { Link } from "wouter";

const TypewriterText = ({ text, delay = 0, start }: { text: string; delay?: number; start: boolean }) => {
  const characters = text.split("");
  return (
    <span className="inline-block">
      {characters.map((char, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0 }}
          animate={start ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.05, delay: start ? delay + i * 0.015 : 0 }}
        >
          {char}
        </motion.span>
      ))}
    </span>
  );
};

export function ImmersiveScrollSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Cinematic Velocity Skew
  const { scrollY, scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });
  
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, { damping: 50, stiffness: 400 });
  const skewY = useTransform(smoothVelocity, [-1000, 0, 1000], [-3, 0, 3]);

  // Unique transforms for Section 1 (The Blueprint)
  const s1Scale = useTransform(scrollYProgress, [0, 0.25], [1, 0.8]);
  const s1Opacity = useTransform(scrollYProgress, [0.15, 0.25], [1, 0]);
  const s1Y = useTransform(scrollYProgress, [0, 0.25], [0, -100]);

  // Transforms for Section 2 (Pro Tooling)
  const s2X = useTransform(scrollYProgress, [0.2, 0.35], ["100%", "0%"]);
  const s2Opacity = useTransform(scrollYProgress, [0.2, 0.3, 0.55, 0.65], [0, 1, 1, 0]);
  const s2Scale = useTransform(scrollYProgress, [0.55, 0.65], [1, 0.9]);

  // Pro Tooling Animation Variables
  const mrrHeight = useTransform(scrollYProgress, [0.35, 0.5], ["0%", "100%"]);
  const visitorsHeight = useTransform(scrollYProgress, [0.35, 0.45], ["0%", "65%"]);
  const churnHeight = useTransform(scrollYProgress, [0.35, 0.55], ["0%", "20%"]);

  // Typewriter trigger
  const chatRef = useRef<HTMLDivElement>(null);
  const isChatInView = useInView(chatRef, { margin: "-20%" });

  // Transforms for Section 3 (Max Intelligence)
  const s3Y = useTransform(scrollYProgress, [0.6, 0.75], ["100%", "0%"]);
  const s3Opacity = useTransform(scrollYProgress, [0.6, 0.7, 0.9, 1], [0, 1, 1, 0]);

  return (
    <section ref={containerRef} className="relative h-[400vh] bg-background">
      <div className="sticky top-0 h-[100dvh] w-full overflow-hidden flex items-center justify-center">
        
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px]" />
        </div>

        {/* Cinematic Skew Wrapper */}
        <motion.div style={{ skewY, width: "100%", height: "100%" }} className="absolute inset-0">

          {/* Section 1: The Blueprint */}
          <motion.div 
            style={{ scale: s1Scale, opacity: s1Opacity, y: s1Y, z: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center text-center px-6"
          >
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-8 border border-primary/20 shadow-xl shadow-primary/5">
              <Zap className="w-8 h-8 text-primary" />
            </div>
            <h2 className="font-serif text-5xl md:text-7xl lg:text-8xl mb-6 tracking-tight">
              The Blueprint.
            </h2>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-12">
              Every Friday, we deconstruct a real market gap. You get the thesis, the code structure, the first revenue path, and the AI prompts. <span className="text-foreground">Zero fluff.</span>
            </p>
            <div className="w-full max-w-4xl relative">
               <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10" />
               <div className="bg-card border border-border/40 rounded-t-3xl p-8 shadow-2xl mx-auto relative overflow-hidden h-[300px] md:h-[400px]">
                 <div className="flex items-center gap-4 border-b border-border/40 pb-4 mb-6">
                   <div className="w-3 h-3 rounded-full bg-red-500/80" />
                   <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                   <div className="w-3 h-3 rounded-full bg-green-500/80" />
                   <span className="text-xs font-mono text-muted-foreground ml-2">issue_009_blueprint.md</span>
                 </div>
                 <div className="space-y-6">
                   <div className="h-6 bg-primary/20 w-1/3 rounded" />
                   <div className="space-y-3">
                     <div className="h-3 bg-muted w-full rounded" />
                     <div className="h-3 bg-muted w-5/6 rounded" />
                     <div className="h-3 bg-muted w-4/5 rounded" />
                   </div>
                   <div className="space-y-3 pt-4">
                     <div className="h-3 bg-muted w-full rounded" />
                     <div className="h-3 bg-muted w-3/4 rounded" />
                   </div>
                 </div>
               </div>
            </div>
          </motion.div>

          {/* Section 2: Venture Tooling (Pro) */}
          <motion.div 
            style={{ x: s2X, opacity: s2Opacity, scale: s2Scale, z: 0 }}
            className="absolute inset-0 flex items-center px-6 md:px-16"
          >
            <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-foreground bg-foreground/10 px-3 py-1.5 rounded-full mb-6">
                   Pro Tier
                </span>
                <h2 className="font-serif text-5xl md:text-6xl lg:text-7xl mb-6 tracking-tight leading-[0.95]">
                  Execution<br />
                  <span className="italic text-foreground/70">Systems.</span>
                </h2>
                <p className="text-xl text-muted-foreground leading-relaxed mb-8">
                  Stop guessing your metrics. Access the full suite of venture tooling, from live TAM calculators to automated pricing models. Real tools for founders who actually ship.
                </p>
                <Link href="/sign-up" className="inline-flex items-center gap-2 text-sm font-semibold text-foreground hover:text-foreground/70 transition-colors group">
                  Explore Pro Features <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
              </div>
              
              <div className="relative w-full max-w-lg mx-auto lg:mx-0 lg:ml-auto">
                 <div className="absolute -inset-10 bg-foreground/5 blur-[100px] rounded-full pointer-events-none" />
                 <div className="bg-card border border-border/40 rounded-[2.5rem] p-8 shadow-2xl relative z-10">
                    <div className="flex items-center gap-4 mb-8 pb-6 border-b border-border/40">
                      <div className="w-12 h-12 rounded-2xl bg-foreground/10 flex items-center justify-center">
                        <Database className="w-6 h-6 text-foreground" />
                      </div>
                      <div>
                        <p className="font-serif text-xl font-bold text-foreground">Venture Analytics</p>
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Live Calculator</p>
                      </div>
                    </div>
                    
                    <div className="space-y-8">
                      {/* MRR Bar */}
                      <div>
                        <div className="flex justify-between text-sm mb-2 font-medium">
                          <span>Target MRR</span>
                          <span className="text-primary">$10,000</span>
                        </div>
                        <div className="h-3 w-full bg-muted rounded-full overflow-hidden flex items-end">
                          <motion.div style={{ width: mrrHeight }} className="h-full bg-primary rounded-full" />
                        </div>
                      </div>
                      
                      {/* Visitors Bar */}
                      <div>
                        <div className="flex justify-between text-sm mb-2 font-medium">
                          <span>Required Traffic (2% Conv)</span>
                          <span className="text-foreground/70">50,000 /mo</span>
                        </div>
                        <div className="h-3 w-full bg-muted rounded-full overflow-hidden flex items-end">
                          <motion.div style={{ width: visitorsHeight }} className="h-full bg-foreground/50 rounded-full" />
                        </div>
                      </div>

                      {/* Churn Bar */}
                      <div>
                        <div className="flex justify-between text-sm mb-2 font-medium">
                          <span>Max Acceptable Churn</span>
                          <span className="text-destructive">5%</span>
                        </div>
                        <div className="h-3 w-full bg-muted rounded-full overflow-hidden flex items-end">
                          <motion.div style={{ width: churnHeight }} className="h-full bg-destructive/50 rounded-full" />
                        </div>
                      </div>
                    </div>
                 </div>
              </div>
            </div>
          </motion.div>

          {/* Section 3: Intelligence (Max) */}
          <motion.div 
            style={{ y: s3Y, opacity: s3Opacity, z: 0 }}
            className="absolute inset-0 flex items-center px-6 md:px-16"
          >
            <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              
              <div className="relative w-full max-w-lg mx-auto lg:mx-0 lg:mr-auto order-2 lg:order-1" ref={chatRef}>
                 <div className="absolute -inset-10 bg-primary/10 blur-[100px] rounded-full pointer-events-none" />
                 <div className="bg-card border border-border/40 rounded-[2.5rem] p-8 shadow-2xl relative z-10" style={{ transform: "rotate(-2deg)" }}>
                    <div className="flex items-center gap-4 mb-8 pb-6 border-b border-border/40">
                      <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                        <Database className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-serif text-xl font-bold text-foreground">Intelligence Engine</p>
                        <p className="text-[10px] uppercase tracking-widest text-primary font-bold">Active Advisor</p>
                      </div>
                    </div>
                    <div className="space-y-6">
                      <div className="bg-background border border-border/40 p-5 rounded-3xl rounded-tr-sm ml-12 text-sm text-muted-foreground shadow-sm leading-relaxed">
                        How do I price the initial MVP for enterprise clients without looking cheap?
                      </div>
                      <div className="bg-primary/10 border border-primary/20 p-5 rounded-3xl rounded-tl-sm mr-12 text-sm text-foreground relative shadow-sm leading-relaxed min-h-[140px]">
                        <span className="absolute -left-2.5 top-4 w-3 h-3 bg-primary rounded-full animate-pulse shadow-lg shadow-primary/50" />
                        <TypewriterText 
                          start={isChatInView} 
                          delay={0.2} 
                          text="Start at $500/mo. Do not offer a free tier. Enterprise equates free with risk. Use the exact script from Playbook Module 4 to close your first 3 beta customers." 
                        />
                      </div>
                    </div>
                 </div>
              </div>

              <div className="order-1 lg:order-2">
                <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-primary bg-primary/10 px-3 py-1.5 rounded-full mb-6">
                   Max Tier
                </span>
                <h2 className="font-serif text-5xl md:text-6xl lg:text-7xl mb-6 tracking-tight leading-[0.95]">
                  Intelligence<br />
                  <span className="italic text-primary">On Demand.</span>
                </h2>
                <p className="text-xl text-muted-foreground leading-relaxed mb-8">
                  Stuck on pricing? Need a sales script? Chat directly with the Intelligence Engine — trained on thousands of successful venture playbooks. Plus 1-on-1 coaching with the team.
                </p>
                <Link href="/sign-up" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors group">
                  Join the Waitlist <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
              </div>

            </div>
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
}
