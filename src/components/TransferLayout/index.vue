<template>
  <div class="transfer-wrapper">
    <div class="transfer-item">
      <div class="transfer-header">
        <div class="transfer-title">
          <el-tooltip :content="leftTitle" placement="top" :show-after="1000">
            <slot name="leftHeaderTitle">{{ leftTitle }}</slot>
          </el-tooltip>
        </div>
        <div class="transfer-handle">
          <slot name="leftHeaderHandle"></slot>
        </div>
      </div>

      <div class="transfer-body">
        <slot name="leftBody"></slot>
      </div>

      <div class="transfer-pagination">
        <slot name="leftPagination"></slot>
      </div>

      <div class="transfer-footer">
        <slot name="leftFooter"></slot>
      </div>
    </div>

    <div class="transfer-item">
      <div class="transfer-header">
        <div class="transfer-title">
          <el-tooltip :content="rightTitle" placement="top" :show-after="1000">
            <slot name="rightHeaderTitle">
              {{ rightTitle }}
            </slot>
          </el-tooltip>
        </div>
        <div class="transfer-handle">
          <slot name="rightHeaderHandle"></slot>
        </div>
      </div>

      <div class="transfer-body">
        <slot name="rightBody"></slot>
      </div>

      <div class="transfer-footer">
        <slot name="rightFooter"></slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  leftTitle?: string;
  rightTitle?: string;
}
withDefaults(defineProps<Props>(), {
  leftTitle: "",
  rightTitle: "",
});
</script>

<style scoped lang="less">
.transfer-wrapper {
  @apply flex overflow-hidden;
  border: var(--el-border);
  border-radius: var(--el-border-radius-base);
  .transfer-item {
    @apply flex-none w-1/2 h-600px flex flex-col p-20px overflow-hidden;

    // 中分线
    &:first-child {
      border-right: var(--el-border);
    }

    // 头部
    .transfer-header {
      @apply flex items-center justify-between flex-none overflow-hidden w-full;
      .transfer-title {
        @apply flex-1 truncate;
      }
      .transfer-handle {
        @apply flex-none ml-20px;
      }
    }

    // 主体
    .transfer-body {
      @apply flex-1 mt-20px overflow-hidden;
    }

    // 分页
    .transfer-pagination {
      @apply flex justify-end mt-10px;
    }

    // 底部
    .transfer-footer {
      @apply flex-none flex justify-center items-center flex-none mt-20px;
      ::v-deep(.el-button) {
        width: 180px !important;
      }
    }

    &:first-child {
      .transfer-footer {
        @apply justify-end;
      }
    }
    &:last-child {
      .transfer-footer {
        @apply justify-start;
      }
    }
  }
}
</style>
