<template>
  <div
    class="content h-600px flex flex-col"
    id="management-done-concern-container"
    v-loading="mainLoading"
  >
    <div v-if="data !== null" class="overflow-hidden">
      <el-scrollbar always>
        <div class="overview-wrapper">
          <div class="title">考试信息总览</div>
          <div class="content">
            <div class="left">
              <div class="msg-item" v-testSet="`name`">
                <div class="msg-title">考试名 ：</div>
                <div class="msg-content">{{ data.examination.name }}</div>
              </div>
              <div class="msg-item" v-testSet="`typeName`">
                <div class="msg-title">考试类型 ：</div>
                <div class="msg-content">{{ data.examination.typeName }}</div>
              </div>
              <div class="msg-item" v-testSet="`modeName`">
                <div class="msg-title">考试模式 ：</div>
                <div class="msg-content">{{ data.examination.modeName }}</div>
              </div>
              <div class="msg-item" v-testSet="`skillSelectionMethodName`">
                <div class="msg-title">抽题方式 ：</div>
                <div class="msg-content">
                  {{ data.examination.skillSelectionMethodName }}
                </div>
              </div>
              <div class="msg-item" v-testSet="`requireSignature`">
                <div class="msg-title">考官签字 ：</div>
                <div class="msg-content">
                  {{
                    data.examination.requireSignature
                      ? "需要考官签字"
                      : "不需要考官签字"
                  }}
                </div>
              </div>
              <div class="msg-item" v-testSet="`scoreDifferenceDetection`">
                <div class="msg-title">分差检测 ：</div>
                <div class="msg-content">
                  {{
                    data.examination.scoreDifferenceDetection
                      ? "开启分差检测"
                      : "不开启分差检测"
                  }}
                </div>
              </div>
              <div class="msg-item" v-testSet="`time`">
                <div class="msg-title">考试时间 ：</div>
                <div class="msg-content flex">
                  <div>{{ data.examination.beginAt }}</div>
                  <div class="px-20px">-</div>
                  <div>{{ data.examination.endAt }}</div>
                </div>
              </div>
              <div class="msg-item" v-testSet="`examinees`">
                <div class="msg-title">考生数量 ：</div>
                <div class="msg-content">
                  {{
                    `${data.examinees.length}位考生（男生${manCount}人，女生${womanCount}人）`
                  }}
                </div>
              </div>
            </div>
            <div class="right">
              <div class="msg-item" v-testSet="`stations`">
                <div class="msg-title">考站数量 ：</div>
                <div class="msg-content">
                  {{ `${data.stations.length}个考站` }}
                </div>
              </div>
              <div class="msg-item" v-testSet="`arrangements`">
                <div class="msg-title">考题安排 ：</div>
                <div class="msg-content">
                  <div v-for="i in arrangements">
                    <div v-html="i"></div>
                  </div>
                </div>
              </div>
              <div class="msg-item" v-testSet="`examiners`">
                <div class="msg-title">考官安排 ：</div>
                <div class="msg-content">
                  <div v-for="i in examinators">
                    <div v-html="i"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="expect-wrapper">
          {{ timeTipTitle }}
          <el-button type="primary" plain @click="handleExport()">
            导出排考表
            <template #icon>
              <Icon icon="ant-design:cloud-download-outlined" size="15px" />
            </template>
          </el-button>
        </div>

        <el-table ref="tableRef" :data="tableData" border stripe>
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
      </el-scrollbar>
    </div>

    <el-empty class="flex-1" v-else description="暂无数据" />

    <div class="footer-wrapper">
      <div class="footer-left">
        <el-button type="primary" plain @click="editorVisible = false">
          取消
        </el-button>
        <el-button type="primary" plain @click="handleBack">上一步</el-button>
      </div>
      <div class="footer-right">
        <el-button type="primary" @click="handleSave" :loading="saveLoading">
          完成
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useExamEditorState } from "./examEditorState";
import { getOverviewsApi } from "@/api/osce/exam/management";
import { dayjs } from "element-plus";
import { patchExamStatusApi } from "@/api/osce/exam/management";
import { downloadFile } from "@/request/utils/blob";

const {
  examinationId,
  activeComIndex,
  dialogVisible,
  dialogVisible: editorVisible,
} = useExamEditorState();

const data = ref<any>(null);
const tableHeader = ref<any>([]);
const tableData = ref<any>([]);
const mainLoading = ref<boolean>(false);
onMounted(async () => {
  mainLoading.value = true;
  await getOverviewsApi(examinationId.value!)
    .then((res) => {
      data.value = res;
      tableHeader.value = res.stations;
      tableData.value = res.schedules;
    })
    .catch(() => {});
  mainLoading.value = false;
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

/** 男女生数量 */
const manCount = computed(() => {
  return data.value.examinees.filter((item: any) => item.user.gender === "1")
    .length;
});
const womanCount = computed(() => {
  return data.value.examinees.filter((item: any) => item.user.gender === "2")
    .length;
});
/** 考题安排 */
const arrangements = computed(() => {
  return data.value.arrangements.map((item: any) => {
    // 急救技能：成人心肺复苏、气管插管，二选一，10 分钟
    let typeStr = `<strong><u>${item.skillTypeName}</u></strong>`;
    let skillStr = item.skillDetails.map((i: any) => i.skillName).join("、");
    let selectStr =
      item.skillDetails.length > 1
        ? `<strong><u>${item.skillDetails.length}选1</u></strong>，`
        : "";
    let timeStr = `<strong><u>${item.duration}</u></strong>分钟`;
    return `${typeStr}：${skillStr}，${selectStr}${timeStr}`;
  });
});
/** 考官安排 */
const examinators = computed(() => {
  // 郭祚 作为 主考官 监考 急救技能，评分占比 100
  let tempArr = [] as string[];
  data.value.arrangements.forEach((item: any) => {
    let chiefStr = `在考站<strong><u>${item.roomName}</u></strong>中 <strong><u>${item.chiefExaminerName}</u></strong> 作为 <strong><u>主考官</u></strong> 监考 <strong><u>${item.skillTypeName}</u></strong>，评分占比 <strong><u>${item.chiefExaminerRatio}</u></strong>`;
    tempArr.push(chiefStr);
    if (item.deputyExaminerId) {
      let deputyStr = `在考站<strong><u>${item.roomName}</u></strong>中 <strong><u>${item.deputyExaminerName}</u></strong> 作为 <strong><u>副考官</u></strong> 监考 <strong><u>${item.skillTypeName}</u></strong>，评分占比 <strong><u>${item.deputyExaminerRatio}</u></strong>`;
      tempArr.push(deputyStr);
    }
  });
  return tempArr;
});

/** 上一步按钮 */
const handleBack = () => {
  activeComIndex.value!--;
};

const saveLoading = ref(false);
/** 保存按钮 */
const handleSave = async () => {
  CmeMessageBox.confirm("确定完成考试创建吗？", "系统提示", {
    distinguishCancelAndClose: true,
    confirmButtonText: "确定",
    cancelButtonText: "取消",
  })
    .then(async () => {
      saveLoading.value = true;
      let obj = {
        status: "2",
      };
      await patchExamStatusApi(obj, examinationId.value!)
        .then(() => {
          dialogVisible.value = false;
          CmeMessage({
            title: "成功",
            message: "考试创建完成",
            type: "success",
          });
        })
        .catch(() => {});
      saveLoading.value = false;
    })
    .catch(() => {});
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
// 总览
.overview-wrapper {
  @apply px-20px py-30px;
  border: var(--el-border);
  border-radius: var(--el-border-radius-base);
  .title {
    @apply text-24px font-bold text-center;
  }
  .content {
    @apply flex mt-30px overflow-hidden;
    .left {
      @apply flex-none w-1/2 pr-20px;
      border-right: var(--el-border);
    }
    .right {
      @apply flex-1 w-1/2 ml-20px;
    }

    // 内容项
    .msg-item {
      @apply py-9px flex overflow-hidden;
      color: var(--el-text-color-regular);
      .msg-title {
        @apply flex-none font-bold;
      }
      .msg-content {
        @apply flex-1;
      }
    }
  }
}

// 预计耗时行
.expect-wrapper {
  @apply py-20px flex justify-between items-center;
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
