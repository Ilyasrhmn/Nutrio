import { MigrationInterface, QueryRunner } from 'typeorm';

export class SupplierSchema1710400000001 implements MigrationInterface {
    name = 'SupplierSchema1710400000001';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
-- -----------------------------------------------------------------------------
-- ROLES ADDITION (vendortrack_admin)
-- -----------------------------------------------------------------------------
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'vendortrack_admin') THEN
        CREATE ROLE vendortrack_admin LOGIN PASSWORD 'REPLACE_IN_ENV';
    END IF;
END
$$;

-- -----------------------------------------------------------------------------
-- SECTION 23: SUPPLIER FLOW — Tambahan Schema
-- -----------------------------------------------------------------------------

-- Enums
CREATE TYPE supplier_type AS ENUM (
    'petani',           -- Petani / kelompok tani lokal
    'distributor',      -- Distributor bahan baku
    'koperasi',         -- Koperasi pangan
    'fmcg'             -- Perusahaan FMCG / pabrik makanan
);

CREATE TYPE supplier_status AS ENUM (
    'draft',
    'pending_review',   -- Menunggu kurasi BGN
    'verified',         -- Disetujui BGN, bisa listing produk
    'rejected',
    'suspended',
    'supplier_watch'    -- Rating < 3.0 selama 3 bulan, monitored
);

CREATE TYPE product_status AS ENUM (
    'active',
    'inactive',
    'out_of_stock',
    'removed'           -- Dihapus admin BGN
);

CREATE TYPE po_status AS ENUM (
    'draft',
    'pending_supplier',  -- Menunggu konfirmasi supplier (max 24 jam)
    'negotiating',       -- Supplier mengajukan revisi
    'confirmed',         -- Kedua pihak setuju
    'processing',        -- Supplier sedang menyiapkan
    'shipped',           -- Barang dikirim, ada bukti
    'delivered',         -- Vendor konfirmasi terima
    'disputed',          -- Ada sengketa, BGN mediator
    'cancelled',
    'expired'            -- Auto-cancel jika tidak dikonfirmasi > 48 jam
);

CREATE TYPE contract_status AS ENUM (
    'draft',
    'pending_vendor_sign',
    'pending_supplier_sign',
    'signed',           -- Kedua pihak sudah tanda tangan
    'voided'
);

CREATE TYPE payment_method AS ENUM (
    'snap_api',         -- BI SNAP API
    'manual_transfer',  -- Bayar di luar platform, upload bukti
    'pending'
);

-- Tables
CREATE TABLE suppliers (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    business_name       VARCHAR(255) NOT NULL,
    owner_name          VARCHAR(255) NOT NULL,
    supplier_type       supplier_type NOT NULL,
    nib                 VARCHAR(30) UNIQUE,
    npwp                VARCHAR(20),
    phone               VARCHAR(20) NOT NULL,
    email               VARCHAR(255),
    website             VARCHAR(255),
    address_street      TEXT NOT NULL,
    address_city        VARCHAR(100) NOT NULL,
    address_province    VARCHAR(100) NOT NULL,
    address_postal      VARCHAR(10),
    coordinates         GEOGRAPHY(POINT, 4326),
    description         TEXT,
    product_categories  TEXT[],                        
    service_radius_km   DECIMAL(6,2),                  
    has_halal_cert      BOOLEAN NOT NULL DEFAULT FALSE,
    has_bpom_cert       BOOLEAN NOT NULL DEFAULT FALSE,
    has_organic_cert    BOOLEAN NOT NULL DEFAULT FALSE,
    status              supplier_status NOT NULL DEFAULT 'draft',
    status_reason       TEXT,
    verified_at         TIMESTAMPTZ,
    verified_by         UUID REFERENCES users(id),
    avg_rating          DECIMAL(3,2),
    total_reviews       INTEGER NOT NULL DEFAULT 0,
    total_pos_completed INTEGER NOT NULL DEFAULT 0,
    on_time_rate        DECIMAL(5,2),                  
    oss_verified        BOOLEAN NOT NULL DEFAULT FALSE,
    oss_verified_at     TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at          TIMESTAMPTZ
);

CREATE TABLE supplier_documents (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_id         UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    doc_type            document_type NOT NULL,        
    doc_number          VARCHAR(100),
    file_url            TEXT NOT NULL,
    file_key            TEXT NOT NULL UNIQUE,
    file_hash           VARCHAR(64) NOT NULL,
    file_size_bytes     INTEGER,
    mime_type           VARCHAR(50),
    status              document_status NOT NULL DEFAULT 'pending',
    issued_at           DATE,
    expires_at          DATE,
    verified_at         TIMESTAMPTZ,
    verified_by         UUID REFERENCES users(id),
    rejection_reason    TEXT,
    bpom_verified       BOOLEAN DEFAULT FALSE,
    bpom_api_response   JSONB,
    uploaded_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE supplier_products (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_id         UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    name                VARCHAR(255) NOT NULL,
    category            VARCHAR(100) NOT NULL,          
    subcategory         VARCHAR(100),
    description         TEXT,
    unit                VARCHAR(50) NOT NULL,            
    unit_size           DECIMAL(10,3),                  
    price_per_unit      DECIMAL(12,2),                  
    min_order_qty       DECIMAL(10,3) NOT NULL DEFAULT 1,
    stock_available     DECIMAL(10,3),                  
    stock_updated_at    TIMESTAMPTZ,
    bpom_reg_number     VARCHAR(50),                    
    has_halal_label     BOOLEAN NOT NULL DEFAULT FALSE,
    status              product_status NOT NULL DEFAULT 'active',
    avg_rating          DECIMAL(3,2),
    total_orders        INTEGER NOT NULL DEFAULT 0,
    search_vector       TSVECTOR,                       
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE supplier_product_photos (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id  UUID NOT NULL REFERENCES supplier_products(id) ON DELETE CASCADE,
    file_url    TEXT NOT NULL,
    file_key    TEXT NOT NULL UNIQUE,
    file_hash   VARCHAR(64) NOT NULL,
    file_size_bytes INTEGER,
    sort_order  INTEGER NOT NULL DEFAULT 0,
    is_primary  BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE purchase_orders (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    po_number           VARCHAR(50) NOT NULL UNIQUE,   
    vendor_id           UUID NOT NULL REFERENCES vendors(id) ON DELETE RESTRICT,
    supplier_id         UUID NOT NULL REFERENCES suppliers(id) ON DELETE RESTRICT,
    status              po_status NOT NULL DEFAULT 'draft',
    requested_delivery_date DATE NOT NULL,
    confirmed_delivery_date DATE,
    actual_delivery_date    DATE,
    subtotal            DECIMAL(14,2),
    tax_amount          DECIMAL(14,2) DEFAULT 0,
    total_amount        DECIMAL(14,2),
    currency            VARCHAR(3) NOT NULL DEFAULT 'IDR',
    original_total      DECIMAL(14,2),                 
    negotiation_notes   TEXT,
    shipping_address    TEXT,
    tracking_number     VARCHAR(100),
    shipping_proof_url  TEXT,                          
    shipping_proof_key  TEXT,
    payment_method      payment_method DEFAULT 'pending',
    payment_status      payment_status NOT NULL DEFAULT 'pending',
    payment_proof_url   TEXT,                          
    paid_at             TIMESTAMPTZ,
    dispute_reason      TEXT,
    dispute_opened_at   TIMESTAMPTZ,
    dispute_resolved_at TIMESTAMPTZ,
    dispute_resolved_by UUID REFERENCES users(id),
    supplier_deadline   TIMESTAMPTZ,                   
    vendor_notes        TEXT,
    supplier_notes      TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE purchase_order_items (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    po_id           UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
    product_id      UUID NOT NULL REFERENCES supplier_products(id) ON DELETE RESTRICT,
    product_name    VARCHAR(255) NOT NULL,              
    unit            VARCHAR(50) NOT NULL,
    qty             DECIMAL(10,3) NOT NULL,
    unit_price      DECIMAL(12,2) NOT NULL,
    line_total      DECIMAL(14,2) NOT NULL,
    negotiated_price DECIMAL(12,2),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE po_status_logs (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    po_id       UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
    from_status po_status,
    to_status   po_status NOT NULL,
    actor_id    UUID REFERENCES users(id) ON DELETE SET NULL,
    actor_role  user_role,
    notes       TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE supplier_contracts (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    po_id               UUID NOT NULL UNIQUE REFERENCES purchase_orders(id) ON DELETE RESTRICT,
    contract_number     VARCHAR(50) NOT NULL UNIQUE,   
    template_version    VARCHAR(20) NOT NULL DEFAULT 'v1.0',
    contract_body       TEXT,                          
    pdf_url             TEXT,                          
    pdf_key             TEXT UNIQUE,
    status              contract_status NOT NULL DEFAULT 'draft',
    vendor_signed_at    TIMESTAMPTZ,
    vendor_signed_by    UUID REFERENCES users(id),
    supplier_signed_at  TIMESTAMPTZ,
    supplier_signed_by  UUID REFERENCES users(id),
    valid_from          DATE,
    valid_until         DATE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE supplier_invoices (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    po_id           UUID NOT NULL UNIQUE REFERENCES purchase_orders(id) ON DELETE RESTRICT,
    invoice_number  VARCHAR(50) NOT NULL UNIQUE,       
    subtotal        DECIMAL(14,2) NOT NULL,
    tax_amount      DECIMAL(14,2) NOT NULL DEFAULT 0,
    total_amount    DECIMAL(14,2) NOT NULL,
    currency        VARCHAR(3) NOT NULL DEFAULT 'IDR',
    payment_status  payment_status NOT NULL DEFAULT 'pending',
    paid_at         TIMESTAMPTZ,
    pdf_url         TEXT,
    pdf_key         TEXT UNIQUE,
    due_date        DATE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE supplier_reviews (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    po_id               UUID NOT NULL UNIQUE REFERENCES purchase_orders(id) ON DELETE CASCADE,
    vendor_id           UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    supplier_id         UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    rating_overall          SMALLINT NOT NULL CHECK (rating_overall BETWEEN 1 AND 5),
    rating_product_quality  SMALLINT CHECK (rating_product_quality BETWEEN 1 AND 5),
    rating_delivery_time    SMALLINT CHECK (rating_delivery_time BETWEEN 1 AND 5),
    rating_product_match    SMALLINT CHECK (rating_product_match BETWEEN 1 AND 5),
    rating_communication    SMALLINT CHECK (rating_communication BETWEEN 1 AND 5),
    review_text         TEXT,
    is_visible          BOOLEAN NOT NULL DEFAULT TRUE,
    hidden_reason       TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_suppliers_user          ON suppliers(user_id);
CREATE INDEX idx_suppliers_status        ON suppliers(status);
CREATE INDEX idx_suppliers_type          ON suppliers(supplier_type);
CREATE INDEX idx_suppliers_province      ON suppliers(address_province);
CREATE INDEX idx_suppliers_city          ON suppliers(address_city);
CREATE INDEX idx_suppliers_categories    ON suppliers USING GIN(product_categories);
CREATE INDEX idx_suppliers_geo           ON suppliers USING GIST(coordinates);
CREATE INDEX idx_suppliers_rating        ON suppliers(avg_rating DESC NULLS LAST);
CREATE INDEX idx_suppliers_search        ON suppliers USING GIN(to_tsvector('indonesian', business_name));

CREATE INDEX idx_sup_docs_supplier       ON supplier_documents(supplier_id);
CREATE INDEX idx_sup_docs_status         ON supplier_documents(status);
CREATE INDEX idx_sup_docs_expires        ON supplier_documents(expires_at) WHERE expires_at IS NOT NULL;

CREATE INDEX idx_products_supplier       ON supplier_products(supplier_id);
CREATE INDEX idx_products_category       ON supplier_products(category);
CREATE INDEX idx_products_status         ON supplier_products(status) WHERE status = 'active';
CREATE INDEX idx_products_bpom           ON supplier_products(bpom_reg_number) WHERE bpom_reg_number IS NOT NULL;
CREATE INDEX idx_products_price          ON supplier_products(price_per_unit) WHERE price_per_unit IS NOT NULL;
CREATE INDEX idx_products_fts            ON supplier_products USING GIN(search_vector);

CREATE INDEX idx_po_vendor               ON purchase_orders(vendor_id);
CREATE INDEX idx_po_supplier             ON purchase_orders(supplier_id);
CREATE INDEX idx_po_status               ON purchase_orders(status);
CREATE INDEX idx_po_created              ON purchase_orders(created_at DESC);
CREATE INDEX idx_po_delivery             ON purchase_orders(requested_delivery_date);
CREATE INDEX idx_po_deadline             ON purchase_orders(supplier_deadline)
    WHERE status = 'pending_supplier' AND supplier_deadline IS NOT NULL;

CREATE INDEX idx_poi_po                  ON purchase_order_items(po_id);
CREATE INDEX idx_poi_product             ON purchase_order_items(product_id);

CREATE INDEX idx_po_logs_po              ON po_status_logs(po_id);
CREATE INDEX idx_po_logs_time            ON po_status_logs(created_at DESC);

CREATE INDEX idx_contracts_po            ON supplier_contracts(po_id);
CREATE INDEX idx_contracts_status        ON supplier_contracts(status);

CREATE INDEX idx_invoices_po             ON supplier_invoices(po_id);
CREATE INDEX idx_invoices_payment        ON supplier_invoices(payment_status);
CREATE INDEX idx_invoices_due            ON supplier_invoices(due_date) WHERE payment_status = 'pending';

CREATE INDEX idx_reviews_supplier        ON supplier_reviews(supplier_id);
CREATE INDEX idx_reviews_vendor          ON supplier_reviews(vendor_id);
CREATE INDEX idx_reviews_rating          ON supplier_reviews(rating_overall DESC);
CREATE INDEX idx_reviews_visible         ON supplier_reviews(is_visible) WHERE is_visible = TRUE;

-- Triggers & Functions
DO $$
DECLARE t TEXT;
BEGIN
    FOREACH t IN ARRAY ARRAY[
        'suppliers','supplier_documents','supplier_products',
        'purchase_orders','supplier_contracts','supplier_invoices','supplier_reviews'
    ] LOOP
        EXECUTE format(
            'CREATE TRIGGER trg_%s_updated_at
             BEFORE UPDATE ON %s
             FOR EACH ROW EXECUTE FUNCTION set_updated_at()',
            t, t
        );
    END LOOP;
END;
$$;

CREATE OR REPLACE FUNCTION sync_supplier_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE suppliers
    SET
        avg_rating    = (
            SELECT ROUND(AVG(rating_overall)::NUMERIC, 2)
            FROM supplier_reviews
            WHERE supplier_id = NEW.supplier_id AND is_visible = TRUE
        ),
        total_reviews = (
            SELECT COUNT(*) FROM supplier_reviews
            WHERE supplier_id = NEW.supplier_id AND is_visible = TRUE
        )
    WHERE id = NEW.supplier_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sync_supplier_rating
    AFTER INSERT OR UPDATE ON supplier_reviews
    FOR EACH ROW EXECUTE FUNCTION sync_supplier_rating();

CREATE OR REPLACE FUNCTION sync_product_order_count()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'delivered' AND (OLD.status IS NULL OR OLD.status != 'delivered') THEN
        UPDATE supplier_products sp
        SET total_orders = total_orders + poi.qty
        FROM purchase_order_items poi
        WHERE poi.po_id = NEW.id AND poi.product_id = sp.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sync_product_order_count
    AFTER UPDATE ON purchase_orders
    FOR EACH ROW EXECUTE FUNCTION sync_product_order_count();

CREATE OR REPLACE FUNCTION log_po_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO po_status_logs (po_id, from_status, to_status)
        VALUES (NEW.id, OLD.status, NEW.status);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_log_po_status
    AFTER UPDATE ON purchase_orders
    FOR EACH ROW EXECUTE FUNCTION log_po_status_change();

CREATE SEQUENCE IF NOT EXISTS invoice_seq START 1;

CREATE OR REPLACE FUNCTION auto_generate_invoice()
RETURNS TRIGGER AS $$
DECLARE
    inv_number VARCHAR(50);
BEGIN
    IF NEW.status = 'delivered' AND OLD.status != 'delivered' THEN
        inv_number := 'INV-' || TO_CHAR(NOW(), 'YYYY') || '-' ||
                      LPAD(NEXTVAL('invoice_seq')::TEXT, 5, '0');
        INSERT INTO supplier_invoices (
            po_id, invoice_number, subtotal, tax_amount, total_amount,
            due_date
        ) VALUES (
            NEW.id,
            inv_number,
            NEW.subtotal,
            COALESCE(NEW.tax_amount, 0),
            NEW.total_amount,
            (NOW() + INTERVAL '14 days')::DATE
        )
        ON CONFLICT (po_id) DO NOTHING;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_auto_invoice
    AFTER UPDATE ON purchase_orders
    FOR EACH ROW EXECUTE FUNCTION auto_generate_invoice();

CREATE OR REPLACE FUNCTION check_supplier_watch_flag()
RETURNS TRIGGER AS $$
DECLARE
    low_months INTEGER;
BEGIN
    SELECT COUNT(DISTINCT DATE_TRUNC('month', created_at))
    INTO low_months
    FROM supplier_reviews
    WHERE supplier_id = NEW.supplier_id
      AND is_visible = TRUE
      AND rating_overall < 3
      AND created_at >= NOW() - INTERVAL '3 months';

    IF low_months >= 3 THEN
        UPDATE suppliers SET status = 'supplier_watch' WHERE id = NEW.supplier_id AND status = 'verified';
        INSERT INTO alerts (vendor_id, severity, alert_type, title, body, metadata)
        SELECT NULL, 'warning', 'citizen_report',
            'Supplier masuk status Watch',
            format('Supplier %s memiliki rating rendah selama 3 bulan berturut-turut.',
                   (SELECT business_name FROM suppliers WHERE id = NEW.supplier_id)),
            jsonb_build_object('supplier_id', NEW.supplier_id, 'avg_rating', NEW.rating_overall)
        WHERE NOT EXISTS (
            SELECT 1 FROM alerts
            WHERE metadata->>'supplier_id' = NEW.supplier_id::TEXT
              AND created_at > NOW() - INTERVAL '7 days'
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_supplier_watch_flag
    AFTER INSERT OR UPDATE ON supplier_reviews
    FOR EACH ROW EXECUTE FUNCTION check_supplier_watch_flag();

CREATE OR REPLACE FUNCTION update_product_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector := to_tsvector('indonesian',
        COALESCE(NEW.name, '') || ' ' ||
        COALESCE(NEW.category, '') || ' ' ||
        COALESCE(NEW.subcategory, '') || ' ' ||
        COALESCE(NEW.description, '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_product_search_vector
    BEFORE INSERT OR UPDATE ON supplier_products
    FOR EACH ROW EXECUTE FUNCTION update_product_search_vector();

-- Views
CREATE OR REPLACE VIEW supplier_catalog_view AS
SELECT
    sp.id,
    sp.supplier_id,
    s.business_name     AS supplier_name,
    s.address_city,
    s.address_province,
    s.avg_rating        AS supplier_rating,
    s.has_halal_cert,
    s.has_bpom_cert,
    sp.name             AS product_name,
    sp.category,
    sp.subcategory,
    sp.unit,
    sp.price_per_unit,
    sp.min_order_qty,
    sp.stock_available,
    sp.bpom_reg_number,
    sp.has_halal_label,
    sp.avg_rating       AS product_rating,
    sp.total_orders,
    (SELECT file_url FROM supplier_product_photos sph
     WHERE sph.product_id = sp.id AND sph.is_primary = TRUE
     LIMIT 1)           AS primary_photo_url,
    sp.created_at
FROM supplier_products sp
JOIN suppliers s ON s.id = sp.supplier_id
WHERE sp.status = 'active'
  AND s.status  = 'verified'
  AND s.deleted_at IS NULL;

CREATE OR REPLACE VIEW po_dashboard_view AS
SELECT
    po.id,
    po.po_number,
    po.status,
    po.vendor_id,
    v.business_name     AS vendor_name,
    po.supplier_id,
    s.business_name     AS supplier_name,
    po.total_amount,
    po.currency,
    po.requested_delivery_date,
    po.confirmed_delivery_date,
    po.payment_status,
    po.payment_method,
    (SELECT COUNT(*) FROM purchase_order_items WHERE po_id = po.id) AS item_count,
    sc.status           AS contract_status,
    si.invoice_number,
    si.payment_status   AS invoice_payment_status,
    EXISTS(SELECT 1 FROM supplier_reviews WHERE po_id = po.id) AS review_submitted,
    po.created_at,
    po.updated_at
FROM purchase_orders po
JOIN vendors  v  ON v.id  = po.vendor_id
JOIN suppliers s ON s.id = po.supplier_id
LEFT JOIN supplier_contracts sc ON sc.po_id = po.id
LEFT JOIN supplier_invoices  si ON si.po_id = po.id;

-- Seed Data (Config)
INSERT INTO system_config (key, value, description) VALUES
    ('po_supplier_confirm_hours',       '24',    'Jam maksimal supplier konfirmasi PO sebelum auto-escalate'),
    ('po_auto_expire_hours',            '48',    'Jam PO pending_supplier sebelum auto-expire'),
    ('supplier_watch_rating_threshold', '3.0',   'Rating rata-rata minimum sebelum supplier_watch flag'),
    ('supplier_watch_months',           '3',     'Bulan berturut-turut rating rendah sebelum flag'),
    ('invoice_due_days',                '14',    'Hari tenggat pembayaran invoice dari tanggal generated'),
    ('supplier_trust_badge_threshold',  '70',    'Persentase PO dari supplier verified untuk badge Rantai Pasok'),
    ('marketplace_catalog_cache_ttl',   '300',   'TTL cache katalog produk dalam detik')
ON CONFLICT (key) DO NOTHING;

-- RLS
ALTER TABLE suppliers               ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_documents      ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_products       ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders         ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_order_items    ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_contracts      ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_invoices       ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_reviews        ENABLE ROW LEVEL SECURITY;

CREATE POLICY admin_supplier_all ON suppliers            FOR ALL TO vendortrack_admin USING (TRUE);
CREATE POLICY admin_supdoc_all   ON supplier_documents   FOR ALL TO vendortrack_admin USING (TRUE);
CREATE POLICY admin_prod_all     ON supplier_products    FOR ALL TO vendortrack_admin USING (TRUE);
CREATE POLICY admin_po_all       ON purchase_orders      FOR ALL TO vendortrack_admin USING (TRUE);
CREATE POLICY admin_poi_all      ON purchase_order_items FOR ALL TO vendortrack_admin USING (TRUE);
CREATE POLICY admin_contract_all ON supplier_contracts   FOR ALL TO vendortrack_admin USING (TRUE);
CREATE POLICY admin_invoice_all  ON supplier_invoices    FOR ALL TO vendortrack_admin USING (TRUE);
CREATE POLICY admin_review_all   ON supplier_reviews     FOR ALL TO vendortrack_admin USING (TRUE);

CREATE POLICY supplier_own ON suppliers
    FOR ALL TO vendortrack_app
    USING (user_id = current_setting('app.current_user_id', TRUE)::UUID);

CREATE POLICY supplier_own_products ON supplier_products
    FOR ALL TO vendortrack_app
    USING (supplier_id IN (
        SELECT id FROM suppliers WHERE user_id = current_setting('app.current_user_id', TRUE)::UUID
    ));

CREATE POLICY supplier_own_po ON purchase_orders
    FOR SELECT TO vendortrack_app
    USING (
        supplier_id IN (SELECT id FROM suppliers WHERE user_id = current_setting('app.current_user_id', TRUE)::UUID)
        OR
        vendor_id IN (SELECT id FROM vendors WHERE user_id = current_setting('app.current_user_id', TRUE)::UUID)
    );

CREATE POLICY vendor_own_po ON purchase_orders
    FOR ALL TO vendortrack_app
    USING (vendor_id IN (
        SELECT id FROM vendors WHERE user_id = current_setting('app.current_user_id', TRUE)::UUID
    ));

GRANT SELECT ON suppliers, supplier_products, purchase_orders,
                supplier_reviews, supplier_invoices TO vendortrack_readonly;
REVOKE SELECT ON supplier_documents FROM vendortrack_readonly;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop tables and enums in reverse order
        await queryRunner.query(`
            DROP VIEW IF EXISTS po_dashboard_view;
            DROP VIEW IF EXISTS supplier_catalog_view;
            DROP TABLE IF EXISTS supplier_reviews;
            DROP TABLE IF EXISTS supplier_invoices;
            DROP TABLE IF EXISTS supplier_contracts;
            DROP TABLE IF EXISTS po_status_logs;
            DROP TABLE IF EXISTS purchase_order_items;
            DROP TABLE IF EXISTS purchase_orders;
            DROP TABLE IF EXISTS supplier_product_photos;
            DROP TABLE IF EXISTS supplier_products;
            DROP TABLE IF EXISTS supplier_documents;
            DROP TABLE IF EXISTS suppliers;
            DROP SEQUENCE IF EXISTS invoice_seq;
            DROP TYPE IF EXISTS payment_method;
            DROP TYPE IF EXISTS contract_status;
            DROP TYPE IF EXISTS po_status;
            DROP TYPE IF EXISTS product_status;
            DROP TYPE IF EXISTS supplier_status;
            DROP TYPE IF EXISTS supplier_type;
        `);
    }
}
