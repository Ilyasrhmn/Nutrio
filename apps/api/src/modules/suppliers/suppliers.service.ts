import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class SuppliersService {
  constructor(private readonly dataSource: DataSource) {}

  async list(opts: {
    q?: string;
    city?: string;
    province?: string;
    category?: string;
    page?: number;
    limit?: number;
  }) {
    const { q, city, province, category, page = 1, limit = 20 } = opts;
    const offset = (page - 1) * limit;
    const params: any[] = [];
    const where: string[] = [`s.status = 'verified'`, `s.deleted_at IS NULL`];

    if (q) {
      params.push(`%${q}%`);
      where.push(`(s.business_name ILIKE $${params.length} OR s.description ILIKE $${params.length})`);
    }
    if (city) {
      params.push(city);
      where.push(`s.address_city ILIKE $${params.length}`);
    }
    if (province) {
      params.push(province);
      where.push(`s.address_province ILIKE $${params.length}`);
    }
    if (category) {
      params.push(`{${category}}`);
      where.push(`s.product_categories && $${params.length}::TEXT[]`);
    }

    const whereClause = where.join(' AND ');

    params.push(limit);
    params.push(offset);

    const rows = await this.dataSource.query(
      `SELECT
         s.id,
         s.business_name,
         s.supplier_type,
         s.address_city,
         s.address_province,
         s.description,
         s.has_halal_cert,
         s.has_bpom_cert,
         s.has_organic_cert,
         s.avg_rating,
         s.total_reviews,
         s.product_categories,
         s.on_time_rate,
         (SELECT COUNT(*) FROM supplier_products sp2
          WHERE sp2.supplier_id = s.id AND sp2.status = 'active') AS product_count
       FROM suppliers s
       WHERE ${whereClause}
       ORDER BY s.avg_rating DESC NULLS LAST, s.business_name
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params,
    );

    const [{ total }] = await this.dataSource.query(
      `SELECT COUNT(*) AS total FROM suppliers s WHERE ${whereClause}`,
      params.slice(0, params.length - 2),
    );

    return { data: rows, total: parseInt(total, 10), page, limit };
  }

  async getDetail(id: string) {
    const [supplier] = await this.dataSource.query(
      `SELECT
         s.id,
         s.business_name,
         s.supplier_type,
         s.owner_name,
         s.phone,
         s.email,
         s.website,
         s.address_street,
         s.address_city,
         s.address_province,
         s.description,
         s.has_halal_cert,
         s.has_bpom_cert,
         s.has_organic_cert,
         s.avg_rating,
         s.total_reviews,
         s.product_categories,
         s.on_time_rate,
         s.total_pos_completed,
         s.verified_at
       FROM suppliers s
       WHERE s.id = $1 AND s.status = 'verified' AND s.deleted_at IS NULL`,
      [id],
    );

    if (!supplier) throw new NotFoundException('Supplier tidak ditemukan');

    const products = await this.dataSource.query(
      `SELECT
         sp.id,
         sp.name,
         sp.category,
         sp.subcategory,
         sp.description,
         sp.unit,
         sp.price_per_unit,
         sp.min_order_qty,
         sp.stock_available,
         sp.has_halal_label,
         sp.avg_rating,
         sp.total_orders,
         (SELECT sph.file_url FROM supplier_product_photos sph
          WHERE sph.product_id = sp.id AND sph.is_primary = TRUE LIMIT 1) AS photo_url
       FROM supplier_products sp
       WHERE sp.supplier_id = $1 AND sp.status = 'active'
       ORDER BY sp.total_orders DESC, sp.name`,
      [id],
    );

    const reviews = await this.dataSource.query(
      `SELECT
         sr.id,
         sr.rating_overall,
         sr.rating_product_quality,
         sr.rating_delivery_time,
         sr.review_text,
         sr.created_at,
         v.business_name AS vendor_name
       FROM supplier_reviews sr
       JOIN vendors v ON v.id = sr.vendor_id
       WHERE sr.supplier_id = $1 AND sr.is_visible = TRUE
       ORDER BY sr.created_at DESC
       LIMIT 10`,
      [id],
    );

    const documents = await this.dataSource.query(
      `SELECT id, doc_type, doc_number, file_url, issued_at, expires_at, status
       FROM supplier_documents
       WHERE supplier_id = $1 AND status = 'verified'
       ORDER BY doc_type`,
      [id],
    );

    return { ...supplier, products, reviews, documents };
  }

  async getMyProfile(userId: string) {
    const [row] = await this.dataSource.query(
      `SELECT s.id, s.business_name, s.owner_name, s.phone, s.email,
              s.description, s.address_street, s.address_city, s.address_province,
              s.status, s.has_halal_cert, s.has_bpom_cert,
              ST_Y(s.coordinates::geometry) AS lat,
              ST_X(s.coordinates::geometry) AS lng,
              (SELECT COUNT(*) FROM supplier_products sp WHERE sp.supplier_id = s.id AND sp.status = 'active') AS product_count,
              (SELECT sph.file_url FROM supplier_product_photos sph
               JOIN supplier_products sp2 ON sp2.id = sph.product_id
               WHERE sp2.supplier_id = s.id AND sph.is_primary = TRUE LIMIT 1) AS shop_photo_url
       FROM suppliers s
       WHERE s.user_id = $1 AND s.deleted_at IS NULL`,
      [userId],
    );
    return row
      ? {
          id: row.id,
          businessName: row.business_name,
          ownerName: row.owner_name,
          phone: row.phone ?? '',
          email: row.email ?? '',
          description: row.description ?? '',
          addressStreet: row.address_street,
          addressCity: row.address_city,
          addressProvince: row.address_province,
          status: row.status,
          hasHalalCert: row.has_halal_cert,
          hasBpomCert: row.has_bpom_cert,
          lat: row.lat ? Number(row.lat) : null,
          lng: row.lng ? Number(row.lng) : null,
          productCount: Number(row.product_count),
          shopPhotoUrl: row.shop_photo_url ?? null,
        }
      : null;
  }

  async updateMyProfile(
    userId: string,
    dto: {
      phone?: string;
      email?: string;
      description?: string;
      lat?: number;
      lng?: number;
    },
  ) {
    const [supplier] = await this.dataSource.query(
      `SELECT id FROM suppliers WHERE user_id = $1 AND deleted_at IS NULL`,
      [userId],
    );
    if (!supplier) throw new ForbiddenException('Profil supplier tidak ditemukan');

    const sets: string[] = ['updated_at = NOW()'];
    const params: any[] = [supplier.id];

    if (dto.phone !== undefined) {
      params.push(dto.phone);
      sets.push(`phone = $${params.length}`);
    }
    if (dto.email !== undefined) {
      params.push(dto.email);
      sets.push(`email = $${params.length}`);
    }
    if (dto.description !== undefined) {
      params.push(dto.description);
      sets.push(`description = $${params.length}`);
    }
    if (dto.lat !== undefined && dto.lng !== undefined) {
      params.push(dto.lng, dto.lat);
      sets.push(`coordinates = ST_SetSRID(ST_MakePoint($${params.length - 1}, $${params.length}), 4326)`);
    }

    await this.dataSource.query(
      `UPDATE suppliers SET ${sets.join(', ')} WHERE id = $1`,
      params,
    );
    return { ok: true };
  }

  private async getSupplierIdByUser(userId: string): Promise<string> {
    const [row] = await this.dataSource.query(
      `SELECT id FROM suppliers WHERE user_id = $1 AND deleted_at IS NULL`,
      [userId],
    );
    if (!row) throw new ForbiddenException('Profil supplier tidak ditemukan');
    return row.id;
  }

  async listMyProducts(userId: string) {
    const supplierId = await this.getSupplierIdByUser(userId);
    const rows = await this.dataSource.query(
      `SELECT sp.id, sp.name, sp.category, sp.unit, sp.price_per_unit,
              sp.stock_available, sp.status, sp.total_orders, sp.avg_rating,
              (SELECT sph.file_url FROM supplier_product_photos sph
               WHERE sph.product_id = sp.id AND sph.is_primary = TRUE LIMIT 1) AS photo_url
       FROM supplier_products sp
       WHERE sp.supplier_id = $1 AND sp.status != 'removed'
       ORDER BY sp.created_at DESC`,
      [supplierId],
    );
    return rows.map((r: any) => ({
      id: r.id,
      name: r.name,
      category: r.category,
      unit: r.unit,
      pricePerUnit: r.price_per_unit ? Number(r.price_per_unit) : null,
      stockAvailable: r.stock_available ? Number(r.stock_available) : null,
      status: r.status,
      totalOrders: Number(r.total_orders),
      avgRating: r.avg_rating ? Number(r.avg_rating) : null,
      photoUrl: r.photo_url ?? null,
    }));
  }

  async createMyProduct(
    userId: string,
    dto: {
      name: string;
      category: string;
      unit: string;
      description?: string;
      pricePerUnit?: number;
      stockAvailable?: number;
    },
  ) {
    const supplierId = await this.getSupplierIdByUser(userId);
    const [product] = await this.dataSource.query(
      `INSERT INTO supplier_products
         (supplier_id, name, category, unit, description, price_per_unit, stock_available)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, name, category, unit, price_per_unit, stock_available, status`,
      [
        supplierId,
        dto.name,
        dto.category,
        dto.unit,
        dto.description ?? null,
        dto.pricePerUnit ?? null,
        dto.stockAvailable ?? null,
      ],
    );
    return {
      id: product.id,
      name: product.name,
      category: product.category,
      unit: product.unit,
      pricePerUnit: product.price_per_unit ? Number(product.price_per_unit) : null,
      stockAvailable: product.stock_available ? Number(product.stock_available) : null,
      status: product.status,
    };
  }

  async updateMyProduct(
    userId: string,
    productId: string,
    dto: { status?: string; name?: string; pricePerUnit?: number; stockAvailable?: number },
  ) {
    const supplierId = await this.getSupplierIdByUser(userId);
    const sets: string[] = ['updated_at = NOW()'];
    const params: any[] = [productId, supplierId];

    if (dto.status) {
      params.push(dto.status);
      sets.push(`status = $${params.length}`);
    }
    if (dto.name) {
      params.push(dto.name);
      sets.push(`name = $${params.length}`);
    }
    if (dto.pricePerUnit !== undefined) {
      params.push(dto.pricePerUnit);
      sets.push(`price_per_unit = $${params.length}`);
    }
    if (dto.stockAvailable !== undefined) {
      params.push(dto.stockAvailable);
      sets.push(`stock_available = $${params.length}`);
    }

    await this.dataSource.query(
      `UPDATE supplier_products SET ${sets.join(', ')} WHERE id = $1 AND supplier_id = $2`,
      params,
    );
    return { ok: true };
  }

  async deleteMyProduct(userId: string, productId: string) {
    const supplierId = await this.getSupplierIdByUser(userId);
    await this.dataSource.query(
      `UPDATE supplier_products SET status = 'removed', updated_at = NOW()
       WHERE id = $1 AND supplier_id = $2`,
      [productId, supplierId],
    );
    return { ok: true };
  }
}
