<template>
  <div class="page-container">
    <img
      class="w-400px"
      src="@/assets/img/error/unsupported.png"
      alt="unsupported"
    />
    <div class="describe">
      <h3 class="text-2xl font-bold text-gray-500 text-center">
        当前用户暂不支持浏览
      </h3>
    </div>
    <el-button
      class="w-120px mt-5px"
      type="primary"
      @click="handleLogoutClick()"
    >
      退出
    </el-button>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from "@/store/modules/user";

const router = useRouter();

const userStore = useUserStore();
const handleLogoutClick = () => {
  userStore
    .logout()
    .then(() => {
      router.replace("/login");
    })
    .catch(() => {});
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
