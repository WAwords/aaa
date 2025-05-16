import { defHttp } from "@/request/axios";

enum Api {
  systemBuildings = "/system/buildings",
  systemBuildingsFloors = "/system/buildings/{buildingId}/floors",
  systemBuildingsFloorsRoom = "/system/buildings/{buildingId}/floors/{floorId}/rooms",
  systemRooms = "/system/rooms",
}

// 获取建筑列表
export const getBuildingListApi = (params: GetBuildingReqType) =>
  defHttp.get({
    url: Api.systemBuildings,
    params,
  });
// 新增建筑
export const addBuildingApi = (params: AddBuildingType) =>
  defHttp.post({
    url: Api.systemBuildings,
    params,
  });
// 修改建筑
export const editBuildingApi = (params: AddBuildingType, id: number) =>
  defHttp.put({
    url: Api.systemBuildings + `/${id}`,
    params,
  });
// 删除建筑
export const deleteBuildingApi = (id: number) =>
  defHttp.delete({
    url: Api.systemBuildings + `/${id}`,
  });
/**
 * 楼层
 */
// 获取楼层列表
export const getFloorListApi = (
  params: GetBuildingReqType,
  buildingId: number,
) =>
  defHttp.get({
    url: Api.systemBuildingsFloors.replace("{buildingId}", `${buildingId}`),
    params,
  });
// 新增楼层
export const addFloorApi = (params: AddBuildingType, buildingId: number) =>
  defHttp.post({
    url: Api.systemBuildingsFloors.replace("{buildingId}", `${buildingId}`),
    params,
  });
// 修改楼层
export const editFloorApi = (
  params: AddBuildingType,
  id: number,
  buildingId: number,
) =>
  defHttp.put({
    url:
      Api.systemBuildingsFloors.replace("{buildingId}", `${buildingId}`) +
      `/${id}`,
    params,
  });
// 删除楼层
export const deleteFloorApi = (id: number, buildingId: number) =>
  defHttp.delete({
    url:
      Api.systemBuildingsFloors.replace("{buildingId}", `${buildingId}`) +
      `/${id}`,
  });
/**
 * 房间
 */
// 获取房间列表
export const getRoomListApi = (
  params: GetBuildingReqType,
  buildingId: number,
  floorId: number,
) =>
  defHttp.get({
    url: Api.systemBuildingsFloorsRoom
      .replace("{buildingId}", `${buildingId}`)
      .replace("{floorId}", `${floorId}`),
    params,
  });
// 新增房间
export const addRoomApi = (
  params: AddBuildingType,
  buildingId: number,
  floorId: number,
) =>
  defHttp.post({
    url: Api.systemBuildingsFloorsRoom
      .replace("{buildingId}", `${buildingId}`)
      .replace("{floorId}", `${floorId}`),
    params,
  });
// 修改房间
export const editRoomApi = (
  params: AddBuildingType,
  id: number,
  buildingId: number,
  floorId: number,
) =>
  defHttp.put({
    url:
      Api.systemBuildingsFloorsRoom
        .replace("{buildingId}", `${buildingId}`)
        .replace("{floorId}", `${floorId}`) + `/${id}`,
    params,
  });
// 删除房间
export const deleteRoomApi = (
  id: number,
  buildingId: number,
  floorId: number,
) =>
  defHttp.delete({
    url:
      Api.systemBuildingsFloorsRoom
        .replace("{buildingId}", `${buildingId}`)
        .replace("{floorId}", `${floorId}`) + `/${id}`,
  });
// 获取所有房间
export const getSystemRoomsApi = (params: GetRoomListReqType) =>
  defHttp.get({
    url: Api.systemRooms,
    params,
  });

// --类型定义
export type GetBuildingReqType = {
  pageNumber?: number;
  pageSize?: number;
  [property: string]: any;
};
export type BuildingListItemType = {
  createdAt: string;
  id: number;
  name: string;
  [property: string]: any;
};
export type AddBuildingType = {
  /**
   * 建筑名
   */
  name: string;
  [property: string]: any;
};
export type GetFloorReqType = {
  buildingId: number | Ref<number>;
  pageNumber?: number;
  pageSize?: number;
  [property: string]: any;
};
/**
 * 楼层列表item
 */
export type FlooritemType = {
  /**
   * 创建时间
   */
  createdAt: string;
  /**
   * 楼层主键
   */
  id: number;
  /**
   * 楼层名，可以为数字，例如1、2、3等；可以为字母，例如LG、L1、L2等。
   */
  name: string;
  [property: string]: any;
};
export type GetRoomReqType = {
  floorId: number | Ref<number>;
  buildingId: number | Ref<number>;
  pageNumber?: number;
  pageSize?: number;
  [property: string]: any;
};
/**
 * 房间列表项
 */
export type RoomListItemType = {
  /**
   * 主键
   */
  id: number;
  /**
   * 房间名
   */
  name: string;
  /**
   * 房间号
   */
  number: string;
  /**
   * 房间类型，0未设置，1普通房间，2教室，3考站，4训练室，默认0
   */
  type: string;
  [property: string]: any;
};
/**
 * 房间新增
 */
export type AddRoomType = {
  /**
   * 房间名
   */
  name: string;
  /**
   * 房间号
   */
  number: string;
  /**
   * 房间类型，0未设置，1普通房间，2教室，3考站，4训练室，默认0
   * 0.1.0为手动输入<string>
   */
  type: string;
  [property: string]: any;
};
/**
 * 获取所有房间请求type
 */
export type GetRoomListReqType = {
  buildingId?: number;
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
/**
 * 房间列表item的type
 */
export type AllRoomListItemType = {
  /**
   * 建筑名
   */
  buildingName: string;
  /**
   * 楼层名
   */
  floorName: string;
  /**
   * 房间主键
   */
  roomId: number;
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
