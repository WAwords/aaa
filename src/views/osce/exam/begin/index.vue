<template>
  <div class="router-page">
    <div class="exam-select-rapper">
      <el-space>
        <el-select-v2
          v-model="selectedExamId"
          :options="examList"
          placeholder="请选择考试"
          :props="{ label: 'name', value: 'id' }"
          filterable
          clearable
          :disabled="examInfo ? true : false"
        >
          <template #default="{ item }">
            <TextTooltip :content="item.name" />
          </template>
        </el-select-v2>
        <el-button
          type="primary"
          @click="handleBegin"
          v-if="!examInfo"
          v-hasPermi="['osce:examination:begin']"
        >
          开始考试
        </el-button>
        <el-button
          type="danger"
          @click="handleEnd"
          v-else
          v-hasPermi="['osce:examination:begin']"
        >
          结束考试
        </el-button>
      </el-space>
      <div>
        <!-- <el-button type="primary" @click="" v-if="examInfo"> 导出 </el-button> -->
      </div>
    </div>

    <div class="main-container">
      <component :is="activeComponent"></component>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useBeginState, connect } from "./beginState";
import Empty from "./components/Empty.vue";
import Fixed from "./components/fixed/index.vue";
import Unfixed from "./components/unfixed/index.vue";
import {
  getExaminationListApi,
  ExaminationListItemType,
} from "@/api/osce/exam/management";
import { visibilityListener } from "@/utils/listeners.ts";

defineOptions({
  name: "OsceExamBegin",
});

const {
  examInfo,
  closeWebsocket,
  beginStateInit,
  sendMessage,
  examBeginMsgExecute,
  autoFetchFlag,
} = useBeginState();

// 显示时重新连接
visibilityListener(() => {
  closeWebsocket();
  beginStateInit();
  connect();
});

onUnmounted(() => {
  autoFetchFlag.value = false;
  closeWebsocket();
});

const activeComponent = shallowRef<any>(Empty);

/** 选中的考试id */
const selectedExamId = ref<number>();
/** 考试列表 */
const examList = ref<ExaminationListItemType[]>([]);

onMounted(() => {
  let tempList = [] as any[];
  getExaminationListApi({ status: 2 })
    .then((res) => {
      tempList = tempList.concat(res.dataList);
      getExaminationListApi({ status: 5 })
        .then((resDone) => {
          tempList = tempList.concat(resDone.dataList);
          getExaminationListApi({ status: 3 })
            .then((resNow) => {
              tempList = tempList.concat(resNow.dataList);
              examList.value = tempList;
            })
            .catch(() => {});
        })
        .catch(() => {});
    })
    .catch(() => {});
});

/** 获取考试列表 */
watch(
  () => examInfo.value,
  (val) => {
    if (val) {
      selectedExamId.value = val.examination.id;
    }

    // 通过考试信息判断该显示的组件
    if (val) {
      const mode = val.examination.mode;
      if (mode === "1") {
        activeComponent.value = Unfixed;
      } else if (mode === "2") {
        activeComponent.value = Fixed;
      }
    } else {
      activeComponent.value = Empty;
    }
  },
  { immediate: true },
);

/** 开始考试 */
const handleBegin = () => {
  if (!selectedExamId.value) {
    CmeMessage({
      title: "提示",
      message: "请选择考试",
      type: "warning",
    });
    return;
  }
  CmeMessageBox.confirm("确定开始考试吗？", "系统提示", {
    distinguishCancelAndClose: true,
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    beforeClose: (action, instance, done) => {
      if (action === "confirm") {
        instance.confirmButtonLoading = true;

        let obj = {
          type: "examination_begin",
          data: {
            examination: selectedExamId.value,
          },
        };
        sendMessage(obj, true)
          .then((res: any) => {
            examBeginMsgExecute(res);
            instance.confirmButtonLoading = false;
            done();
          })
          .catch(() => {
            instance.confirmButtonLoading = false;
            done();
          });
      } else {
        done();
      }
    },
  })
    .then(() => {})
    .catch(() => {});
};

/** 结束考试 */
const handleEnd = () => {
  CmeMessageBox.confirm("确定结束考试吗？", "系统提示", {
    distinguishCancelAndClose: true,
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    beforeClose: (action, instance, done) => {
      if (action === "confirm") {
        instance.confirmButtonLoading = true;

        let obj = {
          type: "examination_end",
        };
        sendMessage(obj, true)
          .then(() => {
            beginStateInit();
            instance.confirmButtonLoading = false;
            done();
          })
          .catch(() => {
            instance.confirmButtonLoading = false;
            done();
          });
      } else {
        done();
      }
    },
  })
    .then(() => {})
    .catch(() => {});
};
</script>

<style scoped lang="less">
::v-deep(.el-select-v2__wrapper.is-filterable) {
  @apply cursor-pointer;
}

.page-header {
  @apply flex items-center justify-between bg-white p-20px flex-nowrap flex-none;
}

.main-container {
  @apply flex-1 flex flex-col overflow-hidden;
}

// 选择考试栏
.exam-select-rapper {
  @apply flex items-center justify-between bg-white flex-nowrap flex-none pb-20px mb-20px;
  border-bottom: var(--el-border);
  ::v-deep(.el-select__wrapper) {
    @apply w-500px;
  }
  ::v-deep(.el-button) {
    @apply w-120px;
  }
}
</style>
