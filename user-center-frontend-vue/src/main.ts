import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import Antd from "ant-design-vue";
import "ant-design-vue/dist/reset.css";
import { createPinia } from "pinia";
import "./access";

if (process.env.NODE_ENV === "development") {
  const isResizeObserverNoise = (message: string) =>
    message.includes(
      "ResizeObserver loop completed with undelivered notifications"
    ) || message.includes("ResizeObserver loop limit exceeded");

  window.addEventListener("error", (event) => {
    const message = event.message || "";
    if (isResizeObserverNoise(message)) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  });

  window.addEventListener("unhandledrejection", (event) => {
    const reason = event.reason as { message?: string } | undefined;
    const message = reason?.message || "";
    if (isResizeObserverNoise(message)) {
      event.preventDefault();
    }
  });
}

const pinia = createPinia();

createApp(App).use(Antd).use(router).use(pinia).mount("#app");
