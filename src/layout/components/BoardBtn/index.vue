<template>
  <div>
    <router-link
      :to="`${asideActivePath}/board`"
      class="board-btn"
      v-if="boardBtnVisible"
    >
      <Icon icon="ant-design:fund-projection-screen-outlined" size="15px" />
      <div class="link-text" :class="{ 'is-collapse': isCollapse }">{{
        linkText
      }}</div>
    </router-link>
  </div>
</template>

<script setup lang="ts">
import { usePermissionStore } from "@/store";

interface Props {
  asideActivePath: string;
  isCollapse: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  asideActivePath: "",
  isCollapse: false,
});

/** 按钮文字 */
const linkText = ref("");

/** 按钮是否显示 */
const boardBtnVisible = ref(false);

watchEffect(() => {
  // 如果当前激活的路径为空，则不继续展示判断
  if (!props.asideActivePath) return;

  let permissionStore = usePermissionStore();

  // 当前模块的board看板
  let thisBoard = permissionStore.asyncRouters
    .find((item) => item.path === props.asideActivePath)
    ?.children.find((item: any) => item.path === "board");

  if (thisBoard) {
    // 设置是否展示
    if (["OsceBoard"].includes(thisBoard.name)) {
      boardBtnVisible.value = true;
    } else {
      boardBtnVisible.value = false;
    }

    // 设置文字内容
    linkText.value =
      permissionStore.addRoutes
        .filter((item) => item.path === props.asideActivePath)[0]
        ?.children.filter((item: any) => item.path === "board")[0]?.meta
        ?.title || "";
  }
});
</script>

<style scoped lang="less">
.board-btn {
  @apply flex items-center justify-center cursor-pointer px-15px;
  height: 44px;
  background: #ffffff;
  box-shadow: 0px 10px 10px 0px rgba(0, 94, 172, 0.04);
  border-radius: 25px;
  font-size: var(--el-font-size-base);
  .link-text {
    @apply pl-10px box-border;
    overflow: hidden;
    width: 80px;
    text-overflow: ellipsis;
    white-space: nowrap;
    transition: 0.3s;
    &.is-collapse {
      @apply pl-0 w-0;
    }
  }
}
</style>
