const dotenv = require("dotenv");

dotenv.config();

const env = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || "development",
  databaseUrl: process.env.DATABASE_URL,
  openaiApiKey: process.env.OPENAI_API_KEY,
  openaiModel: process.env.OPENAI_MODEL || "gpt-5.4-mini",
  retellApiKey: process.env.RETELL_API_KEY,
  retellWebhookSecret: process.env.RETELL_WEBHOOK_SECRET_KEY,
  humanSupportNumber: process.env.HUMAN_SUPPORT_NUMBER,
  defaultTransferType: process.env.DEFAULT_TRANSFER_TYPE || "cold_transfer",
  logLevel: process.env.LOG_LEVEL || "info",
  piiMaskingEnabled: process.env.PII_MASKING_ENABLED === "true"
};

module.exports = { env };
