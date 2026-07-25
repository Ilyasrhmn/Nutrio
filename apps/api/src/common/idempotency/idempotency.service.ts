import { ConflictException, Injectable } from '@nestjs/common';
import { createHash, randomUUID } from 'crypto';
import { DataSource, EntityManager } from 'typeorm';

export interface IdempotentResponse<T> {
  body: T;
  eventId: string;
  replayed: boolean;
}

@Injectable()
export class IdempotencyService {
  constructor(private readonly dataSource: DataSource) {}

  async execute<T>(
    actorUserId: string,
    key: string | undefined,
    payload: unknown,
    command: (manager: EntityManager, correlationId: string) => Promise<{
      body: T;
      eventId: string;
    }>,
  ): Promise<IdempotentResponse<T>> {
    if (!key?.trim()) {
      throw new ConflictException('Idempotency-Key diperlukan');
    }

    const requestHash = createHash('sha256')
      .update(JSON.stringify(payload))
      .digest('hex');

    return this.dataSource.transaction(async (manager) => {
      const [existing] = await manager.query(
        `SELECT request_hash, response_body
         FROM idempotency_records
         WHERE actor_user_id = $1 AND idempotency_key = $2
         FOR UPDATE`,
        [actorUserId, key],
      );

      if (existing) {
        if (existing.request_hash !== requestHash) {
          throw new ConflictException('Idempotency-Key dipakai untuk request berbeda');
        }
        if (!existing.response_body) {
          throw new ConflictException('Request dengan Idempotency-Key ini masih diproses');
        }
        return { ...existing.response_body, replayed: true } as IdempotentResponse<T>;
      }

      await manager.query(
        `INSERT INTO idempotency_records (actor_user_id, idempotency_key, request_hash)
         VALUES ($1, $2, $3)`,
        [actorUserId, key, requestHash],
      );

      const correlationId = randomUUID();
      const result = await command(manager, correlationId);
      const response: IdempotentResponse<T> = { ...result, replayed: false };

      await manager.query(
        `UPDATE idempotency_records
         SET status_code = 200, response_body = $3::jsonb, completed_at = NOW()
         WHERE actor_user_id = $1 AND idempotency_key = $2`,
        [actorUserId, key, JSON.stringify(response)],
      );

      return response;
    });
  }
}
