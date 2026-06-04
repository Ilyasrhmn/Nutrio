export type AiFeature =
  | 'photo_validation'
  | 'llm_generate'
  | 'eligibility_roadmap'
  | 'debrief_narrative'
  | 'rag_query'
  | 'rag_proactive';

export interface MockVisionResult {
  pass: boolean;
  reason: string;
  confidence: number;
}

export interface MockLlmResult {
  text: string;
  sources?: string[];
}

export const MOCK_VISION: Record<string, MockVisionResult> = {
  default: {
    pass: true,
    reason: 'Foto memenuhi standar kebersihan dan kelengkapan.',
    confidence: 0.92,
  },
  cp1_cooking: {
    pass: true,
    reason: 'APD lengkap, suhu masak terlihat sesuai standar.',
    confidence: 0.88,
  },
  cp2_packaging: {
    pass: true,
    reason: 'Wadah tertutup rapat, kondisi higienis.',
    confidence: 0.91,
  },
  cp3_loading: {
    pass: true,
    reason: 'Makanan dimuat dengan benar, tidak ada kontaminasi terlihat.',
    confidence: 0.85,
  },
  cp4_delivery: {
    pass: true,
    reason: 'Serah terima terverifikasi, porsi sesuai.',
    confidence: 0.94,
  },
};

export const MOCK_LLM: Record<AiFeature, MockLlmResult> = {
  photo_validation: {
    text: 'Foto telah divalidasi dan memenuhi standar.',
  },
  llm_generate: {
    text: 'Berdasarkan analisis data, performa vendor berada dalam kondisi baik. Rekomendasi: pertahankan konsistensi standar kebersihan dan ketepatan waktu distribusi.',
    sources: ['Juknis BGN §3.2', 'SOP Sanitasi Dapur v1.0'],
  },
  eligibility_roadmap: {
    text: 'Berdasarkan jawaban Anda, berikut roadmap persiapan dokumen yang diperlukan untuk mendaftar sebagai vendor MBG.',
    sources: ['Permenkes 2/2023', 'Juknis BGN §2.1'],
  },
  debrief_narrative: {
    text: 'Hari ini berjalan dengan baik. Semua checkpoint selesai tepat waktu dan tidak ada penalti signifikan. Fokus untuk besok: pastikan suhu masak diperiksa dengan termometer kalibrasi.',
    sources: ['Data checkpoint hari ini', 'Standar BGN §5.3'],
  },
  rag_query: {
    text: 'Standar suhu masak daging dan unggas adalah minimal 75°C, diukur di bagian terdalam. Gunakan termometer food-grade yang terkalibrasi.',
    sources: ['SOP Standar Dapur MBG §4.2.1', 'Permenkes 2/2023 Pasal 7'],
  },
  rag_proactive: {
    text: 'Tips untuk tahap ini: pastikan semua dokumen memiliki masa berlaku minimal 1 tahun ke depan. Dokumen yang mendekati expired akan menyebabkan penalti skor.',
    sources: ['Juknis BGN §3.5'],
  },
};
