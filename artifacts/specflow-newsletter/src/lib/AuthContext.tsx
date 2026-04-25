import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "./supabase";

const ADMIN_EMAILS = ["yashvardhan@specflowai.com", "yashvardhansinhjhala@gmail.com", "yashvardhanjhala@gmail.com"];
const PRO_EMAILS = ["yashvardhansinh2510@gmail.com"];

export type UserTier = "free" | "pro" | "max" | "incubator";

export interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  tierLoading: boolean;
  tier: UserTier;
  isPremium: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
  tierLoading: true,
  tier: "free",
  isPremium: false,
  isAdmin: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [tierLoading, setTierLoading] = useState(true);
  const [tier, setTier] = useState<UserTier>("free");
  const [isAdmin, setIsAdmin] = useState(false);

  const resolveTier = async (email: string) => {
    try {
      if (ADMIN_EMAILS.includes(email)) {
        setTier("max");
        setIsAdmin(true);
        setTierLoading(false);
        return;
      }
      if (PRO_EMAILS.includes(email)) {
        setTier("pro");
        setTierLoading(false);
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      const res = await fetch(`/api/subscribers/me`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (!res.ok) {
        setTier("free");
        setIsAdmin(false);
      } else {
        const data = await res.json();
        setTier(data.tier as UserTier || "free");
        setIsAdmin(!!data.isAdmin);
      }
    } catch (err) {
      console.error("Failed to fetch user tier:", err);
      setTier("free");
    } finally {
      setTierLoading(false);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user?.email) {
        resolveTier(session.user.email);
      } else {
        setTierLoading(false);
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      if (event === "SIGNED_IN" || event === "INITIAL_SESSION") {
        if (session?.user?.email) {
          resolveTier(session.user.email);
        } else {
          setTier("free");
          setTierLoading(false);
        }
      } else if (event === "SIGNED_OUT") {
        setTier("free");
        setIsAdmin(false);
        setTierLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const isPremium = tier === "pro" || tier === "max" || tier === "incubator";

  return (
    <AuthContext.Provider value={{ session, user, loading, tierLoading, tier, isPremium, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
