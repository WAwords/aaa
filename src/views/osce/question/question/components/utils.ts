/**
 * 获取和当前行产生合并的行的index
 * @param arr
 * @param level 当前层级（这里理解为列，level_0、level_1）
 * @param index 当前操作的行index
 * @param merge_col_num 需要合并的列数
 */
export const getNowMergeIndex = (
  arr: any[],
  level: string,
  index: number,
  merge_col_num: number = 0,
  key = "content",
) => {
  // 当前列的index
  const nowLevelColIndex = getLevelNum(level);
  // 需要合并列的最大index
  const maxMergeColIndex = merge_col_num - 1;

  let result = [] as number[];

  // 如果nowLevelColIndex为非数字，不需要合并
  // 如果nowLevelColIndex大于最大合并列的index，不需要合并
  // 如果内容为空字符串，不需要合并
  if (
    isNaN(nowLevelColIndex) ||
    nowLevelColIndex > maxMergeColIndex ||
    arr[index][level][key] === ""
  ) {
    // 当前的列不需要合并，或当前为最后一行，或当前单元格为''（空字符串的单元格不需要合并）
    result = [index];
  } else {
    let handleRowData = [] as any[];
    // 获取当前单元格及前几列的数据
    for (let i = 0; i <= nowLevelColIndex; i++) {
      handleRowData.push(arr[index][`level_${i}`][key]);
    }

    for (let i = 0; i < arr.length; i++) {
      let tempRowData = [] as any[];

      // 获取当前单元格及前几列的数据
      for (let j = 0; j <= nowLevelColIndex; j++) {
        tempRowData.push(arr[i][`level_${j}`][key]);
      }

      if (
        handleRowData.every((_item, _index) => _item === tempRowData[_index])
      ) {
        // 如果遍历的当前行数据等于操作的行的数据
        result.push(i);
      } else {
        // result为空则继续
        if (result.length === 0) {
          continue;
        }

        // 不为空
        if (result.includes(index)) {
          // 有当前行的索引，则直接返回
          break;
        } else {
          // 没有当前行的索引，则代表这一组合并的行不存在需要检测的行，将结果置空后继续
          result = [];
          continue;
        }
      }
    }
  }

  result = [...new Set(result)];

  result.sort((a, b) => a - b);

  return result;
};

/**
 * 获取层级编号（输入level_1则返回数字1）
 * @param levelStr
 * @returns
 */
export const getLevelNum = (levelStr: string) => {
  return +levelStr.match(/_(.*)/)![1];
};
