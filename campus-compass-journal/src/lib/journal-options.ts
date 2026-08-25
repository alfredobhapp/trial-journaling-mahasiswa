/**
 * Shared option catalogue for the student check-in questionnaire.
 * Values are stable keys stored in the database; labels are display text.
 */

export interface Opt {
  value: string;
  label: string;
}

export const MOODS = [
  "Tenang",
  "Semangat",
  "Cemas",
  "Sedih",
  "Lelah/Burnout",
  "Marah",
] as const;

export const NEGATIVE_MOODS = new Set(["Cemas", "Sedih", "Lelah/Burnout", "Marah"]);

export const DOSEN_OPTIONS: Opt[] = [
  { value: "komunikatif", label: "Komunikatif / Membantu" },
  { value: "cukup", label: "Cukup" },
  { value: "sulit", label: "Sulit Dihubungi" },
  { value: "cemas", label: "Takut / Cemas" },
  { value: "menghindar", label: "Menghindari Dosen" },
];

/** Hambatan akademik & adaptasi — semester 1–7 */
export const HAMBATAN_AWAL: Opt[] = [
  { value: "salah_jurusan", label: 'Merasa "salah jurusan" atau kehilangan minat pada program studi saat ini.' },
  { value: "adaptasi_belajar", label: "Kesulitan beradaptasi dengan gaya belajar di kampus atau cara mengajar dosen." },
  { value: "tugas_menumpuk", label: "Beban tugas, kuis, atau laporan praktikum yang menumpuk di waktu bersamaan." },
  { value: "nilai_ipk", label: "Kesulitan mempertahankan atau menaikkan nilai/IPK." },
  { value: "burnout_jadwal", label: "Burnout atau kelelahan ekstrem karena jadwal kuliah, organisasi, dan kepanitiaan." },
  { value: "kerja_sampingan", label: "Sulit menyeimbangkan waktu antara akademik dan pekerjaan sampingan (part-time)." },
  { value: "prokrastinasi", label: "Terjebak siklus menunda-nunda pekerjaan (procrastination) yang parah." },
  { value: "tidak_ada_akademik", label: "Tidak ada" },
];

/** Tambahan khusus semester 7 (PKL / Magang) */
export const HAMBATAN_PKL: Opt[] = [
  { value: "pkl_cari_tempat", label: "Kesulitan mencari atau diterima di tempat PKL/Magang yang sesuai." },
  { value: "pkl_adaptasi", label: "Kesulitan beradaptasi dengan lingkungan, budaya, atau tuntutan di tempat kerja/magang." },
  { value: "pkl_bagi_waktu", label: "Kewalahan membagi waktu antara jam kerja magang, membuat laporan PKL, dan sisa mata kuliah di kampus." },
  { value: "pkl_imposter", label: "Merasa tidak kompeten atau kurang skill saat terjun ke tempat magang (imposter syndrome)." },
];

export const HAMBATAN_SKRIPSI_GROUPS: { title: string; options: Opt[] }[] = [
  {
    title: "Hambatan Pengerjaan Skripsi / Tugas Akhir",
    options: [
      { value: "skripsi_stuck", label: "Mengalami stuck, kebingungan dalam mengolah data, analisis hasil, atau kendala dalam penelitian/praktikum." },
      { value: "skripsi_dosbing", label: "Kendala komunikasi dengan Dosen Pembimbing (sulit mendapat jadwal, revisi yang terus berubah, atau ekspektasi yang tidak sejalan)." },
      { value: "skripsi_burnout", label: "Kehilangan motivasi secara drastis (burnout tingkat akhir) dan merasa sangat lelah untuk melanjutkan sisa bab skripsi." },
      { value: "skripsi_perfeksionis", label: "Terlalu perfeksionis (takut salah) hingga akhirnya terus menunda-nunda menulis atau takut menyerahkan draf ke dosen." },
      { value: "tidak_ada_skripsi", label: "Tidak ada" },
    ],
  },
  {
    title: "Hambatan Ujian & Tekanan Kelulusan",
    options: [
      { value: "ujian_cemas", label: "Kecemasan berlebih (gugup, takut blank) membayangkan ujian sidang komprehensif atau pendadaran." },
      { value: "ujian_kompetensi", label: "Stres dan tekanan mental akibat harus menyeimbangkan revisi skripsi dengan persiapan belajar untuk ujian kompetensi profesi/sertifikasi kelulusan." },
      { value: "ujian_fomo", label: "Merasa tertinggal (FOMO) dan rendah diri ketika melihat teman-teman seangkatan sudah sidang, lulus, atau pamer foto kelulusan lebih dulu." },
    ],
  },
  {
    title: "Kecemasan Pasca-Kampus (Transisi Dunia Kerja)",
    options: [
      { value: "pasca_takut_fase", label: "Ketakutan menghadapi fase hidup selanjutnya (bingung mencari kerja, ragu apakah akan lanjut studi profesi, atau belum tahu passion sebenarnya)." },
      { value: "pasca_imposter", label: "Merasa ilmu, pengalaman praktik, atau skill yang didapat selama kuliah belum cukup untuk bersaing di dunia kerja yang sesungguhnya (imposter syndrome)." },
      { value: "pasca_tekanan_keluarga", label: 'Tekanan mental dari pertanyaan keluarga/orang sekitar yang terus menanyakan "Kapan lulus?", "Kapan sidang?", atau "Habis ini kerja di mana?".' },
    ],
  },
];

export const HAMBATAN_PERSONAL: Opt[] = [
  { value: "homesick", label: "Homesickness (rindu rumah), masalah dengan teman kos, atau kesulitan hidup mandiri." },
  { value: "toxic_pertemanan", label: "Dinamika pertemanan yang toxic, merasa terkucilkan, atau konflik kerja kelompok." },
  { value: "finansial", label: "Kendala finansial (biaya UKT, uang saku menipis, atau biaya tak terduga untuk tugas/magang)." },
  { value: "fomo_banding", label: "Kecemasan berlebih membandingkan pencapaian diri dengan teman sebaya (FOMO / krisis percaya diri)." },
  { value: "tidak_ada_personal", label: "Tidak ada" },
];

export const SELF_REFLECTION: Opt[] = [
  { value: "isolasi_kamar", label: "Mengisolasi diri / mengurung diri di kamar dan tidak ingin diganggu." },
  { value: "doomscrolling", label: "Doomscrolling (bermain media sosial berjam-jam tanpa henti)." },
  { value: "bercerita", label: "Bercerita/mengeluh kepada teman, keluarga, atau pacar." },
  { value: "pola_makan", label: "Makan terlalu banyak (emotional eating) atau malah kehilangan nafsu makan." },
  { value: "hustle_culture", label: "Memaksakan diri untuk terus bekerja/belajar sampai mengabaikan jam tidur (hustle culture)." },
  { value: "kegiatan_positif", label: "Mencari kegiatan positif (olahraga, hobi, jalan-jalan)." },
  { value: "tidur_seharian", label: "Menghindari masalah dengan tidur seharian." },
  { value: "tidak_ada_refleksi", label: "Tidak ada" },
];

export const NEGATIVE_SELF_REFLECTION = new Set([
  "isolasi_kamar",
  "doomscrolling",
  "pola_makan",
  "hustle_culture",
  "tidur_seharian",
]);

export const BODY_REACTIONS: Opt[] = [
  { value: "kelelahan_semu", label: "Kelelahan Semu: Merasa sangat lelah, berat, atau lemas tidak bertenaga, padahal tidak melakukan banyak aktivitas fisik yang berat." },
  { value: "pola_tidur", label: "Gangguan Pola Tidur: Kesulitan tidur (insomnia), sering terbangun di tengah malam, atau sebaliknya (ingin tidur terus-menerus karena lelah mental)." },
  { value: "jantung_napas", label: "Reaksi Jantung & Pernapasan: Perasaan cemas yang diikuti gejala fisik seperti dada berdebar-debar, atau napas terasa sesak/pendek." },
  { value: "otot_saraf", label: "Ketegangan Saraf & Otot: Kepala terasa pusing/berat karena terus-menerus overthinking, leher/pundak kaku, atau rahang menegang." },
  { value: "pencernaan", label: "Gangguan Pencernaan & Pola Makan: Asam lambung naik (maag), mual saat stres, makan terlalu banyak (emotional eating), atau kehilangan nafsu makan sama sekali." },
  { value: "tidak_ada_tubuh", label: "Tidak ada keluhan, sehat" },
];

export const SOCIAL_REACTIONS: Opt[] = [
  { value: "menarik_diri", label: "Menarik Diri (Isolasi): Sengaja menjauh dari lingkungan, malas membalas pesan, membatalkan janji, atau mengurung diri di kamar." },
  { value: "iritabilitas", label: "Sumbu Pendek (Iritabilitas): Menjadi sangat sensitif, mudah tersinggung, mudah marah, atau tanpa sadar membentak teman/keluarga/rekan kerja." },
  { value: "apatis", label: "Mati Rasa Sosial (Apatis): Merasa hampa (numb), kehilangan minat untuk mengobrol, dan merasa tidak peduli dengan apa yang terjadi di sekitarmu." },
  { value: "ghosting", label: "Menghindari Tanggung Jawab Sosial: Sengaja menghilang (ghosting) dari grup tugas/organisasi karena merasa sudah terlalu penuh dan tidak sanggup merespons." },
  { value: "proyeksi", label: "Pelampiasan Emosi (Proyeksi): Mudah menangis di depan orang lain tanpa alasan yang jelas, atau melampiaskan kekesalan pada orang yang tidak ada hubungannya dengan masalahmu." },
  { value: "tidak_ada_sosial", label: "Tidak ada" },
];

export const HELP_NEEDS: Opt[] = [
  { value: "diskusi_akademik", label: "Diskusi Akademik" },
  { value: "ruang_aman", label: "Ruang aman untuk didengarkan tanpa dihakimi (Hanya ingin venting/curhat)." },
  { value: "saran_praktis", label: "Saran atau solusi praktis untuk masalah yang sedang saya hadapi." },
  { value: "prioritas_jadwal", label: "Bantuan untuk menyusun prioritas dan mengatur jadwal (manajemen waktu)." },
  { value: "relaksasi", label: "Bantuan untuk menenangkan diri (teknik relaksasi, regulasi emosi)." },
  { value: "me_time", label: "Waktu istirahat (me-time) tanpa gangguan dari siapapun." },
  { value: "tidak_ada_bantuan", label: "Tidak ada" },
];

export const CONTACT_OPTIONS: Opt[] = [
  { value: "segera", label: "Butuh bantuan segera" },
  { value: "tidak_mendesak", label: "Ya, tapi tidak mendesak" },
  { value: "jangan", label: "Tidak ingin diganggu" },
];

/** Values that represent an explicit "Tidak ada" answer. */
export const NONE_VALUES = new Set([
  "tidak_ada_akademik",
  "tidak_ada_skripsi",
  "tidak_ada_personal",
  "tidak_ada_refleksi",
  "tidak_ada_tubuh",
  "tidak_ada_sosial",
  "tidak_ada_bantuan",
]);

const ALL_OPTS: Opt[] = [
  ...DOSEN_OPTIONS,
  ...HAMBATAN_AWAL,
  ...HAMBATAN_PKL,
  ...HAMBATAN_SKRIPSI_GROUPS.flatMap((g) => g.options),
  ...HAMBATAN_PERSONAL,
  ...SELF_REFLECTION,
  ...BODY_REACTIONS,
  ...SOCIAL_REACTIONS,
  ...HELP_NEEDS,
  ...CONTACT_OPTIONS,
];

const LABEL_BY_VALUE = new Map(ALL_OPTS.map((o) => [o.value, o.label]));

/** Resolve a stored value to its human label (falls back to the raw value). */
export function labelOf(value: string): string {
  return LABEL_BY_VALUE.get(value) ?? value;
}

export function labelsOf(values: string[] | null | undefined): string {
  if (!values || values.length === 0) return "-";
  return values.map(labelOf).join("; ");
}
