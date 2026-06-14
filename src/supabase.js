import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let client = null;
if (supabaseUrl && supabaseAnonKey) {
  client = createClient(supabaseUrl, supabaseAnonKey);
}

export const supabase = client;

// Fungsi baru untuk unggah foto
export async function uploadImage(file) {
  if (!supabase) {
    console.error('Supabase client tidak tersedia. Cek VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY di .env');
    return null;
  }
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

  const { error } = await supabase.storage
    .from('portfolio-assets')
    .upload(fileName, file, { upsert: true });

  if (error) {
    console.error('Upload Error:', error);
    return null;
  }

  const { data: publicUrlData } = supabase.storage
    .from('portfolio-assets')
    .getPublicUrl(fileName);

  return publicUrlData.publicUrl;
}

export async function fetchPortfolio() {
  if (!supabase) return { error: 'Supabase client not initialized' };
  const { data, error } = await supabase.from('portfolio').select('*').eq('id', 1).maybeSingle();
  if (error) {
    console.error('fetchPortfolio Error:', error);
    return { error: error.message || JSON.stringify(error) };
  }
  return data || {};
}

export async function savePortfolio(portfolioData) {
  if (!supabase) return { error: 'Supabase client not initialized' };
  const { data, error } = await supabase.from('portfolio').upsert(
    { id: 1, ...portfolioData },
  ).select().maybeSingle();
  if (error) {
    console.error('savePortfolio Error:', error);
    return { error: error.message || JSON.stringify(error) };
  }
  return { data };
}
