import { defHttp } from "@/request/axios";

enum Api {
  dictTypesUrl = "/system/dict/types",
  dictEntriesUrl = "/system/dict/types/{typeId}/entries",
  dictUrl = "/system/dict/entries",
}

/**
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * 获取字典
 */

/** 获取字典列表 */
export const getDictApi = (params: { typeCode: string }) =>
  defHttp.get({
    url: Api.dictUrl,
    params,
  });

/**
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * 字典类型
 */

/** 新增字典类型 */
export const postDictTypeApi = (params: PostDictTypesParams) =>
  defHttp.post({
    url: Api.dictTypesUrl,
    params,
  });

/** 删除字典类型 */
export const deleteDictTypesApi = (ids: string) =>
  defHttp.delete({
    url: Api.dictTypesUrl + `/${ids}`,
  });

/** 更新字典类型 */
export const putDictTypeApi = (params: PostDictTypesParams, id: number) =>
  defHttp.put({
    url: Api.dictTypesUrl + `/${id}`,
    params,
  });

/** 获取字典类型列表 */
export const getDictTypesApi = (params: GetDictTypesParams) =>
  defHttp.get<BasicListResult<DictTypesRow>>({
    url: Api.dictTypesUrl,
    params,
  });

/**
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * 字典条目
 */

/** 新增字典条目 */
export const postDictEntriesApi = (params: PostDictEntriesParams, id: number) =>
  defHttp.post({
    url: Api.dictEntriesUrl.replace("{typeId}", `${id}`),
    params,
  });

/** 删除字典条目 */
export const deleteDictEntriesApi = (ids: string, id: number) =>
  defHttp.delete({
    url: Api.dictEntriesUrl.replace("{typeId}", `${id}`) + `/${ids}`,
  });

/** 更新字典条目 */
export const putDictEntriesApi = (
  params: PostDictEntriesParams,
  id: number,
  editId: number,
) =>
  defHttp.put({
    url: Api.dictEntriesUrl.replace("{typeId}", `${id}`) + `/${editId}`,
    params,
  });

/** 获取字典条目列表 */
export const getDictEntriesApi = (params: GetDictEntriesParams, id: number) =>
  defHttp.get({
    url: Api.dictEntriesUrl.replace("{typeId}", `${id}`),
    params,
  });

/**
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * 字典类型
 */

/** 新增字典类型请求参数类型 */
export type PostDictTypesParams = {
  /** 字典类型编码 */
  code: string;
  /**
   * 字典类型名称
   */
  name: string;
  /**
   * 备注
   */
  remark?: string;
  [property: string]: any;
};

/** 字典类型列表项 */
export type DictTypesRow = {
  /** 字典名称 */
  name?: string;
  /** 字典编码 */
  code?: string;
  /** 创建时间 */
  createdAt?: string;
  /** 备注 */
  remark?: string;
  [property: string]: any;
};

/** 获取字典类型列表请求参数类型 */
export type GetDictTypesParams = {
  /**
   * 字典类型编码
   */
  code?: string;
  /**
   * 字典类型名称
   */
  name?: string;
  pageNumber?: number;
  pageSize?: number;
  [property: string]: any;
};

/**
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * 字典条目
 */

/** 字典条目列表项 */
export type DictDataRow = {
  /**
   * 字典条目标签
   */
  label: string;
  /**
   * 排序，如果未传递该数据，将设置默认值为0
   */
  order?: number;
  /**
   * 备注
   */
  remark?: string;
  /**
   * 字典条目键值
   */
  value: string;
  [property: string]: any;
};

/** 新增字典条目请求参数类型 */
export type PostDictEntriesParams = {
  /**
   * 字典条目标签
   */
  label: string;
  /**
   * 排序，如果未传递该数据，将设置默认值为0
   */
  order?: number;
  /**
   * 备注
   */
  remark?: string;
  /**
   * 字典条目键值
   */
  value: string;
  [property: string]: any;
};

/** 获取字典条目列表请求参数类型 */
export type GetDictEntriesParams = {
  /** 标签 */
  label?: string;
  /** 键值 */
  value?: string;
  [property: string]: any;
};
