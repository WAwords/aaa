import { defHttp } from "@/request/axios";

enum Api {
  settingsUrl = "/system/settings",
}

/** 新增系统设置 */
export const postSettingsApi = (params: SettingsListItem) =>
  defHttp.post({
    url: Api.settingsUrl,
    params,
  });

/** 删除系统设置 */
export const deleteSettingsApi = (ids: string) =>
  defHttp.delete({
    url: Api.settingsUrl + `/${ids}`,
  });

/** 更新系统设置 */
export const putSettingsApi = (params: SettingsListItem, id: number) =>
  defHttp.put({
    url: Api.settingsUrl + `/${id}`,
    params,
  });

/** 获取系统设置列表 */
export const getSettingsApi = (params: SettingsQueryType) =>
  defHttp.get<BasicListResult<SettingsListItem>>({
    url: Api.settingsUrl,
    params,
  });

/** 列表项类型 */
export type SettingsListItem = {
  /** 名称 */
  name?: string;
  /** 编码 */
  code?: string;
  /** 值 */
  value?: string;
  /** 类型，1系统内置，2用户创建 */
  type?: string;
  /** 备注 */
  remark?: string;
  /** 创建时间 */
  created_at?: string;
  [key: string]: any;
};

/** 获取列表参数类型 */
export type SettingsQueryType = {
  /** 名称 */
  name?: string;
  /** 编码 */
  code?: string;
  /** 值 */
  value?: string;
  /** 类型，1系统内置，2用户创建 */
  type?: string;
  /** 备注 */
  remark?: string;
  /** 创建时间 */
  created_at?: string;
  [key: string]: any;
};
