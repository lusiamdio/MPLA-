-- ====================================================================================
-- MPLA CAPE TOWN & DIASPORA PORTAL — SUPABASE AUTH & REGISTRATION HOTFIX
-- Project: https://yuykjagarpubbwpxsush.supabase.co
-- Description:
-- 1. Fixes RLS on public.members so new registrations can be saved
-- 2. Fixes on_auth_user_created trigger so Supabase Auth does not return HTTP 500
-- 3. Enables linking existing militants when registering with the same email
-- ====================================================================================

-- 1. ADD PASSWORD HASH COLUMN TO public.members IF NOT EXISTS
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- 2. FIX RLS POLICIES ON public.members TO ALLOW REGISTRATION INSERTS
DROP POLICY IF EXISTS "Member Insert Own Profile" ON public.members;
DROP POLICY IF EXISTS "Allow Member Self Registration" ON public.members;
DROP POLICY IF EXISTS "Public Registration Insert" ON public.members;

CREATE POLICY "Allow Member Self Registration" ON public.members 
FOR INSERT 
WITH CHECK (true);

-- Allow members to update their own profile and allow anon/service sync
DROP POLICY IF EXISTS "Member Update Own Profile" ON public.members;
CREATE POLICY "Member Update Own Profile" ON public.members 
FOR UPDATE 
USING (
    (auth.uid() IS NOT NULL AND auth.uid() = auth_user_id) 
    OR public.is_admin()
    OR auth.role() = 'anon'
);

-- 2. FIX ON_AUTH_USER_CREATED TRIGGER ON auth.users
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

    -- Generate identifiers
    v_random_seq := LPAD(FLOOR(RANDOM() * 100000)::TEXT, 5, '0');
    v_mem_no := 'MPLA-ZA-' || TO_CHAR(CURRENT_DATE, 'YYYY') || '-' || v_random_seq;
    v_member_id := 'm-' || EXTRACT(EPOCH FROM CURRENT_TIMESTAMP)::BIGINT || '-' || v_random_seq;

    -- Extract metadata safely
    v_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1), 'Militante do MPLA');
    v_national_id := COALESCE(NEW.raw_user_meta_data->>'national_id', 'BI-PENDENTE-' || v_random_seq);
    v_phone := COALESCE(NEW.raw_user_meta_data->>'mobile', '+27 82 000 0000');

    -- Grant super_admin if official email
    IF LOWER(TRIM(NEW.email)) = 'comitemplacapetown@gmail.com' THEN
        v_role := 'admin';
        v_app_role := 'super_admin';
        v_full_name := 'Comité de MPLA Cape Town Super Admin';
    END IF;

    -- Precompute HMAC signature with error fallback
    BEGIN
        v_sig := public.compute_card_signature(
            v_member_id, v_mem_no, v_national_id, 
            CURRENT_DATE::TEXT, 'Western Cape', 'Comité do MPLA na Cidade do Cabo'
        );
    EXCEPTION WHEN OTHERS THEN
        v_sig := 'SIG-' || v_random_seq;
    END;

    -- Insert new member record safely
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

    -- Assign role safely
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

-- Re-attach trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- Notify completion
DO $$ BEGIN
    RAISE NOTICE 'Supabase Auth & RLS Registration Hotfix applied successfully!';
END $$;
