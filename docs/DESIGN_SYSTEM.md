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

## État actuel (F0-R1)

Les tokens sont définis et utilisés dans `src/app/page.tsx`. Les composants UI
seront construits en UI-1 en consommant ces tokens.
