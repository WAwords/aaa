<template>
  <div>
    <el-dialog
      v-model="myDialogVisible"
      title="选择考生"
      width="1200px"
      @close="onDialogClose"
      @closed="onDialogClosed"
      destroy-on-close
      align-center
      :close-on-click-modal="false"
    >
      <TransferLayout
        :leftTitle="leftTitle"
        :rightTitle="`当前已添加 ${rightList.length} 个考生`"
      >
        <template #leftHeaderHandle>
          <el-popover
            :width="400"
            trigger="click"
            v-model:visible="batchQueryVisible"
            @after-leave="queryNamesRef.clearValidate()"
          >
            <template #reference>
              <el-button size="small" type="primary"> 批量搜索 </el-button>
            </template>
            <el-form-item
              prop="names"
              ref="queryNamesRef"
              :rules="formRules.names"
            >
              <el-input
                placeholder="请输入要查询考生的完整姓名，每行一个姓名"
                clearable
                v-model="queryNames"
                type="textarea"
                maxlength="1000"
                show-word-limit
                :autosize="{ minRows: 5, maxRows: 20 }"
                resize="none"
              />
            </el-form-item>
            <div class="flex justify-end">
              <el-button
                type="primary"
                plain
                size="small"
                @click="onBatchQueryRest()"
              >
                重置
              </el-button>
              <el-button
                size="small"
                type="primary"
                @click="batchFetchLeftList()"
                :loading="batchQueryLoading"
              >
                查询
              </el-button>
            </div>
          </el-popover>

          <el-popover
            :width="300"
            trigger="click"
            v-model:visible="leftQueryVisible"
          >
            <template #reference>
              <el-button size="small" type="primary"> 搜索 </el-button>
            </template>
            <el-form
              :model="queryParams"
              ref="queryFromRef"
              label-position="top"
            >
              <el-row :gutter="40">
                <el-col :span="24">
                  <el-form-item prop="name" label="姓名">
                    <el-input
                      placeholder="请输入考生姓名"
                      clearable
                      v-model="queryParams.name"
                      @keyup.enter="fetchLeftList(1)"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="24">
                  <el-form-item prop="major" label="专业">
                    <el-input
                      placeholder="请输入考生专业"
                      clearable
                      v-model="queryParams.major"
                      @keyup.enter="fetchLeftList(1)"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="24">
                  <el-form-item prop="grade" label="年级">
                    <el-date-picker
                      v-model="queryParams.grade"
                      type="year"
                      placeholder="请选择年级"
                      value-format="YYYY"
                      :teleported="false"
                      style="width: 100%"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="24">
                  <el-form-item prop="examineeGroupId" label="考生组">
                    <el-select
                      v-model="queryParams.examineeGroupId"
                      placeholder="请选择考生组"
                      class="w-full"
                      :loading="selectGroupLoading"
                      @visible-change="fetchExamineeGroupOption"
                      :teleported="false"
                      filterable
                    >
                      <el-option
                        v-for="item in examineeGroupOption"
                        :key="item.id"
                        :label="item.name"
                        :value="item.id"
                      />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>
            </el-form>
            <div class="flex justify-end">
              <el-button
                size="small"
                type="primary"
                plain
                @click="
                  onLeftReset();
                  fetchLeftList(1);
                "
              >
                重置
              </el-button>
              <el-button size="small" type="primary" @click="fetchLeftList(1)">
                查询
              </el-button>
            </div>
          </el-popover>
        </template>

        <template #leftBody>
          <el-table
            ref="leftTableRef"
            v-loading="leftLoading"
            :data="leftList"
            class="w-full"
            @selection-change="onLeftSelectionChange"
            @select-all="handleSelectAllClick"
            :header-cell-class-name="cellClass"
            stripe
            style="height: 100%"
          >
            <template #empty>
              <el-empty description="暂无数据" />
            </template>
            <el-table-column
              type="selection"
              width="55"
              fixed
              :selectable="setLeftSelectable"
            />
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
              show-overflow-tooltip
              min-width="120px"
            />
            <el-table-column
              prop="user.genderName"
              label="性别"
              show-overflow-tooltip
              min-width="80px"
              align="center"
            />
            <el-table-column
              prop="studentNumber"
              label="学号"
              show-overflow-tooltip
              min-width="150px"
              align="center"
            />
            <el-table-column
              prop="major"
              label="专业"
              show-overflow-tooltip
              min-width="150px"
              align="center"
            />
            <el-table-column
              prop="grade"
              label="年级"
              show-overflow-tooltip
              min-width="80px"
              align="center"
            />
          </el-table>
        </template>

        <template #leftPagination>
          <el-pagination
            size="small"
            v-if="queryType === '1'"
            :pager-count="5"
            v-model:current-page="queryParams.pageNumber"
            v-model:page-size="queryParams.pageSize"
            :page-sizes="[10, 50, 100, 150, 200]"
            layout="total, sizes, prev, pager, next"
            :total="leftListTotal"
            @size-change="onLeftSizeChange"
            @current-change="onLeftCurrentChange"
          />
          <el-pagination
            size="small"
            v-else-if="queryType === '2'"
            :pager-count="5"
            v-model:current-page="queryParams.pageNumber"
            layout="total"
            :total="leftListTotal"
          />
        </template>

        <template #leftFooter>
          <el-button type="primary" @click="onAddRight">
            添加到考生列表
          </el-button>
        </template>

        <template #rightHeaderHandle>
          <el-popover
            :width="300"
            trigger="click"
            v-model:visible="rightQueryVisible"
          >
            <template #reference>
              <el-button size="small" type="primary"> 搜索 </el-button>
            </template>
            <el-form
              :model="queryParamsRight"
              label-width="60px"
              @submit.prevent
              label-position="top"
            >
              <el-row :gutter="40">
                <el-col :span="24">
                  <el-form-item label="姓名" prop="name">
                    <el-input
                      v-model="queryParamsRight.name"
                      placeholder="请输入考生姓名"
                      clearable
                      @keyup.enter="handleRightSearch()"
                    />
                  </el-form-item>
                </el-col>
              </el-row>
            </el-form>

            <div class="flex justify-end">
              <el-button
                size="small"
                type="primary"
                plain
                @click="
                  handleRightReset();
                  handleRightSearch();
                "
              >
                重置
              </el-button>
              <el-button
                size="small"
                type="primary"
                @click="handleRightSearch()"
              >
                查询
              </el-button>
            </div>
          </el-popover>
        </template>

        <template #rightBody>
          <el-table
            ref="stationTableRef"
            :data="rightListTemp"
            class="w-full"
            @selection-change="onRightSelectionChange"
            stripe
            style="height: 100%"
          >
            <template #empty>
              <el-empty class="h-500px" description="暂无数据" />
            </template>
            <el-table-column type="selection" width="55" fixed />
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
              show-overflow-tooltip
              min-width="120px"
            />
            <el-table-column
              prop="user.genderName"
              label="性别"
              show-overflow-tooltip
              min-width="80px"
              align="center"
            />
            <el-table-column
              prop="studentNumber"
              label="学号"
              show-overflow-tooltip
              min-width="150px"
              align="center"
            />
            <el-table-column
              prop="major"
              label="专业"
              show-overflow-tooltip
              min-width="150px"
              align="center"
            />
            <el-table-column
              prop="grade"
              label="年级"
              show-overflow-tooltip
              min-width="80px"
              align="center"
            />
          </el-table>
        </template>

        <template #rightFooter>
          <el-button type="primary" @click="onRemoveRight">
            移除考生
          </el-button>
        </template>
      </TransferLayout>

      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" plain @click="myDialogVisible = false">
            取消
          </el-button>
          <el-button
            type="primary"
            @click="onDialogSubmit"
            :loading="dialogSubmitLoading"
          >
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>

    <BatchQueryOverview
      ref="batchQueryOverviewRef"
      v-model:queryNames="queryNames"
      v-model:leftList="leftList"
      v-model:batchQueryVisible="batchQueryVisible"
      v-model:leftListTotal="leftListTotal"
    />
  </div>
</template>

<script setup lang="ts">
import {
  getExamineeListApi,
  batchExamineeListApi,
  GetExamineeListReqType,
} from "@/api/osce/personnel/examinee";
import { ExamineeListItemType } from "@/api/osce/exam/management";
import { getGroupListApi } from "@/api/osce/personnel/group";
import BatchQueryOverview from "@/views/osce/personnel/group/components/BatchQueryOverview.vue";

interface Props {
  dialogVisible: boolean;
  tableData: ExamineeListItemType[];
}
const props = withDefaults(defineProps<Props>(), {
  dialogVisible: false,
  tableData: () => [],
});
/**
 * dialog控制
 * 单独提供myDialogVisible，方便控制
 */
const myDialogVisible = ref(false);
watch(
  () => props.dialogVisible,
  (newVal) => {
    myDialogVisible.value = newVal;
    // dialog弹出时初始化
    if (newVal) {
      fetchLeftList(1);
      rightList.value = props.tableData;
      rightListTemp.value = rightList.value;
    } else {
      // 将查询类型置为‘普通’
      queryType.value = "1";
      onLeftReset();
      handleRightReset();
    }
  },
);

// 添加批量查询
/** 查询类型（1：普通 2：批量） */
const queryType = ref<"1" | "2">("1");
/** 批量查询--名字 */
const queryNames = ref<string>(``);
/** 批量查询--查询按钮加载状态 */
const batchQueryLoading = ref(false);
/** 批量查询框ref */
const queryNamesRef = ref();
/** 批量查询--重置 */
const onBatchQueryRest = () => {
  queryNames.value = "";
  queryNamesRef.value.clearValidate();
  // 重置后重新拉取初始列表
  fetchLeftList(1);
};
/** 批量查询 */
const batchFetchLeftList = () => {
  // 将普通查询栏的信息置空
  queryFromRef.value.resetFields();

  queryNamesRef.value
    .validate()
    .then(() => {
      let tempVal = queryNames.value.trim();
      // 去掉空行、去掉每个名字的前后空格、去重
      let names = tempVal
        .split("\n")
        .filter(Boolean)
        .map((item) => item.trim());
      names = [...new Set(names)];

      leftLoading.value = true;
      batchExamineeListApi({
        names,
      })
        .then((res) => {
          // 查询类型为‘批量’
          queryType.value = "2";
          leftListTotal.value = res.totalSize;
          leftList.value = res.dataList;
          leftLoading.value = false;
          batchQueryOverviewRef.value.handleBatchException(res.dataList, names);
        })
        .catch(() => {
          leftLoading.value = false;
        });
    })
    .catch(() => {});
};

const batchQueryOverviewRef = ref();

const dialogSubmitLoading = ref(false);
const onDialogSubmit = () => {
  if (rightList.value.length === 0) {
    CmeMessageBox.confirm(`没有选择考生，确定继续吗？`, "系统提示", {
      distinguishCancelAndClose: true,
      confirmButtonText: "确定",
      cancelButtonText: "取消",
    })
      .then(() => {
        emit("update:tableData", rightList.value);
        onDialogClosed();
      })
      .catch(() => {});
  } else {
    emit("update:tableData", rightList.value);
    onDialogClosed();
  }
};
const onDialogClosed = () => {
  emit("update:dialogVisible", false);
};

const batchQueryVisible = ref(false);
const leftQueryVisible = ref(false);
const rightQueryVisible = ref(false);
/** 关闭时 */
const onDialogClose = () => {
  batchQueryVisible.value = false;
  leftQueryVisible.value = false;
  rightQueryVisible.value = false;
};

const emit = defineEmits(["update:dialogVisible", "update:tableData"]);
/** 列表(left) */
const queryParams = ref<GetExamineeListReqType>({
  pageNumber: 1,
  pageSize: 10,
  name: "",
  major: "",
  grade: "",
});
const leftList = ref<ExamineeListItemType[]>([]);
const leftListTotal = ref(0);
const leftLoading = ref(false);
const resPageSize = ref();
const fetchLeftList = (i = 0) => {
  // 查询类型为‘普通’
  queryType.value = "1";
  // 将批量查询栏的信息置空
  queryNames.value = "";

  leftLoading.value = true;
  if (i !== 0) {
    queryParams.value.pageNumber = i;
  }
  getExamineeListApi(queryParams.value)
    .then((res) => {
      leftListTotal.value = res.totalSize;
      leftList.value = res.dataList;
      resPageSize.value = res.pageSize;
      leftLoading.value = false;
    })
    .catch(() => {
      leftLoading.value = false;
    });
};
/**
 * 重置搜索栏(left)
 */
const queryFromRef = ref();
const onLeftReset = () => {
  queryFromRef.value.resetFields();
};
/** leftTitle */
const leftTitle = computed(() => {
  let select = leftList.value.filter((i) => {
    return !rightList.value.map((j) => j.id).includes(i.id);
  });
  return `共查询到 ${leftListTotal.value} 个考生，本页 ${leftList.value.length} 个，可选 ${select.length} 个`;
});
/** 分页控制(left) */
const onLeftSizeChange = (i: number) => {
  queryParams.value.pageSize = i;
  fetchLeftList(1);
};
const onLeftCurrentChange = (i: number) => {
  fetchLeftList(i);
};
/**
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * 获取列表(right)
 */
const rightList = ref(props.tableData);
/** 设置左列表是否可选 */
const setLeftSelectable = (row: ExamineeListItemType) => {
  if (rightList.value.map((i) => i.id).includes(row.id)) {
    return false;
  } else {
    return true;
  }
};
const rightSelection = ref<ExamineeListItemType[]>([]);
const onRightSelectionChange = (selection: ExamineeListItemType[]) => {
  rightSelection.value = selection;
};
const leftSelection = ref<ExamineeListItemType[]>([]);
const onLeftSelectionChange = (selection: ExamineeListItemType[]) => {
  leftSelection.value = selection;
};
/**
 * 移除,添加
 */
const onRemoveRight = () => {
  rightList.value = rightList.value.filter((i) => {
    return !rightSelection.value.map((j) => j.id).includes(i.id);
  });
  rightListTemp.value = rightList.value.filter((i) => {
    return i.user.name.includes(queryParamsRight.value.name);
  });
};
const leftTableRef = ref();
const onAddRight = () => {
  rightList.value = [...leftSelection.value, ...rightList.value];
  leftTableRef.value.clearSelection();
  rightListTemp.value = rightList.value.filter((i) => {
    return i.user.name.includes(queryParamsRight.value.name);
  });
};
const rightListTemp = ref<ExamineeListItemType[]>([]);
/**
 * 搜索(right)
 */
const queryParamsRight = ref({
  name: "",
});
const handleRightSearch = () => {
  rightListTemp.value = rightList.value.filter((i) => {
    return i.user.name.includes(queryParamsRight.value.name.trim());
  });
};
/**
 * 重置搜索栏(right)
 */
const handleRightReset = () => {
  queryParamsRight.value.name = "";
};

/**
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * 全选状态改变
 */
const cellClass = (row: any) => {
  if (selectAllDisabled.value) {
    if (row.columnIndex === 0) {
      return "select-all-disabled";
    }
  }
};
const selectAllDisabled = computed(() => {
  let status = true;
  for (let i of leftList.value) {
    if (!rightList.value.map((i) => i.id).includes(i.id)) {
      status = false;
    }
  }
  return status;
});
const handleSelectAllClick = () => {
  if (selectAllDisabled.value) {
    leftTableRef.value.clearSelection();
  }
};
/**
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * 考生组选择列表获取
 */
const selectGroupLoading = ref(false);
const examineeGroupOption = ref<any[]>([]);
const fetchExamineeGroupOption = () => {
  selectGroupLoading.value = true;
  getGroupListApi({})
    .then((res) => {
      examineeGroupOption.value = res.dataList;
      selectGroupLoading.value = false;
    })
    .catch(() => {
      selectGroupLoading.value = false;
    });
};
/** 规则校验 */
const formRules = {
  names: [
    {
      validator: (rule: any, value: any, callback: any) => {
        rule;
        value;
        if (queryNames.value.trim()) {
          callback();
        } else {
          callback(new Error("请输入考生姓名"));
        }
      },
      trigger: "blur",
    },
  ],
};
</script>

<style lang="less" scoped>
::v-deep(.el-table .select-all-disabled .cell .el-checkbox__inner) {
  background-color: #f5f7fa;
  border-color: #dcdfe6;
  cursor: not-allowed;
}

/**
::-webkit-scrollbar 滚动条整体部分
::-webkit-scrollbar-thumb 滚动条里面的小方块，能上下左右移动（取决于是垂直滚动条还是水平滚动条）
::-webkit-scrollbar-track 滚动条的轨道（里面装有thumb）
::-webkit-scrollbar-button 滚动条轨道两端的按钮，允许通过点击微调小方块的位置
::-webkit-scrollbar-track-piece 内层轨道，滚动条中间部分（除去）
::-webkit-scrollbar-corner 边角，及两个滚动条的交汇处
::-webkit-resizer 两个滚动条的交汇处上用于通过拖动调整元素大小的小控件
*/
::v-deep(.el-textarea__inner::-webkit-scrollbar) {
  width: 8px;
  background-color: rgba(255, 255, 255, 0);
}

::v-deep(.el-textarea__inner::-webkit-scrollbar-thumb) {
  border-top-left-radius: 6px;
  border-top-right-radius: 7px;
  border-bottom-left-radius: 6px;
  border-bottom-right-radius: 7px;
  // 在这里使用box-shadow来代替了背景色
  box-shadow: 12px 12px 0 #dddee0 inset;
  border-right: 3px solid rgba(0, 0, 0, 0);
  border-bottom: 2px solid rgba(0, 0, 0, 0);
  border-top: 2px solid rgba(0, 0, 0, 0);
  @apply cursor-pointer;
}
::v-deep(.el-textarea__inner::-webkit-scrollbar-thumb:hover) {
  box-shadow: 12px 12px 0 var(--el-text-color-secondary) inset;
}
</style>
