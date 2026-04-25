import { motion } from "framer-motion";
// eslint-disable-next-line @typescript-eslint/no-unused-vars

import { Star as StarIcon, Quote as QuoteIcon, TrendingUp as TrendingIcon, DollarSign as DollarIcon } from "lucide-react";

const testimonials = [
  {
    name: "Alex Rivera",
    role: "Sold SaaS for $1.2M",
    text: "I was stuck building tools for years. The Build Brief gave me the 'AI Legal Auditor' blueprint. I built the MVP in 3 days, got my first 5 clients on Monday, and sold the company 10 months later.",
    image: "https://i.pravatar.cc/150?u=alex",
    revenue: "$1.2M Exit"
  },
  {
    name: "Sarah Chen",
    role: "Founder, ClearStack",
    text: "The 'Infrastructure Optimizer' blueprint was exactly what the market needed. Within 4 weeks, we hit $20k MRR. The Build Brief doesn't just give you ideas; it gives you the exact prompts to build them.",
    image: "https://i.pravatar.cc/150?u=sarah",
    revenue: "$25k MRR"
  },
  {
    name: "Marcus Thorne",
    role: "Solo-Founder",
    text: "The Startup Incubator plan is the best investment I ever made. The 1-on-1 calls with the team helped me scale my sales from $0 to $500k in less than 6 months. They literally did the selling with me.",
    image: "https://i.pravatar.cc/150?u=marcus",
    revenue: "$500k Rev"
  }
];

export function TestimonialSection() {
  return (
    <section className="py-24 px-6 max-w-6xl mx-auto overflow-hidden">
      <div className="text-center mb-16">
        <motion.p 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="text-primary font-bold uppercase tracking-[0.2em] text-[10px] mb-3 font-sans"
        >
          Success Stories
        </motion.p>
        <h2 className="font-serif text-4xl md:text-5xl mb-6 tracking-tight">
          Real builders. <span className="italic font-serif">Exorbitant results.</span>
        </h2>
        <p className="text-muted-foreground max-w-xl mx-auto text-lg font-sans">
          Our subscribers aren't just reading. They're shipping, scaling, and exiting.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {testimonials.map((t, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="p-8 rounded-2xl bg-card border border-card-border relative group hover:border-primary/20 transition-all duration-300"
          >
            <QuoteIcon className="absolute top-6 right-8 w-10 h-10 text-primary/5 group-hover:text-primary/10 transition-colors" />
            
            <div className="flex items-center gap-4 mb-6">
              <img src={t.image} alt={t.name} className="w-14 h-14 rounded-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500 border border-border" />
              <div>
                <h4 className="font-serif text-xl tracking-tight leading-none mb-1">{t.name}</h4>
                <p className="text-xs text-muted-foreground font-sans uppercase tracking-widest">{t.role}</p>
              </div>
            </div>

            <div className="flex gap-1 mb-6">
              {[...Array(5)].map((_, i) => (
                <StarIcon key={i} className="w-3.5 h-3.5 fill-primary text-primary" />
              ))}
            </div>

            <p className="text-foreground/80 italic leading-relaxed mb-10 font-serif text-lg">
              "{t.text}"
            </p>

            <div className="pt-6 border-t border-border/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingIcon className="w-4 h-4 text-primary" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary font-sans">{t.revenue}</span>
              </div>
              <div className="bg-primary/5 px-2.5 py-1 rounded-full flex items-center gap-1">
                <DollarIcon className="w-3 h-3 text-primary opacity-60" />
                <span className="text-[9px] font-bold text-primary tracking-widest">VERIFIED</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mt-16 text-center"
      >
        <div className="inline-block p-px rounded-full bg-gradient-to-r from-transparent via-primary/20 to-transparent">
           <div className="px-8 py-3 rounded-full bg-card/50 backdrop-blur-sm border border-card-border">
              <p className="font-serif text-xl md:text-2xl tracking-tight">Aggregate Exit Value: <span className="text-primary font-bold">$14.2 Million</span></p>
           </div>
        </div>
      </motion.div>
    </section>
  );
}
