<template>
  <div class="globalHeader">
    <a-row :wrap="false" align="middle">
      <a-col class="brand-col" flex="220px">
        <div class="title-bar">
          <img class="logo" src="../assets/logo.png" alt="logo" />
          <div class="title">User Center</div>
        </div>
      </a-col>
      <a-col flex="auto">
        <a-menu
          v-model:selectedKeys="current"
          mode="horizontal"
          :items="items"
          @click="doMenuClick"
        />
      </a-col>
      <a-col class="user-col" flex="120px">
        <div class="user-login-status">
          <a-button type="primary" href="/user/login">Login</a-button>
        </div>
      </a-col>
    </a-row>
  </div>
</template>

<script lang="ts" setup>
import { h, ref } from "vue";
import { CrownOutlined, HomeOutlined } from "@ant-design/icons-vue";
import { MenuProps } from "ant-design-vue";
import { useRouter } from "vue-router";

const router = useRouter();

const doMenuClick = ({ key }: { key: string }) => {
  router.push({
    path: key,
  });
};

const current = ref(["home"]);
router.afterEach((to) => {
  current.value = [to.path];
});

const items = ref<MenuProps["items"]>([
  {
    key: "/",
    icon: () => h(HomeOutlined),
    label: "Home",
    title: "Home",
  },
  {
    key: "/user/login",
    label: "User Login",
    title: "User Login",
  },
  {
    key: "/user/register",
    label: "User Register",
    title: "User Register",
  },
  {
    key: "/admin/userManage",
    icon: () => h(CrownOutlined),
    label: "User Manage",
    title: "User Manage",
  },
  {
    key: "others",
    label: h(
      "a",
      { href: "https://github.com/kanjyo-hirako", target: "_blank" },
      "About"
    ),
    title: "About",
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
