CREATE TYPE public.referral_status AS ENUM ('belum', 'dirujuk');

ALTER TABLE public.journal_entries
  ADD COLUMN referral_status public.referral_status NOT NULL DEFAULT 'belum',
  ADD COLUMN referred_at timestamptz;

CREATE POLICY "Anyone can update journal entries (demo)"
  ON public.journal_entries FOR UPDATE
  TO anon, authenticated
  USING (true) WITH CHECK (true);

CREATE TABLE public.journal_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  journal_id uuid NOT NULL REFERENCES public.journal_entries(id) ON DELETE CASCADE,
  reviewer_name text NOT NULL DEFAULT 'Reviewer',
  reviewer_role text NOT NULL DEFAULT 'dosen',
  note text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.journal_reviews TO anon, authenticated;
GRANT ALL ON public.journal_reviews TO service_role;

ALTER TABLE public.journal_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read journal reviews (demo)"
  ON public.journal_reviews FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Anyone can insert journal reviews (demo)"
  ON public.journal_reviews FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE INDEX journal_reviews_journal_id_idx ON public.journal_reviews(journal_id);