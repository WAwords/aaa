import { getDictApi } from "@/api/system/management/dict";

/** 字典map */
export const dictMap = ref<Map<string, any>>(new Map());

/** 字典获取
 * @param codeList 字典code数组
 */
export function useDict(codeList: string[]) {
  codeList.forEach((code) => {
    if (dictMap.value.has(code)) return;
    dictMap.value.set(code, []);
    getDictApi({ typeCode: code }).then((res) => {
      dictMap.value.set(code, res);
    });
  });

  return {
    dictMap,
    getDictList,
    getDictLabel,
    dictFormatter,
  };
}

/** 获取字典列表
 * @param typeCode 字典typeCode
 * @returns 字典list
 */
export function getDictList(typeCode: string) {
  return dictMap.value.get(typeCode);
}

/** 字典label展示
 * @param code 字典code
 * @param value 字典value
 * @returns 字典label
 */
export function getDictLabel(code: string, value: string) {
  const dict = dictMap.value.get(code);
  if (!dict) return "-";
  const item = dict.find((item: any) => item.value === value);
  return item?.label || "-";
}

/** table中的字典转换
 * @param dictCode 字典code
 * @param prop 需要转义的属性
 * @returns 转换方法
 */
export function dictFormatter(dictCode: string, prop?: string) {
  return (...args: any) => {
    return getDictLabel(dictCode, args[0][prop ?? dictCode]);
  };
}
