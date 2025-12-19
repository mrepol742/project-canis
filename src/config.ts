/** Bot display name */
export const PROJECT_CANIS_ALIAS = process.env.PROJECT_CANIS_ALIAS ?? "Canis";

/** Auto-restart when memory usage is too high */
export const PROJECT_AUTO_RESTART =
  (process.env.PROJECT_AUTO_RESTART ?? "false") === "true";

/** Memory threshold (MB) that triggers warnings or restart logic */
export const PROJECT_THRESHOLD_MEMORY = Number(
  process.env.PROJECT_THRESHOLD_MEMORY ?? 1024,
);

/** Maximum allowed memory usage (MB) before forced shutdown */
export const PROJECT_MAX_MEMORY = Number(
  process.env.PROJECT_MAX_MEMORY ?? 2048,
);

/** Automatically download incoming media */
export const PROJECT_AUTO_DOWNLOAD_MEDIA =
  (process.env.PROJECT_AUTO_DOWNLOAD_MEDIA ?? "true") === "true";

/** Maximum media size (MB) allowed for auto-download */
export const PROJECT_MAX_DOWNLOAD_MEDIA = Number(
  process.env.PROJECT_MAX_DOWNLOAD_MEDIA ?? 25,
);

/** Enable custom bot font rendering */
export const PROJECT_ENABLE_BOT_FONT =
  (process.env.PROJECT_ENABLE_BOT_FONT ?? "true") === "true";

/** Node.js runtime environment */
export const NODE_ENV =
  (process.env.NODE_ENV as "development" | "production") ?? "development";

/** Queue concurrency limit */
export const P_QUEUE_CONCURRENCY_COUNT = Number(
  process.env.P_QUEUE_CONCURRENCY_COUNT ?? 2,
);

/** Enable PhishTank phishing detection */
export const PHISHTANK_ENABLE =
  (process.env.PHISHTANK_ENABLE ?? "true") === "true";

/** Hour (UTC) when PhishTank updates run */
export const PHISHTANK_UPDATE_HOUR = Number(
  process.env.PHISHTANK_UPDATE_HOUR ?? 3,
);

/** Automatically update PhishTank database */
export const PHISHTANK_AUTO_UPDATE =
  (process.env.PHISHTANK_AUTO_UPDATE ?? "true") === "true";

/** Sentry DSN for error tracking */
export const SENTRY_DNS = process.env.SENTRY_DNS ?? undefined;

/** Command prefix used to trigger bot commands */
export const COMMAND_PREFIX = process.env.COMMAND_PREFIX ?? "!";

/** Allow commands without a prefix */
export const COMMAND_PREFIX_LESS =
  (process.env.COMMAND_PREFIX_LESS ?? "true") === "true";

/** HTTP server port */
export const PORT = Number(process.env.PORT ?? 3000);

/** Puppeteer browser executable path */
export const PUPPETEER_EXEC_PATH =
  process.env.PUPPETEER_EXEC_PATH ?? "/opt/google/chrome/google-chrome";

/** Automatically reload commands on file change */
export const AUTO_RELOAD = (process.env.AUTO_RELOAD ?? "false") === "true";

/** Prisma database connection URL */
export const DATABASE_URL =
  process.env.DATABASE_URL ?? "mysql://root@127.0.0.1:3306/project_canis";

/** MariaDB host */
export const PRISMA_MARIA_DB_HOST =
  process.env.PRISMA_MARIA_DB_HOST ?? "127.0.0.1";

/** MariaDB username */
export const PRISMA_MARIA_DB_USER = process.env.PRISMA_MARIA_DB_USER ?? "root";

/** MariaDB password */
export const PRISMA_MARIA_DB_PASSWORD =
  process.env.PRISMA_MARIA_DB_PASSWORD ?? "";

/** MariaDB database name */
export const PRISMA_MARIA_DB_DATABASE =
  process.env.PRISMA_MARIA_DB_DATABASE ?? "project_canis";

/** Redis connection URL */
export const REDIS_URL = process.env.REDIS_URL ?? "redis://127.0.0.1:6379";

/** Supported AI providers */
export type AIProvider = "openrouter" | "groq" | "gemini" | "openai" | "ollama";

/** Selected AI provider */
export const AI_PROVIDER = (process.env.AI_PROVIDER as AIProvider) ?? "groq";

/** OpenRouter API key */
export const OPEN_ROUTER_API_KEY = process.env.OPEN_ROUTER_API_KEY ?? undefined;

/** OpenRouter model identifier */
export const OPEN_ROUTER_MODEL =
  process.env.OPEN_ROUTER_MODEL ?? "moonshotai/kimi-k2:free";

/** Groq API key */
export const GROQ_API_KEY = process.env.GROQ_API_KEY ?? undefined;

/** Groq model identifier */
export const GROQ_MODEL =
  process.env.GROQ_MODEL ?? "meta-llama/llama-4-scout-17b-16e-instruct";

/** Gemini API key */
export const GEMINI_API_KEY = process.env.GEMINI_API_KEY ?? undefined;

/** Gemini model identifier */
export const GEMINI_MODEL = process.env.GEMINI_MODEL ?? "gemini-2.0-flash-001";

/** OpenAI API key */
export const OPENAI_API_KEY = process.env.OPENAI_API_KEY ?? undefined;

/** OpenAI model identifier */
export const OPENAI_MODEL = process.env.OPENAI_MODEL ?? "gpt-4o";

/** Ollama local model identifier */
export const OLLAMA_MODEL = process.env.OLLAMA_MODEL ?? "llama3.1";

/** Enable query result caching */
export const ALLOW_QUERY_CACHING =
  (process.env.ALLOW_QUERY_CACHING ?? "true") === "true";

/** Maximum number of cached queries */
export const QUERY_CACHING_COUNT = Number(
  process.env.QUERY_CACHING_COUNT ?? 1000,
);

/** Cache time-to-live (seconds) */
export const QUERY_CACHING_TTL = Number(process.env.QUERY_CACHING_TTL ?? 3600);

/** Shell used for executing system commands */
export const EXEC_SHELL = process.env.EXEC_SHELL ?? "/bin/bash";

/** Wakatime API key */
export const WAKATIME_API_KEY = process.env.WAKATIME_API_KEY ?? undefined;

/** Maximum number of Axios retries */
export const AXIOS_MAX_RETRY = Number(process.env.AXIOS_MAX_RETRY ?? 3);

/** Axios User-Agent header */
export const AXIOS_USER_AGENT = process.env.AXIOS_USER_AGENT ?? "Canis/11.0.0";

/** Axios request timeout (ms) */
export const AXIOS_TIMEOUT = Number(process.env.AXIOS_TIMEOUT ?? 30_000);

/** Axios request origin header */
export const AXIOS_ORIGIN = process.env.AXIOS_ORIGIN ?? "";

/** Axios request host header */
export const AXIOS_HOST = process.env.AXIOS_HOST ?? "";
