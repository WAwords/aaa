<template>
  <div>
    <!-- 弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      title="成绩详情"
      destroy-on-close
      align-center
      :fullscreen="dialogFullscreen"
    >
      <el-scrollbar v-loading="dialogLoading" class="detail-wrapper">
        <el-collapse class="w-full">
          <el-collapse-item
            v-for="(item, index) in detailList"
            :title="item.skillName"
            :name="index + 1"
          >
            <template #title>
              <div class="w-full bg-white text-left">
                <span class="font-bold">{{ item.skillName }} </span>
              </div>
            </template>
            <!-- 得分项 -->
            <div>
              <div class="font-bold score-all">
                考生得分：
                <span class="score">
                  {{ numberRound(item.score, 2) }}
                </span>
              </div>
              <div class="table-tag">
                <div class="table-tag-label">评分项</div>
                <div class="table-tag-content">
                  最终评分：
                  <span class="score">
                    {{ numberRound(item.scoringScore, 2) }}
                  </span>
                </div>
              </div>
              <div>
                <el-table
                  :data="item.scoringItems"
                  class="w-full"
                  style="height: 100%"
                  border
                  :span-method="(val) => scoringSpanMethod(val, item)"
                  show-summary
                  :summary-method="getSummariesScoring"
                >
                  <template #empty>
                    <el-empty description="暂无数据" />
                  </template>

                  <el-table-column
                    v-for="(_, levelIndex) in +item.scoringItemsType"
                    :label="
                      headerListContainer[item.scoringItemsType][levelIndex]
                    "
                    min-width="250px"
                    show-overflow-tooltip
                    :resizable="false"
                  >
                    <template #default="{ row }">
                      {{ row[`level_${levelIndex}`].content }}
                    </template>
                  </el-table-column>

                  <el-table-column
                    :prop="`level_${item.scoringItemsType}.content`"
                    label="操作内容"
                    min-width="250px"
                    show-overflow-tooltip
                    :resizable="false"
                  />
                  <el-table-column
                    :prop="`level_${item.scoringItemsType}.rule`"
                    label="评分细则"
                    min-width="250px"
                    show-overflow-tooltip
                    :resizable="false"
                  />
                  <el-table-column
                    :prop="`level_${item.scoringItemsType}.score`"
                    label="分值"
                    min-width="75px"
                    show-overflow-tooltip
                    :resizable="false"
                    align="center"
                  />
                  <el-table-column
                    label="主考扣分"
                    min-width="85px"
                    show-overflow-tooltip
                    :resizable="false"
                    align="center"
                  >
                    <template #default="{ row }">
                      <span
                        style="color: var(--el-color-danger)"
                        v-if="
                          row[`level_${item.scoringItemsType}`].chiefDeduction
                        "
                        class="font-bold"
                      >
                        {{
                          row[`level_${item.scoringItemsType}`].chiefDeduction
                        }}
                      </span>
                    </template>
                  </el-table-column>
                  <el-table-column
                    :prop="`level_${item.scoringItemsType}.chiefScoring`"
                    label="主考评分"
                    min-width="85px"
                    show-overflow-tooltip
                    :resizable="false"
                    align="center"
                  />
                  <el-table-column
                    label="副考扣分"
                    min-width="85px"
                    show-overflow-tooltip
                    :resizable="false"
                    align="center"
                    v-if="item.deputyName"
                  >
                    <template #default="{ row }">
                      <span
                        style="color: var(--el-color-danger)"
                        v-if="
                          row[`level_${item.scoringItemsType}`].deputyDeduction
                        "
                        class="font-bold"
                      >
                        {{
                          row[`level_${item.scoringItemsType}`].deputyDeduction
                        }}
                      </span>
                    </template>
                  </el-table-column>
                  <el-table-column
                    :prop="`level_${item.scoringItemsType}.deputyScoring`"
                    label="副考评分"
                    min-width="85px"
                    show-overflow-tooltip
                    :resizable="false"
                    align="center"
                    v-if="item.deputyName"
                  />
                </el-table>
              </div>
            </div>

            <!-- 扣分项 -->
            <div class="mt-20px" v-if="item.deductionItems?.length > 0">
              <div class="table-tag">
                <div class="table-tag-label">扣分项</div>
                <div class="table-tag-content">
                  最终扣分：{{ numberRound(item.deductionScore, 2) }}
                </div>
              </div>
              <el-table
                :data="item.deductionItems"
                class="w-full"
                style="height: 100%"
                border
                :span-method="(val) => deductionSpanMethod(val, item)"
                show-summary
                :summary-method="getSummariesDeduction"
              >
                <template #empty>
                  <el-empty description="暂无数据" />
                </template>

                <el-table-column
                  v-for="(_, levelIndex) in +item.deductionItemsType"
                  :label="
                    headerListContainer[item.deductionItemsType][levelIndex]
                  "
                  min-width="250px"
                  show-overflow-tooltip
                  :resizable="false"
                >
                  <template #default="{ row }">
                    {{ row[`level_${levelIndex}`].content }}
                  </template>
                </el-table-column>

                <el-table-column
                  :prop="`level_${item.deductionItemsType}.content`"
                  label="扣分原因"
                  min-width="250px"
                  show-overflow-tooltip
                  :resizable="false"
                />
                <el-table-column
                  :prop="`level_${item.deductionItemsType}.rule`"
                  label="扣分说明"
                  min-width="250px"
                  show-overflow-tooltip
                  :resizable="false"
                />
                <el-table-column
                  :prop="`level_${item.deductionItemsType}.score`"
                  label="分值"
                  min-width="75px"
                  show-overflow-tooltip
                  :resizable="false"
                  align="center"
                />
                <el-table-column
                  label="主考扣分"
                  min-width="85px"
                  show-overflow-tooltip
                  :resizable="false"
                  align="center"
                >
                  <template #default="{ row }">
                    <span
                      style="color: var(--el-color-danger)"
                      v-if="
                        row[`level_${item.deductionItemsType}`].chiefScoring
                      "
                      class="font-bold"
                    >
                      {{ row[`level_${item.deductionItemsType}`].chiefScoring }}
                    </span>
                  </template>
                </el-table-column>
                <el-table-column
                  label="副考扣分"
                  min-width="85px"
                  show-overflow-tooltip
                  :resizable="false"
                  align="center"
                  v-if="item.deputyName"
                >
                  <template #default="{ row }">
                    <span
                      style="color: var(--el-color-danger)"
                      v-if="
                        row[`level_${item.deductionItemsType}`].deputyScoring
                      "
                      class="font-bold"
                    >
                      {{
                        row[`level_${item.deductionItemsType}`].deputyScoring
                      }}
                    </span>
                  </template>
                </el-table-column>
              </el-table>
            </div>

            <div class="mt-20px flex">
              <el-row :gutter="20" class="w-full">
                <el-col :span="12">
                  <div class="flex">
                    <div class="custom-label">主考官：</div>
                    <div class="custom-content">
                      <TextTooltip :content="item.chiefName" />
                    </div>
                  </div>
                  <div class="flex">
                    <div class="custom-label">主考官占比：</div>
                    <div class="custom-content">
                      {{ item.chiefRatio ?? 0 }}%
                    </div>
                  </div>
                  <div class="flex items-start">
                    <div class="custom-label">主考官签名：</div>
                    <div class="custom-content">
                      <el-image
                        v-if="item.chiefSign"
                        style="height: 100px; min-width: 150px"
                        :src="`${baseUrl}/osce/signature/files/${item.chiefSign}`"
                        fit="contain"
                      />
                      <span v-else> 无</span>
                    </div>
                  </div>
                </el-col>
                <el-col :span="12" v-if="item.deputyName">
                  <div class="flex">
                    <div class="custom-label">副考官：</div>
                    <div class="custom-content">
                      <TextTooltip :content="item.deputyName" />
                    </div>
                  </div>
                  <div class="flex">
                    <div class="custom-label">副考官占比：</div>
                    <div class="custom-content">
                      {{ item.deputyRatio ?? 0 }}%
                    </div>
                  </div>
                  <div class="flex items-start">
                    <div class="custom-label">副考官签名：</div>
                    <div class="custom-content">
                      <el-image
                        v-if="item.deputySign"
                        style="height: 100px; min-width: 150px"
                        :src="`${baseUrl}/osce/signature/files/${item.deputySign}`"
                        fit="contain"
                      />
                      <span v-else> 无</span>
                    </div>
                  </div>
                </el-col>
              </el-row>
            </div>
          </el-collapse-item>
        </el-collapse>
      </el-scrollbar>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { getScoreDetailApi } from "@/api/osce/stat/score";
import { numberRound } from "@/utils/common";

let baseUrl = import.meta.env.VITE_API_BASE_URL;

const dialogVisible = ref(false);
const dialogFullscreen = ref(true);
const dialogLoading = ref(false);

/** 详情列表 */
const detailList = ref<any[]>([]);

/** 查看详情 */
const handleDetailShow = (examinationId: number, examineeId: number) => {
  dialogVisible.value = true;
  dialogLoading.value = true;

  getScoreDetailApi(examinationId, examineeId).then((res) => {
    dialogLoading.value = false;

    res.details = res.details
      .map((item: any) => {
        return {
          ...item,
          scoringItems: transListForType(
            treeToList(item.scoringItems),
            item.scoringItemsType,
          ),
          deductionItems: transListForType(
            treeToList(item.deductionItems),
            item.deductionItemsType,
          ),
        };
      })
      .map((item: any) => {
        let tempObj = {
          ...item,
        };

        if (item.scoringItemsType) {
          tempObj.scoringColRowSpan = getColRowSpan(
            item.scoringItems,
            Array(+item.scoringItemsType).fill(1),
          );
        }

        if (item.deductionItemsType) {
          tempObj.deductionColRowSpan = getColRowSpan(
            item.deductionItems,
            Array(+item.deductionItemsType).fill(1),
          );
        }

        return tempObj;
      });

    detailList.value = res.details;
  });
};

/**
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 */
/**
 * 获取得分项每一列的rowSpan
 * @param list 得分项列表
 * @levelCol 合并规则数组（数组的长度+1代表合并的level+1，数组每一项为当前level的列数）
 * @returns result（二维数组，第一层代表多少列，第二层代表这一列的合并规则）
 */
const getColRowSpan = (list: any[], levelCol: number[] = []) => {
  // 初始化rowSpan，每个单元格为1
  let tempArr = levelCol.map(() => {
    return Array(list.length).fill(1);
  });

  // 遍历层级，获取每个层级的合并信息
  for (let i = 0; i < levelCol.length; i++) {
    // 遍历需要合并的列表
    for (let j = 0; j < list.length; j++) {
      // 如果和上一行的值相同
      // 这里的判断，用于当前单元格是否被之前的行合并
      if (
        j > 0 &&
        list[j][`level_${i}`].content === list[j - 1][`level_${i}`].content &&
        list[j][`level_${i}`].content !== ""
      ) {
        if (i === 0) {
          // 如果没有父层级，则直接设置当前rowSpan为0
          tempArr[i][j] = 0;
          continue;
        } else {
          if (
            list[j][`level_${i - 1}`].id === list[j - 1][`level_${i - 1}`].id
          ) {
            // 如果父层相同，则再设置当前的rowSpan为0
            tempArr[i][j] = 0;
            continue;
          }
        }
      }

      // 和上一行的值不同，或者和上一行的父层不同
      // 遍历当前值后的值，与当前值相同的则rowSpan加1
      // 这个循环用来获取合并的表格的第一行rowSpan值
      for (let k = j + 1; k < list.length; k++) {
        let tag_0 =
          list[j][`level_${i}`].content === list[k][`level_${i}`].content &&
          list[j][`level_${i}`].content !== "";

        // 之后的行（k）的值是否与当前行（j）相同
        if (tag_0) {
          if (i === 0) {
            // 如果无父层级
            tempArr[i][j] += 1;
            continue;
          } else {
            let tag_1 =
              list[j][`level_${i - 1}`].id === list[k][`level_${i - 1}`].id;
            // 之后的行（k）的值是否与当前行（j）的父层级相同
            if (tag_1) {
              tempArr[i][j] += 1;
              continue;
            }
            break;
          }
        } else {
          break;
        }
      }
    }
  }

  // 将每个层级的合并规则放到层级对应的所有列中
  const result = levelCol
    .map((item, index) => {
      return Array(item).fill(tempArr[index]);
    })
    .flat();

  return result;
};

/** 得分项表格合并 */
const scoringSpanMethod = (
  { row, column, rowIndex, columnIndex }: SpanMethodProps,
  item: any,
) => {
  row;
  column;
  if (columnIndex < item.scoringColRowSpan.length) {
    return {
      rowspan: item.scoringColRowSpan[columnIndex][rowIndex],
      colspan: 1,
    };
  }
};

/** 扣分项表格合并 */
const deductionSpanMethod = (
  { row, column, rowIndex, columnIndex }: SpanMethodProps,
  item: any,
) => {
  row;
  column;
  if (columnIndex < item.deductionColRowSpan.length) {
    return {
      rowspan: item.deductionColRowSpan[columnIndex][rowIndex],
      colspan: 1,
    };
  }
};

interface SpanMethodProps {
  row: any;
  // column: TableColumnCtx<any>;
  column: any;
  rowIndex: number;
  columnIndex: number;
}
/**
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 */

defineExpose({
  handleDetailShow,
});

/**
 * 表头容器
 */
const headerListContainer = {
  "0": [],
  "1": ["一级类型"],
  "2": ["一级类型", "二级类型"],
  "3": ["一级类型", "二级类型", "三级类型"],
} as Record<string, string[]>;

/** =============== 计算行 begin =============== */
const colLabelArrScoring = [
  "分值",
  "主考扣分",
  "主考评分",
  "副考扣分",
  "副考评分",
];

const getSummariesScoring = (param: any) => {
  const { columns, data } = param;
  const sums: (string | VNode)[] = [];
  const maxLevel = getRowMaxLevelProp(data[0]);

  // @ts-ignore
  columns.forEach((column, index) => {
    // 第一行为‘合计’
    if (index === 0) {
      sums[index] = "合计";
      return;
    }
    // 不需要计算的行为空
    if (!colLabelArrScoring.includes(columns[index].label)) {
      return;
    }

    // 分值
    if (columns[index].label === "分值") {
      let values = data.map((item: any) => +item[maxLevel].score);
      let tempSum = values.reduce(
        (pre: number, cur: number) => preciseAdd(pre, Number(cur), 100),
        0,
      );

      sums[index] = `${tempSum ? tempSum : ""}`;
      return;
    }

    // 主考扣分
    if (columns[index].label === "主考扣分") {
      let values = data.map((item: any) => +item[maxLevel].chiefDeduction);

      let tempSum = values.reduce(
        (pre: number, cur: number) => preciseAdd(pre, Number(cur), 100),
        0,
      );

      sums[index] = h(
        "div",
        { style: { color: "var(--el-color-danger)", fontWeight: "bold" } },
        [`${tempSum ? tempSum : ""}`],
      );
      return;
    }
    // 主考评分
    if (columns[index].label === "主考评分") {
      let values = data.map((item: any) => +item[maxLevel].chiefScoring);

      let tempSum = values.reduce(
        (pre: number, cur: number) => preciseAdd(pre, Number(cur), 100),
        0,
      );

      sums[index] = `${tempSum ? tempSum : ""}`;
      return;
    }
    // 副考扣分
    if (columns[index].label === "副考扣分") {
      let values = data.map((item: any) => +item[maxLevel].deputyDeduction);

      let tempSum = values.reduce(
        (pre: number, cur: number) => preciseAdd(pre, Number(cur), 100),
        0,
      );

      sums[index] = h(
        "div",
        { style: { color: "var(--el-color-danger)", fontWeight: "bold" } },
        [`${tempSum ? tempSum : ""}`],
      );
      return;
    }
    // 副考评分
    if (columns[index].label === "副考评分") {
      let values = data.map((item: any) => +item[maxLevel].deputyScoring);

      let tempSum = values.reduce(
        (pre: number, cur: number) => preciseAdd(pre, Number(cur), 100),
        0,
      );

      sums[index] = `${tempSum ? tempSum : ""}`;
      return;
    }
    // // 三考官扣分
    // if (columns[index].label === "三考官扣分") {
    //   let values = data.map((item: any) => +item[maxLevel].thirdDeduction);

    //   let tempSum = values.reduce(
    //     (pre: number, cur: number) => preciseAdd(pre, Number(cur), 100),
    //     0,
    //   );

    //   sums[index] = h(
    //     "div",
    //     { style: { color: "var(--el-color-danger)", fontWeight: "bold" } },
    //     [`${tempSum ? tempSum : ""}`],
    //   );
    //   return;
    // }
    // // 三考官评分
    // if (columns[index].label === "三考官评分") {
    //   let values = data.map((item: any) => +item[maxLevel].thirdScoring);

    //   let tempSum = values.reduce(
    //     (pre: number, cur: number) => preciseAdd(pre, Number(cur), 100),
    //     0,
    //   );

    //   sums[index] = `${tempSum ? tempSum : ""}`;
    //   return;
    // }
  });

  return sums;
};

const colLabelArrDeduction = ["分值", "主考扣分", "副考扣分"];

const getSummariesDeduction = (param: any) => {
  const { columns, data } = param;
  const sums: (string | VNode)[] = [];
  const maxLevel = getRowMaxLevelProp(data[0]);

  // @ts-ignore
  columns.forEach((column, index) => {
    // 第一行为‘合计’
    if (index === 0) {
      sums[index] = "合计";
      return;
    }
    // 不需要计算的行为空
    if (!colLabelArrDeduction.includes(columns[index].label)) {
      return;
    }

    // 分值
    if (columns[index].label === "分值") {
      let values = data.map((item: any) => +item[maxLevel].score);
      let tempSum = values.reduce(
        (pre: number, cur: number) => preciseAdd(pre, Number(cur), 100),
        0,
      );

      sums[index] = `${tempSum ? tempSum : ""}`;
      return;
    }

    // 主考扣分
    if (columns[index].label === "主考扣分") {
      let values = data.map((item: any) => +item[maxLevel].chiefScoring);

      let tempSum = values.reduce(
        (pre: number, cur: number) => preciseAdd(pre, Number(cur), 100),
        0,
      );

      sums[index] = h(
        "div",
        { style: { color: "var(--el-color-danger)", fontWeight: "bold" } },
        [`${tempSum ? tempSum : ""}`],
      );
      return;
    }
    // 副考扣分
    if (columns[index].label === "副考扣分") {
      let values = data.map((item: any) => +item[maxLevel].deputyScoring);

      let tempSum = values.reduce(
        (pre: number, cur: number) => preciseAdd(pre, Number(cur), 100),
        0,
      );

      sums[index] = h(
        "div",
        { style: { color: "var(--el-color-danger)", fontWeight: "bold" } },
        [`${tempSum ? tempSum : ""}`],
      );
      return;
    }
    // // 三考官扣分
    // if (columns[index].label === "三考官扣分") {
    //   let values = data.map((item: any) => +item[maxLevel].thirdScoring);

    //   let tempSum = values.reduce(
    //     (pre: number, cur: number) => preciseAdd(pre, Number(cur), 100),
    //     0,
    //   );

    //   sums[index] = h(
    //     "div",
    //     { style: { color: "var(--el-color-danger)", fontWeight: "bold" } },
    //     [`${tempSum ? tempSum : ""}`],
    //   );
    //   return;
    // }
  });

  return sums;
};

/** =============== 计算行 end =============== */
</script>

<style scoped lang="less">
::v-deep(.el-dialog) {
  @apply h-100vh overflow-hidden flex flex-col;
  .el-dialog__body {
    @apply flex-1 overflow-hidden flex;
  }
}

.detail-wrapper {
  @apply flex-1 overflow-hidden flex box-border w-full;
  ::v-deep(.el-scrollbar__wrap) {
    @apply w-full;
  }
}

.custom-label {
  width: 100px;
  text-align: right;
  flex: none;
  font-weight: bold;
}

.custom-content {
  flex: 1;
  overflow: hidden;
}

::v-deep(.el-collapse) {
  --el-collapse-content-font-size: 14px;
  --el-collapse-header-font-size: 14px;
}

// 总得分
.score-all {
  .score {
    color: var(--el-color-primary);
  }
}

.table-tag {
  @apply mb-10px inline-flex;
  border: var(--el-border);
  border-radius: var(--el-border-radius-base);
  .table-tag-label {
    border-right: var(--el-border);
    padding: 4px 12px;
    line-height: 23px;
  }
  .table-tag-content {
    padding: 4px 12px;
    line-height: 23px;
    .score {
      // color: var(--el-color-primary);
    }
  }
}

// 手风琴
::v-deep(.el-collapse) {
  border-bottom: unset;
  border-top: unset;

  .el-collapse-item {
    @apply overflow-hidden;
    border: 1px solid var(--el-color-primary);
    border-radius: var(--el-border-radius-base);

    // 头部
    .el-collapse-item__header {
      @apply px-20px;

      transition: all 0.3s;

      &.is-active {
        color: var(--el-color-primary);
      }
    }

    // 主区域
    .el-collapse-item__wrap {
      @apply px-20px;
    }

    &:not(:first-of-type) {
      @apply mt-20px;
    }
  }
  .el-collapse-item__header {
    border-bottom: unset;
  }
}
</style>
