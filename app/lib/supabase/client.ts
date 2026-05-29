"use client";

import { createBrowserClient } from "@supabase/ssr";
import { createMockSupabaseClient } from "./mock";
import { type SupabaseClient } from "@supabase/supabase-js";

export function createClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    console.warn("Supabase credentials missing. Using mock client.");
    return createMockSupabaseClient() as SupabaseClient;
  }

  return createBrowserClient(url!, anonKey!);
}


