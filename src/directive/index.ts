import { createApp } from "vue";
import { useUserStore } from "@/store/modules/user";

function directive(app: ReturnType<typeof createApp>) {
  // 绑定权限指令
  app.directive("hasPermi", {
    mounted(el, binding) {
      let { value } = binding;

      // 最高权限角色列表
      let top_roles = ["system_maintainer"];
      const userStore = useUserStore();
      let permissions: string[] = userStore.permissions;

      // 当前用户角色
      let now_roles = userStore.roles.map((item: any) => item.code);

      if (value && value instanceof Array && value.length > 0) {
        const permissionFlag = value;

        // 最高权限角色部根据权限列表进行权限判断
        if (now_roles.some((item) => top_roles.includes(item))) {
          return;
        }

        const hasPermissions = permissions.some((permission: string) => {
          return permissionFlag.includes(permission);
        });

        if (!hasPermissions) {
          el.parentNode && el.parentNode.removeChild(el);
        }
      } else {
        throw new Error("请设置权限标识");
      }
    },
  });

  // 为元素添加测试标识属性（方便UI测试）
  app.directive("testSet", {
    mounted(el, binding) {
      let { value } = binding;
      el.setAttribute("test-tag", value);
    },
  });
}

export default directive;
