-- ============================================================
-- 1. Buat table portfolio (kalau belum ada)
-- ============================================================
CREATE TABLE IF NOT EXISTS portfolio (
  id INTEGER PRIMARY KEY DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 2. Tambah kolom yang mungkin belum ada (migration)
-- ============================================================
ALTER TABLE portfolio ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE portfolio ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE portfolio ADD COLUMN IF NOT EXISTS hero_description TEXT;
ALTER TABLE portfolio ADD COLUMN IF NOT EXISTS hero_photo TEXT;
ALTER TABLE portfolio ADD COLUMN IF NOT EXISTS about_title TEXT;
ALTER TABLE portfolio ADD COLUMN IF NOT EXISTS about_text TEXT;
ALTER TABLE portfolio ADD COLUMN IF NOT EXISTS about_photo TEXT;
ALTER TABLE portfolio ADD COLUMN IF NOT EXISTS github_username TEXT;
ALTER TABLE portfolio ADD COLUMN IF NOT EXISTS projects JSONB DEFAULT '[]'::jsonb;
ALTER TABLE portfolio ADD COLUMN IF NOT EXISTS skills JSONB DEFAULT '[]'::jsonb;
ALTER TABLE portfolio ADD COLUMN IF NOT EXISTS socials JSONB DEFAULT '[]'::jsonb;

-- ============================================================
-- 3. Insert baris default jika belum ada
-- ============================================================
INSERT INTO portfolio (id)
VALUES (1)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 4. RLS: izinkan anon public SELECT dan UPSERT
-- ============================================================
ALTER TABLE portfolio ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select" ON portfolio;
CREATE POLICY "anon_select" ON portfolio
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "anon_upsert" ON portfolio;
CREATE POLICY "anon_upsert" ON portfolio
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update" ON portfolio;
CREATE POLICY "anon_update" ON portfolio
  FOR UPDATE USING (true);

-- ============================================================
-- 5. Buat storage bucket portfolio-assets (public)
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('portfolio-assets', 'portfolio-assets', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 6. RLS storage: izinkan anon upload & download
-- ============================================================
DROP POLICY IF EXISTS "anon_upload" ON storage.objects;
CREATE POLICY "anon_upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'portfolio-assets');

DROP POLICY IF EXISTS "anon_select_storage" ON storage.objects;
CREATE POLICY "anon_select_storage" ON storage.objects
  FOR SELECT USING (bucket_id = 'portfolio-assets');

DROP POLICY IF EXISTS "anon_delete_storage" ON storage.objects;
CREATE POLICY "anon_delete_storage" ON storage.objects
  FOR DELETE USING (bucket_id = 'portfolio-assets');
