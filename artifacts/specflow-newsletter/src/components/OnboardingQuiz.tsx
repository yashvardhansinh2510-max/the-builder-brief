import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/AuthContext';
import { useLocation } from 'wouter';
import { toast } from 'sonner';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const QUESTIONS = [
  {
    id: 'stage',
    text: "What stage are you at?",
    options: ['Idea', 'Building', 'Launched', 'Scaling'],
  },
  {
    id: 'goal',
    text: "What's your primary goal with The Builder Brief?",
    options: ['Find an idea', 'Validate my idea', 'Grow my startup', 'Get investors'],
  },
  {
    id: 'constraint',
    text: "What's your biggest constraint right now?",
    options: ['Time', 'Money', 'Technical skills', 'Finding customers'],
  },
] as const;

type QuestionId = typeof QUESTIONS[number]['id'];
type Answers = Partial<Record<QuestionId, string>>;

export default function OnboardingQuiz({ onComplete }: { onComplete?: () => void }) {
  const { session } = useAuth();
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [submitting, setSubmitting] = useState(false);

  const question = QUESTIONS[step];
  const isLast = step === QUESTIONS.length - 1;

  const handleSelect = async (value: string) => {
    const next = { ...answers, [question.id]: value };
    setAnswers(next);

    if (!isLast) {
      setStep(s => s + 1);
      return;
    }

    setSubmitting(true);
    try {
      const token = await session?.getToken();
      const res = await fetch(`${API_BASE}/subscribers/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          stage: next.stage,
          goal: next.goal,
          constraint: next.constraint,
        }),
      });
      if (!res.ok) throw new Error('Failed to save');
      toast.success('Profile saved!');
      onComplete?.();
      setLocation('/dashboard');
    } catch {
      toast.error('Failed to save profile. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center px-6">
      {/* Progress dots */}
      <div className="flex gap-2 mb-16">
        {QUESTIONS.map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              i <= step ? 'bg-primary' : 'bg-muted'
            }`}
          />
        ))}
      </div>

      <div className="w-full max-w-lg">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <h2 className="font-serif text-3xl md:text-5xl tracking-tight mb-10">
              {question.text}
            </h2>

            <div className="space-y-3">
              {question.options.map(option => (
                <button
                  key={option}
                  onClick={() => handleSelect(option)}
                  disabled={submitting}
                  className="w-full p-4 text-left border border-border rounded-xl hover:border-primary/50 hover:bg-primary/5 transition-all text-lg font-sans disabled:opacity-50"
                >
                  {option}
                </button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
