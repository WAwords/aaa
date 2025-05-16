declare type Recordable<T = any> = Record<string, T>;

declare type BasicListResult<T = any> = {
  dataList: T[];
  totalSize: number;
  pageSize: number;
  pageNumber: number;
};

type WSBasicResult = {
  type: string;
  data: {
    success?: boolean;
    message: string;
    [key: string]: any;
  };
  [key: string]: any;
};

/** vitest的vue文件返回类型 */
declare module "*.vue" {
  export default any;
}
