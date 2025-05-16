import { defineStore } from "pinia";
import { userMenusApi } from "@/api/common/index";
import Layout from "@/layout/index.vue";
import ParentView from "@/components/ParentView/index.vue";
import { RouteRecordRaw } from "vue-router";

export const usePermissionStore = defineStore("permissionStore", {
  state: () => {
    return {
      routes: [],
      addRoutes: [] as any[],
      sidebarRouters: {},
      asyncRouters: [] as any[],
    };
  },
  actions: {
    GenerateRoutes() {
      return new Promise(
        (resolve: (value: RouteRecordRaw[]) => void, reject) => {
          // 调用接口获取菜单数据
          userMenusApi()
            .then((res: any) => {
              const sdata = JSON.parse(JSON.stringify(res));
              const rdata = JSON.parse(JSON.stringify(res));
              const rewriteRoutes = filterAsyncRouter(rdata);
              rewriteRoutes.push({
                path: "/:pathMatch(.*)",
                redirect: "/404",
                hidden: true,
              });
              this.$state.addRoutes = rewriteRoutes;
              this.$state.asyncRouters = sdata;
              resolve(rewriteRoutes);
            })
            .catch((err) => {
              reject(err);
            });
        },
      );
    },
  },
});

// 遍历后台传来的路由字符串，转换为组件对象
function filterAsyncRouter(asyncRouterMap: any[]) {
  return asyncRouterMap.filter((route) => {
    if (route.component) {
      // Layout ParentView 组件特殊处理
      if (route.component === "Layout") {
        route.component = Layout;
      } else if (route.component === "ParentView") {
        route.component = ParentView;
      } else {
        route.component = loadView(route.component);
      }
    }
    if (route.children != null && route.children && route.children.length) {
      route.children = filterAsyncRouter(route.children);
    } else {
      delete route["children"];
      delete route["redirect"];
    }
    return true;
  });
}

let pages = import.meta.glob("@/views/**/index.vue");
export const loadView = (view: string) => {
  return pages[`/src/views/${view}/index.vue`];
};
