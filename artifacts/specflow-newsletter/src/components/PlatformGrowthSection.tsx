import {
  AreaChart,
  Area,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import CountUp from "react-countup";

const growthData = [
  { name: "Sep", value: 120 },
  { name: "Oct", value: 280 },
  { name: "Nov", value: 590 },
  { name: "Dec", value: 940 },
  { name: "Jan", value: 1800 },
  { name: "Feb", value: 3400 },
  { name: "Mar", value: 6200 },
  { name: "Apr", value: 10800 },
];

const platformStats = [
  { value: 40, suffix: "+", label: "Countries Reached", desc: "Global builder network" },
  { value: 0, prefix: "$", suffix: "", label: "Cost to Access", desc: "Core Brief is free, always" },
  { value: 6, suffix: " min", label: "Avg. Read Time", desc: "Dense, zero-fluff drops" },
  { value: 1, suffix: "x / week", label: "Drop Frequency", desc: "Every Friday, without fail" },
];

export function PlatformGrowthSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="w-full max-w-7xl mx-auto px-6 py-24">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        {/* Headline */}
        <div className="max-w-4xl mb-16">
          <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary mb-4">
            Platform Growth
          </p>
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-foreground leading-tight mb-6">
            We don't give you ideas.{" "}
            <span className="text-muted-foreground font-normal italic">
              We give you conviction.
            </span>
          </h2>
          <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl">
            The Builder Brief isn't just a newsletter — it's a system designed to force you to execute on an opportunity. Every drop ships a complete, actionable business in a box.
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {platformStats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 + i * 0.1 }}
              className="group"
            >
              <p className="font-serif text-4xl md:text-5xl text-foreground mb-1 flex items-baseline gap-0.5">
                {stat.prefix && <span>{stat.prefix}</span>}
                {inView ? (
                  <CountUp end={stat.value} duration={2} delay={0.3 + i * 0.1} />
                ) : (
                  <span>0</span>
                )}
                <span className="text-primary">{stat.suffix}</span>
              </p>
              <p className="text-sm font-semibold text-foreground mb-1">{stat.label}</p>
              <p className="text-xs text-muted-foreground">{stat.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Area Chart */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0.95 }}
          animate={inView ? { opacity: 1, scaleX: 1 } : {}}
          transition={{ duration: 1.2, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="w-full h-52 relative rounded-2xl overflow-hidden border border-border/30 bg-card/20 backdrop-blur-sm"
        >
          {/* Chart label */}
          <div className="absolute top-4 left-5 z-10 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
              Subscriber Growth · Sep 2024 – Apr 2025
            </span>
          </div>

          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={growthData} margin={{ top: 50, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="primaryGrowth" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "12px",
                  fontSize: "12px",
                  color: "hsl(var(--foreground))",
                }}
                cursor={{ stroke: "hsl(var(--primary))", strokeWidth: 1, strokeDasharray: "4 4" }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="hsl(var(--primary))"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#primaryGrowth)"
                animationDuration={2000}
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

      </motion.div>
    </section>
  );
}
