/**
 * src/components/shell/theme-script.ts
 * Script d'amorçage du thème clair/sombre — exécuté avant hydratation pour
 * éviter le flash de thème incorrect (FOUC). Lit la préférence stockée,
 * sinon `prefers-color-scheme`, et pose `data-theme` sur <html>.
 */

export const THEME_STORAGE_KEY = "vlz-theme";

export const THEME_INIT_SCRIPT = `(function(){try{var k="${THEME_STORAGE_KEY}";var s=localStorage.getItem(k);var t=(s==="light"||s==="dark")?s:(window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");document.documentElement.setAttribute("data-theme",t);}catch(e){}})();`;
