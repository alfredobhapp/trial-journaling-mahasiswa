import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ClipboardList, ShieldCheck, Activity } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useEffect } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sistem EWS Jurnal Mahasiswa" },
      { name: "description", content: "Sistem peringatan dini dan pemantauan kondisi mahasiswa" }
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate({ to: "/dashboard" });
    }
  }, [user, loading, navigate]);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center p-4">
      <div className="mx-auto w-full max-w-3xl text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-foreground">
            Sistem Pemantauan <span className="text-primary">EWS Mahasiswa</span>
          </h1>
          <p className="mx-auto max-w-[42rem] text-muted-foreground sm:text-xl leading-normal">
            Aplikasi jurnal untuk mahasiswa tingkat akhir dan awal guna memantau perkembangan akademik serta kesehatan mental.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
          <Button asChild size="lg" className="w-full sm:w-auto text-lg px-8">
            <Link to="/login">Login Ke Sistem</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-6 pt-12 sm:grid-cols-3">
          <Card className="border-0 bg-muted/50">
            <CardContent className="flex flex-col items-center gap-4 p-6 text-center">
              <div className="rounded-full bg-primary/10 p-3 text-primary">
                <ClipboardList className="h-6 w-6" />
              </div>
              <h3 className="font-semibold">Pencatatan Berkala</h3>
              <p className="text-sm text-muted-foreground">Isi jurnal kegiatan dan perkembangan studi Anda secara rutin.</p>
            </CardContent>
          </Card>
          
          <Card className="border-0 bg-muted/50">
            <CardContent className="flex flex-col items-center gap-4 p-6 text-center">
              <div className="rounded-full bg-primary/10 p-3 text-primary">
                <Activity className="h-6 w-6" />
              </div>
              <h3 className="font-semibold">Early Warning System</h3>
              <p className="text-sm text-muted-foreground">Sistem deteksi dini untuk membantu kendala akademik Anda.</p>
            </CardContent>
          </Card>
          
          <Card className="border-0 bg-muted/50">
            <CardContent className="flex flex-col items-center gap-4 p-6 text-center">
              <div className="rounded-full bg-primary/10 p-3 text-primary">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="font-semibold">Pendampingan Dosen</h3>
              <p className="text-sm text-muted-foreground">Konsultasi dan pendampingan terarah dengan dosen wali.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
