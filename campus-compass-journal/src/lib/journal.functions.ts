import { z } from "zod";
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

export const submitJournalEntry = async ({ data }: { data: JournalSubmission }) => {
  // Validate data
  const parsedData = submissionSchema.parse(data);
  const ews = computeEws(parsedData);

  const payload = {
    ...parsedData,
    ews_result: ews,
  };

  const response = await fetch('/journal/api/submit_journal.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    console.error("[submitJournalEntry] HTTP error", response.status);
    throw new Error("Gagal menyimpan check-in. Coba lagi.");
  }

  const result = await response.json();
  if (result.error) {
    console.error("[submitJournalEntry] API error", result.error);
    throw new Error("Gagal menyimpan check-in: " + result.error);
  }

  return { id: result.data?.jurnal_id ?? Date.now(), createdAt: new Date().toISOString(), ews };
};
