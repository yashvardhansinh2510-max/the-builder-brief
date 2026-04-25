import { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { motion } from "framer-motion";
import { 
  LineChart, TrendingUp, Users, Shield, 
  Search, Filter, ArrowUpRight, BarChart3,
  Globe, Briefcase, Zap, Compass
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function InvestorPortal() {
  const { session } = useAuth();
  const [dealflow, setDealflow] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDealflow();
  }, []);

  const fetchDealflow = async () => {
    try {
      const res = await fetch("/api/investor/dealflow", {
        headers: { "Authorization": `Bearer ${session?.access_token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setDealflow(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#e0e0e0] font-sans selection:bg-primary/30">
      {/* HUD Navigation */}
      <nav className="border-b border-primary/10 bg-black/40 backdrop-blur-2xl sticky top-0 z-50 px-8 h-24 flex items-center justify-between">
        <div className="flex items-center gap-12">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/30">
                <Shield className="w-6 h-6 text-primary" />
             </div>
             <div>
                <h1 className="font-serif text-xl tracking-tight">Institutional Terminal</h1>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60">Capital_Nexus // Alpha_Stream</p>
             </div>
          </div>
          <div className="h-10 w-px bg-primary/10" />
          <div className="hidden lg:flex items-center gap-8">
             {["Overview", "Dealflow", "Analytics", "Network"].map(tab => (
               <button key={tab} className="text-[11px] font-bold uppercase tracking-widest hover:text-primary transition-colors">{tab}</button>
             ))}
          </div>
        </div>
        <div className="flex items-center gap-6">
           <div className="flex items-center gap-2 px-4 py-2 bg-primary/5 border border-primary/20 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest">System_Live</span>
           </div>
        </div>
      </nav>

      <main className="max-w-[1600px] mx-auto p-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
           {/* Market Pulse Sidebar */}
           <aside className="lg:col-span-1 space-y-12">
              <div className="p-8 rounded-[3rem] bg-gradient-to-br from-primary/10 to-transparent border border-primary/20">
                 <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-6">ECOSYSTEM_HEALTH</p>
                 <div className="space-y-6">
                    <div>
                       <div className="flex justify-between items-end mb-2">
                          <span className="text-xs text-muted-foreground">Velocity</span>
                          <span className="text-xl font-serif text-primary">+82%</span>
                       </div>
                       <div className="h-1.5 w-full bg-primary/5 rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: "82%" }} className="h-full bg-primary shadow-[0_0_15px_rgba(249,115,22,0.5)]" />
                       </div>
                    </div>
                    <div>
                       <div className="flex justify-between items-end mb-2">
                          <span className="text-xs text-muted-foreground">Quality Floor</span>
                          <span className="text-xl font-serif text-primary">72.4</span>
                       </div>
                       <div className="h-1.5 w-full bg-primary/5 rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: "72.4%" }} className="h-full bg-primary shadow-[0_0_15px_rgba(249,115,22,0.5)]" />
                       </div>
                    </div>
                 </div>
              </div>

              <div className="space-y-4">
                 <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-4">FILTERS</p>
                 {[
                   { label: "High Growth", icon: TrendingUp },
                   { label: "Stealth Stealth", icon: Zap },
                   { label: "Pre-Seed", icon: Compass },
                   { label: "Global Network", icon: Globe },
                 ].map(item => (
                   <button key={item.label} className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl hover:bg-primary/5 transition-all group text-left">
                      <item.icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      <span className="text-sm font-bold">{item.label}</span>
                   </button>
                 ))}
              </div>
           </aside>

           {/* Dealflow Table */}
           <div className="lg:col-span-3">
              <div className="flex items-center justify-between mb-12">
                 <h2 className="font-serif text-5xl">Top Tier Assets.</h2>
                 <div className="flex items-center gap-4">
                    <div className="relative">
                       <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                       <input 
                         type="text" 
                         placeholder="Scan Founders..." 
                         className="bg-primary/5 border border-primary/10 rounded-xl pl-12 pr-6 py-3 text-sm focus:ring-1 focus:ring-primary/40 outline-none w-64"
                       />
                    </div>
                    <button className="p-3 rounded-xl bg-primary/5 border border-primary/10 hover:border-primary/40 transition-all">
                       <Filter className="w-5 h-5" />
                    </button>
                 </div>
              </div>

              <div className="grid grid-cols-1 gap-6">
                 {loading ? (
                   <div className="py-24 text-center animate-pulse text-primary/40 font-mono">SCANNING_FOUNDRY_NODES...</div>
                 ) : (
                   dealflow.map((asset) => (
                     <div key={asset.id} className="p-8 rounded-[3rem] bg-gradient-to-r from-card/30 to-transparent border border-primary/5 hover:border-primary/20 transition-all group cursor-pointer">
                        <div className="flex items-center justify-between">
                           <div className="flex items-center gap-8">
                              <div className="w-20 h-20 rounded-[2rem] bg-primary text-white flex flex-col items-center justify-center shadow-2xl shadow-primary/20 relative overflow-hidden">
                                 <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_white,_transparent)] opacity-20" />
                                 <span className="text-[10px] font-black uppercase opacity-60">SCORE</span>
                                 <span className="text-3xl font-serif">{asset.score}</span>
                              </div>
                              <div>
                                 <h3 className="font-serif text-3xl mb-2 flex items-center gap-3">
                                    {asset.startupName}
                                    <Badge variant="outline" className="text-[8px] tracking-widest border-primary/20 text-primary">{asset.stage.toUpperCase()}</Badge>
                                 </h3>
                                 <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">
                                    {asset.sector} // {asset.name}
                                 </p>
                              </div>
                           </div>
                           <div className="flex items-center gap-12">
                              <div className="text-right">
                                 <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">ALIGNMENT</p>
                                 <p className="font-serif text-2xl text-primary">Strong</p>
                              </div>
                              <button className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                                 <ArrowUpRight className="w-6 h-6" />
                              </button>
                           </div>
                        </div>
                     </div>
                   ))
                 )}
              </div>
           </div>
        </div>
      </main>
    </div>
  );
}
