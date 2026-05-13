<template>
  <div class="globalHeader">
    <a-row :wrap="false" align="middle">
      <a-col class="brand-col" flex="220px">
        <div class="title-bar">
          <img class="logo" src="../assets/baka.jpg" alt="logo" />
          <div class="title">用户中心</div>
        </div>
      </a-col>
      <a-col flex="auto">
        <a-menu
          :selectedKeys="current"
          mode="horizontal"
          :items="items"
          @click="doMenuClick"
        />
      </a-col>
      <a-col class="user-col" flex="120px">
        <div class="user-login-status">
          <a-button
            v-if="route.path === '/' || route.path === '/user/register'"
            type="primary"
            href="/user/login"
            >登录</a-button
          >
          <a-button
            v-else-if="route.path.startsWith('/admin')"
            danger
            @click="doLogout"
            >退出登录</a-button
          >
        </div>
      </a-col>
    </a-row>
  </div>
</template>

<script lang="ts" setup>
import { h, ref } from "vue";
import { CrownOutlined, HomeOutlined } from "@ant-design/icons-vue";
import { MenuProps, message } from "ant-design-vue";
import { useRoute, useRouter } from "vue-router";
import { userLogout } from "@/api/user";
import { useLoginUserStore } from "@/store/userLoginUserStore";

const router = useRouter();
const route = useRoute();
const loginUserStore = useLoginUserStore();

const doLogout = async () => {
  try {
    await userLogout({});
    loginUserStore.setLoginUser({ userName: "未登录" });
    message.success("已退出登录");
    router.push({ path: "/" });
  } catch {
    message.error("退出登录失败");
  }
};

const doMenuClick = ({ key }: { key: string }) => {
  if (key === "others") {
    const currentPath = route.path;
    window.open("https://github.com/kanjyo-hirako", "_blank");
    current.value = [currentPath];
    return;
  }
  router.push({
    path: key,
  });
};

const current = ref([route.path]);
router.afterEach((to) => {
  current.value = [to.path];
});

const items = ref<MenuProps["items"]>([
  {
    key: "/",
    icon: () => h(HomeOutlined),
    label: "首页",
    title: "首页",
  },
  {
    key: "/user/login",
    label: "用户登录",
    title: "用户登录",
  },
  {
    key: "/user/register",
    label: "用户注册",
    title: "用户注册",
  },
  {
    key: "/admin/userManage",
    icon: () => h(CrownOutlined),
    label: "用户管理",
    title: "用户管理",
  },
  {
    key: "others",
    label: h(
      "a",
      { href: "https://github.com/kanjyo-hirako", target: "_blank" },
      "关于"
    ),
    title: "关于",
  },
]);
</script>

<style scoped>
.title-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 48px;
  position: relative;
}

.title {
  color: black;
  font-size: 18px;
  margin-left: 0;
  text-align: center;
  width: 100%;
}

.logo {
  height: 40px;
  left: 0;
  position: absolute;
}

.user-login-status {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  min-height: 48px;
}
</style>
