<template>
  <div
    id="query-bar-id"
    class="query-bar concern-table"
    :class="hasMarginBottom ? 'mb-10px' : ''"
  >
    <div ref="queryMainRef">
      <el-form
        ref="searchForm"
        :model="queryParams"
        class="query-form"
        :inline="true"
        :rules="rules"
        :label-width="labelWidth"
        @submit.prevent
      >
        <slot name="query-form"></slot>

        <slot name="query-btn">
          <el-form-item class="query-btn-container">
            <el-button
              type="primary"
              @click="onSearch"
              :style="{
                width: btnWidth,
              }"
            >
              查询
            </el-button>
            <el-button
              type="primary"
              plain
              @click="resetForm(searchForm)"
              :style="{
                width: btnWidth,
              }"
            >
              重置
            </el-button>
          </el-form-item>
        </slot>
      </el-form>
    </div>
    <slot name="query-right"></slot>
  </div>
</template>

<script lang="ts" setup>
// TODO 宽度小时，查询栏会换行优化
import type { FormInstance } from "element-plus";
const props = defineProps({
  queryParams: {
    type: Object,
    default: () => {
      return {};
    },
  },
  hasFuzzy: {
    type: Boolean,
    default: true,
  },
  hasDatePicker: {
    type: Boolean,
    default: true,
  },
  hasMarginBottom: {
    type: Boolean,
    default: false,
  },
  rules: {
    type: Object,
    default: () => {
      return {};
    },
  },
  // label宽度（3字-50px、4字-60px、5字-70px、6字-90px）
  labelWidth: {
    type: String,
    default: "",
  },
  btnWidth: {
    type: String,
    default: "120px",
  },
});
const emit = defineEmits(["on-reset", "on-search"]);
const queryParams = toRef(props, "queryParams");
const date = toRef(queryParams.value, "date");
watch(date, () => {
  if (date.value !== null && date.value !== undefined) {
    queryParams.value.startTime = date.value[0];
    queryParams.value.endTime = date.value[1];
  } else {
    queryParams.value.startTime = "";
    queryParams.value.endTime = "";
  }
});
const searchForm = ref<FormInstance>();
const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.resetFields();
  emit("on-reset");
};
const onSearch = () => {
  searchForm.value
    ?.validate()
    .then(() => {
      emit("on-search");
    })
    .catch(() => {});
};

const queryMainRef = ref();
// onMounted(() => {
//   const resizeObserver = new ResizeObserver((entries) => {
//     console.log(entries[0].contentRect.width);
//   });
//   resizeObserver.observe(queryMainRef.value);
// });

/** 向外抛出的重置表单方法 */
const resetFormExp = () => {
  if (!searchForm.value) return;
  searchForm.value.resetFields();
};

defineExpose({
  resetFormExp,
});
</script>

<style lang="less" scoped>
.query-bar {
  @apply bg-white flex justify-between flex items-center flex-nowrap;
}
</style>
