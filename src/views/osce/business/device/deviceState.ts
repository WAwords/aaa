import { useWebSocketState } from "@/request/webSocket/index";
import { useUserStore } from "@/store";
import type { StationListItemType } from "@/api/osce/business/stations";

const { connect, disconnect, sendMessage, WS } = useWebSocketState();

/** =============== 设备缓存相关 begin =============== */
const TypeKey = "device-type";
const StationKey = "device-station";

function getType() {
  return (localStorage.getItem(TypeKey) as DeviceType) ?? "";
}

/** 获取设备考站 */
function getStation() {
  let data = localStorage.getItem(StationKey);
  if (data) {
    return JSON.parse(data) as StationListItemType;
  } else {
    return;
  }
}

/** 设置设备类型 */
function setType(val: string) {
  return localStorage.setItem(TypeKey, val);
}

function setStation(val: StationListItemType) {
  return localStorage.setItem(StationKey, JSON.stringify(val));
}

function removeType() {
  return localStorage.removeItem(TypeKey);
}

function removeStation() {
  return localStorage.removeItem(StationKey);
}

/** =============== end =============== */

// 设备类型
const type = ref<DeviceType>(getType());
// 考站
const station = ref<StationListItemType | undefined>(getStation());
// 设备options
const deviceList = ref<DeviceTypeItem[]>([
  {
    label: "站内显示设备",
    type: "station_inner_display",
  },
  {
    label: "站外显示设备",
    type: "station_outer_display",
  },
  {
    label: "候考显示设备",
    type: "waiting_room_display",
  },
]);
// 设备名
const typeTitle = computed(() => {
  return deviceList.value.find((item) => item.type === type.value)?.label;
});

/** 设备连接WS */
const deviceWebSocketConnect = () => {};

/** =============== 设备登录登出 begin =============== */
/** 登出 */
const deviceLogout = () => {
  removeStation();
  removeType();
  type.value = "";
  station.value = undefined;
  disconnect();
};

/** 登录 */
const deviceLogin = (obj = { station: station.value, type: type.value }) => {
  if (WS.value) {
    return;
  }

  connect()
    .then(() => {
      // 类型为空则不连接
      if (!obj.type) {
        return;
      }

      let msg = {
        type: "device_registration",
        data: {
          token: useUserStore().token,
          device: obj.type,
          station: obj.station?.id ?? "",
        },
      };

      registration(msg)
        .then(() => {
          // 这里的数据改变主要用于跳转页面
          station.value = obj.station;
          type.value = obj.type;

          // 注册成功则设置缓存
          setType(obj.type);
          if (obj.station) {
            setStation(obj.station);
          }
        })
        .catch(() => {
          deviceLogout();
        });
    })
    .catch(() => {});
};

/** 注册设备 */
const registration = (msg: any): Promise<void> => {
  return new Promise((resolve, reject) => {
    sendMessage(msg, "showErrorTip")
      .then(() => {
        resolve();
      })
      .catch(() => {
        reject();
      });
  });
};

export type DeviceType =
  | "station_inner_display"
  | "station_outer_display"
  | "waiting_room_display"
  | "";

export function useDeviceState() {
  return {
    type,
    station,
    deviceList,
    typeTitle,
    WS,
    deviceLogout,
    deviceLogin,
    deviceWebSocketConnect,
    registration,
    disconnect,
  };
}

export type DeviceTypeItem = {
  label: string;
  type: DeviceType;
};
