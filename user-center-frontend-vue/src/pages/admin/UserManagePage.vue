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
    <a-table
      :columns="columns"
      :data-source="data"
      :scroll="{ x: 1240 }"
      table-layout="fixed"
      :pagination="{ pageSize: 5, showSizeChanger: false }"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'avatarUrl'">
          <a-upload
            list-type="picture-card"
            :show-upload-list="false"
            :before-upload="(file: File) => beforeUpload(file, record)"
            :custom-request="(option: Record<string, unknown>) => customUpload(option, record)"
          >
            <div v-if="record.avatarUrl">
              <img
                :src="resolveApiAssetUrl(record.avatarUrl)"
                style="width: 100%"
              />
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
    <a-modal
      v-model:open="cropModalVisible"
      title="裁剪头像"
      ok-text="确认裁剪"
      cancel-text="取消"
      width="760px"
      :confirm-loading="cropSaving"
      @ok="confirmCrop"
      @cancel="closeCropModal"
    >
      <div class="crop-wrap">
        <div
          class="crop-stage"
          @wheel.prevent="onWheelZoom"
          @mousedown="startImageDrag"
        >
          <img
            v-if="cropImageUrl"
            class="stage-image"
            :src="cropImageUrl"
            :style="stageImageStyle"
            draggable="false"
          />
          <div class="crop-overlay" />
          <div
            class="crop-box"
            :style="cropBoxStyle"
            @mousedown.stop="startCropBoxMove"
          >
            <span
              class="crop-handle nw"
              @mousedown.stop="startResizeCropBox('nw', $event)"
            />
            <span
              class="crop-handle ne"
              @mousedown.stop="startResizeCropBox('ne', $event)"
            />
            <span
              class="crop-handle sw"
              @mousedown.stop="startResizeCropBox('sw', $event)"
            />
            <span
              class="crop-handle se"
              @mousedown.stop="startResizeCropBox('se', $event)"
            />
          </div>
        </div>
      </div>
      <div class="crop-controls">
        <div class="control-row">
          <span class="control-label">缩放</span>
          <a-slider
            v-model:value="cropZoom"
            :min="1"
            :max="5"
            :step="0.01"
            @change="onZoomSliderChange"
          />
        </div>
        <div class="crop-tip">
          拖动图片调整位置，滚轮可缩放；拖动裁剪框可移动，拖动四角可调整裁剪大小
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
import { deleteUser, searchUsers, uploadAvatar } from "@/api/user";
import { resolveApiAssetUrl } from "@/request";
import { useLoginUserStore } from "@/store/userLoginUserStore";
import { message } from "ant-design-vue";
import { PlusOutlined } from "@ant-design/icons-vue";
import dayjs from "dayjs";
import { computed, ref } from "vue";

interface UserRecord {
  id?: string;
  username?: string;
  userAccount?: string;
  avatarUrl?: string;
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
const cropModalVisible = ref(false);
const cropSaving = ref(false);
const cropImageUrl = ref("");
const cropTargetUserId = ref("");
const cropZoom = ref(1);
const cropImageNaturalWidth = ref(0);
const cropImageNaturalHeight = ref(0);
const STAGE_WIDTH = 680;
const STAGE_HEIGHT = 420;
const MIN_CROP_SIZE = 80;
const imageX = ref(0);
const imageY = ref(0);
const baseScale = ref(1);
const cropRect = ref({ x: 180, y: 70, width: 260, height: 260 });
const activeDrag = ref<
  | ""
  | "image"
  | "crop-move"
  | "resize-nw"
  | "resize-ne"
  | "resize-sw"
  | "resize-se"
>("");
const dragStart = ref({
  pointerX: 0,
  pointerY: 0,
  imageX: 0,
  imageY: 0,
  cropX: 0,
  cropY: 0,
  cropW: 0,
  cropH: 0,
});

const stageImageStyle = computed(() => {
  const width = cropImageNaturalWidth.value;
  const height = cropImageNaturalHeight.value;
  if (!width || !height) {
    return {};
  }
  const finalScale = baseScale.value * cropZoom.value;
  return {
    position: "absolute",
    left: "0",
    top: "0",
    width: `${width * finalScale}px`,
    height: `${height * finalScale}px`,
    transform: `translate(${imageX.value}px, ${imageY.value}px)`,
  };
});

const cropBoxStyle = computed(() => ({
  left: `${cropRect.value.x}px`,
  top: `${cropRect.value.y}px`,
  width: `${cropRect.value.width}px`,
  height: `${cropRect.value.height}px`,
  boxShadow: `0 0 0 9999px rgba(0,0,0,0.45)`,
}));

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
    message.error("用户 ID 不存在");
    return false;
  }
  const isImage = file.type.startsWith("image/");
  if (!isImage) {
    message.error("只能上传图片文件");
    return false;
  }
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isLt2M) {
    message.error("图片大小不能超过 2MB");
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
    message.error("用户 ID 不存在");
    onError(new Error("userId missing"));
    return;
  }
  try {
    const res = await uploadAvatar(file, record.id);
    if (res.data?.code === 0) {
      message.success("头像上传成功");
      record.avatarUrl = resolveApiAssetUrl(res.data.data);
      onSuccess(res.data);
      try {
        await openCropModal(record.id, record.avatarUrl ?? "");
      } catch (error) {
        message.error("头像已上传，但裁剪弹窗打开失败");
      }
      return;
    }
    message.error(`头像上传失败：${res.data?.description ?? "未知错误"}`);
    onError(new Error("upload failed"));
  } catch (error) {
    message.error("头像上传失败");
    onError(error);
  }
};

const openCropModal = async (userId: string, imageUrl: string) => {
  const normalizedUrl = resolveApiAssetUrl(imageUrl);
  const image = new Image();
  image.crossOrigin = "anonymous";
  image.src = normalizedUrl;
  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error("image load failed"));
  });
  cropImageNaturalWidth.value = image.naturalWidth || 0;
  cropImageNaturalHeight.value = image.naturalHeight || 0;
  cropImageUrl.value = normalizedUrl;
  cropTargetUserId.value = userId;

  baseScale.value = Math.min(
    STAGE_WIDTH / cropImageNaturalWidth.value,
    STAGE_HEIGHT / cropImageNaturalHeight.value
  );
  cropZoom.value = 1;
  imageX.value =
    (STAGE_WIDTH - cropImageNaturalWidth.value * baseScale.value) / 2;
  imageY.value =
    (STAGE_HEIGHT - cropImageNaturalHeight.value * baseScale.value) / 2;
  cropRect.value = { x: 180, y: 70, width: 260, height: 260 };
  cropModalVisible.value = true;
};

const closeCropModal = (force = false) => {
  if (cropSaving.value && !force) {
    return;
  }
  stopDragging();
  cropModalVisible.value = false;
  cropImageUrl.value = "";
  cropTargetUserId.value = "";
};

const buildCroppedFile = async () => {
  const image = new Image();
  image.crossOrigin = "anonymous";
  image.src = cropImageUrl.value;
  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error("image load failed"));
  });

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(cropRect.value.width);
  canvas.height = Math.round(cropRect.value.height);
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("canvas unavailable");
  }
  const finalScale = baseScale.value * cropZoom.value;
  const sourceX = (cropRect.value.x - imageX.value) / finalScale;
  const sourceY = (cropRect.value.y - imageY.value) / finalScale;
  const sourceW = cropRect.value.width / finalScale;
  const sourceH = cropRect.value.height / finalScale;
  ctx.drawImage(
    image,
    sourceX,
    sourceY,
    sourceW,
    sourceH,
    0,
    0,
    canvas.width,
    canvas.height
  );

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((result) => resolve(result), "image/png");
  });
  if (!blob) {
    throw new Error("blob build failed");
  }
  return new File([blob], "avatar-cropped.png", { type: "image/png" });
};

const onZoomSliderChange = (value: number) => {
  cropZoom.value = value;
};

const onWheelZoom = (event: WheelEvent) => {
  const next = cropZoom.value + (event.deltaY > 0 ? -0.08 : 0.08);
  cropZoom.value = Math.min(5, Math.max(1, next));
};

const startImageDrag = (event: MouseEvent) => {
  if (activeDrag.value) {
    return;
  }
  activeDrag.value = "image";
  dragStart.value = {
    ...dragStart.value,
    pointerX: event.clientX,
    pointerY: event.clientY,
    imageX: imageX.value,
    imageY: imageY.value,
  };
  window.addEventListener("mousemove", onDragging);
  window.addEventListener("mouseup", stopDragging);
};

const startCropBoxMove = (event: MouseEvent) => {
  activeDrag.value = "crop-move";
  dragStart.value = {
    ...dragStart.value,
    pointerX: event.clientX,
    pointerY: event.clientY,
    cropX: cropRect.value.x,
    cropY: cropRect.value.y,
  };
  window.addEventListener("mousemove", onDragging);
  window.addEventListener("mouseup", stopDragging);
};

const startResizeCropBox = (
  direction: "nw" | "ne" | "sw" | "se",
  event: MouseEvent
) => {
  activeDrag.value = `resize-${direction}`;
  dragStart.value = {
    ...dragStart.value,
    pointerX: event.clientX,
    pointerY: event.clientY,
    cropX: cropRect.value.x,
    cropY: cropRect.value.y,
    cropW: cropRect.value.width,
    cropH: cropRect.value.height,
  };
  window.addEventListener("mousemove", onDragging);
  window.addEventListener("mouseup", stopDragging);
};

const onDragging = (event: MouseEvent) => {
  const deltaX = event.clientX - dragStart.value.pointerX;
  const deltaY = event.clientY - dragStart.value.pointerY;
  if (activeDrag.value === "image") {
    imageX.value = dragStart.value.imageX + deltaX;
    imageY.value = dragStart.value.imageY + deltaY;
    return;
  }
  if (activeDrag.value === "crop-move") {
    const nextX = dragStart.value.cropX + deltaX;
    const nextY = dragStart.value.cropY + deltaY;
    cropRect.value.x = Math.max(
      0,
      Math.min(STAGE_WIDTH - cropRect.value.width, nextX)
    );
    cropRect.value.y = Math.max(
      0,
      Math.min(STAGE_HEIGHT - cropRect.value.height, nextY)
    );
    return;
  }
  const startX = dragStart.value.cropX;
  const startY = dragStart.value.cropY;
  const startW = dragStart.value.cropW;
  const startH = dragStart.value.cropH;
  if (activeDrag.value === "resize-nw") {
    const nextX = Math.max(
      0,
      Math.min(startX + startW - MIN_CROP_SIZE, startX + deltaX)
    );
    const nextY = Math.max(
      0,
      Math.min(startY + startH - MIN_CROP_SIZE, startY + deltaY)
    );
    cropRect.value.x = nextX;
    cropRect.value.y = nextY;
    cropRect.value.width = startW + (startX - nextX);
    cropRect.value.height = startH + (startY - nextY);
    return;
  }
  if (activeDrag.value === "resize-ne") {
    const nextRight = Math.max(
      startX + MIN_CROP_SIZE,
      Math.min(STAGE_WIDTH, startX + startW + deltaX)
    );
    const nextY = Math.max(
      0,
      Math.min(startY + startH - MIN_CROP_SIZE, startY + deltaY)
    );
    cropRect.value.y = nextY;
    cropRect.value.width = nextRight - startX;
    cropRect.value.height = startH + (startY - nextY);
    return;
  }
  if (activeDrag.value === "resize-sw") {
    const nextX = Math.max(
      0,
      Math.min(startX + startW - MIN_CROP_SIZE, startX + deltaX)
    );
    const nextBottom = Math.max(
      startY + MIN_CROP_SIZE,
      Math.min(STAGE_HEIGHT, startY + startH + deltaY)
    );
    cropRect.value.x = nextX;
    cropRect.value.width = startW + (startX - nextX);
    cropRect.value.height = nextBottom - startY;
    return;
  }
  if (activeDrag.value === "resize-se") {
    const nextRight = Math.max(
      startX + MIN_CROP_SIZE,
      Math.min(STAGE_WIDTH, startX + startW + deltaX)
    );
    const nextBottom = Math.max(
      startY + MIN_CROP_SIZE,
      Math.min(STAGE_HEIGHT, startY + startH + deltaY)
    );
    cropRect.value.width = nextRight - startX;
    cropRect.value.height = nextBottom - startY;
  }
};

const stopDragging = () => {
  activeDrag.value = "";
  window.removeEventListener("mousemove", onDragging);
  window.removeEventListener("mouseup", stopDragging);
};

const confirmCrop = async () => {
  if (!cropTargetUserId.value || !cropImageUrl.value) {
    return;
  }
  cropSaving.value = true;
  try {
    const croppedFile = await buildCroppedFile();
    const res = await uploadAvatar(croppedFile, cropTargetUserId.value);
    if (res.data?.code === 0) {
      const finalUrl = resolveApiAssetUrl(res.data.data);
      const target = data.value.find(
        (item) => item.id === cropTargetUserId.value
      );
      if (target) {
        target.avatarUrl = finalUrl;
      }
      message.success("头像裁剪并保存成功");
      closeCropModal(true);
      return;
    }
    message.error(`裁剪保存失败：${res.data?.description ?? "未知错误"}`);
  } catch (error) {
    message.error("裁剪保存失败，请稍后重试");
  } finally {
    cropSaving.value = false;
  }
};

const onSearch = () => {
  fetchData(searchValue.value);
};

const onClear = () => {
  fetchData();
};

const columns = [
  { title: "用户名", dataIndex: "username", width: 180 },
  { title: "账号", dataIndex: "userAccount", width: 240 },
  { title: "头像", dataIndex: "avatarUrl", width: 220 },
  { title: "创建时间", dataIndex: "createTime", width: 280 },
  { title: "角色", dataIndex: "userRole", width: 180 },
  { title: "操作", key: "action", width: 140 },
];

const fetchData = async (username = "") => {
  try {
    const res = await searchUsers(username);
    if (res.data?.code === 0) {
      data.value = (res.data.data || []).map((item: UserRecord) => ({
        ...item,
        avatarUrl: resolveApiAssetUrl(item.avatarUrl),
      }));
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

.crop-wrap {
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
}

.crop-stage {
  width: 680px;
  height: 420px;
  overflow: hidden;
  border-radius: 6px;
  background: #b4b4b4;
  position: relative;
  cursor: grab;
}

.crop-stage:active {
  cursor: grabbing;
}

.stage-image {
  position: absolute;
  left: 0;
  top: 0;
  transform-origin: top left;
  user-select: none;
  -webkit-user-drag: none;
}

.crop-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.crop-box {
  position: absolute;
  border: 2px solid #fff;
  cursor: move;
}

.crop-handle {
  position: absolute;
  width: 12px;
  height: 12px;
  border: 2px solid #fff;
  border-radius: 50%;
  background: #1677ff;
}

.crop-handle.nw {
  left: -7px;
  top: -7px;
  cursor: nwse-resize;
}

.crop-handle.ne {
  right: -7px;
  top: -7px;
  cursor: nesw-resize;
}

.crop-handle.sw {
  left: -7px;
  bottom: -7px;
  cursor: nesw-resize;
}

.crop-handle.se {
  right: -7px;
  bottom: -7px;
  cursor: nwse-resize;
}

.crop-controls {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.control-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.control-label {
  width: 40px;
  color: #666;
  font-size: 13px;
}

.crop-tip {
  color: #666;
  font-size: 12px;
}
</style>
