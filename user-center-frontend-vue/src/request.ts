import axios from "axios";

const baseURL =
  process.env.VUE_APP_BASE_API?.trim() || "http://localhost:8080/api";

const myAxios = axios.create({
  baseURL,
  timeout: 10000,
  withCredentials: true,
});

export const resolveApiAssetUrl = (path?: string) => {
  if (!path) {
    return "";
  }
  if (/^https?:\/\//i.test(path)) {
    return path;
  }
  const apiBaseUrl = myAxios.defaults.baseURL || "";
  const normalizedPath = path.startsWith("/") ? path.slice(1) : path;
  return `${apiBaseUrl}/${normalizedPath}`;
};

// Add a request interceptor
myAxios.interceptors.request.use(
  function (config) {
    // Do something before request is sent
    return config;
  },
  function (error) {
    // Do something with request error
    return Promise.reject(error);
  }
);

// Add a response interceptor
myAxios.interceptors.response.use(
  function (response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    const { data } = response;
    // 未登录
    if (data.code === 40100) {
      // 不是获取用户信息接口，或者不是登录页面，则跳转到登录页面
      if (
        !response.request.responseURL.includes("user/current") &&
        !window.location.pathname.includes("/user/login")
      ) {
        window.location.href = `/user/login?redirect=${window.location.href}`;
      }
    }
    return response;
  },
  function (error) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    return Promise.reject(error);
  }
);

export default myAxios;
