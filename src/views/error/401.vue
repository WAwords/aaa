<template>
  <div class="page-container">
    <img class="w-400px" src="@/assets/img/error/401.png" alt="401" />
    <div class="describe">
      <h3 class="text-2xl font-bold text-gray-500 text-center">
        401错误，您没有权限访问
      </h3>
    </div>
    <div class="mt-4">
      <el-button type="primary" @click="$router.go(-1)"> 返回 </el-button>
      <el-button type="primary" @click="handleLogout"> 重新登陆 </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from "@/store/modules/user";

const router = useRouter();
const handleLogout = () => {
  const userStore = useUserStore();
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
