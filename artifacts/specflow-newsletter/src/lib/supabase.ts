import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set in .env!");
}

export const supabase = createClient(
  supabaseUrl || "https://placeholder-url.supabase.co",
  supabaseAnonKey || "placeholder-key"
);

// For database queries only - use with Clerk JWT tokens
export const getSupabaseClient = (clerkToken?: string) => {
  if (clerkToken) {
    return createClient(
      supabaseUrl || "https://placeholder-url.supabase.co",
      supabaseAnonKey || "placeholder-key",
      {
        global: {
          headers: {
            Authorization: `Bearer ${clerkToken}`,
          },
        },
      }
    );
  }
  return supabase;
};
