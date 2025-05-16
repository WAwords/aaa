import { defHttp } from "@/request/axios";

enum Api {
  osceExaminations = "/osce/examinations",
  osceExaminationsExaminees = "/osce/examinations/{examinationId}/examinees",
  osceExaminationsStations = "/osce/examinations/{examinationId}/stations",
  osceExaminationsArrangements = "/osce/examinations/{examinationId}/arrangements",
  osceExaminationsSchedules = "/osce/examinations/{examinationId}/schedules",
  osceOverviews = "/osce/examinations/{examinationId}/overviews",
  examStatus = "/osce/examinations/{examinationId}/status",
  examScores = "/osce/examinations/{examinationId}/scores",
  examineeSignInUrl = "/osce/examinations/{examinationId}/examinees/{examineeId}/sign-in",
  examineeSignOutUrl = "/osce/examinations/{examinationId}/examinees/{examineeId}/sign-out",
  duplicateUrl = "/osce/examinations/{examinationId}/duplicate",
}

// 复制考试
export const duplicateApi = (
  examinationId: number,
  params: { step: number; beginAt: string; endAt: string },
) =>
  defHttp.post({
    url: Api.duplicateUrl.replace("{examinationId}", `${examinationId}`),
    params,
  });

// 签离
export const patchExamineeSignOutApi = (params: {
  examinationId: string;
  examineeId: string;
}) =>
  defHttp.patch({
    url: Api.examineeSignOutUrl
      .replace("{examinationId}", params.examinationId + "")
      .replace("{examineeId}", params.examineeId + ""),
  });

// 签到
export const patchExamineeSignInApi = (params: {
  examinationId: string;
  examineeId: string;
}) =>
  defHttp.patch({
    url: Api.examineeSignInUrl
      .replace("{examinationId}", params.examinationId + "")
      .replace("{examineeId}", params.examineeId + ""),
  });

// 获取考试列表
export const getExaminationListApi = (params: GetExaminationListReqType) =>
  defHttp.get({
    url: Api.osceExaminations,
    params,
  });
// 新增考试
export const addExaminationApi = (params: AddExaminationType) =>
  defHttp.post({
    url: Api.osceExaminations,
    params,
  });
// 获取考试信息
export const getExaminationApi = (examinationId: number) =>
  defHttp.get<ExaminationDetail>({
    url: Api.osceExaminations + `/${examinationId}`,
  });
// 修改考试
export const editExaminationApi = (
  data: AddExaminationType,
  id: number,
  params?: { force: boolean },
) =>
  defHttp.put({
    url: Api.osceExaminations + `/${id}`,
    params,
    data,
  });
// 批量删除考试
export const deleteExaminationsApi = (ids: string) =>
  defHttp.delete({
    url: Api.osceExaminations + `/${ids}`,
  });
/**
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 */
// 维护考试考生
export const modifyExamineeApi = (
  params: { examineeIds: string },
  examinationId: number,
) =>
  defHttp.post({
    url: Api.osceExaminationsExaminees.replace(
      "{examinationId}",
      examinationId + "",
    ),
    params,
  });
// 批量删除考试考生
export const deleteExamineeApi = (ids: string, examinationId: number) =>
  defHttp.delete({
    url:
      Api.osceExaminationsExaminees.replace(
        "{examinationId}",
        examinationId + "",
      ) + `/${ids}`,
  });
// 获取考试考生列表
export const getExamineeListApi = (
  params: GetExamineeListReqType,
  examinationId: number,
) =>
  defHttp.get({
    url: Api.osceExaminationsExaminees.replace(
      "{examinationId}",
      examinationId + "",
    ),
    params,
  });
/**
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 */
// 获取考试考站列表
export const getStationsListApi = (examinationId: number) =>
  defHttp.get({
    url: Api.osceExaminationsStations.replace(
      "{examinationId}",
      examinationId + "",
    ),
  });
// 维护考试考站
export const modifyStationsApi = (
  params: { stationIds: string },
  examinationId: number,
) =>
  defHttp.post({
    url: Api.osceExaminationsStations.replace(
      "{examinationId}",
      examinationId + "",
    ),
    params,
  });
/**
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 */
// 获取考试安排列表
export const getArrangementsListApi = (params: any, examinationId: number) =>
  defHttp.get({
    url: Api.osceExaminationsArrangements.replace(
      "{examinationId}",
      examinationId + "",
    ),
    params,
  });
// 维护考试安排列表
export const modifyArrangementsListApi = (params: any, examinationId: number) =>
  defHttp.post({
    url: Api.osceExaminationsArrangements.replace(
      "{examinationId}",
      examinationId + "",
    ),
    params,
  });
/**
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 */
// 维护排考
export const modifySchedulesApi = (examinationId: number) =>
  defHttp.post({
    url: Api.osceExaminationsSchedules.replace(
      "{examinationId}",
      examinationId + "",
    ),
  });
/**
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 */
// 获取考试信息总览
export const getOverviewsApi = (examinationId: number) =>
  defHttp.get({
    url: Api.osceOverviews.replace("{examinationId}", examinationId + ""),
  });
// 修改考试
export const patchExamStatusApi = (params: any, examinationId: number) =>
  defHttp.patch({
    url: Api.examStatus.replace("{examinationId}", examinationId + ""),
    params,
  });

/** 获取考试成绩信息 */
export const getExamScoresApi = (examinationId?: number) =>
  defHttp.get({
    url: Api.examScores.replace("{examinationId}", examinationId + ""),
  });

/** 类型定义 */
export type GetExaminationListReqType = {
  /**
   * 考试名关键字
   */
  name?: string;
  pageNumber?: number;
  pageSize?: number;
  /**
   * 0考试创建中，1考试已创建，2考试中，3考试暂停中，4考试完成
   */
  status?: number;
  /**
   * 1普通考试，2期末考试，3年度考试
   */
  type?: string;
  [property: string]: any;
};
export type AddExaminationType = {
  /**
   * 考试开始时间
   */
  beginAt: string;
  /**
   * 考试结束时间
   */
  endAt: string;
  /**
   * 考试模式，1非固定模式，2固定模式
   */
  mode: string;
  /**
   * 考试名
   */
  name: string;
  /**
   * 考官签字，true需要考官签字，false不需要考官签字
   */
  requireSignature: boolean;
  /**
   * 抽题方式，1考官手动抽题，2系统随机抽题
   */
  skillSelectionMethod: string;
  /**
   * 考试类型，1普通考试，2期末考试，3年度考试
   */
  type: string;
  [property: string]: any;
};
export type ExaminationListItemType = {
  /**
   * 考试开始时间
   */
  beginAt: string;
  /**
   * 考试创建时间
   */
  createdAt: string;
  /**
   * 考试结束时间
   */
  endAt: string;
  /**
   * 考试模式，1非固定模式，2固定模式
   */
  mode: string;
  /**
   * 考试名
   */
  name: string;
  /**
   * 考官签字，true需要考官签字，false不需要考官签字
   */
  requireSignature: boolean;
  /**
   * 抽题方式，1考官手动抽题，2系统随机抽题
   */
  skillSelectionMethod: string;
  /**
   * 考试状态，1考试创建中，2考试已创建，3考试中，4考试完成
   */
  status: string;
  /**
   * 考试创建步骤，记录当前考试创建进行到哪一步，最小值为考试信息录入完成为1，最大值为考试排考完成为5
   */
  step: number;
  /**
   * 考试类型，1普通考试，2期末考试，3年度考试
   */
  type: string;
  [property: string]: any;
};
/**
 ********************
 */
export type GetExamineeListReqType = {
  /**
   * 年级关键字
   */
  grade?: string;
  /**
   * 专业关键字
   */
  major?: string;
  /**
   * 考生姓名关键字
   */
  name?: string;
  pageNumber?: number;
  pageSize?: number;
  [property: string]: any;
};
export type ExamineeListItemType = {
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
   * 考生主键
   */
  examineeId: number;
  /**
   * 性别，0未选择，1男，2女。默认0
   */
  gender?: number;
  /**
   * 年级
   */
  grade?: number;
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

/** 考试信息详情 */
export interface ExaminationDetail {
  /**
   * 考试开始时间
   */
  beginAt: string;
  /**
   * 考试创建时间
   */
  createdAt: string;
  /**
   * 考试结束时间
   */
  endAt: string;
  /**
   * 考试id
   */
  id: number;
  /**
   * 考试模式，1非固定模式，2固定模式
   */
  mode: Mode;
  /**
   * 考试模式名，1非固定模式，2固定模式
   */
  modeName: string;
  /**
   * 考试名
   */
  name: string;
  /**
   * 考官签字，true需要考官签字，false不需要考官签字
   */
  requireSignature: boolean;
  /**
   * 抽题方式，1考官手动抽题，2系统随机抽题
   */
  skillSelectionMethod: Mode;
  /**
   * 抽题方式名，1考官手动抽题，2系统随机抽题
   */
  skillSelectionMethodName: string;
  /**
   * 考试状态，1考试创建中，2考试已创建，3考试中，4考试暂停中，5考试完成
   */
  status: Status;
  /**
   * 考试状态名，1考试创建中，2考试已创建，3考试中，4考试暂停中，5考试完成
   */
  statusName: string;
  /**
   * 考试创建步骤，记录当前考试创建进行到哪一步，最小值为考试信息录入完成为1，最大值为考试最终确认完成为6
   */
  step: number;
  /**
   * 考试类型，1普通考试，2期末考试，3年度考试
   */
  type: Type;
  /**
   * 考试类型名，1普通考试，2期末考试，3年度考试
   */
  typeName: string;
  /**
   * 考试更新时间
   */
  updatedAt: string;
  [property: string]: any;
}

/**
 * 考试模式，1非固定模式，2固定模式
 *
 * 抽题方式，1考官手动抽题，2系统随机抽题
 */
export enum Mode {
  The1 = "1",
  The2 = "2",
}

/**
 * 考试状态，1考试创建中，2考试已创建，3考试中，4考试暂停中，5考试完成
 */
export enum Status {
  The1 = "1",
  The2 = "2",
  The3 = "3",
  The4 = "4",
}

/**
 * 考试类型，1普通考试，2期末考试，3年度考试
 */
export enum Type {
  The1 = "1",
  The2 = "2",
  The3 = "3",
}
