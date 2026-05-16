import { useState, useEffect } from "react";
import { useUser, useAuth as useClerkAuth } from "@clerk/react";
import { useQuery } from "@tanstack/react-query";

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
  onboardingComplete: boolean;
  onboardingChecked: boolean;
  getToken: () => Promise<string | null>;
}

// Provides a Supabase-shaped user object backed by Clerk so existing code
// that accesses user.email, user.user_metadata.full_name, session.access_token
// continues to work without changes across all portal pages.
export function useAuth(): AuthContextType {
  const { user, isLoaded } = useUser();
  const { isSignedIn, getToken } = useClerkAuth();
  const [clerkToken, setClerkToken] = useState<string | null>(null);

  const email = user?.emailAddresses[0]?.emailAddress || "";

  useEffect(() => {
    if (isSignedIn) {
      getToken().then((t) => setClerkToken(t ?? null));
    } else {
      setClerkToken(null);
    }
  }, [isSignedIn, getToken]);

  const {
    data: subscriberData,
    isLoading: tierLoading,
    isFetched,
  } = useQuery({
    queryKey: ["subscriber", clerkToken],
    queryFn: () =>
      fetch("/api/subscribers/me", {
        headers: { Authorization: `Bearer ${clerkToken}` },
      }).then((res) => (res.ok ? res.json() : null)),
    enabled: !!clerkToken && isSignedIn === true,
    staleTime: 5 * 60 * 1000,
  });

  const dbTier = (subscriberData?.tier as UserTier) ?? null;
  const dbIsAdmin = subscriberData?.isAdmin || false;
  const onboardingComplete = subscriberData?.portalState?.onboardingComplete === true;
  const onboardingChecked = isSignedIn ? isFetched : false;

  const tier: UserTier = dbTier || "free";
  const isPremium = tier === "pro" || tier === "max" || tier === "incubator";
  const loading = !isLoaded;

  // Compat shim — mirrors the Supabase User shape that portal pages expect
  const compatUser =
    isSignedIn && user
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
    session:
      isSignedIn && compatUser
        ? { user: compatUser, access_token: clerkToken }
        : null,
    loading,
    tierLoading,
    tier,
    isPremium,
    isAdmin: dbIsAdmin,
    onboardingComplete,
    onboardingChecked,
    getToken,
  };
}
