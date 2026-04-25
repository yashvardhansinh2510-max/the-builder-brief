"use client"

import { cn } from "@/lib/utils"
import { CardContent } from "@/components/ui/card";
import { TbHeartPlus } from "react-icons/tb";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Zap, Workflow, Shield, Brain } from "lucide-react";

export const Highlight = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <span
      className={cn(
        "font-bold bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary px-1 py-0.5 rounded",
        className
      )}
    >
      {children}
    </span>
  );
};


const FEATURES = [
  {
    id: 0,
    name: "Quantified Discovery",
    designation: "Strategic Intelligence",
    content: (
      <p>
        <Highlight>SpecFlow AI</Highlight> decodes thousands of raw signals — Slack threads, call transcripts, and support tickets — into a <Highlight>singular product truth</Highlight> for high-velocity teams.
      </p>
    ),
  },
  {
    id: 1,
    name: "Verified Architecture",
    designation: "System Integrity",
    content: (
      <p>
        No guesses. No fluff. Every feature requirement is <Highlight>anchored</Highlight> to a direct customer signal with <Highlight>verifiable data points</Highlight> that eliminate internal bias.
      </p>
    ),
  },
  {
    id: 2,
    name: "Execution Leverage",
    designation: "Operational Speed",
    content: (
      <p>
        Push stakeholder-ready briefs to <Highlight>Linear or Jira</Highlight> in one click. SpecFlow automates the grunt work of spec writing so you can <Highlight>focus on building</Highlight> what matters.
      </p>
    ),
  },
];


const integrations = [
  {
    name: "Linear",
    desc: "Sync specs directly with your engineering workflow",
    icon: <Workflow className="w-4 h-4 text-primary" />,
  },
  {
    name: "Jira",
    desc: "Seamless ticket creation for enterprise teams",
    icon: <Shield className="w-4 h-4 text-primary" />,
  },
  {
    name: "Slack",
    desc: "Capture research directly from team threads",
    icon: <Zap className="w-4 h-4 text-primary" />,
  },
  {
    name: "Gong",
    desc: "Analyze customer calls for deep discovery",
    icon: <Brain className="w-4 h-4 text-primary" />,
  }
];


export default function RuixenSection() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="grid grid-cols-1 lg:grid-cols-2 relative gap-px bg-border border border-border rounded-[3rem] overflow-hidden shadow-2xl">
        {/* Left Block */}
        <div className="flex flex-col items-start justify-center bg-card p-8 lg:p-12 border-r border-border">
          {/* Card Stack */}
          <div className="relative w-full mb-12">
            <div className="absolute inset-x-0 -bottom-2 h-24 bg-gradient-to-t from-card to-transparent z-10 pointer-events-none"></div>
            <CardStack items={FEATURES} />
          </div>

          {/* Content */}
          <div className="relative z-20">
            <h3 className="font-serif text-3xl lg:text-4xl tracking-tight leading-tight text-foreground mb-4">
              Intelligence-Driven <span className="italic text-primary">Discovery.</span>
            </h3>
            <p className="text-muted-foreground text-lg font-light leading-relaxed">
               The Max tier includes full access to SpecFlow AI — the discovery engine used by teams at Stripe and Vercel to turn raw signals into elite specs.
            </p>
          </div>
        </div>

        {/* Right Block */}
        <div className="flex flex-col items-center justify-start bg-card p-8 lg:p-12">
          {/* Content */}
          <div className="w-full mb-12">
            <h3 className="font-serif text-3xl lg:text-4xl tracking-tight leading-tight text-foreground mb-4 text-left">
              Bilateral <span className="italic text-primary">Ecosystem.</span>
            </h3>
            <p className="text-muted-foreground text-lg font-light leading-relaxed text-left">
              Integrate effortlessly with your stack. SpecFlow syncs with Gong for calls, Slack for threads, and Linear for execution.
            </p>
          </div>
          
          <div className="group relative w-full inline-flex animate-rainbow cursor-default items-center justify-center rounded-3xl border-0 bg-background px-1 py-1 font-medium transition-all duration-500 shadow-2xl">
            {/* Integration List */}
            <CardContent className="p-6 space-y-4 bg-card border border-border rounded-[1.4rem] z-10 w-full">
              {integrations.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-4 border border-border rounded-2xl hover:bg-muted/50 transition-colors group/item"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-10 h-10 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center flex-shrink-0 group-hover/item:scale-110 transition-transform">
                      {item.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold tracking-tight text-foreground truncate uppercase">{item.name}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1 font-light leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                  <button className="rounded-full border border-border p-2 text-muted-foreground hover:text-primary hover:border-primary transition-all">
                    <TbHeartPlus className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </CardContent>
          </div>
        </div>
      </div>
      
      {/* Stats and Branding Section */}
      <div className="mt-16 grid gap-12 lg:grid-cols-2 items-center bg-muted/30 border border-border rounded-[3rem] p-12 lg:p-20">
        <div className="flex justify-center items-center">
          <div className="grid grid-cols-3 gap-12 w-full text-center lg:text-left">
            <div className="space-y-2">
              <div className="font-serif text-4xl lg:text-5xl text-primary tracking-tighter">2.4k+</div>
              <p className="text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase">Briefs Generated</p>
            </div>
            <div className="space-y-2">
              <div className="font-serif text-4xl lg:text-5xl text-primary tracking-tighter">200+</div>
              <p className="text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase">Product Teams</p>
            </div>
            <div className="space-y-2">
              <div className="font-serif text-4xl lg:text-5xl text-primary tracking-tighter">11.8m</div>
              <p className="text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase">Avg Spec Time</p>
            </div>
          </div>
        </div>
        <div className="relative">
          <div className="border-l-2 border-primary/30 pl-8">
            <h4 className="font-serif text-2xl tracking-tight text-foreground mb-4">The New Standard in <span className="italic text-primary">Discovery.</span></h4>
            <p className="text-muted-foreground text-sm font-light leading-relaxed mb-8">
              SpecFlow isn't just a tool; it's a paradigm shift. Used by the world's most elite product organizations to maintain absolute alignment between customer needs and engineering output.
            </p>
            <div className="flex items-center gap-6 opacity-40 grayscale group hover:grayscale-0 transition-all duration-700">
               <span className="font-bold text-lg">Stripe</span>
               <span className="font-bold text-lg">Notion</span>
               <span className="font-bold text-lg">Vercel</span>
               <span className="font-bold text-lg">Loom</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

let interval: any;

type Card = {
  id: number;
  name: string;
  designation: string;
  content: React.ReactNode;
};

export const CardStack = ({
  items,
  offset,
  scaleFactor,
}: {
  items: Card[];
  offset?: number;
  scaleFactor?: number;
}) => {
  const CARD_OFFSET = offset || 15;
  const SCALE_FACTOR = scaleFactor || 0.08;
  const [cards, setCards] = useState<Card[]>(items);

  useEffect(() => {
    startFlipping();

    return () => clearInterval(interval);
  }, []);
  const startFlipping = () => {
    interval = setInterval(() => {
      setCards((prevCards: Card[]) => {
        const newArray = [...prevCards];
        newArray.unshift(newArray.pop()!);
        return newArray;
      });
    }, 5000);
  };

  return (
    <div className="relative mx-auto h-56 w-full md:w-96 my-4">
      {cards.map((card, index) => {
        return (
          <motion.div
            key={card.id}
            className="absolute bg-card h-56 w-full md:w-96 rounded-3xl p-8 shadow-2xl border border-border flex flex-col justify-between"
            style={{
              transformOrigin: "top center",
            }}
            animate={{
              top: index * -CARD_OFFSET,
              scale: 1 - index * SCALE_FACTOR,
              zIndex: cards.length - index,
            }}
          >
            <div className="text-foreground font-light leading-relaxed">
              {card.content}
            </div>
            <div>
              <p className="text-primary font-serif text-lg tracking-tight">
                {card.name}
              </p>
              <p className="text-muted-foreground text-[10px] font-bold tracking-[0.2em] uppercase">
                {card.designation}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
