import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
export function getSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "Supabase credentials not configured. Please set SUPABASE_URL and SUPABASE_ANON_KEY environment variables."
    );
  }

  return createClient(supabaseUrl, supabaseKey);
}




