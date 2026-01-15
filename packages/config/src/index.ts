export const config = {
  // Environment
  env: process.env.NODE_ENV || "development",
  isDev: process.env.NODE_ENV !== "production",

  // Server
  port: parseInt(process.env.PORT || "3000", 10),
  host: process.env.HOST || "0.0.0.0",

  // URLs
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
  adminUrl: process.env.ADMIN_URL || "http://localhost:5174",
  backendUrl: process.env.BACKEND_URL || "http://localhost:3000",

  // Database
  databaseUrl:
    process.env.DATABASE_URL ||
    "postgresql://postgres:postgres@localhost:5432/cher_journal",

  // Session
  sessionSecret: process.env.SESSION_SECRET || "change-me-in-production-please",
  sessionMaxAge: 7 * 24 * 60 * 60 * 1000, // 7 days

  // Encryption (KEK - Key Encryption Key)
  masterEncryptionKey:
    process.env.MASTER_ENCRYPTION_KEY || "dev-only-32-byte-key-change-me!!",
  encryptionEnabled: process.env.ENCRYPTION_ENABLED !== "false", // true by default, set to 'false' to disable

  // Stripe
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || "",
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || "",
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || "",
  },

  // CORS
  corsOrigins: (
    process.env.CORS_ORIGINS || "http://localhost:5173,http://localhost:5174"
  ).split(","),

  // Upload
  uploadDir: process.env.UPLOAD_DIR || "./uploads",
  maxUploadSize: parseInt(process.env.MAX_UPLOAD_SIZE || "10485760", 10), // 10MB

  // Wait-until-free
  waitDuration: parseInt(process.env.WAIT_DURATION_MS || "86400000", 10), // 24h default

  // Seed data
  seed: {
    adminEmail: process.env.SEED_ADMIN_EMAIL || "admin@cherjournal.com",
    adminPassword: process.env.SEED_ADMIN_PASSWORD || "admin123",
    userEmail: process.env.SEED_USER_EMAIL || "user@example.com",
    userPassword: process.env.SEED_USER_PASSWORD || "user123",
  },

  // Rate limiting
  rateLimit: {
    max: parseInt(process.env.RATE_LIMIT_MAX || "1000", 10),
    timeWindow: process.env.RATE_LIMIT_WINDOW || "15 minutes",
  },
};

export default config;
