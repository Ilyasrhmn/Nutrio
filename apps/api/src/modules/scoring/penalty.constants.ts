export type PenaltyEventType =
  | 'GOLDEN_RULE_VIOLATION'
  | 'AI_VALIDATION_FAIL_3X'
  | 'FORCE_CLOSED_NO_CP'
  | 'SCHOOL_COMPLAINT'
  | 'CP_LATE_START'
  | 'DELIVERY_LATE'
  | 'PHOTO_QUALITY_POOR';

export const PENALTY_TABLE: Record<PenaltyEventType, { delta: number; reason: string; ref: string }> = {
  GOLDEN_RULE_VIOLATION: {
    delta: -20,
    reason: 'CP2 disubmit lebih dari 4 jam setelah CP1',
    ref: 'PRD §5.6.A',
  },
  AI_VALIDATION_FAIL_3X: {
    delta: -5,
    reason: 'Foto gagal validasi AI 3 kali berturut-turut',
    ref: 'PRD §5.6.B',
  },
  FORCE_CLOSED_NO_CP: {
    delta: -50,
    reason: 'Tidak ada checkpoint selesai — force close jam 14:00',
    ref: 'PRD §5.6.C',
  },
  SCHOOL_COMPLAINT: {
    delta: -10,
    reason: 'Sekolah melaporkan masalah pada konfirmasi pengiriman',
    ref: 'PRD §5.6.D',
  },
  CP_LATE_START: {
    delta: -5,
    reason: 'CP1 dimulai setelah jam 10:00',
    ref: 'PRD §5.6.E',
  },
  DELIVERY_LATE: {
    delta: -15,
    reason: 'Token pengiriman kedaluwarsa sebelum digunakan',
    ref: 'PRD §5.6.F',
  },
  PHOTO_QUALITY_POOR: {
    delta: -3,
    reason: 'Kualitas foto di bawah standar (confidence AI < 0.5)',
    ref: 'PRD §5.6.G',
  },
};

export const BASE_DISBURSEMENT_RATE = 30_000; // IDR per porsi
