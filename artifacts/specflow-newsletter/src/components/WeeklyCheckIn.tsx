import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, Trophy, Flame, TrendingUp } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { toast } from 'sonner';

interface LeaderboardEntry {
  id: number;
  userId: string;
  companyName: string;
  currentStage: string;
  totalCheckIns: number;
  consistency: number;
  averageProgress: number;
  recentActivityScore: number;
  rank: number;
}

interface CurrentCheckIn {
  id: number;
  weekNumber: number;
  year: number;
  currentStage: string;
  reflections?: string;
  focusArea?: string;
  nextWeekGoals?: string;
  completed: boolean;
}

const STAGES = ['Ideation', 'Building', 'Validating', 'Revenue', 'Scaling'];

export default function WeeklyCheckIn() {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [currentCheckIn, setCurrentCheckIn] = useState<CurrentCheckIn | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    currentStage: '',
    reflections: '',
    focusArea: '',
    nextWeekGoals: '',
  });

  useEffect(() => {
    if (!user?.email) return;
    loadData();
  }, [user?.email]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [leaderboardRes, checkInRes] = await Promise.all([
        fetch('/api/weekly-checkins/leaderboard?limit=10'),
        fetch(`/api/weekly-checkins/${user?.email}/current`),
      ]);

      if (leaderboardRes.ok) {
        const data = await leaderboardRes.json();
        setLeaderboard(data.leaderboard || []);
      }

      if (checkInRes.ok) {
        const data = await checkInRes.json();
        setCurrentCheckIn(data);
        setFormData({
          currentStage: data.currentStage || '',
          reflections: data.reflections || '',
          focusArea: data.focusArea || '',
          nextWeekGoals: data.nextWeekGoals || '',
        });
      }
    } catch (error) {
      console.error('Failed to load check-in data:', error);
      toast.error('Failed to load check-in data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.email || !formData.currentStage) {
      toast.error('Please fill in required fields');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/weekly-checkins/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          ...formData,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit check-in');
      }

      toast.success('Check-in submitted! Keep pushing 🚀');
      await loadData();
    } catch (error) {
      console.error('Submission error:', error);
      toast.error('Failed to submit check-in');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  const userRank = leaderboard.find(entry => entry.userId === user?.email)?.rank;

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <h1 className="font-serif text-5xl mb-2">Weekly Check-In</h1>
          <p className="text-muted-foreground text-lg">
            Stay accountable and track your progress every week
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Check-in Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="border border-border rounded-xl p-6 sticky top-6">
              <h2 className="font-serif text-2xl mb-6">This Week</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Current Stage</label>
                  <select
                    value={formData.currentStage}
                    onChange={e => setFormData({ ...formData, currentStage: e.target.value })}
                    className="w-full p-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:border-primary"
                  >
                    <option value="">Select stage</option>
                    {STAGES.map(stage => (
                      <option key={stage} value={stage}>
                        {stage}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Weekly Reflections</label>
                  <textarea
                    value={formData.reflections}
                    onChange={e => setFormData({ ...formData, reflections: e.target.value })}
                    placeholder="What went well? What didn't?"
                    rows={3}
                    className="w-full p-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:border-primary resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Focus Area</label>
                  <input
                    type="text"
                    value={formData.focusArea}
                    onChange={e => setFormData({ ...formData, focusArea: e.target.value })}
                    placeholder="What's your main focus?"
                    className="w-full p-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Next Week Goals</label>
                  <textarea
                    value={formData.nextWeekGoals}
                    onChange={e => setFormData({ ...formData, nextWeekGoals: e.target.value })}
                    placeholder="What do you want to accomplish next week?"
                    rows={3}
                    className="w-full p-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:border-primary resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full p-3 bg-primary text-primary-foreground font-bold rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2"
                >
                  Submit Check-In {!submitting && <ChevronRight className="w-4 h-4" />}
                </button>
              </form>

              {currentCheckIn?.completed && (
                <div className="mt-6 p-3 bg-green-500/10 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-700">✓ Check-in submitted for this week</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Leaderboard */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            <div className="border border-border rounded-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <Trophy className="w-6 h-6 text-amber-500" />
                <h2 className="font-serif text-2xl">Leaderboard</h2>
              </div>

              {userRank && userRank <= 3 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-amber-500/10 border border-amber-200 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <Flame className="w-5 h-5 text-amber-600" />
                    <span className="font-semibold text-amber-700">You're in the top 3! Keep it up 🔥</span>
                  </div>
                </motion.div>
              )}

              <div className="space-y-3">
                {leaderboard.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No check-ins yet. Be the first to submit!
                  </p>
                ) : (
                  leaderboard.map((entry, index) => (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`p-4 border border-border rounded-lg transition-all ${
                        entry.userId === user?.email ? 'bg-primary/5 border-primary/50' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                            <span className="font-bold text-sm">{entry.rank}</span>
                          </div>
                          <div>
                            <p className="font-semibold">{entry.companyName}</p>
                            <p className="text-xs text-muted-foreground">{entry.currentStage}</p>
                          </div>
                        </div>
                        {entry.userId === user?.email && (
                          <Badge className="bg-primary/20 text-primary border-none">You</Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <p className="text-xs text-muted-foreground">Consistency</p>
                          <p className="text-lg font-bold">{entry.consistency}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Progress</p>
                          <div className="flex items-center gap-1">
                            <TrendingUp className="w-4 h-4 text-green-600" />
                            <p className="text-lg font-bold">{entry.averageProgress}%</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Activity</p>
                          <p className="text-lg font-bold">{Math.round(entry.recentActivityScore)}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
