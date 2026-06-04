export interface EligibilityQuestion {
  id: string;
  text: string;
  hint?: string;
  options: Array<{ value: string; label: string }>;
}

export const ELIGIBILITY_QUESTIONS: EligibilityQuestion[] = [
  {
    id: 'q1_business_type',
    text: 'Apa tipe badan usaha Anda?',
    hint: 'Pilih jenis badan usaha yang terdaftar secara hukum.',
    options: [
      { value: 'PT', label: 'PT (Perseroan Terbatas)' },
      { value: 'CV', label: 'CV (Commanditaire Vennootschap)' },
      { value: 'Koperasi', label: 'Koperasi' },
      { value: 'Yayasan', label: 'Yayasan' },
      { value: 'Perorangan', label: 'Perorangan / Usaha Dagang' },
    ],
  },
  {
    id: 'q2_nib_status',
    text: 'Bagaimana status NIB (Nomor Induk Berusaha) usaha Anda?',
    hint: 'NIB diterbitkan melalui sistem OSS (Online Single Submission).',
    options: [
      { value: 'active', label: 'Sudah aktif' },
      { value: 'in_progress', label: 'Sedang dalam proses pengurusan' },
      { value: 'none', label: 'Belum memiliki' },
    ],
  },
  {
    id: 'q3_npwp_status',
    text: 'Bagaimana status NPWP usaha Anda?',
    hint: 'NPWP badan usaha atau NPWP pribadi bagi usaha perorangan.',
    options: [
      { value: 'active', label: 'Sudah aktif' },
      { value: 'in_progress', label: 'Sedang dalam proses pengurusan' },
      { value: 'none', label: 'Belum memiliki' },
    ],
  },
  {
    id: 'q4_slhs_status',
    text: 'Bagaimana status SLHS (Sertifikat Laik Higiene Sanitasi) usaha Anda?',
    hint: 'SLHS diterbitkan oleh Dinas Kesehatan setempat sesuai Permenkes 14/2021.',
    options: [
      { value: 'active', label: 'Sudah aktif dan berlaku' },
      { value: 'expired', label: 'Sudah expired / kadaluarsa' },
      { value: 'none', label: 'Belum memiliki' },
    ],
  },
  {
    id: 'q5_halal_status',
    text: 'Bagaimana status Sertifikat Halal usaha Anda?',
    hint: 'Sertifikasi Halal dikeluarkan oleh BPJPH bekerja sama dengan MUI.',
    options: [
      { value: 'certified', label: 'Sudah bersertifikat halal' },
      { value: 'in_progress', label: 'Sedang dalam proses sertifikasi' },
      { value: 'none', label: 'Belum memiliki' },
    ],
  },
  {
    id: 'q6_daily_capacity',
    text: 'Berapa kapasitas produksi harian dapur Anda?',
    hint: 'Estimasi jumlah porsi makanan yang dapat diproduksi per hari.',
    options: [
      { value: 'below_500', label: 'Di bawah 500 porsi/hari' },
      { value: '500_1000', label: '500 – 1.000 porsi/hari' },
      { value: '1001_2000', label: '1.001 – 2.000 porsi/hari' },
      { value: 'above_2000', label: 'Di atas 2.000 porsi/hari' },
    ],
  },
  {
    id: 'q7_operating_area',
    text: 'Di wilayah mana usaha Anda beroperasi?',
    hint: 'Pilih wilayah utama tempat dapur Anda beroperasi.',
    options: [
      { value: 'jabodetabek', label: 'Jabodetabek' },
      { value: 'jabar', label: 'Jawa Barat (luar Jabodetabek)' },
      { value: 'jateng_diy', label: 'Jawa Tengah & DI Yogyakarta' },
      { value: 'jatim', label: 'Jawa Timur' },
      { value: 'sumatera', label: 'Sumatera' },
      { value: 'other', label: 'Wilayah lainnya' },
    ],
  },
];
