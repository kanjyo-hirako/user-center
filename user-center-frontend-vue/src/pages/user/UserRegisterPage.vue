<template>
  <div id="userRegisterPage">
    <h2 class="title">用户注册</h2>
    <a-form
      ref="formRef"
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
        :rules="[{ required: true, message: '请输入账号!' }]"
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
          { required: true, message: '请输入密码!' },
          { min: 8, message: '密码长度不能小于8位!' },
        ]"
      >
        <a-input-password
          v-model:value="formState.userPassword"
          placeholder="请输入密码"
        />
      </a-form-item>

      <a-form-item
        label="确认密码"
        name="checkPassword"
        validate-trigger="change"
        :rules="[
          { required: true, message: '请输入确认密码!' },
          { min: 8, message: '确认密码长度不能小于8位!' },
          { validator: validateCheckPassword, trigger: 'change' },
        ]"
      >
        <a-input-password
          v-model:value="formState.checkPassword"
          placeholder="请输入确认密码"
        />
      </a-form-item>

      <a-form-item
        label="用户名"
        name="username"
        :rules="[
          { required: true, message: '请输入用户名!' },
          { validator: validateUsername, trigger: 'blur' },
        ]"
      >
        <a-input
          v-model:value="formState.username"
          placeholder="请输入用户名"
        />
      </a-form-item>

      <a-form-item class="submit-item" :wrapper-col="{ span: 24 }">
        <a-button type="primary" html-type="submit">注册</a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<script lang="ts" setup>
import { userRegister } from "@/api/user";
import { message } from "ant-design-vue";
import type { AxiosError } from "axios";
import { reactive, ref, watch } from "vue";
import { useRouter } from "vue-router";

interface FormState {
  userAccount: string;
  userPassword: string;
  checkPassword: string;
  username: string;
}

const formState = reactive<FormState>({
  userAccount: "",
  userPassword: "",
  checkPassword: "",
  username: "",
});

const router = useRouter();
const formRef = ref();

const validateUsername = async (_rule: unknown, value: string) => {
  if (
    value &&
    /[`~!@#$%^&*()+=|{}':;',\\[\].<>/?~！@#￥%……&*（）——+|{}【】'；：""''。，、？]/.test(
      value
    )
  ) {
    return Promise.reject("用户名不能包含特殊字符");
  }
  return Promise.resolve();
};

const validateCheckPassword = async (_rule: unknown, value: string) => {
  if (value && value !== formState.userPassword) {
    return Promise.reject("两次输入的密码不一致");
  }
  return Promise.resolve();
};

watch(
  () => formState.userPassword,
  () => {
    if (formState.checkPassword) {
      formRef.value?.validateFields(["checkPassword"]);
    }
  }
);

const handleSubmit = async (values: FormState) => {
  try {
    const res = await userRegister(values);
    if (res.data?.code === 0) {
      message.success("注册成功");
      router.push({
        path: "/user/login",
        replace: true,
      });
      return;
    }
    message.error(`注册失败：${res.data?.description ?? "未知错误"}`);
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
      message.error(`注册失败：接口不存在(404) ${requestUrl}`);
      return;
    }
    message.error(`注册失败：${errorMsg}`);
  }
};
</script>

<style scoped>
#userRegisterPage .title {
  text-align: center;
  margin-bottom: 16px;
}

.submit-item :deep(.ant-form-item-control-input-content) {
  text-align: center;
}
</style>
