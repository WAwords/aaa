<template>
  <div class="flex flex-col">
    <div
      class="flex items-center justify-between bg-white flex-nowrap flex-none"
    >
      <div class="left-btn-wrapper">
        <el-button type="primary" @click="fetch" :disabled="fetchLoading">
          点击获取数据
          <template #icon>
            <Icon icon="ant-design:reload-outlined" size="15px" />
          </template>
        </el-button>
        <el-button
          :type="autoFetchFlag ? 'success' : 'primary'"
          @click="handleAutoFetchClick"
        >
          自动获取数据
          <template #icon>
            <Icon icon="ant-design:clock-circle-outlined" size="15px" />
          </template>
        </el-button>
      </div>

      <div
        class="full-btn"
        @click="fullDialogVisible = true"
        v-if="!fullDialogVisible"
      >
        <Icon icon="ant-design:fullscreen-outlined" size="18px" />
      </div>
    </div>

    <div class="flex-1 mt-20px overflow-hidden">
      <el-table
        ref="tableRef"
        :data="scoresListTrans"
        class="w-full"
        stripe
        style="height: 100%"
      >
        <template #empty>
          <el-empty description="暂无数据" class="h-100px" />
        </template>
        <el-table-column
          type="index"
          label="序号"
          width="55"
          fixed
          align="center"
        />
        <el-table-column
          prop="examinee.user.name"
          label="姓名"
          min-width="120px"
          fixed
          show-overflow-tooltip
        />
        <el-table-column
          prop="examinee.user.genderName"
          label="性别"
          width="100px"
          min-width="80px"
          show-overflow-tooltip
          align="center"
        />
        <el-table-column
          prop="examinee.studentNumber"
          label="学号"
          min-width="150px"
          show-overflow-tooltip
          align="center"
        />
        <el-table-column
          prop="examinee.major"
          label="专业"
          min-width="150px"
          show-overflow-tooltip
          align="center"
        />
        <el-table-column
          prop="examinee.grade"
          label="年级"
          min-width="80px"
          show-overflow-tooltip
          align="center"
        />
        <el-table-column
          prop="skillTypeCount"
          label="已考技能类型数"
          min-width="100px"
          show-overflow-tooltip
          align="center"
        />
        <el-table-column
          prop="totalScore"
          label="总分"
          show-overflow-tooltip
          align="center"
          min-width="100px"
        >
          <template #default="{ row }">
            {{ numberRound(row.totalScore) }}
          </template>
        </el-table-column>
        <el-table-column
          prop="averageScore"
          label="平均分"
          show-overflow-tooltip
          align="center"
          min-width="100px"
        >
          <template #default="{ row }">
            {{ numberRound(row.averageScore) }}
          </template>
        </el-table-column>
        <el-table-column
          prop="maxScore"
          label="最高分"
          show-overflow-tooltip
          align="center"
          min-width="100px"
        >
          <template #default="{ row }">
            {{ numberRound(row.maxScore) }}
          </template>
        </el-table-column>
        <el-table-column
          prop="minScore"
          label="最低分"
          show-overflow-tooltip
          align="center"
          min-width="100px"
        >
          <template #default="{ row }">
            {{ numberRound(row.minScore) }}
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 成绩查询（这个弹窗的内容应该与未弹出弹窗的内容一致） -->
    <el-dialog v-model="fullDialogVisible" fullscreen title="成绩查询">
      <div class="flex items-center justify-between bg-white flex-nowrap">
        <div class="left-btn-wrapper">
          <el-button type="primary" @click="fetch" :disabled="fetchLoading">
            点击获取数据
            <template #icon>
              <Icon icon="ant-design:reload-outlined" size="15px" />
            </template>
          </el-button>
          <el-button
            :type="autoFetchFlag ? 'success' : 'primary'"
            @click="handleAutoFetchClick"
          >
            自动获取数据
            <template #icon>
              <Icon icon="ant-design:clock-circle-outlined" size="15px" />
            </template>
          </el-button>
        </div>

        <div
          class="full-btn"
          @click="fullDialogVisible = true"
          v-if="!fullDialogVisible"
        >
          <Icon icon="ant-design:fullscreen-outlined" size="18px" />
        </div>
      </div>

      <el-table
        ref="tableRef"
        :data="scoresListTrans"
        class="w-full mt-20px"
        stripe
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
          prop="examinee.user.name"
          label="姓名"
          min-width="120px"
          fixed
          show-overflow-tooltip
        />
        <el-table-column
          prop="examinee.user.genderName"
          label="性别"
          width="100px"
          min-width="80px"
          show-overflow-tooltip
          align="center"
        />
        <el-table-column
          prop="examinee.studentNumber"
          label="学号"
          min-width="150px"
          show-overflow-tooltip
          align="center"
        />
        <el-table-column
          prop="examinee.major"
          label="专业"
          min-width="150px"
          show-overflow-tooltip
          align="center"
        />
        <el-table-column
          prop="examinee.grade"
          label="年级"
          min-width="80px"
          show-overflow-tooltip
          align="center"
        />
        <el-table-column
          prop="skillTypeCount"
          label="已考技能类型数"
          min-width="100px"
          show-overflow-tooltip
          align="center"
        />
        <el-table-column
          prop="totalScore"
          label="总分"
          show-overflow-tooltip
          align="center"
          min-width="100px"
        >
          <template #default="{ row }">
            {{ numberRound(row.totalScore) }}
          </template>
        </el-table-column>
        <el-table-column
          prop="averageScore"
          label="平均分"
          show-overflow-tooltip
          align="center"
          min-width="100px"
        >
          <template #default="{ row }">
            {{ numberRound(row.averageScore) }}
          </template>
        </el-table-column>
        <el-table-column
          prop="maxScore"
          label="最高分"
          show-overflow-tooltip
          align="center"
          min-width="100px"
        >
          <template #default="{ row }">
            {{ numberRound(row.maxScore) }}
          </template>
        </el-table-column>
        <el-table-column
          prop="minScore"
          label="最低分"
          show-overflow-tooltip
          align="center"
          min-width="100px"
        >
          <template #default="{ row }">
            {{ numberRound(row.minScore) }}
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { useBeginState } from "../beginState";
import { numberRound } from "@/utils/common";

const { examInfo, sendMessage, WS, autoFetchFlag } = useBeginState();

onMounted(() => {
  if (autoFetchFlag.value) {
    autoFetch();
  } else {
    fetch();
  }
});

const fullDialogVisible = ref(false);

/** 考生成绩信息 */
const scoresList = ref<ScoreItemType[]>([]);
/** 转换后的考生成绩信息 */
const scoresListTrans = computed(() => {
  return scoresList.value.map((item: ScoreItemType) => {
    let result = { ...item };
    result.examinee = examInfo.value.examinees.find(
      (i: any) => i.id === item.examinee,
    );
    return result;
  });
});

/** 获取成绩数据加载状态 */
const fetchLoading = ref(false);
/** 获取成绩数据 */
const fetch = () => {
  autoFetchFlag.value = false;
  fetchLoading.value = true;
  const msg = {
    type: "examinee_score_list",
  };

  sendMessage(msg)
    .then((res: WSBasicResult) => {
      scoresList.value = res.data.scores;

      setTimeout(() => {
        fetchLoading.value = false;
      }, 1000);
    })
    .catch(() => {
      setTimeout(() => {
        fetchLoading.value = false;
      }, 1000);
    });
};

/** 自动获取数据 */
const autoFetch = () => {
  return new Promise<void>((resolve, reject) => {
    let tempObj = {
      type: "examinee_score_list_control",
      data: {
        enabled: true,
      },
    };
    sendMessage(tempObj)
      .then((res: WSBasicResult) => {
        scoresList.value = res.data.scores;

        autoFetchFlag.value = true;
        resolve();
      })
      .catch(() => {
        reject();
      });
  });
};

/** 自动获取按钮点击 */
const handleAutoFetchClick = () => {
  if (!autoFetchFlag.value) {
    CmeMessageBox.confirm("确定开启自动获取数据吗？", "系统提示", {
      distinguishCancelAndClose: true,
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      beforeClose: (action, instance, done) => {
        if (action === "confirm") {
          instance.confirmButtonLoading = true;

          autoFetch()
            .then(() => {
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
  } else {
    CmeMessageBox.confirm("确定关闭自动获取数据吗？", "系统提示", {
      distinguishCancelAndClose: true,
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      beforeClose: (action, instance, done) => {
        if (action === "confirm") {
          instance.confirmButtonLoading = true;

          let tempObj = {
            type: "examinee_score_list_control",
            data: {
              enabled: false,
            },
          };
          sendMessage(tempObj)
            .then(() => {
              autoFetchFlag.value = false;
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
  }
};

watch(
  () => WS.value.data,
  (val) => {
    if (!val) return;
    let resMsg = JSON.parse(val);

    if (resMsg.type === "examinee_score") {
      let tempArr = JSON.parse(JSON.stringify(scoresList.value));
      let data = resMsg.data.score;
      let oldIndex = tempArr.findIndex((item: ScoreItemType) => {
        return item.examinee === data.examinee;
      });
      if (oldIndex !== -1) tempArr.splice(oldIndex, 1);

      tempArr.push(data);

      scoresList.value = sortScoreList(tempArr);
    }
  },
);

/** 排序考生成绩列表 */
const sortScoreList = (list: ScoreItemType[]) => {
  return list.sort((a, b) => {
    // 先按 skillTypeCount 从大到小排序
    if (a.skillTypeCount !== b.skillTypeCount) {
      return b.skillTypeCount - a.skillTypeCount;
    }
    // skillTypeCount 相同，按 totalScore 从大到小排序
    if (a.totalScore !== b.totalScore) {
      return b.totalScore - a.totalScore;
    }
    // totalScore 相同，按 averageScore 从大到小排序
    if (a.averageScore !== b.averageScore) {
      return b.averageScore - a.averageScore;
    }
    // averageScore 相同，按 maxScore 从大到小排序
    if (a.maxScore !== b.maxScore) {
      return b.maxScore - a.maxScore;
    }
    // maxScore 相同，按 minScore 从大到小排序
    if (a.minScore !== b.minScore) {
      return b.minScore - a.minScore;
    }
    // 如果所有属性都相同，则返回0，保持原顺序
    return 0;
  });
};

/** 考生成绩列表项 */
type ScoreItemType = {
  examinee: number;
  skillTypeCount: number;
  totalScore: number;
  averageScore: number;
  maxScore: number;
  minScore: number;
  [key: string]: any;
};
</script>

<style scoped lang="less">
.left-btn-wrapper {
  @apply flex flex-nowrap;
  ::v-deep(.el-button) {
    width: 140px;
  }
}

.full-btn {
  @apply h-32px w-32px flex justify-center items-center ml-4px cursor-pointer;
  border-radius: var(--el-border-radius-base);
  background-color: var(--el-fill-color-lighter);
  &:hover {
    color: var(--el-color-primary);
  }
}
</style>
