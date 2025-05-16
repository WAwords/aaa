<template>
  <div>
    <table class="table" v-if="tableType">
      <colgroup>
        <template v-if="tableType === '1'">
          <col width="30%" />
          <col width="70%" />
        </template>
        <template v-else>
          <col width="100%" />
        </template>
        <col width="50px" />
      </colgroup>
      <tbody>
        <template v-for="(item, index) in data">
          <tr>
            <!-- 活动列 -->
            <template
              v-for="key in Object.keys(item).sort().slice(0, -1)"
              v-if="tableType === '1'"
            >
              <td :rowspan="getRowSpan(key, index)" v-if="colShow(key, index)">
                <div
                  class="content"
                  :class="
                    key === 'score' ? 'flex justify-center items-center' : ''
                  "
                >
                  {{ item[key].content }}
                </div>
                <!-- 组显示 -->
                <div class="group-num cursor-default" v-if="item[key].group">
                  {{ item[key].group }}
                </div>
              </td>
            </template>
            <td>
              <div class="content">
                {{ item[maxLevel].content }}
              </div>
              <!-- 组显示 -->
              <div class="group-num cursor-default" v-if="item[maxLevel].group">
                {{ item[maxLevel].group }}
              </div>
            </td>
            <!-- 分值 -->
            <td>
              <div
                class="flex justify-center items-center"
                style="color: var(--el-color-danger)"
              >
                {{ item[maxLevel].score }}
              </div>
            </td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { getLevelNum } from "./utils.ts";

interface Props {
  data?: any[];
  /** 表格类型（与列数相关） */
  tableType?: "0" | "1" | "2" | "3";
}
const props = withDefaults(defineProps<Props>(), {
  data: () => [],
  tableType: "0",
});

/**
 * 获取rowspan（配合colShow实现单元格合并）
 * @param level 层级
 * @param index 行索引
 */
const getRowSpan = (level: string, index: number) => {
  let count = 1; // 初始化合并行数为1
  // 从当前行开始，向后寻找相同value的行，并增加合并行数
  for (let i = index + 1; i < props.data.length; i++) {
    let levelNum = getLevelNum(level);

    // 最后层level不需要合并
    if (levelNum === +props.tableType!) {
      break;
    }

    let tag = true;
    for (let j = levelNum; j >= 0; j--) {
      if (
        props.data[index][`level_${j}`].content !==
          props.data[i][`level_${j}`].content ||
        props.data[index][`level_${j}`].content === ""
      ) {
        tag = false;
      }
    }

    // 默认会++，但只要content为空或者当前遍历到的单元格与使用getRowSpan的content不同，则不++
    if (tag) {
      count++;
    }
  }
  return count;
};

/** 设置单元格是否隐藏（配合getRowSpan实现单元格合并效果）
 * @param level 层级
 * @param index 行索引
 */
const colShow = (level: string, index: number) => {
  if (index === 0) return true;

  let levelNum = getLevelNum(level);

  let tag = true;
  for (let j = levelNum; j >= 0; j--) {
    if (
      props.data[index][`level_${j}`].content !==
        props.data[index - 1][`level_${j}`].content ||
      props.data[index][`level_${j}`].content === ""
    ) {
      tag = false;
    }
  }

  if (tag) {
    return false;
  }

  return true;
};

/** 最大层level prop */
const maxLevel = computed(() => {
  if (props.data.length === 0) return "";
  return getRowMaxLevelProp(props.data[0]);
});
</script>

<style scoped lang="less">
.table {
  @apply bg-white border w-full;
  table-layout: fixed;
  td {
    @apply border px-10px h-40px;
    .content {
      white-space: pre-wrap;
      word-break: break-all;

      &.has-group {
        padding-right: 20px;
      }
    }
  }
}

td {
  @apply relative;

  .group-num {
    @apply absolute top-0 right-0 border-l border-b w-20px flex justify-center items-center;
    background-color: var(--el-color-primary-light-9);
    color: var(--el-color-primary);
  }
}
</style>
