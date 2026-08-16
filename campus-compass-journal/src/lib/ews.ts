import {
  NEGATIVE_MOODS,
  NEGATIVE_SELF_REFLECTION,
  NONE_VALUES,
} from "./journal-options";

export type EwsResult = "normal" | "akademik" | "konseling";

export interface EwsInput {
  moods: string[];
  enthusiasm: number;
  dosen: string;
  hambatan: string[];
  hambatanPersonal: string[];
  selfReflection: string[];
  bodyReactions: string[];
  socialReactions: string[];
  helpNeeds: string[];
  contact: string;
}

const real = (list: string[]) => list.filter((v) => !NONE_VALUES.has(v));

/** Weighted Early Warning System scoring shared by client preview and server. */
export function computeEws(f: EwsInput): EwsResult {
  if (f.contact === "segera") return "konseling";
  if (f.helpNeeds.includes("relaksasi") && f.enthusiasm <= 2) return "konseling";

  let risk = 0;

  const negMoods = f.moods.filter((m) => NEGATIVE_MOODS.has(m)).length;
  if (negMoods >= 2) risk += 2;
  else if (negMoods === 1) risk += 1;

  if (f.enthusiasm <= 2) risk += 2;
  else if (f.enthusiasm === 3) risk += 1;

  if (f.dosen === "sulit" || f.dosen === "cemas" || f.dosen === "menghindar") risk += 1;

  const academic = real(f.hambatan).length;
  if (academic >= 3) risk += 2;
  else if (academic >= 1) risk += 1;

  const personal = real(f.hambatanPersonal).length;
  if (personal >= 2) risk += 2;
  else if (personal === 1) risk += 1;

  const negReflection = f.selfReflection.filter((v) => NEGATIVE_SELF_REFLECTION.has(v)).length;
  if (negReflection >= 3) risk += 2;
  else if (negReflection >= 1) risk += 1;

  const body = f.bodyReactions.length;
  if (body >= 3) risk += 2;
  else if (body >= 1) risk += 1;

  const social = real(f.socialReactions).length;
  if (social >= 3) risk += 2;
  else if (social >= 1) risk += 1;

  if (f.helpNeeds.includes("ruang_aman") || f.helpNeeds.includes("relaksasi")) risk += 1;
  if (f.contact === "tidak_mendesak") risk += 1;

  if (risk >= 8) return "konseling";
  if (risk >= 4) return "akademik";
  return "normal";
}
