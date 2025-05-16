<template>
  <div
    class="level-list-container"
    :style="{
      width,
      'border-right': border ? '1px solid var(--el-border-color)' : '',
    }"
  >
    <div class="header">
      <div class="title">
        <span>{{ title }}</span>
      </div>
      <div class="btn">
        <!-- 按钮插槽 -->
        <slot name="btn"></slot>
      </div>
    </div>
    <el-scrollbar v-loading="loading">
      <!-- 列表插槽 -->
      <slot name="list">
        <div class="h-full flex justify-center items-center">
          <el-empty description="暂无数据" />
        </div>
      </slot>
    </el-scrollbar>
  </div>
</template>

<script setup lang="ts">
interface Props {
  /** 列表加载状态 */
  loading?: boolean;
  title: string;
  border?: boolean;
  width?: string;
}
withDefaults(defineProps<Props>(), {
  loading: false,
  title: "",
  border: true,
  width: "360px",
});

// const listLength = ref<number>(0);
// const slots = useSlots();
// /** 监听插槽内元素数量，这需要特别注意，因为注释也算！（要使用这个的话，最好在插槽中放入的内容只有 v-for 出的内容） */
// watchEffect(() => {
//   let tempLength = slots.list?.()[0]?.children?.length;
//   if (isNumber(tempLength)) {
//     listLength.value = tempLength;
//   } else {
//     listLength.value = 0;
//   }
// });
</script>

<style scoped lang="less">
/** 主内容 */
.level-list-container {
  @apply bg-white flex flex-col overflow-hidden p-10px flex-none h-full;
  .header {
    @apply flex justify-between flex-none pb-10px h-50px;
    .title {
      @apply flex-none flex items-center font-bold;
    }
    .btn {
      @apply flex items-center;
    }
  }
}
</style>
