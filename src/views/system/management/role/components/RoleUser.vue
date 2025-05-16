<template>
  <div>
    <el-dialog
      v-model="roleUserVisible"
      :title="dialogTitle"
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
          <el-form-item prop="name" label="姓名">
            <el-input
              placeholder="请输入姓名"
              clearable
              v-model="queryParams.name"
              style="width: 200px"
              @keyup.enter="fetch(1)"
            />
          </el-form-item>
          <el-form-item prop="idNumber" label="唯一识别号">
            <el-input
              placeholder="请输入唯一识别号"
              clearable
              v-model="queryParams.idNumber"
              style="width: 200px"
              @keyup.enter="fetch(1)"
            />
          </el-form-item>
          <el-form-item prop="phoneNumber" label="手机号码">
            <el-input
              placeholder="请输入手机号码"
              clearable
              v-model="queryParams.phoneNumber"
              style="width: 200px"
              @keyup.enter="fetch(1)"
            />
          </el-form-item>
        </template>
      </QueryBar>

      <ActionBar
        @on-reload="fetch(1)"
        has-filter-btn
        :header-list="tableHeaderList"
      >
        <el-button type="primary" @click="handleAssignClick()">
          分配
          <template #icon>
            <Icon icon="ant-design:inbox-outlined" size="15px" />
          </template>
        </el-button>
        <el-button type="danger" @click="handleActionDelete">
          移除
          <template #icon>
            <Icon icon="ant-design:delete-outlined" size="15px" />
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
          label="姓名"
          min-width="180px"
          show-overflow-tooltip
          v-if="isColVisible('name', tableHeaderList)"
        />
        <el-table-column
          prop="genderName"
          label="性别"
          min-width="80px"
          show-overflow-tooltip
          align="center"
          v-if="isColVisible('genderName', tableHeaderList)"
        />
        <el-table-column
          prop="idNumber"
          label="身份证号码"
          min-width="180px"
          show-overflow-tooltip
          align="center"
          v-if="isColVisible('idNumber', tableHeaderList)"
        />
        <el-table-column
          prop="phoneNumber"
          label="手机号码"
          min-width="130px"
          show-overflow-tooltip
          align="center"
          v-if="isColVisible('phoneNumber', tableHeaderList)"
        />
        <el-table-column
          prop="emailAddress"
          label="电子邮箱"
          min-width="180px"
          show-overflow-tooltip
          align="center"
          v-if="isColVisible('emailAddress', tableHeaderList)"
        />
        <el-table-column
          prop="remark"
          label="备注"
          min-width="180px"
          show-overflow-tooltip
          align="center"
          v-if="isColVisible('remark', tableHeaderList)"
        />
        <el-table-column
          prop="createdAt"
          label="创建时间"
          min-width="180px"
          show-overflow-tooltip
          align="center"
          v-if="isColVisible('createdAt', tableHeaderList)"
        />
        <el-table-column label="操作" fixed="right" width="80px" align="center">
          <template #default="{ row }">
            <el-button
              size="small"
              type="danger"
              @click="handleDeleteClick(row)"
              text
            >
              移除
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

    <ExcludeRoleUser @closed="fetch(1)" />
  </div>
</template>

<script setup lang="ts">
import {
  getRolesUsersApi,
  deleteRolesUsersApi,
} from "@/api/system/management/roles";
import type {
  RolesUsersListItem,
  RolesUsersQueryType,
  RoleListItemType,
} from "@/api/system/management/roles";
import ExcludeRoleUser from "./ExcludeRoleUser.vue";

const roleUserVisible = inject<Ref<boolean>>("roleUserVisible");
const roleData = inject<Ref<RoleListItemType>>("roleData");

const dialogTitle = computed(() => {
  return `角色用户（${roleData?.value?.name}）`;
});

const queryParams = ref<RolesUsersQueryType>({
  pageNumber: 1,
  pageSize: 10,
  name: "",
  idNumber: "",
  phoneNumber: "",
});

watch(
  () => roleUserVisible!.value,
  (val) => {
    if (val) {
      fetch(1);
    } else {
      queryParams.value.name = "";
      queryParams.value.idNumber = "";
      queryParams.value.phoneNumber = "";
      excludeRoleUserVisible.value = false;
    }
  },
);

/** 拉取列表 */
const loading = ref(false);
const totalSize = ref(0);
const tableData = ref<RolesUsersListItem[]>([]);
const fetch = (i = 0) => {
  loading.value = true;
  if (i !== 0) {
    queryParams.value.pageNumber = i;
  }
  getRolesUsersApi(queryParams.value, roleData!.value.id)
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
const selectionIdList = ref<number[]>([]);
const onSelectionChange = (val: RolesUsersListItem[]) => {
  let idList = val.map((item) => item.id);
  selectionIdList.value = idList;
  selectionIds.value = idList.join(",");
};

/** 批量删除 */
const handleActionDelete = () => {
  if (selectionIds.value === "") {
    return CmeMessage({
      title: "提示",
      message: "请选择需要移除的角色用户",
      type: "warning",
    });
  }
  CmeMessageBox.confirm("确定批量移除角色用户吗？", "系统提示", {
    distinguishCancelAndClose: true,
    confirmButtonText: "确定",
    cancelButtonText: "取消",
  })
    .then(() => {
      deleteRolesUsersApi(selectionIds.value, roleData!.value.id)
        .then(() => {
          CmeMessage({
            title: "成功",
            message: "移除角色用户成功",
            type: "success",
          });
          fetch(1);
        })
        .catch(() => {});
    })
    .catch(() => {});
};

/** 操作栏的单个删除 */
const handleDeleteClick = (row: RolesUsersListItem) => {
  CmeMessageBox.confirm(`确定在该角色下移除用户“${row.name}”吗？`, "系统提示", {
    distinguishCancelAndClose: true,
    confirmButtonText: "确定",
    cancelButtonText: "取消",
  })
    .then(() => {
      deleteRolesUsersApi(row.id + "", roleData!.value.id)
        .then(() => {
          CmeMessage({
            title: "成功",
            message: "移除角色用户成功",
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

/** 表头控制 */
const tableHeaderList = ref([
  {
    prop: "name",
    label: "姓名",
    visible: true,
  },
  {
    prop: "genderName",
    label: "性别中文",
    visible: true,
  },
  {
    prop: "idNumber",
    label: "身份证号码",
    visible: true,
  },
  {
    prop: "phoneNumber",
    label: "手机号码",
    visible: true,
  },
  {
    prop: "emailAddress",
    label: "电子邮箱",
    visible: true,
  },
  {
    prop: "remark",
    label: "备注",
    visible: false,
  },
  {
    prop: "createdAt",
    label: "创建时间",
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

/** =============== 分配 begin =============== */

/** 分配弹窗 */
const excludeRoleUserVisible = ref(false);
provide("excludeRoleUserVisible", excludeRoleUserVisible);

const handleAssignClick = () => {
  excludeRoleUserVisible.value = true;
};

/** =============== 分配 end =============== */
</script>

<style scoped lang="less">
.query-bar {
  .el-form-item:not(.query-btn-container) {
    width: 270px !important;
  }
}
</style>
