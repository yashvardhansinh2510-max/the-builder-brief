import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { Redirect, useLocation } from 'wouter';
import { ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { TierGate } from '@/components/TierGate';
import PortalNav from '@/components/PortalNav';
import { issues } from '@/lib/data';

interface FormErrors {
  mrr?: string;
  arr?: string;
  users?: string;
  monthsSinceLaunch?: string;
  growthRate?: string;
  notes?: string;
  submit?: string;
}

export default function CreatorTractionPage() {
  const { user, loading: authLoading, session } = useAuth();
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [success, setSuccess] = useState(false);

  // Get creator's featured blueprint (first one or most recent)
  const featuredBlueprint = issues[0];

  const [formData, setFormData] = useState({
    mrr: '',
    arr: '',
    users: '',
    monthsSinceLaunch: '',
    growthRate: '',
    notes: '',
  });

  // Pre-fill if traction data exists
  useEffect(() => {
    if (featuredBlueprint?.traction?.status === 'added') {
      setFormData({
        mrr: featuredBlueprint.traction.mrr?.toString() || '',
        arr: featuredBlueprint.traction.arr?.toString() || '',
        users: featuredBlueprint.traction.users?.toString() || '',
        monthsSinceLaunch: featuredBlueprint.traction.monthsSinceLaunch?.toString() || '',
        growthRate: featuredBlueprint.traction.growthRate?.toString() || '',
        notes: featuredBlueprint.traction.notes || '',
      });
    }
  }, [featuredBlueprint]);

  if (authLoading) return null;
  if (!authLoading && !user) return <Redirect to="/sign-in" />;

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.monthsSinceLaunch) {
      newErrors.monthsSinceLaunch = 'Months since launch is required';
    } else if (isNaN(parseInt(formData.monthsSinceLaunch)) || parseInt(formData.monthsSinceLaunch) < 1) {
      newErrors.monthsSinceLaunch = 'Must be an integer >= 1';
    }

    if (formData.growthRate) {
      const rate = parseFloat(formData.growthRate);
      if (isNaN(rate) || rate < 0 || rate > 100) {
        newErrors.growthRate = 'Growth rate must be 0-100%';
      }
    }

    if (!formData.mrr && !formData.arr && !formData.users) {
      newErrors.submit = 'Provide at least one metric (MRR, ARR, or user count)';
    }

    if (formData.notes && formData.notes.length > 500) {
      newErrors.notes = 'Notes must be max 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !featuredBlueprint) return;

    setLoading(true);
    setErrors({});

    try {
      const payload: any = {
        monthsSinceLaunch: parseInt(formData.monthsSinceLaunch),
      };

      if (formData.mrr) payload.mrr = parseFloat(formData.mrr);
      if (formData.arr) payload.arr = parseFloat(formData.arr);
      if (formData.users) payload.users = parseInt(formData.users);
      if (formData.growthRate) payload.growthRate = parseFloat(formData.growthRate);
      if (formData.notes) payload.notes = formData.notes;

      const res = await fetch(`/api/blueprints/${featuredBlueprint.slug}/traction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const error = await res.json();
        setErrors({ submit: error.message || 'Failed to save traction data' });
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        setLocation(`/issue/${featuredBlueprint.slug}`);
      }, 1500);
    } catch (err) {
      setErrors({ submit: 'An error occurred while saving' });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <PortalNav activePage="dashboard" />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-20">
        <TierGate requiredTier="pro">
          <Button variant="ghost" className="mb-8" onClick={() => setLocation('/creator-dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Creator Hub
          </Button>

          <div className="mb-12">
            <h1 className="font-serif text-4xl mb-2">Add Traction to Your Blueprint</h1>
            <p className="text-lg text-muted-foreground">
              Share real revenue and user metrics to prove execution and build credibility.
            </p>
          </div>

          {featuredBlueprint && (
            <Card className="p-8 mb-8 bg-muted/30 border-border">
              <p className="text-sm text-muted-foreground uppercase font-bold mb-2">Featured Blueprint</p>
              <h2 className="font-serif text-2xl text-foreground">{featuredBlueprint.title}</h2>
            </Card>
          )}

          {success && (
            <div className="flex items-center gap-3 p-4 mb-6 bg-green-50 border border-green-200 rounded-lg text-green-900">
              <CheckCircle className="w-5 h-5" />
              <span>Traction updated successfully! Redirecting...</span>
            </div>
          )}

          {errors.submit && (
            <div className="flex items-center gap-3 p-4 mb-6 bg-red-50 border border-red-200 rounded-lg text-red-900">
              <AlertCircle className="w-5 h-5" />
              <span>{errors.submit}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-foreground mb-2">
                  Monthly Recurring Revenue (USD)
                </label>
                <Input
                  type="number"
                  value={formData.mrr}
                  onChange={(e) => setFormData({ ...formData, mrr: e.target.value })}
                  placeholder="5000"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-foreground mb-2">
                  Annual Recurring Revenue (USD)
                </label>
                <Input
                  type="number"
                  value={formData.arr}
                  onChange={(e) => setFormData({ ...formData, arr: e.target.value })}
                  placeholder="60000"
                  className="w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-foreground mb-2">
                  Active Users/Customers
                </label>
                <Input
                  type="number"
                  value={formData.users}
                  onChange={(e) => setFormData({ ...formData, users: e.target.value })}
                  placeholder="150"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-foreground mb-2">
                  Months Since Launch <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  value={formData.monthsSinceLaunch}
                  onChange={(e) => setFormData({ ...formData, monthsSinceLaunch: e.target.value })}
                  placeholder="8"
                  className="w-full"
                  required
                />
                {errors.monthsSinceLaunch && (
                  <p className="text-red-600 text-xs mt-1">{errors.monthsSinceLaunch}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-foreground mb-2">
                Month-over-Month Growth Rate (%)
              </label>
              <Input
                type="number"
                value={formData.growthRate}
                onChange={(e) => setFormData({ ...formData, growthRate: e.target.value })}
                placeholder="12"
                min="0"
                max="100"
                className="w-full"
              />
              {errors.growthRate && (
                <p className="text-red-600 text-xs mt-1">{errors.growthRate}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-foreground mb-2">
                Notes (max 500 characters)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Share your growth story..."
                maxLength={500}
                className="w-full p-3 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                rows={4}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {formData.notes.length}/500
              </p>
            </div>

            {featuredBlueprint?.traction?.lastUpdated && (
              <p className="text-xs text-muted-foreground">
                Last updated: {new Date(featuredBlueprint.traction.lastUpdated).toLocaleDateString()}
              </p>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setLocation('/creator-dashboard')}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Traction Data'}
              </Button>
            </div>
          </form>
        </TierGate>
      </main>
    </div>
  );
}
