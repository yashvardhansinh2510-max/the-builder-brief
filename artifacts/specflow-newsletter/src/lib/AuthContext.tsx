import { useState, useEffect } from "react";
import { useUser, useAuth as useClerkAuth } from "@clerk/react";

const ADMIN_EMAILS = ["yashvardhan@specflowai.com", "yashvardhansinhjhala@gmail.com", "yashvardhanjhala@gmail.com"];
const PRO_EMAILS = ["yashvardhansinh2510@gmail.com"];

export type UserTier = "free" | "pro" | "max" | "incubator";

export interface AuthContextType {
  user: any;
  session: any;
  loading: boolean;
  tierLoading: boolean;
  tier: UserTier;
  isPremium: boolean;
  isAdmin: boolean;
  getToken: () => Promise<string | null>;
}

// Provides a Supabase-shaped user object backed by Clerk so existing code
// that accesses user.email, user.user_metadata.full_name, session.access_token
// continues to work without changes across all portal pages.
export function useAuth(): AuthContextType {
  const { user, isLoaded } = useUser();
  const { isSignedIn, getToken } = useClerkAuth();
  const [clerkToken, setClerkToken] = useState<string | null>(null);
  const [dbTier, setDbTier] = useState<UserTier | null>(null);
  const [tierLoading, setTierLoading] = useState(false);

  const email = user?.emailAddresses[0]?.emailAddress || "";

  useEffect(() => {
    if (isSignedIn) {
      getToken().then((t) => setClerkToken(t ?? null));
    } else {
      setClerkToken(null);
      setDbTier(null);
    }
  }, [isSignedIn, getToken]);

  useEffect(() => {
    if (isSignedIn && clerkToken) {
      setTierLoading(true);
      fetch("/api/subscribers/me", {
        headers: { "Authorization": `Bearer ${clerkToken}` }
      })
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data?.tier) setDbTier(data.tier as UserTier);
          setTierLoading(false);
        })
        .catch(() => setTierLoading(false));
    }
  }, [isSignedIn, clerkToken]);

  // Priority: DB tier > Admin list > Pro list > free
  let tier: UserTier = dbTier || "free";
  let isAdmin = false;

  if (ADMIN_EMAILS.includes(email)) {
    tier = dbTier || "max"; // DB tier takes priority, fallback to max for admin
    isAdmin = true;
  } else if (PRO_EMAILS.includes(email)) {
    tier = dbTier || "pro";
  }

  const isPremium = tier === "pro" || tier === "max" || tier === "incubator";
  const loading = !isLoaded;

  // Compat shim — mirrors the Supabase User shape that portal pages expect
  const compatUser = isSignedIn && user
    ? {
        id: user.id,
        email,
        user_metadata: {
          full_name: user.fullName || user.firstName || "",
          avatar_url: user.imageUrl,
        },
      }
    : null;

  return {
    user: compatUser,
    session: isSignedIn
      ? { user: compatUser, access_token: clerkToken }
      : null,
    loading,
    tierLoading,
    tier,
    isPremium,
    isAdmin,
    getToken,
  };
}
