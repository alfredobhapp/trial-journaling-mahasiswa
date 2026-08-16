DO $$ BEGIN
  CREATE TYPE public.referral_target AS ENUM ('pembimbing', 'konselor');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE public.journal_entries
  ADD COLUMN IF NOT EXISTS self_reflection text[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS body_reactions text[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS social_reactions text[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS hambatan_personal text[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS help_needs text[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS referral_target public.referral_target,
  ADD COLUMN IF NOT EXISTS referral_date date,
  ADD COLUMN IF NOT EXISTS referral_done boolean NOT NULL DEFAULT false;