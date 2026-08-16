import { cn } from "@/lib/utils";
import { formatDateShort, type StatusInfo } from "@/lib/referral-status";

const TONE: Record<StatusInfo["tone"], string> = {
  neutral: "bg-muted text-muted-foreground ring-border",
  ok: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  warn: "bg-amber-50 text-amber-800 ring-amber-200",
  alert: "bg-rose-50 text-rose-800 ring-rose-200",
};

export function StatusTag({ status, className }: { status: StatusInfo; className?: string }) {
  const detail =
    status.kind === "pembimbing" || status.kind === "konselor"
      ? `${formatDateShort(status.date)} · ${status.done ? "Selesai" : "Belum"}`
      : null;

  return (
    <span
      className={cn(
        "inline-flex flex-col items-start gap-0.5 rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset",
        TONE[status.tone],
        className,
      )}
    >
      <span className="whitespace-nowrap">{status.label}</span>
      {detail && <span className="whitespace-nowrap text-[11px] font-normal opacity-80">{detail}</span>}
    </span>
  );
}
