import axios from "axios";

const AXIOS_MAX_RETRY = process.env.AXIOS_MAX_RETRY || 3;
const AXIOS_USER_AGENT = process.env.AXIOS_USER_AGENT || "Canis/11.0.0";
const AXIOS_TIMEOUT = parseInt(process.env.AXIOS_TIMEOUT || "3000");
const AXIOS_ORIGIN = process.env.ORIGIN || "";
const AXIOS_HOST = process.env.HOST || "";

const instance = axios.create({
  timeout: AXIOS_TIMEOUT,
  headers: {
    "User-Agent": AXIOS_USER_AGENT,
    "Content-Type": "application/json",
    "Origin": AXIOS_ORIGIN,
    "Host": AXIOS_HOST,
  },
});

instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;

    if (!config || config.__retryCount >= AXIOS_MAX_RETRY) {
      return Promise.reject(error);
    }

    config.__retryCount = config.__retryCount || 0;
    config.__retryCount += 1;

    const delay = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms));
    await delay(config.__retryCount * 1000);

    return instance(config);
  },
);

export default instance;
