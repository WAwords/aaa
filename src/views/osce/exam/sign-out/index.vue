<template>
  <div class="router-page">
    <div class="exam-select-rapper">
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
      <div>
        <!-- <el-button type="primary" @click="" v-if="examInfo"> 导出 </el-button> -->
      </div>
    </div>

    <div class="h-full flex items-center justify-center" v-if="!examInfo">
      <el-empty description="暂无数据" />
    </div>

    <QueryBar
      ref="queryBar"
      v-if="examInfo"
      :query-params="queryParams"
      @on-search="fetch(1)"
      @on-reset="fetch(1)"
      label-width="40px"
    >
      <template #query-form>
        <el-form-item prop="name" label="姓名">
          <el-input
            placeholder="请输入考生姓名"
            clearable
            v-model="queryParams.name"
            style="width: 200px"
            @keyup.enter="fetch(1)"
          />
        </el-form-item>
        <el-form-item prop="studentNumber" label="学号">
          <el-input
            placeholder="请输入考生学号"
            clearable
            v-model.trim="queryParams.studentNumber"
            style="width: 200px"
            @keyup.enter="fetch(1)"
          />
        </el-form-item>
        <el-form-item prop="major" label="专业">
          <el-input
            placeholder="请输入考生专业"
            clearable
            v-model.trim="queryParams.major"
            style="width: 200px"
            @keyup.enter="fetch(1)"
          />
        </el-form-item>
        <el-form-item prop="grade" label="年级">
          <el-date-picker
            v-model="queryParams.grade"
            type="year"
            placeholder="请选择年级"
            value-format="YYYY"
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item prop="signOut" label="范围">
          <el-select
            v-model="queryParams.signOut"
            placeholder="请选择范围"
            style="width: 200px"
            filterable
            clearable
          >
            <el-option
              v-for="item in signOutOption"
              :key="item.label"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
      </template>
    </QueryBar>

    <el-table
      v-if="examInfo"
      ref="tableRef"
      v-loading="loading"
      :data="tableData"
      class="w-full"
      style="height: 100%"
      stripe
    >
      <template #empty> <el-empty description="暂无数据" /> </template>
      <el-table-column
        type="index"
        label="序号"
        width="55"
        fixed
        align="center"
      />
      <el-table-column
        prop="user.name"
        label="姓名"
        min-width="120px"
        fixed
        show-overflow-tooltip
      />
      <el-table-column
        prop="user.genderName"
        label="性别"
        min-width="80px"
        show-overflow-tooltip
        align="center"
      />
      <el-table-column
        prop="studentNumber"
        label="学号"
        min-width="150px"
        show-overflow-tooltip
        align="center"
      />
      <el-table-column
        label="是否签到"
        min-width="80px"
        show-overflow-tooltip
        align="center"
      >
        <template #default="{ row }">
          {{ row.signIn ? "是" : "否" }}
        </template>
      </el-table-column>
      <el-table-column
        label="是否签离"
        min-width="80px"
        show-overflow-tooltip
        align="center"
      >
        <template #default="{ row }">
          {{ row.signOut ? "是" : "否" }}
        </template>
      </el-table-column>
      <el-table-column
        prop="signOutAt"
        label="签离时间"
        min-width="180px"
        show-overflow-tooltip
        align="center"
      />
      <el-table-column
        prop="major"
        label="专业"
        min-width="150px"
        show-overflow-tooltip
        align="center"
      />
      <el-table-column
        prop="grade"
        label="年级"
        min-width="80px"
        show-overflow-tooltip
        align="center"
      />
      <el-table-column
        prop="className"
        label="班级"
        min-width="230px"
        show-overflow-tooltip
        align="center"
      />
      <el-table-column label="操作" fixed="right" width="90px" align="center">
        <template #default="{ row }">
          <el-button
            size="small"
            type="primary"
            @click="handleSignOut(row)"
            v-if="!row.signOut"
            class="w-full"
            v-hasPermi="['osce:examination:sign-out']"
            text
          >
            签离
          </el-button>
          <el-button
            size="small"
            type="success"
            disabled
            class="w-full"
            text
            v-else
          >
            已签离
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <PaginationBar
      v-if="examInfo"
      :current="queryParams.pageNumber"
      :size="queryParams.pageSize"
      :total="totalSize"
      @on-size-change="onSizeChange"
      @on-current-change="onCurrentChange"
    />
  </div>
</template>

<script setup lang="ts">
import {
  getExaminationListApi,
  ExaminationListItemType,
} from "@/api/osce/exam/management";
import {
  getExamineeListApi,
  patchExamineeSignOutApi,
} from "@/api/osce/exam/management";

defineOptions({
  name: "OsceExamSign-out",
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

const queryBar = ref();
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

  nextTick(() => {
    queryBar.value.resetFormExp();
    fetch(1);
  });
};

const queryParams = ref<any>({
  pageNumber: 1,
  pageSize: 10,
  name: "",
  studentNumber: "",
  major: "",
  grade: "",
  signOut: "",
});

/**
 * 拉取列表
 */
const loading = ref(false);
const totalSize = ref(0);
const tableData = ref([]);
const fetch = (i = 0) => {
  loading.value = true;
  if (i !== 0) {
    queryParams.value.pageNumber = i;
  }
  getExamineeListApi(queryParams.value, examInfo.value.id)
    .then((res) => {
      totalSize.value = res.totalSize;
      tableData.value = res.dataList;
      loading.value = false;
    })
    .catch(() => {
      loading.value = false;
    });
};

/**
 * 分页控制
 */
const onSizeChange = (i: number) => {
  queryParams.value.pageSize = i;
  fetch(1);
};
const onCurrentChange = (i: number) => {
  queryParams.value.pageNumber = i;
  fetch(i);
};

/** 签离 */
const handleSignOut = (row: any) => {
  CmeMessageBox.confirm(
    `考生签离后无法撤销，是否确认签离该考生？`,
    "签离确认",
    {
      distinguishCancelAndClose: true,
      confirmButtonText: "确定",
      cancelButtonText: "取消",
    },
  )
    .then(() => {
      patchExamineeSignOutApi({
        examineeId: row.id,
        examinationId: examInfo.value.id,
      })
        .then(() => {
          CmeMessage({
            title: "成功",
            message: "签离成功",
            type: "success",
          });
          fetch();
        })
        .catch(() => {});
    })
    .catch(() => {});
};

const signOutOption = [
  {
    value: "",
    label: "全部考生",
  },
  {
    value: true,
    label: "已签离考生",
  },
  {
    value: false,
    label: "未签离考生",
  },
];
</script>

<style scoped lang="less">
// 选择考试栏
.exam-select-rapper {
  @apply flex items-center justify-between bg-white flex-nowrap flex-none pb-20px mb-20px;
  border-bottom: var(--el-border);
  ::v-deep(.el-select__wrapper) {
    @apply w-500px;
  }
  ::v-deep(.el-button) {
    @apply w-120px;
  }
}

#main-container {
  @apply bg-white flex-1 flex flex-col;
}

// 查询栏
.query-bar {
  // 非按钮区
  .el-form-item:not(.query-btn-container) {
    width: 220px !important;
  }
}
</style>
