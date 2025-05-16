import { useDeviceState } from "../../deviceState";
import screenfull from "screenfull";

const { type, WS, station, deviceLogin, deviceLogout, disconnect } =
  useDeviceState();

watch(
  () => WS.value?.status,
  (val) => {
    if (!val || val === "CLOSED") {
    }
  },
);

/** 监听消息 */
watch(
  () => WS.value?.data,
  (val) => {
    // 当前设备不是 候考设备 则不处理
    if (type.value !== "waiting_room_display") return;

    if (!val) return;

    let res = JSON.parse(val);

    if (res.type === "examination_begin") {
      // 考试开始
      examBegin.value = true;
      examInfo.value = res.data;
      tempExamInfo.value = JSON.parse(JSON.stringify(examInfo.value));
      horizontalScrollInit();
    } else if (res.type === "examination_end") {
      // 考试结束

      initExam();
    } else {
      if (res.type === "group_examinee_call") {
        setStationList(res.data.group);
        const voiceText = getVoiceText();
        handleNotify(voiceText);
        // 要返回已考组，当前组
      } else if (res.type === "group_examinee_push") {
        if (ongoingIndex.value != undefined) {
          doneIndexList.value.push(ongoingIndex.value);
        }
        ongoingIndex.value = res.data.group;
        verticalScroll(res.data.group);
      } else if (res.type === "pushed_groups") {
        // 已推送的组
        doneIndexList.value = res.data.pushed_groups;
      } else if (res.type === "group_examinee_swap") {
        // 考生交换
        examInfo.value.schedules = res.data.updated_schedules;
        examInfo.value.groups = res.data.updated_groups;
        tempExamInfo.value = JSON.parse(JSON.stringify(examInfo.value));
      } else if (res.type === "examinee_absent") {
        // 考生缺考
        absentExaminees.value = res.data.absent_examinees;
      }
    }
  },
  {
    deep: true,
  },
);

const heightUnit = ref(0);
const widthUnit = ref(0);
const bodyCellWidth = ref(180);

/**
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 */

const loading = ref(false);

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
      document.getElementById("wait")?.requestFullscreen();
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
    appendTo: "#wait",
  })
    .then(() => {
      deviceLogout();
    })
    .catch(() => {});
};

const doneIndexList = ref<number[]>([]);
const ongoingIndex = ref<number>();
/** 设置行className */
const setRowClassName = (data: { row: any; rowIndex: number }) => {
  if (data.rowIndex === ongoingIndex.value) {
    return "row-ongoing row-class";
  }
  if (doneIndexList.value.includes(data.rowIndex)) {
    return "row-done row-class";
  }
  return "row-waiting row-class";
};

/** 语音播报 */
const initVoice = (config: any) => {
  window.speechSynthesis.cancel(); // 播报前建议调用取消的函数，如有正在播报的话音，播报会任务被塞进入队列，只有等上一个语音结束才会执行下一个语音
  //获取语音包
  let listArr = window.speechSynthesis.getVoices();
  listArr = listArr.filter((item) => item.lang.indexOf("zh-") > -1);
  if (listArr.length == 0) {
    console.error("没有可用的中文语音!");
  }
  //实例化播报内容
  let instance = new SpeechSynthesisUtterance();
  instance.text = config.text || ""; // 文字内容
  instance.lang = config.lang || "zh-CN"; // 使用的语言:中文
  instance.volume = config.vol || 1; // 声音音量：1
  instance.rate = config.rate || 1; // 语速：1
  instance.pitch = config.pitch || 1; // 音高：1
  window.speechSynthesis.speak(instance); // 播放
  instance.addEventListener("end", () => {}); // 监听播报完成状态，播完可以做些其它处理
};

/** 通知控制 */
const noticeVisible = ref(false);

const notifyTimer = ref();
/** 通知 */
const handleNotify = (voiceText?: string) => {
  noticeVisible.value = true;
  if (notifyTimer.value) {
    clearTimeout(notifyTimer.value);
  }
  notifyTimer.value = setTimeout(() => {
    noticeVisible.value = false;
  }, 60000);
  // vol 声音音量：1
  // rate 语速：1
  // pitch 音高：1
  // initVoice({
  //   text: voiceText,
  //   vol: 1,
  //   rate: 1.25,
  //   pitch: 1,
  // });
};

const examInfo = ref();
/** 考试状态标识 */
const examBegin = ref(false);

const absentExaminees = ref<number[]>([]);
/** 单元格样式设置（显示缺考） */
const setCellStyle = (row: any) => {
  if (row.columnIndex === 0 || row.columnIndex > row.length) {
    return {};
  }

  if (row.row[row.columnIndex - 1]) {
    if (absentExaminees.value.includes(row.row[row.columnIndex - 1].id)) {
      return { color: "var(--el-color-danger)" };
    }
  }
};

/** 获取语音播报文字
 * @param groupNum 组数
 * @returns
 */
const getVoiceText = () => {
  // const shouldSay = stationList.value.filter((i) => i.examinee);
  // let textFragmentArr = shouldSay.map((i) => {
  //   return `请考生${i.examinee.user.name} 到${i.roomName}`;
  // });
  // return `${textFragmentArr.join("，")}`;
  return "请以下考生前往指定考站并在站外进行等候";
};

const callTempStationList = ref<any[]>([]);

/** 考站列表（渲染叫号） */
const stationList = ref<any[]>([]);
/** 设置考站列表 */
const setStationList = (groupNum: number) => {
  stationList.value = JSON.parse(JSON.stringify(examInfo.value.arrangements));

  examInfo.value.groups[groupNum].forEach((item: any, index: number) => {
    stationList.value[index].examinee = item;
  });

  // 需要滚动
  if (stationList.value.length > 8) {
    callTempStationList.value = stationList.value.slice(0, 12);
    callScrollInit();
  }
};

/** 初始化考试的的基础信息 */
const initExam = () => {
  examBegin.value = false;
  examInfo.value = undefined;
  ongoingIndex.value = undefined;
  doneIndexList.value = [];
  noticeVisible.value = false;
  absentExaminees.value = [];
  clearListTimer();
  clearCallTimer();
};

/** 组号的最小列宽 */
const groupColMinWidth = computed(() => {
  return Math.round(80 * widthUnit.value);
});
/** 主内容的最小列宽 */
const mainColMinWidth = computed(() => {
  return bodyCellWidth.value * widthUnit.value;
});

/**
 * 临时的考试信息（因为列表的循环滚动需要添加一些列数）
 * 两个地方会被动改变它 1.考站开始 2.考生交换
 * 一个地方会主动改变它 1.初始化滚动
 */
const tempExamInfo = ref<any>();

const tableRef = ref();

/** 横向滚动timer */
const horizontalScrollTimer = ref();

/** 初始化列表水平滚动 */
const horizontalScrollInit = () => {
  // 过几秒之后再来初始化滚动（页面可能还没完全加载）
  setTimeout(() => {
    tempExamInfo.value = JSON.parse(JSON.stringify(examInfo.value));

    let wrapEl = document.querySelector(
      ".el-table__inner-wrapper",
    ) as HTMLElement;
    let nowMainCol = document.querySelector(
      ".row-class:nth-of-type(1) td:nth-of-type(2)",
    ) as HTMLElement;
    // 容器宽度
    let wrapWidth = wrapEl.offsetWidth;
    // 主滚动区域宽度
    let mainScrollWidth = wrapWidth - groupColMinWidth.value;
    // 主要内容列的宽度
    let nowMainColWidth = nowMainCol.offsetWidth;

    // 滚动区域现有列数
    let nowMainColCount = mainScrollWidth / nowMainColWidth;
    // 滚动区域最多列数
    let maxMainColCount = mainScrollWidth / mainColMinWidth.value;
    if (nowMainColCount >= maxMainColCount) {
      // 如果现有列数大于最多列数，则滚动
      // 设置滚动前，先添加列数
      let needAddColCount = Math.ceil(maxMainColCount);
      // 添加表头
      let needAddCol = tempExamInfo.value.arrangements.slice(
        0,
        needAddColCount,
      );
      tempExamInfo.value.arrangements =
        tempExamInfo.value.arrangements.concat(needAddCol);
      // 添加表体
      tempExamInfo.value.groups.forEach((item: any, index: number) => {
        let needAddCol = item.slice(0, needAddColCount);
        tempExamInfo.value.groups[index] =
          tempExamInfo.value.groups[index].concat(needAddCol);
      });

      clearListTimer();

      // 设置定时滚动
      horizontalScrollTimer.value = setInterval(() => {
        // 当前的left值
        let nowLeft = tableRef.value.scrollBarRef.wrapRef.scrollLeft;

        // left的最大改变值（到了最大值就到下一轮循环）
        let needChangeLeftMax =
          examInfo.value.arrangements.length * nowMainColWidth;

        // 当前left相对于列宽的倍数
        let tempMultiple = nowLeft / nowMainColWidth;

        // 如果left不是列数的整数倍
        if (tempMultiple % 1 !== 0) {
          // 如果滚动超限
          if (needChangeLeftMax < nowLeft) {
            tableRef.value.scrollBarRef.wrapRef.scrollLeft =
              nowLeft - needChangeLeftMax;
            return;
          }
          // 滚动到下一个整数倍
          smoothScroll(
            tableRef.value.scrollBarRef.wrapRef,
            Math.ceil(tempMultiple) * nowMainColWidth,
            1000,
            "scrollLeft",
          );

          return;
        }

        // 如果当前left值刚好等于最大值，则重置为0
        if (needChangeLeftMax === nowLeft) {
          tableRef.value.scrollBarRef.wrapRef.scrollLeft = 0;
          nowLeft = 0;
        } else if (needChangeLeftMax < nowLeft) {
          // 如果滚动超限
          tableRef.value.scrollBarRef.wrapRef.scrollLeft =
            nowLeft - needChangeLeftMax;
          return;
        }

        smoothScroll(
          tableRef.value.scrollBarRef.wrapRef,
          nowLeft + nowMainColWidth,
          1000,
          "scrollLeft",
        );
      }, 3000);
    }
  }, 3000);
};

/** 清除水平列表timer */
const clearListTimer = () => {
  // 水平滚动timer
  if (horizontalScrollTimer.value) clearInterval(horizontalScrollTimer.value);
};
/** 清除叫号弹窗timer */
const clearCallTimer = () => {
  // 叫号滚动timer
  if (callScrollTimer.value) clearInterval(callScrollTimer.value);
};

/**
 * 列表垂直滚动
 */
const verticalScroll = (index: number) => {
  // 一行的高度
  let rowHeight = Math.round(100 * heightUnit.value);
  // 表头行高度
  let headerRowHeight = Math.round(110 * heightUnit.value);
  // 容器
  let wrapEl = document.querySelector(
    ".el-table__inner-wrapper",
  ) as HTMLElement;

  let wrapElHeight = wrapEl.offsetHeight - headerRowHeight;

  let midHeight = Math.round(wrapElHeight / 2);
  let nowGroupHeight = Math.round(index * rowHeight + rowHeight / 2);

  smoothScroll(
    tableRef.value.scrollBarRef.wrapRef,
    nowGroupHeight - midHeight,
    1000,
    "scrollTop",
  );
};

/**
 * 滚动函数
 * @param element 要滚动的元素
 * @param target 滚动到的位置
 * @param duration 滚动时间
 */
const smoothScroll = (
  element: HTMLElement,
  target: number,
  duration: number,
  prop: "scrollTop" | "scrollLeft",
) => {
  const start = element[prop];
  const change = target - start;
  const startTime = performance.now();
  function animateScroll(currentTime: any) {
    const elapsedTime = currentTime - startTime;
    const progress = Math.min(elapsedTime / duration, 1);
    const easeProgress = easeInOutQuad(progress);
    element[prop] = start + change * easeProgress;
    if (progress < 1) {
      requestAnimationFrame(animateScroll);
    }
  }
  requestAnimationFrame(animateScroll);

  // 缓动函数
  function easeInOutQuad(t: number) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }
};

const callScrollBarRef = ref();
const callScrollTimer = ref();

/** 叫号列表滚动 */
const callScrollInit = () => {
  // 过几秒之后再来初始化滚动
  setTimeout(() => {
    // 共有多少行
    let callRow = Math.ceil(examInfo.value.arrangements.length / 4);

    let wrapEl = document.querySelector(
      ".call-mid .scrollbar-container",
    ) as HTMLElement;
    let stationItem = wrapEl.querySelector(
      ".examinees-container:nth-of-type(1) .station-item:nth-of-type(1)",
    ) as HTMLElement;

    let rowHeight = stationItem.offsetHeight + Math.round(20 * widthUnit.value);

    let protoHeight = callRow * rowHeight;

    clearCallTimer();

    // 设置定时滚动
    callScrollTimer.value = setInterval(() => {
      let nowTop = callScrollBarRef.value.wrapRef.scrollTop;

      // 当前top相对于列高的倍数
      let tempMultiple = nowTop / rowHeight;

      // 如果top不是行数的整数倍
      if (tempMultiple % 1 !== 0) {
        // 如果滚动超限
        if (protoHeight < nowTop) {
          callScrollBarRef.value.wrapRef.scrollTop = nowTop - protoHeight;
          return;
        }

        // 滚动到下一个整数倍
        smoothScroll(
          callScrollBarRef.value.wrapRef,
          Math.ceil(tempMultiple) * rowHeight,
          1000,
          "scrollTop",
        );

        return;
      }

      // 如果当前top值刚好等于最大值，则重置为0
      if (protoHeight === nowTop) {
        callScrollBarRef.value.wrapRef.scrollTop = 0;
        nowTop = 0;
      } else if (protoHeight < nowTop) {
        // 如果滚动超限
        callScrollBarRef.value.wrapRef.scrollTop = nowTop - protoHeight;
        return;
      }

      smoothScroll(
        callScrollBarRef.value.wrapRef,
        nowTop + (stationItem.offsetHeight + Math.round(20 * widthUnit.value)),
        1000,
        "scrollTop",
      );
    }, 3000);
  }, 1000);
};

const updateElementVariables = () => {
  var element = document.getElementById("wait");

  var height = element!.offsetHeight;
  var width = element!.offsetWidth;

  document.documentElement.style.setProperty(
    "--height-unit",
    height / 1080 + "px",
  );
  document.documentElement.style.setProperty(
    "--width-unit",
    width / 1920 + "px",
  );
  heightUnit.value = height / 1080;
  widthUnit.value = width / 1920;

  // 如果考试开始了的话，则执行
  if (examInfo.value) {
    horizontalScrollInit();
  }
};
/** ============================== */

export function useWaitState() {
  return {
    WS,
    type,
    station,
    deviceLogin,
    disconnect,
    // 下边是组件需要的信息
    loading,
    examBegin,
    examInfo,
    tempExamInfo,
    groupColMinWidth,
    mainColMinWidth,
    isFullscreen,
    noticeVisible,
    stationList,
    callTempStationList,
    screenfull,
    callScrollBarRef,
    tableRef,
    handleLogout,
    handleScreenChange,
    setRowClassName,
    setCellStyle,
    updateElementVariables,
    initExam,
  };
}
