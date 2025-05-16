<template>
  <div class="level-list-item-container" :class="{ active }">
    <div class="title-container truncate">
      <el-tooltip
        class="box-item"
        :content="title"
        placement="top"
        :show-after="1000"
      >
        <div class="truncate">{{ title }}</div>
      </el-tooltip>
    </div>
    <div class="btn-container">
      <slot name="btn"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title?: string;
  active?: boolean;
}
withDefaults(defineProps<Props>(), {
  title: "",
  active: false,
});
</script>

<style scoped lang="less">
.level-list-item-container {
  @apply flex w-full h-50px px-20px duration-200 cursor-pointer overflow-hidden flex justify-between;
  border-radius: var(--el-border-radius-small);

  // 标题容器
  .title-container {
    @apply flex items-center;
  }

  // 按钮容器
  .btn-container {
    @apply h-full w-0 overflow-hidden flex items-center flex-none pl-10px;
    transition: width 0.3s;
  }

  &:nth-of-type(odd) {
    background-color: var(--el-fill-color-lighter);
  }

  &.active {
    @apply font-bold;
    background-color: var(--el-color-primary-light-9);
    color: var(--el-color-primary);
  }
}

.level-list-item-container:hover {
  background-color: var(--el-fill-color-light);
  .btn-container {
    width: 90px;
  }
}
</style>
