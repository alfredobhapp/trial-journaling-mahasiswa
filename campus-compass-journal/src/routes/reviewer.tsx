import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRole } from "@/lib/role-context";
import { EWS_META, type EwsStatus } from "@/lib/mock-data";
import { labelsOf, labelOf } from "@/lib/journal-options";
import {
  deriveStatus,
  formatDateShort,
  toDateInput,
  type StatusKind,
} from "@/lib/referral-status";
import { addJournalReview, listJournalEntries, setReferral } from "@/lib/reviewer.functions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { EwsBadge } from "@/components/ews-badge";
import { StatusTag } from "@/components/status-tag";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertTriangle,
  CalendarDays,
  CheckCheck,
  Eye,
  HeartPulse,
  Search,
  ShieldCheck,
  Users,
} from "lucide-react";

export const Route = createFileRoute("/reviewer")({
  head: () => ({
    meta: [
      { title: "Reviewer Area — Jurnal Mahasiswa" },
      {
        name: "description",
        content: "Pantau check-in mahasiswa, beri catatan feedback, dan kelola rujukan konseling.",
      },
      { property: "og:title", content: "Reviewer Area — Jurnal Mahasiswa" },
      {
        property: "og:description",
        content: "Dashboard dosen, konselor & admin untuk memantau status Early Warning System mahasiswa.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ReviewerPage,
});

type Entry = Awaited<ReturnType<typeof listJournalEntries>>["entries"][number];
type Review = Awaited<ReturnType<typeof listJournalEntries>>["reviews"][number];

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

function SummaryCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color?: { bg: string; fg: string };
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div
          className="flex size-10 items-center justify-center rounded-lg"
          style={{
            backgroundColor: color?.bg ?? "hsl(var(--muted))",
            color: color?.fg ?? "hsl(var(--primary))",
          }}
        >
          {icon}
        </div>
        <div className="min-w-0">
          <p className="truncate text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

type PickerMode = { target: "pembimbing" | "konselor"; keepDone: boolean } | null;

function ReviewerPage() {
  const { role } = useRole();
  const queryClient = useQueryClient();
  const fetchEntries = listJournalEntries;
  const addReview = addJournalReview;
  const updateReferral = setReferral;

  const [filter, setFilter] = useState<EwsStatus | "all">("all");
  const [statusFilter, setStatusFilter] = useState<StatusKind | "all">("all");
  const [q, setQ] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [picker, setPicker] = useState<PickerMode>(null);
  const [pickedDate, setPickedDate] = useState<Date | undefined>(new Date());

  const isAdmin = role === "admin";
  const isDosen = role === "dosen";
  const isKonselor = role === "konselor";

  const { data, isLoading, isError } = useQuery({
    queryKey: ["journal-entries"],
    queryFn: () => fetchEntries(),
    enabled: role !== "mahasiswa",
  });

  const entries: Entry[] = data?.entries ?? [];
  const reviews: Review[] = data?.reviews ?? [];
  const reviewedIds = useMemo(() => new Set(reviews.map((r) => r.journal_id)), [reviews]);

  const counts = useMemo(
    () => ({
      total: new Set(entries.map((e) => e.studentNim)).size,
      normal: entries.filter((e) => e.ews === "normal").length,
      akademik: entries.filter((e) => e.ews === "akademik").length,
      konseling: entries.filter((e) => e.ews === "konseling").length,
    }),
    [entries],
  );

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return entries
      .filter((e) => (filter === "all" ? true : e.ews === filter))
      .filter((e) =>
        statusFilter === "all"
          ? true
          : deriveStatus(e, reviewedIds.has(e.id)).kind === statusFilter,
      )
      .filter(
        (e) =>
          !needle ||
          e.studentName.toLowerCase().includes(needle) ||
          e.studentNim.toLowerCase().includes(needle),
      );
  }, [entries, filter, statusFilter, q, reviewedIds]);

  const active: Entry | undefined = entries.find((e) => e.id === openId);
  const activeReviews: Review[] = reviews.filter((r) => r.journal_id === openId);
  const activeStatus = active ? deriveStatus(active, reviewedIds.has(active.id)) : null;

  /** Who may change this referral. */
  const canManage = (entry: Entry | undefined) => {
    if (!entry || isAdmin) return false;
    if (isDosen) return true;
    if (isKonselor) return entry.referralTarget === "konselor" || entry.referralTarget === null;
    return false;
  };

  const reviewMutation = useMutation({
    mutationFn: (vars: { journalId: string; note: string }) =>
      addReview({
        data: {
          journalId: vars.journalId,
          note: vars.note,
          reviewerName: isDosen ? "Dosen Pembimbing" : "Konselor Kampus",
          reviewerRole: role,
        },
      }),
    onSuccess: () => {
      setNote("");
      toast.success("Catatan feedback tersimpan.");
      queryClient.invalidateQueries({ queryKey: ["journal-entries"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const referralMutation = useMutation({
    mutationFn: (vars: {
      journalId: string;
      target: "pembimbing" | "konselor" | null;
      date?: string | null;
      done?: boolean;
    }) => updateReferral({ data: { ...vars, done: vars.done ?? false } }),
    onSuccess: () => {
      toast.success("Status rujukan diperbarui.");
      queryClient.invalidateQueries({ queryKey: ["journal-entries"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (role === "mahasiswa") {
    return (
      <div className="mx-auto w-full max-w-2xl p-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <CardTitle>Akses terbatas</CardTitle>
            </div>
            <CardDescription>
              Halaman ini hanya untuk peran Dosen, Konselor, atau Admin. Gunakan role switcher di
              header untuk beralih peran (demo).
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const roleLabel = isDosen
    ? "Dosen Pembimbing"
    : isKonselor
      ? "Konselor Kampus"
      : "Administrator (Read-only)";

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-4 sm:p-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {roleLabel}
        </p>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground sm:text-3xl">
          <ShieldCheck className="h-6 w-6 text-primary" /> Reviewer Dashboard
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {isAdmin
            ? "Akses hanya melihat. Admin tidak dapat meninjau atau mengubah status rujukan."
            : "Seluruh check-in mahasiswa beserta status Early Warning System dan rujukan konseling."}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <SummaryCard label="Total Mahasiswa" value={counts.total} icon={<Users className="size-5" />} />
        <SummaryCard
          label="Normal"
          value={counts.normal}
          icon={<ShieldCheck className="size-5" />}
          color={{ bg: EWS_META.normal.bg, fg: EWS_META.normal.fg }}
        />
        <SummaryCard
          label="Butuh Akademik"
          value={counts.akademik}
          icon={<AlertTriangle className="size-5" />}
          color={{ bg: EWS_META.akademik.bg, fg: EWS_META.akademik.fg }}
        />
        <SummaryCard
          label="Prioritas Konseling"
          value={counts.konseling}
          icon={<HeartPulse className="size-5" />}
          color={{ bg: EWS_META.konseling.bg, fg: EWS_META.konseling.fg }}
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="h-9 w-full pl-8"
            placeholder="Cari nama atau NIM"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <Select value={filter} onValueChange={(v) => setFilter(v as EwsStatus | "all")}>
          <SelectTrigger className="h-9 w-full sm:w-44">
            <SelectValue placeholder="Filter EWS" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua EWS</SelectItem>
            <SelectItem value="normal">Normal</SelectItem>
            <SelectItem value="akademik">Akademik</SelectItem>
            <SelectItem value="konseling">Konseling</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as StatusKind | "all")}
        >
          <SelectTrigger className="h-9 w-full sm:w-52">
            <SelectValue placeholder="Filter status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua status</SelectItem>
            <SelectItem value="belum_ditinjau">Belum ditinjau</SelectItem>
            <SelectItem value="ok">OK</SelectItem>
            <SelectItem value="pembimbing">Konseling Pembimbing</SelectItem>
            <SelectItem value="konselor">Konseling Konselor</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-2 p-4">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : isError ? (
            <p className="p-8 text-center text-sm text-destructive">
              Gagal memuat data jurnal. Coba muat ulang halaman.
            </p>
          ) : filtered.length === 0 ? (
            <p className="p-8 text-center text-sm text-muted-foreground">
              Belum ada check-in yang cocok dengan filter.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama Mahasiswa</TableHead>
                    <TableHead>NIM</TableHead>
                    <TableHead>Segment / Semester</TableHead>
                    <TableHead>Tanggal Input</TableHead>
                    <TableHead>EWS</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((e) => (
                    <TableRow key={e.id}>
                      <TableCell className="font-medium">{e.studentName}</TableCell>
                      <TableCell className="text-muted-foreground">{e.studentNim}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {e.profileType === "akhir"
                          ? `Skripsi · ${e.thesisStage ?? "-"}`
                          : `Awal · Semester ${e.semester ?? "-"}`}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-muted-foreground">
                        {fmtDate(e.createdAt)}
                      </TableCell>
                      <TableCell>
                        <EwsBadge status={e.ews as EwsStatus} />
                      </TableCell>
                      <TableCell>
                        <StatusTag status={deriveStatus(e, reviewedIds.has(e.id))} />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setOpenId(e.id);
                            setNote("");
                          }}
                        >
                          {isAdmin ? (
                            <>
                              <Eye className="mr-1 size-4" /> Lihat
                            </>
                          ) : (
                            "Tinjau"
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Sheet open={!!openId} onOpenChange={(o) => !o && setOpenId(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          {active && activeStatus && (
            <>
              <SheetHeader>
                <SheetTitle>{active.studentName}</SheetTitle>
                <SheetDescription>
                  NIM {active.studentNim} · {fmtDate(active.createdAt)}
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-5 px-4 pb-8">
                <div className="flex flex-wrap items-center gap-2">
                  <EwsBadge status={active.ews as EwsStatus} />
                  <StatusTag status={activeStatus} />
                </div>

                <div className="space-y-2 text-sm">
                  <Detail
                    label="Segment"
                    value={
                      active.profileType === "akhir"
                        ? `Skripsi — ${active.thesisStage ?? "-"}`
                        : `Semester Awal — Semester ${active.semester ?? "-"}`
                    }
                  />
                  <Detail label="Mood" value={active.moods.join(", ") || "-"} />
                  <Detail label="Antusiasme" value={`${active.enthusiasm ?? "-"} / 5`} />
                  <Detail label="Beban terbesar" value={active.burden || "-"} />
                  <Detail label="Interaksi dosen" value={active.dosen ? labelOf(active.dosen) : "-"} />
                  <Detail label="Hambatan akademik" value={labelsOf(active.hambatan)} />
                  <Detail label="Hambatan personal" value={labelsOf(active.hambatanPersonal)} />
                  <Detail label="Self-Reflection" value={labelsOf(active.selfReflection)} />
                  <Detail label="Reaksi tubuh" value={labelsOf(active.bodyReactions)} />
                  <Detail label="Reaksi interaksi" value={labelsOf(active.socialReactions)} />
                  <Detail label="Kebutuhan bantuan" value={labelsOf(active.helpNeeds)} />
                  <Detail
                    label="Kesediaan dihubungi"
                    value={active.contact ? labelOf(active.contact) : "-"}
                  />
                </div>

                {isAdmin ? (
                  <div className="rounded-md border bg-muted/40 p-3 text-sm text-muted-foreground">
                    Admin memiliki akses hanya meliha. Tidak bisa tinjau atau mengubah status rujukan.
                  </div>
                ) : (
                  <div className="space-y-3 rounded-lg border p-3">
                    <h3 className="flex items-center gap-2 text-sm font-semibold">
                      <HeartPulse className="size-4 text-primary" /> Rujuk ke Konseling Kampus
                    </h3>

                    {!canManage(active) ? (
                      <p className="text-sm text-muted-foreground">
                        Rujukan ini ditangani Dosen Pembimbing. Konselor hanya dapat mengelola rujukan
                        Konseling Konselor.
                      </p>
                    ) : (
                      <>
                        <div className="grid gap-2 sm:grid-cols-2">
                          <Button
                            variant={active.referralTarget === "pembimbing" ? "default" : "outline"}
                            disabled={!isDosen}
                            onClick={() => {
                              setPickedDate(
                                active.referralDate
                                  ? new Date(`${active.referralDate}T00:00:00`)
                                  : new Date(),
                              );
                              setPicker({ target: "pembimbing", keepDone: false });
                            }}
                          >
                            <CalendarDays className="mr-1 size-4" /> Dosen Pembimbing
                          </Button>
                          <Button
                            variant={active.referralTarget === "konselor" ? "default" : "outline"}
                            onClick={() => {
                              setPickedDate(
                                active.referralDate
                                  ? new Date(`${active.referralDate}T00:00:00`)
                                  : new Date(),
                              );
                              setPicker({ target: "konselor", keepDone: false });
                            }}
                          >
                            <CalendarDays className="mr-1 size-4" /> Konselor Kampus
                          </Button>
                        </div>

                        {active.referralTarget && (
                          <div className="space-y-2">
                            <p className="text-xs text-muted-foreground">
                              Jadwal: {formatDateShort(active.referralDate)} ·{" "}
                              {active.referralDone ? "Selesai" : "Belum selesai"}
                            </p>
                            <div className="flex flex-wrap gap-2">
                              <Button
                                size="sm"
                                variant="secondary"
                                disabled={referralMutation.isPending}
                                onClick={() =>
                                  referralMutation.mutate({
                                    journalId: active.id,
                                    target: active.referralTarget,
                                    date: active.referralDate,
                                    done: !active.referralDone,
                                  })
                                }
                              >
                                <CheckCheck className="mr-1 size-4" />
                                {active.referralDone ? "Ubah Status ke Belum" : "Mark as Done"}
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                disabled={referralMutation.isPending}
                                onClick={() =>
                                  referralMutation.mutate({
                                    journalId: active.id,
                                    target: null,
                                    date: null,
                                    done: false,
                                  })
                                }
                              >
                                Batalkan rujukan
                              </Button>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}

                <Separator />

                <div className="space-y-3">
                  <h3 className="text-sm font-semibold">Catatan Feedback</h3>
                  {!isAdmin && (
                    <>
                      <Textarea
                        rows={3}
                        placeholder="Tulis catatan pendampingan untuk mahasiswa ini…"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                      />
                      <Button
                        size="sm"
                        disabled={!note.trim() || reviewMutation.isPending}
                        onClick={() =>
                          reviewMutation.mutate({ journalId: active.id, note: note.trim() })
                        }
                      >
                        Simpan catatan
                      </Button>
                    </>
                  )}

                  <div className="space-y-2">
                    {activeReviews.length === 0 && (
                      <p className="text-sm text-muted-foreground">Belum ada catatan feedback.</p>
                    )}
                    {activeReviews.map((r) => (
                      <div key={r.id} className="rounded-md bg-muted/50 p-3 text-sm">
                        <p className="text-xs text-muted-foreground">
                          {r.reviewer_name} · {fmtDate(r.created_at)}
                        </p>
                        <p className="mt-1 text-foreground">{r.note}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <Dialog open={!!picker} onOpenChange={(o) => !o && setPicker(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {picker?.target === "pembimbing"
                ? "Jadwal Konseling Dosen Pembimbing"
                : "Jadwal Konseling Konselor Kampus"}
            </DialogTitle>
            <DialogDescription>
              Pilih tanggal sesi konseling. Status akan menjadi{" "}
              <Badge variant="outline" className="align-middle">
                {picker?.target === "pembimbing" ? "Konseling Pembimbing" : "Konseling Konselor"} ·
                Belum
              </Badge>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center">
            <Calendar mode="single" selected={pickedDate} onSelect={setPickedDate} />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setPicker(null)}>
              Batal
            </Button>
            <Button
              disabled={!pickedDate || !active || referralMutation.isPending}
              onClick={() => {
                if (!picker || !active || !pickedDate) return;
                referralMutation.mutate({
                  journalId: active.id,
                  target: picker.target,
                  date: toDateInput(pickedDate),
                  done: false,
                });
                setPicker(null);
              }}
            >
              Simpan jadwal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[10rem_minmax(0,1fr)] gap-2 border-b border-border/60 py-1.5">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-foreground">{value}</span>
    </div>
  );
}
