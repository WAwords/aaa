<template>
  <el-form-item>
    <div class="time-tag" v-if="examineeGroupExamStatus === 0">
      <span class="time-tag-label"> 考试结束倒计时： </span>
      <span class="time-tag-msg"> 暂未开始考试 </span>
    </div>
    <div class="time-tag" v-else-if="examineeGroupExamStatus === 1">
      <span class="time-tag-label"> 考试结束倒计时： </span>
      <span class="time-tag-time">
        {{ msToTime(examInfo.duration * 60 * 1000) }}
      </span>
    </div>
    <div class="time-tag" v-else-if="examineeGroupExamStatus === 2">
      <span class="time-tag-label"> 考试结束倒计时： </span>
      <span class="time-tag-time"> {{ groupExamTimeLeftFormat }} </span>
    </div>
    <div class="time-tag" v-else-if="examineeGroupExamStatus === 3">
      <span class="time-tag-label"> 换站倒计时： </span>
      <span class="time-tag-time"> {{ changeStationTimeLeftFormat }} </span>
    </div>
  </el-form-item>
</template>

<script setup lang="ts">
import { useBeginState } from "../../beginState";

const { examineeGroupExamStatus, examInfo, waitStore, WS } = useBeginState();

watch(
  () => examineeGroupExamStatus.value,
  (newVal, oldVal) => {
    newVal;
    // 清除定时器
    if (oldVal === 2) {
      countDownStopFn.value && countDownStopFn.value();
    } else if (oldVal === 3) {
      countDownStopFn.value && countDownStopFn.value();
    }
  },
);

/** 停止倒计时的方法 */
const countDownStopFn = ref();
onUnmounted(() => {
  countDownStopFn.value && countDownStopFn.value();
});

/** 考站考试剩余时间 */
const groupExamTimeLeft = ref(0);
/** 考站考试剩余时间的显示 */
const groupExamTimeLeftFormat = computed(() => {
  return msToTime(groupExamTimeLeft.value);
});
const groupExamTimer = ref<any>(null);
/** 考站考试倒计时 */
const groupExamCountDown = () => {
  countDownStopFn.value && countDownStopFn.value();
  setTimeout(() => {
    countDownStopFn.value = countDown(
      groupExamTimeLeft.value,
      (timeleft: number) => {
        groupExamTimeLeft.value = timeleft;
      },
    );
  }, 0);
};

/**
 * 倒计时
 * @param timeleft 剩余时间，单位毫秒
 * @param callBack 回调函数，每秒调用一次，参数为剩余时间
 * @returns
 */
const countDown = (timeleft: number, callBack: Function) => {
  let start = new Date().getTime();
  let expected = start + 1000; // 期望时间
  let isFirst = true;
  let timer = null as any;

  count();

  function count() {
    let now = new Date().getTime(); // 当前时间
    let diff = 0; // 期望时间和当前时间差异值
    if (isFirst) {
      isFirst = false;
    } else {
      diff = now - expected;
    }

    expected = now + 1000;
    callBack(timeleft);
    if (timeleft - 1000 > 0) {
      timeleft = timeleft - 1000;
      timer = setTimeout(count, 1000 - diff);
    } else {
      timer = setTimeout(() => {
        callBack(0);
      }, 1000 - diff);
    }
  }

  return function stop() {
    clearTimeout(timer);
  };
};

/** 换站剩余时间 */
const changeStationTimeLeft = ref(0);
/** 换站剩余时间的显示 */
const changeStationTimeLeftFormat = computed(() => {
  return msToTime(changeStationTimeLeft.value);
});
/** 换站倒计时 */
const changeStationCountDown = () => {
  countDownStopFn.value && countDownStopFn.value();
  setTimeout(() => {
    countDownStopFn.value = countDown(
      changeStationTimeLeft.value,
      (timeleft: number) => {
        changeStationTimeLeft.value = timeleft;
      },
    );
  }, 0);
};

/** 毫秒数转为hh:mm:ss */
function msToTime(ms: number) {
  let showFormat = "mm:ss";
  // 计算总秒数
  const totalSeconds = Math.round(ms / 1000);

  if (showFormat === "hh:mm:ss") {
    if (ms <= 0) return "00:00:00";
    // 计算小时数，取整数部分
    const hours = Math.floor(totalSeconds / 3600);
    // 计算剩余的分钟数
    const minutes = Math.floor((totalSeconds - hours * 3600) / 60);
    // 计算剩余的秒数
    const seconds = totalSeconds - hours * 3600 - minutes * 60;
    return `${hours < 10 ? (hours === 0 ? "" : `0${hours}:`) : hours}${
      minutes < 10 ? `0${minutes}` : minutes
    }:${seconds < 10 ? `0${seconds}` : seconds}`;
  } else if (showFormat === "mm:ss") {
    if (ms <= 0) return "00:00";
    // 计算剩余的分钟数
    const minutes = Math.floor(totalSeconds / 60);
    // 计算剩余的秒数
    const seconds = totalSeconds - minutes * 60;
    return `${minutes < 10 ? `0${minutes}` : minutes}:${
      seconds < 10 ? `0${seconds}` : seconds
    }`;
  }
}

watch(
  () => WS.value.data,
  (val) => {
    if (!val) return;
    let resMsg = JSON.parse(val);

    // 不是固定模式的话不执行之后的操作
    if (examInfo.value && examInfo.value.examination.mode !== "2") return;

    if (resMsg.type === "group_examination_begin") {
      // 开始本轮考试
      groupExamTimeLeft.value = resMsg.data.time_left;
      // 开始考站考试倒计时
      groupExamCountDown();
    } else if (resMsg.type === "group_examination_end") {
      // 如果不是最后一轮
      if (resMsg.data.round < examInfo.value.rounds - 1) {
        if (resMsg.data.time_left) {
          changeStationTimeLeft.value = resMsg.data.time_left;
        } else {
          changeStationTimeLeft.value = examInfo.value.interval * 60 * 1000;
        }
        changeStationCountDown();
      }
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
            groupExamTimeLeft.value = resMsg.data.time_left;
            // 开始考站考试倒计时
            groupExamCountDown();
          }
        } else if (executeItem.type === "group_examination_end") {
          if (!resMsg.data.success) {
            return;
          }
          clearInterval(groupExamTimer.value);
          // 如果不是最后一轮
          if (executeItem.data.round < examInfo.value.rounds - 1) {
            if (resMsg.data.time_left) {
              changeStationTimeLeft.value = resMsg.data.time_left;
            } else {
              changeStationTimeLeft.value = examInfo.value.interval * 60 * 1000;
            }
            changeStationCountDown();
          }
        }

        setTimeout(() => {
          let index = waitStore.value.findIndex((item) => {
            return item.time == resMsg.time;
          });
          if (index !== -1) {
            waitStore.value.splice(index, 1);
          }
        }, 0);
      }
    }
  },
  {
    immediate: true,
  },
);
</script>

<style scoped lang="less">
.time-tag {
  @apply font-bold;
  font-size: var(--el-font-size-medium);
  .time-tag-label {
    color: var(--el-text-color-secondary);
  }
  .time-tag-msg {
    @apply w-100px inline-block;
    color: var(--el-text-color-regular);
  }
  .time-tag-time {
    @apply w-60px inline-flex items-center;
    color: var(--el-color-primary);
    font-family: D-DIN-Bold;
    font-size: var(--el-font-size-large);
    letter-spacing: 2px;
  }
}
</style>
