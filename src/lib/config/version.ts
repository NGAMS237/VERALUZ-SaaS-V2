/**
 * Single source of truth for the application version.
 *
 * The version is read from package.json via resolveJsonModule.
 * Do NOT maintain a second version in NEXT_PUBLIC_APP_VERSION
 * or any other environment variable.
 *
 * This file is the canonical import for the app version.
 */
import pkg from "../../../package.json";

export const APP_VERSION: string = pkg.version;
