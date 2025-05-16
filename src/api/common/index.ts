import { defHttp } from "@/request/axios";

enum Api {
  systemCaptchas = "/system/captchas",
  tokenUrl = "/system/tokens",
  userMenus = "/system/users/me/menus",
  userDetailsUrl = "/system/users/me/details",
  userPatchPasswordUrl = "/system/users/me/password",
  userPutProfileUrl = "/system/users/me/info",
  getUserInfoUrl = "/system/users/me/info",
}

/** 获取验证码 */
export const systemCaptchasApi = () =>
  defHttp.get<CaptchaMsgType>({
    url: Api.systemCaptchas,
  });

/** 登录 */
export const getTokenApi = (params: SystemTokensType) =>
  defHttp.post<{ token: string }>({
    url: Api.tokenUrl,
    params,
  });

/** 登出 */
export const deleteTokenApi = () =>
  defHttp.delete({
    url: Api.tokenUrl,
  });

/** 修改密码 */
export const userPatchPasswordApi = (params: {
  oldPassword: string;
  newPassword: string;
}) =>
  defHttp.patch({
    url: Api.userPatchPasswordUrl,
    params,
  });

/** 修改用户信息 */
export const userPutProfileApi = (params: {
  name: string;
  gender: string;
  phoneNumber: string;
  emailAddress: string;
}) =>
  defHttp.put({
    url: Api.userPutProfileUrl,
    params,
  });

/** 获取用户信息 */
export const getUserInfoApi = () =>
  defHttp.get({
    url: Api.getUserInfoUrl,
  });

// 获取用户菜单
export const userMenusApi = () =>
  defHttp.get({
    url: Api.userMenus,
  });

export const userDetailsApi = () =>
  defHttp.get({
    url: Api.userDetailsUrl,
  });

// --类型定义
export type SystemTokensType = {
  /**
   * 用户输入验证码
   */
  code: string;
  /**
   * 登录密码
   */
  password: string;
  /**
   * 登录账号
   */
  username: string;
  /**
   * 验证码标识
   */
  uuid: string;
};

/** 验证码返回类型 */
export type CaptchaMsgType = {
  enabled: boolean;
  image?: string;
  uuid?: string;
};
