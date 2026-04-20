import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const CONFETTI_COLORS = ["#E9591C", "#F97316", "#FCD34D", "#FBBF24", "#F5E6D3"];
const PARTICLE_COUNT = 32;

function Confetti() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
      {Array.from({ length: PARTICLE_COUNT }).map((_, i) => {
        const angle = (i / PARTICLE_COUNT) * 360;
        const distance = 90 + (i % 5) * 28;
        const size = 5 + (i % 4);
        const color = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
        const tx = Math.cos((angle * Math.PI) / 180) * distance;
        const ty = Math.sin((angle * Math.PI) / 180) * distance - 40;
        return (
          <motion.div
            key={i}
            className="absolute rounded-sm"
            style={{
              top: "50%",
              left: "50%",
              width: size,
              height: size,
              marginLeft: -size / 2,
              marginTop: -size / 2,
              backgroundColor: color,
            }}
            initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 1 }}
            animate={{
              x: tx,
              y: ty,
              opacity: 0,
              rotate: angle * 3,
              scale: 0.4,
            }}
            transition={{
              duration: 0.75 + (i % 3) * 0.15,
              ease: "easeOut",
              delay: 0.08,
            }}
          />
        );
      })}
    </div>
  );
}

function playSuccessChime() {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    // C5, E5, G5
    const notes = [523.25, 659.25, 783.99];
    const lastStop = ctx.currentTime + (notes.length - 1) * 0.13 + 0.38;
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.value = freq;
      const t = ctx.currentTime + i * 0.13;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.18, t + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.38);
      osc.start(t);
      osc.stop(t + 0.38);
    });
    setTimeout(() => ctx.close().catch(() => {}), (lastStop - ctx.currentTime) * 1000 + 100);
  } catch {
    // Web Audio not available — silent fail is fine
  }
}

interface SubscribeSuccessOverlayProps {
  onDismiss: () => void;
}

export function SubscribeSuccessOverlay({ onDismiss }: SubscribeSuccessOverlayProps) {
  const played = useRef(false);

  useEffect(() => {
    if (!played.current) {
      played.current = true;
      playSuccessChime();
    }
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onDismiss();
      }}
    >
      <motion.div
        initial={{ scale: 0.82, opacity: 0, y: 28 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 16 }}
        transition={{ type: "spring", stiffness: 320, damping: 26 }}
        className="relative bg-[#F8F4EF] border border-border rounded-3xl p-10 max-w-md w-full text-center overflow-hidden shadow-2xl"
      >
        <Confetti />

        {/* Checkmark circle */}
        <div className="relative z-10 flex justify-center mb-7">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <motion.div
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 450, damping: 22, delay: 0.18 }}
            >
              <Check className="w-8 h-8 text-primary" strokeWidth={3} />
            </motion.div>
          </div>
        </div>

        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28, duration: 0.45 }}
          className="font-serif text-4xl md:text-5xl mb-3 relative z-10"
        >
          You're in.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.38, duration: 0.45 }}
          className="text-muted-foreground leading-relaxed mb-8 relative z-10 max-w-xs mx-auto"
        >
          Your archive is unlocked. Create your free account to read every blueprint.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.48, duration: 0.45 }}
          className="flex flex-col items-center gap-3 relative z-10"
        >
          <Button
            className="rounded-full h-12 px-8 text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground w-full max-w-xs transition-all hover:scale-[1.02] active:scale-[0.98]"
            asChild
          >
            <Link href="/sign-up">Create your account →</Link>
          </Button>
          <button
            onClick={onDismiss}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors py-1"
          >
            I'll do it later
          </button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
