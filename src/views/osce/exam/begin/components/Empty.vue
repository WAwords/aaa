<template>
  <div class="empty-wrapper"> 考试暂未开始 </div>
</template>

<script setup lang="ts"></script>

<style scoped lang="less">
.empty-wrapper {
  @apply h-full flex justify-center items-center text-24px font-bold tracking-4px;
  background-color: var(--el-fill-color-lighter);
  border-radius: var(--el-border-radius-base);
}
</style>
