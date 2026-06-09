import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let client = null;
if (supabaseUrl && supabaseAnonKey) {
  client = createClient(supabaseUrl, supabaseAnonKey);
}

export const supabase = client;

export async function fetchPortfolio() {
  if (!supabase) return null;
  const { data, error } = await supabase.from('portfolio').select('*').eq('id', 1).single();
  if (error || !data) return null;
  return data;
}

export async function savePortfolio(about, projects, socials) {
  if (!supabase) return false;
  const { error } = await supabase.from('portfolio').upsert(
    { id: 1, about, projects, socials },
  );
  return !error;
}
