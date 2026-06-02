export const mockPublicStats = {
  totalSPPG: 1580,
  targetSPPG: 25570,
  totalPenerima: 285400,
  complianceRate: 87.3,
  totalDana: 2300000000,
  topVendors: [
    { name: "Catering Berkah", score: 98, location: "Jakarta Selatan" },
    { name: "Dapur Sehat Bu Sari", score: 96, location: "Pontianak Barat" },
    { name: "Warung Makan Sedap", score: 95, location: "Bandung" },
    { name: "Catering Maju Jaya", score: 94, location: "Surabaya" },
    { name: "Dapur Ibu", score: 93, location: "Medan" },
  ],
  recentAudits: [
    { hash: "0x4a7f...", vendor: "Dapur Bu Sari", action: "CP4 Selesai", time: "10:47 WIB", status: "success" },
    { hash: "0x9b2c...", vendor: "Catering Maju", action: "PO Dibayar", time: "10:12 WIB", status: "success" },
    { hash: "0x3e1d...", vendor: "Warung Sedap", action: "CP1 Selesai", time: "09:30 WIB", status: "success" },
  ],
};

export const mockSchools = [
  { id: "sch-001", name: "SDN 01 Pontianak", address: "Jl. Merdeka No. 1" },
  { id: "sch-002", name: "SMPN 05 Pontianak", address: "Jl. Sudirman No. 45" },
  { id: "sch-003", name: "SDN 12 Pontianak Barat", address: "Jl. Veteran No. 12" },
];

export const mockSPPGs = [
  { id: "sppg-001", name: "Dapur Sehat Bu Sari", location: "Pontianak Barat" },
  { id: "sppg-002", name: "Catering Berkah", location: "Pontianak Kota" },
  { id: "sppg-003", name: "Warung Makan Sedap", location: "Pontianak Selatan" },
];

export const mockTraceabilityData: Record<string, any> = {
  "sch-001": {
    name: "SDN 01 Pontianak",
    daily: {
      date: "20 Mar 2026",
      status: "Terkirim",
      menu: "Nasi + Ayam Goreng + Sayur",
      porsi: 180,
      compliance: 95,
      vendor: "Dapur Sehat Bu Sari",
    },
    weekly: [
      { date: "20 Mar", score: 95, status: "Lengkap" },
      { date: "19 Mar", score: 92, status: "Lengkap" },
      { date: "18 Mar", score: 88, status: "Lengkap" },
      { date: "17 Mar", score: 90, status: "Lengkap" },
      { date: "16 Mar", score: 94, status: "Lengkap" },
    ]
  },
  "sppg-001": {
    name: "Dapur Sehat Bu Sari",
    daily: {
      date: "20 Mar 2026",
      status: "Aktif",
      menu: "Nasi + Ayam Goreng + Sayur",
      porsiTotal: 450,
      compliance: 96,
      schools: ["SDN 01 Pontianak", "SDN 12 Pontianak Barat"],
    },
    weekly: [
      { date: "20 Mar", score: 96, status: "Lengkap" },
      { date: "19 Mar", score: 94, status: "Lengkap" },
      { date: "18 Mar", score: 95, status: "Lengkap" },
      { date: "17 Mar", score: 92, status: "Lengkap" },
      { date: "16 Mar", score: 93, status: "Lengkap" },
    ]
  }
};
