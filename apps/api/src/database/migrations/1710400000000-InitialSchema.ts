import { MigrationInterface, QueryRunner } from 'typeorm';
import { config } from 'dotenv';
import * as path from 'path';

// Load .env for migration CLI
config({ path: path.resolve(__dirname, '../../../.env') });

export class InitialSchema1710400000000 implements MigrationInterface {
    name = 'InitialSchema1710400000000';

    /**
     * Get database config from environment variables.
     * Falls back to legacy defaults for backward compatibility.
     */
    private getDbConfig() {
        const dbUrl = process.env.DATABASE_URL || '';
        let dbName = 'Nutrio';
        try {
            const url = new URL(dbUrl);
            dbName = url.pathname.replace('/', '') || dbName;
        } catch {
            // fallback to default
        }

        return {
            dbName,
            roleOwner: process.env.DB_ROLE_OWNER || 'postgres',
            roleApp: process.env.DB_ROLE_APP || 'Nutrio_app',
            roleReadonly: process.env.DB_ROLE_READONLY || 'Nutrio_readonly',
            roleAppPassword: process.env.DB_ROLE_APP_PASSWORD || 'REPLACE_IN_ENV',
            roleReadonlyPassword: process.env.DB_ROLE_READONLY_PASSWORD || 'REPLACE_IN_ENV',
            skipDbRoles: process.env.SKIP_DB_ROLES === 'true',
        };
    }

    public async up(queryRunner: QueryRunner): Promise<void> {
        const cfg = this.getDbConfig();

        // =====================================================================
        // ROLES (skip on cloud databases that don't allow CREATE ROLE)
        // =====================================================================
        if (!cfg.skipDbRoles) {
            console.log('🔧 Creating database roles...');
            await queryRunner.query(`
                DO $$
                BEGIN
                    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = '${cfg.roleApp}') THEN
                        CREATE ROLE "${cfg.roleApp}" LOGIN PASSWORD '${cfg.roleAppPassword}';
                    END IF;
                    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = '${cfg.roleReadonly}') THEN
                        CREATE ROLE "${cfg.roleReadonly}" LOGIN PASSWORD '${cfg.roleReadonlyPassword}';
                    END IF;
                END
                $$;
            `);
        } else {
            console.log('⏭️  Skipping database role creation (SKIP_DB_ROLES=true)');
        }

        // =====================================================================
        // EXTENSIONS + SCHEMA
        // =====================================================================
        await queryRunner.query(`
-- =============================================================================
-- Database Schema
-- PostgreSQL 16+
-- =============================================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- =============================================================================
-- SECTION 1: ENUMS
-- =============================================================================

CREATE TYPE user_role AS ENUM (
    'vendor',
    'inspector',
    'admin_bgn',
    'coordinator_sppg',
    'dinkes',
    'public'
);

CREATE TYPE vendor_status AS ENUM (
    'draft',
    'pending_review',
    'verified',
    'rejected',
    'suspended',
    'probation'
);

CREATE TYPE document_type AS ENUM (
    'pirt',
    'halal',
    'bpom',
    'nib',
    'siup',
    'npwp',
    'other'
);

CREATE TYPE document_status AS ENUM (
    'pending',
    'verified',
    'rejected',
    'expired',
    'revoked'
);

CREATE TYPE risk_category AS ENUM (
    'safe',       -- score 80-100
    'watch',      -- score 60-79
    'medium',     -- score 40-59
    'high_risk'   -- score 0-39
);

CREATE TYPE inspection_status AS ENUM (
    'assigned',
    'in_progress',
    'completed',
    'cancelled',
    'failed_geofence'
);

CREATE TYPE checklist_item_result AS ENUM (
    'pass',
    'fail',
    'na'
);

CREATE TYPE alert_severity AS ENUM (
    'info',
    'warning',
    'critical'
);

CREATE TYPE alert_type AS ENUM (
    'cert_expiring',
    'cert_expired',
    'sop_skip',
    'risk_drop',
    'inspection_overdue',
    'citizen_report',
    'payment_due',
    'vendor_suspended'
);

CREATE TYPE notification_channel AS ENUM (
    'whatsapp',
    'email',
    'in_app',
    'sms'
);

CREATE TYPE notification_status AS ENUM (
    'pending',
    'sent',
    'delivered',
    'failed',
    'read'
);

CREATE TYPE report_category AS ENUM (
    'food_poisoning',
    'hygiene',
    'portion',
    'expired_ingredient',
    'other'
);

CREATE TYPE report_severity AS ENUM (
    'critical',
    'high',
    'medium',
    'low'
);

CREATE TYPE report_status AS ENUM (
    'submitted',
    'triaged',
    'investigating',
    'resolved',
    'dismissed'
);

CREATE TYPE marketplace_listing_status AS ENUM (
    'open',
    'closed',
    'filled',
    'expired',
    'cancelled'
);

CREATE TYPE application_status AS ENUM (
    'applied',
    'shortlisted',
    'selected',
    'rejected',
    'withdrawn'
);

CREATE TYPE audit_action AS ENUM (
    'created',
    'updated',
    'status_changed',
    'deleted',
    'login',
    'logout',
    'document_uploaded',
    'document_verified',
    'inspection_completed',
    'score_recalculated',
    'payment_completed',
    'alert_triggered',
    'qr_regenerated'
);

CREATE TYPE qr_status AS ENUM (
    'active',
    'revoked',
    'expired'
);

CREATE TYPE training_status AS ENUM (
    'not_started',
    'in_progress',
    'completed',
    'certified'
);

CREATE TYPE payment_type AS ENUM (
    'subscription',
    'topup',
    'fine',
    'other'
);

CREATE TYPE payment_status AS ENUM (
    'pending',
    'paid',
    'failed',
    'expired',
    'refunded'
);

-- =============================================================================
-- SECTION 2: CORE IDENTITY TABLES
-- =============================================================================

CREATE TABLE users (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email               VARCHAR(255) NOT NULL UNIQUE,
    password_hash       TEXT NOT NULL,
    role                user_role NOT NULL DEFAULT 'vendor',
    full_name           VARCHAR(255) NOT NULL,
    phone               VARCHAR(20),
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    is_email_verified   BOOLEAN NOT NULL DEFAULT FALSE,
    email_verified_at   TIMESTAMPTZ,
    last_login_at       TIMESTAMPTZ,
    last_login_ip       INET,
    oss_id              VARCHAR(100) UNIQUE,
    dukcapil_nik        VARCHAR(16) UNIQUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at          TIMESTAMPTZ
);

CREATE TABLE refresh_tokens (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash  VARCHAR(64) NOT NULL UNIQUE,
    expires_at  TIMESTAMPTZ NOT NULL,
    revoked_at  TIMESTAMPTZ,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ip_address  INET,
    user_agent  TEXT
);

-- =============================================================================
-- SECTION 3: VENDOR & SPPG TABLES
-- =============================================================================

CREATE TABLE vendors (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    business_name       VARCHAR(255) NOT NULL,
    owner_name          VARCHAR(255) NOT NULL,
    nib                 VARCHAR(30) UNIQUE,
    npwp                VARCHAR(20) UNIQUE,
    phone               VARCHAR(20) NOT NULL,
    email               VARCHAR(255),
    address_street      TEXT NOT NULL,
    address_city        VARCHAR(100) NOT NULL,
    address_province    VARCHAR(100) NOT NULL,
    address_district    VARCHAR(100),
    address_postal      VARCHAR(10),
    coordinates         GEOGRAPHY(POINT, 4326),
    status              vendor_status NOT NULL DEFAULT 'draft',
    status_reason       TEXT,
    verified_at         TIMESTAMPTZ,
    verified_by         UUID REFERENCES users(id),
    daily_capacity_pax  INTEGER,
    specialization      TEXT[],
    current_risk_score  DECIMAL(5,2) DEFAULT 0,
    risk_category       risk_category DEFAULT 'watch',
    score_updated_at    TIMESTAMPTZ,
    training_status     training_status NOT NULL DEFAULT 'not_started',
    training_completed_at TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at          TIMESTAMPTZ
);

CREATE TABLE sppg_locations (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id       UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    name            VARCHAR(255) NOT NULL,
    address_street  TEXT NOT NULL,
    address_city    VARCHAR(100) NOT NULL,
    address_province VARCHAR(100) NOT NULL,
    coordinates     GEOGRAPHY(POINT, 4326) NOT NULL,
    sppg_code       VARCHAR(50) UNIQUE,
    assigned_schools TEXT[],
    assigned_inspector_id UUID REFERENCES users(id),
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    activated_at    TIMESTAMPTZ,
    deactivated_at  TIMESTAMPTZ,
    deactivation_reason TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- SECTION 4: DOCUMENT & CERTIFICATION TABLES
-- =============================================================================

CREATE TABLE documents (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id           UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
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
    bpom_verified_at    TIMESTAMPTZ,
    bpom_api_response   JSONB,
    uploaded_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- SECTION 5: SOP INSPECTION & COMPLIANCE TABLES
-- =============================================================================

CREATE TABLE sop_templates (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            VARCHAR(255) NOT NULL,
    description     TEXT,
    version         VARCHAR(20) NOT NULL DEFAULT '1.0',
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_by      UUID REFERENCES users(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE sop_template_items (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id     UUID NOT NULL REFERENCES sop_templates(id) ON DELETE CASCADE,
    category        VARCHAR(100) NOT NULL,
    item_text       TEXT NOT NULL,
    is_critical     BOOLEAN NOT NULL DEFAULT FALSE,
    requires_photo  BOOLEAN NOT NULL DEFAULT TRUE,
    weight          DECIMAL(5,2) NOT NULL DEFAULT 1.0,
    sort_order      INTEGER NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE inspections (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sppg_location_id    UUID NOT NULL REFERENCES sppg_locations(id) ON DELETE RESTRICT,
    vendor_id           UUID NOT NULL REFERENCES vendors(id) ON DELETE RESTRICT,
    template_id         UUID NOT NULL REFERENCES sop_templates(id),
    inspector_id        UUID NOT NULL REFERENCES users(id),
    status              inspection_status NOT NULL DEFAULT 'assigned',
    scheduled_for       DATE NOT NULL,
    started_at          TIMESTAMPTZ,
    completed_at        TIMESTAMPTZ,
    inspector_lat       DECIMAL(10, 8),
    inspector_lng       DECIMAL(11, 8),
    distance_from_sppg  DECIMAL(10, 2),
    geofence_passed     BOOLEAN,
    total_items         INTEGER,
    passed_items        INTEGER,
    failed_items        INTEGER,
    critical_fails      INTEGER DEFAULT 0,
    inspection_score    DECIMAL(5, 2),
    inspector_notes     TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE inspection_items (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    inspection_id   UUID NOT NULL REFERENCES inspections(id) ON DELETE CASCADE,
    template_item_id UUID NOT NULL REFERENCES sop_template_items(id),
    result          checklist_item_result NOT NULL,
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE inspection_photos (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    inspection_id       UUID NOT NULL REFERENCES inspections(id) ON DELETE CASCADE,
    inspection_item_id  UUID REFERENCES inspection_items(id) ON DELETE CASCADE,
    file_url            TEXT NOT NULL,
    file_key            TEXT NOT NULL UNIQUE,
    file_hash           VARCHAR(64) NOT NULL,
    file_size_bytes     INTEGER,
    captured_at         TIMESTAMPTZ NOT NULL,
    gps_lat             DECIMAL(10, 8),
    gps_lng             DECIMAL(11, 8),
    gps_accuracy_m      DECIMAL(8, 2),
    device_id           VARCHAR(255),
    watermark_applied   BOOLEAN NOT NULL DEFAULT FALSE,
    is_tampered         BOOLEAN DEFAULT FALSE,
    tamper_checked_at   TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- SECTION 6: RISK SCORING TABLES
-- =============================================================================

CREATE TABLE risk_scores (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id               UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    score                   DECIMAL(5, 2) NOT NULL CHECK (score >= 0 AND score <= 100),
    category                risk_category NOT NULL,
    component_sop           DECIMAL(5, 2),
    component_documents     DECIMAL(5, 2),
    component_cert_validity DECIMAL(5, 2),
    component_profile       DECIMAL(5, 2),
    component_incident      DECIMAL(5, 2),
    component_response_time DECIMAL(5, 2),
    trigger_event           VARCHAR(100),
    model_version           VARCHAR(20) NOT NULL DEFAULT 'v1',
    calculated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- SECTION 7: PUBLIC TRUST & QR CODE TABLES
-- =============================================================================

CREATE TABLE qr_codes (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sppg_location_id UUID NOT NULL REFERENCES sppg_locations(id) ON DELETE CASCADE,
    vendor_id       UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    qr_token        VARCHAR(64) NOT NULL UNIQUE,
    qr_url          TEXT NOT NULL,
    status          qr_status NOT NULL DEFAULT 'active',
    generated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    generated_by    UUID REFERENCES users(id),
    revoked_at      TIMESTAMPTZ,
    revoked_by      UUID REFERENCES users(id),
    revoke_reason   TEXT,
    expires_at      TIMESTAMPTZ,
    last_printed_at TIMESTAMPTZ,
    print_count     INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE qr_scans (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    qr_code_id  UUID NOT NULL REFERENCES qr_codes(id) ON DELETE CASCADE,
    scanned_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ip_hash     VARCHAR(64),
    user_agent  TEXT,
    country     VARCHAR(10),
    city        VARCHAR(100)
);

-- =============================================================================
-- SECTION 8: ALERT & NOTIFICATION TABLES
-- =============================================================================

CREATE TABLE alerts (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id       UUID REFERENCES vendors(id) ON DELETE CASCADE,
    sppg_location_id UUID REFERENCES sppg_locations(id) ON DELETE CASCADE,
    severity        alert_severity NOT NULL DEFAULT 'info',
    alert_type      alert_type NOT NULL,
    title           VARCHAR(255) NOT NULL,
    body            TEXT NOT NULL,
    metadata        JSONB,
    is_read         BOOLEAN NOT NULL DEFAULT FALSE,
    read_at         TIMESTAMPTZ,
    read_by         UUID REFERENCES users(id),
    is_resolved     BOOLEAN NOT NULL DEFAULT FALSE,
    resolved_at     TIMESTAMPTZ,
    resolved_by     UUID REFERENCES users(id),
    resolution_note TEXT,
    escalated       BOOLEAN NOT NULL DEFAULT FALSE,
    escalated_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE notifications (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    alert_id            UUID REFERENCES alerts(id) ON DELETE SET NULL,
    channel             notification_channel NOT NULL,
    status              notification_status NOT NULL DEFAULT 'pending',
    subject             VARCHAR(255),
    body                TEXT NOT NULL,
    sent_at             TIMESTAMPTZ,
    delivered_at        TIMESTAMPTZ,
    read_at             TIMESTAMPTZ,
    failed_at           TIMESTAMPTZ,
    failure_reason      TEXT,
    retry_count         INTEGER NOT NULL DEFAULT 0,
    provider_message_id TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- SECTION 9: CITIZEN REPORTING TABLES
-- =============================================================================

CREATE TABLE citizen_reports (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id           UUID NOT NULL REFERENCES vendors(id) ON DELETE RESTRICT,
    sppg_location_id    UUID REFERENCES sppg_locations(id) ON DELETE SET NULL,
    qr_code_id          UUID REFERENCES qr_codes(id) ON DELETE SET NULL,
    category            report_category NOT NULL,
    description         TEXT NOT NULL,
    incident_date       DATE,
    severity            report_severity NOT NULL DEFAULT 'medium',
    triage_confidence   DECIMAL(5, 2),
    triage_keywords     TEXT[],
    triage_model_ver    VARCHAR(20),
    status              report_status NOT NULL DEFAULT 'submitted',
    assigned_to         UUID REFERENCES users(id),
    investigated_at     TIMESTAMPTZ,
    resolved_at         TIMESTAMPTZ,
    resolved_by         UUID REFERENCES users(id),
    resolution_note     TEXT,
    photo_url           TEXT,
    photo_key           TEXT,
    reporter_ip_hash    VARCHAR(64),
    submission_token    VARCHAR(64),
    submitted_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- SECTION 10: MARKETPLACE TABLES
-- =============================================================================

CREATE TABLE marketplace_listings (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    posted_by           UUID NOT NULL REFERENCES users(id),
    province            VARCHAR(100) NOT NULL,
    city                VARCHAR(100) NOT NULL,
    coordinates         GEOGRAPHY(POINT, 4326),
    radius_km           DECIMAL(6, 2) NOT NULL DEFAULT 10,
    title               VARCHAR(255) NOT NULL,
    description         TEXT,
    daily_capacity_min  INTEGER NOT NULL,
    daily_capacity_max  INTEGER,
    meal_types          TEXT[],
    specialization_req  TEXT[],
    min_risk_score      DECIMAL(5, 2) DEFAULT 60,
    contract_start_date DATE,
    contract_duration_months INTEGER,
    budget_per_portion  DECIMAL(10, 2),
    status              marketplace_listing_status NOT NULL DEFAULT 'open',
    closes_at           TIMESTAMPTZ,
    filled_at           TIMESTAMPTZ,
    filled_vendor_id    UUID REFERENCES vendors(id),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE marketplace_applications (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id      UUID NOT NULL REFERENCES marketplace_listings(id) ON DELETE CASCADE,
    vendor_id       UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    proposal_text   TEXT,
    proposed_price_per_portion DECIMAL(10, 2),
    status          application_status NOT NULL DEFAULT 'applied',
    risk_score_at_application DECIMAL(5, 2),
    reviewed_at     TIMESTAMPTZ,
    reviewed_by     UUID REFERENCES users(id),
    decision_reason TEXT,
    applied_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (listing_id, vendor_id)
);

-- =============================================================================
-- SECTION 11: PAYMENT TABLES (BI SNAP API)
-- =============================================================================

CREATE TABLE payments (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id           UUID NOT NULL REFERENCES vendors(id) ON DELETE RESTRICT,
    payment_type        payment_type NOT NULL,
    amount              DECIMAL(12, 2) NOT NULL,
    currency            VARCHAR(3) NOT NULL DEFAULT 'IDR',
    description         TEXT,
    snap_order_id       VARCHAR(100) UNIQUE,
    snap_transaction_id VARCHAR(100),
    snap_payment_url    TEXT,
    snap_callback_raw   JSONB,
    status              payment_status NOT NULL DEFAULT 'pending',
    expires_at          TIMESTAMPTZ,
    paid_at             TIMESTAMPTZ,
    failed_at           TIMESTAMPTZ,
    refunded_at         TIMESTAMPTZ,
    invoice_number      VARCHAR(50) UNIQUE,
    invoice_url         TEXT,
    idempotency_key     VARCHAR(64) UNIQUE NOT NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- SECTION 12: AUDIT TRAIL (Immutable)
-- =============================================================================

CREATE TABLE audit_logs (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id        UUID REFERENCES users(id) ON DELETE SET NULL,
    actor_role      user_role,
    actor_ip        INET,
    entity_type     VARCHAR(100) NOT NULL,
    entity_id       UUID NOT NULL,
    action          audit_action NOT NULL,
    old_value       JSONB,
    new_value       JSONB,
    diff            JSONB,
    request_id      UUID,
    session_id      UUID,
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE RULE no_update_audit AS ON UPDATE TO audit_logs DO INSTEAD NOTHING;
CREATE RULE no_delete_audit AS ON DELETE TO audit_logs DO INSTEAD NOTHING;

-- =============================================================================
-- SECTION 13: ANALYTICS & REPORTING TABLES
-- =============================================================================

CREATE TABLE analytics_daily_snapshots (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id               UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    snapshot_date           DATE NOT NULL,
    inspections_scheduled   INTEGER NOT NULL DEFAULT 0,
    inspections_completed   INTEGER NOT NULL DEFAULT 0,
    inspections_missed      INTEGER NOT NULL DEFAULT 0,
    avg_inspection_score    DECIMAL(5, 2),
    critical_fails          INTEGER NOT NULL DEFAULT 0,
    risk_score              DECIMAL(5, 2),
    risk_category           risk_category,
    docs_total              INTEGER NOT NULL DEFAULT 0,
    docs_verified           INTEGER NOT NULL DEFAULT 0,
    docs_expiring_30d       INTEGER NOT NULL DEFAULT 0,
    reports_received        INTEGER NOT NULL DEFAULT 0,
    reports_critical        INTEGER NOT NULL DEFAULT 0,
    alerts_triggered        INTEGER NOT NULL DEFAULT 0,
    alerts_resolved         INTEGER NOT NULL DEFAULT 0,
    qr_scans_count          INTEGER NOT NULL DEFAULT 0,
    computed_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (vendor_id, snapshot_date)
);

CREATE TABLE analytics_regional_snapshots (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    snapshot_week           DATE NOT NULL,
    province                VARCHAR(100) NOT NULL,
    city                    VARCHAR(100),
    total_vendors           INTEGER NOT NULL DEFAULT 0,
    verified_vendors        INTEGER NOT NULL DEFAULT 0,
    high_risk_vendors       INTEGER NOT NULL DEFAULT 0,
    suspended_vendors       INTEGER NOT NULL DEFAULT 0,
    avg_risk_score          DECIMAL(5, 2),
    avg_inspection_score    DECIMAL(5, 2),
    sop_compliance_rate     DECIMAL(5, 2),
    citizen_reports_count   INTEGER NOT NULL DEFAULT 0,
    critical_reports_count  INTEGER NOT NULL DEFAULT 0,
    computed_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (snapshot_week, province, city)
);

-- =============================================================================
-- SECTION 14: TRAINING MODULE TABLES
-- =============================================================================

CREATE TABLE training_modules (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title           VARCHAR(255) NOT NULL,
    description     TEXT,
    video_url       TEXT,
    duration_mins   INTEGER,
    sort_order      INTEGER NOT NULL DEFAULT 0,
    is_required     BOOLEAN NOT NULL DEFAULT FALSE,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE training_module_questions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module_id       UUID NOT NULL REFERENCES training_modules(id) ON DELETE CASCADE,
    question_text   TEXT NOT NULL,
    options         JSONB NOT NULL,
    explanation     TEXT,
    sort_order      INTEGER NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE vendor_training_progress (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id       UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    module_id       UUID NOT NULL REFERENCES training_modules(id) ON DELETE CASCADE,
    status          training_status NOT NULL DEFAULT 'not_started',
    quiz_score      DECIMAL(5, 2),
    attempts        INTEGER NOT NULL DEFAULT 0,
    started_at      TIMESTAMPTZ,
    completed_at    TIMESTAMPTZ,
    certified_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (vendor_id, module_id)
);

-- =============================================================================
-- SECTION 15: EXTERNAL API INTEGRATION TABLES
-- =============================================================================

CREATE TABLE external_api_logs (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service         VARCHAR(50) NOT NULL,
    endpoint        TEXT NOT NULL,
    method          VARCHAR(10) NOT NULL,
    request_body    JSONB,
    response_status INTEGER,
    response_body   JSONB,
    latency_ms      INTEGER,
    success         BOOLEAN,
    error_message   TEXT,
    entity_type     VARCHAR(100),
    entity_id       UUID,
    called_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE open_data_exports (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    export_date     DATE NOT NULL UNIQUE,
    data_version    VARCHAR(20) NOT NULL,
    record_count    INTEGER NOT NULL,
    file_url        TEXT,
    pushed_to_datagoid BOOLEAN NOT NULL DEFAULT FALSE,
    pushed_at       TIMESTAMPTZ,
    push_response   JSONB,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- SECTION 16: SYSTEM CONFIGURATION
-- =============================================================================

CREATE TABLE system_config (
    key             VARCHAR(100) PRIMARY KEY,
    value           TEXT NOT NULL,
    description     TEXT,
    is_secret       BOOLEAN NOT NULL DEFAULT FALSE,
    updated_by      UUID REFERENCES users(id),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- SECTION 17: INDEXES
-- =============================================================================

CREATE INDEX idx_users_email         ON users(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_role          ON users(role)  WHERE deleted_at IS NULL;
CREATE INDEX idx_users_oss_id        ON users(oss_id) WHERE oss_id IS NOT NULL;
CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_hash ON refresh_tokens(token_hash);
CREATE INDEX idx_vendors_user        ON vendors(user_id);
CREATE INDEX idx_vendors_status      ON vendors(status);
CREATE INDEX idx_vendors_province    ON vendors(address_province);
CREATE INDEX idx_vendors_city        ON vendors(address_city);
CREATE INDEX idx_vendors_risk        ON vendors(risk_category, current_risk_score DESC);
CREATE INDEX idx_vendors_nib         ON vendors(nib) WHERE nib IS NOT NULL;
CREATE INDEX idx_vendors_search      ON vendors USING gin(to_tsvector('indonesian', business_name));
CREATE INDEX idx_vendors_geo         ON sppg_locations USING GIST(coordinates);
CREATE INDEX idx_vendors_deleted     ON vendors(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX idx_sppg_vendor         ON sppg_locations(vendor_id);
CREATE INDEX idx_sppg_inspector      ON sppg_locations(assigned_inspector_id);
CREATE INDEX idx_sppg_geo            ON sppg_locations USING GIST(coordinates);
CREATE INDEX idx_sppg_active         ON sppg_locations(is_active);
CREATE INDEX idx_docs_vendor         ON documents(vendor_id);
CREATE INDEX idx_docs_type           ON documents(doc_type);
CREATE INDEX idx_docs_status         ON documents(status);
CREATE INDEX idx_docs_expires        ON documents(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX idx_inspections_vendor      ON inspections(vendor_id);
CREATE INDEX idx_inspections_sppg        ON inspections(sppg_location_id);
CREATE INDEX idx_inspections_inspector   ON inspections(inspector_id);
CREATE INDEX idx_inspections_scheduled   ON inspections(scheduled_for);
CREATE INDEX idx_inspections_status      ON inspections(status);
CREATE INDEX idx_inspections_vendor_date ON inspections(vendor_id, scheduled_for DESC);
CREATE INDEX idx_insp_items_inspection ON inspection_items(inspection_id);
CREATE INDEX idx_insp_items_result     ON inspection_items(result);
CREATE INDEX idx_photos_inspection ON inspection_photos(inspection_id);
CREATE INDEX idx_photos_item       ON inspection_photos(inspection_item_id);
CREATE INDEX idx_risk_vendor       ON risk_scores(vendor_id);
CREATE INDEX idx_risk_calculated   ON risk_scores(vendor_id, calculated_at DESC);
CREATE INDEX idx_risk_category     ON risk_scores(category);
CREATE INDEX idx_qr_token          ON qr_codes(qr_token) WHERE status = 'active';
CREATE INDEX idx_qr_sppg           ON qr_codes(sppg_location_id);
CREATE INDEX idx_qr_vendor         ON qr_codes(vendor_id);
CREATE INDEX idx_qr_scans_code     ON qr_scans(qr_code_id);
CREATE INDEX idx_qr_scans_time     ON qr_scans(scanned_at);
CREATE INDEX idx_alerts_vendor     ON alerts(vendor_id);
CREATE INDEX idx_alerts_severity   ON alerts(severity) WHERE is_resolved = FALSE;
CREATE INDEX idx_alerts_unread     ON alerts(is_read, created_at DESC) WHERE is_read = FALSE;
CREATE INDEX idx_alerts_type       ON alerts(alert_type);
CREATE INDEX idx_notif_user        ON notifications(user_id);
CREATE INDEX idx_notif_status      ON notifications(status) WHERE status = 'pending';
CREATE INDEX idx_notif_channel     ON notifications(channel);
CREATE INDEX idx_reports_vendor    ON citizen_reports(vendor_id);
CREATE INDEX idx_reports_severity  ON citizen_reports(severity, submitted_at DESC);
CREATE INDEX idx_reports_status    ON citizen_reports(status);
CREATE INDEX idx_reports_date      ON citizen_reports(submitted_at DESC);
CREATE INDEX idx_market_status     ON marketplace_listings(status) WHERE status = 'open';
CREATE INDEX idx_market_province   ON marketplace_listings(province);
CREATE INDEX idx_market_geo        ON marketplace_listings USING GIST(coordinates);
CREATE INDEX idx_apps_listing      ON marketplace_applications(listing_id);
CREATE INDEX idx_apps_vendor       ON marketplace_applications(vendor_id);
CREATE INDEX idx_apps_status       ON marketplace_applications(status);
CREATE INDEX idx_payments_vendor   ON payments(vendor_id);
CREATE INDEX idx_payments_status   ON payments(status);
CREATE INDEX idx_payments_snap     ON payments(snap_transaction_id);
CREATE INDEX idx_audit_entity      ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_actor       ON audit_logs(actor_id);
CREATE INDEX idx_audit_action      ON audit_logs(action);
CREATE INDEX idx_audit_time        ON audit_logs(created_at DESC);
CREATE INDEX idx_daily_vendor_date   ON analytics_daily_snapshots(vendor_id, snapshot_date DESC);
CREATE INDEX idx_regional_week_prov  ON analytics_regional_snapshots(snapshot_week, province);
CREATE INDEX idx_ext_api_service   ON external_api_logs(service, called_at DESC);
CREATE INDEX idx_ext_api_entity    ON external_api_logs(entity_type, entity_id);

-- =============================================================================
-- SECTION 18: TRIGGERS
-- =============================================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
    t TEXT;
BEGIN
    FOREACH t IN ARRAY ARRAY[
        'users', 'vendors', 'sppg_locations', 'documents',
        'sop_templates', 'inspections', 'risk_scores',
        'marketplace_listings', 'marketplace_applications',
        'payments', 'vendor_training_progress',
        'citizen_reports', 'training_modules'
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

CREATE OR REPLACE FUNCTION sync_vendor_risk_score()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE vendors
    SET
        current_risk_score = NEW.score,
        risk_category      = NEW.category,
        score_updated_at   = NEW.calculated_at
    WHERE id = NEW.vendor_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sync_vendor_risk_score
    AFTER INSERT ON risk_scores
    FOR EACH ROW EXECUTE FUNCTION sync_vendor_risk_score();

CREATE OR REPLACE FUNCTION audit_vendor_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO audit_logs (
            entity_type, entity_id, action,
            old_value, new_value, diff
        ) VALUES (
            'vendors',
            NEW.id,
            'status_changed',
            jsonb_build_object('status', OLD.status),
            jsonb_build_object('status', NEW.status),
            jsonb_build_object(
                'field', 'status',
                'from',  OLD.status,
                'to',    NEW.status,
                'reason', NEW.status_reason
            )
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_audit_vendor_status
    AFTER UPDATE ON vendors
    FOR EACH ROW EXECUTE FUNCTION audit_vendor_status_change();

CREATE OR REPLACE FUNCTION check_document_expiry_alert()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.expires_at IS NOT NULL
       AND NEW.expires_at BETWEEN NOW() AND NOW() + INTERVAL '30 days'
       AND NEW.status = 'verified'
    THEN
        INSERT INTO alerts (vendor_id, severity, alert_type, title, body, metadata)
        VALUES (
            NEW.vendor_id,
            CASE
                WHEN NEW.expires_at < NOW() + INTERVAL '7 days' THEN 'critical'::alert_severity
                ELSE 'warning'::alert_severity
            END,
            'cert_expiring',
            format('Sertifikat %s akan kedaluwarsa', NEW.doc_type),
            format('Dokumen %s vendor akan kedaluwarsa pada %s. Segera perbarui.',
                   NEW.doc_type, TO_CHAR(NEW.expires_at, 'DD Mon YYYY')),
            jsonb_build_object('document_id', NEW.id, 'expires_at', NEW.expires_at)
        )
        ON CONFLICT DO NOTHING;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_doc_expiry_alert
    AFTER INSERT OR UPDATE ON documents
    FOR EACH ROW EXECUTE FUNCTION check_document_expiry_alert();

CREATE OR REPLACE FUNCTION escalate_critical_report()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.severity = 'critical' THEN
        INSERT INTO alerts (vendor_id, sppg_location_id, severity, alert_type, title, body, metadata, escalated)
        VALUES (
            NEW.vendor_id,
            NEW.sppg_location_id,
            'critical',
            'citizen_report',
            'LAPORAN KRITIS dari warga',
            format('Laporan kritis diterima: %s. Segera investigasi.', NEW.description),
            jsonb_build_object('report_id', NEW.id, 'category', NEW.category),
            TRUE
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_escalate_critical_report
    AFTER INSERT ON citizen_reports
    FOR EACH ROW EXECUTE FUNCTION escalate_critical_report();

CREATE OR REPLACE FUNCTION protect_audit_logs()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'audit_logs is immutable — UPDATE and DELETE are forbidden';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_protect_audit_logs_update
    BEFORE UPDATE ON audit_logs
    FOR EACH ROW EXECUTE FUNCTION protect_audit_logs();

CREATE TRIGGER trg_protect_audit_logs_delete
    BEFORE DELETE ON audit_logs
    FOR EACH ROW EXECUTE FUNCTION protect_audit_logs();

-- =============================================================================
-- SECTION 19: VIEWS
-- =============================================================================

CREATE OR REPLACE VIEW vendor_dashboard_view AS
SELECT
    v.id,
    v.business_name,
    v.owner_name,
    v.address_city,
    v.address_province,
    v.status,
    v.current_risk_score,
    v.risk_category,
    v.score_updated_at,
    COUNT(d.id)                                             AS docs_total,
    COUNT(d.id) FILTER (WHERE d.status = 'verified')       AS docs_verified,
    COUNT(d.id) FILTER (WHERE d.status = 'pending')        AS docs_pending,
    COUNT(d.id) FILTER (WHERE d.status = 'rejected')       AS docs_rejected,
    COUNT(d.id) FILTER (WHERE d.expires_at < NOW() + INTERVAL '30 days'
                          AND d.status = 'verified')        AS docs_expiring_soon,
    MAX(i.completed_at)                                     AS last_inspected_at,
    AVG(i.inspection_score)
        FILTER (WHERE i.status = 'completed'
                  AND i.completed_at > NOW() - INTERVAL '30 days') AS avg_score_30d,
    COUNT(a.id) FILTER (WHERE a.is_resolved = FALSE)       AS open_alerts,
    COUNT(a.id) FILTER (WHERE a.severity = 'critical'
                          AND a.is_resolved = FALSE)        AS critical_alerts,
    v.created_at,
    v.updated_at
FROM vendors v
LEFT JOIN documents d       ON d.vendor_id = v.id
LEFT JOIN inspections i     ON i.vendor_id = v.id
LEFT JOIN alerts a          ON a.vendor_id = v.id
WHERE v.deleted_at IS NULL
GROUP BY v.id;

CREATE OR REPLACE VIEW public_vendor_view AS
SELECT
    v.id,
    v.business_name,
    v.address_city,
    v.address_province,
    v.status,
    v.risk_category,
    COALESCE(
        json_agg(
            json_build_object(
                'doc_type',   d.doc_type,
                'status',     d.status,
                'expires_at', d.expires_at
            )
        ) FILTER (WHERE d.id IS NOT NULL AND d.status = 'verified'),
        '[]'
    ) AS active_certifications
FROM vendors v
LEFT JOIN documents d ON d.vendor_id = v.id
WHERE v.deleted_at IS NULL
  AND v.status = 'verified'
GROUP BY v.id;

CREATE OR REPLACE VIEW inspection_compliance_summary AS
SELECT
    vendor_id,
    COUNT(*)                                                    AS total_scheduled,
    COUNT(*) FILTER (WHERE status = 'completed')               AS completed,
    COUNT(*) FILTER (WHERE status IN ('assigned','in_progress')
                      AND scheduled_for < CURRENT_DATE)        AS missed,
    ROUND(
        100.0 * COUNT(*) FILTER (WHERE status = 'completed')
            / NULLIF(COUNT(*), 0),
        2
    )                                                           AS completion_rate_pct,
    ROUND(AVG(inspection_score) FILTER (WHERE status = 'completed'), 2) AS avg_score,
    MAX(completed_at)                                           AS last_completed_at
FROM inspections
WHERE scheduled_for >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY vendor_id;

-- =============================================================================
-- SECTION 20: SEED DATA
-- =============================================================================

INSERT INTO sop_templates (id, name, description, version, is_active)
VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'Standar SOP Dapur MBG v1.0',
    'Template checklist inspeksi harian dapur vendor MBG sesuai standar BGN',
    '1.0',
    TRUE
);

INSERT INTO sop_template_items (template_id, category, item_text, is_critical, requires_photo, weight, sort_order)
VALUES
    ('a0000000-0000-0000-0000-000000000001', 'Kebersihan Dapur', 'Lantai dan permukaan dapur bersih dari kotoran dan sisa makanan', FALSE, TRUE, 1.0, 1),
    ('a0000000-0000-0000-0000-000000000001', 'Kebersihan Dapur', 'Peralatan masak bersih dan dalam kondisi baik', FALSE, TRUE, 1.0, 2),
    ('a0000000-0000-0000-0000-000000000001', 'Kebersihan Dapur', 'Tempat sampah tertutup dan tidak penuh', FALSE, TRUE, 0.8, 3),
    ('a0000000-0000-0000-0000-000000000001', 'Bahan Baku', 'Tidak ada bahan baku kedaluwarsa di area produksi', TRUE,  TRUE, 2.0, 4),
    ('a0000000-0000-0000-0000-000000000001', 'Bahan Baku', 'Bahan baku disimpan pada suhu yang sesuai (kulkas ≤ 4°C, freezer ≤ -18°C)', TRUE, TRUE, 2.0, 5),
    ('a0000000-0000-0000-0000-000000000001', 'Bahan Baku', 'Bahan baku diberi label tanggal penerimaan dan jenis', FALSE, TRUE, 1.0, 6),
    ('a0000000-0000-0000-0000-000000000001', 'Proses Memasak', 'Suhu masak daging dan unggas mencapai minimal 75°C (dicek dengan termometer)', TRUE, TRUE, 2.0, 7),
    ('a0000000-0000-0000-0000-000000000001', 'Proses Memasak', 'Makanan matang tidak kontak langsung dengan bahan mentah', TRUE, TRUE, 1.5, 8),
    ('a0000000-0000-0000-0000-000000000001', 'APD Pekerja', 'Semua pekerja menggunakan sarung tangan saat menangani makanan', FALSE, TRUE, 1.0, 9),
    ('a0000000-0000-0000-0000-000000000001', 'APD Pekerja', 'Semua pekerja menggunakan penutup kepala', FALSE, TRUE, 1.0, 10),
    ('a0000000-0000-0000-0000-000000000001', 'APD Pekerja', 'Pekerja dengan luka terbuka tidak menangani makanan langsung', TRUE, TRUE, 2.0, 11),
    ('a0000000-0000-0000-0000-000000000001', 'Distribusi', 'Wadah distribusi bersih dan tertutup rapat', FALSE, TRUE, 1.0, 12),
    ('a0000000-0000-0000-0000-000000000001', 'Distribusi', 'Makanan didistribusikan dalam waktu ≤ 2 jam setelah dimasak', TRUE, FALSE, 1.5, 13);

INSERT INTO system_config (key, value, description) VALUES
    ('risk_score_sop_weight',         '35',    'Weight for SOP compliance component in risk score (%)'),
    ('risk_score_doc_weight',         '25',    'Weight for document completeness component (%)'),
    ('risk_score_cert_weight',        '25',    'Weight for certificate validity component (%)'),
    ('risk_score_profile_weight',     '15',    'Weight for profile completeness component (%)'),
    ('alert_sop_skip_days',           '3',     'Consecutive missed inspection days before alert'),
    ('alert_cert_expiry_days',        '30',    'Days before certificate expiry to trigger warning alert'),
    ('alert_cert_critical_days',      '7',     'Days before certificate expiry to trigger critical alert'),
    ('alert_risk_drop_threshold',     '20',    'Score drop amount that triggers a risk_drop alert'),
    ('geofence_radius_meters',        '500',   'Max distance inspector can be from SPPG to submit inspection'),
    ('licensing_fee_idr',             '150000','Annual vendor licensing fee in IDR'),
    ('marketplace_min_risk_default',  '60',    'Default minimum risk score for marketplace listings'),
    ('qr_token_expiry_days',          '365',   'Days until QR code expires and must be regenerated'),
    ('open_data_push_day',            '1',     'Day of week for data.go.id push (1=Monday)'),
    ('ml_model_retrain_day',          '0',     'Day of week for ML model retrain (0=Sunday)');
        `);

        // =====================================================================
        // RLS + admin policies + GRANT (skip on cloud databases)
        // Cloud databases handle access control differently (e.g. Supabase, Neon)
        // =====================================================================
        if (!cfg.skipDbRoles) {
            console.log('🔧 Creating RLS policies and GRANT statements...');
            await queryRunner.query(`
ALTER TABLE vendors              ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents            ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspections          ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspection_items     ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspection_photos    ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_scores          ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts               ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications        ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments             ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE citizen_reports      ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs           ENABLE ROW LEVEL SECURITY;

CREATE POLICY admin_all ON vendors              FOR ALL TO "${cfg.roleOwner}" USING (TRUE);
CREATE POLICY admin_all ON documents            FOR ALL TO "${cfg.roleOwner}" USING (TRUE);
CREATE POLICY admin_all ON inspections          FOR ALL TO "${cfg.roleOwner}" USING (TRUE);
CREATE POLICY admin_all ON inspection_items     FOR ALL TO "${cfg.roleOwner}" USING (TRUE);
CREATE POLICY admin_all ON inspection_photos    FOR ALL TO "${cfg.roleOwner}" USING (TRUE);
CREATE POLICY admin_all ON risk_scores          FOR ALL TO "${cfg.roleOwner}" USING (TRUE);
CREATE POLICY admin_all ON alerts               FOR ALL TO "${cfg.roleOwner}" USING (TRUE);
CREATE POLICY admin_all ON notifications        FOR ALL TO "${cfg.roleOwner}" USING (TRUE);
CREATE POLICY admin_all ON payments             FOR ALL TO "${cfg.roleOwner}" USING (TRUE);
CREATE POLICY admin_all ON marketplace_listings FOR ALL TO "${cfg.roleOwner}" USING (TRUE);
CREATE POLICY admin_all ON marketplace_applications FOR ALL TO "${cfg.roleOwner}" USING (TRUE);
CREATE POLICY admin_all ON citizen_reports      FOR ALL TO "${cfg.roleOwner}" USING (TRUE);
CREATE POLICY admin_all ON audit_logs           FOR SELECT TO "${cfg.roleOwner}" USING (TRUE);

CREATE POLICY vendor_own ON vendors
    FOR SELECT TO "${cfg.roleApp}"
    USING (user_id = current_setting('app.current_user_id', TRUE)::UUID);

CREATE POLICY vendor_own_docs ON documents
    FOR SELECT TO "${cfg.roleApp}"
    USING (vendor_id IN (
        SELECT id FROM vendors WHERE user_id = current_setting('app.current_user_id', TRUE)::UUID
    ));

CREATE POLICY inspector_assigned ON inspections
    FOR SELECT TO "${cfg.roleApp}"
    USING (inspector_id = current_setting('app.current_user_id', TRUE)::UUID);
            `);

            await queryRunner.query(`
GRANT CONNECT ON DATABASE "${cfg.dbName}" TO "${cfg.roleApp}";
GRANT USAGE ON SCHEMA public TO "${cfg.roleApp}";
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO "${cfg.roleApp}";
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO "${cfg.roleApp}";
REVOKE DELETE ON audit_logs FROM "${cfg.roleApp}";

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO "${cfg.roleOwner}";
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO "${cfg.roleOwner}";

GRANT CONNECT ON DATABASE "${cfg.dbName}" TO "${cfg.roleReadonly}";
GRANT USAGE ON SCHEMA public TO "${cfg.roleReadonly}";
GRANT SELECT ON ALL TABLES IN SCHEMA public TO "${cfg.roleReadonly}";
REVOKE SELECT ON users, refresh_tokens, external_api_logs FROM "${cfg.roleReadonly}";
            `);
        } else {
            console.log('⏭️  Skipping RLS, role policies, and GRANT statements (SKIP_DB_ROLES=true)');
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP SCHEMA public CASCADE;`);
        await queryRunner.query(`CREATE SCHEMA public;`);
    }
}
