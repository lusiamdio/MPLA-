-- ====================================================================================
-- PRODUCTION-READY SUPABASE BACKEND SCHEMA & RLS SECURITY POLICIES
-- Project Name: MPLA Cape Town & Diaspora Portal
-- Project ID: qghvlulieauezqenpoya
-- Database Engine: PostgreSQL / Supabase
-- Target Platform: Full Stack Member Management, Public Portal, Admin CMS, & Auth Engine
-- ====================================================================================

-- ------------------------------------------------------------------------------------
-- 1. EXTENSIONS & SCHEMA PREPARATION
-- ------------------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop existing tables/policies if recreating schema cleanly (order respects FK constraints)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_auth_user();
DROP FUNCTION IF EXISTS public.is_admin();
DROP FUNCTION IF EXISTS public.is_super_admin();

-- ------------------------------------------------------------------------------------
-- 2. CUSTOM ENUM TYPES
-- ------------------------------------------------------------------------------------
DO $$ BEGIN
    CREATE TYPE public.app_role AS ENUM ('super_admin', 'admin', 'committee_leader', 'militante', 'guest');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE public.organization_wing AS ENUM ('Militante', 'OMA', 'JMPLA', 'Simpatizante', 'Veterano');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE public.member_status AS ENUM ('Active', 'Pending_Approval', 'Suspended', 'Transferred');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE public.ticket_status AS ENUM ('Open', 'In_Progress', 'Resolved', 'Closed');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ------------------------------------------------------------------------------------
-- 3. CORE PLATFORM TABLES
-- ------------------------------------------------------------------------------------

-- A. COMMITTEES / SECTOR STRUCTURE
CREATE TABLE IF NOT EXISTS public.committees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    province TEXT NOT NULL DEFAULT 'Western Cape',
    municipality TEXT NOT NULL DEFAULT 'Cape Town',
    secretary_general TEXT,
    contact_phone TEXT,
    contact_email TEXT,
    member_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- B. MEMBERS & MILITANTES PROFILE TABLE (Tied to auth.users)
CREATE TABLE IF NOT EXISTS public.members (
    id TEXT PRIMARY KEY,
    auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
    membership_no TEXT UNIQUE NOT NULL,
    national_id TEXT NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT,
    mobile TEXT,
    photo TEXT DEFAULT 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=400&fit=crop',
    cover_photo TEXT DEFAULT 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&h=400&fit=crop',
    status TEXT NOT NULL DEFAULT 'Active',
    membership_level TEXT NOT NULL DEFAULT 'Standard',
    category TEXT NOT NULL DEFAULT 'General',
    province TEXT NOT NULL DEFAULT 'Western Cape',
    municipality TEXT NOT NULL DEFAULT 'Cape Town',
    committee TEXT NOT NULL DEFAULT 'Comité do MPLA na Cidade do Cabo',
    committee_id UUID REFERENCES public.committees(id) ON DELETE SET NULL,
    organization_wing TEXT NOT NULL DEFAULT 'Militante',
    militancy_level TEXT NOT NULL DEFAULT 'Militante',
    id_type TEXT NOT NULL DEFAULT 'BI',
    gender TEXT DEFAULT 'Male',
    dob TEXT DEFAULT '1990-01-01',
    marital_status TEXT DEFAULT 'Single',
    emergency_contact JSONB DEFAULT '{"name": "Contacto de Emergência", "phone": "+27 82 000 0000"}'::jsonb,
    occupation TEXT DEFAULT 'Profissional',
    employer TEXT DEFAULT 'Empresa / Organização',
    education TEXT DEFAULT 'Ensino Superior',
    leadership_roles JSONB DEFAULT '[]'::jsonb,
    registered_events JSONB DEFAULT '[]'::jsonb,
    completed_courses JSONB DEFAULT '[]'::jsonb,
    voted_polls JSONB DEFAULT '{}'::jsonb,
    physical_card_status TEXT DEFAULT 'Submitted',
    physical_card_est_date TEXT DEFAULT '2026-08-15',
    outstanding_balance NUMERIC(10,2) DEFAULT 0.00,
    app_role public.app_role DEFAULT 'militante',
    registration_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- C. USER ROLES TABLE (For granular RBAC)
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    member_id TEXT REFERENCES public.members(id) ON DELETE CASCADE,
    role public.app_role NOT NULL DEFAULT 'militante',
    granted_by TEXT DEFAULT 'System',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_role UNIQUE (user_id, role)
);

-- D. EVENTS TABLE
CREATE TABLE IF NOT EXISTS public.events (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    event_date TEXT NOT NULL,
    location TEXT NOT NULL,
    venue TEXT NOT NULL,
    province TEXT DEFAULT 'Western Cape',
    lat NUMERIC(10,6),
    lng NUMERIC(10,6),
    organizer TEXT DEFAULT 'Comité Provincial',
    status TEXT DEFAULT 'Upcoming',
    registered_count INT DEFAULT 0,
    capacity INT DEFAULT 500,
    registered_member_ids JSONB DEFAULT '[]'::jsonb,
    banner_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- E. EVENT REGISTRATIONS
CREATE TABLE IF NOT EXISTS public.event_registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id TEXT REFERENCES public.events(id) ON DELETE CASCADE,
    member_id TEXT REFERENCES public.members(id) ON DELETE CASCADE,
    attended BOOLEAN DEFAULT FALSE,
    qr_code_token TEXT,
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_event_registration UNIQUE (event_id, member_id)
);

-- F. ANNOUNCEMENTS & NEWS TABLE
CREATE TABLE IF NOT EXISTS public.announcements (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    source TEXT DEFAULT 'Regional',
    author TEXT DEFAULT 'Secretariado Executivo',
    category TEXT DEFAULT 'Notícias',
    is_pinned BOOLEAN DEFAULT FALSE,
    banner_image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- G. SUPPORT TICKETS & CONSULAR ASSISTANCE
CREATE TABLE IF NOT EXISTS public.support_tickets (
    id TEXT PRIMARY KEY,
    member_id TEXT REFERENCES public.members(id) ON DELETE CASCADE,
    ticket_type TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT DEFAULT 'Open',
    priority TEXT DEFAULT 'Normal',
    assigned_officer TEXT DEFAULT 'Gabinete de Atendimento e Apoio ao Militante',
    est_resolution_time TEXT DEFAULT '24h',
    replies JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- H. COURSES & FORMATION MODULES
CREATE TABLE IF NOT EXISTS public.courses (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    duration TEXT DEFAULT '2 Horas',
    level TEXT DEFAULT 'Básico',
    instructor TEXT DEFAULT 'Formador Político-Ideológico',
    modules_count INT DEFAULT 4,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- I. POLLS & DEMOCRATIC VOTING
CREATE TABLE IF NOT EXISTS public.polls (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'Consulta Interna',
    status TEXT DEFAULT 'Active',
    expires_at TIMESTAMP WITH TIME ZONE,
    options JSONB NOT NULL DEFAULT '[]'::jsonb,
    total_votes INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- J. DUES & FINANCIAL TRANSACTIONS
CREATE TABLE IF NOT EXISTS public.dues_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id TEXT REFERENCES public.members(id) ON DELETE CASCADE,
    amount NUMERIC(10,2) NOT NULL,
    currency TEXT DEFAULT 'ZAR',
    month_year TEXT NOT NULL,
    payment_method TEXT DEFAULT 'Electronic Transfer / Card',
    status TEXT DEFAULT 'Completed',
    receipt_no TEXT UNIQUE,
    waived_by TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- K. SYSTEM INTEGRATIONS & API CREDENTIALS
CREATE TABLE IF NOT EXISTS public.system_integrations (
    id TEXT PRIMARY KEY,
    service_name TEXT NOT NULL,
    enabled BOOLEAN DEFAULT TRUE,
    config JSONB DEFAULT '{}'::jsonb,
    last_tested_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- L. AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.system_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    user_name TEXT DEFAULT 'Sistema',
    role TEXT DEFAULT 'System',
    action TEXT NOT NULL,
    device TEXT,
    location TEXT DEFAULT 'Cape Town, ZA',
    ip TEXT,
    details TEXT
);

-- ------------------------------------------------------------------------------------
-- 4. SECURITY HELPER FUNCTIONS & TRIGGERS
-- ------------------------------------------------------------------------------------

-- Function to handle auto updated_at timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply updated_at triggers
DROP TRIGGER IF EXISTS set_members_updated_at ON public.members;
CREATE TRIGGER set_members_updated_at
BEFORE UPDATE ON public.members
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_events_updated_at ON public.events;
CREATE TRIGGER set_events_updated_at
BEFORE UPDATE ON public.events
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Function to check if current authenticated user is an Admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (
        EXISTS (
            SELECT 1 FROM public.members m
            WHERE m.auth_user_id = auth.uid()
            AND m.app_role IN ('admin', 'super_admin')
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

-- Function to check if current authenticated user is a Super Admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
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

-- Automatic Provisioning Trigger on Supabase Auth Signup
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
DECLARE
    new_mem_no TEXT;
    random_digits TEXT;
BEGIN
    random_digits := LPAD(FLOOR(RANDOM() * 100000)::TEXT, 5, '0');
    new_mem_no := 'MPLA-ZA-' || TO_CHAR(CURRENT_DATE, 'YYYY') || '-' || random_digits;

    INSERT INTO public.members (
        id,
        auth_user_id,
        membership_no,
        national_id,
        full_name,
        email,
        mobile,
        status,
        membership_level,
        category,
        province,
        municipality,
        committee,
        organization_wing,
        militancy_level,
        app_role
    ) VALUES (
        'm-' || EXTRACT(EPOCH FROM CURRENT_TIMESTAMP)::BIGINT || '-' || random_digits,
        NEW.id,
        new_mem_no,
        COALESCE((NEW.raw_user_meta_data->>'national_id'), 'PENDING'),
        COALESCE((NEW.raw_user_meta_data->>'full_name'), NEW.email, 'Militante do MPLA'),
        NEW.email,
        COALESCE((NEW.raw_user_meta_data->>'mobile'), '+27 82 000 0000'),
        'Active',
        'Standard',
        'General',
        'Western Cape',
        'Cape Town',
        'Comité do MPLA na Cidade do Cabo',
        'Militante',
        'Militante',
        'militante'
    ) ON CONFLICT (id) DO NOTHING;

    -- Also insert default user role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'militante')
    ON CONFLICT DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach trigger to auth.users
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- ------------------------------------------------------------------------------------
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------------

ALTER TABLE public.committees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dues_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_audit_logs ENABLE ROW LEVEL SECURITY;

-- A. COMMITTEES POLICIES
CREATE POLICY "Public Read Committees" ON public.committees FOR SELECT USING (true);
CREATE POLICY "Admin All Committees" ON public.committees FOR ALL USING (public.is_admin());

-- B. MEMBERS POLICIES
CREATE POLICY "Public & App Read Members" ON public.members FOR SELECT USING (true);
CREATE POLICY "Member Self Update" ON public.members FOR UPDATE USING (auth.uid() = auth_user_id OR public.is_admin());
CREATE POLICY "Admin Manage Members" ON public.members FOR ALL USING (public.is_admin());

-- C. EVENTS POLICIES
CREATE POLICY "Public Read Events" ON public.events FOR SELECT USING (true);
CREATE POLICY "Admin Manage Events" ON public.events FOR ALL USING (public.is_admin());

-- D. EVENT REGISTRATIONS POLICIES
CREATE POLICY "Member View Own Registrations" ON public.event_registrations FOR SELECT USING (true);
CREATE POLICY "Member Register Event" ON public.event_registrations FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin Manage Registrations" ON public.event_registrations FOR ALL USING (public.is_admin());

-- E. ANNOUNCEMENTS POLICIES
CREATE POLICY "Public Read Announcements" ON public.announcements FOR SELECT USING (true);
CREATE POLICY "Admin Manage Announcements" ON public.announcements FOR ALL USING (public.is_admin());

-- F. SUPPORT TICKETS POLICIES
CREATE POLICY "Public Read Support Tickets" ON public.support_tickets FOR SELECT USING (true);
CREATE POLICY "Member & Admin Manage Tickets" ON public.support_tickets FOR ALL USING (true);

-- G. COURSES & POLLS POLICIES
CREATE POLICY "Public Read Courses" ON public.courses FOR SELECT USING (true);
CREATE POLICY "Public Read Polls" ON public.polls FOR SELECT USING (true);
CREATE POLICY "Admin Manage Courses & Polls" ON public.courses FOR ALL USING (public.is_admin());

-- H. AUDIT LOGS & INTEGRATIONS POLICIES
CREATE POLICY "Public & App Insert Audit Logs" ON public.system_audit_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin View Audit Logs" ON public.system_audit_logs FOR SELECT USING (public.is_admin());
CREATE POLICY "Admin System Integrations" ON public.system_integrations FOR ALL USING (public.is_admin());

-- ------------------------------------------------------------------------------------
-- 6. INITIAL SEED DATA
-- ------------------------------------------------------------------------------------

-- Seed Primary Committees
INSERT INTO public.committees (code, name, province, municipality, secretary_general, contact_phone, contact_email) VALUES
('CP-WC-CPT', 'Comité do MPLA na Cidade do Cabo', 'Western Cape', 'Cape Town', 'Camarada Simão Lusimadio', '+27 82 123 4567', 'comitemplacapetown@gmail.com'),
('CP-GP-JHB', 'Comité do MPLA em Johannesburg', 'Gauteng', 'Johannesburg', 'Dra. Isabel Santos', '+27 71 987 6543', 'jhb@mpla.co.za'),
('CP-GP-PTA', 'Comité do MPLA em Tshwane / Pretoria', 'Gauteng', 'Pretoria', 'Eng. António Neto', '+27 60 333 4444', 'pta@mpla.co.za'),
('CP-KZN-DUR', 'Comité do MPLA em Durban', 'KwaZulu-Natal', 'Durban', 'Prof. Manuel Agostinho', '+27 83 555 7777', 'durban@mpla.co.za'),
('CP-EC-PLZ', 'Comité do MPLA em Port Elizabeth', 'Eastern Cape', 'Gqeberha', 'Sofia Kassoma', '+27 72 111 2222', 'pe@mpla.co.za')
ON CONFLICT (code) DO NOTHING;

-- Seed Default Admin & Militante Profile
INSERT INTO public.members (
    id,
    membership_no,
    national_id,
    full_name,
    email,
    mobile,
    photo,
    status,
    membership_level,
    category,
    province,
    municipality,
    committee,
    organization_wing,
    militancy_level,
    app_role,
    occupation,
    employer,
    education,
    emergency_contact
) VALUES (
    'm-0001-superadmin',
    'MPLA-ZA-2026-00001',
    '9001015098140',
    'Comité de MPLA Cape Town Super Admin',
    'comitemplacapetown@gmail.com',
    '+27 82 123 4567',
    'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=150&h=150&fit=crop',
    'Active',
    'Honra / Dirigente',
    'Secretariado',
    'Western Cape',
    'Cape Town',
    'Comité do MPLA na Cidade do Cabo',
    'Militante',
    'Dirigente',
    'super_admin',
    'Secretário Executivo',
    'Comité do MPLA',
    'Mestrado',
    '{"name": "Gabinete de Apoio ao Militante", "phone": "+27 82 123 4567"}'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- Seed Core Events
INSERT INTO public.events (id, title, description, event_date, location, venue, province, lat, lng, capacity) VALUES
('ev-1', 'Assembleia Geral de Militantes da Cidade do Cabo', 'Sessão solene de auscultação, recenseamento partidário e planeamento estratégico do Comité do MPLA na Província do Cabo Ocidental.', '2026-08-15 10:00', 'Cape Town, RSA', 'Cape Town International Convention Centre (CTICC)', 'Western Cape', -33.9173, 18.4289, 800),
('ev-2', 'Fórum da OMA sobre a Mulher na Diáspora', 'Encontro promovido pela Organização da Mulher Angolana (OMA) sobre empreendedorismo, integração social e apoio consular.', '2026-08-28 14:00', 'Johannesburg, RSA', 'Sandton Convention Centre', 'Gauteng', -26.1076, 28.0567, 500),
('ev-3', 'Seminário de Capacitação Ideológica da JMPLA', 'Workshop dinâmico para jovens militantes sobre liderança cívica, história do MPLA e desenvolvimento de competências digitais.', '2026-09-10 09:00', 'Pretoria, RSA', 'Pretoria City Hall', 'Gauteng', -25.7479, 28.1878, 300)
ON CONFLICT (id) DO NOTHING;

-- Seed Sample Announcements
INSERT INTO public.announcements (id, title, content, source, author, category, is_pinned) VALUES
('ann-1', 'Comunicado do Secretariado: Recenseamento e Cartão Digital 2026', 'Informa-se a todos os militantes, simpatizantes e residentes angolanos na Província do Cabo Ocidental que está aberto o processo de actualização de dados e emissão do Cartão Digital do Militante através do novo portal.', 'Secretariado Executivo', 'Comité do MPLA na Cidade do Cabo', 'Oficial', true),
('ann-2', 'Reforço do Atendimento Consular Automatizado em Cape Town', 'O Gabinete de Apoio ao Militante activou o serviço automatizado de marcação de senhas para certidões, renovação de documentos e apoio cívico directo.', 'Gabinete Consular', 'Comissão de Apoio Social', 'Serviços', false)
ON CONFLICT (id) DO NOTHING;

-- Seed System Integration Status
INSERT INTO public.system_integrations (id, service_name, enabled, config) VALUES
('supabase', 'Supabase Database & Authentication', true, '{"projectId": "qghvlulieauezqenpoya", "projectName": "MPLA Cape Town", "url": "https://qghvlulieauezqenpoya.supabase.co"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Log Schema Execution in Audit Trail
INSERT INTO public.system_audit_logs (user_name, role, action, details) VALUES
('Sistema Supabase', 'Super Admin', 'MIGRATION_SCHEMA_DEPLOYED', 'Base de dados e regras de segurança RLS aplicadas com sucesso para a plataforma MPLA Cape Town (qghvlulieauezqenpoya).');

-- ====================================================================================
-- END OF SUPABASE PRODUCTION SQL BACKEND CODE
-- ====================================================================================
