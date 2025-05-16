import { defHttp } from "@/request/axios";

enum Api {
  osceExaminers = "/osce/examiners",
}

// 导入考官
export const importExaminerApi = (params: any) =>
  defHttp.post({
    url: Api.osceExaminers + "/import",
    params,
  });
// 获取考官列表
export const getExaminerListApi = (params: GetExaminerListReqType) =>
  defHttp.get({
    url: Api.osceExaminers,
    params,
  });
// 新增考官
export const addExaminerApi = (params: AddExaminerType) =>
  defHttp.post({
    url: Api.osceExaminers,
    params,
  });
// 修改考官
export const editExaminerApi = (params: AddExaminerType, id: number) =>
  defHttp.put({
    url: Api.osceExaminers + `/${id}`,
    params,
  });
// 批量删除考官
export const deleteExaminersApi = (ids: string) =>
  defHttp.delete({
    url: Api.osceExaminers + `/${ids}`,
  });

// --类型定义
export type GetExaminerListReqType = {
  department?: string;
  employeeNumber?: string;
  name?: string;
  pageNumber?: number;
  pageSize?: number;
  [property: string]: any;
};
export type AddExaminerType = {
  /**
   * 科室
   */
  department?: string;
  /**
   * 工号
   */
  employeeNumber?: string;
  /**
   * 职称
   */
  professionalTitle?: string;
  /**
   * 备注
   */
  remark?: string;
  user: User;
  [property: string]: any;
};
export type ExaminerListItemType = {
  /**
   * 创建时间
   */
  createdAt: string;
  /**
   * 科室
   */
  department?: string;
  /**
   * 工号
   */
  employeeNumber?: string;
  id: number;
  /**
   * 锁定标识
   */
  isLocked: boolean;
  /**
   * 锁定时间
   */
  lockedAt?: string;
  /**
   * 职称
   */
  professionalTitle?: string;
  /**
   * 备注
   */
  remark?: string;
  /**
   * 更新时间
   */
  updatedAt: string;
  user: User;
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
