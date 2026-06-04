import { ScoringService } from './scoring.service';
import { PENALTY_TABLE } from './penalty.constants';

describe('ScoringService — pure logic', () => {
  describe('calculateNewScore', () => {
    it('clamps score to 0 minimum', () => {
      expect(ScoringService.calculateNewScore(5, -20)).toBe(0);
    });

    it('clamps score to 100 maximum', () => {
      expect(ScoringService.calculateNewScore(100, 10)).toBe(100);
    });

    it('applies negative delta correctly', () => {
      expect(ScoringService.calculateNewScore(100, -20)).toBe(80);
    });
  });

  describe('PENALTY_TABLE', () => {
    it('GOLDEN_RULE_VIOLATION delta is -20', () => {
      expect(PENALTY_TABLE.GOLDEN_RULE_VIOLATION.delta).toBe(-20);
    });

    it('FORCE_CLOSED_NO_CP delta is -50', () => {
      expect(PENALTY_TABLE.FORCE_CLOSED_NO_CP.delta).toBe(-50);
    });

    it('all deltas are negative', () => {
      Object.values(PENALTY_TABLE).forEach(({ delta }) => {
        expect(delta).toBeLessThan(0);
      });
    });
  });
});
