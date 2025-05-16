<template>
  <div class="h-600px flex flex-col" v-loading="mainLoading">
    <div class="flex-1 flex flex-col overflow-hidden">
      <div class="overflow-hidden" v-if="serverStep! < 5">
        <el-empty description="没有排考，请点击排考" />
      </div>

      <div class="content flex flex-col overflow-hidden" v-else>
        <div class="pb-20px flex justify-between items-center">
          <div>{{ serverStep! >= 5 ? timeTipTitle : "" }}</div>
          <el-button type="primary" plain @click="handleExport()">
            导出排考表
            <template #icon>
              <Icon icon="ant-design:cloud-download-outlined" size="15px" />
            </template>
          </el-button>
        </div>
        <el-table
          v-if="data !== null"
          ref="tableRef"
          :data="tableData"
          border
          stripe
          style="height: 100%"
        >
          <template #empty> <el-empty description="暂无数据" /> </template>
          <el-table-column
            type="index"
            label="序号"
            width="55"
            fixed
            align="center"
          />
          <el-table-column
            prop="group"
            label="组别"
            width="55px"
            fixed
            show-overflow-tooltip
            align="center"
            v-if="data.examination.mode === '2'"
          />
          <el-table-column
            prop="beginAt"
            label="开始时间"
            width="170px"
            fixed
            show-overflow-tooltip
          />
          <el-table-column
            prop="endAt"
            label="结束时间"
            width="170px"
            fixed
            show-overflow-tooltip
          />
          <el-table-column
            v-for="(i, index) in tableHeader"
            show-overflow-tooltip
          >
            <template #header>
              <div>{{ i.roomName }}</div>
              <div>({{ i.roomNumber }})</div>
            </template>
            <template #default="{ row }">
              {{ row.examinees[index]?.user.name }}
              {{
                row.examinees[index]?.studentNumber
                  ? `（${row.examinees[index]?.studentNumber}）`
                  : ""
              }}
            </template>
          </el-table-column>
        </el-table>
        <el-empty v-else description="暂无数据" />
      </div>
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
          排考
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
import { getOverviewsApi } from "@/api/osce/exam/management";
import { dayjs } from "element-plus";
import { modifySchedulesApi } from "@/api/osce/exam/management";
import { downloadFile } from "@/request/utils/blob";

const {
  examinationId,
  serverStep,
  activeComIndex,
  dialogVisible: editorVisible,
  updateExamMsg,
} = useExamEditorState();

const data = ref<any>(null);
const tableHeader = ref<any>([]);
const tableData = ref<any>([]);
const mainLoading = ref<boolean>(false);
onMounted(async () => {
  if (serverStep.value! >= 5) {
    mainLoading.value = true;
    await getOverviews();
    mainLoading.value = false;
  }
});

/** 预计时间提示 */
const timeTipTitle = computed(() => {
  let res = "";
  if (tableData.value.length > 0) {
    let begin = tableData.value[0].beginAt;
    let end = tableData.value[tableData.value.length - 1].endAt;
    const time = new Date(end).getTime() - new Date(begin).getTime();
    let minute = time / 1000 / 60;
    begin = dayjs(begin).format("YYYY-MM-DD HH:mm");
    end = dayjs(end).format("YYYY-MM-DD HH:mm");
    let timeLift = formatMilliseconds(time);
    res = `预计耗时：${minute}分钟（${timeLift}，考试预计开始于 “${begin}” ，预计结束于 “${end}” ）。`;
  }
  return res;
});

/** 毫秒数转为时分 */
const formatMilliseconds = (ms: number) => {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  return `${hours}小时${minutes}分`;
};

/** 获取考试总览 */
const getOverviews = async () => {
  await getOverviewsApi(examinationId.value!)
    .then((res) => {
      data.value = res;
      tableHeader.value = res.stations;
      tableData.value = res.schedules;
    })
    .catch(() => {});
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
  let tag = await arrangement();
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
  if (serverStep.value! < 5) {
    CmeMessage({
      title: "提示",
      message: "请点击排考后进入下一步",
      type: "warning",
    });
    return;
  }
  nextLoading.value = true;
  activeComIndex.value!++;
  nextLoading.value = false;
};

/** 排考 */
const arrangement = async () => {
  let tag = true;
  await modifySchedulesApi(examinationId.value!)
    .then(() => {
      CmeMessage({
        title: "成功",
        message: "考试排考成功",
        type: "success",
      });
    })
    .catch(() => {
      tag = false;
    });
  await getOverviews();
  return tag;
};

/** 导出 */
const handleExport = () => {
  downloadFile(
    `/osce/examinations/${examinationId.value}/schedules/export`,
    {},
  );
};
</script>

<style scoped lang="less">
.el-form-item__label {
  font-weight: bold !important;
  color: red;
}
.content {
  .title {
    @apply text-xl font-bold flex justify-center;
  }
  .msg-container {
    @apply flex justify-between py-2;
    .msg-box {
      @apply flex-none w-1/2 p-2;
      .msg-item {
        @apply py-9px flex;
        .msg-title {
          @apply flex-none font-bold w-120px text-right;
        }
        .msg-content {
          @apply flex-1;
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
</style>
