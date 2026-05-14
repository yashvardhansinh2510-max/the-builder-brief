import { useState, useEffect } from "react";
import { useUser, useAuth as useClerkAuth } from "@clerk/react";

export type UserTier = "free" | "pro" | "max" | "incubator";

export interface CompatUser {
  id: string;
  email: string;
  user_metadata: { full_name: string; avatar_url: string };
}

export interface AuthContextType {
  user: CompatUser | null;
  session: { user: CompatUser; access_token: string | null } | null;
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
  const [dbIsAdmin, setDbIsAdmin] = useState(false);
  const [tierLoading, setTierLoading] = useState(false);

  const email = user?.emailAddresses[0]?.emailAddress || "";

  useEffect(() => {
    if (isSignedIn) {
      getToken().then((t) => setClerkToken(t ?? null));
    } else {
      setClerkToken(null);
      setDbTier(null);
      setDbIsAdmin(false);
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
          setDbIsAdmin(data?.isAdmin || false);
          setTierLoading(false);
        })
        .catch(() => setTierLoading(false));
    }
  }, [isSignedIn, clerkToken]);

  let tier: UserTier = dbTier || "free";
  const isAdmin = dbIsAdmin;

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
    session: isSignedIn && compatUser
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
