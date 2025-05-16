<template>
  <div class="room-view-container">
    <Building v-model:building-id="buildingId" v-model:floor-id="floorId" />
    <Floor v-model:building-id="buildingId" v-model:floor-id="floorId" />
    <Room v-model:building-id="buildingId" v-model:floor-id="floorId" />
  </div>
</template>

<script lang="ts" setup>
import Building from "./components/building.vue";
import Floor from "./components/floor.vue";
import Room from "./components/room.vue";

defineOptions({
  name: "SystemManagementRoom",
});

const buildingId = ref<number>();
const floorId = ref<number>();
watch(buildingId, () => {
  floorId.value = undefined;
});
</script>

<style lang="less" scoped>
.room-view-container {
  @apply h-full w-full flex box-border overflow-hidden;
  border: var(--el-border);
  border-radius: var(--el-border-radius-base);
  font-size: var(--el-font-size-base);
  color: var(--el-text-color-regular);
}
</style>
