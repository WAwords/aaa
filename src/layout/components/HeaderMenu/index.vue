<template>
  <div
    id="header-menu-id"
    class="h-60px"
    style="display: flex; border-bottom: 1px solid var(--el-border-color)"
  >
    <div
      @click="handleCollapse()"
      class="w-70px flex-none flex justify-center items-center cursor-pointer"
    >
      <div
        class="text-2xl flex justify-center items-center duration-100 z-10"
        :class="isCollapse ? 'transform rotate-180' : ''"
      >
        <img
          class="img-btn"
          src="@/assets/img/osce/layout/arrow-left.png"
          fit="contain"
        />
      </div>
    </div>

    <el-menu
      mode="horizontal"
      :default-active="asideActivePath"
      :ellipsis="false"
      class="h-59px"
    >
      <el-menu-item
        :index="i.path"
        v-for="i in routers"
        :key="i.path"
        @click="handleActiveChange(i.path)"
      >
        {{ i?.meta.title }}
      </el-menu-item>
    </el-menu>
    <div class="flex-1 flex justify-end pr-20px items-center">
      <el-space class="flex-none">
        <!-- 全屏按钮 -->
        <Screenfull />

        <!-- TODO 主题色选择（没什么必要，提供几组可选颜色比较好） -->
        <!-- <el-color-picker v-model="theColor" @change="changeColor" /> -->

        <!-- 刷新按钮 -->
        <!-- <img
          @click="refresh()"
          class="img-btn"
          src="@/assets/img/osce/layout/refresh.png"
          fit="contain"
        /> -->

        <!-- 用户名 -->
        <UserTag />
      </el-space>
    </div>
  </div>
</template>

<script setup lang="ts">
import { usePermissionStore } from "@/store/modules/permission";
import UserTag from "./UserTag.vue";
import Screenfull from "./Screenfull.vue";

interface Props {
  asideActivePath: string;
  isCollapse: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  asideActivePath: "",
  isCollapse: false,
});
const router = useRouter();

/** 获取路由 */
const permissionStore = usePermissionStore();
const routers = permissionStore.asyncRouters;

const emit = defineEmits(["update:isCollapse", "update:asideActivePath"]);
const refresh = () => {
  router.go(0);
};
/** 折叠 */
const handleCollapse = () => {
  emit("update:isCollapse", !props.isCollapse);
};
/** 侧边栏显示的path改变 */
const handleActiveChange = (path: string) => {
  emit("update:asideActivePath", path);
};

/** 根路由 */
const rootPath = ref("");

watch(
  () => router.currentRoute.value.fullPath,
  (newVal, oldVal) => {
    // 当前根路由（不含“/”）
    const newRootPath = newVal.split("/")[1];

    if (newVal !== oldVal) {
      const asyncRouterPathList = routers.map((item) => {
        return item.path.split("/")[1];
      });

      if (!asyncRouterPathList.includes(newRootPath)) {
        // 如果跳转的路由不是 “后端返回” 的路由

        if (!oldVal) {
          // 设置顶部菜单激活状态
          rootPath.value = `/${asyncRouterPathList[0]}`;

          // 如果没有前一个路由则将侧边栏显示为 “后端返回” 路由的第一个
          emit("update:asideActivePath", rootPath.value);
        } else {
        }
      } else {
        // 否则将侧边栏设置为相应的根路由下的路由
        rootPath.value = `/${newRootPath}`;
        emit("update:asideActivePath", rootPath.value);
      }
    }
  },
  {
    immediate: true,
  },
);

// TODO 主题色选择
/** =============== 主题色选择 begin =============== */
// const { changeTheme } = useGlobalInit();
// const theColor = ref("#0e63cd");

// const changeColor = (val: any) => {
//   changeTheme("customize");

//   let colors = generateColors(val, "#ffffff", 3, 9);

//   setTimeout(() => {
//     let root = document.querySelector(
//       "html[data-theme='customize']",
//     ) as HTMLElement;

//     root.style.setProperty("--el-color-primary", val);
//     // 亮色
//     for (let i = 3; i <= 9; i++) {
//       root.style.setProperty(`--el-color-primary-light-${i}`, colors[i - 3]);
//     }
//     // 暗色
//     root.style.setProperty(
//       "--el-color-primary-dark-2",
//       generateColors(val, "#000000", 2, 2)[0],
//     );
//     root.style.setProperty("--el-text-color-primary", "#25334e");
//   }, 0);
// };
/** =============== 主题色选择 end =============== */
</script>

<style scoped lang="less">
::v-deep(.img-btn) {
  @apply cursor-pointer h-30px w-30px;
}

::v-deep(.el-menu) {
  .el-menu-item.is-active {
    background-color: var(--el-fill-color-lighter);
  }
}
</style>
