//文件流
import axios from "axios";
import { getToken } from "@/utils/auth";
import NProgress from "nprogress";
import { checkStatus } from "@/request/axios/checkStatus";

//下载get请求返回的文件流
export function downloadFile(
  resUrl: string,
  params: any = {},
  fileName?: string,
) {
  NProgress.start();
  const token = `Bearer ${getToken()}`;
  const headers = {
    Authorization: token,
  };
  axios({
    method: "get",
    url: import.meta.env.VITE_API_BASE_URL + resUrl,
    headers,
    params: {
      ...params,
      timestamp: new Date().getTime(),
    },
    responseType: "blob",
  })
    .then((res) => {
      let resFileName =
        res.headers["content-disposition"].match(/filename\=(\S*)/)[1];
      resFileName = decodeURIComponent(resFileName);

      const blob = new Blob([res.data]);
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = fileName ?? resFileName;
      link.click();
      NProgress.done();
    })
    .catch((e) => {
      checkStatus(e.response.status, "");
      NProgress.done();
    });
}

axios.interceptors.response.use(
  function (response) {
    // 如果返回的是application/json类型
    if (response.data.type === "application/json") {
      const reader = new FileReader();
      reader.onload = () => {
        // 读取文件流时，将返回值字符串转换为JSON对象，并提示错误
        CmeMessage({
          title: "警告",
          // @ts-ignore
          message: `${JSON.parse(reader.result).message}`,
          type: "error",
        });
      };
      reader.readAsText(response.data);
      return Promise.reject("error");
    } else {
      // 其他类型直接返回
      return response;
    }
  },
  function (error) {
    // 对响应错误做点什么
    return Promise.reject(error);
  },
);
