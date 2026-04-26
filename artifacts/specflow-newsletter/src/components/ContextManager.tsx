import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Database, Target, Rocket, Users, AlertCircle, Save, Check, Upload, FileText, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/AuthContext";

interface StartupContext {
  whatBuilding: string;
  stage: "pre-revenue" | "scaling" | "pivoting" | "exit-mode";
  sector: "B2B SaaS" | "Consumer Tech" | "AI/ML" | "Fintech" | "Deeptech";
  targetCustomer: string;
  biggestChallenge: "Distribution" | "Hiring" | "Technical" | "Fundraising";
}

export default function ContextManager() {
  const { session, isAdmin, getToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [files, setFiles] = useState<any[]>([]);
  const [context, setContext] = useState<StartupContext>({
    whatBuilding: "",
    stage: "pre-revenue",
    sector: "B2B SaaS",
    targetCustomer: "",
    biggestChallenge: "Distribution",
  });

  useEffect(() => {
    if (session?.access_token) {
      fetch("/api/subscribers/me", {
        headers: { "Authorization": `Bearer ${session.access_token}` }
      })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) {
          setContext({
            whatBuilding: data.whatBuilding || "",
            stage: data.startupStage || "pre-revenue",
            sector: data.startupSector || "B2B SaaS",
            targetCustomer: data.targetCustomer || "",
            biggestChallenge: data.biggestChallenge || "Distribution",
          });
        }
      });
    }
    if (isAdmin) fetchFiles();
  }, [session, isAdmin]);

  const fetchFiles = async () => {
    const token = await getToken();
    try {
      const res = await fetch("/api/engine/files", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setFiles(data);
      }
    } catch (e) {
      console.error("Failed to fetch files", e);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const token = await getToken();
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/engine/upload", {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData
      });
      if (res.ok) {
        toast.success("File uploaded and indexed");
        fetchFiles();
      } else {
        const error = await res.json();
        toast.error(error.error || "Upload failed");
      }
    } catch (e) {
      toast.error("Upload failed");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const save = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/subscribers/me/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          whatBuilding: context.whatBuilding,
          startupStage: context.stage,
          startupSector: context.sector,
          targetCustomer: context.targetCustomer,
          biggestChallenge: context.biggestChallenge,
          contextUpdatedAt: new Date().toISOString()
        })
      });

      if (res.ok) {
        setSaved(true);
        toast.success("Intelligence Engine Calibrated", {
          description: "Your founder context has been updated across all advisor modules."
        });
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (e) {
      toast.error("Calibration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 rounded-[2.5rem] bg-card/40 border border-border/40 backdrop-blur-sm relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] pointer-events-none" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif text-2xl">Calibration Hub</h3>
            <p className="text-[10px] font-bold uppercase tracking-widest text-primary opacity-60">Engine_Control://Context_Payload</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-2 block">What are you building?</label>
              <textarea
                value={context.whatBuilding}
                onChange={e => setContext({...context, whatBuilding: e.target.value})}
                placeholder="Describe your product, core value prop, and vision..."
                className="w-full bg-background/40 border border-border/40 rounded-2xl p-4 text-xs min-h-[120px] outline-none focus:border-primary/40 transition-all resize-none"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-2 block">Target Customer</label>
              <input
                type="text"
                value={context.targetCustomer}
                onChange={e => setContext({...context, targetCustomer: e.target.value})}
                placeholder="e.g. Series A Fintech Founders, Indie Hackers..."
                className="w-full bg-background/40 border border-border/40 rounded-2xl p-4 text-xs outline-none focus:border-primary/40 transition-all"
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-2 block">Stage</label>
                <select 
                  value={context.stage}
                  onChange={e => setContext({...context, stage: e.target.value as any})}
                  className="w-full bg-background/40 border border-border/40 rounded-xl p-3 text-xs outline-none"
                >
                  <option value="pre-revenue">Pre-Revenue</option>
                  <option value="scaling">Scaling / PMF</option>
                  <option value="pivoting">Pivoting</option>
                  <option value="exit-mode">Exit Mode</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-2 block">Sector</label>
                <select 
                  value={context.sector}
                  onChange={e => setContext({...context, sector: e.target.value as any})}
                  className="w-full bg-background/40 border border-border/40 rounded-xl p-3 text-xs outline-none"
                >
                  <option value="B2B SaaS">B2B SaaS</option>
                  <option value="Consumer Tech">Consumer Tech</option>
                  <option value="AI/ML">AI/ML</option>
                  <option value="Fintech">Fintech</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-2 block">Biggest Blocker</label>
              <div className="grid grid-cols-2 gap-2">
                {["Distribution", "Hiring", "Technical", "Fundraising"].map(opt => (
                  <button
                    key={opt}
                    onClick={() => setContext({...context, biggestChallenge: opt as any})}
                    className={`p-3 rounded-xl border text-[10px] font-bold uppercase tracking-wider transition-all ${context.biggestChallenge === opt ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20" : "bg-background/20 border-border/40 text-muted-foreground hover:bg-background/40"}`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={save}
                disabled={loading}
                className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-xs uppercase tracking-widest hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-xl shadow-primary/10"
              >
                {loading ? "Calibrating..." : saved ? <><Check className="w-4 h-4" /> Calibrated</> : <><Save className="w-4 h-4" /> Update Engine</>}
              </button>
            </div>
          </div>
        </div>

        {/* Admin Training Section */}
        {isAdmin && (
          <div className="mt-12 pt-12 border-t border-border/40">
             <div className="flex items-center justify-between mb-8">
                <div className="space-y-1">
                  <h3 className="font-serif text-2xl flex items-center gap-3">
                    <Database className="w-6 h-6 text-primary" /> Knowledge Base Training
                  </h3>
                  <p className="text-xs text-muted-foreground italic">Add proprietary context to your Intelligence Engine.</p>
                </div>
                <div className="relative">
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    onChange={handleFileUpload}
                    accept=".md,.txt"
                    disabled={isUploading}
                  />
                  <label
                    htmlFor="file-upload"
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest cursor-pointer transition-all ${isUploading ? "bg-muted text-muted-foreground" : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20"}`}
                  >
                    {isUploading ? "Uploading..." : <><Upload className="w-3.5 h-3.5" /> Upload Context</>}
                  </label>
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
               {files.length === 0 ? (
                 <div className="col-span-full p-12 rounded-3xl border border-dashed border-border/40 bg-card/10 flex flex-col items-center justify-center text-center">
                    <FileText className="w-12 h-12 text-muted-foreground/20 mb-4" />
                    <p className="text-sm text-muted-foreground">No proprietary files indexed yet.</p>
                 </div>
               ) : (
                 files.map((file) => (
                   <div key={file.name} className="group p-5 rounded-2xl bg-card/30 border border-border/40 hover:border-primary/30 transition-all">
                      <div className="flex items-center gap-4 mb-4">
                         <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                            <FileText className="w-5 h-5" />
                         </div>
                         <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-bold uppercase tracking-tight truncate">{file.name}</p>
                            <p className="text-[9px] text-muted-foreground uppercase">{(file.size / 1024).toFixed(1)} KB • {new Date(file.updatedAt).toLocaleDateString()}</p>
                         </div>
                      </div>
                      <div className="pt-3 border-t border-border/10 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                         <span className="text-[8px] font-bold text-primary uppercase tracking-widest">Active Sync</span>
                         <button className="text-muted-foreground hover:text-destructive transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                         </button>
                      </div>
                   </div>
                 ))
               )}
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
