import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { User, Users, Heart, X, Zap, ChevronRight } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

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
  commitmentLevel?: string;
  skills: Skill[];
  interests: string[];
}

interface CandidateMatch {
  profile: CoFounderProfile;
  overallScore: number;
  complementaryScore: number;
  stageMatch: number;
  industryMatch: number;
  reasons: string[];
}

const SKILL_COLORS: Record<string, string> = {
  beginner: 'bg-primary/10 text-primary',
  intermediate: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  advanced: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  expert: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

const STAGES = ['idea', 'mvp', 'traction', 'growth'];
const FOCUSES = ['technical', 'business', 'operations', 'design', 'marketing'];
const COMMITMENT_LEVELS = ['fulltime', 'parttime', 'advisor'];

export default function CoFounderMatcher() {
  const { user, session } = useAuth();
  const qc = useQueryClient();
  const userId = user?.id;
  const token = session?.access_token;

  const [view, setView] = useState<'profile' | 'browse'>('profile');
  const [saving, setSaving] = useState(false);
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [focusFilter, setFocusFilter] = useState<string>('all');
  const [newSkill, setNewSkill] = useState<{ name: string; level: Skill['level'] }>({ name: '', level: 'intermediate' });
  const [newInterest, setNewInterest] = useState('');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    bio: '',
    stage: 'idea',
    industry: '',
    mainFocus: 'technical',
    commitmentLevel: 'fulltime',
    skills: [] as Skill[],
    interests: [] as string[],
  });

  const { data: profile, isLoading: profileLoading } = useQuery<CoFounderProfile | null>({
    queryKey: ['cofounder-profile', userId],
    queryFn: async () => {
      const res = await fetch(`/api/co-founder-matching/profiles/${userId}`);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error('Failed to load profile');
      return res.json();
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });

  const { data: candidates = [], isLoading: candidatesLoading } = useQuery<CandidateMatch[]>({
    queryKey: ['cofounder-candidates', userId],
    queryFn: async () => {
      const res = await fetch(`/api/co-founder-matching/candidates/${userId}`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!userId && !!profile && view === 'browse',
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        bio: profile.bio || '',
        stage: profile.stage || 'idea',
        industry: profile.industry || '',
        mainFocus: profile.mainFocus || 'technical',
        commitmentLevel: profile.commitmentLevel || 'fulltime',
        skills: profile.skills || [],
        interests: profile.interests || [],
      });
      setView('browse');
    }
  }, [profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.industry) {
      toast.error('Name and industry are required');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/co-founder-matching/profiles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          userId,
          email: user?.email,
          ...formData,
        }),
      });
      if (!res.ok) throw new Error('Failed to save');
      await qc.invalidateQueries({ queryKey: ['cofounder-profile', userId] });
      await qc.invalidateQueries({ queryKey: ['cofounder-candidates', userId] });
      toast.success('Profile saved');
      setView('browse');
    } catch {
      toast.error('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleInteract = async (candidate: CandidateMatch, type: 'liked' | 'passed') => {
    try {
      await fetch('/api/co-founder-matching/interact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          userId,
          targetUserId: candidate.profile.userId,
          interactionType: type,
        }),
      });
      if (type === 'liked') toast.success('Connection request sent');
    } catch {
      // silently ignore
    }
    qc.setQueryData<CandidateMatch[]>(['cofounder-candidates', userId], (old = []) =>
      old.filter((c) => c.profile.userId !== candidate.profile.userId)
    );
  };

  const addSkill = () => {
    if (!newSkill.name.trim()) return;
    setFormData((f) => ({ ...f, skills: [...f.skills, { id: Date.now(), ...newSkill }] }));
    setNewSkill({ name: '', level: 'intermediate' });
  };

  const addInterest = () => {
    const val = newInterest.trim();
    if (!val || formData.interests.includes(val)) return;
    setFormData((f) => ({ ...f, interests: [...f.interests, val] }));
    setNewInterest('');
  };

  const filtered = candidates.filter((c) => {
    if (stageFilter !== 'all' && c.profile.stage !== stageFilter) return false;
    if (focusFilter !== 'all' && c.profile.mainFocus !== focusFilter) return false;
    return true;
  });

  if (profileLoading) {
    return (
      <div className="border border-border/40 rounded-2xl p-8 bg-card animate-pulse">
        <div className="h-8 w-48 bg-muted rounded mb-4" />
        <div className="h-4 w-64 bg-muted rounded" />
      </div>
    );
  }

  return (
    <div className="border border-border/40 rounded-2xl bg-card overflow-hidden">
      {/* Header */}
      <div className="px-8 pt-8 pb-6 border-b border-border/20">
        <Badge className="bg-primary/10 text-primary border-none text-[10px] tracking-[0.3em] mb-3">Co-Founder Matching</Badge>
        <h2 className="font-serif text-3xl tracking-tight">Find Your <span className="italic text-primary">Co-Founder</span></h2>
        <p className="text-muted-foreground text-sm mt-2">Match with builders whose skills complement yours.</p>

        <div className="flex gap-2 mt-6">
          <button
            onClick={() => setView('profile')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
              view === 'profile'
                ? 'bg-primary/10 text-primary border border-primary/20'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted border border-transparent'
            }`}
          >
            <User className="w-3 h-3" /> Your Profile
          </button>
          <button
            onClick={() => setView('browse')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
              view === 'browse'
                ? 'bg-primary/10 text-primary border border-primary/20'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted border border-transparent'
            }`}
          >
            <Users className="w-3 h-3" /> Browse Matches {candidates.length > 0 && <span className="bg-primary text-primary-foreground rounded-full w-4 h-4 flex items-center justify-center text-[9px]">{candidates.length}</span>}
          </button>
        </div>
      </div>

      <div className="p-8">
        {view === 'profile' ? (
          <motion.form key="profile" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">First Name</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData((f) => ({ ...f, firstName: e.target.value }))}
                  placeholder="Yash"
                  className="w-full px-3 py-2.5 border border-border/60 rounded-lg bg-background text-sm focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">Last Name</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData((f) => ({ ...f, lastName: e.target.value }))}
                  placeholder="Jhala"
                  className="w-full px-3 py-2.5 border border-border/60 rounded-lg bg-background text-sm focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">What are you building?</label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData((f) => ({ ...f, bio: e.target.value }))}
                placeholder="The problem I'm solving and how..."
                rows={3}
                className="w-full px-3 py-2.5 border border-border/60 rounded-lg bg-background text-sm focus:outline-none focus:border-primary transition-colors resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">Stage</label>
                <select
                  value={formData.stage}
                  onChange={(e) => setFormData((f) => ({ ...f, stage: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-border/60 rounded-lg bg-background text-sm focus:outline-none focus:border-primary transition-colors"
                >
                  {STAGES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">Industry</label>
                <input
                  type="text"
                  value={formData.industry}
                  onChange={(e) => setFormData((f) => ({ ...f, industry: e.target.value }))}
                  placeholder="B2B SaaS, Fintech..."
                  className="w-full px-3 py-2.5 border border-border/60 rounded-lg bg-background text-sm focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">Your Focus</label>
                <select
                  value={formData.mainFocus}
                  onChange={(e) => setFormData((f) => ({ ...f, mainFocus: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-border/60 rounded-lg bg-background text-sm focus:outline-none focus:border-primary transition-colors"
                >
                  {FOCUSES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>

            {/* Skills */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Skills</label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newSkill.name}
                  onChange={(e) => setNewSkill((s) => ({ ...s, name: e.target.value }))}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  placeholder="React, Sales, Design..."
                  className="flex-1 px-3 py-2 border border-border/60 rounded-lg bg-background text-sm focus:outline-none focus:border-primary transition-colors"
                />
                <select
                  value={newSkill.level}
                  onChange={(e) => setNewSkill((s) => ({ ...s, level: e.target.value as Skill['level'] }))}
                  className="px-3 py-2 border border-border/60 rounded-lg bg-background text-sm focus:outline-none focus:border-primary transition-colors"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="expert">Expert</option>
                </select>
                <button type="button" onClick={addSkill} className="px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-bold hover:opacity-90 transition-opacity">
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.skills.map((skill) => (
                  <div key={skill.id} className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 ${SKILL_COLORS[skill.level] ?? ''}`}>
                    {skill.name}
                    <button type="button" onClick={() => setFormData((f) => ({ ...f, skills: f.skills.filter((s) => s.id !== skill.id) }))} className="hover:opacity-60">×</button>
                  </div>
                ))}
              </div>
            </div>

            {/* Interests */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Interests</label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newInterest}
                  onChange={(e) => setNewInterest(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addInterest())}
                  placeholder="AI, creator economy, DTC..."
                  className="flex-1 px-3 py-2 border border-border/60 rounded-lg bg-background text-sm focus:outline-none focus:border-primary transition-colors"
                />
                <button type="button" onClick={addInterest} className="px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-bold hover:opacity-90 transition-opacity">
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.interests.map((interest) => (
                  <div key={interest} className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-muted text-muted-foreground flex items-center gap-1.5">
                    {interest}
                    <button type="button" onClick={() => setFormData((f) => ({ ...f, interests: f.interests.filter((i) => i !== interest) }))} className="hover:opacity-60">×</button>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Save & Find Matches'} <ChevronRight className="w-4 h-4" />
            </button>
          </motion.form>
        ) : (
          <motion.div key="browse" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Filters */}
            <div className="flex flex-wrap gap-2 mb-6">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Stage:</span>
                {['all', ...STAGES].map((s) => (
                  <button
                    key={s}
                    onClick={() => setStageFilter(s)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold capitalize transition-all ${
                      stageFilter === s
                        ? 'bg-primary/10 text-primary border border-primary/20'
                        : 'text-muted-foreground hover:text-foreground border border-transparent hover:border-border/40'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Focus:</span>
                {['all', ...FOCUSES].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFocusFilter(f)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold capitalize transition-all ${
                      focusFilter === f
                        ? 'bg-primary/10 text-primary border border-primary/20'
                        : 'text-muted-foreground hover:text-foreground border border-transparent hover:border-border/40'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {candidatesLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="border border-border/40 rounded-xl p-6 animate-pulse">
                    <div className="h-5 w-32 bg-muted rounded mb-2" />
                    <div className="h-4 w-48 bg-muted rounded mb-4" />
                    <div className="h-3 w-full bg-muted rounded" />
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="border border-dashed border-border/40 rounded-xl p-12 text-center">
                <Zap className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                <p className="font-semibold mb-1">No matches yet</p>
                <p className="text-sm text-muted-foreground">Complete your profile to find your first match.</p>
                <button onClick={() => setView('profile')} className="mt-4 px-4 py-2 bg-primary text-primary-foreground text-sm font-bold rounded-lg hover:opacity-90 transition-opacity">
                  Update Profile
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filtered.map((match) => (
                  <motion.div
                    key={match.profile.userId}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border border-border/40 rounded-xl p-5 hover:border-primary/30 transition-all group bg-card"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-serif text-lg leading-tight">
                          {match.profile.firstName} {match.profile.lastName}
                        </h3>
                        <p className="text-[11px] text-muted-foreground capitalize">
                          {match.profile.mainFocus} · {match.profile.stage}
                          {match.profile.industry ? ` · ${match.profile.industry}` : ''}
                        </p>
                      </div>
                      <div className="text-right shrink-0 ml-2">
                        <p className="text-xl font-black text-primary leading-none">{match.overallScore}%</p>
                        <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Match</p>
                      </div>
                    </div>

                    {match.profile.bio && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{match.profile.bio}</p>
                    )}

                    {match.reasons.length > 0 && (
                      <ul className="mb-3 space-y-0.5">
                        {match.reasons.slice(0, 2).map((r, i) => (
                          <li key={i} className="text-[11px] text-muted-foreground">✓ {r}</li>
                        ))}
                      </ul>
                    )}

                    {match.profile.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {match.profile.skills.slice(0, 4).map((skill) => (
                          <span key={skill.id} className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${SKILL_COLORS[skill.level] ?? ''}`}>
                            {skill.name}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleInteract(match, 'passed')}
                        className="flex-1 py-2 border border-border/60 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-muted transition-colors"
                      >
                        <X className="w-3.5 h-3.5" /> Pass
                      </button>
                      <button
                        onClick={() => handleInteract(match, 'liked')}
                        className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity"
                      >
                        <Heart className="w-3.5 h-3.5" /> Connect
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
