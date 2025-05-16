import NProgress from "nprogress";
import {
  RouteRecordRaw,
  createRouter,
  createWebHistory,
  _RouteRecordBase,
} from "vue-router";
import { getToken } from "@/utils/auth";
import Layout from "@/layout/index.vue";
import ParentView from "@/components/ParentView/index.vue";
import { usePermissionStore, useUserStore } from "@/store";
import "nprogress/nprogress.css";

NProgress.configure({ showSpinner: false });

let mainRedirect = "index";
// 公共路由
const constantRoutes: Array<RouteRecordRaw> = [
  {
    path: "/redirect",
    component: Layout,
    hidden: true,
    children: [
      {
        path: "/redirect/:path(.*)",
        component: () => import("@/views/other/redirect.vue"),
      },
    ],
  },
  {
    path: "/login",
    name: "Login",
    meta: { title: "登录" },
    component: () => import("@/views/login/index.vue"),
  },
  {
    path: "",
    component: Layout,
    redirect: mainRedirect,
    children: [
      {
        path: "/index",
        name: "Index",
        meta: { title: "首页" },
        component: () => import("@/views/index/index.vue"),
      },
    ],
  },
  {
    path: "/offline",
    component: () => import("@/views/error/Offline.vue"),
  },
  {
    path: "/404",
    component: () => import("@/views/error/404.vue"),
  },
  {
    path: "/401",
    component: () => import("@/views/error/401.vue"),
  },
  {
    path: "/unsupported",
    component: () => import("@/views/error/Unsupported.vue"),
  },
  {
    path: "/:pathMatch(.*)*",
    component: ParentView,
  },
];

const dynamicRoutes: Array<RouteRecordRaw> = [];

const router = createRouter({
  history: createWebHistory(),
  routes: constantRoutes,
});

const whiteList = ["/login", "/404", "/offline", "/401"];
router.beforeEach((to, from, next) => {
  from;
  NProgress.start();
  const permissionStore = usePermissionStore();
  if (getToken()) {
    if (to.path === "/login") {
      next({ path: "/" });
    } else if (whiteList.indexOf(to.path) !== -1) {
      next();
    } else {
      const userStore = useUserStore();

      if (userStore.roles.length === 0) {
        let loading = ElLoading.service();
        // 获取用户详情
        userStore
          .getUserInfo()
          .then(() => {
            // 获取路由
            permissionStore
              .GenerateRoutes()
              .then((accessRoutes) => {
                loading.close();

                accessRoutes.forEach((routeItem) => {
                  router.addRoute(routeItem);
                });

                next({ ...to, replace: true });
              })
              .catch((err) => {
                loading.close();
                if (err.response && err.response.status === 401) {
                  next(`/401?redirect=${encodeURIComponent(to.fullPath)}`);
                } else if (
                  err.code === "ECONNABORTED" &&
                  err.message.indexOf("timeout") !== -1
                ) {
                  // 获取路由失败的话影响后续操作，在这里的操作是将其跳转至‘链接断开页’
                  let extraUrl = to.fullPath
                    ? `?redirect=${encodeURIComponent(to.fullPath)}`
                    : ``;
                  next(`/offline${extraUrl}`);
                }
              });
          })
          .catch(() => {
            loading.close();
            next({
              path: `/login?redirect=${encodeURIComponent(to.fullPath)}`,
            });
            userStore
              .logout()
              .then(() => {})
              .catch(() => {});
          });
      } else {
        next();
      }
    }
  } else {
    // 没有token
    if (whiteList.indexOf(to.path) !== -1) {
      // 在免登录白名单，直接进入
      next();
    } else {
      next(`/login?redirect=${encodeURIComponent(to.fullPath)}`); // 否则全部重定向到登录页
    }
  }
});
router.afterEach(() => {
  NProgress.done();
});
// 为路由添加自定义属性定义
declare module "vue-router" {
  interface _RouteRecordBase {
    hidden?: boolean | string | number;
  }
}

export default router;
