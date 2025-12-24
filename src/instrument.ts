import * as Sentry from "@sentry/node";
import { NODE_ENV, SENTRY_DNS } from "./config";

Sentry.init({
  dsn: SENTRY_DNS,
  // Setting this option to true will send default PII data to Sentry.
  // For example, automatic IP address collection on events
  sendDefaultPii: false,
  enabled: NODE_ENV === "production",
});
