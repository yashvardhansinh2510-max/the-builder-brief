import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Heart, X, User, Zap, Target, Users } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { toast } from 'sonner';

interface Skill {
  id: number;
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

interface CoFounderProfile {
  id: number;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  bio?: string;
  stage: string;
  industry: string;
  mainFocus: string;
  yearsExperience?: number;
  previousExits?: number;
  skills: Skill[];
  interests: string[];
  commitmentLevel?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  profileImage?: string;
}

interface Candidate extends CoFounderProfile {
  complementaryScore: number;
  stageMatch: number;
  industryMatch: number;
  interestMatch: number;
  timelineAlignment: number;
  overallScore: number;
  reasons: string[];
}

const SkillLevelColor = {
  beginner: 'bg-blue-100 text-blue-800',
  intermediate: 'bg-green-100 text-green-800',
  advanced: 'bg-orange-100 text-orange-800',
  expert: 'bg-red-100 text-red-800',
};

export default function CoFounderMatcher() {
  const { user } = useAuth();
  const [view, setView] = useState<'profile' | 'browse'>('profile');
  const [profile, setProfile] = useState<CoFounderProfile | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [currentCandidateIdx, setCurrentCandidateIdx] = useState(0);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    bio: '',
    stage: 'mvp',
    industry: '',
    mainFocus: 'technical',
    yearsExperience: '',
    skills: [] as Skill[],
    interests: [] as string[],
    commitmentLevel: 'fulltime',
  });

  const [newSkill, setNewSkill] = useState<{ name: string; level: 'beginner' | 'intermediate' | 'advanced' | 'expert' }>({ name: '', level: 'intermediate' });
  const [newInterest, setNewInterest] = useState('');

  useEffect(() => {
    if (user?.email) {
      loadProfile();
    }
  }, [user?.email]);

  const loadProfile = async () => {
    try {
      const response = await fetch(`/api/co-founder-matching/profiles/${user?.email}`);
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        setFormData({
          firstName: data.firstName,
          lastName: data.lastName,
          bio: data.bio || '',
          stage: data.stage,
          industry: data.industry,
          mainFocus: data.mainFocus,
          yearsExperience: data.yearsExperience?.toString() || '',
          skills: data.skills,
          interests: data.interests,
          commitmentLevel: data.commitmentLevel || 'fulltime',
        });
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    }
  };

  const loadCandidates = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/co-founder-matching/candidates/${user?.email}`);
      if (response.ok) {
        const data = await response.json();
        setCandidates(data);
        setCurrentCandidateIdx(0);
      }
    } catch (error) {
      console.error('Failed to load candidates:', error);
      toast.error('Failed to load candidates');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.firstName || !formData.lastName || !formData.industry || !formData.stage) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const response = await fetch('/api/co-founder-matching/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.email,
          ...formData,
          yearsExperience: formData.yearsExperience ? parseInt(formData.yearsExperience) : 0,
        }),
      });

      if (!response.ok) throw new Error('Failed to save profile');

      const data = await response.json();
      setProfile(data.profile);
      toast.success('Profile updated! 🎉');
      setView('browse');
      loadCandidates();
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save profile');
    }
  };

  const addSkill = () => {
    if (!newSkill.name) return;
    setFormData({
      ...formData,
      skills: [...formData.skills, { id: Date.now(), ...newSkill }],
    });
    setNewSkill({ name: '', level: 'intermediate' });
  };

  const removeSkill = (id: number) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((s) => s.id !== id),
    });
  };

  const addInterest = () => {
    if (!newInterest || formData.interests.includes(newInterest)) return;
    setFormData({
      ...formData,
      interests: [...formData.interests, newInterest],
    });
    setNewInterest('');
  };

  const removeInterest = (interest: string) => {
    setFormData({
      ...formData,
      interests: formData.interests.filter((i) => i !== interest),
    });
  };

  const handleLike = async () => {
    if (currentCandidateIdx >= candidates.length) return;

    try {
      await fetch('/api/co-founder-matching/interact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.email,
          targetUserId: candidates[currentCandidateIdx].userId,
          interactionType: 'liked',
        }),
      });
      nextCandidate();
      toast.success('Match liked! 💚');
    } catch (error) {
      console.error('Like error:', error);
    }
  };

  const handlePass = async () => {
    if (currentCandidateIdx >= candidates.length) return;

    try {
      await fetch('/api/co-founder-matching/interact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.email,
          targetUserId: candidates[currentCandidateIdx].userId,
          interactionType: 'passed',
        }),
      });
      nextCandidate();
    } catch (error) {
      console.error('Pass error:', error);
    }
  };

  const nextCandidate = () => {
    setCurrentCandidateIdx((prev) => prev + 1);
  };

  const currentCandidate = candidates[currentCandidateIdx];

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <h1 className="font-serif text-5xl mb-2">Co-Founder Matcher</h1>
          <p className="text-muted-foreground text-lg">Find your perfect co-founder match</p>
        </motion.div>

        {/* Tabs */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4 mb-8">
          <button
            onClick={() => setView('profile')}
            className={`px-6 py-2 rounded-lg font-semibold transition ${
              view === 'profile'
                ? 'bg-primary text-primary-foreground'
                : 'border border-border hover:bg-secondary'
            }`}
          >
            <User className="w-4 h-4 inline mr-2" />
            Profile
          </button>
          <button
            onClick={() => {
              setView('browse');
              if (candidates.length === 0) loadCandidates();
            }}
            className={`px-6 py-2 rounded-lg font-semibold transition ${
              view === 'browse'
                ? 'bg-primary text-primary-foreground'
                : 'border border-border hover:bg-secondary'
            }`}
          >
            <Users className="w-4 h-4 inline mr-2" />
            Browse
          </button>
        </motion.div>

        {/* Profile View */}
        <AnimatePresence mode="wait">
          {view === 'profile' ? (
            <motion.div key="profile" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="border border-border rounded-xl p-6">
                  <h2 className="font-serif text-2xl mb-6">Your Profile</h2>
                  <form onSubmit={handleSaveProfile} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold mb-2">First Name</label>
                        <input
                          type="text"
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          className="w-full p-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2">Last Name</label>
                        <input
                          type="text"
                          value={formData.lastName}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                          className="w-full p-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:border-primary"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">Bio</label>
                      <textarea
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        placeholder="Tell us about yourself..."
                        rows={3}
                        className="w-full p-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:border-primary resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold mb-2">Stage</label>
                        <select
                          value={formData.stage}
                          onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                          className="w-full p-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:border-primary"
                        >
                          <option>idea</option>
                          <option>mvp</option>
                          <option>traction</option>
                          <option>growth</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2">Industry</label>
                        <input
                          type="text"
                          value={formData.industry}
                          onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                          placeholder="e.g., SaaS, Healthcare"
                          className="w-full p-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:border-primary"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">Main Focus</label>
                      <select
                        value={formData.mainFocus}
                        onChange={(e) => setFormData({ ...formData, mainFocus: e.target.value })}
                        className="w-full p-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:border-primary"
                      >
                        <option>technical</option>
                        <option>business</option>
                        <option>operations</option>
                        <option>design</option>
                        <option>marketing</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      className="w-full p-3 bg-primary text-primary-foreground font-bold rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                    >
                      Save Profile <ChevronRight className="w-4 h-4" />
                    </button>
                  </form>
                </div>

                <div className="space-y-6">
                  {/* Skills */}
                  <div className="border border-border rounded-xl p-6">
                    <h3 className="font-semibold mb-4">Skills</h3>
                    <div className="flex gap-2 mb-4">
                      <input
                        type="text"
                        value={newSkill.name}
                        onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                        placeholder="Add a skill"
                        className="flex-1 p-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:border-primary text-sm"
                      />
                      <select
                        value={newSkill.level}
                        onChange={(e) =>
                          setNewSkill({
                            ...newSkill,
                            level: e.target.value as any as 'beginner' | 'intermediate' | 'advanced' | 'expert',
                          })
                        }
                        className="p-2 border border-border rounded-lg bg-background text-foreground text-sm"
                      >
                        <option>beginner</option>
                        <option>intermediate</option>
                        <option>advanced</option>
                        <option>expert</option>
                      </select>
                      <button
                        onClick={addSkill}
                        className="px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.skills.map((skill) => (
                        <div
                          key={skill.id}
                          className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-2 ${
                            SkillLevelColor[skill.level]
                          }`}
                        >
                          {skill.name}
                          <button onClick={() => removeSkill(skill.id)} className="ml-1 hover:opacity-70">
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Interests */}
                  <div className="border border-border rounded-xl p-6">
                    <h3 className="font-semibold mb-4">Interests</h3>
                    <div className="flex gap-2 mb-4">
                      <input
                        type="text"
                        value={newInterest}
                        onChange={(e) => setNewInterest(e.target.value)}
                        placeholder="Add an interest"
                        className="flex-1 p-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:border-primary text-sm"
                      />
                      <button
                        onClick={addInterest}
                        className="px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.interests.map((interest) => (
                        <div key={interest} className="px-3 py-1 rounded-full text-xs bg-secondary text-secondary-foreground">
                          {interest}
                          <button
                            onClick={() => removeInterest(interest)}
                            className="ml-2 hover:opacity-70"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            /* Browse View */
            <motion.div key="browse" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {loading ? (
                <div className="flex items-center justify-center min-h-96">Loading candidates...</div>
              ) : currentCandidate ? (
                <div className="max-w-2xl mx-auto">
                  <motion.div
                    key={currentCandidateIdx}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="border border-border rounded-xl p-8 bg-card"
                  >
                    {/* Candidate Card */}
                    <div className="mb-6">
                      <h2 className="font-serif text-3xl mb-2">
                        {currentCandidate.firstName} {currentCandidate.lastName}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        {currentCandidate.mainFocus} at {currentCandidate.stage} stage
                      </p>
                    </div>

                    {/* Match Score */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-6 p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-200"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold">Overall Match</p>
                        <p className="text-3xl font-bold text-purple-600">{currentCandidate.overallScore}%</p>
                      </div>
                      <div className="space-y-2 text-sm">
                        {currentCandidate.reasons.map((reason, idx) => (
                          <p key={idx} className="text-muted-foreground">
                            ✓ {reason}
                          </p>
                        ))}
                      </div>
                    </motion.div>

                    {/* Bio */}
                    {currentCandidate.bio && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="mb-4 text-sm leading-relaxed"
                      >
                        {currentCandidate.bio}
                      </motion.p>
                    )}

                    {/* Skills */}
                    <div className="mb-6">
                      <p className="font-semibold text-sm mb-3">Skills</p>
                      <div className="flex flex-wrap gap-2">
                        {currentCandidate.skills.map((skill) => (
                          <span
                            key={skill.id}
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              SkillLevelColor[skill.level]
                            }`}
                          >
                            {skill.name}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Interests */}
                    <div className="mb-8">
                      <p className="font-semibold text-sm mb-3">Interests</p>
                      <div className="flex flex-wrap gap-2">
                        {currentCandidate.interests.map((interest) => (
                          <span key={interest} className="px-3 py-1 rounded-full text-xs bg-secondary">
                            {interest}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-4">
                      <button
                        onClick={handlePass}
                        className="flex-1 p-3 border border-border rounded-lg hover:bg-secondary transition-colors flex items-center justify-center gap-2"
                      >
                        <X className="w-5 h-5" />
                        Pass
                      </button>
                      <button
                        onClick={handleLike}
                        className="flex-1 p-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                      >
                        <Heart className="w-5 h-5" />
                        Like
                      </button>
                    </div>

                    <p className="text-xs text-muted-foreground mt-4 text-center">
                      {currentCandidateIdx + 1} of {candidates.length}
                    </p>
                  </motion.div>
                </div>
              ) : (
                <div className="border border-border rounded-lg p-12 text-center">
                  <Zap className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground mb-4">No more candidates to show</p>
                  <button
                    onClick={loadCandidates}
                    className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90"
                  >
                    Reload
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
