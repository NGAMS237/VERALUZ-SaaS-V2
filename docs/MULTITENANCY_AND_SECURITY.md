# Multi-tenancy et Sécurité — VERALUZ SaaS V2

## Modèle multi-tenant

VERALUZ adopte un modèle **shared database, shared schema** avec isolation par RLS.

### Identification du tenant

1. Sous-domaine : `veraluz-001.app.veraluz.ca`
2. En-tête HTTP (pour les API) : `X-Tenant-Id`
3. Variable d'environnement : `NEXT_PUBLIC_TENANT_ID` (override en dev)

### Isolation des données (F1+)

```sql
-- Chaque table métier aura une colonne tenant_id
-- avec RLS activée

ALTER TABLE residents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation" ON residents
  USING (tenant_id = current_setting('app.tenant_id')::text);
```

### Tenant pilote

| Clé    | Valeur               |
| ------ | -------------------- |
| ID     | `veraluz-001`        |
| Nom    | La Résidence VERALUZ |
| Statut | Pilote — F1+         |

## Sécurité applicative

### En-têtes HTTP (configurés en F0)

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

### Variables d'environnement

- **Règle absolue** : aucun secret dans le dépôt
- Fichier `.env.local` exclu via `.gitignore`
- Validation Zod au démarrage (échec rapide)
- Clés publiques (`NEXT_PUBLIC_*`) only pour les données non-sensibles

### Secret scanning

Pipeline CI avec gitleaks sur chaque push.

## Plan de sécurité par lot

| Lot | Sécurité implémentée                            |
| --- | ----------------------------------------------- |
| F0  | En-têtes HTTP, validation env, scan secrets     |
| F1  | Authentification Supabase Auth, RLS, middleware |
| F2  | Audit logs, permissions granulaires             |
| F3  | Chiffrement données sensibles, RGPD             |
