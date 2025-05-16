import { defHttp } from "@/request/axios";

enum Api {
  menuUrl = "/system/menus",
}

/** 获取菜单列表 */
export const getMenusApi = (params: any) =>
  defHttp.get({
    url: Api.menuUrl,
    params,
  });
/** 新增菜单 */
export const addMenuApi = (params: AddMenuType) =>
  defHttp.post({
    url: Api.menuUrl,
    params,
  });
/** 删除菜单 */
export const deleteMenusApi = (ids: string) =>
  defHttp.delete({
    url: Api.menuUrl + `/${ids}`,
  });
/** 更新菜单 */
export const putMenuApi = (params: AddMenuType, id: number) =>
  defHttp.put({
    url: Api.menuUrl + `/${id}`,
    params,
  });

// 类型
export type AddMenuType = {
  /**
   * 是否可缓存，默认可缓存
   */
  cacheable: boolean;
  /**
   * 组件
   */
  component: string;
  /**
   * 是否被禁用，默认未被禁用
   */
  disabled: boolean;
  /**
   * 是否外链，是外链点击会在新窗口显示内容，不是外链会在本窗口打开内容，默认不是外链
   */
  external: boolean;
  /**
   * 图标
   */
  icon?: string;
  /**
   * 名字
   */
  name: string;
  /**
   * 顺序
   */
  order?: number;
  /**
   * 父物理主键
   */
  parentId: number;
  /**
   * 路径
   */
  path: string;
  /**
   * 权限字符
   */
  permission?: string;
  /**
   * 查询参数
   */
  query?: string;
  /**
   * 备注
   */
  remark?: string;
  /**
   * 类型，C目录，M菜单，B按钮
   */
  type: "C" | "M" | "B";
  /**
   * 是否可见，默认可见
   */
  visible: boolean;
  [property: string]: any;
};
