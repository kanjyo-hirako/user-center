const { defineConfig } = require("@vue/cli-service");
module.exports = defineConfig({
  transpileDependencies: true,
  lintOnSave: "warning",
  devServer: {
    port: 8081,
    client: {
      overlay: {
        warnings: false,
        errors: true,
        runtimeErrors: (error) => {
          if (!error || !error.message) {
            return true;
          }
          return !(
            error.message.includes(
              "ResizeObserver loop completed with undelivered notifications"
            ) || error.message.includes("ResizeObserver loop limit exceeded")
          );
        },
      },
    },
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
      "/avatars": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
    },
  },
});
