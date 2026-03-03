/**
 * Application constants for Chompy mobile app.
 */

import Constants from "expo-constants";

type AppEnv = "development" | "staging" | "production";

interface ApiBaseUrlsConfig {
  readonly development?: string;
  readonly staging?: string;
  readonly production?: string;
}

interface ExpoExtraConfig {
  readonly appEnv?: string;
  readonly apiBaseUrls?: ApiBaseUrlsConfig;
}

const DEFAULT_API_BASE_URLS: Record<AppEnv, string> = {
  development: "http://127.0.0.1:8000",
  staging: "https://staging-api.chompy.example",
  production: "https://api.chompy.example",
};

function sanitizeBaseUrl(url: string): string {
  return url.replace(/\/+$/, "");
}

function parseAppEnv(rawEnv: string | undefined): AppEnv {
  if (!rawEnv) {
    return "development";
  }
  if (rawEnv === "staging" || rawEnv === "production") {
    return rawEnv;
  }
  return "development";
}

function inferExpoHost(): string | null {
  const expoConfigHost = (
    Constants.expoConfig as { hostUri?: string } | null | undefined
  )?.hostUri;
  if (typeof expoConfigHost === "string" && expoConfigHost.length > 0) {
    return expoConfigHost.split(":")[0] ?? null;
  }
  const expoGoHost = (
    Constants as unknown as {
      expoGoConfig?: { debuggerHost?: string };
    }
  ).expoGoConfig?.debuggerHost;
  if (typeof expoGoHost === "string" && expoGoHost.length > 0) {
    return expoGoHost.split(":")[0] ?? null;
  }
  return null;
}

function resolveDevelopmentBaseUrl(configuredUrl: string | undefined): string {
  if (configuredUrl && configuredUrl.trim().length > 0) {
    return sanitizeBaseUrl(configuredUrl);
  }
  const host = inferExpoHost();
  if (!host || host === "localhost" || host === "127.0.0.1") {
    return DEFAULT_API_BASE_URLS.development;
  }
  return `http://${host}:8000`;
}

function resolveApiBaseUrl(): string {
  const extra = (Constants.expoConfig?.extra ?? {}) as ExpoExtraConfig;
  const appEnv = parseAppEnv(extra.appEnv);
  const configuredUrls = extra.apiBaseUrls;
  if (appEnv === "development") {
    return resolveDevelopmentBaseUrl(configuredUrls?.development);
  }
  const fallback = DEFAULT_API_BASE_URLS[appEnv];
  const configured = configuredUrls?.[appEnv];
  return configured && configured.trim().length > 0
    ? sanitizeBaseUrl(configured)
    : fallback;
}

/** Backend API base URL (injected by Expo config + env). */
export const API_BASE_URL = resolveApiBaseUrl();

/** API endpoint paths. */
export const API_ENDPOINTS = {
  HEALTH: "/api/health",
  UPLOAD_IMAGE: "/api/images/upload",
  DIAGNOSTIC_RESULT: "/api/diagnostics",
} as const;

/** BLE service UUIDs for Chompy hardware device. */
export const BLE_SERVICE_UUID = "0000FFE0-0000-1000-8000-00805F9B34FB";
export const BLE_CHARACTERISTIC_UUID = "0000FFE1-0000-1000-8000-00805F9B34FB";

/** BLE scan timeout in milliseconds. */
export const BLE_SCAN_TIMEOUT_MS = 10_000;

/** Device name prefix for filtering BLE scan results. */
export const BLE_DEVICE_NAME_PREFIX = "Chompy";
