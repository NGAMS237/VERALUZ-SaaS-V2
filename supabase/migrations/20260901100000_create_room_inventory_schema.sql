-- Migration: create_room_inventory_schema
-- Lot: CORE-1 — Chambres, Catégories et Paramètres Opérationnels
-- Auteur: Claude (implémenteur CORE-1)
-- Date: 2026-09-01
-- STACKED_ON_UNMERGED_F1: OUI

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. TYPE — statut opérationnel chambre
-- ─────────────────────────────────────────────────────────────────────────────

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'room_operational_status') THEN
    CREATE TYPE public.room_operational_status AS ENUM (
      'active',
      'inactive',
      'out_of_service'
    );
  END IF;
END$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. TABLE — room_categories
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.room_categories (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID        NOT NULL REFERENCES public.tenants (id) ON DELETE CASCADE,
  code            TEXT        NOT NULL,
  name            TEXT        NOT NULL,
  description     TEXT,
  base_occupancy  INTEGER     NOT NULL DEFAULT 1,
  max_adults      INTEGER     NOT NULL DEFAULT 2,
  max_children    INTEGER     NOT NULL DEFAULT 0,
  max_occupancy   INTEGER     NOT NULL DEFAULT 2,
  is_active       BOOLEAN     NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT room_categories_tenant_code_unique    UNIQUE (tenant_id, code),
  CONSTRAINT room_categories_code_format           CHECK (code ~ '^[A-Z0-9][A-Z0-9_-]{0,31}$'),
  CONSTRAINT room_categories_code_nonempty         CHECK (length(trim(code)) > 0),
  CONSTRAINT room_categories_name_nonempty         CHECK (length(trim(name)) > 0),
  CONSTRAINT room_categories_base_occupancy_pos    CHECK (base_occupancy >= 1),
  CONSTRAINT room_categories_max_adults_nonneg     CHECK (max_adults >= 0),
  CONSTRAINT room_categories_max_children_nonneg   CHECK (max_children >= 0),
  CONSTRAINT room_categories_max_occupancy_pos     CHECK (max_occupancy >= 1),
  CONSTRAINT room_categories_occupancy_coherence   CHECK (max_occupancy >= base_occupancy),
  CONSTRAINT room_categories_adults_coherence      CHECK (max_adults <= max_occupancy)
);

COMMENT ON TABLE  public.room_categories IS 'Catégories de chambres par tenant — CORE-1.';
COMMENT ON COLUMN public.room_categories.code IS 'Code normalisé unique par tenant (ex: STD, SUP, DLX).';
COMMENT ON COLUMN public.room_categories.max_occupancy IS 'Capacité max. Doit etre >= base_occupancy.';

CREATE INDEX IF NOT EXISTS room_categories_tenant_id_idx
  ON public.room_categories (tenant_id);
CREATE INDEX IF NOT EXISTS room_categories_tenant_active_idx
  ON public.room_categories (tenant_id, is_active) WHERE is_active = true;

CREATE TRIGGER room_categories_set_updated_at
  BEFORE UPDATE ON public.room_categories
  FOR EACH ROW EXECUTE FUNCTION private.set_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. TABLE — rooms
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.rooms (
  id                  UUID                           PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           UUID                           NOT NULL REFERENCES public.tenants (id) ON DELETE CASCADE,
  room_category_id    UUID                           NOT NULL REFERENCES public.room_categories (id) ON DELETE RESTRICT,
  code                TEXT                           NOT NULL,
  name                TEXT,
  floor               TEXT,
  description         TEXT,
  operational_status  public.room_operational_status NOT NULL DEFAULT 'active',
  is_active           BOOLEAN                        NOT NULL DEFAULT true,
  created_at          TIMESTAMPTZ                    NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ                    NOT NULL DEFAULT now(),

  CONSTRAINT rooms_tenant_code_unique      UNIQUE (tenant_id, code),
  CONSTRAINT rooms_code_format             CHECK (code ~ '^[A-Za-z0-9][A-Za-z0-9_-]{0,31}$'),
  CONSTRAINT rooms_code_nonempty           CHECK (length(trim(code)) > 0)
);

COMMENT ON TABLE  public.rooms IS 'Chambres par tenant — CORE-1. Statuts structurels uniquement.';
COMMENT ON COLUMN public.rooms.operational_status IS 'active|inactive|out_of_service. Occupation/proprete dans les lots futurs.';

CREATE INDEX IF NOT EXISTS rooms_tenant_id_idx
  ON public.rooms (tenant_id);
CREATE INDEX IF NOT EXISTS rooms_room_category_id_idx
  ON public.rooms (room_category_id);
CREATE INDEX IF NOT EXISTS rooms_tenant_status_idx
  ON public.rooms (tenant_id, operational_status);
CREATE INDEX IF NOT EXISTS rooms_tenant_active_idx
  ON public.rooms (tenant_id, is_active) WHERE is_active = true;

CREATE TRIGGER rooms_set_updated_at
  BEFORE UPDATE ON public.rooms
  FOR EACH ROW EXECUTE FUNCTION private.set_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. TABLE — tenant_operational_settings
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.tenant_operational_settings (
  tenant_id       UUID        PRIMARY KEY REFERENCES public.tenants (id) ON DELETE CASCADE,
  timezone        TEXT        NOT NULL DEFAULT 'Africa/Douala',
  currency_code   TEXT        NOT NULL DEFAULT 'XAF',
  locale          TEXT        NOT NULL DEFAULT 'fr-CM',
  check_in_time   TIME,
  check_out_time  TIME        NOT NULL DEFAULT '12:00',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT tenant_settings_currency_format  CHECK (currency_code ~ '^[A-Z]{3}$'),
  CONSTRAINT tenant_settings_locale_format    CHECK (locale ~ '^[a-z]{2}-[A-Z]{2}$'),
  CONSTRAINT tenant_settings_timezone_nonempty CHECK (length(trim(timezone)) > 0)
);

COMMENT ON TABLE  public.tenant_operational_settings IS 'Parametres operationnels — exactement une ligne par tenant.';
COMMENT ON COLUMN public.tenant_operational_settings.check_out_time IS 'Heure de depart standard. Valeur pilote: 12:00.';

CREATE TRIGGER tenant_settings_set_updated_at
  BEFORE UPDATE ON public.tenant_operational_settings
  FOR EACH ROW EXECUTE FUNCTION private.set_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. ROW LEVEL SECURITY
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.room_categories             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms                       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_operational_settings ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.room_categories             FORCE ROW LEVEL SECURITY;
ALTER TABLE public.rooms                       FORCE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_operational_settings FORCE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. POLICIES — room_categories
-- ─────────────────────────────────────────────────────────────────────────────

CREATE POLICY "room_categories_select_member"
  ON public.room_categories FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.memberships m
      WHERE m.tenant_id = public.room_categories.tenant_id
        AND m.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "room_categories_insert_owner_admin"
  ON public.room_categories FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.memberships m
      WHERE m.tenant_id = public.room_categories.tenant_id
        AND m.user_id = (SELECT auth.uid())
        AND m.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "room_categories_update_owner_admin"
  ON public.room_categories FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.memberships m
      WHERE m.tenant_id = public.room_categories.tenant_id
        AND m.user_id = (SELECT auth.uid())
        AND m.role IN ('owner', 'admin')
    )
  )
  WITH CHECK (
    public.room_categories.tenant_id = tenant_id
    AND EXISTS (
      SELECT 1 FROM public.memberships m
      WHERE m.tenant_id = public.room_categories.tenant_id
        AND m.user_id = (SELECT auth.uid())
        AND m.role IN ('owner', 'admin')
    )
  );

-- Pas de DELETE policy -> refus par defaut RLS

-- ─────────────────────────────────────────────────────────────────────────────
-- 7. POLICIES — rooms
-- ─────────────────────────────────────────────────────────────────────────────

CREATE POLICY "rooms_select_member"
  ON public.rooms FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.memberships m
      WHERE m.tenant_id = public.rooms.tenant_id
        AND m.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "rooms_insert_owner_admin"
  ON public.rooms FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.memberships m
      WHERE m.tenant_id = public.rooms.tenant_id
        AND m.user_id = (SELECT auth.uid())
        AND m.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "rooms_update_owner_admin"
  ON public.rooms FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.memberships m
      WHERE m.tenant_id = public.rooms.tenant_id
        AND m.user_id = (SELECT auth.uid())
        AND m.role IN ('owner', 'admin')
    )
  )
  WITH CHECK (
    public.rooms.tenant_id = tenant_id
    AND EXISTS (
      SELECT 1 FROM public.memberships m
      WHERE m.tenant_id = public.rooms.tenant_id
        AND m.user_id = (SELECT auth.uid())
        AND m.role IN ('owner', 'admin')
    )
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- 8. POLICIES — tenant_operational_settings
-- ─────────────────────────────────────────────────────────────────────────────

CREATE POLICY "tenant_settings_select_member"
  ON public.tenant_operational_settings FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.memberships m
      WHERE m.tenant_id = public.tenant_operational_settings.tenant_id
        AND m.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "tenant_settings_insert_owner_admin"
  ON public.tenant_operational_settings FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.memberships m
      WHERE m.tenant_id = public.tenant_operational_settings.tenant_id
        AND m.user_id = (SELECT auth.uid())
        AND m.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "tenant_settings_update_owner_admin"
  ON public.tenant_operational_settings FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.memberships m
      WHERE m.tenant_id = public.tenant_operational_settings.tenant_id
        AND m.user_id = (SELECT auth.uid())
        AND m.role IN ('owner', 'admin')
    )
  )
  WITH CHECK (
    public.tenant_operational_settings.tenant_id = tenant_id
    AND EXISTS (
      SELECT 1 FROM public.memberships m
      WHERE m.tenant_id = public.tenant_operational_settings.tenant_id
        AND m.user_id = (SELECT auth.uid())
        AND m.role IN ('owner', 'admin')
    )
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- 9. GRANTS
-- ─────────────────────────────────────────────────────────────────────────────

REVOKE ALL ON public.room_categories             FROM anon, authenticated;
REVOKE ALL ON public.rooms                       FROM anon, authenticated;
REVOKE ALL ON public.tenant_operational_settings FROM anon, authenticated;

GRANT SELECT, INSERT, UPDATE ON public.room_categories             TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.rooms                       TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.tenant_operational_settings TO authenticated;
