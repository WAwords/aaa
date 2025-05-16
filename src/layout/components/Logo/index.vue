<template>
  <div class="container" @click="handleGotoIndex()">
    <div
      class="logo-container flex justify-center"
      :class="isCollapse ? 'opacity-0' : 'opacity-100'"
    >
      <img src="../../../assets/img/logo/cme-mix.png" alt="" class="h-45px" />
    </div>
    <div
      :class="isCollapse ? 'opacity-100' : 'opacity-0'"
      class="logo-container"
    >
      <img src="../../../assets/img/logo/cme.png" alt="" class="h-45px" />
    </div>

    <div class="flex-1 flex justify-end absolute -right-64px"></div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  isCollapse: boolean;
}
withDefaults(defineProps<Props>(), {
  isCollapse: false,
});

const router = useRouter();

/** 跳转首页 */
const handleGotoIndex = () => {
  router.push({ path: "/index" });
};
</script>

<style scoped lang="less">
.container {
  @apply h-60px flex-none flex items-center cursor-pointer justify-center relative;
  border-bottom: 1px solid #00000000;
  .logo-container {
    position: absolute;
    transition: 0.1s;
  }
}
</style>
