import axios from "axios";

const axiosInstance = axios.create({
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
});

export default axiosInstance;