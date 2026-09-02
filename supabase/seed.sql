-- seed.sql — Données locales de développement UNIQUEMENT
-- NE PAS exécuter en production ou staging.
-- Idempotent : utilise INSERT ... ON CONFLICT DO NOTHING.
--
-- Tenant pilote : veraluz-001 (La Résidence VERALUZ)

INSERT INTO public.tenants (id, slug, name)
VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  'veraluz-001',
  'La Résidence VERALUZ'
)
ON CONFLICT (slug) DO NOTHING;

-- Utilisateur de démonstration local (identité fictive, pas de vrai email)
-- L'utilisateur doit être créé via supabase auth admin (local uniquement).
-- Email local de démo : demo@local.dev (jamais envoyé, pas de vrai compte).
-- Le seed ne crée PAS l'entrée auth.users directement — cela est géré par
-- le trigger private.handle_new_auth_user() à la création via la CLI locale.

-- ─── CORE-1 — Paramètres opérationnels pilote veraluz-001 ───────────────────
-- Timezone, devise, locale et check-out canonique.
-- NE PAS exécuter en production.

INSERT INTO public.tenant_operational_settings
  (tenant_id, timezone, currency_code, locale, check_out_time)
VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  'Africa/Douala',
  'XAF',
  'fr-CM',
  '12:00'
)
ON CONFLICT (tenant_id) DO UPDATE SET
  timezone      = EXCLUDED.timezone,
  currency_code = EXCLUDED.currency_code,
  locale        = EXCLUDED.locale,
  check_out_time = EXCLUDED.check_out_time;

-- Catégories fictives de test (NON basées sur les vraies chambres VERALUZ)
-- Réservées à l'environnement local uniquement.
-- Les catégories réelles seront créées par les opérateurs via l'interface.
