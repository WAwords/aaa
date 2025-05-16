import { useI18n } from "@/lang/useI18n";
const { t } = useI18n();
import { useUserStore } from "@/store/modules/user";
import router from "@/router/index";

// 是否显示重新登录
export let isRelogin = { show: false };

export function checkStatus(status: number, msg: string): void {
  let errMessage = "";

  switch (status) {
    case 400:
      errMessage = `${msg}`;
      break;
    case 401:
      errMessage = msg || t("sys.api.errMsg401");
      const userStore = useUserStore();

      if (!isRelogin.show) {
        isRelogin.show = true;
        CmeMessageBox.confirm(
          "登录状态已过期，您可以继续留在该页面，或者重新登录",
          "系统提示",
          {
            distinguishCancelAndClose: true,
            confirmButtonText: "重新登录",
            cancelButtonText: "取消",
          },
        )
          .then(() => {
            isRelogin.show = false;
            userStore
              .logout()
              .then(() => {
                router.push("/login");
              })
              .catch(() => {});
          })
          .catch(() => {
            isRelogin.show = false;
          });
      }
      break;
    case 403:
      errMessage = t("sys.api.errMsg403");
      break;
    case 404:
      errMessage = t("sys.api.errMsg404");
      break;
    case 405:
      errMessage = t("sys.api.errMsg405");
      break;
    case 408:
      errMessage = t("sys.api.errMsg408");
      break;
    case 500:
      errMessage = msg || t("sys.api.errMsg500");
      break;
    case 501:
      errMessage = msg || t("sys.api.errMsg501");
      break;
    case 502:
      errMessage = msg || t("sys.api.errMsg502");
      break;
    case 503:
      errMessage = msg || t("sys.api.errMsg503");
      break;
    case 504:
      errMessage = msg || t("sys.api.errMsg504");
      break;
    case 505:
      errMessage = msg || t("sys.api.errMsg505");
      break;
    default:
      break;
  }
  let codeWhiteList = [401];
  if (errMessage && !codeWhiteList.includes(status)) {
    CmeMessage({
      title: 't("sys.api.errorTip")',
      message: errMessage,
      type: "error",
    });
  }
}
