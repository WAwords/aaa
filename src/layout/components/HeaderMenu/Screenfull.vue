<template>
  <!-- <el-button text @click="handleScreenChange">
    <el-icon
      ><Icon
        :icon="
          isFullscreen
            ? 'ant-design:fullscreen-exit-outlined'
            : 'ant-design:fullscreen-outlined'
        "
    /></el-icon>
  </el-button> -->
  <div @click="handleScreenChange">
    <img
      v-if="isFullscreen"
      class="img-btn"
      src="@/assets/img/osce/layout/screenfull-exit.png"
      fit="contain"
    />
    <img
      v-else
      class="img-btn"
      src="@/assets/img/osce/layout/screenfull.png"
      fit="contain"
    />
  </div>
</template>

<script setup lang="ts">
// https://www.npmjs.com/package/screenfull
import screenfull from "screenfull";

const isFullscreen = ref(false);

onMounted(() => {
  isFullscreen.value = screenfull.isFullscreen;
});

screenfull.onchange(() => {
  isFullscreen.value = screenfull.isFullscreen;
});

const handleScreenChange = () => {
  if (screenfull.isEnabled) {
    screenfull.toggle();
    isFullscreen.value = !isFullscreen.value;
  }
};
</script>

<style scoped lang="less"></style>
