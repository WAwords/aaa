import { defHttp } from "@/request/axios";

enum Api {
  typeUrl = "/osce/skill-types",
  skillUrl = "/osce/skill-types/{typeId}/skills",
  criteriaUrl = "/osce/skill-types/{typeId}/skills/{skillId}/scoring-criteria",
  skillDefaultUrl = "/osce/skill-types/{typeId}/skills/{skillId}/default-scoring-criteria",
  criteriaDuplicateUrl = "/osce/skill-types/{typeId}/skills/{skillId}/scoring-criteria/{criteriaId}/duplicate",
}

// 复制评分标准
export const criteriaDuplicateApi = (params: {
  typeId: number;
  skillId: number;
  criteriaId: number;
}) =>
  defHttp.post({
    url: Api.criteriaDuplicateUrl
      .replace("{typeId}", `${params.typeId}`)
      .replace("{skillId}", `${params.skillId}`)
      .replace("{criteriaId}", `${params.criteriaId}`),
    params,
  });

// 获取技能类型列表
export const getOsceSkillTypesListApi = (params: GetOsceSkillTypesReqType) =>
  defHttp.get({
    url: Api.typeUrl,
    params,
  });
// 新增技能类型
export const addOsceSkillTypesApi = (params: AddOsceSkillTypesReqType) =>
  defHttp.post({
    url: Api.typeUrl,
    params,
  });
// 删除技能类型
export const deleteOsceSkillTypesApi = (id: number) =>
  defHttp.delete({
    url: Api.typeUrl + `/${id}`,
  });
// 修改技能类型
export const editOsceSkillTypesApi = (
  params: EditOsceSkillTypesType,
  id: number,
) =>
  defHttp.put({
    url: Api.typeUrl + `/${id}`,
    params,
  });

/**
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 */

// 获取技能列表
export const getOsceSkillTypesSkillsListApi = (
  params: GetOsceSkillTypesSkillsReqType,
  typeId: number,
) =>
  defHttp.get({
    url: Api.skillUrl.replace("{typeId}", `${typeId}`),
    params,
  });
// 新增技能
export const addOsceSkillTypesSkillsApi = (
  params: AddOsceSkillTypesSkillsReqType,
  typeId: number,
) =>
  defHttp.post({
    url: Api.skillUrl.replace("{typeId}", `${typeId}`),
    params,
  });
// 删除技能
export const deleteOsceSkillTypesSkillsApi = (id: number, typeId: number) =>
  defHttp.delete({
    url: Api.skillUrl.replace("{typeId}", `${typeId}`) + `/${id}`,
  });
// 修改技能
export const editOsceSkillTypesSkillsApi = (
  params: EditOsceSkillTypesSkillsType,
  id: number,
  typeId: number,
) =>
  defHttp.put({
    url: Api.skillUrl.replace("{typeId}", `${typeId}`) + `/${id}`,
    params,
  });

/**
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 */

// 获取评分标准列表
export const getCriteriaListApi = (
  params: GetCriteriaReqType,
  typeId: number,
  skillId: number,
) =>
  defHttp.get({
    url: Api.criteriaUrl
      .replace("{typeId}", `${typeId}`)
      .replace("{skillId}", `${skillId}`),
    params,
  });
// 新增评分标准
export const addCriteriaApi = (
  params: AddCriteriaReqType,
  typeId: number,
  skillId: number,
) =>
  defHttp.post({
    url: Api.criteriaUrl
      .replace("{typeId}", `${typeId}`)
      .replace("{skillId}", `${skillId}`),
    params,
  });
// 删除评分标准
export const deleteCriteriaApi = (
  id: number,
  typeId: number,
  skillId: number,
) =>
  defHttp.delete({
    url:
      Api.criteriaUrl
        .replace("{typeId}", `${typeId}`)
        .replace("{skillId}", `${skillId}`) + `/${id}`,
  });
// 修改评分标准
export const editCriteriaApi = (
  params: AddCriteriaReqType,
  id: number,
  typeId: number,
  skillId: number,
) =>
  defHttp.put({
    url:
      Api.criteriaUrl
        .replace("{typeId}", `${typeId}`)
        .replace("{skillId}", `${skillId}`) + `/${id}`,
    params,
  });
// 获取评分标准
export const getCriteriaApi = (id: number, typeId: number, skillId: number) =>
  defHttp.get({
    url:
      Api.criteriaUrl
        .replace("{typeId}", `${typeId}`)
        .replace("{skillId}", `${skillId}`) + `/${id}`,
  });
// 设置评分标准默认值
export const patchCriteriaApi = (
  typeId: number,
  skillId: number,
  params: any,
) =>
  defHttp.patch({
    url: Api.skillDefaultUrl
      .replace("{typeId}", `${typeId}`)
      .replace("{skillId}", `${skillId}`),
    params,
  });

// --类型定义
export type GetOsceSkillTypesReqType = {
  pageNumber?: number;
  pageSize?: number;
  [property: string]: any;
};
export type GetOsceSkillTypesItemType = {
  createdAt: string;
  id: number;
  name: string;
  [property: string]: any;
};
export type AddOsceSkillTypesReqType = {
  /**
   * 技能类型名
   */
  name: string;
  [property: string]: any;
};
export type EditOsceSkillTypesType = {
  name: string;
  [property: string]: any;
};

/**
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 */

export type GetOsceSkillTypesSkillsReqType = {
  pageNumber?: number;
  pageSize?: number;
  [property: string]: any;
};
export type GetOsceSkillTypesSkillsItemType = {
  createdAt: string;
  id: number;
  name: string;
  [property: string]: any;
};
export type AddOsceSkillTypesSkillsReqType = {
  /**
   * 技能名
   */
  name: string;
  [property: string]: any;
};
export type EditOsceSkillTypesSkillsType = {
  name: string;
  [property: string]: any;
};

/**
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 */

export type GetCriteriaReqType = {
  pageNumber?: number;
  pageSize?: number;
  [property: string]: any;
};
export type AddCriteriaReqType = {
  /**
   * 扣分项，二维数组
   */
  deductionItems: any[][];
  /**
   * 扣分项类型，可以为0、1、2、3
   */
  deductionItemsType?: string;
  /**
   * 场景，场景为富文本
   */
  scene?: string;
  /**
   * 评分项，二维数组
   */
  scoringItems: any[][];
  /**
   * 评分项类型，可以为0、1、2、3
   */
  scoringItemsType?: string;
  [property: string]: any;
};
export type CriteriaListItemType = {
  /**
   * 物理主键
   */
  id: number;
  /**
   * 是否默认标准
   */
  isDefault: boolean;
  /**
   * 场景
   */
  scene: string;
  [property: string]: any;
};
