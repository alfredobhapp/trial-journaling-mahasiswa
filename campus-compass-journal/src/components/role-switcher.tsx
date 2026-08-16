import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRole } from "@/lib/role-context";
import type { UserRole } from "@/lib/mock-data";
import { GraduationCap, HeartHandshake, ShieldCheck, UserCog } from "lucide-react";

const ROLE_META: Record<UserRole, { label: string; icon: typeof GraduationCap }> = {
  mahasiswa: { label: "Mahasiswa", icon: GraduationCap },
  dosen: { label: "Dosen", icon: ShieldCheck },
  konselor: { label: "Konselor", icon: HeartHandshake },
  admin: { label: "Admin", icon: UserCog },
};

export function RoleSwitcher() {
  const { role, setRole } = useRole();
  const Icon = ROLE_META[role].icon;
  return (
    <div className="flex items-center gap-2">
      <span className="hidden text-xs font-medium uppercase tracking-wider text-muted-foreground sm:inline">
        Demo Role
      </span>
      <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
        <SelectTrigger className="h-9 w-[160px] gap-2">
          <Icon className="h-4 w-4 text-primary" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent align="end">
          {(Object.keys(ROLE_META) as UserRole[]).map((r) => {
            const M = ROLE_META[r];
            const RIcon = M.icon;
            return (
              <SelectItem key={r} value={r}>
                <span className="flex items-center gap-2">
                  <RIcon className="h-4 w-4" />
                  {M.label}
                </span>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}
