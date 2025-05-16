import { defHttp } from "@/request/axios";

enum Api {
  systemRolesUrl = "/system/roles",
  systemRolesMenusUrl = "/system/roles/{roleId}/menus",
  rolesUsersUrl = "/system/roles/{roleId}/users",
}

/** 获取角色列表 */
export const getRoleListApi = (params: GetRoleListReqType) =>
  defHttp.get({
    url: Api.systemRolesUrl,
    params,
  });
/** 获取角色菜单 */
export const getRoleMenusApi = (roleId: number) =>
  defHttp.get({
    url: Api.systemRolesMenusUrl.replace("{roleId}", roleId + ""),
  });
/** 维护角色菜单 */
export const postRoleMenusApi = (
  roleId: number,
  params: { menuIds: number[] },
) =>
  defHttp.post({
    url: Api.systemRolesMenusUrl.replace("{roleId}", roleId + ""),
    params,
  });
/** 新增角色 */
export const addRoleApi = (params: AddRoleType) =>
  defHttp.post({
    url: Api.systemRolesUrl,
    params,
  });
/** 修改角色 */
export const editRoleApi = (params: AddRoleType, id: number) =>
  defHttp.put({
    url: Api.systemRolesUrl + `/${id}`,
    params,
  });
/** 批量删除角色 */
export const deleteRolesApi = (ids: string) =>
  defHttp.delete({
    url: Api.systemRolesUrl + `/${ids}`,
  });

// 类型定义
/** 请求角色列表参数type */
export type GetRoleListReqType = {
  /**
   * 角色编码
   */
  code?: string;
  /**
   * 角色名
   */
  name?: string;
  pageNumber?: number;
  /**
   * 最大不能超过100
   */
  pageSize?: number;
  [property: string]: any;
};

/** 新增角色type */
export type AddRoleType = {
  /**
   * 编码
   */
  code: string;
  /**
   * 名字
   */
  name: string;
  /**
   * 顺序
   */
  order: number;
  /**
   * 已选菜单id
   */
  menuIds?: string[];
  /**
   * 备注
   */
  remark?: string;
  [property: string]: any;
};

/** 列表项type */
export type RoleListItemType = {
  /**
   * 编码
   */
  code: string;
  /**
   * 创建时间
   */
  createdAt: string;
  id: number;
  /**
   * 名字
   */
  name: string;
  /**
   * 顺序
   */
  order: number;
  /**
   * 备注
   */
  remark?: string;
  [property: string]: any;
};

/** =============== 角色用户 begin =============== */

/** 获取角色用户列表 */
export const getRolesUsersApi = (params: RolesUsersQueryType, roleId: number) =>
  defHttp.get<BasicListResult<RolesUsersListItem>>({
    url: Api.rolesUsersUrl.replace("{roleId}", `${roleId}`),
    params,
  });

/** 新增角色用户 */
export const postRolesUsersApi = (params: RolesUsersListItem, roleId: number) =>
  defHttp.post({
    url: Api.rolesUsersUrl.replace("{roleId}", `${roleId}`),
    params,
  });

/** 删除角色用户 */
export const deleteRolesUsersApi = (ids: string, roleId: number) =>
  defHttp.delete({
    url: Api.rolesUsersUrl.replace("{roleId}", `${roleId}`) + `/${ids}`,
  });

/** 列表项类型 */
export type RolesUsersListItem = {
  /** 姓名 */
  name?: string;
  /** 性别中文 */
  genderName?: string;
  /** 身份证号码 */
  idNumber?: string;
  /** 手机号码 */
  phoneNumber?: string;
  /** 电子邮箱 */
  emailAddress?: string;
  /** 备注 */
  remark?: string;
  /** 创建时间 */
  createdAt?: string;
  [key: string]: any;
};

/** 获取列表参数类型 */
export type RolesUsersQueryType = {
  /** 姓名 */
  name?: string;
  /** 身份证号码 */
  idNumber?: string;
  /** 手机号码 */
  phoneNumber?: string;
  [key: string]: any;
};

/** =============== 角色用户 end =============== */
