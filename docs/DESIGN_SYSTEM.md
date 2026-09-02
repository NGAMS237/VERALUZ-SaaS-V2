# Design System — VERALUZ SaaS V2

## Principe fondamental

Les tokens CSS `--vlz-*` dans `src/styles/tokens.css` sont la **seule source de vérité visuelle**.
Aucune valeur brute ne doit apparaître dans les composants sous `src/app`, `src/components` ou `src/modules`.

## Convention de nommage

```
--vlz-{catégorie}-{variante}-{propriété}
```

Exemples :

- `--vlz-color-brand-primary` ✅
- `--vlz-font-size-lg` ✅
- `#1B3A5C` dans un composant ❌
- `1.125rem` inline ❌
- `100dvh` inline ❌
- `480px` inline ❌

## Exceptions SVG structurelles

Les attributs SVG suivants sont acceptés en valeur brute car ils sont intrinsèques
à la géométrie du SVG et ne peuvent pas recevoir `var()` en position d'attribut
standard :

| Attribut          | Justification                                             |
| ----------------- | --------------------------------------------------------- |
| `viewBox`         | Valeur composite, pas une valeur CSS                      |
| `width`, `height` | Sur `<svg>` : remplacer par `style={{ width: var(...) }}` |
| `rx`, `ry`        | Coordonnée géométrique de rect                            |
| `x`, `y`          | Coordonnées de texte SVG                                  |
| `d`               | Données de tracé (path)                                   |
| `textAnchor`      | Attribut de présentation SVG                              |
| `fontSize`        | Présentation SVG — valeur de design constante             |
| `fontWeight`      | Présentation SVG — valeur de design constante             |
| `fontFamily`      | Présentation SVG — valeur de design constante             |

**Règle** : les attributs `fill` et `stroke` DOIVENT utiliser des tokens CSS (`var(--vlz-*)`).
Les attributs géométriques (`width`, `height`, `rx`, `x`, `y`, données `d`) sont des exceptions.

Pour les dimensions rendues d'un élément SVG (la taille affichée), utiliser
`style={{ width: "var(--vlz-icon-size-wordmark)" }}` plutôt que l'attribut `width`.

## Catégories de tokens

| Catégorie        | Préfixe                                | Description                   |
| ---------------- | -------------------------------------- | ----------------------------- |
| Couleurs marque  | `--vlz-color-brand-*`                  | Bleu nuit, Or, Beige          |
| Couleurs statut  | `--vlz-color-status-*`                 | Succès, Erreur, Avertissement |
| Couleurs neutres | `--vlz-color-neutral-*`                | Échelle de gris               |
| Typographie      | `--vlz-font-*`                         | Famille, taille, graisse      |
| Espacement       | `--vlz-space-*`                        | Marges et paddings            |
| Bordures         | `--vlz-radius-*`, `--vlz-border-*`     | Rayons et épaisseurs          |
| Ombres           | `--vlz-shadow-*`                       | Élévations                    |
| Transitions      | `--vlz-transition-*`                   | Durées et courbes             |
| Z-index          | `--vlz-z-*`                            | Couches d'empilement          |
| Layout           | `--vlz-container-*`, `--vlz-sidebar-*` | Dimensions structurelles      |
| Viewport         | `--vlz-viewport-*`                     | Hauteurs de viewport          |
| Contenu          | `--vlz-content-*`                      | Largeurs maximales de contenu |
| Lettrage         | `--vlz-letter-spacing-*`               | Espacement des caractères     |
| Forme            | `--vlz-radius-circle`                  | Cercle parfait (50%)          |
| Icônes           | `--vlz-icon-size-*`                    | Tailles des icônes            |

## Palette principale

| Token                       | Valeur    | Usage                                 |
| --------------------------- | --------- | ------------------------------------- |
| `--vlz-color-brand-primary` | `#1B3A5C` | Bleu nuit — actions, textes forts     |
| `--vlz-color-brand-accent`  | `#C89B4A` | Or résidentiel — accents, CTA         |
| `--vlz-color-brand-surface` | `#F5F3EE` | Beige ivoire — arrière-plan principal |

## Contrôle statique

Le skill `veraluz-architecture-guardian` détecte les valeurs CSS brutes dans
`src/app`, `src/components` et `src/modules`. Il doit être exécuté avant tout commit.
Voir `skills/veraluz-architecture-guardian/SKILL.md`.

## Horizon Signature UI System (UI-1)

UI-1 adopte la structure sémantique du système « Horizon Signature UI System »
(direction artistique fournie hors dépôt) — voir `DECISIONS.md [DECISION-009]`.
Seuls les **rôles** et la **géométrie** sont repris ; la palette de marque
VERALUZ (`--vlz-color-brand-*`, actée en DECISION-006) reste inchangée.

### Rôles de surface

| Token                                | Usage                                         |
| ------------------------------------ | --------------------------------------------- |
| `--vlz-color-surface-canvas`         | Fond de page                                  |
| `--vlz-color-surface-base`           | Carte standard, filtres, tables               |
| `--vlz-color-surface-raised`         | Carte élevée, modale, popover                 |
| `--vlz-color-surface-soft`           | Panneau discret, en-tête de table, item actif |
| `--vlz-color-surface-inverse`        | Sidebar Ink/Navy                              |
| `--vlz-color-surface-inverse-strong` | Survol/actif sur surface inverse              |

### Rôles de texte, bordure et focus

`--vlz-color-text-primary/secondary/muted/inverse/inverse-muted/link`,
`--vlz-color-border-default/strong/inverse`, `--vlz-color-focus-ring`.

### Géométrie signature

`--vlz-radius-organic` (48px) et `--vlz-radius-signature` (64px) — réservés aux
grandes surfaces (hero dashboard, carte de connexion), jamais aux tables, champs
ou petites cartes. Voir `--vlz-radius-sm/md/lg/xl/full` pour le reste.

### Thème sombre

Activé via `[data-theme="dark"]` sur `<html>`, posé par un script d'amorçage
inline (`src/components/shell/theme-script.ts`) avant hydratation pour éviter
tout flash de thème incorrect. Seuls les tokens de **rôle** (surface/texte/
bordure/ombre) sont redéfinis dans le bloc `[data-theme="dark"]` de
`tokens.css` — la palette `--vlz-color-neutral-*` et `--vlz-color-brand-*`
reste fixe. Préférence persistée en `localStorage` (`vlz-theme`), avec repli
sur `prefers-color-scheme` si aucun choix explicite n'a été fait.

## État actuel (UI-1)

Les tokens sont consommés par le shell applicatif (`src/components/shell/`),
les composants UI partagés (`src/components/ui/`) et les écrans fonctionnels
(`src/app/t/[tenantSlug]/{dashboard,rooms,room-categories,settings}/`). Les
feuilles de style dédiées par domaine vivent dans `src/styles/` (`shell.css`,
`forms.css`, `feedback.css`, `tables.css`, `dashboard.css`, `auth.css`),
toutes important exclusivement des `var(--vlz-*)`.
