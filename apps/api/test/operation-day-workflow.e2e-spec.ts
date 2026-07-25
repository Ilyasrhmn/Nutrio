import { DataSource } from 'typeorm';

const databaseUrl =
  process.env.TEST_DATABASE_URL ??
  'postgresql://postgres:postgres@localhost:5433/Nutrio';

describe('Operation-day workflow schema (e2e)', () => {
  const dataSource = new DataSource({
    type: 'postgres',
    url: databaseUrl,
  });

  beforeAll(() => dataSource.initialize());
  afterAll(() => dataSource.destroy());

  it('creates the operation_days table', async () => {
    const [row] = await dataSource.query(
      `SELECT to_regclass('public.operation_days') AS relation`,
    );

    expect(row.relation).toBe('operation_days');
  });
});
