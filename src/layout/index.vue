<template>
  <el-config-provider :locale="zhCn">
    <div class="layout-container">
      <!-- 左边菜单 -->
      <div class="aside">
        <Logo :is-collapse="isCollapse" />
        <AsideMenu
          :is-collapse="isCollapse"
          :aside-active-path="asideActivePath"
        />
      </div>

      <!-- header导航和主要信息展示 -->
      <div class="main">
        <!-- 顶部导航 -->
        <HeaderMenu
          v-model:asideActivePath="asideActivePath"
          v-model:isCollapse="isCollapse"
          class="flex-none"
        />

        <!-- 标签导航 -->
        <TagsView class="flex-none" />

        <!-- TODO 面包屑暂时不用 -->
        <!-- <Breadcrumb
          v-model:asideActivePath="asideActivePath"
          class="flex-none"
        /> -->

        <!-- 主内容 -->
        <div id="main-layout-id" class="router-view-container">
          <!-- <router-view class="flex-1" /> -->
          <router-view v-slot="{ Component }" class="flex-1">
            <transition name="slide-fade" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </div>
      </div>
    </div>
  </el-config-provider>
</template>

<script setup lang="ts">
import zhCn from "element-plus/es/locale/lang/zh-cn";
// import Breadcrumb from "./components/Breadcrumb/index.vue";
import Logo from "./components/Logo/index.vue";
import AsideMenu from "./components/AsideMenu/index.vue";
import HeaderMenu from "./components/HeaderMenu/index.vue";
import TagsView from "./components/TagsView/index.vue";

// 是否折叠menu
const isCollapse = ref(false);
provide("isCollapse", isCollapse);
// 显示的侧边栏path
const asideActivePath = ref<string>("");
</script>

<style lang="less">
/** =============== 样式覆盖 begin =============== */
.el-menu-vertical-set:not(.el-menu--collapse) {
  width: 250px;
  min-height: 400px;
}
.el-menu-item {
  transition: 0s;
}
.el-sub-menu__title {
  transition: 0s;
}
.el-menu {
  user-select: none;
}
.el-scrollbar__view {
  height: 100%;
}
/** =============== 样式覆盖 end =============== */

.layout-container {
  @apply h-100vh w-100vw flex;
  .aside {
    @apply flex flex-col h-screen border-r;
    // 覆盖menu的padding，好看点
    --el-menu-base-level-padding: 25px !important;
    --el-menu-level-padding: 25px !important;

    @apply bg-no-repeat bg-cover bg-origin-border bg-bottom;
    background-image: url(@/assets/img/osce/layout/aside-bg.png);
  }
  > .main {
    @apply overflow-hidden flex w-full flex-col;
    > .router-view-container {
      @apply p-20px h-full box-border min-w-900px flex flex-col overflow-y-scroll flex-1;
      -ms-overflow-style: none;
      scrollbar-width: none;
      &::-webkit-scrollbar {
        display: none;
      }
    }
  }
}

/** =============== 动画 =============== */

.slide-fade-enter-active {
  transition: all 0.1s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.1s;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(20px);
  opacity: 0;
}
</style>
