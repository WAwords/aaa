<template>
  <div ref="container">
    <el-tooltip :content="content" placement="top" :disabled="!isOverflow">
      <div class="tooltip-content" ref="textContent">{{ content }}</div>
    </el-tooltip>

    <!-- 这里主要用于当前文本是否超出的判断 -->
    <div class="inline-block absolute h-0 invisible" ref="absoluteText">
      <span>{{ content }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  content: string;
}
const props = withDefaults(defineProps<Props>(), {
  content: "",
});

const container = ref<any>(null);
const absoluteText = ref<any>(null);
const textContent = ref<any>(null);

/** 是否溢出 */
const isOverflow = ref(false);

const checkOverflow = () => {
  nextTick(() => {
    isOverflow.value =
      absoluteText.value?.offsetWidth > container.value?.offsetWidth;
  });
};

// 这里的监听是为了确保在父组件传递的content发生变化时，重新检查文本是否溢出
watch(
  () => props.content,
  () => {
    nextTick(checkOverflow);
  },
);

onMounted(() => {
  checkOverflow();
  window.addEventListener("resize", checkOverflow);
  textContent.value.addEventListener("mouseover", checkOverflow); // 这是为了解决父组件设置v-show为false，再设置为true时，tooltip不显示的问题（el-select-v2）
});

onUnmounted(() => {
  window.removeEventListener("resize", checkOverflow);
  window.removeEventListener("mouseover", checkOverflow);
});

watch(
  () => props.content,
  () => {
    nextTick(checkOverflow);
  },
);
</script>

<style scoped>
.tooltip-content {
  @apply truncate;
}
</style>
