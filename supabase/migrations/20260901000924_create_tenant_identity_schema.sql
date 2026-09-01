-- Migration: create_tenant_identity_schema
-- Lot: F1 — Identity, Tenant, Auth & RLS
-- Auteur: Claude (implémenteur F1, gouvernance modifiée par Blaise)
-- Date: 2026-09-01

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. SCHÉMA PRIVÉ pour les fonctions SECURITY DEFINER
-- ─────────────────────────────────────────────────────────────────────────────

CREATE SCHEMA IF NOT EXISTS private;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. TRIGGER FONCTION — updated_at automatique
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION private.set_updated_at()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION private.set_updated_at() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION private.set_updated_at() FROM anon;
REVOKE EXECUTE ON FUNCTION private.set_updated_at() FROM authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. TRIGGER FONCTION — synchroniser auth.users → public.users
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION private.handle_new_auth_user()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.users (id, email, created_at)
  VALUES (NEW.id, NEW.email, NEW.created_at)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION private.handle_new_auth_user() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION private.handle_new_auth_user() FROM anon;
REVOKE EXECUTE ON FUNCTION private.handle_new_auth_user() FROM authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. TABLE — tenants
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.tenants (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug       TEXT        NOT NULL,
  name       TEXT        NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT tenants_slug_unique UNIQUE (slug),
  CONSTRAINT tenants_slug_format CHECK (slug ~ '^[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$')
);

COMMENT ON TABLE public.tenants IS 'Établissements et organisations.';
COMMENT ON COLUMN public.tenants.slug IS 'Identifiant URL normalisé, unique.';

CREATE TRIGGER tenants_set_updated_at
  BEFORE UPDATE ON public.tenants
  FOR EACH ROW
  EXECUTE FUNCTION private.set_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. TABLE — users (miroir minimal de auth.users)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.users (
  id         UUID        PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  email      TEXT        NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.users IS 'Miroir minimal de auth.users — email uniquement.';

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION private.handle_new_auth_user();

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. TYPE CONTRÔLÉ — rôles de membership
-- ─────────────────────────────────────────────────────────────────────────────

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'membership_role') THEN
    CREATE TYPE public.membership_role AS ENUM ('owner', 'admin', 'staff', 'viewer');
  END IF;
END$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 7. TABLE — memberships
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.memberships (
  id         UUID                   PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID                   NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  tenant_id  UUID                   NOT NULL REFERENCES public.tenants (id) ON DELETE CASCADE,
  role       public.membership_role NOT NULL,
  created_at TIMESTAMPTZ            NOT NULL DEFAULT now(),
  CONSTRAINT memberships_user_tenant_unique UNIQUE (user_id, tenant_id)
);

COMMENT ON TABLE public.memberships IS 'Relation utilisateur ↔ tenant avec rôle.';

CREATE INDEX IF NOT EXISTS memberships_user_id_idx   ON public.memberships (user_id);
CREATE INDEX IF NOT EXISTS memberships_tenant_id_idx ON public.memberships (tenant_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 8. ROW LEVEL SECURITY
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.tenants     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.tenants     FORCE ROW LEVEL SECURITY;
ALTER TABLE public.users       FORCE ROW LEVEL SECURITY;
ALTER TABLE public.memberships FORCE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────────────────────
-- 9. POLICIES — tenants
-- ─────────────────────────────────────────────────────────────────────────────

CREATE POLICY "tenants_select_members_only"
  ON public.tenants
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.memberships AS m
      WHERE m.tenant_id = public.tenants.id
        AND m.user_id = (SELECT auth.uid())
    )
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- 10. POLICIES — users
-- ─────────────────────────────────────────────────────────────────────────────

CREATE POLICY "users_select_own_profile"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (id = (SELECT auth.uid()));

-- ─────────────────────────────────────────────────────────────────────────────
-- 11. POLICIES — memberships
-- ─────────────────────────────────────────────────────────────────────────────

CREATE POLICY "memberships_select_own"
  ON public.memberships
  FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- ─────────────────────────────────────────────────────────────────────────────
-- 12. GRANTS
-- ─────────────────────────────────────────────────────────────────────────────

REVOKE ALL ON public.tenants     FROM anon, authenticated;
REVOKE ALL ON public.users       FROM anon, authenticated;
REVOKE ALL ON public.memberships FROM anon, authenticated;

GRANT SELECT ON public.tenants     TO authenticated;
GRANT SELECT ON public.users       TO authenticated;
GRANT SELECT ON public.memberships TO authenticated;
