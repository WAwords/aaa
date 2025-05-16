<template>
  <div
    class="aside-container"
    :class="{
      'is-collapse': isCollapse,
    }"
  >
    <!-- 菜单 -->
    <el-scrollbar class="flex-1">
      <template v-for="asideMenuItem in routers" :key="asideMenuItem.name">
        <el-menu
          v-if="asideActivePath === asideMenuItem.path"
          :default-active="$route.path"
          class="el-menu-vertical-set flex-1 border-0"
          :collapse="isCollapse"
          router
          unique-opened
        >
          <template
            v-for="sunMenuItem in asideMenuItem.children"
            :key="sunMenuItem.name"
          >
            <el-sub-menu
              :index="sunMenuItem.name"
              v-if="!sunMenuItem.hidden"
              popper-class="aside-submenu-popper"
            >
              <template #title>
                <div class="mx-5px">
                  <Icon :icon="sunMenuItem.meta.icon" size="15px" />
                </div>
                <span>{{ sunMenuItem.meta.title }}</span>
              </template>
              <template
                v-for="menuItem in sunMenuItem.children"
                :key="menuItem.name"
              >
                <el-menu-item
                  :index="`/${menuItem.component}`"
                  v-if="!menuItem.hidden"
                >
                  <div class="menu-item-container">
                    <div class="menu-item-left-tag"> </div>
                    {{ menuItem.meta.title }}
                  </div>
                </el-menu-item>
              </template>
            </el-sub-menu>
          </template>
        </el-menu>
      </template>
    </el-scrollbar>

    <!-- 底部看板按钮容器 -->
    <div class="aside-bottom">
      <BoardBtn
        :is-collapse="isCollapse"
        :aside-active-path="asideActivePath"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { usePermissionStore } from "@/store/modules/permission";
import BoardBtn from "../BoardBtn/index.vue";
const permissionStore = usePermissionStore();
const routers = permissionStore.asyncRouters;

interface Props {
  asideActivePath: string;
  isCollapse: boolean;
}
withDefaults(defineProps<Props>(), {
  asideActivePath: "",
  isCollapse: false,
});
</script>

<style scoped lang="less">
/** =============== 样式覆盖 begin =============== */
@menu-text-color: #86909c;

// 菜单宽度
.el-menu-vertical-set:not(.el-menu--collapse) {
  width: 240px;
}

// 菜单
::v-deep(.el-menu) {
  background-color: #ffffff00;
  // 菜单项高度
  --el-menu-item-height: 50px;
  // 菜单项文字默认颜色
  --el-menu-text-color: @menu-text-color;
  // 菜单padding
  --el-menu-base-level-padding: 10px;
  --el-menu-level-padding: 10px;

  // 父菜单
  .el-sub-menu__title {
    margin-bottom: 10px;
    border-radius: var(--el-border-radius-base);
    // border-radius: 4px;
    &:hover {
      background-color: #ffffff;
    }
  }

  // 子菜单
  .el-menu-item {
    border-radius: var(--el-border-radius-base);
    &:hover {
      background-color: #ffffff;
    }
  }

  // 父菜单激活状态
  .is-active {
    .el-sub-menu__title {
      background-color: #ffffff;
      // box-shadow: 0px 10px 10px 0px rgba(0, 94, 172, 0.04);
      color: var(--el-text-color-primary);
    }
  }

  .el-menu--vertical {
    &.el-menu--popup-container {
      border-radius: 20px;
    }
  }
}

// 子菜单弹窗容器
:global(.aside-submenu-popper) {
  overflow: hidden;
  box-shadow: var(--el-box-shadow-light);
}
// 子菜单弹窗默认
:global(.aside-submenu-popper .el-menu--popup .el-menu-item) {
  color: @menu-text-color;
}
// 子菜单弹窗鼠标悬浮
:global(.aside-submenu-popper .el-menu--popup .el-menu-item:hover) {
  background-color: var(--el-fill-color-lighter);
}
// 子菜单弹窗激活状态
:global(.aside-submenu-popper .el-menu--popup .el-menu-item.is-active) {
  color: var(--el-menu-active-color);
}

/** =============== 样式覆盖 end =============== */

.aside-container {
  @apply p-10px box-border flex flex-col h-full overflow-hidden w-260px duration-300;

  &.is-collapse {
    @apply w-65px;
  }

  .aside-bottom {
    @apply flex-none pt-20px pb-35px mt-10px;
    border-top: 1px solid #e5e6eb;
  }
}

.menu-item-container {
  @apply flex h-full;
  .menu-item-left-tag {
    @apply h-full ml-10px mr-15px relative bg-[#e5e6eb] w-1px;
  }
}

.el-menu-item {
  &.is-active {
    // 菜单项左侧竖条
    > .menu-item-container {
      @apply flex h-full;
      .menu-item-left-tag {
        &::before {
          content: "";
          @apply absolute top-1/2 left-1/2 w-3px h-1/2;
          transform: translate(-50%, -50%);
          background-color: var(--el-color-primary);
        }
      }
    }
  }
}
</style>
