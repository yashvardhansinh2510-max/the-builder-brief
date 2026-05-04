import { Link } from "wouter";
import { useAuth } from "@clerk/react";
import { Button } from "@/components/ui/button";
import logoPath from "@assets/logo.jpg";

export default function PublicNav({ activePage }: { activePage?: string }) {
  const { isSignedIn } = useAuth();

  return (
    <nav className="border-b border-border/40 py-4 px-6 md:px-12 flex justify-between items-center sticky top-0 bg-background/90 backdrop-blur-md z-50">
      <Link href="/" className="flex items-center gap-3">
        <img src={logoPath} alt="The Build Brief" className="w-8 h-8 rounded-sm object-cover" />
        <span className="font-serif text-xl font-medium tracking-tight">The Build Brief</span>
      </Link>
      
      <div className="flex items-center gap-6">
        <Link href="/blueprints" className={`hidden md:block text-sm transition-colors ${activePage === 'blueprints' ? 'text-foreground font-semibold' : 'text-muted-foreground hover:text-foreground'}`}>
          Execution Hub
        </Link>
        <Link href="/archive" className={`hidden md:block text-sm transition-colors ${activePage === 'archive' ? 'text-foreground font-semibold' : 'text-muted-foreground hover:text-foreground'}`}>
          Archive
        </Link>
        
        {isSignedIn ? (
          <Link href="/dashboard" className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">
            Dashboard
          </Link>
        ) : (
          <Link href="/sign-up">
            <Button
              variant="default"
              className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-6 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Subscribe
            </Button>
          </Link>
        )}
      </div>
    </nav>
  );
}
