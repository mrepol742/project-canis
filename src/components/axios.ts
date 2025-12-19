import axios, { AxiosInstance } from "axios";
import * as Sentry from "@sentry/node";
import {
  AXIOS_HOST,
  AXIOS_MAX_RETRY,
  AXIOS_ORIGIN,
  AXIOS_TIMEOUT,
  AXIOS_USER_AGENT,
} from "../config";

const instance: AxiosInstance = axios.create({
  timeout: AXIOS_TIMEOUT,
  headers: {
    "User-Agent": AXIOS_USER_AGENT,
    "Content-Type": "application/json",
    Origin: AXIOS_ORIGIN,
    Host: AXIOS_HOST,
  },
});

instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;

    if (!config || config.__retryCount >= AXIOS_MAX_RETRY) {
      Sentry.captureException(error);
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
