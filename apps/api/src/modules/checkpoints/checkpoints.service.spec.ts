import { CheckpointsService } from './checkpoints.service';
import { CpType } from './entities/checkpoint-event.entity';

describe('CheckpointsService — pure logic', () => {
  describe('cpOrderIndex', () => {
    it('CP1 = 0, CP2 = 1, CP3 = 2, CP4 = 3', () => {
      expect(CheckpointsService.cpOrderIndex('CP1')).toBe(0);
      expect(CheckpointsService.cpOrderIndex('CP2')).toBe(1);
      expect(CheckpointsService.cpOrderIndex('CP3')).toBe(2);
      expect(CheckpointsService.cpOrderIndex('CP4')).toBe(3);
    });
  });

  describe('isPreviousCpRequired', () => {
    it('CP1 has no prerequisite', () => {
      expect(CheckpointsService.previousCpRequired('CP1')).toBeNull();
    });
    it('CP2 requires CP1', () => {
      expect(CheckpointsService.previousCpRequired('CP2')).toBe('CP1');
    });
    it('CP4 requires CP3', () => {
      expect(CheckpointsService.previousCpRequired('CP4')).toBe('CP3');
    });
  });
});
