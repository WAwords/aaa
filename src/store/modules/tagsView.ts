import { defineStore } from "pinia";
import { RouteLocationNormalized, RouteMeta } from "vue-router";
import router from "@/router/index";

export const useTagsViewStore = defineStore("tagsView", {
  state: () => {
    return {
      /** 动态的标签列表 */
      dynamicTagList: [] as TagsViewItem[],

      /** 不缓存的页面 */
      excludeViewList: ["Index", "OsceBoard", "OsceExamBegin"] as string[],

      /** 固定标签列表 */
      fixedTagList: [
        {
          path: "/index",
          meta: {
            title: "首页",
          },
          name: "Index",
          time: new Date().getTime(),
        },
      ] as TagsViewItem[],

      refreshFlag: {} as any,
    };
  },
  getters: {
    /** 缓存的路由页面名 */
    tagsViewNameList(): string[] {
      // let includeViewList = this.dynamicTagList.map((item) => item.name);
      // 在这里将excludeViewList中的路由排除掉

      let includeViewList = this.dynamicTagList
        .map((item) => item.name)
        .filter((item) => !this.excludeViewList.includes(item));

      return includeViewList;
    },
    /** 标签栏显示的标签列表 */
    tagList(): TagsViewItem[] {
      let tempList = [...this.fixedTagList, ...this.dynamicTagList];
      return tempList;
    },
    /** 固定显示标签地址列表（固定白名单） */
    fixedTagPathList(): string[] {
      return this.fixedTagList.map((item) => item.path);
    },
  },
  actions: {
    /** 新增标签 */
    addTag(addRouter: RouteLocationNormalized) {
      let isExist = this.dynamicTagList.find((item) => {
        return item.path === addRouter.path;
      });

      // 如果存在则不添加
      if (isExist) return;

      let tempRouter = {
        path: addRouter.path,
        meta: addRouter.meta,
        name: addRouter.name,
        time: new Date().getTime(),
      };
      this.dynamicTagList.push(tempRouter);
    },

    /** 关闭当前标签 */
    closeTag(path: string) {
      let thisTagIndex = this.dynamicTagList.findIndex(
        (item) => item.path === path,
      );

      // 删除当前tag
      this.dynamicTagList.splice(thisTagIndex, 1);

      const route = router.currentRoute.value;

      if (route.path === path) {
        // 如果当前删除的tag是激活的tag

        if (thisTagIndex === 0) {
          // 如果删除的tag是活动tag的第一个，则跳转首页

          router.push("/index");
        } else if (thisTagIndex - 1 >= 0) {
          // 不是则跳转到前一个tag

          router.push(this.dynamicTagList[thisTagIndex - 1].path);
        }
      }
    },

    /** 关闭左侧标签 */
    closeLeftTag(path: string) {
      // 当前选择标签的索引
      let thisTagIndex = this.dynamicTagList.findIndex(
        (item) => item.path === path,
      );

      // 当前路径（用于判断是否会删除当前激活的标签）
      let activePath = router.currentRoute.value.path;
      let activeTagIndex = this.dynamicTagList.findIndex(
        (item) => item.path === activePath,
      );

      this.dynamicTagList.splice(0, thisTagIndex);

      // 如果当前激活的是固定标签，则不跳转
      if (activeTagIndex === -1) return;

      if (activeTagIndex < thisTagIndex) {
        // 如果会删除激活的标签
        router.push(this.dynamicTagList[0].path);
      } else {
        // 如果不会删除激活的标签
      }
    },

    /** 关闭右侧标签 */
    closeRightTag(path: string) {
      // 当前选择标签的索引
      let thisTagIndex = this.dynamicTagList.findIndex(
        (item) => item.path === path,
      );

      // 当前路径（用于判断是否会删除当前激活的标签）
      let activePath = router.currentRoute.value.path;
      let activeTagIndex = this.dynamicTagList.findIndex(
        (item) => item.path === activePath,
      );

      this.dynamicTagList.splice(thisTagIndex + 1);
      if (activeTagIndex > thisTagIndex) {
        // 如果会删除激活的标签
        if (this.dynamicTagList.length > 0) {
          router.push(this.dynamicTagList[this.dynamicTagList.length - 1].path);
        } else {
          router.push("/index");
        }
      } else {
        // 如果不会删除激活的标签
      }
    },

    /** 关闭其他标签 */
    closeOtherTag(path: string) {
      // 当前选择标签的索引
      let thisTagIndex = this.dynamicTagList.findIndex(
        (item) => item.path === path,
      );

      // 当前路径（用于判断是否会删除当前激活的标签）
      let activePath = router.currentRoute.value.path;
      let activeTagIndex = this.dynamicTagList.findIndex(
        (item) => item.path === activePath,
      );

      this.dynamicTagList.splice(0, thisTagIndex);
      this.dynamicTagList.splice(1);
      if (activeTagIndex !== thisTagIndex) {
        // 如果会删除激活的标签
        router.push(this.dynamicTagList[0].path);
      }
    },

    /** 关闭所有标签 */
    closeAllTag() {
      this.dynamicTagList.splice(0);
      router.push("/index");
    },

    /** 重置标签栏 */
    resetTag() {
      this.dynamicTagList = [];
    },

    /** 刷新页面 */
    async refreshPage(path: string) {
      let thisTagIndex = this.dynamicTagList.findIndex(
        (item) => item.path === path,
      );
      if (thisTagIndex >= 0) {
        // 是活动标签
        this.dynamicTagList[thisTagIndex].time = new Date().getTime();
        router.push(path);
        return;
      }

      thisTagIndex = this.fixedTagList.findIndex((item) => item.path === path);
      if (thisTagIndex >= 0) {
        // 是固定标签
        this.fixedTagList[thisTagIndex].time = new Date().getTime();
        router.push(path);
        return;
      }

      // 都不是则退出
      return;
    },
  },
});

export type TagsViewItem = {
  path: string;
  meta: RouteMeta;
  /** 最后的刷新时间 */
  time: number;
  [key: string]: any;
};
