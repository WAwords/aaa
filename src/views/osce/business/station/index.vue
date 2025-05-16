<template>
  <div class="router-page">
    <QueryBar
      :query-params="queryParams"
      @on-search="fetch(1)"
      @on-reset="fetch(1)"
      labelWidth="60px"
    >
      <template #query-form>
        <el-form-item prop="buildingId" label="所在建筑">
          <el-select
            v-model="queryParams.buildingId"
            placeholder="请选择建筑"
            filterable
          >
            <el-option
              v-for="item in buildingOption"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          prop="floorId"
          label="所在楼层"
          v-if="queryParams.buildingId && queryParams.buildingId >= 0"
        >
          <el-select
            v-model="queryParams.floorId"
            placeholder="请选择楼层"
            filterable
          >
            <el-option
              v-for="item in floorOption"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item prop="roomNumber" label="房间号">
          <el-input
            placeholder="请输入房间号"
            clearable
            v-model="queryParams.roomNumber"
            @keyup.enter="fetch(1)"
          />
        </el-form-item>
        <el-form-item prop="roomName" label="房间名">
          <el-input
            placeholder="请输入房间名"
            clearable
            v-model="queryParams.roomName"
            @keyup.enter="fetch(1)"
          />
        </el-form-item>
      </template>
    </QueryBar>

    <ActionBar @on-reload="fetch(1)">
      <el-button type="primary" @click="onActionModify">
        维护
        <template #icon>
          <Icon
            icon="ant-design:inbox-outlined"
            size="15px"
            color="var(--el-button-text-color)"
          />
        </template>
      </el-button>
      <el-button type="danger" @click="onActionDelete">
        移除
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
        prop="buildingName"
        label="所在建筑"
        show-overflow-tooltip
        align="center"
      />
      <el-table-column
        prop="floorName"
        label="所在楼层"
        show-overflow-tooltip
        align="center"
      />
      <el-table-column
        prop="roomNumber"
        label="房间号"
        show-overflow-tooltip
        align="center"
      />
      <el-table-column
        prop="roomName"
        label="房间名"
        show-overflow-tooltip
        align="center"
      />
      <el-table-column label="操作" fixed="right" width="160px" align="center">
        <template #default="scope">
          <el-button
            size="small"
            type="danger"
            @click="onDelete(scope.row)"
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
      @on-size-change="onSizeChange"
      @on-current-change="onCurrentChange"
    />

    <!-- 弹窗 -->
    <Transfer v-model:dialogVisible="dialogVisible" />
  </div>
</template>
<script setup lang="ts">
import Transfer from "./components/Transfer.vue";
import {
  getStationListApi,
  deleteStationsApi,
} from "@/api/osce/business/stations";
import {
  GetStationListReqType,
  StationListItemType,
} from "@/api/osce/business/stations";
import {
  getBuildingListApi,
  getFloorListApi,
} from "@/api/system/management/rooms";
import {
  BuildingListItemType,
  FlooritemType,
} from "@/api/system/management/rooms";

defineOptions({
  name: "OsceBusinessStation",
});

const queryParams = ref<GetStationListReqType>({
  pageNumber: 1,
  pageSize: 10,
  buildingId: undefined,
  floorId: undefined,
  roomName: "",
  roomNumber: "",
});
onMounted(() => {
  fetch(1)
    .then(() => {
      getBuildings();
    })
    .catch(() => {});
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
  return new Promise((resolve, reject) => {
    getStationListApi(queryParams.value)
      .then((res) => {
        totalSize.value = res.totalSize;
        tableData.value = res.dataList;
        loading.value = false;
        resolve(true);
      })
      .catch(() => {
        loading.value = false;
        reject();
      });
  });
};
/**
 * 列表多选
 */
const selectionIds = ref<string>("");
const onSelectionChange = (val: StationListItemType[]) => {
  let idList = val.map((item) => item.id);
  selectionIds.value = idList.join(",");
};
/**
 * 批量移除
 */
const onActionDelete = () => {
  if (selectionIds.value === "") {
    return CmeMessage({
      title: "提示",
      message: "请选择需要移除的考站",
      type: "warning",
    });
  }
  CmeMessageBox.confirm("确定批量移除考站吗？", "系统提示", {
    distinguishCancelAndClose: true,
    confirmButtonText: "确定",
    cancelButtonText: "取消",
  })
    .then(() => {
      deleteStationsApi(selectionIds.value)
        .then(() => {
          CmeMessage({
            title: "成功",
            message: "移除考站成功",
            type: "success",
          });
          fetch(1);
        })
        .catch(() => {});
    })
    .catch(() => {});
};
/**
 * 操作栏的单个移除
 */
const onDelete = (row: StationListItemType) => {
  CmeMessageBox.confirm(
    `确定将房间“${row.roomName}”从考站中移除吗？`,
    "系统提示",
    {
      distinguishCancelAndClose: true,
      confirmButtonText: "确定",
      cancelButtonText: "取消",
    },
  )
    .then(() => {
      deleteStationsApi(row.id + "")
        .then(() => {
          CmeMessage({
            title: "成功",
            message: "移除考站成功",
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
const dialogVisible = ref(false);
const onActionModify = () => {
  dialogVisible.value = true;
};
watch(
  () => dialogVisible.value,
  (newVal) => {
    if (!newVal) {
      fetch(1);
    }
  },
);
/**
 * select选择
 */
const buildingOption = ref<BuildingListItemType[]>([]);
const floorOption = ref<FlooritemType[]>([]);
const getBuildings = () => {
  getBuildingListApi({})
    .then((res) => {
      buildingOption.value = res.dataList;
    })
    .catch(() => {});
};
const getFloors = (buildingId: number) => {
  getFloorListApi({}, buildingId)
    .then((res) => {
      floorOption.value = res.dataList;
    })
    .catch(() => {});
};
watch(
  () => queryParams.value.buildingId,
  (val) => {
    if (val) {
      getFloors(val);
    }
  },
);
</script>

<style scoped></style>
