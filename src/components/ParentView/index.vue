<template>
  <router-view v-slot="{ Component }">
    <keep-alive :include="tagsViewStore.tagsViewNameList">
      <component :is="Component" :key="thisKey" />
    </keep-alive>
  </router-view>
</template>

<script setup lang="ts">
// 这个组件用来包裹展示路由的组件（路由页面缓存在这里做）
import { useTagsViewStore } from "@/store";

const tagsViewStore = useTagsViewStore();

const thisKey = computed(() => {
  let cacheTime = tagsViewStore.dynamicTagList.find(
    (item) => item.path === route.path,
  )?.time;

  if (cacheTime) {
    return `${route.path}${cacheTime}`;
  } else {
    return `${route.path}${new Date().getTime()}`;
  }
});
const route = useRoute();
</script>
