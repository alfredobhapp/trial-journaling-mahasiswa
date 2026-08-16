import { z } from "zod";

export const listJournalEntries = async () => {
  const response = await fetch('/journal/api/list_journals.php', { method: 'GET' });
  if (!response.ok) {
    console.error("[listJournalEntries] HTTP error", response.status);
    throw new Error("Gagal memuat data jurnal.");
  }

  const result = await response.json();
  if (result.error) {
    throw new Error(result.error);
  }

  return {
    entries: result.entries || [],
    reviews: result.reviews || [],
  };
};

export const addJournalReview = async ({ data }: { data: any }) => {
  const parsedData = z
    .object({
      journalId: z.string(), // Allowing any string instead of uuid since MySQL ID might be int
      note: z.string().trim().min(1).max(2000),
      reviewerName: z.string().trim().min(1).max(120).default("Reviewer"),
      reviewerRole: z.string().trim().min(1).max(40).default("dosen"),
    })
    .parse(data);

  const response = await fetch('/journal/api/add_review.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(parsedData),
  });

  if (!response.ok) {
    throw new Error("Gagal menyimpan catatan feedback.");
  }
  const result = await response.json();
  if (result.error) throw new Error(result.error);
  
  return result.data;
};

export const setReferral = async ({ data }: { data: any }) => {
  const parsedData = z
    .object({
      journalId: z.string(),
      target: z.enum(["pembimbing", "konselor"]).nullable(),
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
      done: z.boolean().default(false),
    })
    .parse(data);

  const response = await fetch('/journal/api/set_referral.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(parsedData),
  });

  if (!response.ok) {
    throw new Error("Gagal memperbarui status rujukan.");
  }
  const result = await response.json();
  if (result.error) throw new Error(result.error);
  
  return result.data;
};
