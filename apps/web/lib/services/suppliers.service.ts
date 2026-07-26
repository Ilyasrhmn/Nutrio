import { api } from '../api-client';

export interface SupplierListItem {
  id: string;
  businessName: string;
  supplierType: string;
  addressCity: string;
  addressProvince: string;
  description: string | null;
  hasHalalCert: boolean;
  hasBpomCert: boolean;
  hasOrganicCert: boolean;
  avgRating: number | null;
  totalReviews: number;
  productCategories: string[];
  onTimeRate: number | null;
  productCount: number;
}

export interface SupplierListResult {
  items: SupplierListItem[];
  total: number;
  page: number;
  limit: number;
}

export interface SupplierProduct {
  id: string;
  name: string;
  category: string;
  subcategory: string | null;
  description: string | null;
  unit: string;
  pricePerUnit: number | null;
  minOrderQty: number | null;
  stockAvailable: number | null;
  hasHalalLabel: boolean;
  avgRating: number | null;
  totalOrders: number;
  photoUrl: string | null;
}

export interface SupplierReview {
  id: string;
  ratingOverall: number;
  ratingProductQuality: number | null;
  ratingDeliveryTime: number | null;
  reviewText: string | null;
  createdAt: string;
  vendorName: string;
}

export interface SupplierDocument {
  id: string;
  docType: string;
  docNumber: string | null;
  fileUrl: string;
  issuedAt: string | null;
  expiresAt: string | null;
  status: string;
}

export interface SupplierDetail {
  id: string;
  businessName: string;
  supplierType: string;
  ownerName: string;
  phone: string | null;
  email: string | null;
  website: string | null;
  addressStreet: string | null;
  addressCity: string;
  addressProvince: string;
  description: string | null;
  hasHalalCert: boolean;
  hasBpomCert: boolean;
  hasOrganicCert: boolean;
  avgRating: number | null;
  totalReviews: number;
  productCategories: string[];
  onTimeRate: number | null;
  totalPosCompleted: number;
  verifiedAt: string | null;
  products: SupplierProduct[];
  reviews: SupplierReview[];
  documents: SupplierDocument[];
}

function num(v: any): number | null {
  return v === null || v === undefined ? null : Number(v);
}

function mapListItem(r: any): SupplierListItem {
  return {
    id: r.id,
    businessName: r.business_name,
    supplierType: r.supplier_type,
    addressCity: r.address_city,
    addressProvince: r.address_province,
    description: r.description,
    hasHalalCert: r.has_halal_cert,
    hasBpomCert: r.has_bpom_cert,
    hasOrganicCert: r.has_organic_cert,
    avgRating: num(r.avg_rating),
    totalReviews: r.total_reviews ?? 0,
    productCategories: r.product_categories ?? [],
    onTimeRate: num(r.on_time_rate),
    productCount: Number(r.product_count ?? 0),
  };
}

function mapProduct(p: any): SupplierProduct {
  return {
    id: p.id,
    name: p.name,
    category: p.category,
    subcategory: p.subcategory ?? null,
    description: p.description ?? null,
    unit: p.unit,
    pricePerUnit: num(p.price_per_unit),
    minOrderQty: num(p.min_order_qty),
    stockAvailable: num(p.stock_available),
    hasHalalLabel: !!p.has_halal_label,
    avgRating: num(p.avg_rating),
    totalOrders: Number(p.total_orders ?? 0),
    photoUrl: p.photo_url ?? null,
  };
}

function mapReview(r: any): SupplierReview {
  return {
    id: r.id,
    ratingOverall: Number(r.rating_overall),
    ratingProductQuality: num(r.rating_product_quality),
    ratingDeliveryTime: num(r.rating_delivery_time),
    reviewText: r.review_text ?? null,
    createdAt: r.created_at,
    vendorName: r.vendor_name,
  };
}

function mapDocument(d: any): SupplierDocument {
  return {
    id: d.id,
    docType: d.doc_type,
    docNumber: d.doc_number ?? null,
    fileUrl: d.file_url,
    issuedAt: d.issued_at ?? null,
    expiresAt: d.expires_at ?? null,
    status: d.status,
  };
}

export interface MySupplierProduct {
  id: string;
  name: string;
  category: string;
  unit: string;
  pricePerUnit: number | null;
  stockAvailable: number | null;
  status: string;
  totalOrders: number;
  avgRating: number | null;
  photoUrl: string | null;
}

export interface CreateMyProductInput {
  name: string;
  category: string;
  unit: string;
  description?: string;
  pricePerUnit?: number;
  stockAvailable?: number;
}

export interface UpdateMyProductInput {
  status?: string;
  name?: string;
  pricePerUnit?: number;
  stockAvailable?: number;
}

export const suppliersService = {
  async list(params: {
    q?: string;
    city?: string;
    province?: string;
    category?: string;
    page?: number;
    limit?: number;
  }): Promise<SupplierListResult> {
    const query = new URLSearchParams();
    if (params.q) query.set('q', params.q);
    if (params.city) query.set('city', params.city);
    if (params.province) query.set('province', params.province);
    if (params.category) query.set('category', params.category);
    query.set('page', String(params.page ?? 1));
    query.set('limit', String(params.limit ?? 20));

    const res = await api.get<{ data: any[]; total: number; page: number; limit: number }>(
      `/suppliers?${query.toString()}`,
    );
    return {
      items: res.data.map(mapListItem),
      total: res.total,
      page: res.page,
      limit: res.limit,
    };
  },

  async getDetail(id: string): Promise<SupplierDetail> {
    const r = await api.get<any>(`/suppliers/${id}`);
    return {
      id: r.id,
      businessName: r.business_name,
      supplierType: r.supplier_type,
      ownerName: r.owner_name,
      phone: r.phone,
      email: r.email,
      website: r.website,
      addressStreet: r.address_street,
      addressCity: r.address_city,
      addressProvince: r.address_province,
      description: r.description,
      hasHalalCert: r.has_halal_cert,
      hasBpomCert: r.has_bpom_cert,
      hasOrganicCert: r.has_organic_cert,
      avgRating: num(r.avg_rating),
      totalReviews: r.total_reviews ?? 0,
      productCategories: r.product_categories ?? [],
      onTimeRate: num(r.on_time_rate),
      totalPosCompleted: Number(r.total_pos_completed ?? 0),
      verifiedAt: r.verified_at,
      products: (r.products ?? []).map(mapProduct),
      reviews: (r.reviews ?? []).map(mapReview),
      documents: (r.documents ?? []).map(mapDocument),
    };
  },

  async getMyProfile() {
    const r = await api.get<any>('/suppliers/me/profile');
    return r
      ? {
          id: r.id,
          businessName: r.businessName,
          ownerName: r.ownerName,
          phone: r.phone,
          email: r.email,
          description: r.description,
          addressStreet: r.addressStreet,
          addressCity: r.addressCity,
          addressProvince: r.addressProvince,
          status: r.status,
          hasHalalCert: r.hasHalalCert,
          hasBpomCert: r.hasBpomCert,
          productCount: r.productCount,
          shopPhotoUrl: r.shopPhotoUrl,
        }
      : null;
  },

  async listMyProducts(): Promise<MySupplierProduct[]> {
    const rows = await api.get<any[]>('/suppliers/me/products');
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      category: r.category,
      unit: r.unit,
      pricePerUnit: r.pricePerUnit,
      stockAvailable: r.stockAvailable,
      status: r.status,
      totalOrders: r.totalOrders,
      avgRating: r.avgRating,
      photoUrl: r.photoUrl,
    }));
  },

  createMyProduct(input: CreateMyProductInput) {
    return api.post('/suppliers/me/products', input);
  },

  updateMyProduct(productId: string, input: UpdateMyProductInput) {
    return api.patch(`/suppliers/me/products/${productId}`, input);
  },

  deleteMyProduct(productId: string) {
    return api.delete(`/suppliers/me/products/${productId}`);
  },
};
