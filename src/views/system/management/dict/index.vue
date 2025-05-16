<template>
  <div class="router-page">
    <QueryBar
      :query-params="queryParams"
      @on-search="fetch(1)"
      @on-reset="fetch(1)"
    >
      <template #query-form>
        <el-form-item prop="name" label="名称" class="prop-name">
          <el-input
            placeholder="请输入字典名称"
            clearable
            v-model="queryParams.name"
            @keyup.enter="fetch(1)"
          />
        </el-form-item>
        <el-form-item prop="code" label="编码" class="prop-code">
          <el-input
            placeholder="请输入字典编码"
            clearable
            v-model="queryParams.code"
            @keyup.enter="fetch(1)"
          />
        </el-form-item>
      </template>
    </QueryBar>

    <ActionBar
      @on-reload="fetch(1)"
      has-filter-btn
      v-model:header-list="tableHeaderList"
    >
      <el-button
        type="primary"
        @click="handleActionCreate"
        v-hasPermi="['system:dict-type:add']"
      >
        新增
        <template #icon>
          <Icon icon="ant-design:plus-outlined" size="15px" />
        </template>
      </el-button>
      <el-button
        type="danger"
        @click="handleActionDelete"
        v-hasPermi="['system:dict-type:delete']"
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
      style="height: 100%"
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
        label="字典名称"
        min-width="120px"
        fixed
        show-overflow-tooltip
        v-if="isColVisible('name', tableHeaderList)"
      />
      <el-table-column
        prop="code"
        label="字典编码"
        min-width="180px"
        show-overflow-tooltip
        align="center"
        v-if="isColVisible('code', tableHeaderList)"
      />
      <el-table-column
        prop="createdAt"
        label="创建时间"
        min-width="180px"
        show-overflow-tooltip
        align="center"
        v-if="isColVisible('createdAt', tableHeaderList)"
      />
      <el-table-column
        prop="remark"
        label="备注"
        min-width="210px"
        show-overflow-tooltip
        align="center"
        v-if="isColVisible('remark', tableHeaderList)"
      />
      <el-table-column label="操作" fixed="right" width="200px" align="center">
        <template #default="{ row }">
          <el-button
            size="small"
            type="primary"
            @click="handleEditClick(row)"
            v-hasPermi="['system:dict-type:update']"
            text
          >
            修改
          </el-button>
          <el-button
            size="small"
            type="primary"
            @click="handleModifyClick(row)"
            v-hasPermi="['system:dict-entry:list']"
            text
          >
            维护
          </el-button>
          <el-button
            size="small"
            type="danger"
            @click="handleDeleteClick(row)"
            v-hasPermi="['system:dict-type:delete']"
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
      :selNum="selectionIdList.length"
      @on-size-change="onSizeChange"
      @on-current-change="onCurrentChange"
    />

    <el-dialog
      v-model="dialogFormVisible"
      :title="dialogTitle"
      width="400px"
      @closed="onDialogClose"
      destroy-on-close
      align-center
      :close-on-click-modal="false"
    >
      <el-form
        :model="dialogForm"
        label-width="120px"
        ref="dialogFromRef"
        :rules="dialogFormRules"
        label-position="top"
      >
        <el-row :gutter="40">
          <el-col :span="24">
            <el-form-item label="字典名称" prop="name" class="prop-name">
              <el-input
                v-model="dialogForm.name"
                placeholder="请输入字典名称"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="字典编码" prop="code" class="prop-code">
              <el-input
                v-model="dialogForm.code"
                :disabled="dialogType === 'edit'"
                placeholder="请输入字典编码"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="备注" prop="remark" class="prop-remark">
              <el-input
                v-model="dialogForm.remark"
                type="textarea"
                placeholder="请输入备注"
              />
            </el-form-item>
          </el-col>
        </el-row>
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

    <!-- 字典数据弹窗 -->
    <DictData />
  </div>
</template>

<script setup lang="ts">
import {
  getDictTypesApi,
  PostDictTypesParams,
  DictTypesRow,
  postDictTypeApi,
  putDictTypeApi,
  deleteDictTypesApi,
} from "@/api/system/management/dict";
import DictData from "./components/DictData.vue";

defineOptions({
  name: "SystemManagementDict",
});

const queryParams = ref<PostDictTypesParams>({
  pageNumber: 1,
  pageSize: 10,
  name: "",
  code: "",
});

onMounted(() => {
  fetch(1);
});

/** 拉取列表 */
const loading = ref(false);
const totalSize = ref(0);
const tableData = ref<DictTypesRow[]>([]);
const fetch = (i = 0) => {
  loading.value = true;
  if (i !== 0) {
    queryParams.value.pageNumber = i;
  }
  getDictTypesApi(queryParams.value)
    .then((res) => {
      totalSize.value = res.totalSize;
      tableData.value = res.dataList;
      loading.value = false;
    })
    .catch(() => {
      loading.value = false;
    });
};

/** 弹窗控制 */
const dialogFromRef = ref();
const dialogFormVisible = ref(false);
const dialogType = ref<"create" | "edit">("create");
const dialogSubmitLoading = ref(false);
const dialogForm = ref<PostDictTypesParams>({
  name: "",
  code: "",
  remark: "",
});

const dialogTitle = computed(() => {
  enum DialogTitle {
    "create" = "新增字典",
    "edit" = "修改字典",
  }
  return DialogTitle[dialogType.value];
});
const handleActionCreate = () => {
  dialogType.value = "create";
  dialogFormVisible.value = true;
};
const editId = ref<number>(-1);
const handleEditClick = (row: DictTypesRow) => {
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

/** 弹窗改表单提交 */
const onDialogSubmit = () => {
  if (dialogSubmitLoading.value) {
    return;
  }
  dialogFromRef.value
    .validate()
    .then(() => {
      dialogSubmitLoading.value = true;
      if (dialogType.value === "create") {
        postDictTypeApi(dialogForm.value)
          .then(() => {
            CmeMessage({
              title: "成功",
              message: "新增字典成功",
              type: "success",
            });
            dialogFormVisible.value = false;
            fetch(1);
          })
          .catch(() => {
            dialogSubmitLoading.value = false;
          });
      } else if (dialogType.value === "edit") {
        putDictTypeApi(dialogForm.value, editId.value)
          .then(() => {
            CmeMessage({
              title: "成功",
              message: "修改字典成功",
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

/** 关闭弹窗 */
const onDialogClose = () => {
  dialogSubmitLoading.value = false;
  dialogFromRef.value.resetFields();
};

/** 字典数据弹窗显示 */
const dictDataVisible = ref(false);
provide("dictDataVisible", dictDataVisible);
const modifyTypeRow = ref<DictTypesRow>();
provide("modifyTypeRow", modifyTypeRow);
/** 维护字典 */
const handleModifyClick = (row: DictTypesRow) => {
  modifyTypeRow.value = row;
  dictDataVisible.value = true;
};

/** 列表多选 */
const selectionIds = ref<string>("");
const selectionIdList = ref<number[]>([]);
const onSelectionChange = (val: DictTypesRow[]) => {
  let idList = val.map((item) => item.id);
  selectionIdList.value = idList;
  selectionIds.value = idList.join(",");
};

/** 批量删除 */
const handleActionDelete = () => {
  if (selectionIds.value === "") {
    return CmeMessage({
      title: "提示",
      message: "请选择需要删除的字典",
      type: "warning",
    });
  }
  CmeMessageBox.confirm("确定批量删除字典吗？", "系统提示", {
    distinguishCancelAndClose: true,
    confirmButtonText: "确定",
    cancelButtonText: "取消",
  })
    .then(() => {
      deleteDictTypesApi(selectionIds.value)
        .then(() => {
          CmeMessage({
            title: "成功",
            message: "删除字典成功",
            type: "success",
          });
          fetch(1);
        })
        .catch(() => {});
    })
    .catch(() => {});
};

/** 操作栏的单个删除 */
const handleDeleteClick = (row: DictTypesRow) => {
  CmeMessageBox.confirm(`确定删除字典“${row.name}”吗？`, "系统提示", {
    distinguishCancelAndClose: true,
    confirmButtonText: "确定",
    cancelButtonText: "取消",
  })
    .then(() => {
      deleteDictTypesApi(row.id + "")
        .then(() => {
          CmeMessage({
            title: "成功",
            message: "删除字典成功",
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

/** 校验 */
const dialogFormRules = {
  name: [...getFormItemRule("字典名称", 20, -1, true)],
  code: [...getFormItemRule("字典编码", 40, -1, true)],
  remark: [...getFormItemRule("备注", 100)],
};

/** 表头控制 */
const tableHeaderList = ref<TableHerderItem[]>([
  {
    prop: "name",
    label: "字典名称",
    visible: true,
  },
  {
    prop: "code",
    label: "字典编码",
    visible: true,
  },
  {
    prop: "createdAt",
    label: "创建时间",
    visible: true,
  },
  {
    prop: "remark",
    label: "备注",
    visible: true,
  },
]);

/** 当前列是否可见 */
const isColVisible = (prop: string, list: TableHerderItem[]) => {
  return list.find((item) => item.prop === prop)?.visible ?? false;
};

type TableHerderItem = {
  prop: string;
  label: string;
  visible: boolean;
};
</script>

<style scoped lang="less"></style>
