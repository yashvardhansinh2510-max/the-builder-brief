import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowUpRight, Database, Zap, Lock, Terminal, BarChart, Settings, LayoutDashboard } from "lucide-react";
import { Link } from "wouter";
import { AreaChart, Area, ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";
import CountUp from "react-countup";
import { Button } from "@/components/ui/button";
import { IntelligenceEngineChat } from "@/components/IntelligenceEngineChat";
import { BlueprintMockup } from "@/components/BlueprintMockup";

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

export function TiersShowcaseSection() {
  const mrrData = [
    { month: "Jan", value: 500 },
    { month: "Feb", value: 1200 },
    { month: "Mar", value: 2400 },
    { month: "Apr", value: 4200 },
    { month: "May", value: 6800 },
    { month: "Jun", value: 10400 },
  ];

  const chatRef = useRef<HTMLDivElement>(null);
  const isChatInView = useInView(chatRef, { margin: "-20%", once: true });

  const fadeUpVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] as const } }
  };

  return (
    <section className="relative w-full overflow-hidden bg-background py-24 md:py-32 flex flex-col gap-32 md:gap-48">
      
      {/* Background Orbs */}
      <div className="absolute top-[10%] left-[10%] w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
      <div className="absolute top-[50%] right-[10%] w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />

      {/* TIER 1: The Blueprint (Free) */}
      <motion.div 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-10%" }}
        variants={fadeUpVariants}
        className="w-full max-w-6xl mx-auto px-6"
      >
        <div className="text-center mb-16">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-8 border border-primary/20 shadow-xl shadow-primary/5">
            <Zap className="w-8 h-8 text-primary" />
          </div>
          <h2 className="font-serif text-5xl md:text-7xl lg:text-8xl mb-6 tracking-tight">
            The Blueprint.
          </h2>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Every Friday, we deconstruct a real market gap. You get the thesis, the code structure, the first revenue path, and the AI prompts. <span className="text-foreground">Zero fluff.</span>
          </p>
        </div>

        <BlueprintMockup />
      </motion.div>

      {/* TIER 2: Execution Systems (Pro) using Ruixen Stats approach */}
      <motion.div 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-10%" }}
        variants={fadeUpVariants}
        className="w-full max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
      >
        <div>
          <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-foreground bg-foreground/10 px-3 py-1.5 rounded-full mb-6">
            Pro Tier
          </span>
          <h2 className="font-serif text-5xl md:text-6xl lg:text-7xl mb-6 tracking-tight leading-[0.95]">
            Execution<br />
            <span className="italic text-foreground/70">Systems.</span>
          </h2>
          <p className="text-xl text-muted-foreground leading-relaxed mb-8">
            Experience an analytics UI that blends speed, clarity, and design precision. Track your Target MRR, churn, and traffic with real tools for founders who actually ship.
          </p>
          <Link href="/sign-up">
            <Button size="lg" className="rounded-full px-8 gap-2 font-semibold">
              Explore Pro Features <ArrowUpRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        {/* Ruixen-inspired Stats Chart */}
        <div className="relative w-full h-[450px] bg-card border border-border/40 rounded-[2rem] overflow-hidden shadow-2xl group">
          <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent pointer-events-none z-10" />
          
          <div className="absolute top-6 left-6 z-20 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <BarChart className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Target MRR</p>
              <p className="font-serif text-lg text-foreground leading-none mt-1">Venture Analytics</p>
            </div>
          </div>

          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={mrrData} margin={{ top: 80, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="primaryGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="value"
                stroke="hsl(var(--primary))"
                strokeWidth={3}
                fill="url(#primaryGradient)"
                animationDuration={2000}
              />
            </AreaChart>
          </ResponsiveContainer>

          {/* Overlay Hero Number */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none z-20 mt-12">
            <h3 className="text-6xl lg:text-7xl font-serif text-foreground drop-shadow-2xl flex items-baseline gap-1">
              $<CountUp end={10.4} duration={2.5} decimals={1} />k
            </h3>
            <p className="text-sm font-medium uppercase tracking-widest text-primary mt-2">Revenue this year</p>
          </div>

          {/* Side Stats */}
          <div className="absolute right-6 top-6 bg-background/80 backdrop-blur-xl border border-border/40 rounded-2xl shadow-2xl p-5 flex flex-col gap-4 z-20 w-[140px]">
            {[
              { value: "50k+", label: "Traffic /mo" },
              { value: "2%", label: "Conversion" },
              { value: "<5%", label: "Churn Rate" },
            ].map((stat, idx) => (
              <div key={idx} className="border-b border-border/40 pb-3 last:border-0 last:pb-0">
                <p className="text-xl font-serif text-foreground">{stat.value}</p>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* TIER 3: Intelligence On Demand (Max) */}
      <motion.div 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-10%" }}
        variants={fadeUpVariants}
        className="w-full max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
      >
        <div className="order-2 lg:order-1 relative w-full h-[450px]">
          <div className="absolute -inset-10 bg-primary/10 blur-[100px] rounded-full pointer-events-none" />
          <IntelligenceEngineChat />
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
          <Link href="/sign-up">
            <Button size="lg" variant="default" className="rounded-full px-8 gap-2 font-semibold">
              Join the Waitlist <ArrowUpRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </motion.div>

    </section>
  );
}
