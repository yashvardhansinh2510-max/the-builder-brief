import logoPath from "@assets/logo.jpg";

export default function PortalSkeleton() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Primary Nav shell */}
      <nav className="border-b border-border/40 py-4 px-6 md:px-12 flex justify-between items-center sticky top-0 bg-background/80 backdrop-blur-xl z-50">
        <div className="flex items-center gap-3">
          <img src={logoPath} alt="The Build Brief" className="w-8 h-8 rounded-sm object-cover opacity-50" />
          <span className="font-serif text-xl font-medium tracking-tight text-foreground/50">The Build Brief</span>
        </div>
        <div className="w-8 h-8 rounded-full bg-card/40 animate-pulse" />
      </nav>

      {/* Secondary Nav shell */}
      <div className="border-b border-border/20 bg-card/30 px-6 md:px-12 py-2.5 flex items-center gap-2 sticky top-[57px] z-40 backdrop-blur-xl">
        <div className="w-24 h-7 rounded-full bg-card/60 animate-pulse" />
        <div className="w-20 h-7 rounded-full bg-card/40 animate-pulse" />
      </div>

      {/* Body placeholder */}
      <main className="max-w-6xl mx-auto px-6 pt-16 pb-28 space-y-8">
        <div className="space-y-4">
          <div className="w-48 h-4 rounded-full bg-card/60 animate-pulse" />
          <div className="w-96 h-12 rounded-2xl bg-card/50 animate-pulse" />
          <div className="w-72 h-5 rounded-full bg-card/40 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 rounded-2xl bg-card/40 animate-pulse" />
          ))}
        </div>
        <div className="h-64 rounded-2xl bg-card/30 animate-pulse" />
      </main>
    </div>
  );
}
