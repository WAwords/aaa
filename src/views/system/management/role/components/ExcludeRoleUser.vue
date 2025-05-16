<template>
  <div>
    <el-dialog
      v-model="excludeRoleUserVisible"
      :title="dialogTitle"
      width="1000px"
      @closed="emit('closed')"
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
        <el-button type="primary" @click="handleActionAssign()">
          添加
          <template #icon>
            <Icon icon="ant-design:plus-outlined" size="15px" />
          </template>
        </el-button>
      </ActionBar>

      <el-table
        ref="tableRef"
        v-loading="loading"
        :data="tableData"
        class="w-full"
        @selection-change="onSelectionChange"
        style="height: 550px"
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
              type="primary"
              @click="handleAssignClick(row)"
              text
            >
              添加
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
  </div>
</template>

<script setup lang="ts">
import type { RoleListItemType } from "@/api/system/management/roles";
import { getUserListApi } from "@/api/system/management/users";
import type {
  GetUserListReqType,
  UserListItemType,
} from "@/api/system/management/users";
import { postRolesUsersApi } from "@/api/system/management/roles";

const excludeRoleUserVisible = inject<Ref<boolean>>("excludeRoleUserVisible");
const roleData = inject<Ref<RoleListItemType>>("roleData");

const dialogTitle = computed(() => {
  return `添加用户（${roleData?.value?.name}）`;
});

const queryParams = ref<GetUserListReqType>({
  pageNumber: 1,
  pageSize: 10,
  name: "",
  idNumber: "",
  phoneNumber: "",
});

watch(
  () => excludeRoleUserVisible!.value,
  (val) => {
    if (val) {
      fetch(1);
    } else {
      queryParams.value.name = "";
      queryParams.value.idNumber = "";
      queryParams.value.phoneNumber = "";
    }
  },
);

/** 拉取列表 */
const loading = ref(false);
const totalSize = ref(0);
const tableData = ref<UserListItemType[]>([]);
const fetch = (i = 0) => {
  loading.value = true;
  if (i !== 0) {
    queryParams.value.pageNumber = i;
  }

  let tempQueryParams = {
    ...queryParams.value,
    excludeRoleIds: roleData!.value.id,
  };

  getUserListApi(tempQueryParams)
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
const onSelectionChange = (val: UserListItemType[]) => {
  let idList = val.map((item) => item.id);
  selectionIdList.value = idList;
  selectionIds.value = idList.join(",");
};

/** 批量添加 */
const handleActionAssign = () => {
  if (selectionIds.value === "") {
    return CmeMessage({
      title: "提示",
      message: "请选择需要添加的用户",
      type: "warning",
    });
  }
  CmeMessageBox.confirm(
    `确定批量添加用户至角色“${roleData!.value.name}”吗？`,
    "系统提示",
    {
      distinguishCancelAndClose: true,
      confirmButtonText: "确定",
      cancelButtonText: "取消",
    },
  )
    .then(() => {
      let params = {
        userIds: selectionIds.value.split(","),
      };
      postRolesUsersApi(params, roleData!.value.id)
        .then(() => {
          CmeMessage({
            title: "成功",
            message: "添加角色用户成功",
            type: "success",
          });
          fetch(1);
        })
        .catch(() => {});
    })
    .catch(() => {});
};

/** 操作栏的单个删除 */
const handleAssignClick = (row: UserListItemType) => {
  CmeMessageBox.confirm(
    `确定添加用户“${row.name}”至角色“${roleData!.value.name}”吗？`,
    "系统提示",
    {
      distinguishCancelAndClose: true,
      confirmButtonText: "确定",
      cancelButtonText: "取消",
    },
  )
    .then(() => {
      let params = {
        userIds: [row.id],
      };
      postRolesUsersApi(params, roleData!.value.id)
        .then(() => {
          CmeMessage({
            title: "成功",
            message: "添加角色用户成功",
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

const emit = defineEmits(["closed"]);
</script>

<style scoped lang="less">
::v-deep(.query-bar) {
  .el-form-item:not(.query-btn-container) {
    width: 240px !important;
  }

  .query-btn-container {
    .el-button {
      width: 65px !important;
    }
  }
}
</style>
