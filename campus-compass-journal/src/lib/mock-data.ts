export type UserRole = "mahasiswa" | "dosen" | "konselor" | "admin";
export type EwsStatus = "normal" | "akademik" | "konseling";
export type ProfileType = "awal" | "akhir";

export const THESIS_STAGES = [
  "Pengajuan/Revisi Judul",
  "Penyusunan Proposal (Bab 1-3)",
  "Pengambilan Data",
  "Analisis Data (Bab 4)",
  "Penyusunan Kesimpulan (Bab 5)",
  "Sidang Akhir",
] as const;

export type ThesisStage = (typeof THESIS_STAGES)[number];

export interface StudentProfile {
  nim: string;
  name: string;
  email: string;
  semester: number;
  profileType: ProfileType;
  thesisStage?: ThesisStage;
  ewsStatus: EwsStatus;
  avatar?: string;
}

export interface JournalEntry {
  id: string;
  studentNim: string;
  studentName: string;
  date: string; // ISO
  profileType: ProfileType;
  // awal fields
  academicMood?: number; // 1-5
  socialMood?: number;
  physicalHealth?: number;
  academicChallenges?: string;
  // akhir fields
  thesisStage?: ThesisStage;
  thesisProgress?: string;
  thesisBlockers?: string;
  // shared
  reflection: string;
  needsSupport: boolean;
  ewsResult: EwsStatus;
}

export const CURRENT_STUDENT: StudentProfile = {
  nim: "20210001",
  name: "Aisyah Putri",
  email: "aisyah.putri@kampus.ac.id",
  semester: 8,
  profileType: "akhir",
  thesisStage: "Analisis Data (Bab 4)",
  ewsStatus: "akademik",
};

export const MOCK_STUDENTS: StudentProfile[] = [
  CURRENT_STUDENT,
  {
    nim: "20230015",
    name: "Budi Santoso",
    email: "budi.s@kampus.ac.id",
    semester: 3,
    profileType: "awal",
    ewsStatus: "normal",
  },
  {
    nim: "20220042",
    name: "Citra Lestari",
    email: "citra.l@kampus.ac.id",
    semester: 5,
    profileType: "awal",
    ewsStatus: "konseling",
  },
  {
    nim: "20210088",
    name: "Dimas Prakoso",
    email: "dimas.p@kampus.ac.id",
    semester: 8,
    profileType: "akhir",
    thesisStage: "Penyusunan Proposal (Bab 1-3)",
    ewsStatus: "akademik",
  },
  {
    nim: "20240102",
    name: "Ergi Ramadhan",
    email: "ergi.r@kampus.ac.id",
    semester: 1,
    profileType: "awal",
    ewsStatus: "normal",
  },
];

export const MOCK_JOURNALS: JournalEntry[] = [
  {
    id: "j1",
    studentNim: "20210001",
    studentName: "Aisyah Putri",
    date: "2026-07-20T09:00:00Z",
    profileType: "akhir",
    thesisStage: "Analisis Data (Bab 4)",
    thesisProgress: "Menyelesaikan koding data wawancara.",
    thesisBlockers: "Sulit mendapatkan waktu bimbingan dengan dosen.",
    reflection: "Merasa tertekan dengan tenggat waktu.",
    needsSupport: true,
    ewsResult: "akademik",
  },
  {
    id: "j2",
    studentNim: "20210001",
    studentName: "Aisyah Putri",
    date: "2026-07-13T09:00:00Z",
    profileType: "akhir",
    thesisStage: "Analisis Data (Bab 4)",
    thesisProgress: "Mulai analisis tematik.",
    thesisBlockers: "",
    reflection: "Fokus kembali setelah libur singkat.",
    needsSupport: false,
    ewsResult: "normal",
  },
  {
    id: "j3",
    studentNim: "20220042",
    studentName: "Citra Lestari",
    date: "2026-07-22T14:00:00Z",
    profileType: "awal",
    academicMood: 2,
    socialMood: 1,
    physicalHealth: 2,
    academicChallenges: "Kesulitan mengikuti mata kuliah statistik.",
    reflection: "Merasa sendirian dan kehilangan motivasi.",
    needsSupport: true,
    ewsResult: "konseling",
  },
  {
    id: "j4",
    studentNim: "20230015",
    studentName: "Budi Santoso",
    date: "2026-07-21T10:00:00Z",
    profileType: "awal",
    academicMood: 4,
    socialMood: 4,
    physicalHealth: 5,
    academicChallenges: "",
    reflection: "Minggu yang produktif.",
    needsSupport: false,
    ewsResult: "normal",
  },
];

export const EWS_META: Record<
  EwsStatus,
  { label: string; description: string; bg: string; fg: string; ring: string }
> = {
  normal: {
    label: "Normal",
    description: "Kondisi akademik & kesejahteraan dalam batas sehat.",
    bg: "#dcfce7",
    fg: "#166534",
    ring: "#86efac",
  },
  akademik: {
    label: "Academic Support",
    description: "Perlu dukungan akademik dari dosen pembimbing.",
    bg: "#fef3c7",
    fg: "#92400e",
    ring: "#fcd34d",
  },
  konseling: {
    label: "Counseling Intervention",
    description: "Direkomendasikan mengikuti sesi konseling.",
    bg: "#fee2e2",
    fg: "#991b1b",
    ring: "#fca5a5",
  },
};
