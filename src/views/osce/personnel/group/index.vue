<template>
  <div class="router-page">
    <QueryBar
      :query-params="queryParams"
      @on-search="fetch(1)"
      @on-reset="fetch(1)"
    >
      <template #query-form>
        <el-form-item prop="name" label="组名">
          <el-input
            placeholder="请输入考生组组名"
            clearable
            v-model="queryParams.name"
            style="width: 200px"
            @keyup.enter="fetch(1)"
          />
        </el-form-item>
      </template>
    </QueryBar>

    <ActionBar @on-reload="fetch(1)">
      <el-button
        type="primary"
        @click="onActionCreate"
        v-hasPermi="['osce:examinee-group:add']"
      >
        新增
        <template #icon>
          <Icon icon="ant-design:plus-outlined" size="15px" />
        </template>
      </el-button>
      <el-button
        type="danger"
        @click="onActionDelete"
        v-hasPermi="['osce:examinee-group:delete']"
      >
        删除
        <template #icon>
          <Icon
            icon="ant-design:delete-outlined"
            size="15px"
            color="var(--el-button-text-color)"
          />
        </template>
      </el-button>
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
        label="考生组名"
        fixed
        show-overflow-tooltip
        min-width="300px"
      />
      <el-table-column
        prop="createdAt"
        label="创建时间"
        show-overflow-tooltip
        min-width="180px"
        align="center"
      />
      <el-table-column
        prop="remark"
        label="备注"
        show-overflow-tooltip
        min-width="300px"
      />
      <el-table-column label="操作" fixed="right" width="250px" align="center">
        <template #default="scope">
          <el-button
            size="small"
            type="primary"
            @click="onEdit(scope.row)"
            v-hasPermi="['osce:examinee-group:update']"
            text
          >
            修改
          </el-button>
          <el-button
            size="small"
            type="primary"
            @click="onModify(scope.row)"
            v-hasPermi="['osce:examinee-group:update']"
            text
          >
            维护考生组
          </el-button>
          <el-button
            size="small"
            type="danger"
            @click="onDelete(scope.row)"
            v-hasPermi="['osce:examinee-group:delete']"
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

    <!-- 弹窗 -->
    <el-dialog
      v-model="dialogFormVisible"
      :title="dialogTitle"
      width="400px"
      @closed="onDialogClose"
      align-center
      :close-on-click-modal="false"
    >
      <el-form
        :model="dialogForm"
        label-width="100px"
        ref="dialogFromRef"
        :rules="dialogFormRules"
        @submit.prevent
        label-position="top"
      >
        <el-form-item label="考生组组名" prop="name">
          <el-input v-model="dialogForm.name" placeholder="请输入考生组组名" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input
            type="textarea"
            v-model="dialogForm.remark"
            placeholder="请输入备注"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" plain @click="dialogFormVisible = false">
            取消
          </el-button>
          <el-button
            type="primary"
            @click="onDialogSubmit"
            :loading="dialogSubmitLoading"
          >
            提交
          </el-button>
        </span>
      </template>
    </el-dialog>

    <Transfer v-model:dialogVisible="dialogVisible" :modify-id="modifyId" />
  </div>
</template>

<script lang="ts" setup>
import Transfer from "./components/Transfer.vue";
import {
  getGroupListApi,
  deleteGroupApi,
  postGroupApi,
  putGroupApi,
  GetGroupListReqType,
  GroupItemType,
  AddGroupType,
} from "@/api/osce/personnel/group";
import { getFormItemRule } from "@/utils/validate";

defineOptions({
  name: "OscePersonnelGroup",
});

const queryParams = ref<GetGroupListReqType>({
  pageNumber: 1,
  pageSize: 10,
  name: "",
});
onMounted(() => {
  fetch(1);
});
/**
 * 拉取列表
 */
const loading = ref(true);
const totalSize = ref(0);
const tableData = ref([]);
const fetch = (i = 0) => {
  loading.value = true;
  if (i !== 0) {
    queryParams.value.pageNumber = i;
  }
  getGroupListApi(queryParams.value)
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
 * 批量删除
 */
const onActionDelete = () => {
  if (selectionIds.value === "") {
    return CmeMessage({
      title: "提示",
      message: "请选择需要删除的考生组",
      type: "warning",
    });
  }
  CmeMessageBox.confirm("确定批量删除考生组吗？", "系统提示", {
    distinguishCancelAndClose: true,
    confirmButtonText: "确定",
    cancelButtonText: "取消",
  })
    .then(() => {
      deleteGroupApi(selectionIds.value)
        .then(() => {
          CmeMessage({
            title: "成功",
            message: "删除考生组成功",
            type: "success",
          });
          fetch(1);
        })
        .catch(() => {});
    })
    .catch(() => {});
};
/**
 * 操作栏的单个删除
 */
const onDelete = (row: GroupItemType) => {
  CmeMessageBox.confirm(`确定删除考生组“${row.name}”吗？`, "系统提示", {
    distinguishCancelAndClose: true,
    confirmButtonText: "确定",
    cancelButtonText: "取消",
  })
    .then(() => {
      deleteGroupApi(row.id + "")
        .then(() => {
          CmeMessage({
            title: "成功",
            message: "删除考生组成功",
            type: "success",
          });
          fetch(1);
        })
        .catch(() => {});
    })
    .catch(() => {});
};
/**
 * 弹窗控制
 */
const dialogFromRef = ref();
const dialogFormVisible = ref(false);
const dialogType = ref<"create" | "edit">("create");
const dialogSubmitLoading = ref(false);
const dialogForm = ref<AddGroupType>({
  name: "",
  remark: "",
});
const dialogTitle = computed(() => {
  enum DialogTitle {
    "create" = "新增考生组",
    "edit" = "修改考生组",
  }
  return DialogTitle[dialogType.value];
});
const onActionCreate = () => {
  dialogType.value = "create";
  dialogFormVisible.value = true;
};
const editId = ref<number>(-1);
const onEdit = (row: GroupItemType) => {
  dialogType.value = "edit";
  dialogFormVisible.value = true;
  // 弹窗赋值，不用nextTick的话会导致表单初始化值不为空
  nextTick(() => {
    Object.keys(dialogForm.value).forEach((key) => {
      dialogForm.value[key] = row[key];
    });
    editId.value = row.id;
  });
};
/**
 * 弹窗改表单提交
 */
const onDialogSubmit = () => {
  if (dialogSubmitLoading.value) {
    return;
  }
  dialogFromRef.value
    .validate()
    .then(() => {
      dialogSubmitLoading.value = true;
      if (dialogType.value === "create") {
        postGroupApi(dialogForm.value)
          .then(() => {
            CmeMessage({
              title: "成功",
              message: "新增考生组成功",
              type: "success",
            });
            dialogFormVisible.value = false;
            fetch(1);
          })
          .catch(() => {
            dialogSubmitLoading.value = false;
          });
      } else if (dialogType.value === "edit") {
        putGroupApi(dialogForm.value, editId.value)
          .then(() => {
            CmeMessage({
              title: "成功",
              message: "修改考生组成功",
              type: "success",
            });
            dialogFormVisible.value = false;
            fetch();
          })
          .catch(() => {
            dialogSubmitLoading.value = false;
          });
      }
    })
    .catch(() => {});
};
const onDialogClose = () => {
  dialogSubmitLoading.value = false;
  dialogFromRef.value.resetFields();
};
/**
 * 列表多选
 */
const selectionIds = ref<string>("");
const onSelectionChange = (val: GroupItemType[]) => {
  let idList = val.map((item) => item.id);
  selectionIds.value = idList.join(",");
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
/**
 * 维护考生组
 */
const dialogVisible = ref(false);
const modifyId = ref<number>();
const onModify = (row: GroupItemType) => {
  modifyId.value = row.id;
  dialogVisible.value = true;
};
watch(
  () => dialogVisible.value,
  () => {
    if (!dialogVisible.value) {
      modifyId.value = undefined;
      fetch();
    }
  },
);

const dialogFormRules = {
  name: [...getFormItemRule("考生组组名", 40, -1, true)],
  remark: [...getFormItemRule("备注", 100, -1, false)],
};
</script>

<style></style>
