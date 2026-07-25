import { DataSource } from 'typeorm';

export default class OperationDaySeed {
  async run(dataSource: DataSource): Promise<void> {
    const [vendor] = await dataSource.query(
      `SELECT id FROM vendors ORDER BY created_at LIMIT 1`,
    );
    const [product] = await dataSource.query(
      `SELECT sp.id, sp.unit FROM supplier_products sp ORDER BY sp.created_at LIMIT 1`,
    );
    if (!vendor || !product) return;

    const today = new Date().toISOString().slice(0, 10);
    const [menu] = await dataSource.query(
      `INSERT INTO menu_plans (vendor_id, operation_date, target_pax)
       VALUES ($1, $2::date, 10)
       ON CONFLICT (vendor_id, operation_date) DO UPDATE SET target_pax = EXCLUDED.target_pax
       RETURNING id`,
      [vendor.id, today],
    );
    await dataSource.query(
      `INSERT INTO menu_plan_items (menu_plan_id, product_id, unit, quantity_per_pax)
       VALUES ($1, $2, $3, 0.1)
       ON CONFLICT (menu_plan_id, product_id, unit) DO NOTHING`,
      [menu.id, product.id, product.unit],
    );
  }
}
