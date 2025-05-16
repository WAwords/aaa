<template>
  <div class="tags-view-wrapper">
    <div class="tag-list">
      <div
        class="tag-item"
        v-for="i in tagsViewStore.tagList"
        :class="{
          active: route.path === i.path,
        }"
        @click="handleTagClick(i)"
        @contextmenu.prevent="(e) => openMenu(i, e)"
      >
        <span>{{ i.meta?.title }}</span>
        <div
          class="delete-btn"
          @click.stop="handleTagDelete(i)"
          v-if="!tagsViewStore.fixedTagPathList.includes(i.path)"
        >
          <Icon icon="ant-design:close-outlined" size="12px" />
        </div>
      </div>
    </div>

    <div class="tags-fixed-right">
      <el-button
        text
        @click="handleFixedRefresh()"
        :disabled="refreshThisDisabled"
      >
        <el-icon><Refresh /></el-icon>
      </el-button>
    </div>

    <!-- 右键菜单 -->
    <Teleport to="body">
      <div
        v-if="menuVisible"
        @close="menuVisible = false"
        ref="menuRef"
        class="menu-wrapper"
        :style="{
          left: `${menuPoint.x}px`,
          top: `${menuPoint.y}px`,
        }"
      >
        <div
          class="menu-item"
          @click="handleMenuClick('refreshThis')"
          :class="{
            disabled: refreshThisDisabled,
          }"
        >
          <Icon icon="ant-design:reload-outlined" size="12px" />
          <span> 重新加载 </span>
        </div>
        <div
          class="menu-item"
          @click="handleMenuClick('closeThis')"
          :class="{
            disabled: closeThisDisabled,
          }"
        >
          <Icon icon="ant-design:close-outlined" size="12px" />
          <span> 关闭标签页 </span>
        </div>

        <div class="divider"></div>

        <div
          class="menu-item"
          @click="handleMenuClick('closeLeft')"
          :class="{
            disabled: closeLeftDisabled,
          }"
        >
          <Icon icon="ant-design:arrow-left-outlined" size="12px" />
          <span> 关闭左侧标签页 </span>
        </div>
        <div
          class="menu-item"
          @click="handleMenuClick('closeRight')"
          :class="{
            disabled: closeRightDisabled,
          }"
        >
          <Icon icon="ant-design:arrow-right-outlined" size="12px" />
          <span> 关闭右侧标签页 </span>
        </div>

        <div class="divider"></div>

        <div class="menu-item" @click="handleMenuClick('closeOther')">
          <Icon icon="ant-design:pic-center-outlined" size="12px" />
          <span> 关闭其他标签页 </span>
        </div>
        <div class="menu-item" @click="handleMenuClick('closeAll')">
          <Icon icon="ant-design:minus-outlined" size="12px" />
          <span> 关闭所有标签页 </span>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { useTagsViewStore } from "@/store";
import type { TagsViewItem } from "@/store";
import { onClickOutside } from "@vueuse/core";
import { Refresh } from "@element-plus/icons-vue";

const route = useRoute();
const router = useRouter();

const tagsViewStore = useTagsViewStore();

/** 当前激活的的tag */
const currentTag = ref<TagsViewItem>();

// 监听路由变化
watch(
  () => route,
  (newRoute) => {
    if (
      !tagsViewStore.fixedTagPathList.includes(newRoute.path) &&
      newRoute.path.split("/")[1] !== "redirect"
    ) {
      // 如果该路由不属于固定显示路由（首页），则添加到标签栏
      tagsViewStore.addTag(newRoute);
    }

    currentTag.value = {
      path: newRoute.path,
      meta: newRoute.meta,
      name: newRoute.name,
      time: new Date().getTime(),
    };

    setTimeout(() => {
      let itemList = document.getElementsByClassName("tag-item active");
      itemList[0].scrollIntoView({
        // 滚动到指定节点
        // 值有start,center,end，nearest，当前显示在视图区域中间
        block: "center",
        // 值有auto,smooth，缓动动画（当前是慢速的）
        behavior: "smooth",
      });
    }, 100);
  },
  { deep: true, immediate: true },
);

onUnmounted(() => {
  tagsViewStore.resetTag();
});

/**
 * 点击标签后跳转路由
 * @param data 点击的标签信息
 */
const handleTagClick = (data: TagsViewItem) => {
  router.push(data.path);
};

/**
 * 删除标签
 * @param data 点击的标签信息
 */
const handleTagDelete = (data: TagsViewItem) => {
  tagsViewStore.closeTag(data.path);
};

/** =============== 右键菜单 begin =============== */
/** 菜单 */
const menuRef = ref();
/** 右键菜单显示控制 */
const menuVisible = ref(false);
/** 菜单坐标 */
const menuPoint = ref({ x: 0, y: 0 });

/** 打开菜单 */
const openMenu = (i: any, e: any) => {
  currentTag.value = i;

  menuPoint.value.x = e.clientX;
  menuPoint.value.y = e.clientY;

  menuVisible.value = true;
};

/** 关闭菜单 */
const closeMenu = () => {
  menuVisible.value = false;
  currentTag.value = undefined;
};

/** 菜单选项点击 */
const handleMenuClick = (type: string) => {
  switch (type) {
    // 刷新当前页面
    case "refreshThis": {
      if (refreshThisDisabled.value) return;

      // 刷新
      tagsViewStore.refreshPage(currentTag.value!.path);

      break;
    }

    // 关闭当前标签
    case "closeThis": {
      if (closeThisDisabled.value) return;

      tagsViewStore.closeTag(currentTag.value!.path);
      break;
    }

    // 关闭左侧标签
    case "closeLeft": {
      if (closeLeftDisabled.value) return;

      tagsViewStore.closeLeftTag(currentTag.value!.path);
      break;
    }

    // 关闭右侧标签
    case "closeRight": {
      if (closeRightDisabled.value) return;

      tagsViewStore.closeRightTag(currentTag.value!.path);
      break;
    }

    // 关闭其他标签
    case "closeOther": {
      tagsViewStore.closeOtherTag(currentTag.value!.path);
      break;
    }

    // 关闭所有标签
    case "closeAll": {
      tagsViewStore.closeAllTag();
      break;
    }

    default:
      break;
  }

  closeMenu();
};

/** 菜单外点击 */
onClickOutside(menuRef, () => {
  closeMenu();
});

/** 刷新标签页禁用 */
const refreshThisDisabled = ref(false);
/** 关闭标签页禁用 */
const closeThisDisabled = ref(false);
/** 关闭左侧标签页禁用 */
const closeLeftDisabled = ref(false);
/** 关闭右侧标签页禁用 */
const closeRightDisabled = ref(false);

watch(
  currentTag,
  (val: any) => {
    if (!val) return;

    // 是否为固定显示标签
    const isFixed = tagsViewStore.fixedTagList
      .map((item) => item.path)
      .includes(currentTag.value!.path);
    // 是否为活动标签第一个
    const isFirst =
      tagsViewStore.dynamicTagList.findIndex(
        (item) => item.path === currentTag.value!.path,
      ) === 0;
    // 是否为活动标签最后一个
    const isLast =
      tagsViewStore.dynamicTagList.findIndex(
        (item) => item.path === currentTag.value!.path,
      ) ===
      tagsViewStore.dynamicTagList.length - 1;
    // 当前标签名
    const thisTagName = tagsViewStore.tagList.find(
      (item) => item.path === currentTag.value!.path,
    )?.name;

    /** 刷新标签页 */
    if (isFixed) {
      // 是固定标签则不能刷新
      refreshThisDisabled.value = true;
    } else {
      if (tagsViewStore.excludeViewList.includes(thisTagName)) {
        // 是名单内的标签则不能刷新
        refreshThisDisabled.value = true;
      } else {
        refreshThisDisabled.value = false;
      }
    }

    /** 关闭标签页 */
    // 如果该标签是固定显示的，则禁用关闭按钮
    closeThisDisabled.value = tagsViewStore.fixedTagList
      .map((item) => item.path)
      .includes(currentTag.value!.path);

    /** 关闭左侧标签页 */
    if (isFixed) {
      // 如果该标签是固定显示的，则禁用按钮
      closeLeftDisabled.value = true;
    } else if (isFirst) {
      // 如果该标签是活动标签第一个，则禁用按钮
      closeLeftDisabled.value = true;
    } else {
      closeLeftDisabled.value = false;
    }

    /** 关闭右侧标签 */
    if (isLast) {
      closeRightDisabled.value = true;
    } else {
      closeRightDisabled.value = false;
    }
  },
  {
    immediate: true,
  },
);

/** =============== 右键菜单 end =============== */

/** 右侧固定刷新 */
const handleFixedRefresh = () => {
  tagsViewStore.refreshPage(route.path);
};
</script>

<style scoped lang="less">
.tags-view-wrapper {
  @apply px-20px py-10px flex;
  border-bottom: var(--el-border);

  .tag-list {
    // TODO 超出宽度要显示阴影
    @apply flex overflow-x-scroll flex-1;
    -ms-overflow-style: none;
    scrollbar-width: none;
    &::-webkit-scrollbar {
      display: none;
    }
    .tag-item {
      @apply h-28px flex justify-center items-center px-10px flex-none cursor-pointer;
      background-color: var(--el-color-primary-light-9);
      font-size: var(--el-font-size-extra-small);
      line-height: var(--el-font-size-extra-small);
      color: var(--el-text-color-secondary);
      border-radius: var(--el-border-radius-base);
      .delete-btn {
        @apply h-14px ml-5px w-14px flex justify-center items-center rounded-full overflow-hidden;
        transition: all 0.1s;
        &:hover {
          background-color: var(--el-color-primary);
          color: #ffffff;
        }
      }

      &:not(:first-child) {
        @apply ml-10px;
      }
      &.active {
        color: #ffffff;
        background-color: var(--el-color-primary);
        .delete-btn {
          &:hover {
            background-color: #ffffff;
            color: var(--el-color-primary);
          }
        }
      }
    }
  }

  .tags-fixed-right {
    @apply flex-none flex items-center ml-10px;
    .handle-btn {
      @apply w-24px h-24px flex justify-center items-center;
      &:hover {
        color: var(--el-color-primary);
      }
    }
  }
}

// 右键菜单
.menu-wrapper {
  position: fixed;
  z-index: 1000;
  background-color: #ffffff;
  border-radius: var(--el-border-radius-base);
  box-shadow: var(--el-box-shadow-light);
  padding: var(--el-border-radius-base) 0;
  min-width: 100px;
  font-size: var(--el-font-size-extra-small);
  color: var(--el-text-color-regular);

  .menu-item {
    @apply px-10px py-4px flex items-center cursor-pointer;
    &:hover {
      background-color: var(--el-color-primary-light-9);
      color: var(--el-color-primary);
    }
    &:not(:first-child) {
      @apply mt-2px;
    }
    &.disabled {
      @apply cursor-not-allowed;
      // background-color: var(--el-disabled-bg-color);
      color: var(--el-disabled-text-color);
    }
    span {
      @apply ml-5px;
    }
  }

  .divider {
    @apply my-2px h-1px;
    background-color: var(--el-border-color);
  }
}
</style>
