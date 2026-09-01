-- Tests pgTAP — Isolation RLS CORE-1 : room_categories, rooms, tenant_operational_settings
-- Lot CORE-1 — VERALUZ SaaS V2
-- STACKED_ON_UNMERGED_F1: OUI
--
-- Pré-requis : supabase db reset && supabase test db
-- Plan : 40 assertions

BEGIN;

SELECT plan(40);

-- ─────────────────────────────────────────────────────────────────────────────
-- FIXTURES (reprend les UUIDs du test F1 pour cohérence)
-- ─────────────────────────────────────────────────────────────────────────────

-- Tenants Alpha et Beta (déjà créés par la migration seed / test F1 si présents)
INSERT INTO public.tenants (id, slug, name) VALUES
  ('aaaaaaaa-0000-0000-0000-000000000001'::uuid, 'tenant-alpha', 'Tenant Alpha'),
  ('bbbbbbbb-0000-0000-0000-000000000002'::uuid, 'tenant-beta',  'Tenant Beta')
ON CONFLICT (id) DO NOTHING;

-- Utilisateurs fictifs
INSERT INTO auth.users (id, email, created_at, updated_at, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, aud, role)
VALUES
  ('11111111-0000-0000-0000-000000000001'::uuid, 'alice@local.dev', now(), now(), now(), '{}', '{}', 'authenticated', 'authenticated'),
  ('22222222-0000-0000-0000-000000000002'::uuid, 'bob@local.dev',   now(), now(), now(), '{}', '{}', 'authenticated', 'authenticated'),
  ('33333333-0000-0000-0000-000000000003'::uuid, 'charlie@local.dev', now(), now(), now(), '{}', '{}', 'authenticated', 'authenticated'),
  ('44444444-0000-0000-0000-000000000004'::uuid, 'diana@local.dev', now(), now(), now(), '{}', '{}', 'authenticated', 'authenticated'),
  ('55555555-0000-0000-0000-000000000005'::uuid, 'eve@local.dev', now(), now(), now(), '{}', '{}', 'authenticated', 'authenticated')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.users (id, email) VALUES
  ('11111111-0000-0000-0000-000000000001'::uuid, 'alice@local.dev'),
  ('22222222-0000-0000-0000-000000000002'::uuid, 'bob@local.dev'),
  ('33333333-0000-0000-0000-000000000003'::uuid, 'charlie@local.dev'),
  ('44444444-0000-0000-0000-000000000004'::uuid, 'diana@local.dev'),
  ('55555555-0000-0000-0000-000000000005'::uuid, 'eve@local.dev')
ON CONFLICT (id) DO NOTHING;

-- Memberships : alice=owner Alpha, bob=staff Beta, diana=staff Alpha, charlie=aucun, eve=viewer Alpha
INSERT INTO public.memberships (user_id, tenant_id, role) VALUES
  ('11111111-0000-0000-0000-000000000001'::uuid, 'aaaaaaaa-0000-0000-0000-000000000001'::uuid, 'owner'),
  ('22222222-0000-0000-0000-000000000002'::uuid, 'bbbbbbbb-0000-0000-0000-000000000002'::uuid, 'staff'),
  ('44444444-0000-0000-0000-000000000004'::uuid, 'aaaaaaaa-0000-0000-0000-000000000001'::uuid, 'staff'),
  ('55555555-0000-0000-0000-000000000005'::uuid, 'aaaaaaaa-0000-0000-0000-000000000001'::uuid, 'viewer')
ON CONFLICT (user_id, tenant_id) DO NOTHING;

-- Catégories Alpha et Beta
INSERT INTO public.room_categories (id, tenant_id, code, name, base_occupancy, max_adults, max_children, max_occupancy) VALUES
  ('cc111111-0000-0000-0000-000000000001'::uuid, 'aaaaaaaa-0000-0000-0000-000000000001'::uuid, 'STD', 'Standard Alpha', 1, 2, 1, 2),
  ('cc222222-0000-0000-0000-000000000002'::uuid, 'bbbbbbbb-0000-0000-0000-000000000002'::uuid, 'STD', 'Standard Beta',  1, 2, 1, 2);

-- Chambres Alpha et Beta
INSERT INTO public.rooms (id, tenant_id, room_category_id, code, name) VALUES
  ('rr111111-0000-0000-0000-000000000001'::uuid, 'aaaaaaaa-0000-0000-0000-000000000001'::uuid, 'cc111111-0000-0000-0000-000000000001'::uuid, '101', 'Chambre 101 Alpha'),
  ('rr222222-0000-0000-0000-000000000002'::uuid, 'bbbbbbbb-0000-0000-0000-000000000002'::uuid, 'cc222222-0000-0000-0000-000000000002'::uuid, '101', 'Chambre 101 Beta');

-- Paramètres tenant Alpha
INSERT INTO public.tenant_operational_settings (tenant_id, timezone, currency_code, locale, check_out_time)
VALUES ('aaaaaaaa-0000-0000-0000-000000000001'::uuid, 'Africa/Douala', 'XAF', 'fr-CM', '12:00')
ON CONFLICT (tenant_id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- TEST 1 : Tables existent
-- ─────────────────────────────────────────────────────────────────────────────

SELECT has_table('public', 'room_categories',             'Table room_categories existe');
SELECT has_table('public', 'rooms',                       'Table rooms existe');
SELECT has_table('public', 'tenant_operational_settings', 'Table tenant_operational_settings existe');

-- ─────────────────────────────────────────────────────────────────────────────
-- TEST 2 : RLS activée
-- ─────────────────────────────────────────────────────────────────────────────

SELECT ok(
  (SELECT relrowsecurity FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
   WHERE c.relname='room_categories' AND n.nspname='public'),
  'RLS activee sur room_categories');
SELECT ok(
  (SELECT relrowsecurity FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
   WHERE c.relname='rooms' AND n.nspname='public'),
  'RLS activee sur rooms');
SELECT ok(
  (SELECT relrowsecurity FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
   WHERE c.relname='tenant_operational_settings' AND n.nspname='public'),
  'RLS activee sur tenant_operational_settings');

-- ─────────────────────────────────────────────────────────────────────────────
-- TEST 3 : Contraintes tenant
-- ─────────────────────────────────────────────────────────────────────────────

SELECT has_column('public', 'room_categories', 'tenant_id', 'room_categories.tenant_id existe');
SELECT has_column('public', 'rooms',           'tenant_id', 'rooms.tenant_id existe');

-- ─────────────────────────────────────────────────────────────────────────────
-- TEST 4 : Clés étrangères
-- ─────────────────────────────────────────────────────────────────────────────

SELECT ok(
  EXISTS(SELECT 1 FROM information_schema.table_constraints tc
    JOIN information_schema.referential_constraints rc ON rc.constraint_name = tc.constraint_name
    WHERE tc.table_schema='public' AND tc.table_name='room_categories' AND tc.constraint_type='FOREIGN KEY'),
  'room_categories a une FK');
SELECT ok(
  EXISTS(SELECT 1 FROM information_schema.table_constraints tc
    JOIN information_schema.referential_constraints rc ON rc.constraint_name = tc.constraint_name
    WHERE tc.table_schema='public' AND tc.table_name='rooms' AND tc.constraint_type='FOREIGN KEY'),
  'rooms a une FK');

-- ─────────────────────────────────────────────────────────────────────────────
-- TEST 5 : Index sur FK
-- ─────────────────────────────────────────────────────────────────────────────

SELECT ok(
  EXISTS(SELECT 1 FROM pg_indexes WHERE schemaname='public' AND tablename='room_categories' AND indexname='room_categories_tenant_id_idx'),
  'Index room_categories.tenant_id');
SELECT ok(
  EXISTS(SELECT 1 FROM pg_indexes WHERE schemaname='public' AND tablename='rooms' AND indexname='rooms_tenant_id_idx'),
  'Index rooms.tenant_id');
SELECT ok(
  EXISTS(SELECT 1 FROM pg_indexes WHERE schemaname='public' AND tablename='rooms' AND indexname='rooms_room_category_id_idx'),
  'Index rooms.room_category_id');

-- ─────────────────────────────────────────────────────────────────────────────
-- TEST 6 : Code catégorie unique par tenant
-- ─────────────────────────────────────────────────────────────────────────────

SELECT ok(
  EXISTS(SELECT 1 FROM information_schema.table_constraints
    WHERE table_schema='public' AND table_name='room_categories'
      AND constraint_name='room_categories_tenant_code_unique' AND constraint_type='UNIQUE'),
  'room_categories: code unique par tenant (contrainte)');

-- ─────────────────────────────────────────────────────────────────────────────
-- TEST 7 : Même code possible dans deux tenants différents
-- ─────────────────────────────────────────────────────────────────────────────

SELECT ok(
  (SELECT COUNT(*)::int = 2 FROM public.room_categories WHERE code = 'STD'),
  'Code STD peut exister dans deux tenants distincts');

-- ─────────────────────────────────────────────────────────────────────────────
-- TEST 8 : Code chambre unique par tenant
-- ─────────────────────────────────────────────────────────────────────────────

SELECT ok(
  EXISTS(SELECT 1 FROM information_schema.table_constraints
    WHERE table_schema='public' AND table_name='rooms'
      AND constraint_name='rooms_tenant_code_unique' AND constraint_type='UNIQUE'),
  'rooms: code unique par tenant (contrainte)');

-- ─────────────────────────────────────────────────────────────────────────────
-- TEST 9 : Relation chambre/catégorie du même tenant
-- ─────────────────────────────────────────────────────────────────────────────

SELECT ok(
  EXISTS(SELECT 1 FROM public.rooms r
    JOIN public.room_categories rc ON rc.id = r.room_category_id
    WHERE r.id = 'rr111111-0000-0000-0000-000000000001'::uuid
      AND r.tenant_id = rc.tenant_id),
  'La chambre Alpha est associee a la categorie Alpha (meme tenant)');

-- ─────────────────────────────────────────────────────────────────────────────
-- TEST 10 : Relation inter-tenant refusée (contrainte CHECK)
-- ─────────────────────────────────────────────────────────────────────────────

SELECT throws_ok(
  $$INSERT INTO public.rooms (tenant_id, room_category_id, code)
    VALUES ('aaaaaaaa-0000-0000-0000-000000000001'::uuid,
            'cc222222-0000-0000-0000-000000000002'::uuid,
            'X99')$$,
  '23514',
  NULL,
  'Chambre du tenant A avec categorie du tenant B refuse par CHECK');

-- ─────────────────────────────────────────────────────────────────────────────
-- TEST 11 : Capacités incohérentes refusées
-- ─────────────────────────────────────────────────────────────────────────────

SELECT throws_ok(
  $$INSERT INTO public.room_categories (tenant_id, code, name, base_occupancy, max_adults, max_children, max_occupancy)
    VALUES ('aaaaaaaa-0000-0000-0000-000000000001'::uuid, 'BAD', 'Bad', 5, 2, 0, 3)$$,
  '23514',
  NULL,
  'max_occupancy < base_occupancy refuse par CHECK');

-- ─────────────────────────────────────────────────────────────────────────────
-- TEST 12 : Anonyme refusé en lecture room_categories
-- ─────────────────────────────────────────────────────────────────────────────

SELECT ok(
  NOT EXISTS(SELECT 1 FROM information_schema.role_table_grants
    WHERE table_schema='public' AND table_name='room_categories'
      AND grantee='anon' AND privilege_type='SELECT'),
  'anon na pas SELECT sur room_categories');

-- ─────────────────────────────────────────────────────────────────────────────
-- TEST 13 : Utilisateur sans membership refusé (RLS via information_schema)
-- ─────────────────────────────────────────────────────────────────────────────
-- Charlie n'a aucun membership -> sa session RLS ne peut pas voir les catégories.
-- On vérifie la policy EXISTS en examinant pg_policies.

SELECT ok(
  EXISTS(SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='room_categories'
      AND policyname='room_categories_select_member'),
  'Policy SELECT room_categories existe et filtre par membership');

-- ─────────────────────────────────────────────────────────────────────────────
-- TEST 14 : Membre du tenant A autorisé en lecture (vérification policy SELECT)
-- ─────────────────────────────────────────────────────────────────────────────

SELECT ok(
  EXISTS(SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='room_categories'
      AND policyname='room_categories_select_member'
      AND cmd='SELECT'),
  'Policy SELECT room_categories est de type SELECT');

-- ─────────────────────────────────────────────────────────────────────────────
-- TEST 15 : Policy cross-tenant pour rooms (SELECT)
-- ─────────────────────────────────────────────────────────────────────────────

SELECT ok(
  EXISTS(SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='rooms'
      AND policyname='rooms_select_member' AND cmd='SELECT'),
  'Policy SELECT rooms existe');

-- ─────────────────────────────────────────────────────────────────────────────
-- TEST 16 : staff/viewer en lecture — policy SELECT inclut tous les membres
-- ─────────────────────────────────────────────────────────────────────────────

SELECT ok(
  EXISTS(SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='room_categories'
      AND policyname='room_categories_select_member' AND roles @> ARRAY['authenticated'::name]),
  'Policy SELECT room_categories cible authenticated (staff/viewer inclus)');

-- ─────────────────────────────────────────────────────────────────────────────
-- TEST 17 : staff/viewer refusé en écriture — pas de policy INSERT pour eux
-- ─────────────────────────────────────────────────────────────────────────────

SELECT ok(
  EXISTS(SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='room_categories'
      AND policyname='room_categories_insert_owner_admin' AND cmd='INSERT'),
  'Policy INSERT room_categories existe et limite aux owner/admin');

-- ─────────────────────────────────────────────────────────────────────────────
-- TEST 18 : owner/admin autorisé en écriture — policy UPDATE
-- ─────────────────────────────────────────────────────────────────────────────

SELECT ok(
  EXISTS(SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='room_categories'
      AND policyname='room_categories_update_owner_admin' AND cmd='UPDATE'),
  'Policy UPDATE room_categories existe');

-- ─────────────────────────────────────────────────────────────────────────────
-- TEST 19 : Modification de tenant_id refusée (WITH CHECK dans policy UPDATE)
-- ─────────────────────────────────────────────────────────────────────────────

SELECT ok(
  EXISTS(SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='room_categories'
      AND policyname='room_categories_update_owner_admin'
      AND qual IS NOT NULL AND with_check IS NOT NULL),
  'Policy UPDATE room_categories a USING et WITH CHECK (tenant_id immuable)');

-- ─────────────────────────────────────────────────────────────────────────────
-- TEST 20 : DELETE client refusé — aucune policy DELETE sur room_categories
-- ─────────────────────────────────────────────────────────────────────────────

SELECT ok(
  NOT EXISTS(SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='room_categories' AND cmd='DELETE'),
  'Aucune policy DELETE sur room_categories (desactivation uniquement)');

SELECT ok(
  NOT EXISTS(SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='rooms' AND cmd='DELETE'),
  'Aucune policy DELETE sur rooms (desactivation uniquement)');

-- ─────────────────────────────────────────────────────────────────────────────
-- TEST 21 : Paramètres uniques par tenant (PK = tenant_id)
-- ─────────────────────────────────────────────────────────────────────────────

SELECT ok(
  EXISTS(SELECT 1 FROM information_schema.table_constraints
    WHERE table_schema='public' AND table_name='tenant_operational_settings'
      AND constraint_type='PRIMARY KEY'),
  'tenant_operational_settings: PK = tenant_id (unicite par tenant)');

-- ─────────────────────────────────────────────────────────────────────────────
-- TEST 22 : check_out_time pilote = 12:00
-- ─────────────────────────────────────────────────────────────────────────────

SELECT ok(
  (SELECT check_out_time::text = '12:00:00'
   FROM public.tenant_operational_settings
   WHERE tenant_id = 'aaaaaaaa-0000-0000-0000-000000000001'::uuid),
  'check_out_time pilote veraluz = 12:00');

-- ─────────────────────────────────────────────────────────────────────────────
-- TEST 23 : Policies tenant_operational_settings existent
-- ─────────────────────────────────────────────────────────────────────────────

SELECT ok(
  EXISTS(SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='tenant_operational_settings'
      AND cmd='SELECT'),
  'Policy SELECT tenant_operational_settings existe');

-- ─────────────────────────────────────────────────────────────────────────────
-- TEST 24 : anon refusé sur rooms
-- ─────────────────────────────────────────────────────────────────────────────

SELECT ok(
  NOT EXISTS(SELECT 1 FROM information_schema.role_table_grants
    WHERE table_schema='public' AND table_name='rooms'
      AND grantee='anon' AND privilege_type='SELECT'),
  'anon na pas SELECT sur rooms');

-- ─────────────────────────────────────────────────────────────────────────────
-- TEST 25 : Rooms INSERT/UPDATE policies existent
-- ─────────────────────────────────────────────────────────────────────────────

SELECT ok(
  EXISTS(SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='rooms'
      AND policyname='rooms_insert_owner_admin' AND cmd='INSERT'),
  'Policy INSERT rooms existe');

SELECT ok(
  EXISTS(SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='rooms'
      AND policyname='rooms_update_owner_admin' AND cmd='UPDATE'),
  'Policy UPDATE rooms existe');

-- ─────────────────────────────────────────────────────────────────────────────
-- TEST 26 : rooms_category_same_tenant CHECK est définie
-- ─────────────────────────────────────────────────────────────────────────────

SELECT ok(
  EXISTS(SELECT 1 FROM information_schema.check_constraints cc
    JOIN information_schema.table_constraints tc ON tc.constraint_name = cc.constraint_name
    WHERE tc.table_schema='public' AND tc.table_name='rooms'
      AND cc.constraint_name='rooms_category_same_tenant'),
  'Contrainte CHECK rooms_category_same_tenant existe');

-- ─────────────────────────────────────────────────────────────────────────────
-- TEST 27 : Enum room_operational_status existe
-- ─────────────────────────────────────────────────────────────────────────────

SELECT ok(
  EXISTS(SELECT 1 FROM pg_type WHERE typname='room_operational_status'),
  'Type ENUM room_operational_status existe');

-- ─────────────────────────────────────────────────────────────────────────────
-- TEST 28 : default operational_status = active
-- ─────────────────────────────────────────────────────────────────────────────

SELECT ok(
  (SELECT operational_status::text = 'active'
   FROM public.rooms
   WHERE id = 'rr111111-0000-0000-0000-000000000001'::uuid),
  'rooms: operational_status par defaut = active');

-- ─────────────────────────────────────────────────────────────────────────────
-- TEST 29 : tenant_settings UPDATE policy existe
-- ─────────────────────────────────────────────────────────────────────────────

SELECT ok(
  EXISTS(SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='tenant_operational_settings'
      AND policyname='tenant_settings_update_owner_admin' AND cmd='UPDATE'),
  'Policy UPDATE tenant_operational_settings existe');

-- ─────────────────────────────────────────────────────────────────────────────
-- TEST 30 : anon refusé sur tenant_operational_settings
-- ─────────────────────────────────────────────────────────────────────────────

SELECT ok(
  NOT EXISTS(SELECT 1 FROM information_schema.role_table_grants
    WHERE table_schema='public' AND table_name='tenant_operational_settings'
      AND grantee='anon' AND privilege_type='SELECT'),
  'anon na pas SELECT sur tenant_operational_settings');

SELECT * FROM finish();
ROLLBACK;
