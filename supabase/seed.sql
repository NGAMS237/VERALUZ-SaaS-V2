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
