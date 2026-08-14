export default () => ({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.PORT ?? '3001', 10),

  jwt: {
    secret: process.env.JWT_SECRET ?? 'fallback-secret',
    expiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  },

  database: {
    url: process.env.DATABASE_URL,
  },

  supabase: {
    url: process.env.SUPABASE_URL,
    anonKey: process.env.SUPABASE_ANON_KEY,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  },

  smtp: {
    host: process.env.SMTP_HOST ?? 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT ?? '587', 10),
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.SMTP_FROM ?? 'Unnati Loan <noreply@unnatiloan.com.np>',
  },

  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    phoneNumber: process.env.TWILIO_PHONE_NUMBER,
    whatsappNumber: process.env.TWILIO_WHATSAPP_NUMBER,
  },

  app: {
    url: process.env.APP_URL ?? 'http://localhost:3001',
    frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:3000',
  },

  verification: {
    // Parent/college verification invitation TTL. Same 3-day default the
    // links have always used (previously hardcoded as LINK_TTL_MS in
    // applications.service.ts) — now configurable via env instead.
    linkTtlMs: parseInt(
      process.env.VERIFICATION_LINK_TTL_MS ?? String(3 * 24 * 60 * 60 * 1000),
      10,
    ),
  },

  bankAccountOpening: {
    // MVP placeholder for the partner bank's account-opening portal — swap
    // via env once the real integration/URL is available. Read once here so
    // the rest of the app never hardcodes it (see BankAccountOpeningService).
    url: process.env.BANK_ACCOUNT_OPENING_URL ?? 'https://bestfinance.com.np/',
  },
});
