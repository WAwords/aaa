<template>
  <div></div>
</template>

<script setup lang="ts">
const router = useRouter();
const route = useRoute();

onBeforeMount(() => {
  let pathTemp = route.path.split("/");
  pathTemp.splice(1, 1);
  let pathList = [pathTemp.join("/")];

  router.replace(pathList[0]);
});
</script>

<style scoped lang="less"></style>
