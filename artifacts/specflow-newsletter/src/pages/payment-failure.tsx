import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import PortalNav from '@/components/PortalNav';

export default function PaymentFailure() {
  return (
    <div className="min-h-screen bg-background">
      <PortalNav activePage="dashboard" />
      <main className="max-w-2xl mx-auto px-6 py-32 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 mb-6">
          <AlertCircle className="w-8 h-8 text-destructive" />
        </div>
        <h1 className="font-serif text-4xl mb-4">Payment didn't go through</h1>
        <p className="text-muted-foreground mb-8">
          Your card wasn't charged. Try again, or reach out if the problem persists.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/pricing">
            <Button variant="default" className="rounded-full">
              Try Again
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline" className="rounded-full">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
