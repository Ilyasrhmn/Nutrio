export const checkpointDefinitions = [
  {
    id: "cp1",
    label: "Bahan Mentah",
    instruction: "Foto semua bahan yang diterima hari ini",
  },
  {
    id: "cp2",
    label: "Proses Masak",
    instruction: "Foto kondisi dapur dan proses memasak",
  },
  {
    id: "cp3",
    label: "Makanan Siap",
    instruction: "Foto makanan yang siap dikemas",
  },
  {
    id: "cp4",
    label: "Serah Terima",
    instruction: "Foto saat menyerahkan makanan ke sekolah",
  },
];

export const mockAIResults = [
  {
    status: "pass",
    score: 94,
    confidence: 0.91,
    notes: "Bahan terlihat segar, kondisi higienis baik",
    detectedItems: ["ayam", "sayuran hijau", "beras"],
  },
  {
    status: "pass",
    score: 88,
    confidence: 0.85,
    notes: "Dapur bersih, koki menggunakan APD lengkap",
    detectedItems: ["sarung tangan", "masker", "celemek"],
  },
  {
    status: "pass",
    score: 92,
    confidence: 0.89,
    notes: "Porsi sesuai standar, kemasan rapi",
    detectedItems: ["kotak makan", "buah pisang", "nasi ayam"],
  },
];
