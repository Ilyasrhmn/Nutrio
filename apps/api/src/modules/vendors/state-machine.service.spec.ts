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
      getTimeline: StateMachineService.prototype.getTimeline,
      lifecycleEventRepo: {
        find: jest.fn().mockResolvedValue([
          {
            fromStatus: VendorLifecycleStatus.REGISTERED,
            toStatus: VendorLifecycleStatus.PREPARING_DOCS,
            actorType: 'system',
            actorUserId: null,
            reason: null,
            correlationId: 'correlation-id',
            createdAt: new Date('2026-07-26T00:00:00.000Z'),
          },
        ]),
      },
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

  describe('getTimeline', () => {
    it('returns lifecycle events in reverse chronological order', async () => {
      const vendorId = 'vendor-id';

      expect(await service.getTimeline!(vendorId)).toEqual([
        expect.objectContaining({
          from: VendorLifecycleStatus.REGISTERED,
          to: VendorLifecycleStatus.PREPARING_DOCS,
          actorType: 'system',
        }),
      ]);
    });
  });

  describe('advanceTo', () => {
    const vendorId = 'vendor-id';
    let lifecycleStatus: VendorLifecycleStatus;
    let persistedEvents: Array<{
      fromStatus: VendorLifecycleStatus;
      toStatus: VendorLifecycleStatus;
      actorType: string;
      actorUserId: string | null;
      reason: string;
      correlationId: string;
      createdAt: Date;
    }>;
    let advanceService: StateMachineService;

    beforeEach(() => {
      lifecycleStatus = VendorLifecycleStatus.REGISTERED;
      persistedEvents = [];
      const eventRepository = {
        find: jest.fn().mockImplementation(async () => [...persistedEvents].reverse()),
      };
      const manager = {
        insert: jest.fn().mockImplementation(async (_entity, event) => {
          persistedEvents.push({ ...event, createdAt: new Date() });
        }),
        query: jest.fn().mockImplementation(async (query: string, params?: unknown[]) => {
          if (query.includes('FOR UPDATE')) {
            return [{ id: vendorId, lifecycle_status: lifecycleStatus }];
          }
          if (query.includes('UPDATE vendors')) {
            lifecycleStatus = params![0] as VendorLifecycleStatus;
          }
          return [];
        }),
      };
      advanceService = new StateMachineService(
        {} as never,
        eventRepository as never,
        {
          transaction: async (callback: (transactionManager: typeof manager) => unknown) =>
            callback(manager),
        } as never,
      );
    });

    it('advances REGISTERED to ACTIVE through eight legal persisted transitions', async () => {
      await expect(
        advanceService.advanceTo(
          vendorId,
          VendorLifecycleStatus.ACTIVE,
          null,
          'system',
          'demo readiness',
          'corr-1',
        ),
      ).resolves.toHaveLength(8);

      expect(lifecycleStatus).toBe(VendorLifecycleStatus.ACTIVE);
      expect(persistedEvents.map((event) => event.toStatus)).toEqual([
        VendorLifecycleStatus.PREPARING_DOCS,
        VendorLifecycleStatus.DOCS_SUBMITTED,
        VendorLifecycleStatus.INSPECTION_SCHEDULED,
        VendorLifecycleStatus.INSPECTION_COMPLETED,
        VendorLifecycleStatus.UNDER_REVIEW,
        VendorLifecycleStatus.APPROVED,
        VendorLifecycleStatus.ONBOARDING,
        VendorLifecycleStatus.ACTIVE,
      ]);
      expect((await advanceService.getTimeline(vendorId)).map((event) => event.to)).toEqual([
        VendorLifecycleStatus.ACTIVE,
        VendorLifecycleStatus.ONBOARDING,
        VendorLifecycleStatus.APPROVED,
        VendorLifecycleStatus.UNDER_REVIEW,
        VendorLifecycleStatus.INSPECTION_COMPLETED,
        VendorLifecycleStatus.INSPECTION_SCHEDULED,
        VendorLifecycleStatus.DOCS_SUBMITTED,
        VendorLifecycleStatus.PREPARING_DOCS,
      ]);
    });

    it('rejects a target outside the legal forward path', async () => {
      await expect(
        advanceService.advanceTo(
          vendorId,
          VendorLifecycleStatus.REVOKED,
          null,
          'system',
          'bad',
          'corr-2',
        ),
      ).rejects.toThrow('tidak diizinkan');
    });
  });
});
