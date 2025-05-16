import { defHttp } from "@/request/axios";

enum Api {
  appsUrl = "/system/apps",
  appsVersionsUrl = "/system/apps/{appId}/versions",
}

/** ============================== APP列表 begin */
/** 新增APP */
export const postAppsApi = (params: AppsListItem) =>
  defHttp.post({
    url: Api.appsUrl,
    params,
  });

/** 删除APP */
export const deleteAppsApi = (ids: string) =>
  defHttp.delete({
    url: Api.appsUrl + `/${ids}`,
  });

/** 更新APP */
export const putAppsApi = (params: AppsListItem, id: number) =>
  defHttp.put({
    url: Api.appsUrl + `/${id}`,
    params,
  });

/** 获取APP列表 */
export const getAppsApi = (params: AppsQueryType) =>
  defHttp.get<BasicListResult<AppsListItem>>({
    url: Api.appsUrl,
    params,
  });
/** ============================== APP列表 end */

/** ============================== APP版本列表 begin */
/** 新增APP版本 */
export const postAppsVersionsApi = (params: AppsVersionsListItem, id: number) =>
  defHttp.post({
    url: Api.appsVersionsUrl.replace("{appId}", `${id}`),
    params,
  });

/** 删除APP版本 */
export const deleteAppsVersionsApi = (ids: string, id: number) =>
  defHttp.delete({
    url: Api.appsVersionsUrl.replace("{appId}", `${id}`) + `/${ids}`,
  });

/** 更新APP版本 */
export const putAppsVersionsApi = (
  params: AppsVersionsListItem,
  id: number,
  editId: number,
) =>
  defHttp.put({
    url: Api.appsVersionsUrl.replace("{appId}", `${id}`) + `/${editId}`,
    params,
  });

/** 获取APP版本列表 */
export const getAppsVersionsApi = (params: AppsVersionsQueryType, id: number) =>
  defHttp.get<BasicListResult<AppsVersionsListItem>>({
    url: Api.appsVersionsUrl.replace("{appId}", `${id}`),
    params,
  });

/** 修改APP启用状态 */
export const patchAppsVersionsStatusApi = (
  params: any,
  id: number,
  editId: number,
) =>
  defHttp.patch({
    url: Api.appsVersionsUrl.replace("{appId}", `${id}`) + `/${editId}`,
    params,
  });
/** ============================== APP版本列表 end */

/** APP列表项类型 */
export type AppsListItem = {
  /** APP名称 */
  name?: string;
  /** APP编码 */
  code?: string;
  /** 备注 */
  remark?: string;
  /** 创建时间 */
  createdAt?: string;
  [key: string]: any;
};

/** 获取APP列表参数类型 */
export type AppsQueryType = {
  /** APP名称 */
  name?: string;
  /** APP编码 */
  code?: string;
  /** 备注 */
  remark?: string;
  /** 创建时间 */
  createdAt?: string;
  [key: string]: any;
};

/** APP版本列表项类型 */
export type AppsVersionsListItem = {
  /** 版本名 */
  name?: string;
  /** 版本号 */
  code?: number;
  /** 平台 */
  platform?: string;
  /** 是否全量更新 */
  fullUpdate?: boolean;
  /** 下载地址 */
  downloadUrl?: string;
  /** 是否启用 */
  enabled?: boolean;
  /** 发布日期 */
  releaseDate?: string;
  /** 发布说明 */
  releaseNotes?: string;
  /** 创建时间 */
  createdAt?: string;
  [key: string]: any;
};

/** 获取APP版本列表参数类型 */
export type AppsVersionsQueryType = {
  /** 版本名 */
  name?: string;
  /** 版本号 */
  code?: number;
  /** 平台 */
  platform?: string;
  /** 是否全量更新 */
  fullUpdate?: boolean;
  /** 下载地址 */
  downloadUrl?: string;
  /** 是否启用 */
  enabled?: boolean;
  /** 发布日期 */
  releaseDate?: string;
  /** 发布说明 */
  releaseNotes?: string;
  /** 创建时间 */
  createdAt?: string;
  [key: string]: any;
};
