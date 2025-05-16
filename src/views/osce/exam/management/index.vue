<template>
  <div class="router-page">
    <QueryBar
      :query-params="queryParams"
      @on-search="fetch(1)"
      @on-reset="fetch(1)"
      labelWidth="60px"
    >
      <template #query-form>
        <el-form-item prop="name" label="考试名">
          <el-input
            placeholder="请输入考试名"
            clearable
            v-model="queryParams.name"
            style="width: 200px"
            @keyup.enter="fetch(1)"
          />
        </el-form-item>
        <el-form-item prop="type" label="考试类型">
          <el-select
            v-model="queryParams.type"
            placeholder="请选择考试类型"
            style="width: 200px"
            filterable
          >
            <el-option
              v-for="item in typeOption"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
      </template>
    </QueryBar>

    <ActionBar @on-reload="fetch(1)">
      <el-button
        type="primary"
        @click="onActionCreate"
        v-hasPermi="['osce:examination:add']"
      >
        创建考试
        <template #icon>
          <Icon icon="ant-design:plus-outlined" size="15px" />
        </template>
      </el-button>
      <el-button
        type="danger"
        @click="onActionDelete"
        v-hasPermi="['osce:examination:delete']"
      >
        删除考试
        <template #icon>
          <Icon
            icon="ant-design:delete-outlined"
            size="15px"
            color="var(--el-button-text-color)"
          />
        </template>
      </el-button>
      <!-- <el-button type="primary" @click="handleCreateClick"> 创建</el-button> -->
    </ActionBar>

    <el-table
      ref="tableRef"
      v-loading="loading"
      :data="tableData"
      class="w-full"
      @selection-change="onSelectionChange"
      height="100%"
      stripe
    >
      <template #empty> <el-empty description="暂无数据" /> </template>
      <el-table-column type="selection" width="55" fixed />
      <el-table-column
        type="index"
        label="序号"
        width="55"
        fixed
        align="center"
      />
      <el-table-column
        prop="name"
        label="考试名"
        min-width="300px"
        fixed
        show-overflow-tooltip
      />
      <el-table-column
        prop="statusName"
        label="考试状态"
        show-overflow-tooltip
        min-width="130px"
        align="center"
      />
      <el-table-column
        prop="typeName"
        label="考试类型"
        show-overflow-tooltip
        min-width="150px"
        align="center"
      />
      <el-table-column
        prop="beginAt"
        label="考试开始时间"
        show-overflow-tooltip
        min-width="180px"
        align="center"
      />
      <el-table-column
        prop="endAt"
        label="考试结束时间"
        show-overflow-tooltip
        min-width="180px"
        align="center"
      />
      <el-table-column
        prop="skillSelectionMethodName"
        label="抽题方式"
        show-overflow-tooltip
        min-width="130px"
        align="center"
      />
      <el-table-column
        prop="modeName"
        label="考试模式"
        show-overflow-tooltip
        min-width="110px"
        align="center"
      />
      <el-table-column
        label="考官签字"
        show-overflow-tooltip
        min-width="110px"
        align="center"
      >
        <template #default="{ row }">
          {{ row.requireSignature ? "需要" : "不需要" }}
        </template>
      </el-table-column>
      <el-table-column
        label="分差检测"
        show-overflow-tooltip
        min-width="110px"
        align="center"
      >
        <template #default="{ row }">
          {{ row.scoreDifferenceDetection ? "开启" : "不开启" }}
        </template>
      </el-table-column>

      <el-table-column label="操作" fixed="right" width="280px" align="center">
        <template #default="{ row }">
          <el-button
            size="small"
            type="primary"
            @click="handleDuplicate(row)"
            v-hasPermi="['osce:examination:duplicate']"
            text
          >
            复制
          </el-button>
          <el-button
            size="small"
            type="primary"
            @click="handleResetExam(row)"
            v-hasPermi="['osce:examination:update']"
            :disabled="row.status !== '5'"
            text
          >
            转为未考
          </el-button>
          <el-button
            size="small"
            type="primary"
            @click="onEdit(row)"
            v-hasPermi="['osce:examination:update']"
            text
          >
            修改
          </el-button>
          <el-button
            size="small"
            type="danger"
            @click="onDelete(row)"
            v-hasPermi="['osce:examination:delete']"
            text
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <PaginationBar
      :current="queryParams.pageNumber"
      :size="queryParams.pageSize"
      :total="totalSize"
      @on-size-change="onSizeChange"
      @on-current-change="onCurrentChange"
    />

    <ExamEditor />

    <!-- 复制弹窗 -->
    <el-dialog
      v-model="duplicateDialogVisible"
      title="复制考试"
      width="400px"
      @open="onDuplicateDialogOpen"
      @closed="onDuplicateDialogClose"
      destroy-on-close
      align-center
      :close-on-click-modal="false"
    >
      <el-form
        :model="duplicateDialogForm"
        label-width="130px"
        ref="duplicateDialogFromRef"
        :rules="duplicateDialogFormRules"
        label-position="top"
      >
        <el-form-item label="复制考试至步骤" prop="step">
          <el-select
            v-model="duplicateDialogForm.step"
            placeholder="请选择步骤"
            class="w-full"
            filterable
          >
            <el-option
              v-for="item in duplicateStepOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
              :disabled="item.value > duplicateNowRow.step"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="考试时间" prop="timeRange">
          <el-date-picker
            v-model="duplicateDialogForm.timeRange"
            type="datetimerange"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            value-format="YYYY-MM-DD HH:mm:ss"
            format="YYYY-MM-DD HH:mm"
            :clearable="false"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button
            type="primary"
            plain
            @click="duplicateDialogVisible = false"
          >
            取消
          </el-button>
          <el-button
            type="primary"
            @click="handleDuplicateDialogSubmit"
            :loading="duplicateDialogSubmitLoading"
          >
            提交
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { dayjs } from "element-plus";
import { useExamEditorState } from "./components/examEditorState";
import ExamEditor from "./components/ExamEditor.vue";
import {
  getExaminationListApi,
  deleteExaminationsApi,
  duplicateApi,
} from "@/api/osce/exam/management";
import {
  GetExaminationListReqType,
  ExaminationListItemType,
} from "@/api/osce/exam/management";
import { getTodayStartDate } from "@/utils/common";
import { patchExamStatusApi } from "@/api/osce/exam/management";

defineOptions({
  name: "OsceExamManagement",
});

const queryParams = ref<GetExaminationListReqType>({
  pageNumber: 1,
  pageSize: 10,
  name: "",
  type: "",
});
onMounted(() => {
  fetch(1);
});
/** 拉取列表 */
const loading = ref(true);
const totalSize = ref(0);
const tableData = ref([]);
const fetch = (i = 0) => {
  loading.value = true;
  if (i !== 0) {
    queryParams.value.pageNumber = i;
  }
  getExaminationListApi(queryParams.value)
    .then((res) => {
      totalSize.value = res.totalSize;
      tableData.value = res.dataList;
      loading.value = false;
    })
    .catch(() => {
      loading.value = false;
    });
};
/** 列表多选 */
const selectionIds = ref<string>("");
const onSelectionChange = (val: ExaminationListItemType[]) => {
  let idList = val.map((item) => item.id);
  selectionIds.value = idList.join(",");
};
/** 批量删除 */
const onActionDelete = () => {
  if (selectionIds.value === "") {
    return CmeMessage({
      title: "提示",
      message: "请选择需要删除的考试",
      type: "warning",
    });
  }
  CmeMessageBox.confirm("确定批量删除考试吗？", "系统提示", {
    distinguishCancelAndClose: true,
    confirmButtonText: "确定",
    cancelButtonText: "取消",
  })
    .then(() => {
      deleteExaminationsApi(selectionIds.value)
        .then(() => {
          CmeMessage({
            title: "成功",
            message: "删除考试成功",
            type: "success",
          });
          fetch(1);
        })
        .catch(() => {});
    })
    .catch(() => {});
};

/** 操作栏的单个删除 */
const onDelete = (row: ExaminationListItemType) => {
  CmeMessageBox.confirm(`确定删除考试“${row.name}”吗？`, "系统提示", {
    distinguishCancelAndClose: true,
    confirmButtonText: "确定",
    cancelButtonText: "取消",
  })
    .then(() => {
      deleteExaminationsApi(row.id + "")
        .then(() => {
          CmeMessage({
            title: "成功",
            message: "删除考试成功",
            type: "success",
          });
          fetch(1);
        })
        .catch(() => {});
    })
    .catch(() => {});
};
/** 分页控制 */
const onSizeChange = (i: number) => {
  queryParams.value.pageSize = i;
  fetch(1);
};
const onCurrentChange = (i: number) => {
  queryParams.value.pageNumber = i;
  fetch(i);
};
/** 弹窗控制 */
const onActionCreate = () => {
  openDialog("create");
};
const editId = ref<any>();
const { openDialog } = useExamEditorState();
const onEdit = (row: ExaminationListItemType) => {
  openDialog("edit", row.id);
};

/** 编辑框关闭 */
const handleEditorClosed = () => {
  editId.value = undefined;
  fetch();
};

/** 转为未考 */
const handleResetExam = (row: any) => {
  CmeMessageBox.confirm(
    `<div style="color: var(--el-text-color-secondary);">
      考试转为未考 <strong style="color: var(--el-color-danger)">会导致该场考试成绩被清空</strong> ，
    考试状态会重新变为“考试已创建”，
    此时可以修改该场考试数据并重新开始考试。
    <strong style="color: var(--el-color-danger)">此操作不可逆</strong> ，
    是否确认继续？
      </div>`,
    "考试转为未考确认",
    {
      dangerouslyUseHTMLString: true,
      distinguishCancelAndClose: true,
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      beforeClose: (action, instance, done) => {
        if (action === "confirm") {
          instance.confirmButtonLoading = true;
          done();
          let obj = {
            source: "2",
            status: "2",
          };
          patchExamStatusApi(obj, row.id)
            .then(() => {
              instance.confirmButtonLoading = false;
              CmeMessage({
                title: "成功",
                message: "考试转为未考成功",
                type: "success",
              });
              fetch();
            })
            .catch(() => {
              instance.confirmButtonLoading = false;
            });
        } else {
          done();
        }
      },
    },
  )
    .then(() => {})
    .catch(() => {});
};

/** 提供编辑框关闭后需要执行的方法 */
provide("handleEditorClosed", handleEditorClosed);

/** 字典 */
const typeOption = [
  {
    value: "1",
    label: "普通考试",
  },
  {
    value: "2",
    label: "期末考试",
  },
  {
    value: "3",
    label: "年度考试",
  },
];

/** 可复制的步骤列表 */
const duplicateStepOptions = [
  {
    value: 1,
    label: "步骤1（填写考试信息）",
  },
  {
    value: 2,
    label: "步骤2（选择考试考生）",
  },
  {
    value: 3,
    label: "步骤3（选择考试考站）",
  },
  {
    value: 4,
    label: "步骤4（设置考站安排）",
  },
];

const duplicateDialogVisible = ref(false);
const duplicateNowRow = ref<any>();
const handleDuplicate = (row: any) => {
  duplicateNowRow.value = JSON.parse(JSON.stringify(row));

  duplicateDialogVisible.value = true;
};
const duplicateDialogForm = ref<{
  step?: number;
  [key: string]: any;
}>({
  timeRange: [],
});

const onDuplicateDialogOpen = () => {
  duplicateDialogForm.value.timeRange = [
    dayjs(getTodayStartDate()).format("YYYY-MM-DD HH:mm:ss"),
    dayjs(getTodayStartDate()).format("YYYY-MM-DD HH:mm:ss"),
  ];
};

const duplicateDialogFromRef = ref();
/** 复制考试提交 */
const handleDuplicateDialogSubmit = () => {
  duplicateDialogFromRef.value
    .validate()
    .then(() => {
      duplicateDialogSubmitLoading.value = true;
      let data = {
        beginAt: duplicateDialogForm.value.timeRange[0],
        endAt: duplicateDialogForm.value.timeRange[1],
        step: duplicateDialogForm.value.step!,
      };
      duplicateApi(duplicateNowRow.value.id, data)
        .then(() => {
          CmeMessage({
            title: "成功",
            message: "复制考试成功",
            type: "success",
          });
          duplicateDialogVisible.value = false;
          fetch(1);
        })
        .catch(() => {
          duplicateDialogSubmitLoading.value = false;
        });
    })
    .catch(() => {});
};
const duplicateDialogSubmitLoading = ref(false);
const onDuplicateDialogClose = () => {
  duplicateDialogFromRef.value.resetFields();
  duplicateDialogSubmitLoading.value = false;
};

const duplicateDialogFormRules = {
  step: [{ required: true, message: "请选择步骤", trigger: ["change"] }],
  timeRange: [
    { required: true, message: "请选择考试时间", trigger: ["change"] },
  ],
};
</script>

<style scoped lang="less"></style>
