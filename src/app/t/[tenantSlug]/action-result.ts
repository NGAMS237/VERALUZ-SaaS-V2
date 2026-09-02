/**
 * src/app/t/[tenantSlug]/action-result.ts
 * Type partagé pour les résultats de Server Actions du tenant shell.
 *
 * Isolé des fichiers "use server" : ceux-ci ne peuvent exporter que des
 * fonctions asynchrones, jamais des types ou des constantes de valeur.
 */

export interface ActionResult {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Record<string, string>;
}

export const initialActionResult: ActionResult = { status: "idle" };
