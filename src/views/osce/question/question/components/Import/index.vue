<template>
  <el-button type="primary" plain @click="handleImport" :size="size">
    {{ title }}
    <template #icon>
      <Icon icon="ant-design:cloud-upload-outlined" size="15px" />
    </template>
  </el-button>

  <el-dialog
    v-model="importDialogVisible"
    :title="title"
    width="500px"
    destroy-on-close
    :close-on-click-modal="false"
    align-center
  >
    <div class="import-step-container">
      <div class="step-title">第一步：下载导入模板</div>
      <div class="step-content">
        <div>下载模板后请不要改变格式</div>
        <el-button type="primary" @click="emit('download')" class="mt-10px">
          模板下载
          <template #icon>
            <Icon icon="ant-design:cloud-download-outlined" size="15px" />
          </template>
        </el-button>
      </div>
    </div>
    <div class="import-step-container mt-20px">
      <div class="step-title">第二步：导入数据</div>
      <div class="step-content">
        <el-upload
          ref="uploadRef"
          drag
          accept=".xls, .xlsx"
          :auto-upload="false"
          :limit="1"
          :on-change="onFileChange"
          :on-exceed="onFileExceed"
          :on-remove="onRemove"
        >
          <div class="upload-icon">
            <Icon icon="ant-design:cloud-upload-outlined" size="70px" />
          </div>
          <div class="el-upload__text">
            拖动文件到这里或者
            <em>点击上传</em>
          </div>
          <template #tip>
            <div class="el-upload__tip"></div>
          </template>
        </el-upload>
      </div>
    </div>

    <template #footer>
      <span class="dialog-footer">
        <el-button type="primary" plain @click="importDialogVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="handleUpload"> 提交 </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import type { UploadFile, UploadFiles } from "element-plus";

interface Props {
  title?: string;
  size?: "large" | "default" | "small";
}

withDefaults(defineProps<Props>(), {
  title: "导入",
  size: "default",
});

const importDialogVisible = ref(false);
const handleImport = () => {
  importDialogVisible.value = true;
};

const emit = defineEmits(["confirm", "download"]);

const uploadRef = ref();
/** 文件列表 */
const fileList = ref<UploadFiles>([]);
/** 文件发生改变 */
const onFileChange = (uploadFile: UploadFile, uploadFiles: UploadFiles) => {
  uploadFile;
  fileList.value = uploadFiles;
};
/** 文件超出数量 */
const onFileExceed = (val: any) => {
  uploadRef.value.clearFiles();
  uploadRef.value.handleStart(val[0]);
};
const onRemove = () => {
  fileList.value = [];
};

/** 上传 */
const handleUpload = () => {
  if (fileList.value.length === 0) {
    return CmeMessage({
      title: "提示",
      message: "请先上传文件",
      type: "warning",
    });
  }
  importDialogVisible.value = false;
  emit("confirm", fileList.value);
};

defineExpose({
  importDialogVisible,
});
</script>

<style scoped lang="less">
.import-step-container {
  .step-title {
    @apply font-bold;
    font-size: var(--el-font-size-medium);
  }

  .step-content {
    @apply mt-10px p-10px;
    background-color: var(--el-fill-color-lighter);
    border-radius: var(--el-border-radius-base);
    color: var(--el-text-color-secondary);
    .upload-icon {
      @apply flex justify-center items-center;
      color: var(--el-text-color-secondary);
    }
  }
}

::v-deep(.el-upload-dragger) {
  background-color: unset;
  &:hover {
    .upload-icon {
    }
  }
}
</style>
