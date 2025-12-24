import dotenv from "dotenv";
dotenv.config();
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DNS ?? "",
  // Setting this option to true will send default PII data to Sentry.
  // For example, automatic IP address collection on events
  sendDefaultPii: false,
});

const test =
  "🚀 Hello if you read this, it's just a test error. nothing serious so far.";
Sentry.captureException(new Error(test));
console.error(test);
