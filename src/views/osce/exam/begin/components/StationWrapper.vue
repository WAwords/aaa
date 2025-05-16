<template>
  <div class="flex flex-col flex-none">
    <el-scrollbar>
      <div class="station-wrapper">
        <StationItem v-for="i in tempStationList" :data="i" :mode="mode" />
      </div>
    </el-scrollbar>

    <div class="footer-wrapper">
      <div class="pagination-wrapper">
        <el-pagination
          background
          layout="pager"
          :total="stationList.length"
          :page-size="4"
          @current-change="handleCurrentPageChange"
          :current-page="currentPage"
        />

        <div class="full-btn" @click="$emit('fullscreen')">
          <Icon icon="ant-design:fullscreen-outlined" size="18px" />
        </div>
      </div>
      <slot name="extra-btn"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import StationItem from "./StationItem.vue";

interface Props {
  stationList: any[];
  mode?: "fixed" | "unfixed";
}
const props = withDefaults(defineProps<Props>(), {
  mode: "unfixed",
});

/** 每页展示内容分割 */
const tempStationList = computed(() => {
  return props.stationList.slice(
    (currentPage.value - 1) * 4,
    currentPage.value * 4,
  );
});

/** 当前页 */
const currentPage = ref(1);

/** 分页改变 */
const handleCurrentPageChange = (val: number) => {
  currentPage.value = val;
};

defineEmits(["fullscreen"]);

/** 重置当前页 */
const resetCurrentPage = () => {
  currentPage.value = 1;
};

defineExpose({
  resetCurrentPage,
});
</script>

<style scoped lang="less">
.station-wrapper {
  display: grid;
  grid-template-columns: repeat(4, minmax(300px, 1fr));
  grid-gap: 20px;
}

.footer-wrapper {
  @apply mt-20px flex items-center justify-between;
  .pagination-wrapper {
    @apply flex items-center;
  }
}

.full-btn {
  @apply h-32px w-32px flex justify-center items-center ml-4px cursor-pointer;
  border-radius: var(--el-border-radius-base);
  background-color: var(--el-fill-color-lighter);
  &:hover {
    color: var(--el-color-primary);
  }
}
</style>
