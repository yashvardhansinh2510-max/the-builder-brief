import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { CheckCircle, ArrowRight, PartyPopper, Zap, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PaymentSuccess() {
  const [params] = useState(() => new URLSearchParams(window.location.search));
  const sessionId = params.get("session_id");

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-card border border-primary/20 rounded-[3rem] p-10 text-center shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl rounded-full" />
        
        <div className="relative z-10">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-primary/20">
            <CheckCircle className="w-10 h-10 text-primary animate-bounce-short" />
          </div>
          
          <h1 className="font-serif text-4xl mb-4 text-foreground">Welcome to the Inner Circle.</h1>
          <p className="text-muted-foreground mb-10 leading-relaxed">
            Your subscription has been activated. The Foundry Command Center is now unlocked with your new tier access.
          </p>
          
          <div className="space-y-4 mb-10">
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-background/50 border border-primary/10 text-sm text-left">
              <Zap className="w-5 h-5 text-primary shrink-0" />
              <span>Full Archive & Strategy Vault access granted.</span>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-background/50 border border-primary/10 text-sm text-left">
              <ShieldCheck className="w-5 h-5 text-primary shrink-0" />
              <span>Priority support channels activated.</span>
            </div>
          </div>
          
          <Link href="/dashboard">
            <Button className="w-full h-14 rounded-2xl text-md font-bold uppercase tracking-widest gap-2 group">
              Enter Command Center <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
