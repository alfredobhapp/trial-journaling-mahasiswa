import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const Route = createFileRoute("/mapping")({
  head: () => ({
    meta: [{ title: "Mapping Dosen-Mahasiswa — Admin" }],
  }),
  component: MappingPage,
});

interface UserOption {
  id: number;
  username: string;
}

interface MappingRecord {
  mapping_id: number;
  mahasiswa_id: number;
  mahasiswa_username: string;
  dosen_id: number;
  dosen_username: string;
}

function MappingPage() {
  const [dosens, setDosens] = useState<UserOption[]>([]);
  const [mahasiswas, setMahasiswas] = useState<UserOption[]>([]);
  const [mappings, setMappings] = useState<MappingRecord[]>([]);
  
  const [selectedDosen, setSelectedDosen] = useState<string>("");
  const [selectedMahasiswas, setSelectedMahasiswas] = useState<number[]>([]);
  
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const url = `${import.meta.env.BASE_URL}api/mapping.php`.replace(/\/+/g, '/');
      const res = await fetch(url);
      const data = await res.json();
      if (res.ok) {
        setDosens(data.dosens || []);
        setMahasiswas(data.mahasiswas || []);
        setMappings(data.mappings || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      navigate({ to: "/dashboard" });
    } else if (user?.role === 'admin') {
      fetchData();
    }
  }, [user, loading, navigate]);

  if (loading || !user || user.role !== 'admin') {
    return null;
  }

  const handleToggleStudent = (id: number) => {
    setSelectedMahasiswas(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    if (!selectedDosen || selectedMahasiswas.length === 0) {
      setError("Pilih dosen dan setidaknya satu mahasiswa.");
      return;
    }

    setError("");
    setMessage("");
    setIsLoading(true);

    try {
      const url = `${import.meta.env.BASE_URL}api/mapping.php`.replace(/\/+/g, '/');
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          dosen_id: parseInt(selectedDosen), 
          mahasiswa_ids: selectedMahasiswas 
        }),
      });
      
      let data: any = {};
      try {
        data = await res.json();
      } catch (jsonErr) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `Server error (${res.status})`);
      }
      
      if (res.ok && data.success) {
        setMessage("Mapping berhasil disimpan.");
        setSelectedMahasiswas([]);
        setSelectedDosen("");
        fetchData(); // Refresh data
      } else {
        setError(data.error || "Gagal menyimpan mapping.");
      }
    } catch (err: any) {
      setError(err?.message || "Terjadi kesalahan jaringan.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl p-4 sm:p-6 space-y-6">
      <div>
        <Button variant="ghost" asChild className="mb-4 -ml-4">
          <Link to="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" /> Kembali ke Dashboard
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Mapping Baru</CardTitle>
            <CardDescription>
              Tentukan dosen wali/pembimbing untuk mahasiswa.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {message && (
              <Alert className="border-green-500 text-green-700 bg-green-50">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Pilih Dosen</label>
              <Select value={selectedDosen} onValueChange={setSelectedDosen}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Dosen" />
                </SelectTrigger>
                <SelectContent>
                  {dosens.map(d => (
                    <SelectItem key={d.id} value={d.id.toString()}>{d.username}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Pilih Mahasiswa</label>
              <div className="border rounded-md p-2 max-h-60 overflow-y-auto space-y-1">
                {mahasiswas.length === 0 && <p className="text-sm text-muted-foreground p-2">Belum ada mahasiswa terdaftar.</p>}
                {mahasiswas.map(m => (
                  <div key={m.id} className="flex items-center space-x-2 p-1 hover:bg-muted/50 rounded">
                    <input 
                      type="checkbox" 
                      id={`mhs-${m.id}`}
                      checked={selectedMahasiswas.includes(m.id)}
                      onChange={() => handleToggleStudent(m.id)}
                      className="rounded border-gray-300"
                    />
                    <label htmlFor={`mhs-${m.id}`} className="text-sm flex-1 cursor-pointer">
                      {m.username}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <Button onClick={handleSave} className="w-full" disabled={isLoading}>
              {isLoading ? "Menyimpan..." : "Simpan Mapping"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Daftar Mapping</CardTitle>
            <CardDescription>
              Mapping yang saat ini aktif di sistem.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mappings.length === 0 && (
                <p className="text-sm text-muted-foreground">Belum ada mapping.</p>
              )}
              {mappings.map(map => (
                <div key={map.mapping_id} className="flex justify-between items-center p-3 border rounded-md">
                  <div>
                    <p className="font-medium text-sm">Mhs: {map.mahasiswa_username}</p>
                    <p className="text-xs text-muted-foreground">Dosen: {map.dosen_username}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
