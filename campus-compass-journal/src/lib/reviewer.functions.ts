import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createServerSupabase } from "./supabase-public.server-utils";

export const listJournalEntries = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from("journal_entries")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[listJournalEntries]", error);
    throw new Error("Gagal memuat data jurnal.");
  }

  const ids = (data ?? []).map((r) => r.id);
  let reviews: Array<{
    id: string;
    journal_id: string;
    reviewer_name: string;
    reviewer_role: string;
    note: string;
    created_at: string;
  }> = [];

  if (ids.length > 0) {
    const { data: rev, error: revError } = await supabase
      .from("journal_reviews")
      .select("id, journal_id, reviewer_name, reviewer_role, note, created_at")
      .in("journal_id", ids)
      .order("created_at", { ascending: false });
    if (revError) {
      console.error("[listJournalEntries.reviews]", revError);
    } else {
      reviews = rev ?? [];
    }
  }

  return {
    entries: (data ?? []).map((r) => ({
      id: r.id,
      studentNim: r.student_nim,
      studentName: r.student_name,
      profileType: r.profile_type,
      semester: r.semester,
      thesisStage: r.thesis_stage,
      moods: r.moods ?? [],
      enthusiasm: r.enthusiasm,
      burden: r.burden,
      dosen: r.dosen,
      hambatan: r.hambatan ?? [],
      hambatanPersonal: r.hambatan_personal ?? [],
      selfReflection: r.self_reflection ?? [],
      bodyReactions: r.body_reactions ?? [],
      socialReactions: r.social_reactions ?? [],
      helpNeeds: r.help_needs ?? [],
      contact: r.contact,
      ews: r.ews_result,
      referralStatus: r.referral_status,
      referralTarget: r.referral_target,
      referralDate: r.referral_date,
      referralDone: r.referral_done,
      referredAt: r.referred_at,
      createdAt: r.created_at,
    })),
    reviews,
  };
});

export const addJournalReview = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z
      .object({
        journalId: z.string().uuid(),
        note: z.string().trim().min(1).max(2000),
        reviewerName: z.string().trim().min(1).max(120).default("Reviewer"),
        reviewerRole: z.string().trim().min(1).max(40).default("dosen"),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const supabase = createServerSupabase();
    const { data: row, error } = await supabase
      .from("journal_reviews")
      .insert({
        journal_id: data.journalId,
        note: data.note,
        reviewer_name: data.reviewerName,
        reviewer_role: data.reviewerRole,
      })
      .select("id, journal_id, reviewer_name, reviewer_role, note, created_at")
      .single();

    if (error) {
      console.error("[addJournalReview]", error);
      throw new Error("Gagal menyimpan catatan feedback.");
    }
    return row;
  });

/**
 * Create, reroute, complete, or clear a counseling referral.
 * target=null clears the referral entirely.
 */
export const setReferral = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z
      .object({
        journalId: z.string().uuid(),
        target: z.enum(["pembimbing", "konselor"]).nullable(),
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
        done: z.boolean().default(false),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const supabase = createServerSupabase();
    const referred = data.target !== null;
    const { data: row, error } = await supabase
      .from("journal_entries")
      .update({
        referral_status: referred ? "dirujuk" : "belum",
        referral_target: data.target,
        referral_date: referred ? (data.date ?? null) : null,
        referral_done: referred ? data.done : false,
        referred_at: referred ? new Date().toISOString() : null,
      })
      .eq("id", data.journalId)
      .select("id, referral_status, referral_target, referral_date, referral_done, referred_at")
      .single();

    if (error) {
      console.error("[setReferral]", error);
      throw new Error("Gagal memperbarui status rujukan.");
    }
    return {
      id: row.id,
      referralStatus: row.referral_status,
      referralTarget: row.referral_target,
      referralDate: row.referral_date,
      referralDone: row.referral_done,
      referredAt: row.referred_at,
    };
  });
