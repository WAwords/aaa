<template>
  <div class="router-page">
    <div class="exam-select-wrapper">
      <el-space>
        <el-select-v2
          v-model="tempExamId"
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

        <el-button type="primary" @click="handleConfirmExam"> 确定 </el-button>
      </el-space>

      <div>
        <el-button v-if="currentExam" type="primary" @click="handleExport()">
          导出
          <template #icon>
            <Icon icon="ant-design:cloud-download-outlined" size="15px" />
          </template>
        </el-button>
      </div>
    </div>

    <div class="empty-wrapper" v-if="!currentExam"> 未选择考试 </div>
    <el-table
      id="my-table-id"
      ref="tableRef"
      v-loading="loading"
      :data="tableData"
      class="w-full"
      height="100%"
      stripe
      v-else
    >
      <template #empty> <el-empty description="暂无数据" /> </template>
      <el-table-column
        type="index"
        label="序号"
        width="55"
        align="center"
        fixed
      />
      <el-table-column
        prop="examinee.user.name"
        label="考生姓名"
        min-width="120px"
        show-overflow-tooltip
        fixed
      />
      <el-table-column label="考生详情" align="center">
        <el-table-column
          prop="examinee.user.genderName"
          label="性别"
          width="55px"
          show-overflow-tooltip
          align="center"
        />
        <el-table-column
          prop="examinee.studentNumber"
          label="学号"
          min-width="150px"
          show-overflow-tooltip
          align="center"
        />
        <el-table-column
          prop="examinee.major"
          label="专业"
          min-width="150px"
          align="center"
          show-overflow-tooltip
        />
      </el-table-column>
      <el-table-column label="成绩总览" align="center">
        <el-table-column
          prop="summary.total"
          label="总分"
          width="100px"
          align="center"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            {{ numberRound(row.summary.total, 2) }}
          </template>
        </el-table-column>
        <el-table-column
          prop="summary.totalCount"
          label="项目数"
          width="70px"
          align="center"
          show-overflow-tooltip
        />
        <el-table-column
          prop="summary.average"
          label="平均分"
          show-overflow-tooltip
          align="center"
          min-width="100px"
        >
          <template #default="{ row }">
            {{ numberRound(row.summary.average, 2) }}
          </template>
        </el-table-column>
        <el-table-column
          prop="summary.max"
          label="最高分"
          show-overflow-tooltip
          align="center"
          min-width="100px"
        >
          <template #default="{ row }">
            {{ numberRound(row.summary.max, 2) }}
          </template>
        </el-table-column>
        <el-table-column
          prop="summary.min"
          label="最低分"
          show-overflow-tooltip
          align="center"
          min-width="100px"
        >
          <template #default="{ row }">
            {{ numberRound(row.summary.min, 2) }}
          </template>
        </el-table-column>
      </el-table-column>
      <el-table-column
        :label="item.skillType"
        align="center"
        v-for="(item, index) in tableHeader"
      >
        <el-table-column
          :label="_item"
          v-for="(_item, _index) in item.skills"
          min-width="130px"
          align="center"
        >
          <template #default="{ row }">
            {{
              numberRound(row.scores[scoreIndex(index as number, _index)], 2)
            }}
          </template>
        </el-table-column>
      </el-table-column>
      <el-table-column label="操作" fixed="right" width="100px" align="center">
        <template #default="{ row }">
          <el-button size="small" type="primary" @click="handleViewDetail(row)">
            查看详情
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <ScoreDetail ref="ScoreDetailRef" />
  </div>
</template>

<script setup lang="ts">
import {
  getExaminationListApi,
  ExaminationListItemType,
  getExamScoresApi,
} from "@/api/osce/exam/management";
import { downloadFile } from "@/request/utils/blob";
import ScoreDetail from "./components/ScoreDetail.vue";

import { numberRound } from "@/utils/common";

defineOptions({
  name: "OsceStatScore",
});

onMounted(() => {
  fetchExamList();
});
/** 已考考试列表 */
const examList = ref<ExaminationListItemType[]>([]);

/** 获取考试列表 */
const fetchExamList = () => {
  getExaminationListApi({})
    .then((res) => {
      examList.value = res.dataList;
    })
    .catch(() => {});
};

/** 选中的考试id */
const tempExamId = ref();

/** 选中的考试 */
const tempExam = computed(() => {
  return examList.value.find((item) => item.id === tempExamId.value);
});

/** 显示的考试 */
const currentExam = ref<any>();

/** 确定选择考试 */
const handleConfirmExam = () => {
  currentExam.value = tempExam.value;
  fetchScore();
};

/** 成绩列表 */
const tableData = ref<any[]>([]);
/** 成绩列表加载状态 */
const loading = ref(false);
/** 获取成绩列表 */
const fetchScore = () => {
  if (!currentExam.value?.id) {
    return CmeMessage({
      message: "请先选择考试",
      type: "warning",
    });
  } else {
    loading.value = true;
    getExamScoresApi(currentExam.value.id)
      .then((res) => {
        tableData.value = res.scoreTable;
        tableHeader.value = res.skillTypes;
        loading.value = false;
      })
      .catch(() => {
        loading.value = false;
      });
  }
};
/** 动态表头数据 */
const tableHeader = ref<{ [property: string]: any }>([]);

const scoreIndex = (index: number, _index: number) => {
  let tempIndex = 0;
  for (let i = 0; i < index; i++) {
    tempIndex += tableHeader.value[i].skills.length;
  }
  return tempIndex + _index;
};

/** 导出 */
const handleExport = () => {
  downloadFile(`/osce/examinations/${currentExam.value.id}/scores/export`, {});
};

/**
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * 查看详情
 */
const ScoreDetailRef = ref();

/** 查看详情 */
const handleViewDetail = (row: any) => {
  ScoreDetailRef.value.handleDetailShow(currentExam.value.id, row.examinee.id);
};
</script>

<style lang="less" scoped>
.el-select-v2__wrapper.is-filterable {
  @apply cursor-pointer;
}

.empty {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #999;
  font-size: 14px;
}

#main-container {
  @apply bg-white mt-10px p-20px flex-1 box-border flex;
}
.scroll-bar::-webkit-scrollbar {
  display: none;
}
.scroll-bar {
  -ms-overflow-style: none;
  scrollbar-width: none;
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
