<template>
  <div>
    <el-dialog
      v-model="dictDataVisible"
      title="字典条目"
      width="1200px"
      @closed=""
      destroy-on-close
      align-center
      :close-on-click-modal="false"
    >
      <div class="h-600px flex flex-col">
        <ActionBar
          @on-reload="fetch()"
          @on-headerchange="onHeaderChange"
          has-filter-btn
          :header-list="tableHeaderList"
          :header-selected="selectedHeader"
        >
          <el-button
            type="primary"
            @click="handleActionCreate"
            v-hasPermi="['system:dict-entry:add']"
          >
            新增
            <template #icon>
              <Icon icon="ant-design:plus-outlined" size="15px" />
            </template>
          </el-button>
          <el-button
            type="danger"
            @click="handleActionDelete"
            v-hasPermi="['system:dict-entry:delete']"
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

        <div class="bg-white flex-1 flex flex-col overflow-hidden">
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
              prop="label"
              label="字典标签"
              min-width="120px"
              fixed
              show-overflow-tooltip
              v-if="selectedHeader.includes('label')"
            />
            <el-table-column
              prop="value"
              label="字典键值"
              min-width="180px"
              fixed
              show-overflow-tooltip
              align="center"
              v-if="selectedHeader.includes('value')"
            />
            <el-table-column
              prop="order"
              label="排序"
              min-width="55px"
              fixed
              show-overflow-tooltip
              align="center"
              v-if="selectedHeader.includes('order')"
            />
            <el-table-column
              prop="createdAt"
              label="创建时间"
              min-width="180px"
              fixed
              show-overflow-tooltip
              v-if="selectedHeader.includes('createdAt')"
            />
            <el-table-column
              prop="remark"
              label="备注"
              min-width="210px"
              show-overflow-tooltip
              align="center"
              v-if="selectedHeader.includes('remark')"
            />
            <el-table-column
              label="操作"
              fixed="right"
              width="200px"
              align="center"
            >
              <template #default="{ row }">
                <el-button
                  size="small"
                  type="primary"
                  @click="handleEditClick(row)"
                  v-hasPermi="['system:dict-entry:update']"
                  text
                >
                  修改
                </el-button>
                <el-button
                  size="small"
                  type="danger"
                  @click="handleDeleteClick(row)"
                  v-hasPermi="['system:dict-entry:delete']"
                  text
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </el-dialog>

    <!-- 弹窗 -->
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
            <el-form-item label="字典标签" prop="label" class="prop-label">
              <el-input
                v-model="dialogForm.label"
                placeholder="请输入字典标签"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="字典键值" prop="value" class="prop-value">
              <el-input
                v-model="dialogForm.value"
                :disabled="dialogType === 'edit'"
                placeholder="请输入字典键值"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="排序" prop="order" class="prop-order">
              <el-input-number v-model="dialogForm.order" :min="1" />
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
  </div>
</template>

<script setup lang="ts">
import {
  PostDictEntriesParams,
  GetDictEntriesParams,
  getDictEntriesApi,
  DictTypesRow,
  deleteDictEntriesApi,
  DictDataRow,
  postDictEntriesApi,
  putDictEntriesApi,
} from "@/api/system/management/dict";

const dictDataVisible = inject<Ref<boolean>>("dictDataVisible");
const modifyTypeRow = inject<Ref<DictTypesRow>>("modifyTypeRow");

const queryParams = ref<GetDictEntriesParams>({
  label: "",
  value: "",
});

watch(
  () => dictDataVisible!.value,
  (val) => {
    if (val) {
      fetch();
    } else {
      queryParams.value.label = "";
      queryParams.value.value = "";
    }
  },
);

/** 拉取列表 */
const loading = ref(false);
const tableData = ref<DictDataRow[]>([]);
const fetch = () => {
  loading.value = true;

  getDictEntriesApi(queryParams.value, modifyTypeRow!.value.id)
    .then((res) => {
      tableData.value = res;
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
const dialogForm = ref<PostDictEntriesParams>({
  label: "",
  value: "",
  order: 1,
  remark: "",
});

const dialogTitle = computed(() => {
  enum DialogTitle {
    "create" = "新增字典条目",
    "edit" = "修改字典条目",
  }
  return DialogTitle[dialogType.value];
});
const handleActionCreate = () => {
  dialogType.value = "create";
  dialogForm.value.order = tableData.value.length + 1;
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
      message: "请选择需要删除的字典条目",
      type: "warning",
    });
  }
  CmeMessageBox.confirm("确定批量删除字典条目吗？", "系统提示", {
    distinguishCancelAndClose: true,
    confirmButtonText: "确定",
    cancelButtonText: "取消",
  })
    .then(() => {
      deleteDictEntriesApi(selectionIds.value, modifyTypeRow!.value.id)
        .then(() => {
          CmeMessage({
            title: "成功",
            message: "删除字典条目成功",
            type: "success",
          });
          fetch();
        })
        .catch(() => {});
    })
    .catch(() => {});
};

/** 操作栏的单个删除 */
const handleDeleteClick = (row: DictDataRow) => {
  CmeMessageBox.confirm(`确定删除字典条目“${row.label}”吗？`, "系统提示", {
    distinguishCancelAndClose: true,
    confirmButtonText: "确定",
    cancelButtonText: "取消",
  })
    .then(() => {
      deleteDictEntriesApi(row.id + "", modifyTypeRow!.value.id)
        .then(() => {
          CmeMessage({
            title: "成功",
            message: "删除字典条目成功",
            type: "success",
          });
          fetch();
        })
        .catch(() => {});
    })
    .catch(() => {});
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
        postDictEntriesApi(dialogForm.value, modifyTypeRow!.value.id)
          .then(() => {
            CmeMessage({
              title: "成功",
              message: "新增字典条目成功",
              type: "success",
            });
            dialogFormVisible.value = false;
            fetch();
          })
          .catch(() => {
            dialogSubmitLoading.value = false;
          });
      } else if (dialogType.value === "edit") {
        putDictEntriesApi(
          dialogForm.value,
          modifyTypeRow!.value.id,
          editId.value,
        )
          .then(() => {
            CmeMessage({
              title: "成功",
              message: "修改字典条目成功",
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

/** 校验 */
const dialogFormRules = {
  label: [...getFormItemRule("字典标签", 20, -1, true)],
  value: [...getFormItemRule("字典键值", 40, -1, true)],
  order: [{ required: true, message: "请输入字典键值", trigger: ["change"] }],
  remark: [...getFormItemRule("备注", 100)],
};

/** 表头控制 */
const tableHeaderList = ref([
  {
    prop: "label",
    label: "字典标签",
  },
  {
    prop: "value",
    label: "字典键值",
  },
  {
    prop: "order",
    label: "排序",
  },
  {
    prop: "createdAt",
    label: "创建时间",
  },
  {
    prop: "remark",
    label: "备注",
  },
]);
const selectedHeader = ref(tableHeaderList.value.map((item) => item.prop));
const onHeaderChange = (val: string[]) => {
  selectedHeader.value = val;
};
</script>

<style scoped lang="less"></style>
