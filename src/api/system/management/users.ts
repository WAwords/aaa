import { defHttp } from "@/request/axios";

enum Api {
  systemUsers = "/system/users",
}

// 导入考官
export const importUsersApi = (params: any) =>
  defHttp.post({
    url: Api.systemUsers + "/import",
    params,
  });
// 获取用户列表
export const getUserListApi = (params: GetUserListReqType) =>
  defHttp.get({
    url: Api.systemUsers,
    params,
  });
// 新增用户
export const addUserApi = (params: AddUserType) =>
  defHttp.post({
    url: Api.systemUsers,
    params,
  });
// 修改用户
export const editUserApi = (params: AddUserType, id: number) =>
  defHttp.put({
    url: Api.systemUsers + `/${id}`,
    params,
  });
// 批量删除用户
export const deleteUsersApi = (ids: string) =>
  defHttp.delete({
    url: Api.systemUsers + `/${ids}`,
  });

// --类型定义
export type GetUserListReqType = {
  /**
   * 0未设置，1男，2女
   */
  gender?: string;
  idNumber?: string;
  name?: string;
  pageNumber?: number;
  pageSize?: number;
  phoneNumber?: string;
  [property: string]: any;
};
export type AddUserType = {
  /**
   * 电子邮箱
   */
  emailAddress?: string;
  /**
   * 性别，0未选择，1男，2女。默认0
   */
  gender?: string;
  /**
   * 唯一识别号
   */
  idNumber: string;
  /**
   * 识别号类型，1身份证，9其他
   */
  idType: "1" | "9";
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
  [property: string]: any;
};
export type UserListItemType = {
  /**
   * 电子邮箱
   */
  email?: string;
  /**
   * 性别值
   */
  gender?: string;
  /**
   * 性别中文
   */
  genderName?: string;
  /**
   * 物理主键
   */
  id: number;
  /**
   * 唯一识别号
   */
  idNumber: string;
  /**
   * 识别号类型，1身份证，9其他
   */
  idType: "1" | "9";
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
  [property: string]: any;
};
