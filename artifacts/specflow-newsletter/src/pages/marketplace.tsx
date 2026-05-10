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
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <h1 className="text-5xl font-bold text-foreground mb-4">Creator Marketplace</h1>
          <p className="text-xl text-muted-foreground">Discover & subscribe to newsletters from founders shaping the future</p>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-12 overflow-x-auto pb-4">
          {["trending", "newest", "top-earnings", "raising"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-6 py-2 rounded-full whitespace-nowrap font-medium transition ${
                filter === f
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {f === "top-earnings" ? "Top Earnings" : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Newsletter Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {newsletters.map((newsletter: any) => (
            <div key={newsletter.id} className="bg-card rounded-2xl overflow-hidden border border-border hover:border-primary/50 transition group cursor-pointer">
              {/* Newsletter Header */}
              <div className="h-32 bg-gradient-to-r from-primary to-primary/60 relative">
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition bg-foreground/10" />
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-xl font-bold text-foreground">{newsletter.name}</h3>
                    <p className="text-muted-foreground text-sm">by {newsletter.creatorName}</p>
                  </div>
                  {newsletter.isRaising && (
                    <span className="px-3 py-1 bg-green-900 text-green-200 text-xs font-semibold rounded-full">
                      Raising
                    </span>
                  )}
                </div>

                <p className="text-muted-foreground text-sm mb-4">{newsletter.description}</p>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4 py-4 border-y border-border">
                  <div>
                    <p className="text-muted-foreground text-xs">Subscribers</p>
                    <p className="text-lg font-bold text-foreground">{newsletter.subscriberCount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Price</p>
                    <p className="text-lg font-bold text-foreground">${newsletter.price}/mo</p>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {newsletter.tags?.slice(0, 3).map((tag: string) => (
                    <span key={tag} className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-lg">
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Action Button */}
                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                  {newsletter.isSubscribed ? "Manage" : "Subscribe"}
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {newsletters.length === 0 && (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">No newsletters found. Check back soon!</p>
          </div>
        )}
      </div>
    </div>
  );
}
