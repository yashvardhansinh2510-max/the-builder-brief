import { motion } from "framer-motion";
import { Globe } from "@/components/ui/cobe-globe";
import { useSubscriberCount } from "@/hooks/useSubscriberCount";
import { Users2, Globe2 } from "lucide-react";

const founderLocations = [
  { id: "sf", location: [37.7749, -122.4194] as [number, number], label: "San Francisco" },
  { id: "nyc", location: [40.7128, -74.0060] as [number, number], label: "New York" },
  { id: "mia", location: [25.7617, -80.1918] as [number, number], label: "Miami" },
  { id: "mum", location: [19.0760, 72.8777] as [number, number], label: "Mumbai" },
  { id: "amd", location: [23.0225, 72.5714] as [number, number], label: "Ahmedabad" },
  { id: "ldn", location: [51.5074, -0.1278] as [number, number], label: "London" },
  { id: "syd", location: [-33.8688, 151.2093] as [number, number], label: "Sydney" },
  { id: "blr", location: [12.9716, 77.5946] as [number, number], label: "Bangalore" },
  { id: "sgp", location: [1.3521, 103.8198] as [number, number], label: "Singapore" },
  { id: "ber", location: [52.5200, 13.4050] as [number, number], label: "Berlin" },
  { id: "tor", location: [43.6510, -79.3470] as [number, number], label: "Toronto" },
];

export function FoundersGlobeSection() {
  const subscriberCount = useSubscriberCount();

  return (
    <section className="py-24 px-6 overflow-hidden relative">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
        
        {/* Left Side: Copy */}
        <div className="flex-1 space-y-6 z-10 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-bold uppercase tracking-widest text-primary mx-auto lg:mx-0">
            <Globe2 className="w-3.5 h-3.5" />
            Global Network
          </div>
          
          <h2 className="font-serif text-4xl md:text-5xl leading-[1.1]">
            Founders building <br className="hidden md:block" />
            <span className="italic text-primary/90">everywhere.</span>
          </h2>
          
          <p className="text-muted-foreground text-lg leading-relaxed max-w-md mx-auto lg:mx-0">
            When you join the incubator, you're not just getting blueprints. You're entering a global alliance of builders executing simultaneously across the world.
          </p>

          <div className="inline-flex items-center gap-4 p-4 rounded-2xl bg-card border border-border/40 shadow-lg mt-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Users2 className="w-6 h-6" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Live Count</p>
              </div>
              <p className="font-serif text-3xl font-medium leading-none mt-1">{subscriberCount}</p>
            </div>
          </div>
        </div>

        {/* Right Side: Globe */}
        <div className="flex-1 w-full max-w-lg aspect-square relative z-10 flex items-center justify-center">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(var(--primary),0.1)_0%,transparent_70%)] pointer-events-none" />
          <Globe
            markers={founderLocations}
            baseColor={[0.97, 0.95, 0.93]} // Beige creamish color (matching light theme bg)
            markerColor={[0.97, 0.45, 0.08]} // matching --primary (orange/amber)
            glowColor={[0.97, 0.95, 0.93]}
            mapBrightness={2}
            dark={0}
            markerSize={0.06}
            className="w-full h-full drop-shadow-2xl opacity-90"
          />
        </div>

      </div>
    </section>
  );
}
