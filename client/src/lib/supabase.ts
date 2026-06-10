/**
 * Supabase client singleton.
 *
 * Environment variables are read from Vite's import.meta.env.
 * Set them in a .env file (or Vercel / Manus project settings):
 *
 *   VITE_SUPABASE_URL=https://your-project.supabase.co
 *   VITE_SUPABASE_ANON_KEY=your-anon-key
 */

import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

// ---------------------------------------------------------------------------
// Supabase project credentials.
// These fall back to the hardcoded values so the app works in the Manus
// preview environment without needing a .env file.
// For Vercel / other hosts, set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
// as environment variables and the fallbacks below will be ignored.
// ---------------------------------------------------------------------------
const SUPABASE_URL = "https://cfkvfmdjbeyemencgbxx.supabase.co";
const SUPABASE_ANON_KEY =
  "sb_publishable_c9Y0kf7TAMPbLilyo-15EA_XyXMT2A3";

const supabaseUrl =
  (import.meta.env.VITE_SUPABASE_URL as string | undefined) || SUPABASE_URL;
const supabaseAnonKey =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ||
  SUPABASE_ANON_KEY;

export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);
