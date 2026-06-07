/**
 * Service Layer — barrel export
 *
 * Import from here instead of individual service files to keep
 * import paths stable when services are reorganized.
 *
 * Usage:
 *   import { crmService, notificationService } from "../lib/services";
 */

export * as crmService          from "./crmService";
export * as notificationService from "./notificationService";
export * as applicationService  from "./applicationService";
