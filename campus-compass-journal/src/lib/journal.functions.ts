import { z } from "zod";
import { computeEws, type EwsResult } from "./ews";

const submissionSchema = z.object({
  userId: z.number().int().positive().optional(),
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

  const url = `${import.meta.env.BASE_URL}api/submit_journal.php`.replace(/\/+/g, "/");
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    console.error("[submitJournalEntry] HTTP error", response.status, text);
    throw new Error("Gagal menyimpan check-in. Coba lagi.");
  }

  const result = await response.json();
  if (result.error) {
    console.error("[submitJournalEntry] API error", result.error);
    throw new Error("Gagal menyimpan check-in: " + result.error);
  }

  return { id: result.data?.jurnal_id ?? Date.now(), createdAt: new Date().toISOString(), ews };
};
