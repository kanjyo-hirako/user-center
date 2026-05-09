<template>
  <div id="userManagePage">
    <a-input-search
      style="max-width: 320px; margin-bottom: 20px"
      v-model:value="searchValue"
      placeholder="Search username"
      enter-button="Search"
      size="large"
      @search="onSearch"
    />
    <a-table :columns="columns" :data-source="data">
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'avatarUrl'">
          <a-image :src="record.avatarUrl" :width="80" />
        </template>

        <template v-else-if="column.dataIndex === 'userRole'">
          <div v-if="record.userAccount === 'admin'">
            <a-tag color="green">Admin</a-tag>
          </div>
          <div v-else>
            <a-tag color="blue">User</a-tag>
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
            >Delete</a-button
          >
        </template>
      </template>
    </a-table>
  </div>
</template>

<script lang="ts" setup>
import { deleteUser, searchUsers } from "@/api/user";
import { useLoginUserStore } from "@/store/userLoginUserStore";
import { message } from "ant-design-vue";
import dayjs from "dayjs";
import { ref } from "vue";

const loginUserStore = useLoginUserStore();
const searchValue = ref("");
const data = ref([]);

const doDelete = async (id: string) => {
  if (loginUserStore.loginUser.userAccount !== "admin") {
    message.error("error: 权限不足");
    return;
  }
  if (!id) {
    return;
  }
  try {
    const res = await deleteUser(id);
    if (res.data?.code === 0) {
      message.success("Delete success");
      await fetchData(searchValue.value);
      return;
    }
    if (res.data?.code === 40101) {
      message.error("error: permission denied");
      return;
    }
    message.error(`Delete failed: ${res.data?.description ?? "Unknown error"}`);
  } catch (error) {
    message.error("error: permission denied");
  }
};

const onSearch = () => {
  fetchData(searchValue.value);
};

const columns = [
  { title: "id", dataIndex: "id" },
  { title: "username", dataIndex: "username" },
  { title: "account", dataIndex: "userAccount" },
  { title: "avatar", dataIndex: "avatarUrl" },
  { title: "gender", dataIndex: "gender" },
  { title: "createTime", dataIndex: "createTime" },
  { title: "role", dataIndex: "userRole" },
  { title: "action", key: "action" },
];

const fetchData = async (username = "") => {
  const res = await searchUsers(username);
  if (res.data?.code === 0) {
    data.value = res.data.data || [];
    return;
  }
  message.error(
    `Load users failed: ${res.data?.description ?? "Unknown error"}`
  );
};

fetchData();
</script>
