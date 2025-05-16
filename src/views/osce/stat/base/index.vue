<template>
  <div class="router-page">
    <div class="exam-select-wrapper">
      <el-space>
        <el-select-v2
          v-model="selectedExamId"
          :options="examList"
          placeholder="请选择考试"
          :props="{ label: 'name', value: 'id' }"
          filterable
          clearable
        >
          <template #default="{ item }">
            <TextTooltip :content="item.name" />
          </template>
        </el-select-v2>

        <el-button
          type="primary"
          @click="handleExamSelect"
          v-hasPermi="['osce:examination:view']"
        >
          确定
        </el-button>
      </el-space>

      <div> </div>
    </div>

    <div class="empty-wrapper" v-if="!examInfo"> 未选择考试 </div>
    <el-table
      v-if="examInfo"
      ref="tableRef"
      v-loading="loading"
      :data="tableData"
      class="w-full"
      style="height: 100%"
      border
      :span-method="skillTypeSpanMethod"
      stripe
    >
      <template #empty> <el-empty description="暂无数据" /> </template>
      <el-table-column
        prop="skillType"
        label="技能类型"
        min-width="130px"
        fixed
        show-overflow-tooltip
        :resizable="false"
        align="center"
      />
      <el-table-column
        prop="skill"
        label="技能"
        min-width="130px"
        show-overflow-tooltip
        :resizable="false"
        align="center"
      />
      <el-table-column
        prop="count"
        label="考核人数"
        min-width="90px"
        show-overflow-tooltip
        :resizable="false"
        align="center"
      />
      <el-table-column
        prop="maximum"
        label="最高分"
        min-width="80px"
        show-overflow-tooltip
        :resizable="false"
        align="center"
      >
        <template #default="{ row }">
          {{ numberRound(row.maximum, 2) }}
        </template>
      </el-table-column>
      <el-table-column
        prop="minimum"
        label="最低分"
        min-width="80px"
        show-overflow-tooltip
        :resizable="false"
        align="center"
      >
        <template #default="{ row }">
          {{ numberRound(row.minimum, 2) }}
        </template>
      </el-table-column>
      <el-table-column
        prop="average"
        label="平均分"
        min-width="80px"
        show-overflow-tooltip
        :resizable="false"
        align="center"
      >
        <template #default="{ row }">
          {{ numberRound(row.average, 2) }}
        </template>
      </el-table-column>
      <el-table-column
        prop="median"
        label="中位分"
        min-width="80px"
        show-overflow-tooltip
        :resizable="false"
        align="center"
      >
        <template #default="{ row }">
          {{ numberRound(row.median, 2) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" fixed="right" width="100px" align="center">
        <template #default="{ row }">
          <el-button
            size="small"
            type="primary"
            @click="handleView(row)"
            v-hasPermi="['osce:examination:view']"
            :disabled="row.count === 0"
          >
            查看详情
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      title="详情"
      width="1200px"
      min-height="500px"
      destroy-on-close
      align-center
      :fullscreen="dialogFullscreen"
      @closed="handleDialogClosed"
    >
      <div v-loading="dialogLoading">
        <!-- 得分项 -->
        <el-table
          :data="scoringList"
          class="w-full"
          style="height: 100%"
          border
          :span-method="scoringSpanMethod"
        >
          <template #empty> <el-empty description="暂无数据" /> </template>

          <template v-for="(_, levelIndex) in +scoringItemsType">
            <el-table-column
              :label="headerListContainer[scoringItemsType][levelIndex]"
              min-width="200px"
              :resizable="false"
            >
              <template #default="{ row }">
                <TextTooltip
                  :content="`${row[`level_${levelIndex}`].content}`"
                />
                <div
                  class="group-num cursor-default"
                  v-if="row[`level_${levelIndex}`].group"
                >
                  {{ row[`level_${levelIndex}`].group }}
                </div>
              </template>
            </el-table-column>
            <el-table-column
              :label="
                headerListContainer[scoringItemsType][levelIndex] + '统计'
              "
              align="center"
            >
              <el-table-column
                label="分值"
                min-width="80px"
                show-overflow-tooltip
                :resizable="false"
                align="center"
              >
                <template #default="{ row }">
                  {{ numberRound(row[`level_${levelIndex}`].score) }}
                </template>
              </el-table-column>
              <el-table-column
                label="平均失分值"
                min-width="100px"
                show-overflow-tooltip
                :resizable="false"
                align="center"
              >
                <template #default="{ row }">
                  {{
                    numberRound(row[`level_${levelIndex}`].averageLostPoints)
                  }}
                </template>
              </el-table-column>
              <el-table-column
                label="平均失分比"
                min-width="100px"
                show-overflow-tooltip
                :resizable="false"
                align="center"
              >
                <template #default="{ row }">
                  {{
                    numberRound(row[`level_${levelIndex}`].averageLostRatio)
                  }}%
                </template>
              </el-table-column>
              <el-table-column
                label="失分人次"
                min-width="100px"
                show-overflow-tooltip
                :resizable="false"
                align="center"
              >
                <template #default="{ row }">
                  {{ numberRound(row[`level_${levelIndex}`].lossCount) }}
                </template>
              </el-table-column>
              <el-table-column
                label="失分人次比"
                min-width="100px"
                show-overflow-tooltip
                :resizable="false"
                align="center"
              >
                <template #default="{ row }">
                  {{ numberRound(row[`level_${levelIndex}`].lossRatio) }}%
                </template>
              </el-table-column>
            </el-table-column>
          </template>

          <el-table-column
            label="操作内容"
            min-width="250px"
            show-overflow-tooltip
            :resizable="false"
          >
            <template #default="{ row }">
              {{ row[`level_${scoringItemsType}`].content }}
            </template>
          </el-table-column>
          <el-table-column label="操作内容统计" align="center">
            <el-table-column
              label="分值"
              min-width="80px"
              show-overflow-tooltip
              :resizable="false"
              align="center"
            >
              <template #default="{ row }">
                {{ numberRound(row[`level_${scoringItemsType}`].score) }}
              </template>
            </el-table-column>
            <el-table-column
              label="平均失分值"
              min-width="100px"
              show-overflow-tooltip
              :resizable="false"
              align="center"
            >
              <template #default="{ row }">
                {{
                  numberRound(
                    row[`level_${scoringItemsType}`].averageLostPoints,
                  )
                }}
              </template>
            </el-table-column>
            <el-table-column
              label="平均失分比"
              min-width="100px"
              show-overflow-tooltip
              :resizable="false"
              align="center"
            >
              <template #default="{ row }">
                {{
                  numberRound(
                    row[`level_${scoringItemsType}`].averageLostRatio,
                  )
                }}%
              </template>
            </el-table-column>
            <el-table-column
              label="失分人次"
              min-width="100px"
              show-overflow-tooltip
              :resizable="false"
              align="center"
            >
              <template #default="{ row }">
                {{ numberRound(row[`level_${scoringItemsType}`].lossCount) }}
              </template>
            </el-table-column>
            <el-table-column
              label="失分人次比"
              min-width="100px"
              show-overflow-tooltip
              :resizable="false"
              align="center"
            >
              <template #default="{ row }">
                {{ numberRound(row[`level_${scoringItemsType}`].lossRatio) }}%
              </template>
            </el-table-column>
          </el-table-column>
          <el-table-column
            label="评分细则"
            min-width="250px"
            show-overflow-tooltip
            :resizable="false"
          >
            <template #default="{ row }">
              {{ row[`level_${scoringItemsType}`].rule }}
            </template>
          </el-table-column>
        </el-table>

        <!-- 扣分项 -->
        <el-table
          v-if="deductionList.length > 0"
          :data="deductionList"
          class="w-full mt-20px"
          style="height: 100%"
          border
          :span-method="deductionSpanMethod"
          stripe
        >
          <template #empty> <el-empty description="暂无数据" /> </template>

          <template v-for="(_, levelIndex) in +deductionItemsType">
            <el-table-column
              :label="headerListContainer[deductionItemsType][levelIndex]"
              min-width="200px"
              show-overflow-tooltip
              :resizable="false"
            >
              <template #default="{ row }">
                <TextTooltip
                  :content="`${row[`level_${levelIndex}`].content}`"
                />
                <div
                  class="group-num cursor-default"
                  v-if="row[`level_${levelIndex}`].group"
                >
                  {{ row[`level_${levelIndex}`].group }}
                </div>
              </template>
            </el-table-column>
            <el-table-column
              label="分值"
              min-width="80px"
              show-overflow-tooltip
              :resizable="false"
              align="center"
            >
              <template #default="{ row }">
                {{ numberRound(row[`level_${levelIndex}`].score) }}
              </template>
            </el-table-column>
            <el-table-column
              label="平均扣分值"
              min-width="100px"
              show-overflow-tooltip
              :resizable="false"
              align="center"
            >
              <template #default="{ row }">
                {{ numberRound(row[`level_${levelIndex}`].averageLostPoints) }}
              </template>
            </el-table-column>
            <el-table-column
              label="平均扣分比"
              min-width="100px"
              show-overflow-tooltip
              :resizable="false"
              align="center"
            >
              <template #default="{ row }">
                {{ numberRound(row[`level_${levelIndex}`].averageLostRatio) }}%
              </template>
            </el-table-column>
            <el-table-column
              label="扣分人次"
              min-width="100px"
              show-overflow-tooltip
              :resizable="false"
              align="center"
            >
              <template #default="{ row }">
                {{ numberRound(row[`level_${levelIndex}`].lossCount) }}
              </template>
            </el-table-column>
            <el-table-column
              label="扣分人次比"
              min-width="100px"
              show-overflow-tooltip
              :resizable="false"
              align="center"
            >
              <template #default="{ row }">
                {{ numberRound(row[`level_${levelIndex}`].lossRatio) }}%
              </template>
            </el-table-column>
          </template>

          <el-table-column
            label="扣分原因"
            min-width="250px"
            show-overflow-tooltip
            :resizable="false"
          >
            <template #default="{ row }">
              {{ row[`level_${deductionItemsType}`].content }}
            </template>
          </el-table-column>
          <el-table-column label="扣分原因统计" align="center">
            <el-table-column
              label="分值"
              min-width="80px"
              show-overflow-tooltip
              :resizable="false"
              align="center"
            >
              <template #default="{ row }">
                {{ numberRound(row[`level_${deductionItemsType}`].score) }}
              </template>
            </el-table-column>
            <el-table-column
              label="平均扣分值"
              min-width="100px"
              show-overflow-tooltip
              :resizable="false"
              align="center"
            >
              <template #default="{ row }">
                {{
                  numberRound(
                    row[`level_${deductionItemsType}`].averageLostPoints,
                  )
                }}
              </template>
            </el-table-column>
            <el-table-column
              label="平均扣分比"
              min-width="100px"
              show-overflow-tooltip
              :resizable="false"
              align="center"
            >
              <template #default="{ row }">
                {{
                  numberRound(
                    row[`level_${deductionItemsType}`].averageLostRatio,
                  )
                }}%
              </template>
            </el-table-column>
            <el-table-column
              label="扣分人次"
              min-width="100px"
              show-overflow-tooltip
              :resizable="false"
              align="center"
            >
              <template #default="{ row }">
                {{ numberRound(row[`level_${deductionItemsType}`].lossCount) }}
              </template>
            </el-table-column>
            <el-table-column
              label="扣分人次比"
              min-width="100px"
              show-overflow-tooltip
              :resizable="false"
              align="center"
            >
              <template #default="{ row }">
                {{ numberRound(row[`level_${deductionItemsType}`].lossRatio) }}%
              </template>
            </el-table-column>
          </el-table-column>
          <el-table-column
            label="扣分说明"
            min-width="250px"
            show-overflow-tooltip
            :resizable="false"
          >
            <template #default="{ row }">
              {{ row[`level_${deductionItemsType}`].rule }}
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import type { TableColumnCtx } from "element-plus";
import {
  getExaminationListApi,
  ExaminationListItemType,
} from "@/api/osce/exam/management";
import { getStatisticsApi, getStatisticsDetailApi } from "@/api/osce/stat/base";
import { numberRound } from "@/utils/common";

defineOptions({
  name: "OsceStatBase",
});

/** 选中的考试id */
const selectedExamId = ref<number>();
/** 考试列表 */
const examList = ref<ExaminationListItemType[]>([]);
const examInfo = ref();

/** 获取考试列表 */
onMounted(() => {
  getExaminationListApi({})
    .then((res) => {
      examList.value = res.dataList;
    })
    .catch(() => {});
});

/** 确定选择考试 */
const handleExamSelect = () => {
  if (!selectedExamId.value) {
    CmeMessage({
      title: "提示",
      message: "请选择考试",
      type: "warning",
    });
    return;
  }
  examInfo.value = examList.value.find(
    (item) => item.id === selectedExamId.value,
  );
  fetch();
};

/**
 * 拉取列表
 */
const loading = ref(false);
const tableData = ref<any[]>([]);
const fetch = () => {
  loading.value = true;

  getStatisticsApi(examInfo.value.id)
    .then((res) => {
      let arr = skillListTransfer(res.skillTypes);
      getSkillTypeRowSpan(arr);

      tableData.value = arr;
      loading.value = false;
    })
    .catch(() => {
      loading.value = false;
    });
};

interface SpanMethodProps {
  row: any;
  column: TableColumnCtx<any>;
  rowIndex: number;
  columnIndex: number;
}

const skillTypeRowSpan = ref<number[]>([]);
/**
 * 获取技能类型rowSpan
 * @param list 需要合并的列表
 */
const getSkillTypeRowSpan = (list: any[]) => {
  // 初始rowSpan为1
  let tempArr = Array(list.length).fill(1);

  let skillTypeList = list.map((item) => item.skillType);

  for (let i = 0; i < skillTypeList.length; i++) {
    if (i > 0 && skillTypeList[i] === skillTypeList[i - 1]) {
      // 如果当前元素与上一个元素相同，则当前rowSpan为0
      tempArr[i] = 0;
      continue;
    }

    // 遍历当前值后的值，与当前值相同的则rowSpan加1
    for (let j = i + 1; j < skillTypeList.length; j++) {
      if (skillTypeList[i] === skillTypeList[j]) {
        tempArr[i] += 1;
      }
    }
  }

  skillTypeRowSpan.value = tempArr;
};

/**
 * 技能类型技能列表表格合并
 */
const skillTypeSpanMethod = ({
  row,
  column,
  rowIndex,
  columnIndex,
}: SpanMethodProps) => {
  row;
  column;
  if (columnIndex === 0) {
    return {
      rowspan: skillTypeRowSpan.value[rowIndex],
      colspan: 1,
    };
  }
};

/**
 * 将技能类型技能树形结构转为表格数据
 * @param list
 */
const skillListTransfer = (list: SkillType[]) => {
  let result: SkillRow[] = [];
  list.forEach((skillTypeItem) => {
    skillTypeItem.skills.forEach((skillItem) => {
      result.push({
        skillType: skillTypeItem.name,
        skill: skillItem.name,
        count: skillItem.count,
        average: skillItem.average,
        maximum: skillItem.maximum,
        minimum: skillItem.minimum,
        median: skillItem.median,
        mode: skillItem.mode,
        criteriaId: skillItem.criteriaId,
      });
    });
  });
  return result;
};

/**
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * 弹窗
 */

const dialogVisible = ref(false);
/** 得分项列表 */
const scoringList = ref<any[]>([]);
/** 扣分项列表 */
const deductionList = ref<any[]>([]);
const dialogLoading = ref(false);

const scoringItemsType = ref("0");
const deductionItemsType = ref("0");

/** 查看详情 */
const handleView = (row: SkillRow) => {
  dialogVisible.value = true;

  dialogLoading.value = true;

  getStatisticsDetailApi(examInfo.value.id, row.criteriaId)
    .then((res) => {
      scoringItemsType.value = res.scoringItemsType;
      deductionItemsType.value = res.deductionItemsType;

      const temp_scoringList = transListForType(
        treeToList(res.scoringItems),
        scoringItemsType.value,
      );
      const temp_deductionList = transListForType(
        treeToList(res.deductionItems),
        deductionItemsType.value,
      );

      if (scoringItemsType.value && +scoringItemsType.value > 0) {
        let scoringColRowSpanParams = Array(+scoringItemsType.value).fill(6);
        scoringColRowSpan.value = getColRowSpan(
          temp_scoringList,
          scoringColRowSpanParams,
        );
      }

      if (deductionItemsType.value && +deductionItemsType.value > 0) {
        let deductionColRowSpanParams = Array(+deductionItemsType.value).fill(
          6,
        );
        deductionColRowSpan.value = getColRowSpan(
          temp_deductionList,
          deductionColRowSpanParams,
        );
      }

      scoringList.value = temp_scoringList;
      deductionList.value = temp_deductionList;
      dialogLoading.value = false;
    })
    .catch(() => {
      dialogLoading.value = false;
    });
};

/**
 * 弹窗关闭初始化
 */
const handleDialogClosed = () => {
  scoringColRowSpan.value = [];
  deductionColRowSpan.value = [];
  scoringItemsType.value = "0";
  deductionItemsType.value = "0";
  scoringList.value = [];
  deductionList.value = [];
};

/**
 * 表头容器
 */
const headerListContainer = {
  "0": [],
  "1": ["一级类型"],
  "2": ["一级类型", "二级类型"],
  "3": ["一级类型", "二级类型", "三级类型"],
} as Record<string, string[]>;

/**
 * 获取得分项每一列的rowSpan
 * @param list 得分项列表
 * @levelCol 需要合并的层级及每个层级对应的列数（层级为数组长度，每一项的值为每层的列数）
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

/** 得分项每一列的rowSpan */
const scoringColRowSpan = ref<any[][]>([]);
/** 得分项表格合并 */
const scoringSpanMethod = ({
  row,
  column,
  rowIndex,
  columnIndex,
}: SpanMethodProps) => {
  row;
  column;
  if (columnIndex < scoringColRowSpan.value.length) {
    return {
      rowspan: scoringColRowSpan.value[columnIndex][rowIndex],
      colspan: 1,
    };
  }
};

/** 得分项每一列的rowSpan */
const deductionColRowSpan = ref<any[][]>([]);
/** 扣分项表格合并 */
const deductionSpanMethod = ({
  row,
  column,
  rowIndex,
  columnIndex,
}: SpanMethodProps) => {
  row;
  column;
  if (columnIndex < deductionColRowSpan.value.length) {
    return {
      rowspan: deductionColRowSpan.value[columnIndex][rowIndex],
      colspan: 1,
    };
  }
};

const dialogFullscreen = ref(true);

/**
 * 数据，请求返回数据
 *
 * ExaminationStatistics
 */
export type ExaminationStatistics = {
  skillTypes: SkillType[];
  [property: string]: any;
};

export type SkillType = {
  /**
   * 技能类型名
   */
  name: string;
  skills: Skill[];
  [property: string]: any;
};

export type Skill = {
  /**
   * 平均分
   */
  average: number;
  /**
   * 考核人数
   */
  count: number;
  /**
   * 最高分
   */
  maximum: number;
  /**
   * 最低分
   */
  minimum: number;
  /**
   * 技能名
   */
  name: string;
  /**
   * 中位数
   */
  median: number;
  /**
   * 众数
   */
  mode: number;
  [property: string]: any;
};

/** 每一行的数据 */
type SkillRow = {
  skillType: string;
  skill: string;
  count: number;
  average: number;
  maximum: number;
  minimum: number;
  median: number;
  mode: number;
  [property: string]: any;
};
</script>

<style scoped lang="less">
.page-header {
  @apply flex items-center justify-between bg-white p-20px flex-nowrap flex-none;
}

#main-container {
  @apply mt-10px p-20px bg-white flex-1 flex flex-col;
}

.group-num {
  @apply absolute top-0 right-0 border-l border-b w-20px flex justify-center items-center;
  background-color: #e5e7eb;
  color: #60626690;
}

::v-deep(.el-table__body) {
  overflow: hidden;
}

// 选择考试栏
.exam-select-wrapper {
  @apply flex items-center justify-between bg-white flex-nowrap flex-none pb-20px mb-20px;
  border-bottom: var(--el-border);
  ::v-deep(.el-select__wrapper) {
    @apply w-500px;
  }
  ::v-deep(.el-space .el-button) {
    @apply w-120px;
  }
}

.empty-wrapper {
  @apply h-full flex justify-center items-center text-24px font-bold tracking-4px;
  background-color: var(--el-fill-color-lighter);
  border-radius: var(--el-border-radius-base);
}
</style>
