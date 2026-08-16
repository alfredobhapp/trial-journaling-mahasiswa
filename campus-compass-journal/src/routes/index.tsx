import { createFileRoute, Link } from "@tanstack/react-router";
import { useRole } from "@/lib/role-context";
import {
  CURRENT_STUDENT,
  EWS_META,
  MOCK_JOURNALS,
  MOCK_STUDENTS,
  THESIS_STAGES,
} from "@/lib/mock-data";
import { EwsBadge } from "@/components/ews-badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, ClipboardList, Users } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Jurnal Mahasiswa" },
      {
        name: "description",
        content: "Status EWS mahasiswa dan ringkasan aktivitas jurnal terbaru.",
      },
      { property: "og:title", content: "Dashboard — Jurnal Mahasiswa" },
      {
        property: "og:description",
        content: "Status EWS mahasiswa dan ringkasan aktivitas jurnal terbaru.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { role } = useRole();
  if (role === "mahasiswa") return <StudentDashboard />;
  return <ReviewerDashboard />;
}

function StudentDashboard() {
  const s = CURRENT_STUDENT;
  const meta = EWS_META[s.ewsStatus];
  const stageIndex =
    s.profileType === "akhir" && s.thesisStage ? THESIS_STAGES.indexOf(s.thesisStage) : -1;
  const progress =
    s.profileType === "akhir"
      ? Math.round(((stageIndex + 1) / THESIS_STAGES.length) * 100)
      : Math.round((s.semester / 7) * 100);

  const recent = MOCK_JOURNALS.filter((j) => j.studentNim === s.nim).slice(0, 3);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-4 sm:p-6">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 sm:flex sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Selamat datang,
          </p>
          <h2 className="truncate text-2xl font-bold text-foreground sm:text-3xl">
            {s.name}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            NIM {s.nim} · Semester {s.semester} ·{" "}
            {s.profileType === "awal" ? "Semester Awal" : "Skripsi"}
          </p>
        </div>
        <Button asChild>
          <Link to="/journal/new">
            <ClipboardList className="mr-2 h-4 w-4" /> Isi Jurnal
          </Link>
        </Button>
      </div>

      <Card
        className="overflow-hidden border-0"
        style={{ backgroundColor: meta.bg }}
      >
        <CardHeader>
          <div className="flex items-center gap-2">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: meta.fg }}
            />
            <CardDescription style={{ color: meta.fg }} className="font-medium">
              Early Warning System
            </CardDescription>
          </div>
          <CardTitle className="text-2xl" style={{ color: meta.fg }}>
            {meta.label}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm" style={{ color: meta.fg }}>
            {meta.description}
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardDescription>Tahap Studi</CardDescription>
            <CardTitle className="text-lg">
              {s.profileType === "akhir" ? s.thesisStage : `Semester ${s.semester}`}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Progress value={progress} />
            <p className="text-xs text-muted-foreground">
              {s.profileType === "akhir"
                ? `${stageIndex + 1} dari ${THESIS_STAGES.length} tahap skripsi`
                : `Menuju tahap skripsi (semester 8)`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Riwayat Jurnal Terbaru</CardDescription>
            <CardTitle className="text-lg">
              {recent.length} entri terakhir
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {recent.length === 0 && (
              <p className="text-sm text-muted-foreground">Belum ada jurnal.</p>
            )}
            {recent.map((j) => (
              <div
                key={j.id}
                className="flex items-center justify-between gap-2 rounded-md border bg-card p-2 text-sm"
              >
                <span className="truncate">
                  {new Date(j.date).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
                <EwsBadge status={j.ewsResult} />
              </div>
            ))}
            <Button asChild variant="ghost" size="sm" className="w-full">
              <Link to="/journal/history">
                Lihat semua <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ReviewerDashboard() {
  const counts = MOCK_STUDENTS.reduce(
    (acc, s) => {
      acc[s.ewsStatus] += 1;
      return acc;
    },
    { normal: 0, akademik: 0, konseling: 0 } as Record<string, number>,
  );

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-4 sm:p-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Ringkasan
        </p>
        <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
          Dashboard Reviewer
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Pantau status Early Warning System seluruh mahasiswa yang Anda dampingi.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {(["normal", "akademik", "konseling"] as const).map((s) => {
          const m = EWS_META[s];
          return (
            <Card key={s} className="border-0" style={{ backgroundColor: m.bg }}>
              <CardHeader className="pb-2">
                <CardDescription style={{ color: m.fg }} className="font-medium">
                  {m.label}
                </CardDescription>
                <CardTitle className="text-4xl" style={{ color: m.fg }}>
                  {counts[s]}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs" style={{ color: m.fg }}>
                  mahasiswa
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="h-4 w-4" /> Perlu perhatian
          </CardTitle>
          <CardDescription>
            Mahasiswa dengan status Academic Support atau Counseling Intervention.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link to="/reviewer">
              Buka Reviewer Area <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
