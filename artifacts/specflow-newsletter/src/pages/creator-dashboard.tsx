import { useState, useEffect } from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Button } from "../components/ui/button";

export default function CreatorDashboard() {
  const [earnings, setEarnings] = useState<any>(null);
  const [timeframe, setTimeframe] = useState("3m");

  useEffect(() => {
    fetchEarnings();
  }, []);

  const fetchEarnings = async () => {
    const res = await fetch("/api/earnings/dashboard", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    setEarnings(await res.json());
  };

  if (!earnings) return <div className="p-8">Loading...</div>;

  const { totalRevenue, referralTier, annualizedRevenue } = earnings;

  return (
    <div className="min-h-screen bg-black p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-12">Creator Hub</h1>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-lg p-6">
            <p className="text-blue-200 text-sm font-medium">Total Revenue</p>
            <p className="text-4xl font-bold text-white mt-2">${totalRevenue.toLocaleString()}</p>
            <p className="text-blue-300 text-xs mt-2">All time</p>
          </div>
          <div className="bg-gradient-to-br from-green-900 to-green-800 rounded-lg p-6">
            <p className="text-green-200 text-sm font-medium">Annual Revenue Run Rate</p>
            <p className="text-4xl font-bold text-white mt-2">${annualizedRevenue.toLocaleString()}</p>
            <p className="text-green-300 text-xs mt-2">Based on MRR</p>
          </div>
          <div className="bg-gradient-to-br from-purple-900 to-purple-800 rounded-lg p-6">
            <p className="text-purple-200 text-sm font-medium">Referral Tier</p>
            <p className="text-3xl font-bold text-white mt-2 uppercase">{referralTier?.tier || "Bronze"}</p>
            <p className="text-purple-300 text-xs mt-2">{referralTier?.commissionRate}% commission</p>
          </div>
          <div className="bg-gradient-to-br from-orange-900 to-orange-800 rounded-lg p-6">
            <p className="text-orange-200 text-sm font-medium">Active Subscribers</p>
            <p className="text-4xl font-bold text-white mt-2">{earnings.activeSubscribers || 0}</p>
            <p className="text-orange-300 text-xs mt-2">Paying subscribers</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div className="bg-slate-900 rounded-lg p-6 border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-4">Revenue Trend</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={earnings.earnings?.slice(-6) || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }} />
                <Line type="monotone" dataKey="totalRevenue" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-slate-900 rounded-lg p-6 border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-4">Revenue Breakdown</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={earnings.earnings?.slice(-6) || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }} />
                <Bar dataKey="subscriberFees" fill="#10b981" />
                <Bar dataKey="referralBonuses" fill="#f59e0b" />
                <Bar dataKey="marketplaceShares" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payout Section */}
        <div className="bg-slate-900 rounded-lg p-8 border border-slate-700">
          <h2 className="text-2xl font-bold text-white mb-6">Manage Payouts</h2>
          <div className="bg-slate-800 rounded p-4 mb-6 border border-slate-700">
            <p className="text-slate-300">Available Balance</p>
            <p className="text-3xl font-bold text-white mt-2">$0.00</p>
            <p className="text-slate-400 text-sm mt-2">Next payout: Processing monthly on the 15th</p>
          </div>
          <div className="flex gap-4">
            <Button className="bg-blue-600 hover:bg-blue-700">Request Payout</Button>
            <Button className="bg-slate-700 hover:bg-slate-600" variant="outline">View Payout History</Button>
          </div>
        </div>

        {/* Marketplace Section */}
        <div className="mt-12 bg-slate-900 rounded-lg p-8 border border-slate-700">
          <h2 className="text-2xl font-bold text-white mb-6">Monetization Settings</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-white font-medium mb-2">Subscription Price</label>
              <div className="flex gap-2">
                <span className="flex items-center text-slate-400">$</span>
                <input
                  type="number"
                  placeholder="9.99"
                  className="flex-1 bg-slate-800 text-white px-4 py-2 rounded border border-slate-700"
                />
                <span className="flex items-center text-slate-400">/month</span>
              </div>
            </div>
            <Button className="bg-emerald-600 hover:bg-emerald-700 w-full">Save Settings</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
