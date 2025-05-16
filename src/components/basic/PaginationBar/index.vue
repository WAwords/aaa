<template>
  <div id="pagination-bar-id" class="pagination-bar-container concern-table">
    <div class="left-container">
      <div v-if="selNum">已选择 {{ selNum }} 条</div>
    </div>

    <el-pagination
      :current-page="current"
      :page-size="size"
      :page-sizes="pageSizes"
      :layout="layout"
      :total="total"
      @size-change="pageSizeChange"
      @current-change="currentPageChange"
      background
    />
  </div>
</template>

<script lang="ts" setup>
const props = defineProps({
  current: {
    type: Number,
    default: 1,
  },
  total: {
    type: Number,
    default: 0,
  },
  size: {
    type: Number,
    default: 10,
  },
  hasSel: {
    type: Boolean,
    default: false,
  },
  /** 选中的条数 */
  selNum: {
    type: Number,
    default: 0,
  },
  pageSizes: {
    type: Array as PropType<number[]>,
    default: () => [10, 50, 100, 150, 200],
  },
  layout: {
    type: String,
    default: "total, sizes, prev, pager, next, jumper",
  },
});
const emit = defineEmits(["on-current-change", "on-size-change"]);
const { current, total, size } = toRefs(props);
const currentPageChange = (val: number) => {
  emit("on-current-change", val);
};
const pageSizeChange = (val: number) => {
  emit("on-size-change", val);
};
</script>

<style lang="less" scoped>
.pagination-bar-container {
  @apply flex items-center justify-between overflow-x-auto flex-none overflow-hidden mt-20px;
  font-size: 14px;
  .left-container {
    @apply flex-none mr-20px;
  }

  -ms-overflow-style: none;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
}

.el-input__suffix {
  right: 12px !important;
}
</style>
