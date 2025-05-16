<template>
  <div>
    <div class="flex items-center justify-between bg-white flex-nowrap mb-20px">
      <!-- 选择考站组 -->
      <QueryBar label-width="70px" :has-margin-bottom="false">
        <template #query-form>
          <el-form-item label="考站分组">
            <el-select
              v-model="stationGroupIndex"
              placeholder="请选择考站组"
              style="width: 200px"
              filterable
            >
              <el-option
                v-for="item in stationGroupOption"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </template>

        <template #query-btn>
          <el-form-item class="query-btn-container">
            <el-button
              type="primary"
              plain
              @click="handlePrev()"
              :disabled="prevDisabled"
            >
              上一组
              <template #icon>
                <Icon icon="ant-design:arrow-left-outlined" size="15px" />
              </template>
            </el-button>
            <el-button
              type="primary"
              plain
              @click="handleNext()"
              :disabled="nextDisabled"
            >
              下一组
              <template #icon>
                <Icon icon="ant-design:arrow-right-outlined" size="15px" />
              </template>
            </el-button>
          </el-form-item>
        </template>
      </QueryBar>

      <TimeTag />
    </div>

    <!-- 考站显示 -->
    <StationWrapper
      :station-list="stationGroupList[stationGroupIndex]"
      @fullscreen="handleStationsFull"
      mode="fixed"
      ref="stationWrapperRef"
    >
      <template #extra-btn>
        <el-button
          type="primary"
          v-if="examineeGroupExamStatus === 1"
          @click="handleStationExamStart"
          class="w-120px"
        >
          考试开始
        </el-button>
        <el-button
          type="danger"
          v-if="examineeGroupExamStatus === 2"
          @click="handleStationExamEnd"
          class="w-120px"
        >
          考试结束
        </el-button>
        <el-button
          type="warning"
          v-if="examineeGroupExamStatus === 3"
          @click="handleStationExamChangeEnd"
          class="w-120px"
        >
          换站结束
        </el-button>
      </template>
    </StationWrapper>
  </div>

  <div class="my-20px border-b"></div>

  <div class="detail-container">
    <div class="detail-header">
      <div>
        <el-radio-group v-model="showTag">
          <el-radio-button :value="1"> 考生叫号 </el-radio-button>
          <el-radio-button :value="2"> 成绩查询 </el-radio-button>
        </el-radio-group>
      </div>
    </div>

    <Call
      v-if="showTag === 1"
      @handleStationExamStart="handleStationExamStart"
      @handleStationExamEnd="handleStationExamEnd"
      @handleStationExamChangeEnd="handleStationExamChangeEnd"
      class="mt-20px flex-1 overflow-hidden"
    />
    <Score v-if="showTag === 2" class="mt-20px flex-1 overflow-hidden" />
  </div>

  <el-dialog v-model="stationsVisible" fullscreen title="考站详情">
    <div
      class="grid gap-20px"
      style="grid-template-columns: repeat(auto-fill, minmax(300px, 1fr))"
    >
      <StationItem v-for="i in stationList" :data="i" mode="fixed" />
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { useBeginState } from "../../beginState";
import Score from "../Score.vue";
import Call from "./Call.vue";
import StationItem from "../StationItem.vue";
import TimeTag from "./TimeTag.vue";
import StationWrapper from "../StationWrapper.vue";

const {
  stationList,
  examInfo,
  group,
  round,
  examineeGroupExamStatus,
  stationGroupList,
  waitStore,
  pushedGroups,
  absentExaminees,
  arrCutGroup,
  setStationWait,
  setStationReady,
  setStationStart,
  setStationInit,
  sendMessage,
  WS,
} = useBeginState();

/** =============== 考站考试控制 =============== */
/** 考试开始 */
const handleStationExamStart = () => {
  CmeMessageBox.confirm("确定开始本轮考试吗？", "系统提示", {
    distinguishCancelAndClose: true,
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    beforeClose: (action, instance, done) => {
      if (action === "confirm") {
        instance.confirmButtonLoading = true;

        const obj = {
          type: "group_examination_begin",
          data: {
            group: group.value,
            round: round.value,
          },
        };
        sendMessage(obj)
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
};
/** 考试结束 */
const handleStationExamEnd = () => {
  CmeMessageBox.confirm("确定结束本轮考试吗？", "系统提示", {
    distinguishCancelAndClose: true,
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    beforeClose: (action, instance, done) => {
      if (action === "confirm") {
        instance.confirmButtonLoading = true;

        const obj = {
          type: "group_examination_end",
          data: {
            group: group.value,
            round: round.value,
          },
        };
        sendMessage(obj)
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
};
/** 换站结束 */
const handleStationExamChangeEnd = () => {
  CmeMessageBox.confirm("确定结束换站吗？", "系统提示", {
    distinguishCancelAndClose: true,
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    beforeClose: (action, instance, done) => {
      if (action === "confirm") {
        instance.confirmButtonLoading = true;

        const obj = {
          type: "group_examination_change",
          data: {
            group: group.value,
            round: round.value,
          },
        };
        sendMessage(obj)
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
};

const stationWrapperRef = ref<any>();

/** =============== 考站组控制 =============== */
/** 每组考站的考站数 */
const stationGroupStationNum = ref(1);
/** 考站组数 */
const stationGroupNum = ref(1);
/** 可选考站组的下拉列表 */
const stationGroupOption = ref<{ value: number; label: string }[]>([]);
/** 当前选择的考站组index */
const stationGroupIndex = ref(0);
/** 上一组 */
const handlePrev = () => {
  stationGroupIndex.value--;
  // 重置当前分页
  stationWrapperRef.value.resetCurrentPage();
};
/** 上一组按钮禁用 */
const prevDisabled = computed(() => {
  return stationGroupIndex.value === 0;
});
/** 下一组 */
const handleNext = () => {
  stationGroupIndex.value++;
  // 重置当前分页
  stationWrapperRef.value.resetCurrentPage();
};
/** 下一组按钮禁用 */
const nextDisabled = computed(() => {
  return stationGroupIndex.value === stationGroupOption.value.length - 1;
});

/** ============================== */

/** 考站全屏 */
const stationsVisible = ref(false);
const handleStationsFull = () => {
  stationsVisible.value = true;
};

/** 叫号、成绩查询全屏（1：叫号，2：成绩） */
const showTag = ref<1 | 2>(1);

/** 设置考站评分情况 */
const setScoringStatus = (statusList: ScoringStatusItem[]) => {
  statusList.forEach((statusItem) => {
    let temp = stationList.value.find(
      (i) => i.stationId === statusItem.station,
    );
    if (temp) {
      temp.chiefExaminerSubmitted = statusItem.chiefExaminerSubmitted;
      temp.deputyExaminerSubmitted = statusItem.deputyExaminerSubmitted;
    }
  });
};

/** 初始化考站评分情况 */
const initScoringStatus = () => {
  stationList.value.forEach((item) => {
    item.chiefExaminerSubmitted = false;
    item.deputyExaminerSubmitted = false;
  });
};

type ScoringStatusItem = {
  station: number;
  complete: boolean;
  chiefExaminerSubmitted: boolean;
  deputyExaminerSubmitted?: boolean;
  [key: string]: any;
};

watch(
  () => WS.value.data,
  (val) => {
    if (!val) return;
    let resMsg = JSON.parse(val);
    // 不是固定模式的话不执行之后的操作
    if (examInfo.value && examInfo.value.examination.mode !== "2") return;

    if (resMsg.type === "examination_begin") {
      stationGroupStationNum.value = resMsg.data.rounds;
      // 考站组数
      stationGroupNum.value =
        resMsg.data.arrangements.length / resMsg.data.rounds;
      stationGroupOption.value = Array(stationGroupNum.value)
        .fill(0)
        .map((item, index) => {
          item;
          return {
            value: index,
            label: `第${index + 1}组`,
          };
        });

      // 为分组考站列表赋值
      stationGroupList.value = arrCutGroup(
        stationList.value,
        stationList.value.length / examInfo.value.rounds,
      );
    } else if (resMsg.type === "group_examinee_call") {
      // 叫号
      if (examineeGroupExamStatus.value !== 2) {
        // 考组状态为2（进行中）的话接受叫号消息不能将考组状态变化
        examineeGroupExamStatus.value = 0;
      }

      // 设置考站等待的考生
      setStationWait(resMsg.data.group, 0, false);
    } else if (resMsg.type === "group_examinee_push") {
      // 推送
      group.value = resMsg.data.group;

      pushedGroups.value.push(resMsg.data.group);

      // 设置准备中的考生
      setStationReady(resMsg.data.group);
      examineeGroupExamStatus.value = 1;
    } else if (resMsg.type === "group_examination_begin") {
      // 考试开始
      examineeGroupExamStatus.value = 2;
      group.value = resMsg.data.group;
      round.value = resMsg.data.round;
      resMsg.data.time_left;
      setStationStart(group.value, round.value);
    } else if (resMsg.type === "group_examination_end") {
      // 考试结束
      group.value = resMsg.data.group;
      // 轮次
      round.value = resMsg.data.round;

      // 如果不是最后一轮
      if (resMsg.data.round < examInfo.value.rounds - 1) {
        examineeGroupExamStatus.value = 3;
        setStationWait(resMsg.data.group, resMsg.data.round + 1);
      } else {
        examineeGroupExamStatus.value = 0;
        setStationInit(true);
      }

      // 初始化考站考官评分情况
      initScoringStatus();
      // 清除考站中的当前考生
      stationList.value.forEach((item) => {
        item.examinee = null;
      });
    } else if (resMsg.type === "group_examination_change") {
      // 结束换站
      examineeGroupExamStatus.value = 1;
      group.value = resMsg.data.group;
      setStationReady(resMsg.data.group, resMsg.data.round + 1);
    } else if (resMsg.type === "response") {
      // 响应消息
      const tempIndex = waitStore.value.findIndex((item) => {
        return item.time == resMsg.time;
      });
      // 如果有需要response的，就进行响应操作并将消息从等待列表移除
      if (tempIndex !== -1) {
        const executeItem = waitStore.value[tempIndex];
        if (executeItem.type === "group_examination_begin") {
          // 本轮考试开始
          if (resMsg.data.success) {
            CmeMessage({
              title: "提示",
              message: "开始考试成功",
              type: "success",
            });
            examineeGroupExamStatus.value = 2;
            setStationStart(executeItem.data.group, executeItem.data.round);
          } else {
            CmeMessage({
              title: "提示",
              message: "开始考试失败",
              type: "error",
            });
          }
        } else if (executeItem.type === "group_examination_end") {
          // 本轮考试结束
          if (resMsg.data.success) {
            CmeMessage({
              title: "提示",
              message: resMsg.data.message,
              type: "success",
            });

            // 如果不是最后一轮，考站状态设置为等待下一轮考生
            if (executeItem.data.round < examInfo.value.rounds - 1) {
              examineeGroupExamStatus.value = 3;
              setStationWait(
                executeItem.data.group,
                executeItem.data.round + 1,
              );
            } else {
              examineeGroupExamStatus.value = 0;
              setStationInit(true);
              // 如果时最后一轮结束，把当前进行中的组数设置为-1
              group.value = -1;
            }
            // 清除考站中的当前考生
            stationList.value.forEach((item) => {
              item.examinee = null;
            });

            // 初始化考站考官评分情况
            initScoringStatus();
            // 清除考站中的当前考生
            stationList.value.forEach((item) => {
              item.examinee = null;
            });
          } else {
            CmeMessage({
              title: "提示",
              message: resMsg.data.message,
              type: "error",
            });
          }
        } else if (executeItem.type === "group_examination_change") {
          // 结束换站
          if (resMsg.data.success) {
            CmeMessage({
              title: "提示",
              message: "结束换站成功",
              type: "success",
            });
            // 变为可以开始考试的状态
            examineeGroupExamStatus.value = 1;
            // 轮数+1
            round.value++;
            setStationReady(group.value, round.value);
          } else {
            CmeMessage({
              title: "提示",
              message: "结束换站失败",
              type: "error",
            });
          }
        } else if (executeItem.type === "group_examinee_call") {
        } else if (executeItem.type === "examination_begin") {
          if (!resMsg.data.success) return;
          stationGroupStationNum.value = resMsg.data.rounds;
          // 考站组数
          stationGroupNum.value =
            resMsg.data.arrangements.length / resMsg.data.rounds;
          stationGroupOption.value = Array(stationGroupNum.value)
            .fill(0)
            .map((item, index) => {
              item;
              return {
                value: index,
                label: `第${index + 1}组`,
              };
            });

          // 为分组考站列表赋值
          stationGroupList.value = arrCutGroup(
            stationList.value,
            stationList.value.length / examInfo.value.rounds,
          );
        }
        setTimeout(() => {
          let index = waitStore.value.findIndex((item) => {
            return item.time == resMsg.time;
          });
          if (index !== -1) {
            waitStore.value.splice(tempIndex, 1);
          }
        }, 0);
      }
    } else if (resMsg.type === "station_examiner_scoring_status") {
      // 考站考官评分状态更新
      setScoringStatus(resMsg.data.status);
    } else if (resMsg.type === "pushed_groups") {
      pushedGroups.value = resMsg.data.pushed_groups;
    } else if (resMsg.type === "examinee_absent") {
      // 考生缺考
      absentExaminees.value = resMsg.data.absent_examinees;
    } else if (resMsg.type === "group_examinee_swap") {
      // 考生交换
      examInfo.value.schedules = resMsg.data.updated_schedules;
      examInfo.value.groups = resMsg.data.updated_groups;
    }
  },
  {
    immediate: true,
  },
);
</script>

<style scoped lang="less">
.detail-container {
  @apply flex flex-col flex-1 overflow-hidden;
  .detail-header {
    @apply flex-none;
    ::v-deep(.el-radio-button__inner) {
      width: 120px !important;
    }
  }
}
.station-container {
  @apply flex;
  .station-item {
    @apply mr-20px;
  }
}
</style>
