import { createPinia } from "pinia";
// 导出模块
export * from "./modules/user";
export * from "./modules/permission";
export * from "./modules/global";
export * from "./modules/tagsView";

const pinia = createPinia();
export default pinia;
