// 格式化路由
export function FormatRoutes(routes: any) {
  let list = JSON.parse(JSON.stringify(routes));
  SetRoute(list);
  return list;
  function SetRoute(list: any) {
    const Layout = import.meta.glob("@/router/layout/index.vue");
    const pages = import.meta.glob("@/views/**/index.vue");
    list.forEach((element: any) => {
      if (element.component === "Layout") {
        element.component = Layout[0];
      } else {
        element.component = pages[`/src/views/${element.component}/index.vue`];
      }
      if (element.hasOwnProperty("children")) {
        SetRoute(element["children"]);
      }
    });
  }
}

// // 引入路由页面
// const pageComponents = import.meta.glob("../views/**/index.vue");
// function SetRoutersAttribute(routers: any) {
//   routers.forEach((element: any) => {
//     if (element.component === "Layout") {
//       element.component = Layout;
//     } else {
//       element.component =
//         pageComponents[`../views/${element.component}/index.vue`];
//     }
//     if (element.hasOwnProperty("children")) {
//       SetRoutersAttribute(element["children"]);
//     }
//   });
// }
// let newRouters = JSON.parse(JSON.stringify(routers));
// SetRoutersAttribute(newRouters);

// newRouters.forEach((i: any) => {
//   router.addRoute(i);
// });
