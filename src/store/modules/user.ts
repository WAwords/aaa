import { defineStore } from "pinia";
import { getToken, setToken, removeToken } from "@/utils/auth";
import {
  getTokenApi,
  userDetailsApi,
  deleteTokenApi,
  SystemTokensType,
} from "@/api/common/index";

export const useUserStore = defineStore("userStore", {
  state: () => {
    return {
      lang: "cn",
      token: getToken(),
      id: "",
      name: "",
      username: "", // 账号(唯一识别号)
      roles: [],
      permissions: [],
    };
  },
  actions: {
    login(userInfo: SystemTokensType) {
      return new Promise((resolve, reject) => {
        getTokenApi(userInfo)
          .then((res) => {
            setToken(res.token);
            this.$state.token = res.token;
            resolve(res);
          })
          .catch((error) => {
            reject(error);
          });
      });
    },
    logout() {
      return new Promise<void>((resolve, reject) => {
        deleteTokenApi()
          .then(() => {
            resolve();
            removeToken();
            this.$reset();
          })
          .catch(() => {
            reject();
            removeToken();
            this.$reset();
          });
      });
    },
    /** 获取用户信息 */
    getUserInfo() {
      return new Promise((resolve, reject) => {
        userDetailsApi()
          .then((res: any) => {
            this.$state.id = res.user.id;
            this.$state.name = res.user.name;
            this.$state.username = res.user.username;
            this.$state.roles = res.roles;
            this.$state.permissions = res.permissions;
            resolve(res);
          })
          .catch((error) => {
            reject(error);
          });
      });
    },
  },
});
