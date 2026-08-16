import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createServerSupabase } from "./supabase-public.server-utils";
import { computeEws, type EwsResult } from "./ews";

const submissionSchema = z.object({
  studentNim: z.string().min(1),
  studentName: z.string().min(1),
  segment: z.enum(["awal", "akhir"]),
  semester: z.number().int().min(1).max(14).optional(),
  thesisStage: z.string().optional(),
  moods: z.array(z.string()).default([]),
  enthusiasm: z.number().int().min(1).max(5),
  burden: z.string().default(""),
  dosen: z.string().default(""),
  hambatan: z.array(z.string()).default([]),
  hambatanPersonal: z.array(z.string()).default([]),
  selfReflection: z.array(z.string()).default([]),
  bodyReactions: z.array(z.string()).default([]),
  socialReactions: z.array(z.string()).default([]),
  helpNeeds: z.array(z.string()).default([]),
  contact: z.string().default(""),
});

export type { EwsResult };
export type JournalSubmission = z.infer<typeof submissionSchema>;

export const submitJournalEntry = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => submissionSchema.parse(data))
  .handler(async ({ data }) => {
    const ews = computeEws(data);
    const supabase = createServerSupabase();

    const { data: row, error } = await supabase
      .from("journal_entries")
      .insert({
        student_nim: data.studentNim,
        student_name: data.studentName,
        profile_type: data.segment,
        semester: data.segment === "awal" ? (data.semester ?? null) : null,
        thesis_stage: data.segment === "akhir" ? (data.thesisStage ?? null) : null,
        moods: data.moods,
        enthusiasm: data.enthusiasm,
        burden: data.burden,
        dosen: data.dosen,
        hambatan: data.hambatan,
        hambatan_personal: data.hambatanPersonal,
        self_reflection: data.selfReflection,
        body_reactions: data.bodyReactions,
        social_reactions: data.socialReactions,
        help_needs: data.helpNeeds,
        physical: [],
        sleep: null,
        help_need: data.helpNeeds[0] ?? null,
        contact: data.contact,
        ews_result: ews,
      })
      .select("id, created_at")
      .single();

    if (error) {
      console.error("[submitJournalEntry]", error);
      throw new Error("Gagal menyimpan check-in. Coba lagi.");
    }

    return { id: row.id, createdAt: row.created_at, ews };
  });
