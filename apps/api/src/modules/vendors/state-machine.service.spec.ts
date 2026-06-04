import { BadRequestException } from '@nestjs/common';
import { StateMachineService } from './state-machine.service';
import { VendorLifecycleStatus } from './entities/vendor.entity';

// Unit tests for the pure logic — no DB needed
describe('StateMachineService — transition logic', () => {
  let service: Partial<StateMachineService>;

  beforeEach(() => {
    service = {
      canTransition: StateMachineService.prototype.canTransition,
      getAllowedTransitions: StateMachineService.prototype.getAllowedTransitions,
    } as unknown as Partial<StateMachineService>;
  });

  describe('canTransition', () => {
    it('allows REGISTERED → PREPARING_DOCS', () => {
      expect(
        service.canTransition!(
          VendorLifecycleStatus.REGISTERED,
          VendorLifecycleStatus.PREPARING_DOCS,
        ),
      ).toBe(true);
    });

    it('blocks REGISTERED → ACTIVE (non-adjacent)', () => {
      expect(
        service.canTransition!(
          VendorLifecycleStatus.REGISTERED,
          VendorLifecycleStatus.ACTIVE,
        ),
      ).toBe(false);
    });

    it('allows UNDER_REVIEW → APPROVED', () => {
      expect(
        service.canTransition!(
          VendorLifecycleStatus.UNDER_REVIEW,
          VendorLifecycleStatus.APPROVED,
        ),
      ).toBe(true);
    });

    it('allows UNDER_REVIEW → REVISION_REQUESTED', () => {
      expect(
        service.canTransition!(
          VendorLifecycleStatus.UNDER_REVIEW,
          VendorLifecycleStatus.REVISION_REQUESTED,
        ),
      ).toBe(true);
    });

    it('allows REVISION_REQUESTED → PREPARING_DOCS (retry loop)', () => {
      expect(
        service.canTransition!(
          VendorLifecycleStatus.REVISION_REQUESTED,
          VendorLifecycleStatus.PREPARING_DOCS,
        ),
      ).toBe(true);
    });

    it('blocks REVOKED → anything', () => {
      const targets = Object.values(VendorLifecycleStatus).filter(
        (v) => v !== VendorLifecycleStatus.REVOKED,
      );
      for (const target of targets) {
        expect(
          service.canTransition!(VendorLifecycleStatus.REVOKED, target),
        ).toBe(false);
      }
    });

    it('allows ACTIVE → SUSPENDED', () => {
      expect(
        service.canTransition!(
          VendorLifecycleStatus.ACTIVE,
          VendorLifecycleStatus.SUSPENDED,
        ),
      ).toBe(true);
    });

    it('allows SUSPENDED → ACTIVE (reinstate)', () => {
      expect(
        service.canTransition!(
          VendorLifecycleStatus.SUSPENDED,
          VendorLifecycleStatus.ACTIVE,
        ),
      ).toBe(true);
    });
  });

  describe('resolvePortalRoute', () => {
    it('returns /portal/mission-control for ACTIVE', () => {
      expect(StateMachineService.resolvePortalRoute(VendorLifecycleStatus.ACTIVE)).toBe(
        '/portal/mission-control',
      );
    });

    it('returns /portal/onboarding for ONBOARDING', () => {
      expect(StateMachineService.resolvePortalRoute(VendorLifecycleStatus.ONBOARDING)).toBe(
        '/portal/onboarding',
      );
    });

    it('returns /eligibility for ANONYMOUS', () => {
      expect(StateMachineService.resolvePortalRoute(VendorLifecycleStatus.ANONYMOUS)).toBe(
        '/eligibility',
      );
    });
  });
});
