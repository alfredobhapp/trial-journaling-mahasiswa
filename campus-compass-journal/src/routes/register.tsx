import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [{ title: "Registrasi Pengguna — Admin" }],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("mahasiswa");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      navigate({ to: "/dashboard" });
    }
  }, [user, loading, navigate]);

  if (loading || !user || user.role !== 'admin') {
    return null;
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setIsLoading(true);

    try {
      const url = `${import.meta.env.BASE_URL}api/register.php`.replace(/\/+/g, '/');
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, role }),
      });
      
      let data: any = {};
      try {
        data = await res.json();
      } catch (jsonErr) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `Server error (${res.status})`);
      }
      
      if (res.ok && data.success) {
        setMessage("Pengguna berhasil didaftarkan.");
        setUsername("");
        setPassword("");
        setRole("mahasiswa");
      } else {
        setError(data.error || "Gagal mendaftarkan pengguna.");
      }
    } catch (err: any) {
      setError(err?.message || "Terjadi kesalahan jaringan.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl p-4 sm:p-6 space-y-6">
      <div>
        <Button variant="ghost" asChild className="mb-4 -ml-4">
          <Link to="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" /> Kembali ke Dashboard
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Registrasi Pengguna Baru</CardTitle>
          <CardDescription>
            Tambahkan mahasiswa, dosen, konselor, atau admin baru ke dalam sistem.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
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
              <Label htmlFor="username">Username (NIM / NIP)</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mahasiswa">Mahasiswa</SelectItem>
                  <SelectItem value="dosen">Dosen</SelectItem>
                  <SelectItem value="konselor">Konselor</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Menyimpan..." : "Daftarkan Pengguna"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
