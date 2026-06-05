import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EligibilitySession } from './entities/eligibility-session.entity';
import { SaveAnswerDto } from './dto/save-answer.dto';
import { PersonalRoadmap, DocumentRequirement, RoadmapFlag } from '@workspace/common';

@Injectable()
export class EligibilityService {
  constructor(
    @InjectRepository(EligibilitySession)
    private readonly sessionRepo: Repository<EligibilitySession>,
  ) {}

  async createSession(): Promise<{ sessionToken: string }> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const session = this.sessionRepo.create({ expiresAt });
    const saved = await this.sessionRepo.save(session);
    return { sessionToken: saved.sessionToken };
  }

  async saveAnswer(token: string, dto: SaveAnswerDto): Promise<EligibilitySession> {
    const session = await this.sessionRepo.findOne({
      where: { sessionToken: token },
    });

    if (!session || session.expiresAt < new Date()) {
      throw new NotFoundException('Eligibility session not found or expired');
    }

    session.answers = { ...session.answers, [dto.questionId]: dto.answer };
    return this.sessionRepo.save(session);
  }

  async generateRoadmap(token: string): Promise<PersonalRoadmap> {
    const session = await this.sessionRepo.findOne({
      where: { sessionToken: token },
    });

    if (!session || session.expiresAt < new Date()) {
      throw new NotFoundException('Eligibility session not found or expired');
    }

    const roadmap = this.generateRuleBasedRoadmap(session.answers);
    session.roadmapResult = roadmap;
    await this.sessionRepo.save(session);
    return roadmap;
  }

  async getSession(token: string): Promise<EligibilitySession> {
    const session = await this.sessionRepo.findOne({
      where: { sessionToken: token },
    });

    if (!session) {
      throw new NotFoundException('Eligibility session not found');
    }

    return session;
  }

  private generateRuleBasedRoadmap(answers: Record<string, string>): PersonalRoadmap {
    const docsHave: string[] = [];
    const docsInProgress: DocumentRequirement[] = [];
    const docsMissing: DocumentRequirement[] = [];
    const flags: RoadmapFlag[] = [];

    const nibStatus = answers['q2_nib_status'];
    if (nibStatus === 'active') {
      docsHave.push('NIB (Nomor Induk Berusaha)');
    } else if (nibStatus === 'in_progress') {
      docsInProgress.push({
        name: 'NIB (Nomor Induk Berusaha)',
        estimatedDays: 7,
        estimatedCost: 0,
        regulationRef: 'PP 5/2021 tentang OSS',
      });
    } else if (nibStatus === 'none') {
      docsMissing.push({
        name: 'NIB (Nomor Induk Berusaha)',
        estimatedDays: 14,
        estimatedCost: 0,
        regulationRef: 'PP 5/2021 tentang OSS',
      });
    }

    const npwpStatus = answers['q3_npwp_status'];
    if (npwpStatus === 'active') {
      docsHave.push('NPWP');
    } else if (npwpStatus === 'in_progress') {
      docsInProgress.push({
        name: 'NPWP',
        estimatedDays: 7,
        estimatedCost: 0,
        regulationRef: 'UU PPh & PMK',
      });
    } else if (npwpStatus === 'none') {
      docsMissing.push({
        name: 'NPWP',
        estimatedDays: 7,
        estimatedCost: 0,
        regulationRef: 'UU PPh & PMK',
      });
    }

    const slhsStatus = answers['q4_slhs_status'];
    if (slhsStatus === 'active') {
      docsHave.push('SLHS (Sertifikat Laik Higiene Sanitasi)');
    } else if (slhsStatus === 'expired') {
      docsInProgress.push({
        name: 'Perpanjangan SLHS',
        estimatedDays: 21,
        estimatedCost: 500000,
        regulationRef: 'Permenkes 14/2021',
      });
      flags.push({
        type: 'warning',
        message: 'SLHS Anda sudah expired. Perpanjangan diperlukan sebelum mendaftar.',
      });
    } else if (slhsStatus === 'none') {
      docsMissing.push({
        name: 'SLHS (Sertifikat Laik Higiene Sanitasi)',
        estimatedDays: 30,
        estimatedCost: 500000,
        regulationRef: 'Permenkes 14/2021',
      });
    }

    const halalStatus = answers['q5_halal_status'];
    if (halalStatus === 'certified') {
      docsHave.push('Sertifikat Halal BPJPH/MUI');
    } else if (halalStatus === 'in_progress') {
      docsInProgress.push({
        name: 'Sertifikat Halal BPJPH/MUI',
        estimatedDays: 30,
        estimatedCost: 1800000,
        regulationRef: 'UU 33/2014 tentang JPH',
      });
    } else if (halalStatus === 'none') {
      docsMissing.push({
        name: 'Sertifikat Halal BPJPH/MUI',
        estimatedDays: 45,
        estimatedCost: 1800000,
        regulationRef: 'UU 33/2014 tentang JPH',
      });
      flags.push({
        type: 'info',
        message: 'Sertifikasi Halal sangat disarankan. BGN memprioritaskan vendor bersertifikat halal.',
      });
    }

    const capacityAnswer = answers['q6_daily_capacity'];
    if (capacityAnswer === 'below_500') {
      flags.push({
        type: 'critical',
        message:
          'Kapasitas dapur Anda di bawah minimum 500 porsi/hari. Pertimbangkan untuk meningkatkan kapasitas atau bermitra dengan dapur lain.',
      });
    }

    const totalDocs = docsHave.length + docsInProgress.length + docsMissing.length;
    const eligibilityScore =
      totalDocs === 0
        ? 100
        : Math.round(((docsHave.length + docsInProgress.length * 0.5) / totalDocs) * 100);

    const estimatedDaysToReady =
      docsMissing.length > 0
        ? Math.max(...docsMissing.map((d) => d.estimatedDays ?? 0))
        : 0;

    let recommendedNextStep: string;
    if (docsMissing.length > 0) {
      const first = docsMissing[0];
      recommendedNextStep = `Mulai dengan mengurus ${first!.name} terlebih dahulu (estimasi ${first!.estimatedDays ?? 0} hari kerja).`;
    } else if (docsInProgress.length > 0) {
      recommendedNextStep =
        'Selesaikan proses dokumen yang sedang berjalan, lalu daftarkan usaha Anda.';
    } else {
      recommendedNextStep = 'Semua dokumen sudah siap! Daftarkan usaha Anda sekarang.';
    }

    return {
      docsHave,
      docsInProgress,
      docsMissing,
      flags,
      eligibilityScore,
      estimatedDaysToReady,
      recommendedNextStep,
    };
  }
}
