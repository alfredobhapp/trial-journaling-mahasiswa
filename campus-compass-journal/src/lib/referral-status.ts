export type ReferralTarget = "pembimbing" | "konselor" | null;

export type StatusKind = "belum_ditinjau" | "ok" | "pembimbing" | "konselor";

export interface StatusInfo {
  kind: StatusKind;
  label: string;
  date: string | null;
  done: boolean | null;
  /** Semantic tone used for badge styling. */
  tone: "neutral" | "ok" | "warn" | "alert";
}

export function formatDateShort(iso: string | null): string {
  if (!iso) return "-";
  const d = new Date(iso.length <= 10 ? `${iso}T00:00:00` : iso);
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

export function deriveStatus(entry: {
  referralTarget: ReferralTarget;
  referralDate: string | null;
  referralDone: boolean;
}, hasReview: boolean): StatusInfo {
  if (entry.referralTarget === "pembimbing") {
    return {
      kind: "pembimbing",
      label: "Konseling Pembimbing",
      date: entry.referralDate,
      done: entry.referralDone,
      tone: entry.referralDone ? "ok" : "warn",
    };
  }
  if (entry.referralTarget === "konselor") {
    return {
      kind: "konselor",
      label: "Konseling Konselor",
      date: entry.referralDate,
      done: entry.referralDone,
      tone: entry.referralDone ? "ok" : "alert",
    };
  }
  if (hasReview) {
    return { kind: "ok", label: "OK", date: null, done: null, tone: "ok" };
  }
  return { kind: "belum_ditinjau", label: "Belum ditinjau", date: null, done: null, tone: "neutral" };
}

export function toDateInput(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
