import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";

export default function Marketplace() {
  const [newsletters, setNewsletters] = useState([]);
  const [filter, setFilter] = useState("trending");

  useEffect(() => {
    fetchNewsletters();
  }, [filter]);

  const fetchNewsletters = async () => {
    const res = await fetch(`/api/marketplace?sort=${filter}`);
    setNewsletters(await res.json());
  };

  return (
    <div className="min-h-screen bg-black py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">Creator Marketplace</h1>
          <p className="text-xl text-slate-300">Discover & subscribe to newsletters from founders shaping the future</p>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-12 overflow-x-auto pb-4">
          {["trending", "newest", "top-earnings", "raising"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-6 py-2 rounded-full whitespace-nowrap font-medium transition ${
                filter === f
                  ? "bg-blue-600 text-white"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              {f === "top-earnings" ? "Top Earnings" : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Newsletter Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {newsletters.map((newsletter: any) => (
            <div key={newsletter.id} className="bg-slate-900 rounded-lg overflow-hidden border border-slate-800 hover:border-blue-600 transition group cursor-pointer">
              {/* Newsletter Header */}
              <div className="h-32 bg-gradient-to-r from-blue-600 to-purple-600 relative">
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition bg-black/20" />
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-xl font-bold text-white">{newsletter.name}</h3>
                    <p className="text-slate-400 text-sm">by {newsletter.creatorName}</p>
                  </div>
                  {newsletter.isRaising && (
                    <span className="px-3 py-1 bg-green-900 text-green-200 text-xs font-semibold rounded-full">
                      Raising
                    </span>
                  )}
                </div>

                <p className="text-slate-300 text-sm mb-4">{newsletter.description}</p>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4 py-4 border-y border-slate-800">
                  <div>
                    <p className="text-slate-400 text-xs">Subscribers</p>
                    <p className="text-lg font-bold text-white">{newsletter.subscriberCount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs">Price</p>
                    <p className="text-lg font-bold text-white">${newsletter.price}/mo</p>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {newsletter.tags?.slice(0, 3).map((tag: string) => (
                    <span key={tag} className="px-2 py-1 bg-slate-800 text-slate-300 text-xs rounded">
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Action Button */}
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  {newsletter.isSubscribed ? "Manage" : "Subscribe"}
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {newsletters.length === 0 && (
          <div className="text-center py-20">
            <p className="text-slate-400 text-lg">No newsletters found. Check back soon!</p>
          </div>
        )}
      </div>
    </div>
  );
}
