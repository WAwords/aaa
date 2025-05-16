import { defHttp } from "@/request/axios";

enum Api {
  osceExamineeGroups = "/osce/examinee-groups",
  modifyUrl = "/osce/examinee-groups/{groupId}/examinees",
}

// 获取考生组列表
export const getGroupListApi = (params: GetGroupListReqType) =>
  defHttp.get({
    url: Api.osceExamineeGroups,
    params,
  });
// 新增考生组
export const postGroupApi = (params: AddGroupType) =>
  defHttp.post({
    url: Api.osceExamineeGroups,
    params,
  });
// 更新考生组
export const putGroupApi = (params: AddGroupType, id: number) =>
  defHttp.put({
    url: Api.osceExamineeGroups + `/${id}`,
    params,
  });
// 删除考生组
export const deleteGroupApi = (ids: string) =>
  defHttp.delete({
    url: Api.osceExamineeGroups + `/${ids}`,
  });
/**
 ********************
 */
// 获取考生组考生列表
export const getGroupExamineeApi = (
  params: GetGroupExamineeType,
  groupId: number,
) =>
  defHttp.get({
    url: Api.modifyUrl.replace("{groupId}", groupId + ""),
    params,
  });
// 维护考生组考生列表
export const modifyGroupExamineeApi = (
  params: ModifyGroupExamineeType,
  groupId: number,
) =>
  defHttp.post({
    url: Api.modifyUrl.replace("{groupId}", groupId + ""),
    params,
  });

// 类型
export type GetGroupListReqType = {
  /**
   * 考生组名关键字
   */
  name?: string;
  pageNumber?: number;
  pageSize?: number;
  [property: string]: any;
};
export type AddGroupType = {
  /**
   * 考生组名
   */
  name: string;
  remark: string;
  [property: string]: any;
};
export type GroupItemType = {
  /**
   * 创建时间
   */
  createdAt: string;
  id: number;
  /**
   * 考生组名
   */
  name: string;
  /**
   * 备注
   */
  remark?: string;
  [property: string]: any;
};
export type ModifyGroupExamineeType = {
  /**
   * 逗号间隔的考生物理主键，例如：11,12,13,14,15
   */
  examineeIds: string;
  [property: string]: any;
};
export type GetGroupExamineeType = {
  /**
   * 考生姓名关键字
   */
  name?: string;
  pageNumber?: number;
  pageSize?: number;
  [property: string]: any;
};
export type GroupExamineeItemType = {
  /**
   * 班级
   */
  class?: string;
  /**
   * 院系
   */
  college?: string;
  /**
   * 创建时间
   */
  createdAt: string;
  /**
   * 性别，0未选择，1男，2女。默认0
   */
  gender?: number;
  /**
   * 年级
   */
  grade?: number;
  id: number;
  /**
   * 专业
   */
  major?: string;
  /**
   * 姓名
   */
  name: string;
  /**
   * 手机号码
   */
  phoneNumber?: string;
  /**
   * 备注
   */
  remark?: string;
  /**
   * 学号
   */
  studentNumber?: string;
  [property: string]: any;
};
