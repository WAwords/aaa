<template>
  <div class="page-container">
    <img class="w-400px" src="@/assets/img/error/offline.png" alt="offline" />
    <div class="describe">
      <h3 class="text-2xl font-bold text-gray-500 text-center">
        链接断开，请检查网络。
      </h3>
    </div>
    <el-button class="mt-4" type="primary" @click="handleReloadClick()">
      刷新
    </el-button>
  </div>
</template>

<script setup lang="ts">
const router = useRouter();
const route = useRoute();

const handleReloadClick = () => {
  router.replace(route.query.redirect + "");
};
</script>

<style lang="less" scoped>
.page-container {
  @apply h-full w-full flex justify-center items-center flex-col;
  .describe {
    @apply mt-4 w-350px;
  }
}
</style>
