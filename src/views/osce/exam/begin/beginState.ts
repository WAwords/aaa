import { useWebSocket } from "@vueuse/core";
import { useUserStore } from "@/store";

/** websocket连接实例 */
const WS = ref();
/** 考试信息 */
const examInfo = ref<any>(null);
/** 考站列表 */
const stationList = ref<StationItem[]>([]);
/** 接受websocket消息后的处理函数列表 */
const executeFunList = ref<{ from: string; fun: Function }[]>([]);
/** 断开websocket连接 */
export function closeWebsocket() {
  if (WS.value) {
    WS.value.close();
    WS.value = null;
    // executeFunList.value = [];
    beginStateInit();
  }
}
/** 自动获取标识 */
const autoFetchFlag = ref(false);
/**
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * 固定模式
 */
/** 当前考生组（注意：初始为-1是因为初始时并没有考生组准备考试） */
const group = ref(-1);
/** 当前考试轮次 */
const round = ref(0);
/** 考生组考试状态
 * 0:未推送(考站初始状态,按钮为‘不可见状态’)
 * 1:已推送(按钮为‘开始考试’)
 * 2:进行中(按钮为‘结束考试’)
 * 3:换站中(按钮为‘结束换站’)
 */
const examineeGroupExamStatus = ref(0);
/** 等待被response的消息数组 */
const waitStore = ref<{ type: string; time?: number; [key: string]: any }[]>(
  [],
);
/** 分组考站列表（为stationList的浅拷贝） */
const stationGroupList = ref<any[][]>([]);
/** 已推送的考生组 */
const pushedGroups = ref<number[]>([]);
/** 缺考的考生 */
const absentExaminees = ref<number[]>([]);

/** 主返回方法 */
export function useBeginState(
  fun?: (event: any) => void,
  from?: string,
): BeginStateReturn {
  if (!WS.value) {
    initWS();
  }
  if (fun) {
    if (from) {
      // 如果方法不存在则添加
      if (!executeFunList.value.map((item) => item.from).includes(from)) {
        executeFunList.value.push({
          from,
          fun,
        });
      }
    }
  }

  return {
    WS,
    examInfo,
    stationList,
    executeFunList,
    group,
    round,
    examineeGroupExamStatus,
    waitStore,
    stationGroupList,
    pushedGroups,
    absentExaminees,
    autoFetchFlag,
    arrCutGroup,
    setStationReady,
    closeWebsocket,
    setStationWait,
    setStationStart,
    beginStateInit,
    setStationInit,
    sendMessage,
    examBeginMsgExecute,
  };
}

/** 外部调用连接websocket */
export function connect() {
  initWS();
}

/** 初始化websocket */
const initWS = () => {
  let websocketUrl = "";
  if (import.meta.env.MODE === "production") {
    websocketUrl = `ws://${window.location.host}${
      import.meta.env.VITE_API_WS_BASE_URL
    }/websocket/osce/examination`;
  } else {
    websocketUrl = `${
      import.meta.env.VITE_API_WS_BASE_URL
    }/websocket/osce/examination`;
  }

  WS.value = useWebSocket(websocketUrl, {
    autoReconnect: {
      retries: 5,
      delay: 5000,
      onFailed() {
        console.log("无法建立websocket连接");
      },
    },
    heartbeat: {
      // 心跳
      message: JSON.stringify({
        type: "heartbeat",
      }),
      interval: 15000,
    },
    onMessage: (ws, event) => {
      ws;
      const res = JSON.parse(event.data);
      if (res.type === "examination_begin") {
        examBeginMsgExecute(res);
      } else if (res.type === "examination_end") {
        beginStateInit();
      } else if (res.type === "error") {
        CmeMessage({
          title: "提示",
          message: res.data.message,
          type: "error",
        });
      }

      // 组件渲染后执行（避免方法没挂载）
      nextTick(() => {
        executeFunList.value.forEach((item) => {
          item.fun(res);
        });
      });
    },
    onConnected() {
      let obj = {
        type: "device_registration",
        data: {
          token: useUserStore().token,
          device: "central_control",
        },
      };
      sendMessage(obj, false).catch(() => {});
    },
    onDisconnected() {
      console.log("onDisconnected");
    },
    onError(err: any) {
      console.log("onError", err);
    },
  });
};

/**
 * ws发送消息
 * @param msg 消息
 * @param showTimeoutTip 是否显示错误提示
 */
function sendMessage(
  msg: { type: string; [key: string]: any },
  showTip = false,
  showTimeoutTip = true,
) {
  return new Promise<{ [key: string]: any }>((resolve, reject) => {
    if (WS.value.status !== "OPEN") {
      CmeMessage({
        title: "失败",
        message: `与服务器断开连接，无法操作，请检查网络或尝试刷新页面`,
        type: "error",
      });
      reject();
      return;
    }

    // 获取时间戳
    const time = new Date().getTime();
    // 将时间戳添加到消息中
    msg.time = time;
    // 将消息添加到等待response的队列中
    waitStore.value.push(msg);
    // 发送消息
    WS.value.send(JSON.stringify(msg));

    // 延时器timer
    let timeoutTimer: any;

    let stopWatch = watch(
      () => WS.value.data,
      (val) => {
        if (!val) return;
        let resMsg = JSON.parse(val);
        if (resMsg.type === "response" && resMsg.time === time) {
          if (resMsg.data.success) {
            resolve(resMsg);
            if (showTip) {
              CmeMessage({
                title: "成功",
                message: resMsg.data.message,
                type: "success",
              });
            }
          } else {
            reject(resMsg);
            if (showTip) {
              CmeMessage({
                title: "失败",
                message: resMsg.data.message,
                type: "error",
              });
            }
          }
          // 移除等待队列中的消息
          setTimeout(() => {
            let tempIndex = waitStore.value.findIndex((item) => {
              return item.time == time;
            });
            if (tempIndex !== -1) {
              waitStore.value.splice(tempIndex, 1);
            }
          }, 1000);
          // 停止监听
          stopWatch();
          // 清理延时器
          clearTimeout(timeoutTimer);
        }
      },
      {
        deep: true,
      },
    );

    timeoutTimer = setTimeout(() => {
      const allTimeList = waitStore.value.map((item) => item.time);
      if (allTimeList.includes(time)) {
        // 超时未收到response，从等待队列中移除并反馈超时
        let tempIndex = waitStore.value.findIndex((item) => {
          return item.time == time;
        });
        if (tempIndex !== -1) {
          waitStore.value.splice(tempIndex, 1);
        }
        // 提示超时
        if (showTimeoutTip) {
          CmeMessage({
            title: "提示",
            message: "websocket响应超时，请检查网络连接",
            type: "error",
            plain: true,
            showClose: true,
          });
        }
        reject();
      }
    }, 10 * 1000);
  });
}

/** 为所有考站设置等待中的考生（叫号，或一轮考试结束后）--固定模式
 * @param group 组别
 * @param round 轮次
 */
export const setStationWait = (
  groupNum: number,
  roundNum = 0,
  setStatus = true,
) => {
  if (roundNum >= examInfo.value.rounds) {
    console.error("round 超出范围");
    return;
  }

  // 将考生组长度拓展到和考站列表长度一致
  let examineeGroupTemp = Array(stationList.value.length).fill(null);
  examInfo.value.groups[groupNum].forEach((item: any, index: number) => {
    examineeGroupTemp[index] = item;
  });

  // 考生组按考站分组后的数组
  const examineeGroup = arrCutGroup(
    examineeGroupTemp,
    stationList.value.length / examInfo.value.rounds,
  );

  // 得到设置完轮数的考生组
  let roundedExamineeGroup = examineeGroup.map((item) => {
    return getRoundList(item, roundNum);
  });

  // 对应考站的考生
  const finalExamineeGroupList = roundedExamineeGroup.flat();

  finalExamineeGroupList.forEach((item, index) => {
    stationList.value[index].waitExamineeStatus = 0;
    stationList.value[index].examineeStatus = 0;
    if (item) {
      stationList.value[index].waitExaminee = item;
      if (absentExaminees.value.includes(item.id)) {
        // 设置缺席状态
        stationList.value[index].waitExamineeStatus = 2;
      } else {
        // 设置正常状态
        stationList.value[index].waitExamineeStatus = 0;
      }
    } else {
      stationList.value[index].waitExaminee = null;
      stationList.value[index].waitExamineeStatus = 1;
    }
  });

  if (setStatus) {
    stationList.value.forEach((item) => {
      item.status = "1";
    });
  }
};

/** 设置考站的状态为‘考生准备中’--固定模式
 *  这个方法将会把考站的waitExaminee变为examinee（从等待中的考生变为准备中的考生）
 */
export const setStationReady = (groupNum: number, roundNum = 0) => {
  group.value = groupNum;
  round.value = roundNum;

  setStationWait(groupNum, roundNum);
  stationList.value.forEach((item) => {
    item.status = "2";
    item.examinee = item.waitExaminee;
    item.waitExaminee = null;
    // 将轮空状态转移
    item.examineeStatus = item.waitExamineeStatus;
    item.waitExamineeStatus = 0;
  });
};

/**
 * 设置考站的状态为‘考试中’--固定模式
 */
export const setStationStart = (groupNum: number, roundNum = 0) => {
  setStationReady(groupNum, roundNum);

  stationList.value.forEach((item) => {
    item.status = "3";
  });
};

/**
 * 设置考站状态为最初始的状态
 * @param keepWaitExaminee 是否保留等待中的考生
 */
export const setStationInit = (keepWaitExaminee?: boolean) => {
  if (keepWaitExaminee) {
    stationList.value.forEach((item) => {
      item.status = "1";
      item.examinee = null;
      item.examineeStatus = 0;
    });
  } else {
    stationList.value.forEach((item) => {
      item.status = "1";
      item.examinee = null;
      item.waitExaminee = null;
      item.waitExamineeStatus = 0;
      item.examineeStatus = 0;
    });
  }
};

/**
 * 将数组分组（浅拷贝）--固定模式
 * @param arr 列表
 * @param num 多少组
 */
export const arrCutGroup = (arr: any[], num: number): any[][] => {
  let tempArr = [];
  let groupHasStationNum = arr.length / num;
  for (let i = 0; i < num; i++) {
    arr[i];
    tempArr.push(
      arr.slice(
        i * groupHasStationNum,
        i * groupHasStationNum + groupHasStationNum,
      ),
    );
  }
  return tempArr;
};

/** 初始化 */
const beginStateInit = () => {
  examInfo.value = null;
  stationList.value = [];
  group.value = -1;
  round.value = 0;
  examineeGroupExamStatus.value = 0;
  waitStore.value = [];
  stationGroupList.value = [];
  executeFunList.value = [];
  pushedGroups.value = [];
  absentExaminees.value = [];
};

/** 开始考试时接收到消息后的处理 */
export function examBeginMsgExecute(res: any) {
  // 更新考试信息
  examInfo.value = res.data;
  // 获取考站列表
  stationList.value = res.data.arrangements.map((item: any) => {
    return {
      roomNumber: item.roomNumber,
      roomName: item.roomName,
      skillTypeName: item.skillTypeName,
      chiefExaminerName: item.chiefExaminerName,
      deputyExaminerName: item.deputyExaminerName,
      chiefExaminerRatio: item.chiefExaminerRatio,
      deputyExaminerRatio: item.deputyExaminerRatio,
      stationId: item.stationId,
      status: "1", // 1-等待中 2-准备中 3-进行中
      examinee: null,
    };
  });
}

/**
 * 获取数组不同轮数的数组--固定模式
 * @param arr
 * @param round 轮数
 * @returns 新数组
 */
export const getRoundList = (arr: any, round: number) => {
  let arrTemp = arr.slice(arr.length - round);
  arr.splice(arr.length - round, arr.length);
  return [...arrTemp, ...arr];
};

export type StationItem = {
  roomNumber: string;
  roomName: string;
  skillTypeName: string;
  chiefExaminerName: string;
  deputyExaminerName: string;
  chiefExaminerRatio: number;
  deputyExaminerRatio: number;
  stationId: number;
  status: "1" | "2" | "3";
  examinee: any;
  waitExaminee?: any; // 等待的考生（固定模式‘叫号’后的等待考生）
  waitExamineeStatus?: 0 | 1 | 2; // 下一考生的状态（0-正常 1-轮空 2-缺考）
  examineeStatus?: 0 | 1 | 2; // 当前考生的状态（0-正常 1-轮空 2-缺考）
  [key: string]: any;
};

type BeginStateReturn = {
  /** websocket连接实例 */
  WS: Ref<any>;
  /** 考试信息 */
  examInfo: Ref<any>;
  /** 考站列表 */
  stationList: Ref<StationItem[]>;
  /** 接受websocket消息后的处理函数列表 */
  executeFunList: Ref<{ from: string; fun: Function }[]>;
  /** 当前考生组（注意：初始为-1是因为初始时并没有考生组准备考试 */
  group: Ref<number>;
  /** 当前考试轮次 */
  round: Ref<number>;
  /** 考生组考试状态
   * 0:未推送(考站初始状态,按钮为‘不可见状态’)
   * 1:已推送(按钮为‘开始考试’)
   * 2:进行中(按钮为‘结束考试’)
   * 3:换站中(按钮为‘结束换站’)
   */
  examineeGroupExamStatus: Ref<number>;
  /** 等待被response的消息数组 */
  waitStore: Ref<{ type: string; time?: number; [key: string]: any }[]>;
  /** 分组考站列表（为stationList的浅拷贝） */
  stationGroupList: Ref<any[][]>;
  /** 已推送的考生组 */
  pushedGroups: Ref<number[]>;
  /** 缺考的考生 */
  absentExaminees: Ref<number[]>;
  /**
   * 将数组分组（浅拷贝）--固定模式
   * @param arr 列表
   * @param num 多少组
   */
  arrCutGroup: Function;
  /** 设置考站的状态为‘考生准备中’--固定模式
   *  这个方法将会把考站的waitExaminee变为examinee（从等待中的考生变为准备中的考生）
   */
  setStationReady: Function;
  /** 断开websocket连接 */
  closeWebsocket: Function;
  /** 为所有考站设置等待中的考生（叫号，或一轮考试结束后）--固定模式
   * @param group 组别
   * @param round 轮次
   */
  setStationWait: Function;
  /**
   * 设置考站的状态为‘考试中’--固定模式
   */
  setStationStart: Function;
  /** 初始化 */
  beginStateInit: Function;
  /**
   * 设置考站状态为最初始的状态
   * @param keepWaitExaminee 是否保留等待中的考生
   */
  setStationInit: Function;
  /** ws发送消息
   * @param msg 消息
   * @param showTimeoutTip 是否显示错误提示
   */
  sendMessage: Function;
  /** 开始考试时接收到消息后的处理 */
  examBeginMsgExecute: Function;
  /** 自动获取标识 */
  autoFetchFlag: Ref<boolean>;
};
