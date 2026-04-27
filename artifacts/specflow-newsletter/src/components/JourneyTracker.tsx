import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle, ChevronRight } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { toast } from 'sonner';

interface Milestone {
  id: number;
  userId: string;
  stage: string;
  milestoneName: string;
  description: string;
  completed: boolean;
  completedAt?: Date;
  displayOrder: number;
  createdAt: Date;
}

interface Progress {
  id: number;
  userId: string;
  currentStage: string;
  completedMilestones: number;
  totalMilestones: number;
  progressPercentage: number;
  updatedAt: Date;
}

export default function JourneyTracker() {
  const { user } = useAuth();
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [loading, setLoading] = useState(true);
  const [completingId, setCompletingId] = useState<number | null>(null);

  useEffect(() => {
    if (!user?.email) return;
    loadJourneyData();
  }, [user?.email]);

  const loadJourneyData = async () => {
    try {
      setLoading(true);
      const [milestonesRes, progressRes] = await Promise.all([
        fetch(`/api/journey/milestones/${user?.email}`),
        fetch(`/api/journey/progress/${user?.email}`),
      ]);

      if (milestonesRes.ok) {
        const data = await milestonesRes.json();
        setMilestones(data.milestones || []);
      }

      if (progressRes.ok) {
        const data = await progressRes.json();
        setProgress(data);
      }
    } catch (error) {
      console.error('Failed to load journey data:', error);
      toast.error('Failed to load your journey');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteMilestone = async (milestoneId: number) => {
    if (!user?.email) return;

    setCompletingId(milestoneId);
    try {
      const response = await fetch('/api/journey/complete-milestone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, milestoneId }),
      });

      if (!response.ok) {
        throw new Error('Failed to complete milestone');
      }

      const data = await response.json();
      setMilestones(prev =>
        prev.map(m =>
          m.id === milestoneId ? { ...m, completed: true, completedAt: new Date() } : m
        )
      );

      setProgress(prev =>
        prev
          ? {
              ...prev,
              completedMilestones: data.completed,
              progressPercentage: data.percentage,
            }
          : null
      );

      toast.success('Milestone completed! 🎉');
    } catch (error) {
      console.error('Completion error:', error);
      toast.error('Failed to complete milestone');
    } finally {
      setCompletingId(null);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading your journey...</div>;
  }

  if (!progress) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
        <div className="max-w-2xl w-full text-center">
          <h2 className="font-serif text-4xl mb-4">No Journey Started Yet</h2>
          <p className="text-muted-foreground mb-6">
            Initialize your founder journey to start tracking milestones and progress.
          </p>
          <button
            onClick={async () => {
              if (!user?.email) return;
              try {
                const response = await fetch(`/api/journey/initialize/${user.email}`, {
                  method: 'POST',
                });
                if (response.ok) {
                  await loadJourneyData();
                  toast.success('Journey initialized!');
                }
              } catch (error) {
                toast.error('Failed to initialize journey');
              }
            }}
            className="px-6 py-3 bg-primary text-primary-foreground font-bold rounded-lg hover:opacity-90"
          >
            Start Your Journey
          </button>
        </div>
      </div>
    );
  }

  const stageColors: Record<string, string> = {
    Ideation: 'bg-blue-500/10 text-blue-600 border-blue-200',
    Building: 'bg-purple-500/10 text-purple-600 border-purple-200',
    Validating: 'bg-amber-500/10 text-amber-600 border-amber-200',
    Revenue: 'bg-green-500/10 text-green-600 border-green-200',
    Scaling: 'bg-red-500/10 text-red-600 border-red-200',
  };

  const stageColor = stageColors[progress.currentStage] || stageColors.Ideation;

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className={`px-4 py-2 rounded-lg border ${stageColor}`}>
              <span className="font-bold text-sm">{progress.currentStage}</span>
            </div>
          </div>
          <h1 className="font-serif text-5xl mb-2">Your Founder Journey</h1>
          <p className="text-muted-foreground text-lg">
            Track milestones and measure progress toward your goals
          </p>
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-12"
        >
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold">Progress</span>
              <span className="text-sm font-mono text-muted-foreground">
                {progress.completedMilestones} / {progress.totalMilestones}
              </span>
            </div>
            <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-primary to-primary/70"
                initial={{ width: 0 }}
                animate={{ width: `${progress.progressPercentage}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <div className="text-right mt-2">
              <span className="text-2xl font-bold">{progress.progressPercentage}%</span>
            </div>
          </div>
        </motion.div>

        {/* Milestones List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.1 }}
          className="space-y-4"
        >
          {milestones.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No milestones available for this stage yet.</p>
            </div>
          ) : (
            milestones.map((milestone, index) => (
              <motion.div
                key={milestone.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-5 border border-border rounded-xl transition-all ${
                  milestone.completed ? 'bg-primary/5' : 'hover:border-primary/40 hover:bg-primary/5'
                }`}
              >
                <div className="flex items-start gap-4">
                  <button
                    onClick={() => handleCompleteMilestone(milestone.id)}
                    disabled={completingId === milestone.id}
                    className="mt-1 flex-shrink-0 disabled:opacity-50"
                  >
                    {milestone.completed ? (
                      <CheckCircle2 className="w-6 h-6 text-primary" />
                    ) : (
                      <Circle className="w-6 h-6 text-muted-foreground hover:text-primary transition-colors" />
                    )}
                  </button>

                  <div className="flex-1">
                    <h3
                      className={`font-semibold text-lg mb-1 ${
                        milestone.completed ? 'text-muted-foreground line-through' : ''
                      }`}
                    >
                      {milestone.milestoneName}
                    </h3>
                    <p className="text-sm text-muted-foreground">{milestone.description}</p>
                    {milestone.completedAt && (
                      <p className="text-xs text-primary mt-2">
                        Completed on {new Date(milestone.completedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  <div className="flex-shrink-0">
                    <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded">
                      #{index + 1}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>

        {/* Summary */}
        {milestones.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-12 p-6 border border-border/50 rounded-xl bg-muted/30"
          >
            <div className="grid grid-cols-3 gap-6 text-center">
              <div>
                <p className="text-2xl font-bold text-primary">{progress.completedMilestones}</p>
                <p className="text-sm text-muted-foreground mt-1">Completed</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{progress.totalMilestones - progress.completedMilestones}</p>
                <p className="text-sm text-muted-foreground mt-1">Remaining</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{progress.progressPercentage}%</p>
                <p className="text-sm text-muted-foreground mt-1">Complete</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
