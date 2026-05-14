import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import PortalNav from "@/components/PortalNav";
import Footer from "@/components/Footer";

interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  contentUrl: string | null;
  isActive: boolean;
}

export default function Marketplace() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/marketplace/products")
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setProducts(Array.isArray(data) ? data : []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <PortalNav activePage="dashboard" />

      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 md:px-12">
        <div className="mb-12">
          <h1 className="font-serif text-5xl mb-4">Builder Marketplace</h1>
          <p className="text-xl text-muted-foreground">
            Tools, templates, and resources curated for founders who ship.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="border border-border rounded-2xl p-6 space-y-4">
                <Skeleton className="h-32 w-full rounded-lg" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-lg font-medium mb-2">No products yet.</p>
            <p className="text-sm">Check back soon — more tools dropping every week.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-card rounded-2xl overflow-hidden border border-border hover:border-primary/40 transition-all hover:shadow-lg group"
              >
                <div className="h-32 bg-gradient-to-br from-primary/20 to-primary/5" />
                <div className="p-6">
                  <h3 className="font-serif text-xl mb-2">{product.name}</h3>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{product.description}</p>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-bold text-lg">
                      {parseFloat(product.price) === 0 ? "Free" : `$${product.price}`}
                    </span>
                  </div>
                  <Button
                    className="w-full rounded-full"
                    onClick={() => product.contentUrl && window.open(product.contentUrl, "_blank")}
                    disabled={!product.contentUrl}
                  >
                    Get Access
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
