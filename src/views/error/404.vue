<template>
  <div class="page-container">
    <img class="w-400px" src="@/assets/img/error/404.png" alt="404" />
    <div class="describe">
      <h3 class="text-2xl font-bold text-gray-500 text-center">
        抱歉，你访问的页面不存在。
      </h3>
      <!-- <span class="text-sm text-gray-500">
        尝试检查URL的错误，然后按浏览器上的刷新按钮或尝试在我们的应用程序中找到其他内容。
      </span> -->
    </div>
    <el-button class="mt-4" type="primary" @click="$router.replace('/')">
      返回首页
    </el-button>
  </div>
</template>

<script setup lang="ts"></script>

<style lang="less" scoped>
.page-container {
  @apply h-full w-full flex justify-center items-center flex-col;
  .describe {
    @apply mt-4 w-350px;
  }
}
</style>
