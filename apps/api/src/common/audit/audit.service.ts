import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { EntityManager } from 'typeorm';

@Injectable()
export class AuditService {
  async record(
    manager: EntityManager,
    input: {
      actorUserId?: string;
      aggregateType: string;
      aggregateId: string;
      action: string;
      after: Record<string, unknown>;
      correlationId?: string;
    },
  ): Promise<string> {
    const correlationId = input.correlationId ?? randomUUID();
    const [event] = await manager.query(
      `INSERT INTO audit_events
         (actor_user_id, aggregate_type, aggregate_id, action, after_payload, correlation_id)
       VALUES ($1, $2, $3::uuid, $4, $5::jsonb, $6::uuid)
       RETURNING id`,
      [
        input.actorUserId ?? null,
        input.aggregateType,
        input.aggregateId,
        input.action,
        JSON.stringify(input.after),
        correlationId,
      ],
    );
    await manager.query(
      `INSERT INTO workflow_outbox
         (event_name, aggregate_type, aggregate_id, correlation_id, payload)
       VALUES ($1, $2, $3::uuid, $4::uuid, $5::jsonb)`,
      [
        input.action,
        input.aggregateType,
        input.aggregateId,
        correlationId,
        JSON.stringify(input.after),
      ],
    );
    return event.id;
  }
}
