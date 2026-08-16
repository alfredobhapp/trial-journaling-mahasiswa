import { EWS_META, type EwsStatus } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export function EwsBadge({ status, className }: { status: EwsStatus; className?: string }) {
  const m = EWS_META[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
        className,
      )}
      style={{ backgroundColor: m.bg, color: m.fg, borderColor: m.ring }}
    >
      <span
        className="inline-block h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: m.fg }}
      />
      {m.label}
    </span>
  );
}
