import { motion } from "framer-motion";
import { Link } from "wouter";
import { SignIn, SignUp } from "@clerk/react";
import { ArrowLeft } from "lucide-react";
import logoPath from "@assets/logo.jpg";
import { VaultTeaserCard } from "@/components/VaultTeaserCard";

export default function AuthPage({ mode = "sign-in" }: { mode?: "sign-in" | "sign-up" }) {
  const isSignUp = mode === "sign-up";

  return (
    <div className="min-h-screen w-full flex items-center justify-center overflow-hidden bg-background font-sans">
      <div className="w-full h-screen flex flex-col md:flex-row">

        {/* LEFT PANEL — desktop only, 40% */}
        <div className="hidden md:flex w-[40%] relative bg-card flex-col items-center justify-center p-12 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-br from-background via-background/90 to-background/70" />
            <div className="w-[20rem] h-[20rem] bg-primary/20 absolute -z-10 rounded-full -bottom-10 -left-10 blur-[80px]" />
            <div className="w-[15rem] h-[15rem] bg-primary/30 absolute -z-10 rounded-full top-10 right-10 blur-[100px]" />
          </div>

          <div className="relative z-10 flex flex-col items-center gap-8 w-full max-w-xs">
            <Link href="/" className="self-start hover:opacity-80 transition-opacity">
              <img
                src={logoPath}
                alt="The Builder Brief"
                className="w-10 h-10 rounded-xl object-cover shadow-lg border border-border/50"
              />
            </Link>

            <VaultTeaserCard blurScore={true} />
          </div>
        </div>

        {/* RIGHT PANEL — full width mobile, 60% desktop */}
        <div className="flex-1 flex flex-col bg-background p-8 md:p-16 relative border-l border-border/50">
          <Link href="/" className="absolute top-8 right-8 text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Home
          </Link>

          {/* Mobile logo */}
          <div className="flex justify-center mb-8 md:hidden">
            <Link href="/">
              <img
                src={logoPath}
                alt="The Builder Brief"
                className="w-10 h-10 rounded-xl object-cover shadow-lg border border-border/50"
              />
            </Link>
          </div>

          <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
            <div className="mb-10">
              <h2 className="font-serif text-3xl md:text-4xl mb-3 tracking-tight">
                {isSignUp ? "Get Started" : "Welcome Back"}
              </h2>
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
