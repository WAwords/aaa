<template>
  <el-form-item :label="label">
    <slot></slot>
  </el-form-item>
</template>

<script setup lang="ts">
interface Props {
  label?: string;
}

const props = withDefaults(defineProps<Props>(), {
  label: "",
});
</script>

<style scoped lang="less">
/** =============== 样式覆盖 begin =============== */
.el-form-item {
  @apply w-360px inline-flex pl-20px;
  box-shadow: 0 0 0 1px var(--el-input-border-color, var(--el-border-color));
  border-radius: var(--el-border-radius-base);
  ::v-deep(.el-form-item__label) {
    @apply h-full font-bold flex-none flex justify-end p-0;
  }
  ::v-deep(.el-form-item__content) {
    @apply flex-1;
    > :first-child {
      width: 100% !important;
    }
  }
}

// 输入框
::v-deep(.el-input__wrapper) {
  box-shadow: unset;
}

// 选择框
::v-deep(.el-select__wrapper) {
  box-shadow: unset;
  background-color: unset;
  &.is-hovering {
    box-shadow: unset;
  }
}
/** =============== 样式覆盖 end =============== */
</style>
