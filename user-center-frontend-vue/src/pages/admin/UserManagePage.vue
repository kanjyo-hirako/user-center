<template>
  <div id="userManagePage">
    <a-input-search
      style="max-width: 320px; margin-bottom: 20px"
      v-model:value="searchValue"
      placeholder="搜索用户名"
      enter-button="搜索"
      allow-clear
      size="large"
      @search="onSearch"
      @clear="onClear"
    />
    <a-table :columns="columns" :data-source="data">
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'avatarUrl'">
          <a-upload
            list-type="picture-card"
            :show-upload-list="false"
            :before-upload="(file: File) => beforeUpload(file, record)"
            :custom-request="(option: Record<string, unknown>) => customUpload(option, record)"
          >
            <div v-if="record.avatarUrl">
              <img :src="record.avatarUrl" style="width: 100%" />
            </div>
            <div v-else>
              <plus-outlined />
              <div class="ant-upload-text">添加头像</div>
            </div>
          </a-upload>
        </template>

        <template v-else-if="column.dataIndex === 'userRole'">
          <div v-if="record.userAccount === 'admin'">
            <a-tag color="green">管理员</a-tag>
          </div>
          <div v-else>
            <a-tag color="blue">用户</a-tag>
          </div>
        </template>

        <template v-else-if="column.dataIndex === 'createTime'">
          {{ dayjs(record.createTime).format("YYYY-MM-DD HH:mm:ss") }}
        </template>

        <template v-else-if="column.key === 'action'">
          <a-button
            v-if="loginUserStore.loginUser.userAccount === 'admin'"
            danger
            @click="doDelete(record.id)"
            >删除</a-button
          >
        </template>
      </template>
    </a-table>
  </div>
</template>

<script lang="ts" setup>
import { deleteUser, searchUsers, uploadAvatar } from "@/api/user";
import { useLoginUserStore } from "@/store/userLoginUserStore";
import { message } from "ant-design-vue";
import { PlusOutlined } from "@ant-design/icons-vue";
import dayjs from "dayjs";
import { ref } from "vue";

interface UserRecord {
  id?: string;
  username?: string;
  userAccount?: string;
  avatarUrl?: string;
  gender?: number;
  userRole?: number;
  createTime?: string;
  [key: string]: unknown;
}

interface UploadOption {
  file: File;
  onSuccess: (data: unknown) => void;
  onError: (error: unknown) => void;
  [key: string]: unknown;
}

const loginUserStore = useLoginUserStore();
const searchValue = ref("");
const data = ref<UserRecord[]>([]);

const doDelete = async (id: string | undefined) => {
  if (loginUserStore.loginUser.userAccount !== "admin") {
    message.error("权限不足");
    return;
  }
  if (!id) {
    return;
  }
  try {
    const res = await deleteUser(id);
    if (res.data?.code === 0) {
      message.success("删除成功");
      await fetchData(searchValue.value);
      return;
    }
    if (res.data?.code === 40101) {
      message.error("权限不足");
      return;
    }
    message.error(`删除失败：${res.data?.description ?? "未知错误"}`);
  } catch (error) {
    message.error("权限不足");
  }
};

const beforeUpload = (file: File, record: UserRecord) => {
  if (!record.id) {
    message.error("用户ID不存在");
    return false;
  }
  const isImage = file.type.startsWith("image/");
  if (!isImage) {
    message.error("只能上传图片文件");
    return false;
  }
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isLt2M) {
    message.error("图片大小不能超过2MB");
    return false;
  }
  return true;
};

const customUpload = async (
  option: Record<string, unknown>,
  record: UserRecord
) => {
  const { file, onSuccess, onError } = option as UploadOption;
  if (!record.id) {
    message.error("用户ID不存在");
    onError(new Error("userId missing"));
    return;
  }
  try {
    const res = await uploadAvatar(file, record.id);
    if (res.data?.code === 0) {
      message.success("头像上传成功");
      record.avatarUrl = res.data.data;
      onSuccess(res.data);
      return;
    }
    message.error(`头像上传失败：${res.data?.description ?? "未知错误"}`);
    onError(new Error("upload failed"));
  } catch (error) {
    message.error("头像上传失败");
    onError(error);
  }
};

const onSearch = () => {
  fetchData(searchValue.value);
};

const onClear = () => {
  fetchData();
};

const columns = [
  { title: "用户名", dataIndex: "username" },
  { title: "账号", dataIndex: "userAccount" },
  { title: "头像", dataIndex: "avatarUrl" },
  { title: "性别", dataIndex: "gender" },
  { title: "创建时间", dataIndex: "createTime" },
  { title: "角色", dataIndex: "userRole" },
  { title: "操作", key: "action" },
];

const fetchData = async (username = "") => {
  try {
    const res = await searchUsers(username);
    if (res.data?.code === 0) {
      data.value = res.data.data || [];
      return;
    }
    message.error(`加载用户失败：${res.data?.description ?? "未知错误"}`);
  } catch (error) {
    message.error("加载用户数据失败，请稍后重试");
  }
};

fetchData();
</script>

<style scoped>
.ant-upload-select-picture-card i {
  font-size: 32px;
  color: #999;
}

.ant-upload-text {
  margin-top: 8px;
  color: #666;
  font-size: 12px;
}

:deep(.ant-upload.ant-upload-select-picture-card) {
  width: 80px;
  height: 80px;
  margin: 0;
}

:deep(.ant-upload.ant-upload-select-picture-card:hover) {
  border-color: #4096ff;
}
</style>
