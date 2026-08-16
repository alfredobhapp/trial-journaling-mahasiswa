
CREATE TYPE public.ews_status AS ENUM ('normal', 'akademik', 'konseling');
CREATE TYPE public.profile_type AS ENUM ('awal', 'akhir');

CREATE TABLE public.journal_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_nim TEXT NOT NULL,
  student_name TEXT NOT NULL,
  profile_type public.profile_type NOT NULL,
  semester INTEGER,
  thesis_stage TEXT,
  moods TEXT[] NOT NULL DEFAULT '{}',
  enthusiasm INTEGER,
  burden TEXT,
  dosen TEXT,
  hambatan TEXT[] NOT NULL DEFAULT '{}',
  sleep TEXT,
  physical TEXT[] NOT NULL DEFAULT '{}',
  help_need TEXT,
  contact TEXT,
  ews_result public.ews_status NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.journal_entries TO anon, authenticated;
GRANT ALL ON public.journal_entries TO service_role;

ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert journal entries (demo)"
  ON public.journal_entries FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can read journal entries (demo)"
  ON public.journal_entries FOR SELECT
  TO anon, authenticated
  USING (true);
