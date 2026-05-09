<template>
  <div id="userLoginPage">
    <h2 class="title">User Login</h2>
    <a-form
      style="max-width: 480px; margin: 0 auto"
      :model="formState"
      name="basic"
      label-align="left"
      :label-col="{ span: 4 }"
      :wrapper-col="{ span: 20 }"
      autocomplete="off"
      @finish="handleSubmit"
      @finishFailed="onFinishFailed"
    >
      <a-form-item
        label="Account"
        name="userAccount"
        :rules="[{ required: true, message: 'Please input account' }]"
      >
        <a-input
          v-model:value="formState.userAccount"
          placeholder="Please input account"
        />
      </a-form-item>

      <a-form-item
        label="Password"
        name="userPassword"
        validate-trigger="change"
        :rules="[
          { required: true, message: 'Please input password' },
          { min: 8, message: 'Password length must be at least 8' },
        ]"
      >
        <a-input-password
          v-model:value="formState.userPassword"
          placeholder="Please input password"
        />
      </a-form-item>

      <a-form-item class="submit-item" :wrapper-col="{ span: 24 }">
        <a-button type="primary" html-type="submit">Login</a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<script lang="ts" setup>
import { userLogin } from "@/api/user";
import { useLoginUserStore } from "@/store/userLoginUserStore";
import { message } from "ant-design-vue";
import type { AxiosError } from "axios";
import { reactive } from "vue";
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

const handleSubmit = async (values: FormState) => {
  try {
    const res = await userLogin(values);
    if (res.data?.code === 0) {
      await loginUserStore.fetchLoginUser();
      message.success("Login success");
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
    message.error(`Login failed: ${res.data?.description ?? "Unknown error"}`);
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
      "Request failed";
    if (statusCode === 404) {
      message.error(`Login failed: API not found (404) ${requestUrl}`);
      return;
    }
    message.error(`Login failed: ${errorMsg}`);
    console.log("userLogin error:", values, error);
  }
};

const onFinishFailed = (errorInfo: unknown) => {
  console.log("Failed:", errorInfo);
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
