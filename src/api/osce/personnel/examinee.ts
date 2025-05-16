import { defHttp } from "@/request/axios";

enum Api {
  osceExaminees = "/osce/examinees",
  osceExamineesSearch = "/osce/examinees/search",
}

// 导入考生
export const importExamineeApi = (params: any) =>
  defHttp.post({
    url: Api.osceExaminees + "/import",
    params,
  });
// 获取考生列表
export const getExamineeListApi = (params: GetExamineeListReqType) =>
  defHttp.get({
    url: Api.osceExaminees,
    params,
  });
// 批量获取考生列表
export const batchExamineeListApi = (params: { names: string[] }) =>
  defHttp.post({
    url: Api.osceExamineesSearch,
    params,
  });
// 新增考生
export const addExamineeApi = (params: AddExamineeType) =>
  defHttp.post({
    url: Api.osceExaminees,
    params,
  });
// 修改考生
export const editExamineeApi = (params: AddExamineeType, id: number) =>
  defHttp.put({
    url: Api.osceExaminees + `/${id}`,
    params,
  });
// 批量删除考生
export const deleteExamineesApi = (ids: string) =>
  defHttp.delete({
    url: Api.osceExaminees + `/${ids}`,
  });

// --类型定义
export type GetExamineeListReqType = {
  /**
   * 年级
   */
  grade?: string;
  /**
   * 专业
   */
  major?: string;
  name?: string;
  pageNumber?: number;
  pageSize?: number;
  /**
   * 学号
   */
  studentNumber?: string;
  examineeGroupId?: number;
  /**
   * 批量查询的考生姓名
   */
  names?: string;
  [property: string]: any;
};
export type AddExamineeType = {
  user: User;
  /**
   * 班级
   */
  className?: string;
  /**
   * 院系
   */
  college?: string;
  /**
   * 年级
   */
  grade?: string;
  /**
   * 专业
   */
  major?: string;
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
export type ExamineeListItemType = {
  /**
   * 班级
   */
  className?: string;
  /**
   * 院系
   */
  college?: string;
  /**
   * 创建时间
   */
  createdAt: string;
  /**
   * 电子邮箱
   */
  emailAddress?: string;
  /**
   * 性别，1男，2女
   */
  gender?: string;
  /**
   * 年级
   */
  grade?: string;
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
   * 锁定标识
   */
  isLocked: boolean;
  /**
   * 锁定时间
   */
  lockedAt?: string;
  /**
   * 被谁锁定
   */
  lockedBy?: string;
  /**
   * 锁定原因
   */
  lockedReason?: string;
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
export type User = {
  id?: number;
  /**
   * 电子邮箱
   */
  emailAddress?: string;
  /**
   * 性别，1男，2女
   */
  gender?: string;
  /**
   * 性别名，1男，2女
   */
  genderName?: string;
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
  [property: string]: any;
};
