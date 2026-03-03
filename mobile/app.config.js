const baseConfig = require("./app.json");

const APP_ENVS = new Set(["development", "staging", "production"]);

function normalizeAppEnv(rawValue) {
  if (typeof rawValue !== "string") {
    return "development";
  }
  const normalized = rawValue.trim().toLowerCase();
  return APP_ENVS.has(normalized) ? normalized : "development";
}

function sanitizeBaseUrl(rawValue, fallback) {
  if (typeof rawValue !== "string" || rawValue.trim().length === 0) {
    return fallback;
  }
  return rawValue.trim().replace(/\/+$/, "");
}

const appEnv = normalizeAppEnv(process.env.CHOMPY_APP_ENV);

const defaultApiBaseUrls = {
  staging: "https://staging-api.chompy.example",
  production: "https://api.chompy.example",
};

const apiBaseUrls = {
  development: sanitizeBaseUrl(
    process.env.CHOMPY_API_BASE_URL_DEV,
    "",
  ),
  staging: sanitizeBaseUrl(
    process.env.CHOMPY_API_BASE_URL_STAGING,
    defaultApiBaseUrls.staging,
  ),
  production: sanitizeBaseUrl(
    process.env.CHOMPY_API_BASE_URL_PROD,
    defaultApiBaseUrls.production,
  ),
};

module.exports = {
  ...baseConfig.expo,
  extra: {
    ...(baseConfig.expo.extra ?? {}),
    appEnv,
    apiBaseUrls,
  },
};
