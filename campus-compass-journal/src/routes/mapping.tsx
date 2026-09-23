import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, ArrowLeft, CheckCircle2, ChevronsUpDown, Search, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

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

// ---- Multi-Select Dropdown Component ----
function MultiSelectDropdown({
  options,
  selected,
  onToggle,
  placeholder = "Pilih...",
}: {
  options: UserOption[];
  selected: number[];
  onToggle: (id: number) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = options.filter((o) =>
    o.username.toLowerCase().includes(search.toLowerCase())
  );

  const selectedCount = selected.length;

  return (
    <div ref={ref} className="relative w-full">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors hover:bg-accent"
      >
        <span className="truncate text-muted-foreground">
          {selectedCount > 0 ? (
            <span className="text-foreground font-medium">
              {selectedCount} mahasiswa dipilih
            </span>
          ) : (
            placeholder
          )}
        </span>
        <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-input bg-background shadow-lg">
          {/* Search */}
          <div className="flex items-center gap-2 border-b px-3 py-2">
            <Search className="h-3.5 w-3.5 text-muted-foreground" />
            <input
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              placeholder="Cari mahasiswa..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
            {search && (
              <button onClick={() => setSearch("")}>
                <X className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            )}
          </div>

          {/* Options list */}
          <div className="max-h-56 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                Tidak ada mahasiswa ditemukan.
              </p>
            ) : (
              filtered.map((o) => {
                const isChecked = selected.includes(o.id);
                return (
                  <label
                    key={o.id}
                    className="flex cursor-pointer items-center gap-3 px-3 py-2 text-sm hover:bg-accent"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => onToggle(o.id)}
                      className="h-4 w-4 rounded border-gray-300 accent-primary"
                    />
                    <span className={isChecked ? "font-medium" : ""}>{o.username}</span>
                  </label>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="border-t px-3 py-2 flex justify-between items-center text-xs text-muted-foreground">
            <span>{selectedCount} dipilih</span>
            <button
              type="button"
              className="text-primary hover:underline"
              onClick={() => selected.forEach((id) => onToggle(id))}
              disabled={selectedCount === 0}
            >
              Hapus semua
            </button>
          </div>
        </div>
      )}

      {/* Selected badges */}
      {selectedCount > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {options
            .filter((o) => selected.includes(o.id))
            .map((o) => (
              <Badge
                key={o.id}
                variant="secondary"
                className="cursor-pointer gap-1 text-xs"
                onClick={() => onToggle(o.id)}
              >
                {o.username}
                <X className="h-2.5 w-2.5" />
              </Badge>
            ))}
        </div>
      )}
    </div>
  );
}

// ---- Main Mapping Page ----
function MappingPage() {
  const [dosens, setDosens] = useState<UserOption[]>([]);
  const [mahasiswas, setMahasiswas] = useState<UserOption[]>([]);
  const [mappings, setMappings] = useState<MappingRecord[]>([]);

  const [selectedDosen, setSelectedDosen] = useState<string>("");
  // State persists across dropdown open/close
  const [selectedMahasiswas, setSelectedMahasiswas] = useState<number[]>([]);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const apiUrl = (path: string) =>
    `${import.meta.env.BASE_URL}api/${path}`.replace(/\/+/g, "/");

  const fetchData = async () => {
    try {
      const res = await fetch(apiUrl("mapping.php"));
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
    if (!loading && (!user || user.role !== "admin")) {
      navigate({ to: "/dashboard" });
    } else if (user?.role === "admin") {
      fetchData();
    }
  }, [user, loading, navigate]);

  if (loading || !user || user.role !== "admin") return null;

  const handleToggle = (id: number) => {
    setSelectedMahasiswas((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
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
      const res = await fetch(apiUrl("mapping.php"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dosen_id: parseInt(selectedDosen),
          mahasiswa_ids: selectedMahasiswas,
        }),
      });

      let data: any = {};
      try {
        data = await res.json();
      } catch {
        throw new Error(`Server error (${res.status})`);
      }

      if (res.ok && data.success) {
        setMessage("Mapping berhasil disimpan.");
        setSelectedMahasiswas([]);
        setSelectedDosen("");
        fetchData();
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
        {/* Form Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Mapping Baru</CardTitle>
            <CardDescription>Tentukan dosen wali/pembimbing untuk mahasiswa.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {message && (
              <Alert className="border-green-500 bg-green-50 text-green-700">
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
                  {dosens.length === 0 ? (
                    <SelectItem value="_none" disabled>
                      Belum ada dosen terdaftar
                    </SelectItem>
                  ) : (
                    dosens.map((d) => (
                      <SelectItem key={d.id} value={d.id.toString()}>
                        {d.username}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Pilih Mahasiswa
                <span className="ml-1 text-xs text-muted-foreground">
                  (multi-pilih, cari dengan ketik)
                </span>
              </label>
              <MultiSelectDropdown
                options={mahasiswas}
                selected={selectedMahasiswas}
                onToggle={handleToggle}
                placeholder="Pilih mahasiswa..."
              />
            </div>

            <Button onClick={handleSave} className="w-full" disabled={isLoading}>
              {isLoading ? "Menyimpan..." : "Simpan Mapping"}
            </Button>
          </CardContent>
        </Card>

        {/* Existing Mappings Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Daftar Mapping Aktif</CardTitle>
            <CardDescription>Mapping yang saat ini aktif di sistem.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {mappings.length === 0 && (
                <p className="text-sm text-muted-foreground">Belum ada mapping.</p>
              )}
              {mappings.map((map) => (
                <div
                  key={map.mapping_id}
                  className="flex justify-between items-center p-3 border rounded-md bg-muted/30"
                >
                  <div>
                    <p className="font-medium text-sm">{map.mahasiswa_username}</p>
                    <p className="text-xs text-muted-foreground">→ {map.dosen_username}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    Mapped
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
