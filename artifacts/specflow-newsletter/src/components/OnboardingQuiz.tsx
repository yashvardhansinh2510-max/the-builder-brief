import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { ChevronRight } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { toast } from 'sonner';

interface QuizAnswers {
  sector: string;
  stage: string;
  goal: string;
  teamSize: number;
  companyName: string;
  targetCustomer?: string;
  ideaDescription?: string;
}

const SECTORS = ['B2B SaaS', 'DTC E-commerce', 'AI Tooling', 'Developer Infrastructure'];
const STAGES = ['Ideation', 'Building', 'Validating', 'Revenue', 'Scaling'];
const GOALS = ['Ship in 90 days', 'Reach $10K MRR', 'Raise Series A', 'Exit'];

export default function OnboardingQuiz({ onComplete }: { onComplete?: () => void }) {
  const { user } = useAuth();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({
    sector: '',
    stage: '',
    goal: '',
    teamSize: 1,
    companyName: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const questions = [
    {
      id: 'sector',
      question: 'What sector are you building in?',
      type: 'select',
      options: SECTORS,
    },
    {
      id: 'stage',
      question: 'What stage is your company at?',
      type: 'select',
      options: STAGES,
    },
    {
      id: 'goal',
      question: 'What is your primary goal in the next 12 months?',
      type: 'select',
      options: GOALS,
    },
    {
      id: 'teamSize',
      question: 'How many people are on your team?',
      type: 'number',
    },
    {
      id: 'companyName',
      question: 'What is your company name?',
      type: 'text',
    },
  ];

  const handleSelectAnswer = (value: string) => {
    const questionId = questions[currentQuestion].id as keyof QuizAnswers;
    setAnswers(prev => ({ ...prev, [questionId]: value }));
    moveToNext();
  };

  const handleTextAnswer = (value: string) => {
    const questionId = questions[currentQuestion].id as keyof QuizAnswers;
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleNumberAnswer = (value: number) => {
    setAnswers(prev => ({ ...prev, teamSize: value }));
  };

  const moveToNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handleSubmit = async () => {
    if (!user?.email) {
      toast.error('Not authenticated');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/onboarding/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          ...answers,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save onboarding');
      }

      toast.success('Profile created! Personalizing your experience...');
      onComplete?.();
    } catch (error) {
      console.error('Submission error:', error);
      toast.error('Failed to save profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        {/* Progress bar */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <Badge className="bg-primary/10 text-primary border-none text-[10px] tracking-[0.3em]">
              QUESTION {currentQuestion + 1} OF {questions.length}
            </Badge>
            <span className="text-xs text-muted-foreground font-mono">{Math.round(progress)}%</span>
          </div>
          <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Question */}
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h2 className="font-serif text-4xl md:text-5xl tracking-tight mb-8">{question.question}</h2>

          {question.type === 'select' && (
            <div className="space-y-3">
              {question.options?.map(option => (
                <button
                  key={option}
                  onClick={() => handleSelectAnswer(option)}
                  className="w-full p-4 text-left border border-border rounded-xl hover:border-primary/40 hover:bg-primary/5 transition-all group"
                >
                  <span className="font-sans text-lg">{option}</span>
                </button>
              ))}
            </div>
          )}

          {question.type === 'number' && (
            <div className="space-y-6">
              <input
                type="number"
                min="1"
                max="100"
                value={answers.teamSize}
                onChange={e => handleNumberAnswer(parseInt(e.target.value))}
                className="w-full p-4 border border-border rounded-xl bg-background text-foreground focus:outline-none focus:border-primary"
              />
              <button
                onClick={moveToNext}
                className="w-full p-4 bg-primary text-primary-foreground font-bold rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {question.type === 'text' && (
            <div className="space-y-6">
              <input
                type="text"
                placeholder="Enter company name"
                value={answers.companyName}
                onChange={e => handleTextAnswer(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (currentQuestion === questions.length - 1 ? handleSubmit() : moveToNext())}
                className="w-full p-4 border border-border rounded-xl bg-background text-foreground focus:outline-none focus:border-primary"
              />
              {currentQuestion === questions.length - 1 ? (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full p-4 bg-primary text-primary-foreground font-bold rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity"
                >
                  {isSubmitting ? 'Creating profile...' : 'Create My Profile'}
                </button>
              ) : (
                <button
                  onClick={moveToNext}
                  className="w-full p-4 bg-primary text-primary-foreground font-bold rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
