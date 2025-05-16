import { defHttp } from "@/request/axios";

enum Api {
  overviewsUrl = "/osce/overviews",
}

// 获取总览数据
export const getOverviewsApi = () =>
  defHttp.get({
    url: Api.overviewsUrl,
  });
