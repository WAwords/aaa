import { createApp } from "vue";
import App from "./App.vue";
import pinia from "@/store";
import i18n from "@/lang/index.js";
import router from "@/router/index";
import directive from "@/directive/index";
import { addCollection } from "@iconify/vue";
import antDesign from "@iconify-json/ant-design/icons.json";
import Sortable, { Swap } from "sortablejs";
import "virtual:windi.css";
import "element-plus/dist/index.css";
import "@/style/index.less";

// 拖拽的swap引入
Sortable.mount(new Swap());

// 添加图标集合到 Iconify
addCollection(antDesign);

const app = createApp(App);
app.use(pinia);
app.use(i18n);
app.use(router);
// 绑定自定义指令
directive(app);

app.mount("#app");
