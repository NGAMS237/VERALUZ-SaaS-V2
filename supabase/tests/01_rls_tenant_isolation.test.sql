-- Tests pgTAP — Isolation RLS multi-tenant
-- Lot F1 — VERALUZ SaaS V2
--
-- Pré-requis : supabase db reset && supabase test db
-- Ces tests vérifient les garanties d'isolation entre tenants.

BEGIN;

SELECT plan(24);

-- ─────────────────────────────────────────────────────────────────────────────
-- FIXTURES
-- ─────────────────────────────────────────────────────────────────────────────

-- Tenants de test
INSERT INTO public.tenants (id, slug, name) VALUES
  ('aaaaaaaa-0000-0000-0000-000000000001'::uuid, 'tenant-alpha', 'Tenant Alpha'),
  ('bbbbbbbb-0000-0000-0000-000000000002'::uuid, 'tenant-beta',  'Tenant Beta');

-- Utilisateurs fictifs dans auth.users (insertion directe en test)
INSERT INTO auth.users (id, email, created_at, updated_at, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, aud, role)
VALUES
  ('11111111-0000-0000-0000-000000000001'::uuid, 'alice@local.dev', now(), now(), now(), '{}'::jsonb, '{}'::jsonb, 'authenticated', 'authenticated'),
  ('22222222-0000-0000-0000-000000000002'::uuid, 'bob@local.dev',   now(), now(), now(), '{}'::jsonb, '{}'::jsonb, 'authenticated', 'authenticated'),
  ('33333333-0000-0000-0000-000000000003'::uuid, 'charlie@local.dev', now(), now(), now(), '{}'::jsonb, '{}'::jsonb, 'authenticated', 'authenticated');

-- Le trigger handle_new_auth_user devrait avoir copié les users dans public.users.
-- Vérification : sinon insertion manuelle pour s'assurer que les tests continuent.
INSERT INTO public.users (id, email) VALUES
  ('11111111-0000-0000-0000-000000000001'::uuid, 'alice@local.dev'),
  ('22222222-0000-0000-0000-000000000002'::uuid, 'bob@local.dev'),
  ('33333333-0000-0000-0000-000000000003'::uuid, 'charlie@local.dev')
ON CONFLICT (id) DO NOTHING;

-- Alice appartient à Alpha (owner), Bob appartient à Beta (staff)
-- Charlie n'a aucun membership
INSERT INTO public.memberships (user_id, tenant_id, role) VALUES
  ('11111111-0000-0000-0000-000000000001'::uuid, 'aaaaaaaa-0000-0000-0000-000000000001'::uuid, 'owner'),
  ('22222222-0000-0000-0000-000000000002'::uuid, 'bbbbbbbb-0000-0000-0000-000000000002'::uuid, 'staff');

-- ─────────────────────────────────────────────────────────────────────────────
-- TEST 1 : Tables existent
-- ─────────────────────────────────────────────────────────────────────────────

SELECT has_table('public', 'tenants',     'Table public.tenants existe');
SELECT has_table('public', 'users',       'Table public.users existe');
SELECT has_table('public', 'memberships', 'Table public.memberships existe');

-- ─────────────────────────────────────────────────────────────────────────────
-- TEST 2 : RLS activé
-- ─────────────────────────────────────────────────────────────────────────────

SELECT has_row_security('public', 'tenants',     'RLS activé sur tenants');
SELECT has_row_security('public', 'users',       'RLS activé sur users');
SELECT has_row_security('public', 'memberships', 'RLS activé sur memberships');

-- ─────────────────────────────────────────────────────────────────────────────
-- TEST 3 : Policies existent
-- ─────────────────────────────────────────────────────────────────────────────

SELECT policy_cmd_is('public', 'tenants',     'tenants_select_members_only', 'SELECT', 'Policy SELECT sur tenants');
SELECT policy_cmd_is('public', 'users',       'users_select_own_profile',    'SELECT', 'Policy SELECT sur users');
SELECT policy_cmd_is('public', 'memberships', 'memberships_select_own',      'SELECT', 'Policy SELECT sur memberships');

-- ─────────────────────────────────────────────────────────────────────────────
-- TEST 4 : anonyme — aucun accès
-- ─────────────────────────────────────────────────────────────────────────────

SET LOCAL role TO anon;

SELECT is(
  (SELECT count(*) FROM public.tenants)::int, 0,
  'anon ne voit aucun tenant'
);
SELECT is(
  (SELECT count(*) FROM public.users)::int, 0,
  'anon ne voit aucun user'
);
SELECT is(
  (SELECT count(*) FROM public.memberships)::int, 0,
  'anon ne voit aucun membership'
);

RESET role;

-- ─────────────────────────────────────────────────────────────────────────────
-- TEST 5 : Alice (membre de Alpha) — voit uniquement Alpha
-- ─────────────────────────────────────────────────────────────────────────────

SET LOCAL role TO authenticated;
SET LOCAL request.jwt.claims TO '{"sub": "11111111-0000-0000-0000-000000000001", "role": "authenticated"}';

SELECT is(
  (SELECT count(*) FROM public.tenants)::int, 1,
  'Alice voit exactement 1 tenant'
);
SELECT is(
  (SELECT slug FROM public.tenants LIMIT 1), 'tenant-alpha',
  'Alice voit tenant-alpha et pas tenant-beta'
);
SELECT is(
  (SELECT count(*) FROM public.memberships)::int, 1,
  'Alice voit son propre membership'
);
SELECT is(
  (SELECT id FROM public.users LIMIT 1), '11111111-0000-0000-0000-000000000001'::uuid,
  'Alice voit son propre profil'
);

RESET role;
RESET "request.jwt.claims";

-- ─────────────────────────────────────────────────────────────────────────────
-- TEST 6 : Bob (membre de Beta) — ne voit pas Alpha
-- ─────────────────────────────────────────────────────────────────────────────

SET LOCAL role TO authenticated;
SET LOCAL request.jwt.claims TO '{"sub": "22222222-0000-0000-0000-000000000002", "role": "authenticated"}';

SELECT is(
  (SELECT count(*) FROM public.tenants)::int, 1,
  'Bob voit exactement 1 tenant'
);
SELECT is(
  (SELECT slug FROM public.tenants LIMIT 1), 'tenant-beta',
  'Bob voit tenant-beta et pas tenant-alpha'
);

RESET role;
RESET "request.jwt.claims";

-- ─────────────────────────────────────────────────────────────────────────────
-- TEST 7 : Charlie (sans membership) — ne voit rien
-- ─────────────────────────────────────────────────────────────────────────────

SET LOCAL role TO authenticated;
SET LOCAL request.jwt.claims TO '{"sub": "33333333-0000-0000-0000-000000000003", "role": "authenticated"}';

SELECT is(
  (SELECT count(*) FROM public.tenants)::int, 0,
  'Charlie sans membership ne voit aucun tenant'
);
SELECT is(
  (SELECT count(*) FROM public.memberships)::int, 0,
  'Charlie sans membership ne voit aucun membership'
);

RESET role;
RESET "request.jwt.claims";

-- ─────────────────────────────────────────────────────────────────────────────
-- TEST 8 : Contrainte unicité user+tenant
-- ─────────────────────────────────────────────────────────────────────────────

SELECT throws_ok(
  $$INSERT INTO public.memberships (user_id, tenant_id, role)
    VALUES (
      '11111111-0000-0000-0000-000000000001'::uuid,
      'aaaaaaaa-0000-0000-0000-000000000001'::uuid,
      'staff'
    )$$,
  '23505',
  NULL,
  'Violation de contrainte unicité user+tenant'
);

-- ─────────────────────────────────────────────────────────────────────────────
-- TEST 9 : Clé étrangère — user inexistant refusé
-- ─────────────────────────────────────────────────────────────────────────────

SELECT throws_ok(
  $$INSERT INTO public.memberships (user_id, tenant_id, role)
    VALUES (
      'ffffffff-ffff-ffff-ffff-ffffffffffff'::uuid,
      'aaaaaaaa-0000-0000-0000-000000000001'::uuid,
      'viewer'
    )$$,
  '23503',
  NULL,
  'Clé étrangère user_id respectée'
);

-- ─────────────────────────────────────────────────────────────────────────────
-- TEST 10 : Slug invalide refusé
-- ─────────────────────────────────────────────────────────────────────────────

SELECT throws_ok(
  $$INSERT INTO public.tenants (slug, name) VALUES ('UPPERCASE_SLUG', 'Test')$$,
  '23514',
  NULL,
  'Slug avec majuscules refusé par contrainte CHECK'
);

SELECT * FROM finish();
ROLLBACK;
