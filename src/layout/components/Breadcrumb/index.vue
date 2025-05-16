<template>
  <nav id="breadcrumb-id" class="bg-white p-20px flex items-center border-b">
    <el-breadcrumb separator="/" class="cursor-default">
      <template
        v-if="breadCrumbList.length > 0 && breadCrumbList[0].path !== '/home'"
      >
        <el-breadcrumb-item v-for="item in breadCrumbList" :key="item.path">
          {{ item.meta.title }}
        </el-breadcrumb-item>
      </template>
    </el-breadcrumb>
  </nav>
</template>

<script setup lang="ts">
interface Props {
  asideActivePath: string;
}
withDefaults(defineProps<Props>(), {
  asideActivePath: "/osce",
});

const router = useRouter();

const breadCrumbList = computed(() => {
  // 过滤掉没有meta的
  return router.currentRoute.value.matched.filter((item) => item.meta.title);
});
</script>

<style lang="less" scoped></style>
