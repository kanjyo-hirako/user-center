import { useLoginUserStore } from "@/store/userLoginUserStore";
import { message } from "ant-design-vue";
import router from "@/router";
import { getCurrentUser } from "@/api/user";

/**
 * Global auth guard
 */
router.beforeEach(async (to, from, next) => {
  const loginUserStore = useLoginUserStore();
  const toUrl = to.fullPath;

  if (toUrl.startsWith("/admin")) {
    let loginUser = loginUserStore.loginUser;

    // 用户信息未加载时，尝试获取当前用户
    if (!loginUser || !loginUser.id) {
      try {
        const res = await getCurrentUser();
        if (res.data?.code === 0 && res.data.data) {
          loginUserStore.setLoginUser(res.data.data);
          loginUser = loginUserStore.loginUser;
        }
      } catch (e) {
        // ignore
      }
    }

    if (!loginUser || !loginUser.id) {
      message.error("Please login first");
      next(`/user/login?redirect=${to.fullPath}`);
      return;
    }
  }

  next();
});
