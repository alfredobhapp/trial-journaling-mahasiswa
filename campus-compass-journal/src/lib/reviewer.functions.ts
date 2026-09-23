import { z } from "zod";

const apiBase = () =>
  `${import.meta.env.BASE_URL}api`.replace(/\/+/g, "/");

export const listJournalEntries = async () => {
  const response = await fetch(`${apiBase()}/list_journals.php`, { method: "GET" });
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    console.error("[listJournalEntries] HTTP error", response.status, text);
    throw new Error("Gagal memuat data jurnal.");
  }

  const result = await response.json();
  if (result.error) throw new Error(result.error);

  return {
    entries: result.entries || [],
    reviews: result.reviews || [],
  };
};

export const addJournalReview = async ({ data }: { data: any }) => {
  const parsedData = z
    .object({
      journalId: z.string(),
      note: z.string().trim().min(1).max(2000),
      reviewerName: z.string().trim().min(1).max(120).default("Reviewer"),
      reviewerRole: z.string().trim().min(1).max(40).default("dosen"),
    })
    .parse(data);

  const response = await fetch(`${apiBase()}/add_review.php`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parsedData),
  });

  if (!response.ok) throw new Error("Gagal menyimpan catatan feedback.");
  const result = await response.json();
  if (result.error) throw new Error(result.error);

  return result.data;
};

export const setReferral = async ({ data }: { data: any }) => {
  const parsedData = z
    .object({
      journalId: z.string(),
      target: z.enum(["pembimbing", "konselor"]).nullable(),
      date: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/)
        .nullable()
        .optional(),
      done: z.boolean().default(false),
    })
    .parse(data);

  const response = await fetch(`${apiBase()}/set_referral.php`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parsedData),
  });

  if (!response.ok) throw new Error("Gagal memperbarui status rujukan.");
  const result = await response.json();
  if (result.error) throw new Error(result.error);

  return result.data;
};
