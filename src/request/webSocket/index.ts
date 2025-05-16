import { useWebSocket } from "@vueuse/core";

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

const WS = ref<any>(null);

/** 连接WS */
function connect(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (WS.value) {
      WS.value.close();
      WS.value = null;
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
      onMessage: () => {},
      onConnected: () => {
        resolve();
      },
      onDisconnected: () => {
        // 清空连接对象
        WS.value = null;
      },
      onError: (err: any) => {
        // 清空连接对象
        WS.value = null;

        CmeMessage({
          title: "提示",
          message: "服务连接失败，请检查网络后重试",
          type: "warning",
        });
        reject(err);
      },
    });
  });
}

/** 断开WS连接 */
function disconnect() {
  if (WS.value) {
    WS.value.close();
  }
}

/** WS发送消息 */
/** 等待被response的消息数组 */
const waitStore = ref<{ type: string; time?: number; [key: string]: any }[]>(
  [],
);
/** ws发送消息
 * @param msg 消息
 * @param showTimeoutTip 是否显示错误提示
 */
function sendMessage(
  msg: { type: string; [key: string]: any },
  showTip: Boolean | "showSuccessTip" | "showErrorTip" = false,
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
            if (
              (typeof showTip === "boolean" && showTip) ||
              showTip === "showSuccessTip"
            ) {
              CmeMessage({
                title: "成功",
                message: resMsg.data.message,
                type: "success",
              });
            }
          } else {
            reject(resMsg);
            if (
              (typeof showTip === "boolean" && showTip) ||
              showTip === "showErrorTip"
            ) {
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
          }, 0);
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

export function useWebSocketState() {
  return {
    connect,
    disconnect,
    sendMessage,
    WS,
  };
}
