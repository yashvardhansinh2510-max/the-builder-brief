import { motion } from "framer-motion";
import { Link } from "wouter";
import { SignIn, SignUp } from "@clerk/react";
import { ArrowLeft, Zap } from "lucide-react";
import logoPath from "@assets/logo.jpg";

export default function AuthPage({ mode = "sign-in" }: { mode?: "sign-in" | "sign-up" }) {
  const isSignUp = mode === "sign-up";

  return (
    <div className="min-h-screen w-full flex items-center justify-center overflow-hidden bg-background font-sans">
      <div className="w-full h-screen relative overflow-hidden flex flex-col md:flex-row bg-card">
        
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
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground/50">
                © {new Date().getFullYear()} Max Tier • All Rights Reserved
              </p>
              <p className="text-muted-foreground text-base">
                {isSignUp 
                  ? "Join the incubator and access the blueprints." 
                  : "Sign in to access your dashboard."}
              </p>
            </div>

            <div className="w-full">
              {isSignUp ? (
                <SignUp
                  routing="path"
                  path="/sign-up"
                  signInUrl="/sign-in"
                  appearance={{
                    elements: {
                      rootBox: "w-full",
                      card: "shadow-none border-0 bg-transparent p-0",
                      headerTitle: "hidden",
                      headerSubtitle: "hidden",
                      logoBox: "hidden",
                      socialButtonsBlockButton: "h-12 rounded-xl border-border/50 bg-card hover:bg-card/80 text-foreground transition-all",
                      formButtonPrimary: "h-12 rounded-xl text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground transition-all hover:scale-[1.02] active:scale-[0.98]",
                      formFieldInput: "h-12 px-5 rounded-xl text-base border-border/50 bg-card focus:ring-primary focus:border-primary transition-all",
                      footerActionLink: "text-foreground font-semibold underline decoration-border underline-offset-4 hover:decoration-primary transition-colors",
                    },
                  }}
                  fallbackRedirectUrl="/dashboard"
                />
              ) : (
                <SignIn
                  routing="path"
                  path="/sign-in"
                  signUpUrl="/sign-up"
                  appearance={{
                    elements: {
                      rootBox: "w-full",
                      card: "shadow-none border-0 bg-transparent p-0",
                      headerTitle: "hidden",
                      headerSubtitle: "hidden",
                      logoBox: "hidden",
                      socialButtonsBlockButton: "h-12 rounded-xl border-border/50 bg-card hover:bg-card/80 text-foreground transition-all",
                      formButtonPrimary: "h-12 rounded-xl text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground transition-all hover:scale-[1.02] active:scale-[0.98]",
                      formFieldInput: "h-12 px-5 rounded-xl text-base border-border/50 bg-card focus:ring-primary focus:border-primary transition-all",
                      footerActionLink: "text-foreground font-semibold underline decoration-border underline-offset-4 hover:decoration-primary transition-colors",
                    },
                  }}
                  fallbackRedirectUrl="/dashboard"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
