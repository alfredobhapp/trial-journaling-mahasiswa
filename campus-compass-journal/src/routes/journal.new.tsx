import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  CURRENT_STUDENT,
  EWS_META,
  THESIS_STAGES,
  type EwsStatus,
  type ProfileType,
  type ThesisStage,
} from "@/lib/mock-data";
import {
  BODY_REACTIONS,
  CONTACT_OPTIONS,
  DOSEN_OPTIONS,
  HAMBATAN_AWAL,
  HAMBATAN_PERSONAL,
  HAMBATAN_PKL,
  HAMBATAN_SKRIPSI_GROUPS,
  HELP_NEEDS,
  MOODS,
  NONE_VALUES,
  SELF_REFLECTION,
  SOCIAL_REACTIONS,
  type Opt,
} from "@/lib/journal-options";
import { computeEws } from "@/lib/ews";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EwsBadge } from "@/components/ews-badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { submitJournalEntry } from "@/lib/journal.functions";

export const Route = createFileRoute("/journal/new")({
  head: () => ({
    meta: [
      { title: "Check-in Jurnal — Refleksi Mingguan Mahasiswa" },
      {
        name: "description",
        content:
          "Formulir check-in 5 langkah untuk merefleksikan kondisi akademik, emosional, dan kesejahteraan mahasiswa.",
      },
      { property: "og:title", content: "Check-in Jurnal Mingguan" },
      {
        property: "og:description",
        content:
          "Refleksi bertahap yang menghasilkan status Early Warning System dan rekomendasi dukungan.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: FillJournalPage,
});

const EARLY_SEMESTERS = [1, 2, 3, 4, 5, 6, 7] as const;

interface FormState {
  segment: ProfileType;
  semester: number;
  thesisStage: ThesisStage;
  moods: string[];
  enthusiasm: number;
  burden: string;
  dosen: string;
  hambatan: string[];
  hambatanPersonal: string[];
  selfReflection: string[];
  bodyReactions: string[];
  socialReactions: string[];
  helpNeeds: string[];
  contact: string;
}

const STEP_LABELS = [
  "Segmen & Progres",
  "Emosi & Beban Pikiran",
  "Hambatan Utama",
  "Self-Reflection & Reaksi",
  "Kebutuhan Bantuan",
] as const;

/** Toggle a value in a multi-select where "Tidak ada" is exclusive. */
function toggleExclusive(list: string[], value: string): string[] {
  if (NONE_VALUES.has(value)) return list.includes(value) ? [] : [value];
  const next = list.filter((v) => !NONE_VALUES.has(v));
  return next.includes(value) ? next.filter((v) => v !== value) : [...next, value];
}

function FillJournalPage() {
  const s = CURRENT_STUDENT;
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<EwsStatus | null>(null);
  const submit = submitJournalEntry;

  const [form, setForm] = useState<FormState>({
    segment: s.profileType,
    semester: s.profileType === "awal" ? Math.min(s.semester, 7) : 1,
    thesisStage: s.thesisStage ?? THESIS_STAGES[0],
    moods: [],
    enthusiasm: 3,
    burden: "",
    dosen: "",
    hambatan: [],
    hambatanPersonal: [],
    selfReflection: [],
    bodyReactions: [],
    socialReactions: [],
    helpNeeds: [],
    contact: "",
  });

  const patch = (p: Partial<FormState>) => setForm((prev) => ({ ...prev, ...p }));

  const ews = useMemo(() => computeEws(form) as EwsStatus, [form]);

  const canNext = useMemo(() => {
    switch (step) {
      case 0:
        return form.segment === "awal" ? !!form.semester : !!form.thesisStage;
      case 1:
        return form.moods.length > 0 && form.burden.trim().length > 0;
      case 2:
        return !!form.dosen && form.hambatan.length > 0 && form.hambatanPersonal.length > 0;
      case 3:
        return form.selfReflection.length > 0 && form.socialReactions.length > 0;
      case 4:
        return form.helpNeeds.length > 0 && !!form.contact;
      default:
        return false;
    }
  }, [step, form]);

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const res = await submit({
        data: {
          studentNim: s.nim,
          studentName: s.name,
          segment: form.segment,
          semester: form.segment === "awal" ? form.semester : undefined,
          thesisStage: form.segment === "akhir" ? form.thesisStage : undefined,
          moods: form.moods,
          enthusiasm: form.enthusiasm,
          burden: form.burden,
          dosen: form.dosen,
          hambatan: form.hambatan,
          hambatanPersonal: form.hambatanPersonal,
          selfReflection: form.selfReflection,
          bodyReactions: form.bodyReactions,
          socialReactions: form.socialReactions,
          helpNeeds: form.helpNeeds,
          contact: form.contact,
        },
      });
      setResult(res.ews);
    } catch (err) {
      console.error(err);
      toast.error("Gagal mengirim check-in", {
        description: err instanceof Error ? err.message : "Coba lagi sebentar.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  const progress = ((step + 1) / STEP_LABELS.length) * 100;

  return (
    <div className="mx-auto w-full max-w-3xl p-4 sm:p-6">
      <div className="mb-6 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 sm:flex sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Check-in Mingguan
          </p>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Refleksi Bertahap</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Langkah {step + 1} dari {STEP_LABELS.length} — {STEP_LABELS[step]}
          </p>
        </div>
        <EwsBadge status={ews} />
      </div>

      <div className="mb-6 space-y-2">
        <Progress value={progress} />
        <div className="flex flex-wrap gap-1.5">
          {STEP_LABELS.map((label, i) => (
            <button
              key={label}
              type="button"
              onClick={() => i <= step && setStep(i)}
              className={cn(
                "rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
                i === step
                  ? "bg-primary text-primary-foreground"
                  : i < step
                    ? "bg-primary/10 text-primary hover:bg-primary/20"
                    : "bg-muted text-muted-foreground",
              )}
            >
              {i + 1}. {label}
            </button>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{STEP_LABELS[step]}</CardTitle>
          <CardDescription>{stepDescription(step)}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {step === 0 && <Step1 form={form} patch={patch} />}
          {step === 1 && <Step2 form={form} patch={patch} />}
          {step === 2 && <Step3 form={form} patch={patch} />}
          {step === 3 && <Step4 form={form} patch={patch} />}
          {step === 4 && <Step5 form={form} patch={patch} />}
        </CardContent>
      </Card>

      <div className="mt-6 flex items-center justify-between gap-2">
        <Button
          type="button"
          variant="ghost"
          onClick={() => (step === 0 ? navigate({ to: "/" }) : setStep(step - 1))}
        >
          <ArrowLeft className="mr-1 size-4" />
          {step === 0 ? "Batal" : "Kembali"}
        </Button>
        {step < STEP_LABELS.length - 1 ? (
          <Button type="button" disabled={!canNext} onClick={() => setStep(step + 1)}>
            Lanjut
            <ArrowRight className="ml-1 size-4" />
          </Button>
        ) : (
          <Button type="button" disabled={!canNext || submitting} onClick={handleSubmit}>
            {submitting ? (
              <Loader2 className="mr-1 size-4 animate-spin" />
            ) : (
              <CheckCircle2 className="mr-1 size-4" />
            )}
            {submitting ? "Mengirim…" : "Kirim Check-in"}
          </Button>
        )}
      </div>

      <ResultDialog
        status={result}
        onClose={() => {
          setResult(null);
          navigate({ to: "/journal/history" });
        }}
      />
    </div>
  );
}

function ResultDialog({ status, onClose }: { status: EwsStatus | null; onClose: () => void }) {
  const open = status !== null;
  const meta = status ? EWS_META[status] : null;

  const title =
    status === "normal"
      ? "Kondisi Anda Terjaga"
      : status === "akademik"
        ? "Dukungan Akademik Disarankan"
        : "Sesi Konseling Ditawarkan";

  const message =
    status === "normal"
      ? "Terima kasih sudah check-in. Kondisi Anda tampak sehat — pertahankan ritme dan istirahat yang baik."
      : status === "akademik"
        ? "Beberapa hambatan akademik terdeteksi. Dosen pembimbing akan diinformasikan agar dapat membantu."
        : "Kami merekomendasikan sesi konseling dengan tim dukungan mahasiswa. Anda tidak sendirian.";

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        {meta && status && (
          <>
            <div
              className="-mx-6 -mt-6 mb-2 rounded-t-lg border-b px-6 py-4"
              style={{ backgroundColor: meta.bg, borderColor: meta.ring }}
            >
              <div className="flex items-center gap-3">
                <span
                  className="inline-flex size-9 items-center justify-center rounded-full"
                  style={{ backgroundColor: meta.fg }}
                >
                  <CheckCircle2 className="size-5" style={{ color: meta.bg }} />
                </span>
                <div>
                  <p
                    className="text-xs font-medium uppercase tracking-wider"
                    style={{ color: meta.fg }}
                  >
                    Status EWS
                  </p>
                  <p className="text-lg font-bold" style={{ color: meta.fg }}>
                    {meta.label}
                  </p>
                </div>
              </div>
            </div>
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription>{message}</DialogDescription>
            </DialogHeader>
            <div className="rounded-md border p-3 text-sm text-muted-foreground">
              {meta.description}
            </div>
            <DialogFooter>
              <Button onClick={onClose} className="w-full sm:w-auto">
                Lihat Riwayat Jurnal
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function stepDescription(step: number): string {
  switch (step) {
    case 0:
      return "Pilih segmen studi dan progres akademik Anda saat ini.";
    case 1:
      return "Bagaimana perasaan, motivasi, dan beban pikiran Anda 3 hari terakhir?";
    case 2:
      return "Hambatan akademik menyesuaikan fase studi Anda, dilanjutkan hambatan personal.";
    case 3:
      return "Cara Anda merespons tekanan, serta reaksi tubuh dan interaksi sosial.";
    case 4:
      return "Dukungan apa yang paling Anda butuhkan saat ini?";
    default:
      return "";
  }
}

function Step1({ form, patch }: { form: FormState; patch: (p: Partial<FormState>) => void }) {
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label>Segmen Studi</Label>
        <RadioGroup
          value={form.segment}
          onValueChange={(v) => patch({ segment: v as ProfileType, hambatan: [] })}
          className="grid gap-2 sm:grid-cols-2"
        >
          <OptionCard
            id="seg-awal"
            value="awal"
            selected={form.segment === "awal"}
            title="Mahasiswa Semester Awal"
            hint="Semester 1–7"
          />
          <OptionCard
            id="seg-akhir"
            value="akhir"
            selected={form.segment === "akhir"}
            title="Mahasiswa Akhir / Skripsi"
            hint="Pengerjaan tugas akhir"
          />
        </RadioGroup>
      </div>

      {form.segment === "awal" ? (
        <div className="space-y-2">
          <Label>Semester saat ini</Label>
          <Select
            value={String(form.semester)}
            onValueChange={(v) => patch({ semester: Number(v), hambatan: [] })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Pilih semester" />
            </SelectTrigger>
            <SelectContent>
              {EARLY_SEMESTERS.map((n) => (
                <SelectItem key={n} value={String(n)}>
                  Semester {n}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : (
        <div className="space-y-2">
          <Label>Tahap Skripsi</Label>
          <Select
            value={form.thesisStage}
            onValueChange={(v) => patch({ thesisStage: v as ThesisStage })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Pilih tahap" />
            </SelectTrigger>
            <SelectContent>
              {THESIS_STAGES.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}

function Step2({ form, patch }: { form: FormState; patch: (p: Partial<FormState>) => void }) {
  const toggleMood = (m: string) =>
    patch({
      moods: form.moods.includes(m) ? form.moods.filter((x) => x !== m) : [...form.moods, m],
    });
  const enthLabel = form.segment === "akhir" ? "pengerjaan skripsi" : "perkuliahan";
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Perasaan hari ini (bisa pilih lebih dari satu)</Label>
        <div className="flex flex-wrap gap-2">
          {MOODS.map((m) => {
            const activeMood = form.moods.includes(m);
            return (
              <button
                key={m}
                type="button"
                onClick={() => toggleMood(m)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-sm transition-colors",
                  activeMood
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background hover:bg-muted",
                )}
              >
                {m}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Antusiasme terhadap {enthLabel}</Label>
          <span className="text-sm font-semibold text-primary">{form.enthusiasm}/5</span>
        </div>
        <Slider
          value={[form.enthusiasm]}
          min={1}
          max={5}
          step={1}
          onValueChange={([v]) => patch({ enthusiasm: v })}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Sangat rendah</span>
          <span>Sangat tinggi</span>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="burden">Beban Pikiran Utama (3 Hari Terakhir)</Label>
        <p className="text-xs text-muted-foreground">
          Ceritakan fokus check-in Anda — hal yang paling menyita pikiran belakangan ini.
        </p>
        <Textarea
          id="burden"
          rows={4}
          value={form.burden}
          onChange={(e) => patch({ burden: e.target.value })}
          placeholder="Ceritakan hal-hal yang paling mengganggu pikiran Anda…"
        />
      </div>
    </div>
  );
}

function Step3({ form, patch }: { form: FormState; patch: (p: Partial<FormState>) => void }) {
  const toggleAcademic = (v: string) => patch({ hambatan: toggleExclusive(form.hambatan, v) });
  const togglePersonal = (v: string) =>
    patch({ hambatanPersonal: toggleExclusive(form.hambatanPersonal, v) });

  const isAkhir = form.segment === "akhir";

  return (
    <div className="space-y-7">
      <div className="space-y-2">
        <Label>Interaksi dengan dosen</Label>
        <RadioGroup
          value={form.dosen}
          onValueChange={(v) => patch({ dosen: v })}
          className="space-y-2"
        >
          {DOSEN_OPTIONS.map((o) => (
            <RadioRow key={o.value} id={`dosen-${o.value}`} value={o.value} label={o.label} />
          ))}
        </RadioGroup>
      </div>

      <div className="space-y-3">
        <div>
          <Label>1. Hambatan Akademik & Adaptasi</Label>
          <p className="text-xs text-muted-foreground">
            {isAkhir
              ? "Ditampilkan sesuai fase Mahasiswa Akhir / Skripsi."
              : `Ditampilkan sesuai fase Semester ${form.semester}.`}
          </p>
        </div>

        {isAkhir ? (
          <div className="space-y-4">
            {HAMBATAN_SKRIPSI_GROUPS.map((g) => (
              <div key={g.title} className="space-y-2">
                <p className="text-sm font-semibold text-foreground">{g.title}</p>
                <CheckList
                  prefix="ham"
                  options={g.options}
                  selected={form.hambatan}
                  onToggle={toggleAcademic}
                />
              </div>
            ))}
            <CheckList
              prefix="ham"
              options={[{ value: "tidak_ada_akademik", label: "Tidak ada" }]}
              selected={form.hambatan}
              onToggle={toggleAcademic}
            />
          </div>
        ) : (
          <div className="space-y-4">
            <CheckList
              prefix="ham"
              options={HAMBATAN_AWAL.filter((o) => o.value !== "tidak_ada_akademik")}
              selected={form.hambatan}
              onToggle={toggleAcademic}
            />
            {form.semester === 7 && (
              <div className="space-y-2 rounded-lg border border-primary/30 bg-primary/5 p-3">
                <p className="text-sm font-semibold text-foreground">
                  Khusus Semester 7 — PKL / Magang
                </p>
                <CheckList
                  prefix="ham"
                  options={HAMBATAN_PKL}
                  selected={form.hambatan}
                  onToggle={toggleAcademic}
                />
              </div>
            )}
            <CheckList
              prefix="ham"
              options={[{ value: "tidak_ada_akademik", label: "Tidak ada" }]}
              selected={form.hambatan}
              onToggle={toggleAcademic}
            />
          </div>
        )}
      </div>

      <div className="space-y-3">
        <Label>2. Hambatan Personal</Label>
        <CheckList
          prefix="per"
          options={HAMBATAN_PERSONAL}
          selected={form.hambatanPersonal}
          onToggle={togglePersonal}
        />
      </div>
    </div>
  );
}

function Step4({ form, patch }: { form: FormState; patch: (p: Partial<FormState>) => void }) {
  return (
    <div className="space-y-7">
      <div className="space-y-2">
        <Label>Self-Reflection</Label>
        <p className="text-xs text-muted-foreground">
          Saat beban pikiran datang, apa yang biasanya Anda lakukan?
        </p>
        <CheckList
          prefix="ref"
          options={SELF_REFLECTION}
          selected={form.selfReflection}
          onToggle={(v) => patch({ selfReflection: toggleExclusive(form.selfReflection, v) })}
        />
      </div>

      <div className="space-y-2">
        <Label>1. Reaksi pada Tubuh</Label>
        <p className="text-xs text-muted-foreground">
          Saat beban pikiran itu menumpuk, keluhan pada tubuh seperti apa yang paling sering kamu rasakan beberapa hari terakhir?
        </p>
        <CheckList
          prefix="bod"
          options={BODY_REACTIONS}
          selected={form.bodyReactions}
          onToggle={(v) => patch({ bodyReactions: toggleExclusive(form.bodyReactions, v) })}
        />
      </div>

      <div className="space-y-2">
        <Label>2. Reaksi pada Interaksi Lingkungan</Label>
        <p className="text-xs text-muted-foreground">
          Saat beban pikiran tersebut datang, bagaimana dampaknya terhadap caramu berinteraksi dengan orang lain?
        </p>
        <CheckList
          prefix="soc"
          options={SOCIAL_REACTIONS}
          selected={form.socialReactions}
          onToggle={(v) => patch({ socialReactions: toggleExclusive(form.socialReactions, v) })}
        />
      </div>
    </div>
  );
}

function Step5({ form, patch }: { form: FormState; patch: (p: Partial<FormState>) => void }) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Kebutuhan Bantuan (bisa pilih beberapa)</Label>
        <CheckList
          prefix="help"
          options={HELP_NEEDS}
          selected={form.helpNeeds}
          onToggle={(v) => patch({ helpNeeds: toggleExclusive(form.helpNeeds, v) })}
        />
      </div>

      <div className="space-y-2">
        <Label>Kesediaan dihubungi</Label>
        <RadioGroup
          value={form.contact}
          onValueChange={(v) => patch({ contact: v })}
          className="space-y-2"
        >
          {CONTACT_OPTIONS.map((o) => (
            <RadioRow key={o.value} id={`ct-${o.value}`} value={o.value} label={o.label} />
          ))}
        </RadioGroup>
      </div>
    </div>
  );
}

function CheckList({
  prefix,
  options,
  selected,
  onToggle,
}: {
  prefix: string;
  options: Opt[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      {options.map((o) => (
        <CheckRow
          key={o.value}
          id={`${prefix}-${o.value}`}
          checked={selected.includes(o.value)}
          onChange={() => onToggle(o.value)}
          label={o.label}
        />
      ))}
    </div>
  );
}

function OptionCard({
  id,
  value,
  selected,
  title,
  hint,
}: {
  id: string;
  value: string;
  selected: boolean;
  title: string;
  hint: string;
}) {
  return (
    <Label
      htmlFor={id}
      className={cn(
        "flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors",
        selected ? "border-primary bg-primary/5" : "hover:bg-muted",
      )}
    >
      <RadioGroupItem id={id} value={value} className="mt-0.5" />
      <div className="min-w-0">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </div>
    </Label>
  );
}

function RadioRow({ id, value, label }: { id: string; value: string; label: string }) {
  return (
    <Label
      htmlFor={id}
      className="flex cursor-pointer items-center gap-3 rounded-md border p-2.5 hover:bg-muted"
    >
      <RadioGroupItem id={id} value={value} />
      <span className="text-sm">{label}</span>
    </Label>
  );
}

function CheckRow({
  id,
  checked,
  onChange,
  label,
}: {
  id: string;
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <Label
      htmlFor={id}
      className={cn(
        "flex cursor-pointer items-start gap-3 rounded-md border p-2.5 transition-colors",
        checked ? "border-primary bg-primary/5" : "hover:bg-muted",
      )}
    >
      <Checkbox id={id} checked={checked} onCheckedChange={onChange} className="mt-0.5 shrink-0" />
      <span className="text-sm leading-snug">{label}</span>
    </Label>
  );
}
