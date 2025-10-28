import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DNS || "",
  // Setting this option to true will send default PII data to Sentry.
  // For example, automatic IP address collection on events
  sendDefaultPii: false,
  enabled: process.env.NODE_ENV === "production",
});
