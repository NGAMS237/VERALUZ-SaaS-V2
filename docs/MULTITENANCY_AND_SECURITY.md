# Multi-tenancy et Sécurité — VERALUZ SaaS V2

## Modèle multi-tenant

VERALUZ adopte un modèle **shared database, shared schema** avec isolation par RLS.

### Résolution du tenant (F1+)

Le tenant sera résolu depuis le chemin de requête ou le sous-domaine :

```
/t/[tenantSlug]/dashboard  →  slug "veraluz-001"
veraluz-001.app.example.com  →  résolution par sous-domaine
```

Le slug ou le domaine sélectionne le **contexte UX** uniquement. Il ne
constitue jamais une autorisation d'accès aux données.

### Ce qui N'autorise PAS une requête

- `X-Tenant-Id` (en-tête HTTP) — hint uniquement, jamais une preuve d'identité
- `NEXT_PUBLIC_TENANT_ID` (variable d'env publique) — hint UX côté client
- `current_setting('app.tenant_id')` seul — insuffisant sans vérification d'identité

### Ce qui AUTORISE une requête (F1+)

L'accès sera lié à l'utilisateur authentifié via `auth.uid()` et une table
de memberships. La RLS devra s'appuyer sur ce modèle :

```sql
-- Exemple documentaire conceptuel (F1+, ne pas créer ce fichier en F0)
CREATE POLICY "tenant_members_can_read"
ON public.example_table
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.memberships AS membership
    WHERE membership.user_id = (SELECT auth.uid())
      AND membership.tenant_id = example_table.tenant_id
  )
);
```

Règles supplémentaires pour les policies RLS (F1+) :

- Les politiques `UPDATE` doivent utiliser à la fois `USING` et `WITH CHECK`
- Les rôles doivent être visés explicitement avec `TO authenticated`
- Toutes les tables exposées doivent avoir `ROW LEVEL SECURITY` activée
- Aucune policy ne doit reposer uniquement sur `current_setting('app.tenant_id')`

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
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

`X-XSS-Protection` est intentionnellement absent : cet en-tête est obsolète,
ignoré par les navigateurs modernes et potentiellement dangereux dans les
navigateurs anciens. Voir `DECISIONS.md [DECISION-008]`.

`HSTS` est absent : il sera ajouté une fois que le domaine HTTPS sera décidé
avec Blaise.

### Convention de fichier Next.js 16 pour le routage tenant

Dans Next.js 16, le fichier de routage au niveau application s'appelle
`proxy.ts` (non `middleware.ts`). Ce fichier sera implémenté en F1 si
un besoin runtime de résolution de tenant le justifie.

### Variables d'environnement

- **Règle absolue** : aucun secret dans le dépôt
- Fichier `.env.local` exclu via `.gitignore`
- Validation Zod stricte au démarrage (`src/lib/config/env.ts`)
- `APP_ENV` : variable serveur obligatoire ; une absence bloque le démarrage
- `FEATURE_MAINTENANCE` : variable serveur, seulement `"true"` ou `"false"` — valeurs
  ambiguës comme `"True"`, `"yes"`, `"1"` sont rejetées avec erreur explicite
- Variables `NEXT_PUBLIC_*` : non-secrètes par construction (bundlées côté client)

### Secret scanning

Pipeline CI avec gitleaks sur chaque push (action pinnée au SHA).

## Plan de sécurité par lot

| Lot | Sécurité implémentée                             |
| --- | ------------------------------------------------ |
| F0  | En-têtes HTTP, validation env stricte, scan CI   |
| F1  | Supabase local, Auth, RLS, memberships et tenant |
| F1+ | Audit logs et permissions selon les modules      |
| GA  | Revue conformité, secrets et production          |

## Décisions régionales et réglementaires

La région d'hébergement des données, le domaine internet et les réglementations
applicables (RGPD, lois locales, certifications) sont **à décider avec Blaise
avant tout déploiement**. Aucune exigence réglementaire ne doit être documentée
comme actée avant cette décision.
