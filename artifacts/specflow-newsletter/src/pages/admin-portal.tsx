import { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { motion } from "framer-motion";
import { 
  Settings, Users, Zap, BookOpen, 
  ArrowLeft, Save, Plus, Trash2, 
  ChevronRight, LayoutDashboard, Database, ShoppingBag
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export default function AdminPortal() {
  const { session, tier } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<"overview" | "drops" | "playbook" | "users" | "marketplace">("overview");
  const [drops, setDrops] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for admin access (will be enforced by API too)
    // For now we just load data and let API reject if not admin
    fetchDrops();
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/admin/products", {
        headers: { "Authorization": `Bearer ${session?.access_token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDrops = async () => {
    try {
      const res = await fetch("/api/admin/daily-drops", {
        headers: { "Authorization": `Bearer ${session?.access_token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setDrops(data);
      } else if (res.status === 403) {
        toast.error("Access Denied", { description: "Admin privileges required." });
        setLocation("/dashboard");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const saveDrop = async (drop: any) => {
    const toastId = toast.loading("Saving drop...");
    try {
      const res = await fetch("/api/admin/daily-drops", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.access_token}`
        },
        body: JSON.stringify(drop)
      });
      if (res.ok) {
        toast.success("Drop saved successfully", { id: toastId });
        fetchDrops();
      } else {
        toast.error("Failed to save", { id: toastId });
      }
    } catch (err) {
      toast.error("Error saving", { id: toastId });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* Navigation */}
      <nav className="border-b border-border/40 bg-card/30 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="text-[10px] font-black uppercase tracking-widest">Back to Portal</span>
            </Link>
            <div className="h-6 w-px bg-border/40" />
            <h1 className="font-serif text-2xl flex items-center gap-3">
              <Settings className="w-6 h-6 text-primary" />
              Command Center
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase">
              Admin Mode_Active
            </Badge>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar */}
          <aside className="w-full lg:w-64 space-y-2">
            {[
              { id: "overview", label: "Overview", icon: LayoutDashboard },
              { id: "drops", label: "Daily Drops", icon: Zap },
              { id: "playbook", label: "Playbook", icon: BookOpen },
              { id: "marketplace", label: "Marketplace", icon: ShoppingBag },
              { id: "users", label: "Subscribers", icon: Users },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-sm font-bold transition-all ${activeTab === tab.id ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-muted-foreground hover:bg-card hover:text-foreground"}`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
            <div className="pt-8 mt-8 border-t border-border/40">
              <button className="w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-sm font-bold text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all">
                <Database className="w-5 h-5" />
                Database Health
              </button>
            </div>
          </aside>

          {/* Content Area */}
          <section className="flex-1">
            {activeTab === "overview" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 {[
                   { label: "Total Revenue", val: "$12,450", trend: "+12%" },
                   { label: "Active Users", val: "1,204", trend: "+5%" },
                   { label: "Conversion Rate", val: "3.4%", trend: "+0.2%" },
                 ].map(stat => (
                   <div key={stat.label} className="p-8 rounded-[2.5rem] bg-card/40 border border-border/40 backdrop-blur-sm">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">{stat.label}</p>
                      <p className="font-serif text-4xl mb-2">{stat.val}</p>
                      <p className="text-xs text-emerald-500 font-bold">{stat.trend} from last month</p>
                   </div>
                 ))}
              </div>
            )}

            {activeTab === "drops" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-8">
                   <h2 className="font-serif text-3xl">Manage Daily Drops</h2>
                   <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all">
                     <Plus className="w-4 h-4" /> Add New Drop
                   </button>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {loading ? (
                    <div className="py-20 text-center animate-pulse text-muted-foreground">Synchronizing with core database...</div>
                  ) : (
                    drops.map((drop) => (
                      <div key={drop.id} className="p-6 rounded-3xl bg-card border border-border/40 hover:border-primary/30 transition-all group">
                         <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                               <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-2xl">
                                  {drop.categoryIcon}
                               </div>
                               <div>
                                  <h3 className="font-bold text-lg">{drop.title}</h3>
                                  <p className="text-xs text-muted-foreground uppercase tracking-widest">{drop.pillar} • DAY {drop.dayOfWeek}</p>
                               </div>
                            </div>
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                               <button className="p-3 rounded-xl hover:bg-background transition-colors text-muted-foreground">
                                  <Save className="w-5 h-5" />
                               </button>
                               <button className="p-3 rounded-xl hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive">
                                  <Trash2 className="w-5 h-5" />
                               </button>
                            </div>
                         </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === "playbook" && (
              <div className="py-20 text-center text-muted-foreground border-2 border-dashed border-border/40 rounded-[3rem]">
                <BookOpen className="w-12 h-12 mx-auto mb-6 opacity-20" />
                <p className="font-serif text-2xl mb-2">Playbook Manager</p>
                <p className="text-sm">Lesson editor coming in the next deployment cycle.</p>
              </div>
            )}

            {activeTab === "marketplace" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-8">
                   <h2 className="font-serif text-3xl">Asset Marketplace</h2>
                   <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all">
                     <Plus className="w-4 h-4" /> Add Product
                   </button>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {products.map((product) => (
                    <div key={product.id} className="p-6 rounded-3xl bg-card border border-border/40 hover:border-primary/30 transition-all group">
                       <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                             <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                <ShoppingBag className="w-6 h-6" />
                             </div>
                             <div>
                                <h3 className="font-bold text-lg">{product.name}</h3>
                                <p className="text-xs text-muted-foreground uppercase tracking-widest">${product.price} • {product.category}</p>
                             </div>
                          </div>
                          <div className="flex items-center gap-2">
                             <Badge variant="outline" className={product.isActive ? "text-emerald-500 border-emerald-500/20" : "text-muted-foreground"}>
                                {product.isActive ? "Active" : "Draft"}
                             </Badge>
                          </div>
                       </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "users" && (
              <div className="py-20 text-center text-muted-foreground border-2 border-dashed border-border/40 rounded-[3rem]">
                <Users className="w-12 h-12 mx-auto mb-6 opacity-20" />
                <p className="font-serif text-2xl mb-2">User Directory</p>
                <p className="text-sm">Complete subscriber management system initializing.</p>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
