import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col items-center justify-center px-6 text-center">
      <p className="font-serif text-8xl md:text-9xl text-primary/20 mb-6 leading-none">404</p>
      <h1 className="font-serif text-3xl md:text-4xl mb-3">This page doesn't exist.</h1>
      <p className="text-muted-foreground mb-8 max-w-xs">
        The link might be broken, or the page may have moved.
      </p>
      <Button className="rounded-full px-8 h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium" asChild>
        <Link href="/">Go home</Link>
      </Button>
    </div>
  );
}
