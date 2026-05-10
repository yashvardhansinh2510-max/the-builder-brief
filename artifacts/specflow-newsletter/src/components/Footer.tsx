import { Link } from 'wouter';
import { Button } from '@/components/ui/button';

interface FooterProps {
  variant?: 'public' | 'authenticated';
}

export default function Footer({ variant = 'public' }: FooterProps) {
  return (
    <footer className="border-t border-border py-12 px-6 bg-card">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <Link href="/">
              <span className="font-serif text-lg text-foreground cursor-pointer hover:text-primary transition-colors">
                The Build Brief
              </span>
            </Link>
            <p className="text-sm text-muted-foreground mt-2">
              Deep-tech startup blueprints. From idea to first revenue.
            </p>
          </div>

          {/* Execution Hub */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Execution Hub</p>
            <div className="space-y-2.5">
              <Link href="/blueprints" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Blueprints
              </Link>
              <Link href="/archive" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Vault Archive
              </Link>
              <Link href="/idea-agent" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Idea Agent
              </Link>
            </div>
          </div>

          {/* Resources */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Resources</p>
            <div className="space-y-2.5">
              <Link href="/about" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                About
              </Link>
              <Link href="/build-brief" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Build Brief
              </Link>
              <Link href="/daily-drops" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Daily Drops
              </Link>
            </div>
          </div>

          {/* Platform */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Creators & Investors</p>
            <div className="space-y-2.5">
              <Link href="/creator-dashboard" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Creator Tools
              </Link>
              <Link href="/investor-portal" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Investor Portal
              </Link>
              <Link href="/marketplace" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Marketplace
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} The Build Brief. All rights reserved.</p>
          <Button variant="outline" className="rounded-full border-border text-sm px-6">
            Contact
          </Button>
        </div>
      </div>
    </footer>
  );
}
