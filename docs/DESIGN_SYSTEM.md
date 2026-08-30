# Design System — VERALUZ SaaS V2

## Principe fondamental

Les tokens CSS `--vlz-*` dans `src/styles/tokens.css` sont la **seule source de vérité visuelle**.
Aucune valeur brute ne doit apparaître dans les composants.

## Convention de nommage

```
--vlz-{catégorie}-{variante}-{propriété}
```

Exemples :

- `--vlz-color-brand-primary` ✅
- `--vlz-font-size-lg` ✅
- `#1B3A5C` dans un composant ❌
- `1.125rem` inline ❌

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

## Palette principale

| Token                       | Valeur    | Usage                                 |
| --------------------------- | --------- | ------------------------------------- |
| `--vlz-color-brand-primary` | `#1B3A5C` | Bleu nuit — actions, textes forts     |
| `--vlz-color-brand-accent`  | `#C89B4A` | Or résidentiel — accents, CTA         |
| `--vlz-color-brand-surface` | `#F5F3EE` | Beige ivoire — arrière-plan principal |

## État actuel (F0)

Les tokens sont définis. Les composants UI seront construits en UI-1.
En F0, seule la page d'accueil minimale utilise les tokens directement en style inline.
