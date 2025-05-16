import { defHttp } from "@/request/axios";

enum Api {
  osceStations = "/osce/stations",
}

// 获取考站列表
export const getStationListApi = (params: GetStationListReqType) =>
  defHttp.get({
    url: Api.osceStations,
    params,
  });
// 维护考站
export const modifyStationApi = (params: ModifyStationType) =>
  defHttp.post({
    url: Api.osceStations,
    params,
  });
// 批量删除考站
export const deleteStationsApi = (ids: string) =>
  defHttp.delete({
    url: Api.osceStations + `/${ids}`,
  });

// --类型定义
export type GetStationListReqType = {
  /**
   * 开始时间，传递此参数也必须传递 endAt，结果的 available 及 activities 才可用
   */
  beginAt?: string;
  /**
   * 所在建筑
   */
  buildingId?: number;
  /**
   * 结束时间，传递此参数也必须传递 beginAt，结果的 available 及 activities 才可用
   */
  endAt?: string;
  /**
   * 所在楼层
   */
  floorId?: number;
  pageNumber?: number;
  pageSize?: number;
  /**
   * 房间名关键字
   */
  roomName?: string;
  /**
   * 房间号关键字
   */
  roomNumber?: string;
  [property: string]: any;
};
export type ModifyStationType = {
  /**
   * 逗号间隔的房间主键
   */
  roomIds: string;
  [property: string]: any;
};
/**
 * 考站列表item
 */
export type StationListItemType = {
  /**
   * 活动列表，查询参数传递了 beginAt 及 endAt 此结果才可用，如果 available 为 false 可通过此字段来查看不可用原因
   */
  activities: any[];
  /**
   * 考站是否可用，查询参数传递了 beginAt 及 endAt 此结果才可用，表明考站是否可用，如果结果为 false 可通过 activities 来查看不可用原因
   */
  available: boolean;
  /**
   * 建筑名
   */
  buildingName: string;
  /**
   * 楼层名
   */
  floorName: string;
  /**
   * 考站主键
   */
  id: number;
  /**
   * 房间名
   */
  roomName: string;
  /**
   * 房间号
   */
  roomNumber: string;
  [property: string]: any;
};
