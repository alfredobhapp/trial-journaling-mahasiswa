import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EwsBadge } from "@/components/ews-badge";
import { ClipboardList, Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { EwsStatus } from "@/lib/mock-data";

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

interface JournalEntry {
  id: string;
  profileType: "awal" | "akhir";
  thesisStage?: string;
  semester?: number;
  moods: string[];
  enthusiasm: number;
  burden: string;
  ews: EwsStatus;
  createdAt: string;
}

function JournalHistoryPage() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    const url = `${import.meta.env.BASE_URL}api/get_history.php?user_id=${user.id}`.replace(/\/+/g, "/");

    fetch(url)
      .then(async (res) => {
        if (!res.ok) throw new Error(`Server error ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setEntries(data.entries || []);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message || "Gagal memuat riwayat jurnal.");
      })
      .finally(() => setLoading(false));
  }, [user?.id]);

  return (
    <div className="mx-auto w-full max-w-4xl p-4 sm:p-6">
      <div className="mb-6 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 sm:flex sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Arsip
          </p>
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl">Riwayat Jurnal</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {loading ? "Memuat..." : `${entries.length} entri tercatat`}
          </p>
        </div>
        <Button asChild>
          <Link to="/journal/new">
            <ClipboardList className="mr-2 h-4 w-4" /> Jurnal Baru
          </Link>
        </Button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Memuat riwayat jurnal...
        </div>
      )}

      {error && !loading && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!loading && !error && entries.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            Belum ada jurnal. Mulai dengan menulis refleksi pertama Anda.
          </CardContent>
        </Card>
      )}

      {!loading && !error && entries.length > 0 && (
        <div className="space-y-3">
          {entries.map((j) => (
            <Card key={j.id}>
              <CardHeader className="pb-2">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 sm:flex sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <CardDescription>
                      {new Date(j.createdAt).toLocaleDateString("id-ID", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </CardDescription>
                    <CardTitle className="truncate text-base">
                      {j.profileType === "akhir"
                        ? `Skripsi · ${j.thesisStage ?? "-"}`
                        : `Semester ${j.semester ?? "-"} · Refleksi Mingguan`}
                    </CardTitle>
                  </div>
                  <EwsBadge status={j.ews} />
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                {j.moods?.length > 0 && (
                  <p>
                    <span className="font-medium text-foreground">Mood: </span>
                    {j.moods.join(", ")}
                  </p>
                )}
                {j.burden && (
                  <p>
                    <span className="font-medium text-foreground">Beban pikiran: </span>
                    {j.burden}
                  </p>
                )}
                <p>
                  <span className="font-medium text-foreground">Semangat: </span>
                  {j.enthusiasm}/5
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
