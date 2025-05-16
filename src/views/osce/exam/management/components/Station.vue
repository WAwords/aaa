<template>
  <div class="h-600px flex flex-col" id="management-station-concern-container">
    <div
      class="bg-white flex justify-between flex items-center flex-nowrap mb-10px management-station-concern"
    >
      <div ref="queryMainRef" class="w-full">
        <QueryBar
          :query-params="queryParams"
          @on-search="
            fetch();
            searchTag = 'all';
          "
          @on-reset="
            fetch();
            searchTag = 'all';
          "
          btnWidth="90px"
          class="management-examinee-concern"
        >
          <template #query-form>
            <el-form-item prop="roomNumber" label="房间号">
              <el-input
                placeholder="请输入房间号"
                clearable
                v-model="queryParams.roomNumber"
                style="width: 200px"
              />
            </el-form-item>
            <el-form-item prop="roomName" label="房间名">
              <el-input
                placeholder="请输入房间名"
                clearable
                v-model="queryParams.roomName"
                style="width: 200px"
              />
            </el-form-item>
          </template>
          <template #query-right>
            <el-form-item class="query-btn-container">
              <el-radio-group v-model="searchTag">
                <el-radio-button label="all" value="all">
                  所有房间
                </el-radio-button>
                <el-radio-button label="free" value="free">
                  空闲房间
                </el-radio-button>
              </el-radio-group>
            </el-form-item>
          </template>
        </QueryBar>
      </div>
    </div>

    <div class="overflow-hidden flex-1">
      <el-scrollbar height="100%" always v-loading="loading">
        <div class="station-list-wrapper">
          <div
            class="station-item"
            v-for="item in tableDataTemp"
            :key="item.id"
            :class="{
              'is-free': item.isFree,
              'not-free': !item.isFree,
              active: selectedIdArr.includes(item.id),
            }"
            @click="onSelect(item)"
          >
            <!-- 主内容 -->
            <div class="station-item-content-wrapper">
              <TextTooltip :content="item.roomName" />
              <TextTooltip :content="item.roomNumber" />
            </div>

            <!-- 状态标签 -->
            <div class="station-item-tag-wrapper">
              <div class="tag" v-if="item.isFree">
                <span>空</span>
                <span class="mt-5px">闲</span>
              </div>
              <el-popover placement="top" width="300px" v-else>
                <template #reference>
                  <div class="tag">
                    <span>占</span>
                    <span class="mt-5px">用</span>
                  </div>
                </template>

                <div
                  v-for="(i, iIndex) in item.activities"
                  :class="{
                    'border-b pb-12px': iIndex < item.activities.length - 1,
                    'pt-12px': iIndex !== 0,
                  }"
                  style="color: var(--el-text-color-regular)"
                >
                  {{ i.description }}<br />
                  开始时间：{{ i.beginAt }}<br />
                  结束时间：{{ i.endAt }}<br />
                </div>
              </el-popover>
            </div>
          </div>
        </div>
      </el-scrollbar>
    </div>

    <div class="footer-wrapper">
      <div class="footer-left">
        <el-button type="primary" plain @click="editorVisible = false">
          取消
        </el-button>
        <el-button type="primary" plain @click="handleBack">上一步</el-button>
      </div>
      <div class="footer-right">
        <el-button type="primary" @click="handleSave" :loading="saveLoading">
          保存
        </el-button>
        <el-button type="primary" @click="handleNext" :loading="nextLoading">
          下一步
        </el-button>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { useExamEditorState } from "./examEditorState";
import {
  getStationListApi,
  GetStationListReqType,
  StationListItemType,
} from "@/api/osce/business/stations";
import {
  getStationsListApi,
  modifyStationsApi,
  getExaminationApi,
} from "@/api/osce/exam/management";

const {
  examinationId,
  serverStep,
  activeComIndex,
  dialogVisible: editorVisible,
  updateExamMsg,
} = useExamEditorState();

const queryParams = ref<GetStationListReqType>({
  roomName: "",
  roomNumber: "",
  beginAt: "",
  endAt: "",
});
const examMsg = ref();
onMounted(() => {
  getExaminationApi(examinationId.value!)
    .then((res) => {
      examMsg.value = res;
      queryParams.value.beginAt = examMsg.value.beginAt;
      queryParams.value.endAt = examMsg.value.endAt;
      if (serverStep.value && serverStep.value >= 3) {
        fetchSelected();
      }
      fetch();
    })
    .catch(() => {});
});

const selectedIdArr = ref<number[]>([]);
const fetchSelected = () => {
  getStationsListApi(examinationId.value!)
    .then((res) => {
      selectedIdArr.value = res.stations.map((item: any) => item.id);
    })
    .catch(() => {});
};
/**
 * 拉取列表
 */
const loading = ref(true);
const totalSize = ref(0);
const tableData = ref<StationListItemType[]>([]);
const fetch = () => {
  loading.value = true;
  getStationListApi(queryParams.value)
    .then((res) => {
      totalSize.value = res.totalSize;
      tableData.value = res.dataList.map((item: StationListItemType) => {
        let obj = {
          ...item,
          // 在这里放一个isFree的属性，用于判断是否可以被选中，可选中的房间我们统一设置为空闲
          isFree:
            item.available ||
            (item.activities[0].activityId === examinationId.value &&
              item.activities[0].module === "osce" &&
              item.activities[0].activity === "examination"),
        };
        return obj;
      });
      loading.value = false;
    })
    .catch(() => {
      loading.value = false;
    });
};

const tableDataTemp = computed(() => {
  return tableData.value.filter((item) => {
    if (searchTag.value === "all") {
      return true;
    } else if (searchTag.value === "free") {
      return item.isFree === true;
    }
  });
});
/**
 * 更多的查询
 */
const searchTag = ref<"all" | "free">("all");
/**
 * 选择考站
 */
const onSelect = (row: StationListItemType) => {
  if (row.isFree) {
    if (selectedIdArr.value.includes(row.id)) {
      selectedIdArr.value = selectedIdArr.value.filter(
        (item) => item !== row.id,
      );
    } else {
      selectedIdArr.value.push(row.id);
    }
  } else {
    CmeMessage({
      title: "提示",
      message: "被占用的考站不可选",
      type: "warning",
    });
  }
};

/** 上一步按钮 */
const handleBack = () => {
  CmeMessageBox.confirm(
    `返回上一步前请先保存信息，确定返回上一步吗？`,
    "系统提示",
    {
      distinguishCancelAndClose: true,
      confirmButtonText: "确定",
      cancelButtonText: "取消",
    },
  )
    .then(() => {
      activeComIndex.value!--;
    })
    .catch(() => {});
};

const saveLoading = ref(false);
/** 保存按钮 */
const handleSave = async () => {
  saveLoading.value = true;
  let tag = await save();
  if (!tag) {
    saveLoading.value = false;
    return;
  }
  await updateExamMsg();
  saveLoading.value = false;
};

const nextLoading = ref(false);
/** 下一步按钮 */
const handleNext = async () => {
  nextLoading.value = true;
  let tag = await save();
  if (!tag) {
    nextLoading.value = false;
    return;
  }
  await updateExamMsg();
  activeComIndex.value!++;
  nextLoading.value = false;
};

/** 保存 */
const save = async () => {
  let tag = true;
  if (selectedIdArr.value.length === 0) {
    CmeMessage({
      title: "提示",
      message: "请选择考站",
      type: "warning",
    });
    tag = false;
    return tag;
  }

  let params = { stationIds: selectedIdArr.value.join(",") };
  await modifyStationsApi(params, examinationId.value!)
    .then(() => {
      CmeMessage({
        title: "成功",
        message: "保存成功",
        type: "success",
      });
    })
    .catch(() => {
      tag = false;
    });
  return tag;
};
</script>

<style lang="less" scoped>
// 考站列表容器
.station-list-wrapper {
  @apply grid grid-cols-4 gap-y-20px gap-x-20px;
  // 考站项
  .station-item {
    @apply flex justify-center items-center h-80px overflow-hidden cursor-pointer;
    border-radius: var(--el-border-radius-base);
    border: 2px solid var(--el-color-primary-light-7);

    @apply bg-no-repeat bg-cover bg-right;
    background-image: url(@/assets/img/osce/exam/station-bg.png);

    // 主内容
    .station-item-content-wrapper {
      @apply flex-1 h-full px-20px py-16px overflow-hidden flex flex-col justify-between font-bold;
    }
    // 考站状态标签
    .station-item-tag-wrapper {
      @apply flex-none mr-8px overflow-hidden;
      .tag {
        writing-mode: vertical-rl;
        @apply flex justify-center items-center h-50px;
        border-radius: var(--el-border-radius-base);
      }
    }

    // 空闲
    &.is-free {
      background-color: var(--el-color-primary-light-9);
      color: var(--el-text-color-primary);

      .station-item-tag-wrapper {
        .tag {
          background-color: var(--el-color-primary);
          color: #ffffff;
        }
      }
      &.active {
        border-color: var(--el-color-primary);
        color: var(--el-color-primary);
      }
    }

    // 占用
    &.not-free {
      background-color: var(--el-disabled-bg-color);
      color: var(--el-text-color-disabled);
      border-color: var(--el-color-primary-light-9);
      @apply cursor-not-allowed;

      .station-item-tag-wrapper {
        .tag {
          background-color: var(--el-color-primary-light-8);
          color: var(--el-disabled-text-color);
          color: #ffffff;
        }
      }
    }
  }
}

// 底部操作栏
.footer-wrapper {
  @apply flex justify-between items-center mt-20px;
  .footer-left {
  }
  .footer-right {
  }
  .el-button {
    @apply w-100px;
  }
}

.query-bar {
  // 非按钮区
  .el-form-item:not(.query-btn-container) {
    width: 280px !important;
  }
}

::v-deep(.el-radio-button__inner) {
  width: 120px !important;
}
</style>
