<template>
  <div id="action-bar-id" class="action-wrapper concern-table">
    <div class="flex flex-nowrap">
      <el-space>
        <slot></slot>
      </el-space>
    </div>
    <div>
      <slot name="right"></slot>
      <el-popover
        placement="bottom"
        width="80"
        trigger="click"
        v-if="hasFilterBtn"
      >
        <template #reference>
          <el-button text>
            <el-icon><Icon icon="ant-design:filter-outlined" /></el-icon>
          </el-button>
        </template>
        <el-scrollbar max-height="200px">
          <el-checkbox-group
            v-model="selectedHeader"
            @change="handleSelectChange"
          >
            <div class="flex flex-col">
              <el-checkbox
                :label="i.prop"
                :value="i.prop"
                v-for="i in headerList"
              >
                {{ i.label }}
              </el-checkbox>
            </div>
          </el-checkbox-group>
        </el-scrollbar>
      </el-popover>
      <el-button v-if="hasReloadBtn" text @click="emit('on-reload')">
        <el-icon><Refresh /></el-icon>
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Refresh } from "@element-plus/icons-vue";
interface Props {
  hasReloadBtn?: boolean;
  hasFilterBtn?: boolean;
  headerList?: HeaderItem[];
  /** 已选表头 */
  headerSelected?: string[];
}
const props = withDefaults(defineProps<Props>(), {
  hasReloadBtn: true,
  hasFilterBtn: false,
  headerList: () => [],
  headerSelected: () => [],
});

/** 表头控制 */
const selectedHeader = ref<string[]>([]);
/** 初始化表头 */
if (props.headerSelected!.length > 0) {
  selectedHeader.value = props.headerSelected!;
} else {
  selectedHeader.value = props.headerList
    .filter((item) => item.visible === true)
    .map((item) => item.prop);
}

watch(
  () => selectedHeader.value,
  (newVal) => {
    emit("on-headerchange", newVal);
  },
);

/** 列显隐改变 */
const handleSelectChange = () => {
  let tempHeader = props.headerList.map((item) => {
    if (selectedHeader.value.includes(item.prop)) {
      item.visible = true;
    } else {
      item.visible = false;
    }
    return item;
  });

  emit("update:headerList", tempHeader);
};
const emit = defineEmits(["on-reload", "on-headerchange", "update:headerList"]);

type HeaderItem = { prop: string; label: string; visible?: boolean };
</script>

<style scoped lang="less">
.action-wrapper {
  @apply flex items-center justify-between bg-white flex-nowrap mb-20px;
}
</style>
