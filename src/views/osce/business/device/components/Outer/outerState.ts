import { useDeviceState } from "../../deviceState";
import screenfull from "screenfull";

const { type, WS, station, deviceLogin, deviceLogout, disconnect } =
  useDeviceState();

watch(
  () => WS.value?.status,
  (val) => {
    if (!val || val === "CLOSED") {
      clearInterval(timer.value);
    }
  },
);

/** 监听消息 */
watch(
  () => WS.value?.data,
  (val) => {
    // 当前设备不是站内设备则不处理
    if (type.value !== "station_outer_display") return;

    if (!val) return;

    let res = JSON.parse(val);

    if (res.type === "examination_begin") {
      examBegin.value = true;
      copyObjectValue(displayMsg.value, res.data.arrangement);
      examInfo.value = res.data;
    } else if (res.type === "examination_end") {
      // 考站结束考试
      initExam();
    } else if (res.type === "response") {
    } else {
      if (examInfo.value.examination.mode === "1") {
        // 非固定模式

        if (res.type === "station_examinee_select") {
          // 考生选择
          examinee.value = examInfo.value.examinees.find(
            (i: any) => i.id === res.data.examinee,
          );
          stationStatus.value = 1;
        } else if (res.type === "station_examination_begin") {
          // 考站开始考试
          scoringStatus.value = true;
          stationStatus.value = 2;
          timeLeft.value = res.data.time_left;
          countDown();
        } else if (res.type === "station_scoring_status") {
          // 考站提交成绩
          if (res.data.complete === true) {
            examinee.value = undefined;
            scoringStatus.value = false;
          }
          stationStatus.value = 0;
          clearInterval(timer.value);
        }
      } else if (examInfo.value.examination.mode === "2") {
        // 固定模式
        if (res.type === "group_examinee_call") {
          if (stationStatus.value === 2) {
            nextCall.value = res.data;
          }
          // 叫号
          lastingMsg.value = res.data;
          stationStatus.value = 0;
        } else if (res.type === "group_examinee_push") {
          timeLeft.value = examInfo.value.arrangement.duration * 60 * 1000;
          lastingMsg.value = res.data;
          stationStatus.value = 1;
        } else if (res.type === "group_examination_begin") {
          // 倒计时
          timeLeft.value = res.data.time_left;
          countDown();
          lastingMsg.value = {
            ...lastingMsg.value,
            ...res.data,
          };
          stationStatus.value = 2;
        } else if (res.type === "group_examination_end") {
          if (res.data.complete === false) {
            // 如果不是最后一轮，赋值
            lastingMsg.value = res.data;
          } else {
            if (nextCall.value) {
              // 如果有下一轮叫号，则赋值
              lastingMsg.value = nextCall.value;
              nextCall.value = null;
            } else {
              // 否则置空
              lastingMsg.value = null;
            }
          }

          stationStatus.value = 0;
          clearInterval(timer.value);
        } else if (res.type === "group_examination_change") {
          timeLeft.value = examInfo.value.arrangement.duration * 60 * 1000;
          lastingMsg.value = res.data;
          stationStatus.value = 1;
        }
      }
    }
  },
  {
    deep: true,
  },
);

/* ============================== */

/** 当前考生下一考站 */
const nextStationComVal = computed(() => {
  if (lastingMsg.value?.next_station) {
    return lastingMsg.value?.next_station?.room_name;
  } else {
    return "无";
  }
});
/** 当前考站下一考生 */
const nextExamineeComVal = computed(() => {
  if (lastingMsg.value?.next_examinee) {
    return examInfo.value.examinees.find(
      (i: any) => i.id === lastingMsg.value?.next_examinee,
    )?.user?.name;
  } else {
    return "无";
  }
});

/** 全屏标识 */
const isFullscreen = ref(false);
screenfull.onchange(() => {
  isFullscreen.value = screenfull.isFullscreen;
});
const handleScreenChange = () => {
  if (screenfull.isEnabled) {
    if (isFullscreen.value) {
      screenfull.toggle();
    } else {
      document.getElementById("outer")?.requestFullscreen();
    }
    isFullscreen.value = !isFullscreen.value;
  }
};

/** 登出设备 */
const handleLogout = () => {
  CmeMessageBox.confirm("确定登出设备吗？", "系统提示", {
    distinguishCancelAndClose: true,
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    appendTo: "#outer",
  })
    .then(() => {
      deviceLogout();
    })
    .catch(() => {});
};

/** 考站状态（0：等待考生中， 1：考生准备中，2：考生考试中） */
const stationStatus = ref<0 | 1 | 2>(0);
/** ws开始考试的初始消息--固定模式 */
const examInfo = ref();
/** 当前站消息存储--固定模式 */
const lastingMsg = ref<any>(null);
/** 下一组考生叫号的缓存（最后一轮考试可以叫号下一组考生） */
const nextCall = ref<any>(null);

/** 考试状态标识 */
const examBegin = ref(false);
/** 显示相关信息 */
const displayMsg = ref({
  roomName: "",
  roomNumber: "",
  skillTypeName: "",
  duration: "",
});
/** 考生 */
const examinee = ref();
/** 开始评分状态 */
const scoringStatus = ref(false);

/** 本站考试倒计时 */
const timeLeft = ref(0);
/** 剩余时间的显示 */
const timeLeftFormat = computed(() => {
  return msToTime(timeLeft.value);
});
const timer = ref<any>();
/** 考站考试倒计时 */
const countDown = () => {
  timer.value = setInterval(() => {
    if (timeLeft.value - 1000 < 0) {
      timeLeft.value = 0;
      clearInterval(timer.value);
    } else {
      timeLeft.value -= 1000;
    }
  }, 1000);
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

/** 初始化考站考试的的基础信息 */
const initExam = () => {
  examInfo.value = undefined;
  examBegin.value = false;
  displayMsg.value = {
    roomName: "",
    roomNumber: "",
    skillTypeName: "",
    duration: "",
  };
  examinee.value = undefined;
  scoringStatus.value = false;
  stationStatus.value = 0;
  lastingMsg.value = null;
  clearInterval(timer.value);
};
/** ============================== */

export function useOuterState() {
  return {
    WS,
    type,
    station,
    deviceLogin,
    disconnect,
    // 下边是组件需要的信息
    nextStationComVal,
    nextExamineeComVal,
    timeLeftFormat,
    examBegin,
    displayMsg,
    stationStatus,
    examInfo,
    examinee,
    lastingMsg,
    isFullscreen,
    screenfull,
    handleScreenChange,
    handleLogout,
    initExam,
  };
}
