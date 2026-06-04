import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

export interface FundSummary {
  totalAlokasi: number;
  totalTersalurkan: number;
  sisaAnggaran: number;
  realisasiPct: number;
  trendData: { date: string; amount: number }[];
}

export interface FundTransaction {
  id: string;
  vendorName: string;
  paidAt: string;
  amount: number;
  status: string;
  invoiceNumber: string | null;
}

@Injectable()
export class FundsService {
  constructor(private readonly dataSource: DataSource) {}

  async getSummary(): Promise<FundSummary> {
    const [configRow] = await this.dataSource.query(
      `SELECT value FROM system_config WHERE key = 'apbn_alokasi_idr' LIMIT 1`,
    );
    const totalAlokasi = configRow ? Number(configRow.value) : 0;

    const [totRow] = await this.dataSource.query(
      `SELECT COALESCE(SUM(amount), 0) AS total FROM payments WHERE status = 'paid'`,
    );
    const totalTersalurkan = Number(totRow.total);

    const trendRows = await this.dataSource.query(`
      SELECT
        TO_CHAR(DATE_TRUNC('day', paid_at), 'DD Mon') AS date,
        SUM(amount) AS amount
      FROM payments
      WHERE status = 'paid'
        AND paid_at >= NOW() - INTERVAL '30 days'
      GROUP BY DATE_TRUNC('day', paid_at)
      ORDER BY DATE_TRUNC('day', paid_at)
    `);

    return {
      totalAlokasi,
      totalTersalurkan,
      sisaAnggaran: totalAlokasi - totalTersalurkan,
      realisasiPct: totalAlokasi > 0 ? (totalTersalurkan / totalAlokasi) * 100 : 0,
      trendData: trendRows.map((r: any) => ({ date: r.date, amount: Number(r.amount) })),
    };
  }

  async getTransactions(limit = 20): Promise<FundTransaction[]> {
    const rows = await this.dataSource.query(
      `SELECT
         p.id,
         v.business_name AS vendor_name,
         p.paid_at,
         p.amount,
         p.status,
         p.invoice_number
       FROM payments p
       JOIN vendors v ON v.id = p.vendor_id
       ORDER BY p.created_at DESC
       LIMIT $1`,
      [limit],
    );

    return rows.map((r: any) => ({
      id: r.id,
      vendorName: r.vendor_name,
      paidAt: r.paid_at,
      amount: Number(r.amount),
      status: r.status,
      invoiceNumber: r.invoice_number ?? null,
    }));
  }
}
