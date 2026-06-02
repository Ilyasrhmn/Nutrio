import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ScoringService } from '../scoring/scoring.service';
import { CheckpointsService } from '../checkpoints/checkpoints.service';
import { RealtimeService } from '../realtime/realtime.service';

@Injectable()
export class MissionControlService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly scoringService: ScoringService,
    private readonly checkpointsService: CheckpointsService,
    private readonly realtimeService: RealtimeService,
  ) {}

  private todayString() {
    return new Date().toISOString().split('T')[0];
  }

  async getToday(vendorId: string) {
    const today = this.todayString();

    const { score, events } = await this.scoringService.getCurrentScore(vendorId);
    const disbursementEstimate = await this.scoringService.getDisbursementEstimate(vendorId);

    const [sppg] = await this.dataSource.query(
      `SELECT id, target_porsi, assigned_schools FROM sppg_locations WHERE vendor_id = $1 AND is_active = true LIMIT 1`,
      [vendorId],
    );
    const targetPorsi: number = sppg?.target_porsi ?? 100;
    const sekolahList: string[] = sppg?.assigned_schools ?? [];

    const checkpoints = await this.checkpointsService.getCheckpointState(vendorId);
    const cpMatrix = sekolahList.map((school: string) => ({
      sekolahId: school,
      sekolahName: school,
      cp1: checkpoints.find(c => c.cpType === 'CP1')?.cpStatus ?? 'pending',
      cp2: checkpoints.find(c => c.cpType === 'CP2')?.cpStatus ?? 'pending',
      cp3: checkpoints.find(c => c.cpType === 'CP3')?.cpStatus ?? 'pending',
      cp4: checkpoints.find(c => c.cpType === 'CP4')?.cpStatus ?? 'pending',
    }));
    if (cpMatrix.length === 0) {
      cpMatrix.push({
        sekolahId: 'default',
        sekolahName: 'Sekolah (belum dikonfigurasi)',
        cp1: checkpoints.find(c => c.cpType === 'CP1')?.cpStatus ?? 'pending',
        cp2: checkpoints.find(c => c.cpType === 'CP2')?.cpStatus ?? 'pending',
        cp3: checkpoints.find(c => c.cpType === 'CP3')?.cpStatus ?? 'pending',
        cp4: checkpoints.find(c => c.cpType === 'CP4')?.cpStatus ?? 'pending',
      });
    }

    const history = await this.scoringService.getHistory(vendorId, 30);
    let streak = 0;
    for (const rec of history) {
      if ((rec.scoreFinal ?? rec.scoreCurrent) >= 80) streak++;
      else break;
    }

    const alerts = await this.dataSource.query(
      `SELECT id, severity, alert_type, title, body, created_at
       FROM alerts
       WHERE vendor_id = $1 AND is_read = false
       ORDER BY created_at DESC LIMIT 10`,
      [vendorId],
    );

    const presence = this.realtimeService.getPresenceForVendor(vendorId);

    const teamMembers = await this.dataSource.query(
      `SELECT u.id, u.full_name, vtm.role
       FROM vendor_team_members vtm
       JOIN users u ON vtm.user_id = u.id
       WHERE vtm.vendor_id = $1 AND vtm.status = 'accepted'`,
      [vendorId],
    );
    const onlineUserIds = new Set(presence.map(p => p.userId));
    const team = teamMembers.map((m: { id: string; full_name: string; role: string }) => ({
      userId: m.id,
      name: m.full_name,
      role: m.role,
      isOnline: onlineUserIds.has(m.id),
    }));

    return {
      scoreDate: today,
      targetPorsi,
      menu: 'Nasi + Lauk Pauk',
      sekolahList,
      team,
      cpMatrix,
      score,
      scoreEvents: events.slice(0, 5),
      scoreStreak: streak,
      disbursementEstimate,
      alerts,
    };
  }

  async getTeamPresence(vendorId: string) {
    return this.realtimeService.getPresenceForVendor(vendorId);
  }
}
