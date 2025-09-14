import axios from "axios";

const AXIOS_MAX_RETRY = process.env.AXIOS_MAX_RETRY || 3;

axios.interceptors.response.use(
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

    return axios(config);
  },
);

export default axios;
