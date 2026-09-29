export const ENV = {
  appId: process.env.VITE_APP_ID || "meuautonomo",
  cookieSecret: process.env.JWT_SECRET || process.env.COOKIE_SECRET || "meuautonomo-jwt-secret-key-super-secure-min-32-chars-fallback",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
};
