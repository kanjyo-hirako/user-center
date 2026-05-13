import { defineStore } from "pinia";
import { ref } from "vue";
import { getCurrentUser } from "@/api/user";

type LoginUser = {
  id?: number;
  userName?: string;
  userAccount?: string;
  userRole?: string;
  avatarUrl?: string;
  [key: string]: unknown;
};

export const useLoginUserStore = defineStore("loginUser", () => {
  const loginUser = ref<LoginUser>({
    userName: "未登录",
  });

  // 远程获取登录用户信息
  async function fetchLoginUser() {
    try {
      const res = (await getCurrentUser()) as {
        data?: { code?: number; data?: LoginUser };
      };
      if (res.data?.code === 0 && res.data.data) {
        loginUser.value = res.data.data;
      }
    } catch (error) {
      // Keep default guest state when backend endpoint is unavailable.
      loginUser.value = {
        userName: "未登录",
      };
    }
  }

  // 单独设置信息
  function setLoginUser(newLoginUser: LoginUser) {
    loginUser.value = newLoginUser;
  }

  return { loginUser, setLoginUser, fetchLoginUser };
});
