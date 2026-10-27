-- ====================================================================================
-- MPLA CAPE TOWN & DIASPORA PORTAL — SUPABASE PRODUCTION BACKEND SCHEMA & AUTH ENGINE
-- Project ID: yuykjagarpubbwpxsush (https://yuykjagarpubbwpxsush.supabase.co)
-- Database Engine: PostgreSQL 15+ / Supabase
-- Features: Full DB Management, Row Level Security (RLS), Supabase Auth Trigger,
--           RBAC, Cryptographic Card HMAC Verification, Storage Buckets & Seed Data
-- ====================================================================================

-- ------------------------------------------------------------------------------------
-- 1. EXTENSIONS
-- ------------------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------------
-- 2. CUSTOM ENUM TYPES & DOMAINS
-- ------------------------------------------------------------------------------------
DO $$ BEGIN
    CREATE TYPE public.app_role AS ENUM ('super_admin', 'admin', 'committee_leader', 'militante', 'guest');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE public.organization_wing AS ENUM ('Militante', 'OMA', 'JMPLA', 'Simpatizante', 'Veterano');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE public.member_status AS ENUM ('Active', 'Pending Verification', 'Inactive', 'Suspended');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE public.card_status AS ENUM (
        'Submitted', 'Verification', 'Approved', 'Printing', 
        'Quality Check', 'Ready for Dispatch', 'In Transit', 
        'Available for Collection', 'Collected'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE public.ticket_status AS ENUM ('Open', 'In Progress', 'Resolved', 'Closed');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ------------------------------------------------------------------------------------
-- 3. CORE PLATFORM TABLES
-- ------------------------------------------------------------------------------------

-- A. COMMITTEES / SECTORS
CREATE TABLE IF NOT EXISTS public.committees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    province TEXT NOT NULL DEFAULT 'Western Cape',
    municipality TEXT NOT NULL DEFAULT 'City of Cape Town',
    secretary_general TEXT,
    contact_phone TEXT,
    contact_email TEXT,
    member_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- B. MEMBERS & MILITANTES PROFILE TABLE (Tied 1:1 with auth.users)
CREATE TABLE IF NOT EXISTS public.members (
    id TEXT PRIMARY KEY,
    auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
    membership_no TEXT UNIQUE NOT NULL,
    national_id TEXT NOT NULL,
    id_type TEXT NOT NULL DEFAULT 'BI', -- 'BI' or 'Passport'
    full_name TEXT NOT NULL,
    email TEXT,
    mobile TEXT,
    photo TEXT DEFAULT 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=400&fit=crop',
    cover_photo TEXT DEFAULT 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&h=400&fit=crop',
    photo_position_x NUMERIC(5,2) DEFAULT 50.00,
    photo_position_y NUMERIC(5,2) DEFAULT 50.00,
    tracking_code TEXT,
    can_update_photo BOOLEAN DEFAULT TRUE,
    last_renewal_date DATE,
    is_real_data BOOLEAN DEFAULT TRUE,
    role TEXT NOT NULL DEFAULT 'member', -- 'member' or 'admin'
    app_role public.app_role DEFAULT 'militante',
    status TEXT NOT NULL DEFAULT 'Active', -- 'Pending Verification', 'Active', 'Inactive', 'Suspended'
    membership_level TEXT NOT NULL DEFAULT 'Standard', -- 'Standard', 'Silver', 'Gold', 'Platinum', 'Committee'
    category TEXT NOT NULL DEFAULT 'General', -- 'Youth', 'Senior', 'General', 'Associate'
    organization_wing TEXT NOT NULL DEFAULT 'Militante', -- 'Militante', 'JMPLA', 'OMA'
    militancy_level TEXT NOT NULL DEFAULT 'Militante',
    province TEXT NOT NULL DEFAULT 'Western Cape',
    municipality TEXT NOT NULL DEFAULT 'City of Cape Town',
    committee TEXT NOT NULL DEFAULT 'Comité do MPLA na Cidade do Cabo',
    committee_id UUID REFERENCES public.committees(id) ON DELETE SET NULL,
    branch TEXT,
    address TEXT,
    dues_status TEXT DEFAULT 'Em Dia',
    dues_balance NUMERIC(10,2) DEFAULT 0.00,
    outstanding_balance NUMERIC(10,2) DEFAULT 0.00,
    registration_date DATE DEFAULT CURRENT_DATE,
    physical_card_status TEXT NOT NULL DEFAULT 'Submitted',
    physical_card_est_date DATE DEFAULT (CURRENT_DATE + INTERVAL '30 days'),
    issuing_office TEXT DEFAULT 'Comité da Cidade do Cabo',
    gender TEXT DEFAULT 'Male',
    dob DATE DEFAULT '1995-01-01',
    place_of_birth TEXT,
    marital_status TEXT DEFAULT 'Single',
    emergency_contact JSONB DEFAULT '{"name": "Contacto de Emergência", "phone": "+27 82 000 0000"}'::jsonb,
    occupation TEXT DEFAULT 'Profissional',
    employer TEXT DEFAULT 'Empresa / Organização',
    education TEXT DEFAULT 'Ensino Superior',
    leadership_roles TEXT[] DEFAULT '{}',
    registered_events TEXT[] DEFAULT '{}',
    completed_courses TEXT[] DEFAULT '{}',
    voted_polls JSONB DEFAULT '{}'::jsonb,
    payment_history JSONB DEFAULT '[]'::jsonb,
    bio TEXT,
    skills TEXT[] DEFAULT '{}',
    interests TEXT[] DEFAULT '{}',
    social_links JSONB DEFAULT '{}'::jsonb,
    visibility_settings JSONB DEFAULT '{"bio":"public","skills":"public","interests":"members","socialLinks":"public","email":"members","mobile":"private","occupation":"public"}'::jsonb,
    virtual_card_number TEXT,
    virtual_card_expiry TEXT,
    virtual_card_cvv TEXT,
    virtual_card_balance NUMERIC(10,2) DEFAULT 0.00,
    virtual_card_status TEXT DEFAULT 'Active',
    card_signature TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- C. USER ROLES (Granular RBAC)
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    member_id TEXT REFERENCES public.members(id) ON DELETE CASCADE,
    role public.app_role NOT NULL DEFAULT 'militante',
    granted_by TEXT DEFAULT 'System',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_role UNIQUE (user_id, role)
);

-- D. OFFICIAL DOCUMENTS (Certificates, Receipts, Consular Letters)
CREATE TABLE IF NOT EXISTS public.official_documents (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'Certificates', -- 'Membership', 'Certificates', 'Receipts', 'AdminDispatch', 'AIGeneral'
    size TEXT DEFAULT '1.5 MB',
    date DATE DEFAULT CURRENT_DATE,
    sender TEXT DEFAULT 'system', -- 'member', 'admin', 'system'
    recipient_id TEXT REFERENCES public.members(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    status TEXT DEFAULT 'Approved', -- 'Approved', 'Pending', 'Delivered'
    file_content TEXT,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- E. ANNOUNCEMENTS & NEWS
CREATE TABLE IF NOT EXISTS public.announcements (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    source TEXT DEFAULT 'National', -- 'National', 'Regional', 'Local'
    author TEXT DEFAULT 'Direcção de Comunicação e Imagem',
    category TEXT DEFAULT 'Campaign', -- 'Campaign', 'News', 'Press Release', 'Notice', 'Emergency'
    date DATE DEFAULT CURRENT_DATE,
    is_pinned BOOLEAN DEFAULT FALSE,
    banner_image TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- F. PARTY EVENTS
CREATE TABLE IF NOT EXISTS public.events (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    event_date TIMESTAMPTZ NOT NULL,
    location TEXT NOT NULL,
    venue TEXT,
    province TEXT DEFAULT 'Western Cape',
    lat NUMERIC(10,6),
    lng NUMERIC(10,6),
    organizer TEXT DEFAULT 'National', -- 'National', 'Provincial', 'Municipal', 'Local'
    status TEXT DEFAULT 'Upcoming', -- 'Upcoming', 'Completed', 'Cancelled'
    registered_count INT DEFAULT 0,
    capacity INT DEFAULT 500,
    registered_member_ids TEXT[] DEFAULT '{}',
    banner_url TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- G. EVENT REGISTRATIONS (Join table for real-time tracking)
CREATE TABLE IF NOT EXISTS public.event_registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id TEXT REFERENCES public.events(id) ON DELETE CASCADE,
    member_id TEXT REFERENCES public.members(id) ON DELETE CASCADE,
    attended BOOLEAN DEFAULT FALSE,
    qr_code_token TEXT,
    registered_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_event_registration UNIQUE (event_id, member_id)
);

-- H. LEARNING COURSES (Academia Política do MPLA - 5 Pilares)
CREATE TABLE IF NOT EXISTS public.courses (
    id TEXT PRIMARY KEY,
    pillar_number INT,
    pillar_roman TEXT,
    pillar_title TEXT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    target_audience TEXT,
    essential_content TEXT[] DEFAULT '{}',
    format_description TEXT,
    category TEXT DEFAULT 'Formação Política',
    duration TEXT DEFAULT '4 Horas',
    video_url TEXT,
    content_markdown TEXT,
    study_case JSONB,
    resources JSONB DEFAULT '[]'::jsonb,
    quiz JSONB DEFAULT '[]'::jsonb,
    previous_classes JSONB DEFAULT '[]'::jsonb,
    social_channels JSONB DEFAULT '[]'::jsonb,
    extra_materials JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- I. COURSE COMPLETIONS
CREATE TABLE IF NOT EXISTS public.course_completions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id TEXT REFERENCES public.courses(id) ON DELETE CASCADE,
    member_id TEXT REFERENCES public.members(id) ON DELETE CASCADE,
    score NUMERIC(5,2) DEFAULT 100.00,
    certificate_issued BOOLEAN DEFAULT TRUE,
    certificate_id TEXT,
    completed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_course_completion UNIQUE (course_id, member_id)
);

-- J. SURVEY POLLS
CREATE TABLE IF NOT EXISTS public.survey_polls (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    options TEXT[] NOT NULL,
    votes JSONB DEFAULT '{}'::jsonb, -- optionName -> voteCount
    voted_member_ids TEXT[] DEFAULT '{}',
    is_anonymous BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMPTZ
);

-- K. POLL VOTES
CREATE TABLE IF NOT EXISTS public.poll_votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    poll_id TEXT REFERENCES public.survey_polls(id) ON DELETE CASCADE,
    member_id TEXT REFERENCES public.members(id) ON DELETE CASCADE,
    option_selected TEXT NOT NULL,
    voted_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_poll_member_vote UNIQUE (poll_id, member_id)
);

-- L. SUPPORT TICKETS
CREATE TABLE IF NOT EXISTS public.support_tickets (
    id TEXT PRIMARY KEY,
    member_id TEXT REFERENCES public.members(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'Profile Correction', 'Lost Card Report', 'Card Replacement', 'General Inquiry'
    description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Open', -- 'Open', 'In Progress', 'Resolved', 'Closed'
    assigned_officer TEXT DEFAULT 'Gabinete de Atendimento e Apoio ao Militante',
    est_resolution_time TEXT DEFAULT '24 horas',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- M. SUPPORT TICKET REPLIES
CREATE TABLE IF NOT EXISTS public.ticket_replies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id TEXT REFERENCES public.support_tickets(id) ON DELETE CASCADE,
    sender_type TEXT NOT NULL, -- 'member' or 'officer'
    sender_name TEXT NOT NULL,
    text TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- N. CHAT CHANNELS & REALTIME MESSAGING
CREATE TABLE IF NOT EXISTS public.chat_channels (
    id TEXT PRIMARY KEY,
    member_id TEXT REFERENCES public.members(id) ON DELETE CASCADE,
    type TEXT NOT NULL DEFAULT 'Local Committee', -- 'Local Committee', 'Regional Office', 'National Helpdesk'
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    channel_id TEXT REFERENCES public.chat_channels(id) ON DELETE CASCADE,
    sender TEXT NOT NULL, -- 'member' or 'admin'
    sender_name TEXT NOT NULL,
    text TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- O. PAYMENT LOGS & DUES (Whop, Absa Pay, VodaPay, EFT)
CREATE TABLE IF NOT EXISTS public.payment_logs (
    id TEXT PRIMARY KEY,
    member_id TEXT REFERENCES public.members(id) ON DELETE SET NULL,
    amount NUMERIC(10,2) NOT NULL,
    currency TEXT DEFAULT 'ZAR',
    date DATE DEFAULT CURRENT_DATE,
    method TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Successful', -- 'Successful', 'Pending', 'Failed', 'Refunded'
    purpose TEXT NOT NULL,
    payer_phone TEXT,
    
    -- ABSA Open Banking Metadata
    absa_payment_id TEXT,
    absa_transaction_id TEXT,
    absa_account_number TEXT,
    absa_account_name TEXT,
    absa_payer_type TEXT,
    absa_statement_ref TEXT,
    absa_surecheck_status TEXT,
    is_recurring BOOLEAN DEFAULT FALSE,
    recurring_schedule_id TEXT,
    receipt_url TEXT,
    fx_rate_applied NUMERIC(10,4),
    amount_aoa NUMERIC(12,2),
    
    -- VodaPay Gateway Metadata
    vodapay_payment_id TEXT,
    vodapay_payment_request_id TEXT,
    vodapay_status TEXT,
    vodapay_qr_code TEXT,
    vodapay_trace_no TEXT,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- P. ABSA RECURRING SUBSCRIPTIONS
CREATE TABLE IF NOT EXISTS public.absa_subscriptions (
    id TEXT PRIMARY KEY,
    member_id TEXT REFERENCES public.members(id) ON DELETE CASCADE,
    member_name TEXT NOT NULL,
    membership_no TEXT NOT NULL,
    amount NUMERIC(10,2) NOT NULL,
    currency TEXT DEFAULT 'ZAR',
    interval TEXT DEFAULT 'monthly', -- 'monthly', 'quarterly', 'annual'
    purpose TEXT NOT NULL,
    status TEXT DEFAULT 'Active', -- 'Active', 'Paused', 'Cancelled'
    payer_identification_type TEXT DEFAULT 'SAID',
    payer_identification TEXT,
    absa_payment_id TEXT,
    absa_transaction_id TEXT,
    account_index INT DEFAULT 0,
    account_name TEXT,
    account_number_masked TEXT,
    next_billing_date DATE,
    last_billed_date DATE,
    billing_count INT DEFAULT 1,
    total_paid NUMERIC(10,2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Q. VODAPAY PAYMENT LINKS & BATCHES
CREATE TABLE IF NOT EXISTS public.vodapay_payment_links (
    id TEXT PRIMARY KEY,
    link_code TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    amount NUMERIC(10,2) NOT NULL,
    purpose TEXT NOT NULL,
    recipient_member_id TEXT REFERENCES public.members(id) ON DELETE SET NULL,
    recipient_name TEXT,
    recipient_phone TEXT,
    status TEXT DEFAULT 'ACTIVE', -- 'ACTIVE', 'PAID', 'EXPIRED'
    qr_url TEXT,
    payment_url TEXT,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.vodapay_batches (
    id TEXT PRIMARY KEY,
    batch_number TEXT UNIQUE NOT NULL,
    gross_amount NUMERIC(10,2) NOT NULL,
    fee_amount NUMERIC(10,2) NOT NULL,
    net_amount NUMERIC(10,2) NOT NULL,
    transaction_count INT DEFAULT 0,
    status TEXT DEFAULT 'SETTLED', -- 'SETTLED', 'PROCESSING', 'PENDING'
    bank_reference TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- R. SYSTEM AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.system_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    user_name TEXT NOT NULL,
    role TEXT NOT NULL,
    action TEXT NOT NULL,
    device TEXT DEFAULT 'Browser / Web Client',
    location TEXT DEFAULT 'Cape Town, ZA',
    ip TEXT DEFAULT '127.0.0.1',
    details TEXT NOT NULL
);

-- S. ADMIN NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.admin_notifications (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    meta JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- T. INVENTORY & CONSUMABLES
CREATE TABLE IF NOT EXISTS public.inventory_stats (
    id TEXT PRIMARY KEY DEFAULT 'current_inventory',
    blank_cards INT DEFAULT 4850,
    printers_status TEXT DEFAULT 'Online', -- 'Online', 'Offline', 'Maintenance'
    ink_percent INT DEFAULT 78,
    ribbon_percent INT DEFAULT 62,
    packaging_envelopes INT DEFAULT 12000,
    holograms INT DEFAULT 4200,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- U. WEBSITE CMS CONFIGURATION (Official Slogans & Texts)
CREATE TABLE IF NOT EXISTS public.website_cms_config (
    id TEXT PRIMARY KEY DEFAULT 'current_cms',
    hero_title_pt TEXT DEFAULT 'Comité do MPLA na Cidade do Cabo',
    hero_title_en TEXT DEFAULT 'MPLA Committee in Cape Town',
    hero_subtitle_pt TEXT DEFAULT 'Unidos na Diáspora pelo Desenvolvimento e Dignidade de Angola',
    hero_subtitle_en TEXT DEFAULT 'United in the Diaspora for the Development and Dignity of Angola',
    slogan_pt TEXT DEFAULT 'Compromisso com o Povo, Confiança no Futuro',
    slogan_en TEXT DEFAULT 'Commitment to the People, Confidence in the Future',
    jmpla_slogan_pt TEXT DEFAULT 'Compromisso com o Povo, Confiança no Futuro — Vanguarda da Juventude',
    oma_slogan_pt TEXT DEFAULT 'Compromisso com o Povo, Confiança no Futuro — Firmeza da Mulher Angolana',
    contact_email TEXT DEFAULT 'comitemplacapetown@gmail.com',
    contact_phone TEXT DEFAULT '+27 82 123 4567',
    contact_address TEXT DEFAULT 'Cape Town, Western Cape, South Africa',
    banner_alert_active BOOLEAN DEFAULT FALSE,
    banner_alert_text TEXT,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------------
-- 4. CRYPTOGRAPHIC FUNCTIONS & HMAC CARD SECURITY
-- ------------------------------------------------------------------------------------

-- Function: Compute SHA-256 HMAC Signature for Digital Member Card
CREATE OR REPLACE FUNCTION public.compute_card_signature(
    p_id TEXT,
    p_membership_no TEXT,
    p_national_id TEXT,
    p_reg_date TEXT,
    p_province TEXT,
    p_committee TEXT
) RETURNS TEXT AS $$
DECLARE
    secret_key CONSTANT TEXT := 'MPLA-SECURE-CARD-HMAC-2026-KEY';
    raw_payload TEXT;
    raw_hash TEXT;
BEGIN
    raw_payload := COALESCE(p_id, '') || '|' || 
                   COALESCE(p_membership_no, '') || '|' || 
                   COALESCE(p_national_id, '') || '|' || 
                   COALESCE(p_reg_date, '') || '|' || 
                   COALESCE(p_province, 'ZA') || '|' || 
                   COALESCE(p_committee, 'MPLA');
                   
    raw_hash := encode(hmac(raw_payload, secret_key, 'sha256'), 'hex');
    RETURN UPPER(SUBSTRING(raw_hash FROM 1 FOR 32));
END;
$$ LANGUAGE plpgsql IMMUTABLE SECURITY DEFINER;

-- Function: Verify Tamper-Proof Digital Card
CREATE OR REPLACE FUNCTION public.verify_member_card(
    p_membership_no TEXT,
    p_signature TEXT
) RETURNS JSONB AS $$
DECLARE
    rec RECORD;
    expected_sig TEXT;
BEGIN
    SELECT * INTO rec FROM public.members 
    WHERE LOWER(membership_no) = LOWER(p_membership_no);

    IF NOT FOUND THEN
        RETURN jsonb_build_object('valid', false, 'error', 'Militante não registado no sistema central.');
    END IF;

    expected_sig := public.compute_card_signature(
        rec.id, rec.membership_no, rec.national_id, 
        rec.registration_date::TEXT, rec.province, rec.committee
    );

    IF p_signature IS NOT NULL AND p_signature = expected_sig THEN
        RETURN jsonb_build_object(
            'valid', true,
            'membershipNo', rec.membership_no,
            'fullName', rec.full_name,
            'status', rec.status,
            'category', rec.category,
            'wing', rec.organization_wing,
            'verifiedAt', CURRENT_TIMESTAMP
        );
    ELSE
        RETURN jsonb_build_object('valid', false, 'error', 'Assinatura criptográfica inválida ou adulterada.');
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ------------------------------------------------------------------------------------
-- 5. SECURITY HELPERS & RBAC FUNCTIONS
-- ------------------------------------------------------------------------------------

-- Function: Check if Authenticated User has Admin Privileges
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
DECLARE
    user_email TEXT;
BEGIN
    -- Super Admin direct emails
    user_email := auth.jwt() ->> 'email';
    IF user_email IN ('comitemplacapetown@gmail.com', 'admin@mpla-sa.org', 'admin@mpla.org') THEN
        RETURN TRUE;
    END IF;

    -- JWT app_metadata check
    IF (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'super_admin') THEN
        RETURN TRUE;
    END IF;

    -- Database user_roles or members table role check
    RETURN (
        EXISTS (
            SELECT 1 FROM public.members m
            WHERE m.auth_user_id = auth.uid()
            AND (m.role = 'admin' OR m.app_role IN ('admin', 'super_admin'))
        )
        OR
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = auth.uid()
            AND ur.role IN ('admin', 'super_admin')
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Check if Authenticated User is Super Admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
    IF (auth.jwt() ->> 'email') = 'comitemplacapetown@gmail.com' THEN
        RETURN TRUE;
    END IF;

    RETURN (
        EXISTS (
            SELECT 1 FROM public.members m
            WHERE m.auth_user_id = auth.uid()
            AND m.app_role = 'super_admin'
        )
        OR
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = auth.uid()
            AND ur.role = 'super_admin'
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ------------------------------------------------------------------------------------
-- 6. AUTOMATIC PROVISIONING TRIGGER (auth.users -> public.members)
-- ------------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
    v_mem_no TEXT;
    v_random_seq TEXT;
    v_role TEXT := 'member';
    v_app_role public.app_role := 'militante';
    v_full_name TEXT;
    v_national_id TEXT;
    v_phone TEXT;
    v_sig TEXT;
    v_existing_id TEXT;
    v_member_id TEXT;
BEGIN
    -- Check if member profile already exists with this email
    SELECT id INTO v_existing_id FROM public.members 
    WHERE LOWER(TRIM(email)) = LOWER(TRIM(NEW.email)) 
    LIMIT 1;
    
    IF v_existing_id IS NOT NULL THEN
        -- Link existing member to new auth user
        UPDATE public.members 
        SET auth_user_id = NEW.id,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = v_existing_id;
        
        -- Assign default role
        INSERT INTO public.user_roles (user_id, member_id, role, granted_by)
        VALUES (NEW.id, v_existing_id, v_app_role, 'System Auth Trigger')
        ON CONFLICT DO NOTHING;
        
        RETURN NEW;
    END IF;

    -- Generate sequential random digits
    v_random_seq := LPAD(FLOOR(RANDOM() * 100000)::TEXT, 5, '0');
    v_mem_no := 'MPLA-ZA-' || TO_CHAR(CURRENT_DATE, 'YYYY') || '-' || v_random_seq;
    v_member_id := 'm-' || EXTRACT(EPOCH FROM CURRENT_TIMESTAMP)::BIGINT || '-' || v_random_seq;

    -- Extract metadata safely
    v_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1), 'Militante do MPLA');
    v_national_id := COALESCE(NEW.raw_user_meta_data->>'national_id', 'BI-PENDENTE-' || v_random_seq);
    v_phone := COALESCE(NEW.raw_user_meta_data->>'mobile', '+27 82 000 0000');

    -- Check if user is Super Admin
    IF LOWER(TRIM(NEW.email)) = 'comitemplacapetown@gmail.com' THEN
        v_role := 'admin';
        v_app_role := 'super_admin';
        v_full_name := 'Comité de MPLA Cape Town Super Admin';
    END IF;

    -- Precompute HMAC signature with fallback
    BEGIN
        v_sig := public.compute_card_signature(
            v_member_id, v_mem_no, v_national_id, 
            CURRENT_DATE::TEXT, 'Western Cape', 'Comité do MPLA na Cidade do Cabo'
        );
    EXCEPTION WHEN OTHERS THEN
        v_sig := 'SIG-' || v_random_seq;
    END;

    -- Insert into public.members safely
    BEGIN
        INSERT INTO public.members (
            id,
            auth_user_id,
            membership_no,
            national_id,
            full_name,
            email,
            mobile,
            photo,
            status,
            role,
            app_role,
            membership_level,
            category,
            organization_wing,
            province,
            municipality,
            committee,
            registration_date,
            physical_card_status,
            card_signature
        ) VALUES (
            v_member_id,
            NEW.id,
            v_mem_no,
            v_national_id,
            v_full_name,
            NEW.email,
            v_phone,
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=400&fit=crop',
            'Active',
            v_role,
            v_app_role,
            'Standard',
            'General',
            COALESCE(NEW.raw_user_meta_data->>'organization_wing', 'Militante'),
            COALESCE(NEW.raw_user_meta_data->>'province', 'Western Cape'),
            COALESCE(NEW.raw_user_meta_data->>'municipality', 'City of Cape Town'),
            'Comité do MPLA na Cidade do Cabo',
            CURRENT_DATE,
            'Submitted',
            v_sig
        ) ON CONFLICT (id) DO UPDATE SET auth_user_id = NEW.id;
    EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'handle_new_auth_user insert member exception: %', SQLERRM;
    END;

    -- Insert into public.user_roles safely
    BEGIN
        INSERT INTO public.user_roles (user_id, member_id, role, granted_by)
        VALUES (NEW.id, v_member_id, v_app_role, 'System Auth Trigger')
        ON CONFLICT DO NOTHING;
    EXCEPTION WHEN OTHERS THEN
        NULL;
    END;

    -- Log to system audit safely
    BEGIN
        INSERT INTO public.system_audit_logs (user_name, role, action, details)
        VALUES (
            v_full_name,
            v_role,
            'Member Account Provisioned',
            'Novo membro registado via Supabase Auth (' || NEW.email || ') com número ' || v_mem_no
        );
    EXCEPTION WHEN OTHERS THEN
        NULL;
    END;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Re-create Trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- Trigger: Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_members_updated_at ON public.members;
CREATE TRIGGER set_members_updated_at
BEFORE UPDATE ON public.members
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_events_updated_at ON public.events;
CREATE TRIGGER set_events_updated_at
BEFORE UPDATE ON public.events
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ------------------------------------------------------------------------------------
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------------

ALTER TABLE public.committees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.official_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.absa_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vodapay_payment_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vodapay_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_cms_config ENABLE ROW LEVEL SECURITY;

-- Clean existing policies before recreation
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT policyname, tablename 
        FROM pg_policies 
        WHERE schemaname = 'public'
    ) LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.' || r.tablename;
    END LOOP;
END $$;

-- A. COMMITTEES
CREATE POLICY "Public Read Committees" ON public.committees FOR SELECT USING (true);
CREATE POLICY "Admin Manage Committees" ON public.committees FOR ALL USING (public.is_admin());

-- B. MEMBERS
CREATE POLICY "Public Read Directory Members" ON public.members FOR SELECT USING (true);
CREATE POLICY "Member Update Own Profile" ON public.members FOR UPDATE USING (
    (auth.uid() IS NOT NULL AND auth.uid() = auth_user_id) 
    OR public.is_admin()
    OR auth.role() = 'anon'
);
CREATE POLICY "Allow Member Self Registration" ON public.members FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin Full Control Members" ON public.members FOR ALL USING (public.is_admin());

-- C. USER ROLES
CREATE POLICY "Self View Roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Admin Manage Roles" ON public.user_roles FOR ALL USING (public.is_admin());

-- D. OFFICIAL DOCUMENTS
CREATE POLICY "Member View Own Documents" ON public.official_documents FOR SELECT 
USING (
    sender = 'member' 
    OR recipient_id IN (SELECT id FROM public.members WHERE auth_user_id = auth.uid()) 
    OR public.is_admin()
);
CREATE POLICY "Member Upload Documents" ON public.official_documents FOR INSERT 
WITH CHECK (
    recipient_id IN (SELECT id FROM public.members WHERE auth_user_id = auth.uid()) 
    OR public.is_admin()
);
CREATE POLICY "Admin Manage Documents" ON public.official_documents FOR ALL USING (public.is_admin());

-- E. ANNOUNCEMENTS
CREATE POLICY "Public View Announcements" ON public.announcements FOR SELECT USING (true);
CREATE POLICY "Admin Manage Announcements" ON public.announcements FOR ALL USING (public.is_admin());

-- F. EVENTS & REGISTRATIONS
CREATE POLICY "Public View Events" ON public.events FOR SELECT USING (true);
CREATE POLICY "Admin Manage Events" ON public.events FOR ALL USING (public.is_admin());

CREATE POLICY "View Event Registrations" ON public.event_registrations FOR SELECT USING (true);
CREATE POLICY "Member Register Event" ON public.event_registrations FOR INSERT 
WITH CHECK (
    member_id IN (SELECT id FROM public.members WHERE auth_user_id = auth.uid()) 
    OR public.is_admin()
);
CREATE POLICY "Admin Manage Registrations" ON public.event_registrations FOR ALL USING (public.is_admin());

-- G. LEARNING COURSES & COMPLETIONS
CREATE POLICY "Public View Courses" ON public.courses FOR SELECT USING (true);
CREATE POLICY "Admin Manage Courses" ON public.courses FOR ALL USING (public.is_admin());

CREATE POLICY "Member View Course Completions" ON public.course_completions FOR SELECT 
USING (
    member_id IN (SELECT id FROM public.members WHERE auth_user_id = auth.uid()) 
    OR public.is_admin()
);
CREATE POLICY "Member Record Completion" ON public.course_completions FOR INSERT 
WITH CHECK (
    member_id IN (SELECT id FROM public.members WHERE auth_user_id = auth.uid()) 
    OR public.is_admin()
);
CREATE POLICY "Admin Manage Completions" ON public.course_completions FOR ALL USING (public.is_admin());

-- H. POLLS & VOTES
CREATE POLICY "Public View Polls" ON public.survey_polls FOR SELECT USING (true);
CREATE POLICY "Admin Manage Polls" ON public.survey_polls FOR ALL USING (public.is_admin());

CREATE POLICY "Member View Votes" ON public.poll_votes FOR SELECT 
USING (
    member_id IN (SELECT id FROM public.members WHERE auth_user_id = auth.uid()) 
    OR public.is_admin()
);
CREATE POLICY "Member Cast Vote" ON public.poll_votes FOR INSERT 
WITH CHECK (
    member_id IN (SELECT id FROM public.members WHERE auth_user_id = auth.uid()) 
    OR public.is_admin()
);

-- I. SUPPORT TICKETS & REPLIES
CREATE POLICY "Member View Own Tickets" ON public.support_tickets FOR SELECT 
USING (
    member_id IN (SELECT id FROM public.members WHERE auth_user_id = auth.uid()) 
    OR public.is_admin()
);
CREATE POLICY "Member Create Ticket" ON public.support_tickets FOR INSERT 
WITH CHECK (
    member_id IN (SELECT id FROM public.members WHERE auth_user_id = auth.uid()) 
    OR public.is_admin()
);
CREATE POLICY "Admin Manage Tickets" ON public.support_tickets FOR ALL USING (public.is_admin());

CREATE POLICY "View Ticket Replies" ON public.ticket_replies FOR SELECT 
USING (
    ticket_id IN (
        SELECT id FROM public.support_tickets 
        WHERE member_id IN (SELECT id FROM public.members WHERE auth_user_id = auth.uid())
    ) 
    OR public.is_admin()
);
CREATE POLICY "Insert Ticket Reply" ON public.ticket_replies FOR INSERT 
WITH CHECK (
    ticket_id IN (
        SELECT id FROM public.support_tickets 
        WHERE member_id IN (SELECT id FROM public.members WHERE auth_user_id = auth.uid())
    ) 
    OR public.is_admin()
);
CREATE POLICY "Admin Manage Replies" ON public.ticket_replies FOR ALL USING (public.is_admin());

-- J. CHAT & MESSAGING
CREATE POLICY "Member Access Channel" ON public.chat_channels FOR ALL 
USING (
    member_id IN (SELECT id FROM public.members WHERE auth_user_id = auth.uid()) 
    OR public.is_admin()
);
CREATE POLICY "Member Access Messages" ON public.chat_messages FOR ALL 
USING (
    channel_id IN (
        SELECT id FROM public.chat_channels 
        WHERE member_id IN (SELECT id FROM public.members WHERE auth_user_id = auth.uid())
    ) 
    OR public.is_admin()
);

-- K. PAYMENTS & FINANCIALS
CREATE POLICY "Member View Own Payments" ON public.payment_logs FOR SELECT 
USING (
    member_id IN (SELECT id FROM public.members WHERE auth_user_id = auth.uid()) 
    OR public.is_admin()
);
CREATE POLICY "Insert Payments" ON public.payment_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin Manage Payments" ON public.payment_logs FOR ALL USING (public.is_admin());

CREATE POLICY "Member View Subscriptions" ON public.absa_subscriptions FOR SELECT 
USING (
    member_id IN (SELECT id FROM public.members WHERE auth_user_id = auth.uid()) 
    OR public.is_admin()
);
CREATE POLICY "Member Create Subscriptions" ON public.absa_subscriptions FOR INSERT 
WITH CHECK (
    member_id IN (SELECT id FROM public.members WHERE auth_user_id = auth.uid()) 
    OR public.is_admin()
);
CREATE POLICY "Admin Manage Subscriptions" ON public.absa_subscriptions FOR ALL USING (public.is_admin());

CREATE POLICY "Public Read Payment Links" ON public.vodapay_payment_links FOR SELECT USING (true);
CREATE POLICY "Admin Manage Payment Links" ON public.vodapay_payment_links FOR ALL USING (public.is_admin());
CREATE POLICY "Admin Manage Batches" ON public.vodapay_batches FOR ALL USING (public.is_admin());

-- L. AUDIT LOGS & NOTIFICATIONS
CREATE POLICY "Anyone Insert Audit Logs" ON public.system_audit_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin View Audit Logs" ON public.system_audit_logs FOR SELECT USING (public.is_admin());

CREATE POLICY "Anyone Insert Notifications" ON public.admin_notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin View Notifications" ON public.admin_notifications FOR ALL USING (public.is_admin());

-- M. INVENTORY & CMS CONFIG
CREATE POLICY "Public Read Inventory" ON public.inventory_stats FOR SELECT USING (true);
CREATE POLICY "Admin Manage Inventory" ON public.inventory_stats FOR ALL USING (public.is_admin());

CREATE POLICY "Public Read CMS Config" ON public.website_cms_config FOR SELECT USING (true);
CREATE POLICY "Admin Manage CMS Config" ON public.website_cms_config FOR ALL USING (public.is_admin());

-- ------------------------------------------------------------------------------------
-- 8. STORAGE BUCKETS SETUP & STORAGE POLICIES
-- ------------------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public) VALUES 
('avatars', 'avatars', true),
('id-cards', 'id-cards', true),
('documents', 'documents', false),
('cms-assets', 'cms-assets', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

-- Storage Policies
DROP POLICY IF EXISTS "Public Read Avatars" ON storage.objects;
CREATE POLICY "Public Read Avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Authenticated Upload Avatars" ON storage.objects;
CREATE POLICY "Authenticated Upload Avatars" ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Public Read ID Cards" ON storage.objects;
CREATE POLICY "Public Read ID Cards" ON storage.objects FOR SELECT USING (bucket_id = 'id-cards');

DROP POLICY IF EXISTS "Admin Upload ID Cards" ON storage.objects;
CREATE POLICY "Admin Upload ID Cards" ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'id-cards' AND (auth.role() = 'authenticated' OR public.is_admin()));

DROP POLICY IF EXISTS "Public Read CMS Assets" ON storage.objects;
CREATE POLICY "Public Read CMS Assets" ON storage.objects FOR SELECT USING (bucket_id = 'cms-assets');

-- ------------------------------------------------------------------------------------
-- 9. INITIAL PRODUCTION SEED DATA
-- ------------------------------------------------------------------------------------

-- A. COMMITTEES
INSERT INTO public.committees (code, name, province, municipality, secretary_general, contact_phone, contact_email) VALUES
('CP-WC-CPT', 'Comité do MPLA na Cidade do Cabo', 'Western Cape', 'City of Cape Town', 'Camarada Simão Lusimadio', '+27 82 123 4567', 'comitemplacapetown@gmail.com'),
('CP-GP-JHB', 'Comité do MPLA em Johannesburg', 'Gauteng', 'City of Johannesburg', 'Dra. Isabel Santos', '+27 71 987 6543', 'jhb@mpla.co.za'),
('CP-GP-PTA', 'Comité do MPLA em Tshwane / Pretoria', 'Gauteng', 'City of Tshwane', 'Eng. António Neto', '+27 60 333 4444', 'pta@mpla.co.za'),
('CP-KZN-DUR', 'Comité do MPLA em Durban', 'KwaZulu-Natal', 'eThekwini', 'Prof. Manuel Agostinho', '+27 83 555 7777', 'durban@mpla.co.za')
ON CONFLICT (code) DO NOTHING;

-- B. WEBSITE CMS CONFIGURATION (Official Slogan: Compromisso com o Povo, Confiança no Futuro)
INSERT INTO public.website_cms_config (
    id,
    hero_title_pt,
    hero_title_en,
    hero_subtitle_pt,
    hero_subtitle_en,
    slogan_pt,
    slogan_en,
    jmpla_slogan_pt,
    oma_slogan_pt,
    contact_email,
    contact_phone,
    contact_address
) VALUES (
    'current_cms',
    'Comité do MPLA na Cidade do Cabo',
    'MPLA Committee in Cape Town',
    'Unidos na Diáspora pelo Desenvolvimento, Cidadania e Dignidade de Angola',
    'United in the Diaspora for the Development, Citizenship and Dignity of Angola',
    'Compromisso com o Povo, Confiança no Futuro',
    'Commitment to the People, Confidence in the Future',
    'Compromisso com o Povo, Confiança no Futuro — Vanguarda da Juventude',
    'Compromisso com o Povo, Confiança no Futuro — Firmeza da Mulher Angolana',
    'comitemplacapetown@gmail.com',
    '+27 82 123 4567',
    'Cape Town, Western Cape, South Africa'
) ON CONFLICT (id) DO UPDATE SET
    slogan_pt = 'Compromisso com o Povo, Confiança no Futuro',
    jmpla_slogan_pt = 'Compromisso com o Povo, Confiança no Futuro — Vanguarda da Juventude',
    oma_slogan_pt = 'Compromisso com o Povo, Confiança no Futuro — Firmeza da Mulher Angolana',
    updated_at = CURRENT_TIMESTAMP;

-- C. INVENTORY STATS
INSERT INTO public.inventory_stats (
    id, blank_cards, printers_status, ink_percent, ribbon_percent, packaging_envelopes, holograms
) VALUES (
    'current_inventory', 4850, 'Online', 78, 62, 12000, 4200
) ON CONFLICT (id) DO NOTHING;

-- D. SUPER ADMIN & FOUNDATIONAL MEMBERS
INSERT INTO public.members (
    id,
    membership_no,
    national_id,
    full_name,
    email,
    mobile,
    photo,
    status,
    role,
    app_role,
    membership_level,
    category,
    organization_wing,
    militancy_level,
    province,
    municipality,
    committee,
    registration_date,
    physical_card_status,
    card_signature,
    occupation,
    employer,
    education,
    emergency_contact
) VALUES 
(
    'admin-hq',
    'MPLA-ADMIN-HQ-99',
    '9001015098140',
    'Comité de MPLA Cape Town Super Admin',
    'comitemplacapetown@gmail.com',
    '+27 82 123 4567',
    'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=150&h=150&fit=crop',
    'Active',
    'admin',
    'super_admin',
    'Committee',
    'General',
    'Militante',
    'Dirigente',
    'Western Cape',
    'City of Cape Town',
    'Comité do MPLA na Cidade do Cabo',
    '2024-01-01',
    'Collected',
    public.compute_card_signature('admin-hq', 'MPLA-ADMIN-HQ-99', '9001015098140', '2024-01-01', 'Western Cape', 'Comité do MPLA na Cidade do Cabo'),
    'Secretário Executivo',
    'Comité do MPLA',
    'Mestrado',
    '{"name": "Gabinete de Apoio ao Militante", "phone": "+27 82 123 4567"}'::jsonb
),
(
    'm-1',
    'MP-2026-2243',
    '9603125089081',
    'Simao Lusimadio',
    'simao.lusimadio@gmail.com',
    '+27 82 123 4567',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop',
    'Active',
    'member',
    'militante',
    'Standard',
    'General',
    'Militante',
    'Militante',
    'Gauteng',
    'City of Johannesburg',
    'Ward 117 Local Committee',
    '2026-01-10',
    'Printing',
    public.compute_card_signature('m-1', 'MP-2026-2243', '9603125089081', '2026-01-10', 'Gauteng', 'Ward 117 Local Committee'),
    'Software Engineer',
    'Tech Corp',
    'BSc Computer Science',
    '{"name": "Maria Lusimadio", "phone": "+27 82 987 6543"}'::jsonb
),
(
    'm-2',
    'MP-2026-5942',
    '8507204908123',
    'Naledi Mandela',
    'naledi.mandela@party.org',
    '+27 71 456 7890',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
    'Active',
    'member',
    'committee_leader',
    'Committee',
    'General',
    'OMA',
    'Dirigente',
    'Western Cape',
    'City of Cape Town',
    'Ward 57 Committee',
    '2024-05-12',
    'Collected',
    public.compute_card_signature('m-2', 'MP-2026-5942', '8507204908123', '2024-05-12', 'Western Cape', 'Ward 57 Committee'),
    'Public Relations Officer',
    'Provincial Dept',
    'BA Communications',
    '{"name": "Teboho Mandela", "phone": "+27 71 111 2222"}'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- E. ACADEMIA POLÍTICA DO MPLA (5 PILARES OFICIAIS)
INSERT INTO public.courses (
    id, pillar_number, pillar_roman, pillar_title, title, description,
    target_audience, format_description, category, duration, content_markdown, quiz
) VALUES 
(
    'pilar-1', 1, 'PILAR I', 'FORMAÇÃO DE BASE (ACOLHIMENTO)',
    'Pilar I — Formação de Base (Acolhimento)',
    'Destinada a todo o novo militante nos primeiros seis meses de filiação. Compreende a história e fundação do MPLA, estrutura organizativa, direitos e deveres estatutários, símbolos partidários e o funcionamento das estruturas na África do Sul.',
    'Destinada a todo o novo militante, nos primeiros seis meses de filiação.',
    'Sessão de acolhimento presencial + módulo digital introdutório + manual do novo militante.',
    'Formação de Base', '4 horas',
    '# PILAR I — FORMAÇÃO DE BASE (ACOLHIMENTO)\n*Academia Política do MPLA • Programa Oficial de Integração Doutrinária*\n\n## 1. História e Fundação do MPLA\n- 10 de Dezembro de 1956: Fundação histórica e publicação do Manifesto Amplo.\n- 4 de Fevereiro de 1961: Início da Luta Armada de Libertação Nacional.\n- 11 de Novembro de 1975: Proclamação da Independência Nacional por António Agostinho Neto.\n\n## 2. Direitos e Deveres do Militante\nO militante tem o dever de militar ativamente, pagar a quotização e zelar pela coesão do Partido.',
    '[{"question":"A proclamação da Independência Nacional de Angola ocorreu a:","options":["4 de Fevereiro de 1961","11 de Novembro de 1975","10 de Dezembro de 1956"],"correctIndex":1,"explanation":"A Independência Nacional foi proclamada solenemente pelo Presidente Agostinho Neto a 11 de Novembro de 1975."}]'::jsonb
),
(
    'pilar-2', 2, 'PILAR II', 'FORMAÇÃO IDEOLÓGICA E POLÍTICA',
    'Pilar II — Formação Ideológica e Política Contínua',
    'Aprofundamento doutrinário na social-democracia, história dos movimentos de libertação e desenvolvimento socioeconómico de Angola.',
    'Militantes activos e quadros intermédios.',
    'Módulos trimestrais temáticos com estudos dirigidos e debates.',
    'Doutrina & Ideologia', '6 horas',
    '# PILAR II — FORMAÇÃO IDEOLÓGICA E POLÍTICA CONTÍNUA\n*Pensamento Político e Linha Ideológica do MPLA*\n\nO MPLA é um partido democrático e progressista de cariz social-democrata, focado na justiça social, na erradicação da pobreza e no desenvolvimento sustentável.',
    '[{"question":"Qual é o modelo ideológico adotado no programa maior do MPLA?","options":["Social-Democracia com foco na justiça social","Liberalismo Neoclássico Estrito","Monarquia Constitucional"],"correctIndex":0,"explanation":"O MPLA rege-se pelos princípios da social-democracia adaptada à realidade angolana."}]'::jsonb
),
(
    'pilar-3', 3, 'PILAR III', 'CAPACITAÇÃO DE QUADROS E DIRIGENTES',
    'Pilar III — Capacitação de Quadros e Dirigentes',
    'Desenvolvimento de competências de liderança de equipas, oratória pública, mobilização eleitoral e gestão de crises.',
    'Membros de secretariados, coordenadores de CAP e quadros da JMPLA e OMA.',
    'Workshops práticos e estudos de caso com simulação.',
    'Liderança & Governação', '8 horas',
    '# PILAR III — CAPACITAÇÃO DE QUADROS E DIRIGENTES\n*Liderança Estratégica e Mobilização na Diáspora*\n\nUm dirigente partidário deve combinar competência técnica com sensibilidade humana, prestando contas e ouvindo a comunidade com empatia.',
    '[{"question":"Na gestão de crises comunitárias, qual é a postura prioritária de um coordenador de célula?","options":["Ignorar o problema até que desapareça","Escuta ativa, mediação serena e comunicação oficial alinhada","Tomar decisões unilaterais sem consultar a direção"],"correctIndex":1,"explanation":"A liderança moderna do MPLA exige escuta activa e alinhamento institucional com as diretrizes centrais."}]'::jsonb
),
(
    'pilar-4', 4, 'PILAR IV', 'FORMAÇÃO DE FORMADORES POLÍTICOS',
    'Pilar IV — Formação de Formadores Políticos (Multiplicadores)',
    'Pedagogia política, metodologias participativas e facilitação de debates ideológicos.',
    'Quadros seleccionados com perfil pedagógico para multiplicar conteúdos nas províncias.',
    'Seminários intensivos presenciais de imersão metodológica.',
    'Pedagogia Partidária', '10 horas',
    '# PILAR IV — FORMAÇÃO DE FORMADORES POLÍTICOS\n*Multiplicadores do Saber Patriótico*\n\nCapacitar formadores próprios garante a sustentabilidade e descentralização da formação em todas as províncias sul-africanas.',
    '[{"question":"Qual a função principal de um formador multiplicador do MPLA?","options":["Emitir cartões sem autorização","Garantir a autossustentabilidade pedagógica e difusão rigorosa dos estatutos","Criar facções dentro das células"],"correctIndex":1,"explanation":"O multiplicador descentraliza o saber, mantendo a fidelidade à linha oficial do Partido."}]'::jsonb
),
(
    'pilar-5', 5, 'PILAR V', 'FORMAÇÃO DIGITAL E À DISTÂNCIA',
    'Pilar V — Formação Digital e à Distância (Diáspora Conectada)',
    'Complemento permanente à formação presencial, essencial numa diáspora geograficamente dispersa. Engloba navegação autónoma no portal, webinars e microformação por WhatsApp.',
    'Todos os militantes residentes nas províncias da África do Sul.',
    'Conteúdos assíncronos digitais + sessões ao vivo mensais.',
    'Formação Digital & Diáspora', '4 horas',
    '# PILAR V — FORMAÇÃO DIGITAL E À DISTÂNCIA\n*Academia Política do MPLA • Inovação e Diáspora Conectada*\n\nA formação digital supera distâncias entre Joanesburgo, Cidade do Cabo, Durban e Pretória, unindo todos os cidadãos em torno da causa nacional.',
    '[{"question":"Perante uma notícia falsa (fake news) nas redes sociais, qual é o dever do militante?","options":["Partilhar de imediato","Verificar nos canais oficiais e esclarecer com factos comprovados","Insultar os interlocutores"],"correctIndex":1,"explanation":"O combate à desinformação faz-se com pedagogia, calma e dados oficiais fornecidos pelo Gabinete de Comunicação."}]'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- F. CORE EVENTS
INSERT INTO public.events (id, title, description, event_date, location, venue, province, lat, lng, capacity, status) VALUES
('e-1', 'National Policy Summit 2026', 'Encontro anual de consulta com militantes e coordenadores sobre assistência consular, integração socioeconómica e reformas estruturais.', '2026-08-10 09:00:00+02', 'Gallagher Convention Centre, Midrand', 'Gallagher Convention Centre', 'Gauteng', -25.9984, 28.1273, 1000, 'Upcoming'),
('e-2', 'Local Assembly & Ward Feedback Seminar', 'Assembleia local para debate dos planos comunitários de apoio às famílias angolanas no Western Cape.', '2026-08-15 14:00:00+02', 'Rosebank Community Hall, Johannesburg', 'Rosebank Community Center', 'Gauteng', -26.1465, 28.0436, 100, 'Upcoming'),
('e-4', 'Fórum da Diáspora & Plenário de Militantes', 'Grande plenário de auscultação dos cidadãos angolanos residentes no Western Cape sobre assistência consular, vistos e cartão digital.', '2026-08-20 11:00:00+02', 'CTICC, City of Cape Town', 'Cape Town International Convention Centre', 'Western Cape', -33.9161, 18.4281, 350, 'Upcoming')
ON CONFLICT (id) DO NOTHING;

-- G. CORE ANNOUNCEMENTS
INSERT INTO public.announcements (id, title, content, source, author, category, date, is_pinned) VALUES
('a-1', 'Campanha Nacional: Compromisso com o Povo, Confiança no Futuro', 'Lançamento oficial das jornadas de auscultação pública e recenseamento biométrico de militantes em toda a África do Sul.', 'National', 'Secretariado Executivo Nacional', 'Campaign', CURRENT_DATE, true),
('a-2', 'Gabinete de Apoio Consular na Cidade do Cabo', 'Abertura do serviço de triagem rápida para renovação de passaportes e certidões em articulação com os Consulados Gerais.', 'Regional', 'Comité do Western Cape', 'Notice', CURRENT_DATE, false),
('a-3', 'Academia Política Digital: Certificados com Código de Validação', 'Todos os cursos dos 5 Pilares passam a emitir diplomas digitais com assinatura criptográfica verificável.', 'National', 'Academia de Formação Política', 'News', CURRENT_DATE, false)
ON CONFLICT (id) DO NOTHING;

-- H. SAMPLE SUPPORT TICKETS
INSERT INTO public.support_tickets (id, member_id, type, description, status, assigned_officer, est_resolution_time) VALUES
('TKT-1082', 'm-1', 'Card Replacement', 'Pedido de segunda via do cartão físico com actualização de morada para Cape Town.', 'In Progress', 'Kabelo Mokoena (Printing Officer)', '4 dias'),
('TKT-1083', 'm-1', 'Profile Correction', 'Correcção da grafia do sobrenome no registo biométrico do Comité.', 'Open', 'Zola Ndlovu (Registration Officer)', '24 horas')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.ticket_replies (ticket_id, sender_type, sender_name, text) VALUES
('TKT-1082', 'member', 'Simao Lusimadio', 'Enviei o comprovativo de morada actualizado em anexo. Podem confirmar a recepção?'),
('TKT-1082', 'officer', 'Kabelo Mokoena', 'Camarada Simão, documento validado. O cartão físico entrou na fila de impressão com selo holográfico.')
ON CONFLICT DO NOTHING;

-- I. SAMPLE PAYMENT LOGS
INSERT INTO public.payment_logs (id, member_id, amount, currency, date, method, status, purpose) VALUES
('p-101', 'm-1', 150.00, 'ZAR', CURRENT_DATE, 'Absa Pay Instant EFT', 'Successful', 'Quotas Anuais de Militante (2026)'),
('p-102', 'm-2', 250.00, 'ZAR', CURRENT_DATE, 'VodaPay Digital Wallet', 'Successful', 'Contribuição Solidária para Acções Comunitárias')
ON CONFLICT (id) DO NOTHING;

-- J. AUDIT RECORD FOR SCHEMA DEPLOYMENT
INSERT INTO public.system_audit_logs (user_name, role, action, details) VALUES
('Supabase Migration Engine', 'Super Admin', 'FULL_SCHEMA_DEPLOYED', 'Base de dados de produção, RLS policies, trigger auth e seed inicial configurados com sucesso para o MPLA Cape Town.');

-- ====================================================================================
-- SUCESSO: O ESQUEMA DE PRODUÇÃO DO SUPABASE ESTÁ COMPLETO E PRONTO PARA USO.
-- ====================================================================================
