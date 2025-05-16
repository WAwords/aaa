<template>
  <div>
    <el-dialog
      v-model="modifyVisible"
      title="APP版本"
      width="1200px"
      @closed=""
      destroy-on-close
      align-center
      :close-on-click-modal="false"
    >
      <QueryBar
        :query-params="queryParams"
        @on-search="fetch(1)"
        @on-reset="fetch(1)"
      >
        <template #query-form>
          <el-form-item prop="name" label="APP版本名关键字" class="label-name">
            <el-input
              placeholder="请输入APP版本名关键字"
              clearable
              v-model="queryParams.name"
              @keyup.enter="fetch(1)"
            />
          </el-form-item>
          <el-form-item
            prop="platform"
            label="APP运行平台"
            class="label-platform"
          >
            <el-select
              v-model="queryParams.platform"
              placeholder="请选择APP运行平台"
              filterable
            >
              <el-option
                v-for="item in platformOption"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </template>
      </QueryBar>

      <ActionBar
        @on-reload="fetch(1)"
        has-filter-btn
        :header-list="tableHeaderList"
      >
        <el-button
          type="primary"
          @click="handleActionCreate"
          v-hasPermi="['system:app-version:add']"
        >
          新增
          <template #icon>
            <Icon icon="ant-design:plus-outlined" size="15px" />
          </template>
        </el-button>
        <el-button
          type="danger"
          @click="handleActionDelete"
          v-hasPermi="['system:app-version:delete']"
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
        style="height: 500px"
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
          label="版本名"
          min-width="180px"
          show-overflow-tooltip
          v-if="isColVisible('name', tableHeaderList)"
          fixed
        />
        <el-table-column
          prop="code"
          label="版本号"
          min-width="180px"
          show-overflow-tooltip
          align="center"
          v-if="isColVisible('code', tableHeaderList)"
        />
        <el-table-column
          prop="platform"
          label="平台"
          min-width="180px"
          show-overflow-tooltip
          align="center"
          v-if="isColVisible('platform', tableHeaderList)"
        >
          <template #default="{ row }">
            {{
              platformOption.find((item) => item.value === row.platform)?.label
            }}
          </template>
        </el-table-column>
        <el-table-column
          prop="fullUpdate"
          label="是否全量更新"
          min-width="180px"
          show-overflow-tooltip
          align="center"
          v-if="isColVisible('fullUpdate', tableHeaderList)"
        >
          <template #default="{ row }">
            {{ row.fullUpdate ? "是" : "否" }}
          </template>
        </el-table-column>
        <el-table-column
          prop="downloadUrl"
          label="下载地址"
          min-width="180px"
          show-overflow-tooltip
          align="center"
          v-if="isColVisible('downloadUrl', tableHeaderList)"
        />
        <el-table-column
          prop="releaseDate"
          label="发布日期"
          min-width="180px"
          show-overflow-tooltip
          align="center"
          v-if="isColVisible('releaseDate', tableHeaderList)"
        />
        <el-table-column
          prop="releaseNotes"
          label="发布说明"
          min-width="180px"
          show-overflow-tooltip
          align="center"
          v-if="isColVisible('releaseNotes', tableHeaderList)"
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
          prop="enabled"
          label="是否启用"
          min-width="80px"
          show-overflow-tooltip
          align="center"
          v-if="isColVisible('enabled', tableHeaderList)"
          fixed="right"
        >
          <template #default="{ row, $index }">
            <!-- {{ row.enabled ? "是" : "否" }} -->
            <el-switch
              v-model="row.enabled"
              @change="(val) => handleEnabledChange(val, $index, row)"
              :loading="$index === enabledLoadingIndex"
            />
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          fixed="right"
          width="260px"
          align="center"
        >
          <template #default="{ row }">
            <el-button
              size="small"
              type="primary"
              @click="handleCreateBy(row)"
              v-hasPermi="['system:app-version:add']"
              text
            >
              以此为模板新增
            </el-button>
            <el-button
              size="small"
              type="primary"
              @click="handleEditClick(row)"
              v-hasPermi="['system:app-version:update']"
              text
            >
              修改
            </el-button>
            <el-button
              size="small"
              type="danger"
              @click="handleDeleteClick(row)"
              v-hasPermi="['system:app-version:delete']"
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
    </el-dialog>

    <!-- 弹窗 -->
    <el-dialog
      v-model="dialogFormVisible"
      :title="dialogTitle"
      width="800px"
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
          <el-col :span="12">
            <el-form-item label="版本名" prop="name" class="prop-name">
              <el-input
                v-model="dialogForm.name"
                placeholder="请输入版本名 如：0.1.0"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="版本号" prop="code" class="prop-code">
              <el-input
                v-model="dialogForm.code"
                placeholder="请输入版本号 如：1009"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="是否全量更新"
              prop="fullUpdate"
              class="prop-fullUpdate"
            >
              <el-radio-group v-model="dialogForm.fullUpdate">
                <el-radio :label="false" :value="false"> 否 </el-radio>
                <el-radio :label="true" :value="true"> 是 </el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="platformVisible">
            <el-form-item label="平台" prop="platform" class="prop-platform">
              <el-select
                v-model="dialogForm.platform"
                placeholder="请选择APP运行平台"
                filterable
              >
                <el-option
                  v-for="item in platformOption"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24" v-if="downloadUrlVisible">
            <el-form-item
              label="下载地址"
              prop="downloadUrl"
              class="prop-downloadUrl"
            >
              <template #label>
                <div class="inline-flex items-center">
                  <el-tooltip
                    content="例：http://192.168.1.1:80/download/xxx（ .wgt 或 .apk ）"
                    placement="top"
                  >
                    <div class="flex items-center h-full mr-1">
                      <el-icon><WarningFilled /></el-icon>
                    </div>
                  </el-tooltip>
                  下载地址
                </div>
              </template>
              <el-input
                v-model="dialogForm.downloadUrl"
                placeholder="请输入下载地址"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="是否启用" prop="enabled" class="prop-enabled">
              <el-radio-group v-model="dialogForm.enabled">
                <el-radio :label="false" :value="false"> 否 </el-radio>
                <el-radio :label="true" :value="true"> 是 </el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="发布日期"
              prop="releaseDate"
              class="prop-releaseDate"
            >
              <el-date-picker
                v-model="dialogForm.releaseDate"
                type="date"
                placeholder="请选择发布日期"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item
              label="发布说明"
              prop="releaseNotes"
              class="prop-releaseNotes"
            >
              <el-input
                v-model="dialogForm.releaseNotes"
                type="textarea"
                placeholder="请输入发布说明"
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
            @click="handleDialogSubmit"
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
import { WarningFilled } from "@element-plus/icons-vue";
import {
  getAppsVersionsApi,
  postAppsVersionsApi,
  putAppsVersionsApi,
  deleteAppsVersionsApi,
  patchAppsVersionsStatusApi,
} from "@/api/system/management/app";
import type {
  AppsVersionsListItem,
  AppsVersionsQueryType,
} from "@/api/system/management/app";
import type { AppsListItem } from "@/api/system/management/app";
import { dayjs } from "element-plus";

const modifyVisible = inject<Ref<boolean>>("modifyVisible");
const modifyRow = inject<Ref<AppsListItem>>("modifyRow");

const queryParams = ref<AppsVersionsQueryType>({
  name: "",
  platform: "",
});

watch(
  () => modifyVisible!.value,
  (val) => {
    if (val) {
      fetch();
    } else {
      queryParams.value.name = "";
      queryParams.value.platform = "";
    }
  },
);

/** 拉取列表 */
const loading = ref(false);
const totalSize = ref(0);
const tableData = ref<AppsVersionsListItem[]>([]);
const fetch = (i = 0) => {
  loading.value = true;
  if (i !== 0) {
    queryParams.value.pageNumber = i;
  }
  getAppsVersionsApi(queryParams.value, modifyRow!.value.id)
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
const dialogForm = ref<AppsVersionsListItem>({
  name: "",
  code: undefined,
  platform: "1",
  fullUpdate: false,
  downloadUrl: "",
  enabled: false,
  releaseDate: "",
  releaseNotes: "",
  createdAt: "",
});

const dialogTitle = computed(() => {
  enum DialogTitle {
    "create" = "新增APP版本",
    "edit" = "修改APP版本",
  }
  return DialogTitle[dialogType.value];
});
const handleActionCreate = () => {
  dialogType.value = "create";
  dialogFormVisible.value = true;

  dialogForm.value.releaseDate = dayjs(new Date()).format("YYYY-MM-DD");
};
const editId = ref<number>(-1);
const handleEditClick = (row: AppsVersionsListItem) => {
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

/** 以某个版本为模板新增 */
const handleCreateBy = (row: AppsVersionsListItem) => {
  dialogType.value = "create";
  dialogFormVisible.value = true;

  // 弹窗赋值，不用nextTick的话会导致表单初始化值不为空
  nextTick(() => {
    Object.keys(dialogForm.value).forEach((key) => {
      dialogForm.value[key] = row[key];
    });
    dialogForm.value.releaseDate = dayjs(new Date()).format("YYYY-MM-DD");
  });
};

/** 弹窗改表单提交 */
const handleDialogSubmit = () => {
  // 数据传输对象
  let tempObj = JSON.parse(JSON.stringify(dialogForm.value));

  // 删掉不需要的属性
  if (!downloadUrlVisible.value) {
    delete tempObj.downloadUrl;
  }
  // 删掉不需要的属性
  if (!platformVisible.value) {
    delete tempObj.platform;
  }

  if (dialogSubmitLoading.value) {
    return;
  }
  dialogFromRef.value
    .validate()
    .then(() => {
      dialogSubmitLoading.value = true;
      if (dialogType.value === "create") {
        postAppsVersionsApi(tempObj, modifyRow!.value.id)
          .then(() => {
            CmeMessage({
              title: "成功",
              message: "新增APP版本成功",
              type: "success",
            });
            dialogFormVisible.value = false;
            fetch(1);
          })
          .catch(() => {
            dialogSubmitLoading.value = false;
          });
      } else if (dialogType.value === "edit") {
        putAppsVersionsApi(tempObj, modifyRow!.value.id, editId.value)
          .then(() => {
            CmeMessage({
              title: "成功",
              message: "修改APP版本成功",
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

const enabledLoadingIndex = ref(-1);
/** 启用状态修改 */
const handleEnabledChange = (
  val: any,
  index: number,
  row: AppsVersionsListItem,
) => {
  let params = {
    enabled: val,
  };

  enabledLoadingIndex.value = index;
  patchAppsVersionsStatusApi(params, modifyRow!.value.id, row.id)
    .then(() => {
      tableData.value[index].enabled = val;
      enabledLoadingIndex.value = -1;
    })
    .catch(() => {
      tableData.value[index].enabled = !val;
      enabledLoadingIndex.value = -1;
    });
};

/** 关闭弹窗 */
const onDialogClose = () => {
  dialogSubmitLoading.value = false;
  dialogFromRef.value.resetFields();
};

/** 列表多选 */
const selectionIds = ref<string>("");
const selectionIdList = ref<number[]>([]);
const onSelectionChange = (val: AppsVersionsListItem[]) => {
  let idList = val.map((item) => item.id);
  selectionIdList.value = idList;
  selectionIds.value = idList.join(",");
};

/** 批量删除 */
const handleActionDelete = () => {
  if (selectionIds.value === "") {
    return CmeMessage({
      title: "提示",
      message: "请选择需要删除的APP版本",
      type: "warning",
    });
  }
  CmeMessageBox.confirm("确定批量删除APP版本吗？", "系统提示", {
    distinguishCancelAndClose: true,
    confirmButtonText: "确定",
    cancelButtonText: "取消",
  })
    .then(() => {
      deleteAppsVersionsApi(selectionIds.value, modifyRow!.value.id)
        .then(() => {
          CmeMessage({
            title: "成功",
            message: "删除APP版本成功",
            type: "success",
          });
          fetch(1);
        })
        .catch(() => {});
    })
    .catch(() => {});
};

/** 操作栏的单个删除 */
const handleDeleteClick = (row: AppsVersionsListItem) => {
  CmeMessageBox.confirm(`确定删除APP版本“${row.name}”吗？`, "系统提示", {
    distinguishCancelAndClose: true,
    confirmButtonText: "确定",
    cancelButtonText: "取消",
  })
    .then(() => {
      deleteAppsVersionsApi(row.id + "", modifyRow!.value.id)
        .then(() => {
          CmeMessage({
            title: "成功",
            message: "删除APP版本成功",
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

/** 编辑下载地址是否可见 */
const downloadUrlVisible = computed(() => {
  // 如果是非全量更新或者安卓的全量更新，需要显示下载地址
  if (!dialogForm.value.fullUpdate || dialogForm.value.platform === "1") {
    return true;
  } else {
    return false;
  }
});

/** 选择平台是否可见 */
const platformVisible = computed(() => {
  if (dialogForm.value.fullUpdate) {
    return true;
  } else {
    return false;
  }
});

/** 平台字典 */
const platformOption = [
  {
    value: "1",
    label: "android",
  },
  {
    value: "2",
    label: "ios",
  },
];

/** 校验 */
const dialogFormRules = {
  name: [...getFormItemRule("版本名", 20, -1, true)],
  code: [
    ...getFormItemRule("版本号", 7, -1, true),
    {
      pattern: /^\d+$/,
      message: "请输入正确的版本号",
      trigger: ["blur"],
    },
  ],
  platform: [
    {
      required: true,
      message: "请选择APP运行平台",
      trigger: ["change"],
    },
  ],
  downloadUrl: [...getFormItemRule("下载地址", 150, -1, true)],
  releaseDate: [
    {
      required: true,
      message: "请选择发布日期",
      trigger: ["change"],
    },
  ],
  releaseNotes: [...getFormItemRule("发布说明", 500)],
};

/** 表头控制 */
const tableHeaderList = ref([
  {
    prop: "name",
    label: "版本名",
    visible: true,
  },
  {
    prop: "code",
    label: "版本号",
    visible: true,
  },
  {
    prop: "platform",
    label: "平台",
    visible: true,
  },
  {
    prop: "fullUpdate",
    label: "是否全量更新",
    visible: true,
  },
  {
    prop: "downloadUrl",
    label: "下载地址",
    visible: true,
  },
  {
    prop: "enabled",
    label: "是否启用",
    visible: true,
  },
  {
    prop: "releaseDate",
    label: "发布日期",
    visible: true,
  },
  {
    prop: "releaseNotes",
    label: "发布说明",
    visible: true,
  },
  {
    prop: "createdAt",
    label: "创建时间",
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
