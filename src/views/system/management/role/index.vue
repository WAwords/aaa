<!-- 角色列表 -->
<template>
  <div class="router-page">
    <QueryBar
      :query-params="queryParams"
      @on-search="fetch(1)"
      @on-reset="fetch(1)"
      label-width="60px"
    >
      <template #query-form>
        <el-form-item prop="code" label="角色编码">
          <el-input
            placeholder="请输入用户角色编码"
            clearable
            v-model.trim="queryParams.code"
            style="width: 200px"
            @keyup.enter="fetch(1)"
          />
        </el-form-item>
        <el-form-item prop="name" label="角色名">
          <el-input
            placeholder="请输入角色名"
            clearable
            v-model="queryParams.name"
            style="width: 200px"
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
        @click="onActionCreate"
        v-hasPermi="['system:role:add']"
      >
        新增
        <template #icon>
          <Icon icon="ant-design:plus-outlined" size="15px" />
        </template>
      </el-button>
      <el-button
        type="danger"
        @click="onActionDelete"
        v-hasPermi="['system:role:delete']"
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
      stripe
      style="height: 100%"
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
        prop="code"
        label="角色编码"
        fixed
        show-overflow-tooltip
        min-width="180px"
        v-if="isColVisible('code', tableHeaderList)"
      />
      <el-table-column
        prop="name"
        label="角色名"
        show-overflow-tooltip
        align="center"
        min-width="130px"
        v-if="isColVisible('name', tableHeaderList)"
      />
      <el-table-column
        prop="order"
        label="顺序"
        show-overflow-tooltip
        align="center"
        min-width="80px"
        v-if="isColVisible('order', tableHeaderList)"
      />
      <el-table-column
        prop="assignable"
        label="可分配用户"
        show-overflow-tooltip
        align="center"
        min-width="100px"
        v-if="isColVisible('assignable', tableHeaderList)"
      >
        <template #default="{ row }">
          {{ row.assignable ? "是" : "否" }}
        </template>
      </el-table-column>
      <el-table-column
        prop="createdAt"
        label="创建时间"
        show-overflow-tooltip
        align="center"
        min-width="180px"
        v-if="isColVisible('createdAt', tableHeaderList)"
      />
      <el-table-column
        prop="remark"
        label="备注"
        show-overflow-tooltip
        min-width="180px"
        v-if="isColVisible('remark', tableHeaderList)"
      />
      <el-table-column label="操作" fixed="right" width="300px" align="center">
        <template #default="scope">
          <el-button
            size="small"
            type="primary"
            @click="handleEdit(scope.row)"
            v-hasPermi="['system:role:update']"
            text
          >
            修改
          </el-button>
          <el-button
            size="small"
            type="primary"
            @click="handleMenu(scope.row)"
            v-hasPermi="['system:role:update']"
            text
          >
            角色授权
          </el-button>
          <el-button
            size="small"
            type="primary"
            @click="handleAssign(scope.row)"
            v-hasPermi="['system:role:update']"
            :disabled="!scope.row.assignable"
            text
          >
            分配用户
          </el-button>
          <el-button
            size="small"
            type="danger"
            @click="handleDelete(scope.row)"
            v-hasPermi="['system:role:delete']"
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
        ref="dialogFromRef"
        :rules="dialogFormRules"
        label-position="top"
      >
        <el-row :gutter="40">
          <el-col :span="24">
            <el-form-item label="角色编码" prop="code" required>
              <el-input
                v-model.trim="dialogForm.code"
                :disabled="dialogType === 'edit'"
                placeholder="请输入角色编码"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="角色名" prop="name" required>
              <el-input v-model="dialogForm.name" placeholder="请输入角色名" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <!-- TODO 这里前端可以输入小数 -->
            <el-form-item label="顺序" prop="order">
              <el-input-number v-model.number="dialogForm.order" :min="0" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="备注" prop="remark">
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

    <!-- 角色授权 -->
    <el-dialog
      v-model="dialogAssignVisible"
      title="角色授权"
      width="400px"
      @closed="onAssignDialogClose"
      align-center
      :close-on-click-modal="false"
    >
      <el-form
        :model="assignRole"
        label-width="100px"
        ref="dialogFromRef"
        label-position="top"
      >
        <el-row :gutter="40">
          <el-col :span="24">
            <el-form-item label="角色编码" prop="code">
              <el-input v-model.trim="assignRole.code" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="角色名" prop="name">
              <el-input v-model="assignRole.name" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="菜单权限" v-loading="menuDataLoading">
              <div>
                <el-checkbox
                  v-model="menuExpand"
                  @change="handleMenuExpandChange"
                >
                  展开/折叠
                </el-checkbox>
                <el-checkbox
                  v-model="menuNodeAll"
                  @change="handleMenuNodeAllChange"
                >
                  全选/全不选
                </el-checkbox>
              </div>
              <div
                class="border w-full overflow-hidden"
                style="
                  border-radius: var(
                    --el-input-border-radius,
                    var(--el-border-radius-base)
                  );
                  border-color: var(
                    --el-input-border-color,
                    var(--el-border-color)
                  );
                "
              >
                <el-scrollbar max-height="300px">
                  <el-tree
                    ref="treeRef"
                    :data="menuTree"
                    :props="{ children: 'children', label: 'name' }"
                    node-key="id"
                    show-checkbox
                    :check-strictly="false"
                    empty-text="加载中，请稍候"
                    :default-expand-all="menuExpand"
                  />
                </el-scrollbar>
              </div>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" plain @click="dialogAssignVisible = false">
            取消
          </el-button>
          <el-button
            type="primary"
            @click="handleAssignSubmit"
            :loading="dialogAssignLoading"
          >
            提交
          </el-button>
        </span>
      </template>
    </el-dialog>

    <RoleUser />
  </div>
</template>

<script setup lang="ts">
import {
  getRoleListApi,
  deleteRolesApi,
  addRoleApi,
  editRoleApi,
  getRoleMenusApi,
  postRoleMenusApi,
  GetRoleListReqType,
  RoleListItemType,
  AddRoleType,
} from "@/api/system/management/roles";
import { handleTree } from "@/utils/common";
import type { CheckboxValueType } from "element-plus";
import { getFormItemRule } from "@/utils/validate";
import RoleUser from "./components/RoleUser.vue";

defineOptions({
  name: "SystemManagementRole",
});

const queryParams = ref<GetRoleListReqType>({
  pageNumber: 1,
  pageSize: 10,
  code: "",
  name: "",
  order: "",
  remark: "",
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
  getRoleListApi(queryParams.value)
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
 * 列表多选
 */
const selectionIds = ref<string>("");
const onSelectionChange = (val: RoleListItemType[]) => {
  let idList = val.map((item) => item.id);
  selectionIds.value = idList.join(",");
};
/**
 * 批量删除
 */
const onActionDelete = () => {
  if (selectionIds.value === "") {
    return CmeMessage({
      title: "提示",
      message: "请选择需要删除的角色",
      type: "warning",
    });
  }
  CmeMessageBox.confirm("确定批量删除角色吗？", "系统提示", {
    distinguishCancelAndClose: true,
    confirmButtonText: "确定",
    cancelButtonText: "取消",
  })
    .then(() => {
      deleteRolesApi(selectionIds.value)
        .then(() => {
          CmeMessage({
            title: "成功",
            message: "删除角色成功",
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
const handleDelete = (row: RoleListItemType) => {
  CmeMessageBox.confirm(`确定删除角色“${row.name}”吗？`, "系统提示", {
    distinguishCancelAndClose: true,
    confirmButtonText: "确定",
    cancelButtonText: "取消",
  })
    .then(() => {
      deleteRolesApi(row.id + "")
        .then(() => {
          CmeMessage({
            title: "成功",
            message: "删除角色成功",
            type: "success",
          });
          fetch(1);
        })
        .catch(() => {});
    })
    .catch(() => {});
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
 * 弹窗控制
 */
const dialogFromRef = ref();
const dialogFormVisible = ref(false);
const dialogType = ref<"create" | "edit">("create");
const dialogForm = ref<AddRoleType>({
  code: "",
  name: "",
  order: 0,
  menuIds: [],
  remark: "",
});
const dialogTitle = computed(() => {
  enum DialogTitle {
    "create" = "新增角色",
    "edit" = "修改角色",
  }
  return DialogTitle[dialogType.value];
});
const onActionCreate = () => {
  dialogType.value = "create";
  dialogFormVisible.value = true;
};

const editId = ref<number>(-1);
const handleEdit = (row: RoleListItemType) => {
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
const dialogSubmitLoading = ref(false);
const onDialogSubmit = () => {
  if (dialogSubmitLoading.value) {
    return;
  }
  dialogFromRef.value
    .validate()
    .then(() => {
      dialogSubmitLoading.value = true;
      if (dialogType.value === "create") {
        addRoleApi(dialogForm.value)
          .then(() => {
            CmeMessage({
              title: "成功",
              message: "新增角色成功",
              type: "success",
            });
            dialogFormVisible.value = false;
            fetch(1);
          })
          .catch(() => {
            dialogSubmitLoading.value = false;
          });
      } else if (dialogType.value === "edit") {
        editRoleApi(dialogForm.value, editId.value)
          .then(() => {
            CmeMessage({
              title: "成功",
              message: "修改角色成功",
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

/** 菜单树形数据 */
const menuTree = ref<any[]>([]);
/** 树形加载状态 */
const menuDataLoading = ref(false);
/** 获取menuData */
const fetchMenuData = () => {
  menuDataLoading.value = true;
  getRoleMenusApi(assignRole.value.id)
    .then((res) => {
      menuNodeAll.value = res.roleMenuIds.length === res.allMenus.length;

      menuTree.value = handleTree(res.allMenus, "id");
      // treeRef.value.setCheckedKeys(res.roleMenuIds);
      res.roleMenuIds.forEach((id: number) => {
        nextTick(() => {
          treeRef.value.setChecked(id, true, false);
        });
      });
      menuDataLoading.value = false;
    })
    .catch(() => {
      menuDataLoading.value = false;
    });
};

/** 树ref */
const treeRef = ref();
/** 展开/折叠（标识） */
const menuExpand = ref(false);
/** 展开/折叠（方法） */
const handleMenuExpandChange = (value: CheckboxValueType) => {
  let treeList = menuTree.value;
  for (let i = 0; i < treeList.length; i++) {
    treeRef.value.store.nodesMap[treeList[i].id].expanded = value;
  }
};

/** 全选/全不选（标识） */
const menuNodeAll = ref(false);
/** 全选/全不选（方法） */
const handleMenuNodeAllChange = (value: CheckboxValueType) => {
  treeRef.value.setCheckedNodes(value ? menuTree.value : []);
};

/** 授权角色 */
const assignRole = ref<{ code: string; name: string; [key: string]: any }>({
  id: undefined,
  code: "",
  name: "",
});

/** 角色授权dialog */
const dialogAssignVisible = ref(false);
/** 角色福泉提交按钮状态 */
const dialogAssignLoading = ref(false);
/** 角色授权 */
const handleMenu = (row: RoleListItemType) => {
  assignRole.value.id = row.id;
  assignRole.value.code = row.code;
  assignRole.value.name = row.name;
  fetchMenuData();
  dialogAssignVisible.value = true;
};

/** 角色授权提交 */
const handleAssignSubmit = () => {
  dialogAssignLoading.value = true;
  let checkedKeys = treeRef.value.getCheckedKeys();
  let halfCheckedKeys = treeRef.value.getHalfCheckedKeys();
  checkedKeys = [...halfCheckedKeys, ...checkedKeys];
  postRoleMenusApi(assignRole.value.id, { menuIds: checkedKeys })
    .then(() => {
      CmeMessage({
        title: "成功",
        message: "角色授权成功",
        type: "success",
      });
      dialogAssignVisible.value = false;
      dialogAssignLoading.value = false;
    })
    .catch(() => {
      dialogAssignLoading.value = false;
    });
};

/** 角色授权弹窗关闭 */
const onAssignDialogClose = () => {
  // 设置tree选中的节点
  treeRef.value.setCheckedKeys([]);
  assignRole.value = {
    id: undefined,
    code: "",
    name: "",
  };
  menuExpand.value = false;
  menuNodeAll.value = false;
  let treeList = menuTree.value;
  for (let i = 0; i < treeList.length; i++) {
    treeRef.value.store.nodesMap[treeList[i].id].expanded = false;
  }
};

/**
 * 验证规则
 */
const dialogFormRules = reactive({
  code: [...getFormItemRule("角色编码", 40, -1, true)],
  name: [...getFormItemRule("角色名", 20, -1, true)],
  order: [
    { required: true, message: "请输入顺序", trigger: ["change", "blur"] },
  ],
  remark: [...getFormItemRule("备注", 100, -1, false)],
});

/** 表头控制 */
const tableHeaderList = ref<TableHerderItem[]>([
  {
    prop: "code",
    label: "角色编码",
    visible: true,
  },
  {
    prop: "name",
    label: "角色名",
    visible: true,
  },
  {
    prop: "order",
    label: "顺序",
    visible: true,
  },
  {
    prop: "assignable",
    label: "可分配用户",
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
    visible: false,
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

/** =============== 角色用户 begin =============== */
/** 角色用户弹窗控制 */
const roleUserVisible = ref(false);
provide("roleUserVisible", roleUserVisible);

/** 当前分配的角色 */
const roleData = ref<RoleListItemType>();
provide("roleData", roleData);

/** 分配角色 */
const handleAssign = (row: RoleListItemType) => {
  roleData.value = row;
  roleUserVisible.value = true;
};
/** =============== 角色用户 end =============== */
</script>

<style scoped></style>
