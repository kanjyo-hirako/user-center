<template>
  <div id="userLoginPage">
    <h2 class="title">用户登录</h2>
    <a-form
      style="max-width: 480px; margin: 0 auto"
      :model="formState"
      name="basic"
      label-align="left"
      :label-col="{ span: 4 }"
      :wrapper-col="{ span: 20 }"
      autocomplete="off"
      @finish="handleSubmit"
    >
      <a-form-item
        label="账号"
        name="userAccount"
        :rules="[{ required: true, message: '请输入账号' }]"
      >
        <a-input
          v-model:value="formState.userAccount"
          placeholder="请输入账号"
        />
      </a-form-item>

      <a-form-item
        label="密码"
        name="userPassword"
        validate-trigger="change"
        :rules="[
          { required: true, message: '请输入密码' },
          { min: 8, message: '密码长度不能小于8位' },
        ]"
      >
        <a-input-password
          v-model:value="formState.userPassword"
          placeholder="请输入密码"
        />
      </a-form-item>

      <a-form-item class="submit-item" :wrapper-col="{ span: 24 }">
        <a-button type="primary" html-type="submit" :loading="loading"
          >登录</a-button
        >
      </a-form-item>
    </a-form>
  </div>
</template>

<script lang="ts" setup>
import { userLogin } from "@/api/user";
import { useLoginUserStore } from "@/store/userLoginUserStore";
import { message } from "ant-design-vue";
import type { AxiosError } from "axios";
import { reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

interface FormState {
  userAccount: string;
  userPassword: string;
}

const formState = reactive<FormState>({
  userAccount: "",
  userPassword: "",
});

const router = useRouter();
const route = useRoute();
const loginUserStore = useLoginUserStore();
const loading = ref(false);

const handleSubmit = async (values: FormState) => {
  if (loading.value) return;
  loading.value = true;
  try {
    const res = await userLogin(values);
    if (res.data?.code === 0 && res.data?.data) {
      loginUserStore.setLoginUser(res.data.data);
      message.success("登录成功");
      const redirect =
        typeof route.query.redirect === "string"
          ? route.query.redirect
          : "/admin/userManage";
      router.push({
        path: redirect,
        replace: true,
      });
      return;
    }
    const errorDesc = res.data?.description ?? res.data?.message ?? "未知错误";
    message.error(`登录失败：${errorDesc}`);
  } catch (error) {
    const axiosError = error as AxiosError<{
      description?: string;
      message?: string;
    }>;
    const requestUrl =
      axiosError.config?.baseURL && axiosError.config?.url
        ? `${axiosError.config.baseURL}${axiosError.config.url}`
        : axiosError.config?.url || "";
    const statusCode = axiosError.response?.status;
    const errorMsg =
      axiosError.response?.data?.description ||
      axiosError.response?.data?.message ||
      axiosError.message ||
      "请求失败";
    if (statusCode === 404) {
      message.error(`登录失败：接口不存在(404) ${requestUrl}`);
      return;
    }
    message.error(`登录失败：${errorMsg}`);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
#userLoginPage .title {
  text-align: center;
  margin-bottom: 16px;
}

.submit-item :deep(.ant-form-item-control-input-content) {
  text-align: center;
}
</style>
