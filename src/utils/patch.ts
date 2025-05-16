import type {
  ElMessageBoxOptions,
  NotificationOptions,
  MessageOptions,
} from "element-plus";

/** 自定义MessageBox（用于全局改变MessageBox样式） */
export const CmeMessageBox = {
  confirm: (message: string, title: string, options: ElMessageBoxOptions) => {
    const newOptions = {
      cancelButtonClass: "is-plain el-button--primary",
      ...options,
    };
    return ElMessageBox.confirm(message, title, newOptions);
  },
  alert: (...args: [string, string, ElMessageBoxOptions]) => {
    return ElMessageBox.alert(...args);
  },
  prompt: (...args: [string, string, ElMessageBoxOptions]) => {
    return ElMessageBox.prompt(...args);
  },
};

/**
 * 提示
 * @param options 提示的配置
 * @param type 提示类型（0：ElNotification 1：ElMessage）
 */
export function CmeMessage(
  options: Partial<NotificationOptions> & Partial<MessageOptions>,
  type = 1,
) {
  if (type === 0) {
    options;
    ElNotification({
      ...options,
      showClose: true,
    });
  } else if (type === 1) {
    ElMessage({
      ...options,
      plain: true,
      showClose: true,
    });
  }
}
// enum TipTypeTitle {
//   success = "成功",
//   warning = "警告",
//   error = "失败",
// }
