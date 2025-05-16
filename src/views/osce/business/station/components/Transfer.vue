<template>
  <el-dialog
    v-model="myDialogVisible"
    title="维护考站"
    width="1200px"
    @closed="onDialogClose"
    align-center
    :close-on-click-modal="false"
  >
    <TransferLayout
      :leftTitle="roomTitle"
      :rightTitle="`当前已添加 ${stationList.length} 个房间`"
    >
      <template #leftHeaderHandle>
        <el-popover :width="300" trigger="click">
          <template #reference>
            <el-button size="small" type="primary"> 搜索 </el-button>
          </template>
          <el-form
            :model="queryParams"
            ref="queryFromRef"
            :rules="formRules"
            label-position="top"
          >
            <el-row :gutter="40">
              <el-col :span="24">
                <el-form-item label="所在建筑" prop="buildingId">
                  <el-select
                    v-model="queryParams.buildingId"
                    placeholder="请选择建筑"
                    class="w-full"
                    :teleported="false"
                    @change="handleBuildingChange"
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
              </el-col>
              <el-col :span="24">
                <el-form-item
                  label="所在楼层"
                  prop="floorId"
                  v-if="queryParams.buildingId && queryParams.buildingId >= 0"
                >
                  <el-select
                    v-model="queryParams.floorId"
                    placeholder="请选择楼层"
                    class="w-full"
                    :teleported="false"
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
              </el-col>
              <el-col :span="24">
                <el-form-item label="房间号" prop="roomNumber">
                  <el-input
                    v-model="queryParams.roomNumber"
                    @keyup.enter="fetchRoomList(1)"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="房间名" prop="roomName">
                  <el-input
                    v-model="queryParams.roomName"
                    @keyup.enter="fetchRoomList(1)"
                  />
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
          <div class="flex justify-end">
            <el-button size="small" type="primary" plain @click="onRoomReset">
              重置
            </el-button>
            <el-button size="small" type="primary" @click="fetchRoomList(1)">
              查询
            </el-button>
          </div>
        </el-popover>
      </template>

      <template #leftBody>
        <el-table
          ref="roomTableRef"
          v-loading="systemRoomLoading"
          :data="roomList"
          class="w-full"
          style="height: 100%"
          @selection-change="onRoomSelectionChange"
          @select-all="handleSelectAllClick"
          :header-cell-class-name="cellClass"
          stripe
        >
          <template #empty>
            <el-empty description="暂无数据" />
          </template>
          <el-table-column
            type="selection"
            width="40"
            fixed
            :selectable="setRoomSelectable"
            align="center"
          />
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
        </el-table>
      </template>

      <template #leftPagination>
        <el-pagination
          size="small"
          v-model:current-page="queryParams.pageNumber"
          v-model:page-size="queryParams.pageSize"
          :page-sizes="[10, 50, 100, 150, 200]"
          layout="total, sizes, prev, pager, next"
          :total="roomListTotal"
          @size-change="onRoomSizeChange"
          @current-change="onRoomCurrentChange"
        />
      </template>

      <template #leftFooter>
        <el-button type="primary" @click="onAddStation"> 添加为考站 </el-button>
      </template>

      <template #rightHeaderHandle>
        <el-popover :width="300" trigger="click">
          <template #reference>
            <el-button size="small" type="primary"> 搜索 </el-button>
          </template>

          <el-form
            :model="queryParamsStation"
            @submit.prevent
            label-position="top"
          >
            <el-row :gutter="40">
              <el-col :span="24">
                <el-form-item label="房间号" prop="roomNumber">
                  <el-input
                    v-model="queryParamsStation.roomNumber"
                    placeholder="请输入房间号"
                    clearable
                    @keyup.enter="handleStationSearch()"
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
                handleStationReset();
                handleStationSearch();
              "
            >
              重置
            </el-button>
            <el-button
              size="small"
              type="primary"
              @click="handleStationSearch()"
            >
              查询
            </el-button>
          </div>
        </el-popover>
      </template>

      <template #rightBody>
        <el-table
          ref="stationTableRef"
          v-loading="stationLoading"
          :data="stationListTemp"
          class="w-full"
          @selection-change="onStationSelectionChange"
          stripe
          style="height: 100%"
        >
          <template #empty>
            <el-empty class="h-500px" description="暂无数据" />
          </template>
          <el-table-column type="selection" width="40" fixed align="center" />
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
        </el-table>
      </template>

      <template #rightFooter>
        <el-button type="primary" @click="onRemoveStation">
          移除考站
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
          保存
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { getSystemRoomsApi } from "@/api/system/management/rooms";
import {
  GetRoomListReqType,
  AllRoomListItemType,
} from "@/api/system/management/rooms";
import {
  getBuildingListApi,
  getFloorListApi,
} from "@/api/system/management/rooms";
import {
  BuildingListItemType,
  FlooritemType,
} from "@/api/system/management/rooms";
import {
  getStationListApi,
  modifyStationApi,
} from "@/api/osce/business/stations";
import {
  StationListItemType,
  ModifyStationType,
} from "@/api/osce/business/stations";
interface Props {
  dialogVisible: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  dialogVisible: false,
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
      fetchRoomList(1);
      getBuildings();
      fetchStationList();
    } else {
      onRoomReset();
      handleStationReset();
    }
  },
);
const dialogSubmitLoading = ref(false);
const onDialogSubmit = () => {
  let obj = {
    roomIds: stationList.value.map((item) => item.roomId).join(","),
  } as ModifyStationType;
  modifyStationApi(obj)
    .then(() => {
      CmeMessage({
        title: "成功",
        message: "保存成功",
        type: "success",
      });
      onDialogClose();
    })
    .catch(() => {});
};
const onDialogClose = () => {
  emit("update:dialogVisible", false);
};
const emit = defineEmits(["update:dialogVisible"]);
/**
 * 系统房间列表(room)
 */
const queryParams = ref<GetRoomListReqType>({
  buildingId: undefined,
  floorId: undefined,
  pageNumber: 1,
  pageSize: 10,
  roomName: "",
  roomNumber: "",
});
const roomList = ref<AllRoomListItemType[]>([]);
const roomListTotal = ref(0);
const systemRoomLoading = ref(false);
const resPageSize = ref();
const fetchRoomList = (i = 0) => {
  systemRoomLoading.value = true;
  if (i !== 0) {
    queryParams.value.pageNumber = i;
  }
  getSystemRoomsApi(queryParams.value)
    .then((res) => {
      roomListTotal.value = res.totalSize;
      roomList.value = res.dataList;
      resPageSize.value = res.pageSize;
      systemRoomLoading.value = false;
    })
    .catch(() => {
      systemRoomLoading.value = false;
    });
};
/**
 * select选择(room)
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
/**
 * 重置搜索栏(room)
 */
const queryFromRef = ref();
const onRoomReset = () => {
  queryFromRef.value.resetFields();
  fetchRoomList(1);
};
/**
 * roomTitle
 */
const roomTitle = computed(() => {
  let select = roomList.value.filter((i) => {
    return !stationList.value.map((j) => j.roomId).includes(i.roomId);
  });
  return `共查询到 ${roomListTotal.value ?? 0} 个房间，本页${
    roomList.value.length
  }个，本页可选 ${select.length ?? 0} 个`;
});
/**
 * 分页控制(room)
 */
const onRoomSizeChange = (i: number) => {
  queryParams.value.pageSize = i;
  fetchRoomList(1);
};
const onRoomCurrentChange = (i: number) => {
  fetchRoomList(i);
};
/**
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 */
/**
 * 获取考站列表
 */
const stationList = ref<StationListItemType[]>([]);
const stationLoading = ref(false);
const fetchStationList = () => {
  stationLoading.value = true;
  getStationListApi({})
    .then((res) => {
      stationList.value = res.dataList;
      stationListTemp.value = res.dataList;
      stationLoading.value = false;
    })
    .catch(() => {
      stationLoading.value = false;
    });
};
/**
 * 设置房间是否可选
 */
const setRoomSelectable = (row: AllRoomListItemType) => {
  if (stationList.value.map((i) => i.roomId).includes(row.roomId)) {
    return false;
  } else {
    return true;
  }
};
/**
 * 考站列表选择,房间列表选择
 */
const stationSelection = ref<StationListItemType[]>([]);
const onStationSelectionChange = (selection: StationListItemType[]) => {
  stationSelection.value = selection;
};
const roomSelection = ref<StationListItemType[]>([]);
const onRoomSelectionChange = (selection: StationListItemType[]) => {
  roomSelection.value = selection;
};
/**
 * 移除考站,添加考站
 */
const onRemoveStation = () => {
  stationList.value = stationList.value.filter((i) => {
    return !stationSelection.value.map((j) => j.roomId).includes(i.roomId);
  });
  stationListTemp.value = stationList.value.filter((i) => {
    return i.roomNumber.includes(queryParamsStation.value.roomNumber);
  });
};
const roomTableRef = ref();
const onAddStation = () => {
  stationList.value = [...roomSelection.value, ...stationList.value];
  roomTableRef.value.clearSelection();
  stationListTemp.value = stationList.value.filter((i) => {
    return i.roomNumber.includes(queryParamsStation.value.roomNumber);
  });
};
// const stationListTemp = computed(() => {
//   return stationList.value.filter((i) => {
//     return i.roomNumber.includes(queryParamsStation.value.roomNumber);
//   });
// });
const stationListTemp = ref<any[]>([]);
/**
 * 搜索(station)
 */
const queryParamsStation = ref({
  roomNumber: "",
});
const handleStationSearch = () => {
  stationListTemp.value = stationList.value.filter((i) => {
    return i.roomNumber.includes(queryParamsStation.value.roomNumber.trim());
  });
};
/**
 * 重置搜索栏(station)
 */
const handleStationReset = () => {
  queryParamsStation.value.roomNumber = "";
};
/** 建筑改变 */
const handleBuildingChange = () => {
  queryParams.value.floorId = undefined;
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
  for (let i of roomList.value) {
    if (!stationList.value.map((i) => i.roomId).includes(i.roomId)) {
      status = false;
    }
  }
  return status;
});
const handleSelectAllClick = () => {
  if (selectAllDisabled.value) {
    roomTableRef.value.clearSelection();
  }
};
/**
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 */
/** 规则校验 */
const formRules = {
  roomName: [
    {
      min: 1,
      max: 20,
      message: "房间名的长度不能超过20个字符",
      trigger: ["change"],
    },
  ],
  roomNumber: [
    {
      min: 1,
      max: 40,
      message: "房间号的长度不能超过40个字符",
      trigger: ["change"],
    },
  ],
};
</script>

<style lang="less">
.transfer {
  @apply flex justify-between overflow-hidden;
  .transfer-item {
    @apply flex-none w-570px h-600px border flex flex-col;
    .header {
      @apply flex h-50px px-20px items-center justify-between border-b flex-none;
    }
    .body {
      @apply flex-1;
    }
    .footer {
      @apply flex justify-center items-center h-50px flex-none;
    }
  }
}

.el-table .select-all-disabled .cell .el-checkbox__inner {
  background-color: #f5f7fa;
  border-color: #dcdfe6;
  cursor: not-allowed;
}
</style>
