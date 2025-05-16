<template>
  <div class="router-page">
    <QueryBar
      :query-params="queryParams"
      @on-search="fetch()"
      @on-reset="fetch()"
      label-width="60px"
    >
      <template #query-form>
        <el-form-item prop="name" label="菜单名称" class="prop-name">
          <el-input
            placeholder="请输入菜单名称"
            clearable
            v-model="queryParams.name"
            style="width: 200px"
            @keyup.enter="fetch()"
          />
        </el-form-item>
        <el-form-item
          prop="disabled"
          label="状态"
          v-if="false && false"
          class="prop-disabled"
        >
          <el-select
            v-model="queryParams.disabled"
            placeholder="请选择菜单状态"
            style="width: 200px"
            filterable
          >
            <el-option
              v-for="item in disabledOption"
              :key="item.label"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
      </template>
    </QueryBar>

    <ActionBar @on-reload="fetch()">
      <el-button type="primary" @click="onAdd" v-hasPermi="['system:menu:add']">
        新增
        <template #icon>
          <Icon icon="ant-design:plus-outlined" size="15px" />
        </template>
      </el-button>
    </ActionBar>

    <el-table v-loading="loading" :data="tableData" row-key="id" height="100%">
      <el-table-column
        prop="name"
        label="菜单名称"
        show-overflow-tooltip
        min-width="300"
      ></el-table-column>
      <el-table-column prop="icon" label="图标" min-width="60" align="center">
        <template #default="{ row }">
          <div class="flex justify-center">
            <Icon :icon="row.icon" />
          </div>
        </template>
      </el-table-column>
      <el-table-column
        prop="order"
        label="排序"
        min-width="60"
        align="center"
      ></el-table-column>
      <el-table-column
        prop="permission"
        label="权限标识"
        min-width="180"
        :show-overflow-tooltip="true"
      ></el-table-column>
      <el-table-column
        prop="component"
        label="组件路径"
        :show-overflow-tooltip="true"
        min-width="240"
      ></el-table-column>
      <el-table-column
        prop="disabled"
        label="状态"
        min-width="60"
        align="center"
      >
        <template #default="scope">
          {{ scope.row.disabled ? "禁用" : "启用" }}
        </template>
      </el-table-column>
      <el-table-column
        label="创建时间"
        align="center"
        prop="createdAt"
        min-width="180"
      >
      </el-table-column>
      <el-table-column label="操作" fixed="right" width="200px" align="center">
        <template #default="scope">
          <el-button
            size="small"
            type="primary"
            @click="onUpdate(scope.row)"
            v-hasPermi="['system:menu:update']"
            text
          >
            修改
          </el-button>
          <el-button
            size="small"
            type="primary"
            @click="onAdd(scope.row)"
            v-hasPermi="['system:menu:add']"
            text
          >
            新增
          </el-button>
          <el-button
            size="small"
            type="danger"
            @click="onDelete(scope.row)"
            v-hasPermi="['system:menu:delete']"
            text
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 弹窗 -->
    <el-dialog
      v-model="dialogFormVisible"
      :title="dialogTitle"
      width="800px"
      @close="iconSelectVis = false"
      @closed="onDialogClose"
      align-center
      :close-on-click-modal="false"
    >
      <el-form
        :model="dialogForm"
        label-width="100px"
        ref="dialogFromRef"
        :rules="dialogFormRules"
        label-position="top"
      >
        <el-row :gutter="40">
          <!-- 上级菜单 -->
          <el-col :span="12">
            <el-form-item label="上级菜单" prop="parentId">
              <el-tree-select
                style="width: 100%"
                v-model="dialogForm.parentId"
                :data="menuOptions"
                value-key="id"
                placeholder="选择上级菜单"
                check-strictly
                :props="{
                  checkStrictly: true,
                  value: 'id',
                  label: 'name',
                }"
              >
              </el-tree-select>
            </el-form-item>
          </el-col>
          <!-- 菜单类型 -->
          <el-col :span="12">
            <el-form-item label="菜单类型" prop="type">
              <el-radio-group v-model="dialogForm.type">
                <el-radio label="C" value="C">目录</el-radio>
                <el-radio label="M" value="M">菜单</el-radio>
                <el-radio label="B" value="B">按钮</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <!-- 菜单图标 -->
          <el-col :span="12" v-if="dialogForm.type != 'B'">
            <el-form-item label="菜单图标" prop="icon">
              <el-popover
                placement="bottom-start"
                width="400"
                :visible="iconSelectVis"
              >
                <template #reference>
                  <el-input
                    slot="reference"
                    placeholder="点击选择图标"
                    readonly
                    v-model="dialogForm.icon"
                    @click="iconSelectVis = !iconSelectVis"
                  >
                    <template #prefix>
                      <Icon :icon="dialogForm.icon" />
                    </template>
                  </el-input>
                </template>
                <IconSelect
                  v-model:active-icon="dialogForm.icon"
                  @selected="iconSelectVis = false"
                />
              </el-popover>
            </el-form-item>
          </el-col>
          <!-- 菜单名称 -->
          <el-col :span="12">
            <el-form-item label="菜单名称" prop="name" required>
              <el-input
                v-model="dialogForm.name"
                placeholder="请输入菜单名称"
              />
            </el-form-item>
          </el-col>
          <!-- 显示排序 -->
          <el-col :span="12">
            <el-form-item label="显示排序" prop="order" required>
              <el-input-number v-model="dialogForm.order" :min="0" />
            </el-form-item>
          </el-col>
          <!-- 是否外链 -->
          <el-col :span="12" v-if="dialogForm.type != 'B' && false">
            <el-form-item prop="external">
              <template #label>
                <el-tooltip
                  content="选择是外链则路由地址需要以`http(s)://`开头"
                  placement="top"
                >
                  <div class="flex items-center h-full pr-1">
                    <el-icon><WarningFilled /></el-icon>
                  </div>
                </el-tooltip>
                是否外链
              </template>
              <el-radio-group v-model="dialogForm.external">
                <el-radio :label="true" :value="true">是</el-radio>
                <el-radio :label="false" :value="false">否</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <!-- 路由地址 -->
          <el-col :span="12" v-if="dialogForm.type != 'B'">
            <el-form-item prop="path" required>
              <template #label>
                <div class="inline-flex items-center">
                  <el-tooltip
                    content="访问的路由地址，如：`user`，如外网地址需内链访问则以`http(s)://`开头"
                    placement="top"
                    :popper-style="{ maxWidth: '500px' }"
                  >
                    <div class="flex items-center h-full mr-1">
                      <el-icon><WarningFilled /></el-icon>
                    </div>
                  </el-tooltip>
                  路由地址
                </div>
              </template>
              <el-input
                v-model.trim="dialogForm.path"
                placeholder="请输入路由地址"
              />
            </el-form-item>
          </el-col>
          <!-- 组件路径 -->
          <el-col :span="12" v-if="dialogForm.type == 'M'">
            <el-form-item prop="component" required>
              <template #label>
                <div class="inline-flex items-center">
                  <el-tooltip
                    content="访问的组件路径，如：`system/user/index`，默认在`views`目录下"
                    placement="top"
                  >
                    <div class="flex items-center h-full mr-1">
                      <el-icon><WarningFilled /></el-icon>
                    </div>
                  </el-tooltip>
                  组件路径
                </div>
              </template>
              <el-input
                v-model.trim="dialogForm.component"
                placeholder="请输入组件路径"
              />
            </el-form-item>
          </el-col>
          <!-- 权限字符 -->
          <el-col :span="12" v-if="dialogForm.type != 'C'">
            <el-form-item prop="permission">
              <template #label>
                <div class="inline-flex items-center">
                  <el-tooltip content="控制器中定义的权限字符" placement="top">
                    <div class="flex items-center h-full mr-1">
                      <el-icon><WarningFilled /></el-icon>
                    </div>
                  </el-tooltip>
                  权限字符
                </div>
              </template>
              <el-input
                v-model="dialogForm.permission"
                placeholder="请输入权限标识"
                maxlength="100"
              />
            </el-form-item>
          </el-col>
          <!-- 路由参数 -->
          <el-col :span="12" v-if="dialogForm.type == 'M' && false">
            <el-form-item prop="query">
              <el-input
                v-model.trim="dialogForm.query"
                placeholder="请输入路由参数"
                maxlength="255"
              />
              <template #label>
                <el-tooltip
                  content='访问路由的默认传递参数，如：`{"id": 1, "name": "ry"}`'
                  placement="top"
                >
                  <div class="flex items-center h-full pr-1">
                    <el-icon><WarningFilled /></el-icon>
                  </div>
                </el-tooltip>
                路由参数
              </template>
            </el-form-item>
          </el-col>
          <!-- 是否缓存 -->
          <el-col :span="12" v-if="dialogForm.type == 'M' && false">
            <el-form-item prop="cacheable">
              <template #label>
                <el-tooltip
                  content="选择是则会被`keep-alive`缓存，需要匹配组件的`name`和地址保持一致"
                  placement="top"
                >
                  <div class="flex items-center h-full pr-1">
                    <el-icon><WarningFilled /></el-icon>
                  </div>
                </el-tooltip>
                是否缓存
              </template>
              <el-radio-group v-model="dialogForm.cacheable">
                <el-radio :label="true" :value="true">缓存</el-radio>
                <el-radio :label="false" :value="false">不缓存</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <!-- 组件路径 -->
          <el-col :span="12" v-if="dialogForm.menuType == 'C'">
            <el-form-item prop="component">
              <span slot="label">
                <el-tooltip
                  content="访问的组件路径，如：`system/user/index`，默认在`views`目录下"
                  placement="top"
                >
                  <div class="flex items-center h-full pr-1">
                    <el-icon><WarningFilled /></el-icon>
                  </div>
                </el-tooltip>
                组件路径
              </span>
              <el-input
                v-model.trim="dialogForm.component"
                placeholder="请输入组件路径"
              />
            </el-form-item>
          </el-col>
          <!-- 显示状态 -->
          <el-col :span="12" v-if="dialogForm.type != 'B'">
            <el-form-item prop="visible">
              <template #label>
                <div class="inline-flex items-center">
                  <el-tooltip
                    content="选择隐藏则路由将不会出现在侧边栏，但仍然可以访问"
                    placement="top"
                  >
                    <div class="flex items-center h-full mr-1">
                      <el-icon><WarningFilled /></el-icon>
                    </div>
                  </el-tooltip>
                  显示状态
                </div>
              </template>
              <el-radio-group v-model="dialogForm.visible">
                <el-radio :label="true" :value="true">显示</el-radio>
                <el-radio :label="false" :value="false">隐藏</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <!-- 菜单状态 -->
          <el-col :span="12" v-if="false && false">
            <el-form-item prop="disabled">
              <template #label>
                <el-tooltip
                  content="选择停用则路由将不会出现在侧边栏，也不能被访问"
                  placement="top"
                >
                  <div class="flex items-center h-full pr-1">
                    <el-icon><WarningFilled /></el-icon>
                  </div>
                </el-tooltip>
                菜单状态
              </template>
              <el-radio-group v-model="dialogForm.disabled">
                <el-radio :label="true" :value="true">禁用</el-radio>
                <el-radio :label="false" :value="false">启用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" plain @click="dialogFormVisible = false"
            >取消</el-button
          >
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
  getMenusApi,
  addMenuApi,
  putMenuApi,
  deleteMenusApi,
  AddMenuType,
} from "@/api/system/management/menu";
import { handleTree } from "@/utils/common";
import { WarningFilled } from "@element-plus/icons-vue";
import { getFormItemRule } from "@/utils/validate";

defineOptions({
  name: "SystemManagementMenu",
});

const queryParams = ref({
  name: "",
  disabled: "",
});
onMounted(() => {
  fetch();
});
/**
 * 拉取列表
 */
const loading = ref(true);
const tableData = ref<any[]>([]);
const fetch = () => {
  loading.value = true;
  getMenusApi(queryParams.value)
    .then((res: any) => {
      tableData.value = handleTree(res, "id");
      loading.value = false;
    })
    .catch(() => {
      loading.value = false;
    });
};

/** 点击新增初始化弹窗的菜单类型 */
const initDialogMenuType = (row: any) => {
  switch (row.type) {
    case "C": {
      dialogForm.value.type = "M";
      break;
    }
    case "M": {
      dialogForm.value.type = "B";
      break;
    }
    case "B": {
      dialogForm.value.type = "B";
      break;
    }
    default:
      break;
  }
};

const menuOptions = ref<any[]>([]);
/** 新增 */
const onAdd = (row?: any) => {
  getTreeselect();
  if (row != null && row.id) {
    initDialogMenuType(row);
    dialogForm.value.parentId = row.id;
  } else {
    dialogForm.value.parentId = 0;
  }
  dialogType.value = "create";
  dialogFormVisible.value = true;
  canWatchTag.value = true;
};
/** 修改 */
const onUpdate = (row: any) => {
  dialogType.value = "edit";
  dialogFormVisible.value = true;
  nextTick(() => {
    getTreeselect();
    dialogForm.value = { ...row };
    canWatchTag.value = true;
  });
};
const onDelete = (row: any) => {
  CmeMessageBox.confirm(`确定删除菜单“${row.name}”吗？`, "系统提示", {
    distinguishCancelAndClose: true,
    confirmButtonText: "确定",
    cancelButtonText: "取消",
  })
    .then(() => {
      deleteMenusApi(row.id + "")
        .then(() => {
          CmeMessage({
            title: "成功",
            message: "删除菜单成功",
            type: "success",
          });
          fetch();
        })
        .catch(() => {});
    })
    .catch(() => {});
};
/** 查询菜单下拉树结构 */
const getTreeselect = () => {
  getMenusApi({})
    .then((res: any) => {
      menuOptions.value = [];
      const menu = { id: 0, name: "主类目", children: [] as any[] };
      menu.children = handleTree(res, "id");
      menuOptions.value.push(menu);
    })
    .catch(() => {});
};
/**
 * 弹窗控制
 */
const dialogFromRef = ref();
const dialogFormVisible = ref(false);
const dialogSubmitLoading = ref(false);
const dialogType = ref<"create" | "edit">("create");
const dialogForm = ref<AddMenuType>({
  id: undefined,
  parentId: 0,
  name: "",
  icon: "",
  type: "C",
  order: 0,
  external: false,
  cacheable: true,
  visible: true,
  disabled: false,
  component: "",
  permission: "",
  path: "",
  query: "",
  remark: "",
});
const dialogTitle = computed(() => {
  enum DialogTitle {
    "create" = "新增菜单",
    "edit" = "修改菜单",
  }
  return DialogTitle[dialogType.value];
});

const canWatchTag = ref(false);
/** 监听弹窗的type变化 */
watch(
  () => dialogForm.value,
  (newVal, oldVal) => {
    newVal;
    oldVal;
    if (canWatchTag.value) {
    }
  },
);
/**
 * 弹窗改表单提交
 */
const onDialogSubmit = () => {
  iconSelectVis.value = false;
  if (dialogSubmitLoading.value) {
    return;
  }
  dialogFromRef.value
    .validate()
    .then(() => {
      dialogSubmitLoading.value = true;
      if (dialogType.value === "create") {
        addMenuApi(dialogForm.value)
          .then(() => {
            CmeMessage({
              title: "成功",
              message: "新增菜单成功",
              type: "success",
            });
            dialogFormVisible.value = false;
            fetch();
          })
          .catch(() => {
            dialogSubmitLoading.value = false;
          });
      } else if (dialogType.value === "edit") {
        putMenuApi(dialogForm.value, dialogForm.value.id)
          .then(() => {
            CmeMessage({
              title: "成功",
              message: "修改菜单成功",
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
  canWatchTag.value = false;
  dialogSubmitLoading.value = false;
  dialogFromRef.value.resetFields();
  dialogForm.value = {
    id: undefined,
    parentId: 0,
    name: "",
    icon: "",
    type: "C",
    order: 0,
    external: false,
    cacheable: true,
    visible: true,
    disabled: false,
    component: "",
    permission: "",
    path: "",
    query: "",
    remark: "",
  };
};
/** 图标选择控制 */
const iconSelectVis = ref(false);
/**
 * 字典
 */
const disabledOption = [
  {
    value: true,
    label: "禁用",
  },
  {
    value: false,
    label: "启用",
  },
];

const dialogFormRules = {
  name: [...getFormItemRule("菜单名", 20, -1, true)],
  order: [{ required: true, message: "请设置菜单排序", trigger: ["change"] }],
  path: [...getFormItemRule("路由地址", 40, -1, true)],
  component: [...getFormItemRule("组件路径", 40, -1, true)],
  permission: [...getFormItemRule("权限字符", 40, -1, false)],
};
</script>

<style scoped lang="less"></style>
