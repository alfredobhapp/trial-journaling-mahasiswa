import { createFileRoute, Link } from "@tanstack/react-router";
import { CURRENT_STUDENT, MOCK_JOURNALS } from "@/lib/mock-data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EwsBadge } from "@/components/ews-badge";
import { ClipboardList } from "lucide-react";

export const Route = createFileRoute("/journal/history")({
  head: () => ({
    meta: [
      { title: "Riwayat Jurnal — Jurnal Mahasiswa" },
      {
        name: "description",
        content: "Riwayat jurnal mingguan mahasiswa beserta status Early Warning System.",
      },
      { property: "og:title", content: "Riwayat Jurnal" },
      {
        property: "og:description",
        content: "Lihat kembali semua entri jurnal mingguan Anda.",
      },
    ],
  }),
  component: JournalHistoryPage,
});

function JournalHistoryPage() {
  const entries = MOCK_JOURNALS.filter((j) => j.studentNim === CURRENT_STUDENT.nim).sort(
    (a, b) => +new Date(b.date) - +new Date(a.date),
  );

  return (
    <div className="mx-auto w-full max-w-4xl p-4 sm:p-6">
      <div className="mb-6 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 sm:flex sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Arsip
          </p>
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl">Riwayat Jurnal</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {entries.length} entri tercatat
          </p>
        </div>
        <Button asChild>
          <Link to="/journal/new">
            <ClipboardList className="mr-2 h-4 w-4" /> Jurnal Baru
          </Link>
        </Button>
      </div>

      {entries.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            Belum ada jurnal. Mulai dengan menulis refleksi pertama Anda.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {entries.map((j) => (
            <Card key={j.id}>
              <CardHeader className="pb-2">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 sm:flex sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <CardDescription>
                      {new Date(j.date).toLocaleDateString("id-ID", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </CardDescription>
                    <CardTitle className="truncate text-base">
                      {j.profileType === "akhir"
                        ? `Skripsi · ${j.thesisStage}`
                        : "Refleksi Mingguan"}
                    </CardTitle>
                  </div>
                  <EwsBadge status={j.ewsResult} />
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {j.thesisProgress && (
                  <p>
                    <span className="font-medium text-foreground">Progres: </span>
                    <span className="text-muted-foreground">{j.thesisProgress}</span>
                  </p>
                )}
                {j.thesisBlockers && (
                  <p>
                    <span className="font-medium text-foreground">Hambatan: </span>
                    <span className="text-muted-foreground">{j.thesisBlockers}</span>
                  </p>
                )}
                {j.academicChallenges && (
                  <p>
                    <span className="font-medium text-foreground">Tantangan: </span>
                    <span className="text-muted-foreground">{j.academicChallenges}</span>
                  </p>
                )}
                <p>
                  <span className="font-medium text-foreground">Refleksi: </span>
                  <span className="text-muted-foreground">{j.reflection}</span>
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
