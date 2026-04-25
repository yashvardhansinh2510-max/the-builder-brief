import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, ArrowLeft, Loader2, Mail, Zap } from "lucide-react";

import { useAuth } from "@/lib/AuthContext";
import logoPath from "@assets/logo.jpg";

export default function AuthPage({ mode = "sign-in" }: { mode?: "sign-in" | "sign-up" }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [_, setLocation] = useLocation();
  const { session } = useAuth();
  
  useEffect(() => {
    setError(null);
    setSuccessMsg(null);
    setPassword("");
  }, [mode]);

  useEffect(() => {
    if (session) {
      const params = new URLSearchParams(window.location.search);
      const redirect = params.get("redirect");
      if (redirect === "pricing") {
        setLocation("/");
        setTimeout(() => {
          const pricing = document.getElementById("pricing");
          if (pricing) pricing.scrollIntoView({ behavior: "smooth" });
        }, 300);
      } else {
        setLocation("/dashboard");
      }
    }
  }, [session, setLocation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccessMsg(null);

      if (mode === "sign-up") {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
          },
        });
        if (signUpError) throw signUpError;
        setSuccessMsg("Check your email for a confirmation link.");
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
      }
    } catch (err: any) {
      setError(err.message || `An error occurred during ${mode}.`);
    } finally {
      setLoading(false);
    }
  };

  const isSignUp = mode === "sign-up";

  return (
    <div className="min-h-[100dvh] flex items-center justify-center overflow-hidden bg-background md:p-6 lg:p-12 font-sans">
      <div className="w-full h-full md:h-auto relative max-w-6xl overflow-hidden flex flex-col md:flex-row shadow-2xl rounded-none md:rounded-[2.5rem] bg-card border border-border">
        
        {/* LEFT SIDE: Brand/Animation */}
        <div className="w-full md:w-1/2 relative bg-card flex flex-col justify-end p-8 md:p-12 overflow-hidden min-h-[300px] md:min-h-[600px]">
          {/* Animated Background Layers */}
          <div className="absolute inset-0 z-0 bg-gradient-to-t from-background via-background/80 to-transparent"></div>
          
          <div className="absolute inset-0 z-0 flex overflow-hidden backdrop-blur-3xl opacity-40">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ y: "-100%" }}
                animate={{ y: "100%" }}
                transition={{
                  duration: 8 + Math.random() * 5,
                  repeat: Infinity,
                  ease: "linear",
                  delay: i * 0.5,
                }}
                className="h-[40rem] w-[4rem] bg-gradient-to-b from-transparent via-primary/30 to-transparent mx-1 blur-md"
              />
            ))}
          </div>

          <div className="w-[20rem] h-[20rem] bg-primary/20 absolute -z-10 rounded-full -bottom-10 -left-10 blur-[80px]"></div>
          <div className="w-[15rem] h-[15rem] bg-primary/30 absolute -z-10 rounded-full top-10 right-10 blur-[100px]"></div>

          <div className="relative z-10">
            <Link href="/" className="inline-block mb-12 hover:opacity-80 transition-opacity">
              <img src={logoPath} alt="The Builder Brief" className="w-12 h-12 rounded-xl object-cover shadow-lg border border-border/50" />
            </Link>
            <h1 className="text-3xl md:text-5xl font-serif leading-[1.1] tracking-tight mb-4 text-foreground">
              Ship a real startup <br /><span className="italic text-primary">by Monday.</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-md leading-relaxed">
              The startup incubator built for Founder CS. Join the alliance of builders receiving weekly blueprints.
            </p>
          </div>
        </div>

        {/* RIGHT SIDE: Form */}
        <div className="w-full md:w-1/2 flex flex-col bg-background p-8 md:p-16 relative z-10 border-l border-border/50">
          <Link href="/" className="absolute top-8 right-8 text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Home
          </Link>

          <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full mt-10 md:mt-0">
            <div className="flex flex-col mb-10">
              <div className="text-primary mb-5 inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20">
                <Zap className="h-6 w-6" />
              </div>
              <h2 className="font-serif text-3xl md:text-4xl mb-3 tracking-tight">
                {isSignUp ? "Get Started" : "Welcome Back"}
              </h2>
              <p className="text-muted-foreground text-base">
                {isSignUp 
                  ? "Join the incubator and access the blueprints." 
                  : "Sign in to access your dashboard."}
              </p>
            </div>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, height: 0, scale: 0.95 }}
                  animate={{ opacity: 1, height: "auto", scale: 1 }}
                  exit={{ opacity: 0, height: 0, scale: 0.95 }}
                  className="mb-6 overflow-hidden"
                >
                  <div className="bg-destructive/10 text-destructive text-sm px-4 py-3 rounded-xl border border-destructive/20 flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <p className="leading-snug">{error}</p>
                  </div>
                </motion.div>
              )}
              {successMsg && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, height: 0, scale: 0.95 }}
                  animate={{ opacity: 1, height: "auto", scale: 1 }}
                  exit={{ opacity: 0, height: 0, scale: 0.95 }}
                  className="mb-6 overflow-hidden"
                >
                  <div className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-sm px-4 py-3 rounded-xl border border-emerald-500/20 flex items-start gap-2.5">
                    <Mail className="w-4 h-4 mt-0.5 shrink-0" />
                    <p className="leading-snug">{successMsg}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground ml-1">Email address</label>
                <Input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 px-5 rounded-xl text-base border-border/50 bg-card focus-visible:ring-primary focus-visible:border-primary transition-all placeholder:text-muted-foreground/60"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between ml-1">
                  <label className="text-sm font-medium text-foreground">
                    {isSignUp ? "Create password" : "Password"}
                  </label>
                  {!isSignUp && (
                    <button type="button" className="text-xs text-muted-foreground hover:text-primary transition-colors focus:outline-none">
                      Forgot?
                    </button>
                  )}
                </div>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 px-5 rounded-xl text-base border-border/50 bg-card focus-visible:ring-primary focus-visible:border-primary transition-all placeholder:text-muted-foreground/60"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 mt-4 rounded-xl text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                {loading ? (
                  <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> {isSignUp ? "Creating account..." : "Signing in..."}</>
                ) : (
                  isSignUp ? "Create account" : "Sign in"
                )}
              </Button>

              <div className="mt-6 text-center text-sm text-muted-foreground">
                {isSignUp ? "Already have an account?" : "Don't have an account yet?"}{" "}
                <Link
                  href={isSignUp ? "/sign-in" : "/sign-up"}
                  className="text-foreground font-semibold underline decoration-border underline-offset-4 hover:decoration-primary transition-colors"
                >
                  {isSignUp ? "Log in" : "Sign up"}
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
