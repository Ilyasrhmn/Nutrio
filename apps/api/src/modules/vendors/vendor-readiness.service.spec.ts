import { isUUID } from "class-validator";
import { OnboardingController } from "../onboarding/onboarding.controller";
import { VendorLifecycleStatus } from "./entities/vendor.entity";
import { VendorReadinessService } from "./vendor-readiness.service";

describe("VendorReadinessService", () => {
  const vendorId = "67d4c190-4909-40c2-93ec-2b91631703f8";

  it("lists every missing persisted onboarding requirement in action order", async () => {
    const dataSource = {
      query: jest.fn().mockResolvedValue([
        {
          lifecycle_status: VendorLifecycleStatus.REGISTERED,
          profile_complete: false,
          has_active_sppg_location: false,
          has_valid_document: false,
          has_accepted_kepala_dapur: false,
          simulation_complete: false,
          has_supplier: false,
          has_passing_demo_inspection: false,
        },
      ]),
    };
    const stateMachine = { advanceTo: jest.fn() };
    const service = new VendorReadinessService(
      dataSource as never,
      stateMachine as never,
    );

    const snapshot = await service.evaluate(vendorId);

    expect(snapshot).toMatchObject({
      ready: false,
      lifecycleStatus: VendorLifecycleStatus.REGISTERED,
    });
    expect(snapshot.missingRequirements.map((item) => item.code)).toEqual([
      "PROFILE",
      "SPPG_LOCATION",
      "DOCUMENT",
      "KEPALA_DAPUR",
      "SIMULATION",
      "SUPPLIER",
      "DEMO_INSPECTION",
    ]);
    expect(stateMachine.advanceTo).not.toHaveBeenCalled();
  });

  it("advances a vendor with all persisted evidence to ACTIVE", async () => {
    const dataSource = {
      query: jest.fn().mockResolvedValue([
        {
          lifecycle_status: VendorLifecycleStatus.REGISTERED,
          profile_complete: true,
          has_active_sppg_location: true,
          has_valid_document: true,
          has_accepted_kepala_dapur: true,
          simulation_complete: true,
          has_supplier: true,
          has_passing_demo_inspection: true,
        },
      ]),
    };
    const stateMachine = { advanceTo: jest.fn().mockResolvedValue([]) };
    const service = new VendorReadinessService(
      dataSource as never,
      stateMachine as never,
    );

    const readySnapshot = await service.evaluate(vendorId, null);

    expect(readySnapshot).toMatchObject({
      ready: true,
      lifecycleStatus: VendorLifecycleStatus.ACTIVE,
      missingRequirements: [],
      nextAction: null,
    });
    expect(stateMachine.advanceTo).toHaveBeenCalledWith(
      vendorId,
      VendorLifecycleStatus.ACTIVE,
      null,
      "system",
      "Vendor memenuhi seluruh persyaratan onboarding",
      expect.any(String),
    );
    expect(isUUID(stateMachine.advanceTo.mock.calls[0][5])).toBe(true);
  });

  it("uses the authenticated user id when returning vendor readiness", async () => {
    const onboardingService = {
      getReadiness: jest.fn().mockResolvedValue({ ready: false }),
    };
    const dataSource = {
      query: jest
        .fn()
        .mockImplementation(async (_query: string, params: string[]) =>
          params[0] === "authenticated-user-id" ? [{ id: vendorId }] : [],
        ),
    };
    const controller = new OnboardingController(
      onboardingService as never,
      dataSource as never,
    );

    await expect(
      controller.getReadiness({
        id: "authenticated-user-id",
        sub: "wrong-user-id",
        email: "vendor@example.test",
        role: "vendor",
      }),
    ).resolves.toEqual({ ready: false });
    expect(onboardingService.getReadiness).toHaveBeenCalledWith(
      vendorId,
      "authenticated-user-id",
    );
  });
});
