import { useState, useEffect } from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/AuthContext";
import PortalNav from "@/components/PortalNav";
import Footer from "@/components/Footer";

interface EarningsRow {
  month: string;
  totalRevenue: string;
  subscriberFees?: string;
  referralBonuses?: string;
  marketplaceShares?: string;
}

interface EarningsDashboard {
  totalRevenue: number;
  earnings: EarningsRow[];
  payouts: unknown[];
  referralTier: { tier: string; commissionRate: string } | null;
}

export default function CreatorDashboard() {
  const { session } = useAuth();
  const [data, setData] = useState<EarningsDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = session?.access_token;
    if (!token) { setLoading(false); return; }
    fetch("/api/earnings/dashboard", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setData(d))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [session?.access_token]);

  const totalRevenue = data?.totalRevenue ?? 0;
  const referralTier = data?.referralTier;
  const recentEarnings = data?.earnings?.slice(-6) ?? [];

  return (
    <div className="min-h-screen bg-background">
      <PortalNav activePage="dashboard" />

      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 md:px-12">
        <h1 className="font-serif text-4xl mb-12">Creator Hub</h1>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border border-border rounded-2xl p-6 space-y-3">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-3 w-20" />
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="border border-border rounded-2xl p-6 bg-card">
                <p className="text-sm text-muted-foreground font-medium">Total Revenue</p>
                <p className="text-4xl font-bold mt-2">${totalRevenue.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-2">All time</p>
              </div>
              <div className="border border-border rounded-2xl p-6 bg-card">
                <p className="text-sm text-muted-foreground font-medium">Referral Tier</p>
                <p className="text-3xl font-bold mt-2 uppercase text-primary">{referralTier?.tier || "Bronze"}</p>
                <p className="text-xs text-muted-foreground mt-2">{referralTier?.commissionRate ?? "0"}% commission</p>
              </div>
              <div className="border border-primary/20 rounded-2xl p-6 bg-primary/5">
                <p className="text-sm text-muted-foreground font-medium">Available Balance</p>
                <p className="text-4xl font-bold mt-2">$0.00</p>
                <p className="text-xs text-muted-foreground mt-2">Pays monthly on the 15th</p>
              </div>
            </div>

            {recentEarnings.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                <div className="border border-border rounded-2xl p-6 bg-card">
                  <h2 className="font-serif text-xl mb-4">Revenue Trend</h2>
                  <ResponsiveContainer width="100%" height={260}>
                    <LineChart data={recentEarnings}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} />
                      <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                          color: "hsl(var(--foreground))",
                        }}
                      />
                      <Line type="monotone" dataKey="totalRevenue" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="border border-border rounded-2xl p-6 bg-card">
                  <h2 className="font-serif text-xl mb-4">Revenue Breakdown</h2>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={recentEarnings}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} />
                      <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                          color: "hsl(var(--foreground))",
                        }}
                      />
                      <Bar dataKey="subscriberFees" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="referralBonuses" fill="hsl(var(--primary) / 0.6)" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="marketplaceShares" fill="hsl(var(--primary) / 0.3)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            <div className="border border-border rounded-2xl p-8 bg-card">
              <h2 className="font-serif text-2xl mb-6">Manage Payouts</h2>
              <div className="flex gap-4">
                <Button className="rounded-full">Request Payout</Button>
                <Button variant="outline" className="rounded-full">View Payout History</Button>
              </div>
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
