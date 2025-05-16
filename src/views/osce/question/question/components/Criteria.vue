<template>
  <div class="w-full overflow-hidden">
    <LevelList title="评分标准" :loading="loading" :border="false" width="100%">
      <template #btn>
        <el-space v-if="typeId >= 0 && skillId >= 0">
          <Import @confirm="onImport" @download="onDownload" ref="importRef" />
          <el-button
            type="primary"
            @click="onCreate"
            v-hasPermi="['osce:scoring-criteria:add']"
          >
            新增
            <template #icon>
              <Icon icon="ant-design:plus-outlined" size="15px" />
            </template>
          </el-button>
        </el-space>
      </template>
      <template #list>
        <el-table
          ref="tableRef"
          v-loading="loading"
          :data="tableData"
          max-height="650px"
          class="w-full"
          v-if="tableData.length > 0"
          stripe
        >
          <template #empty>
            <el-empty class="h-610px" description="暂无数据" />
          </template>
          <el-table-column
            type="index"
            label="序号"
            width="55"
            fixed
            align="center"
          />
          <el-table-column
            prop="sceneTitle"
            label="场景"
            fixed
            show-overflow-tooltip
          />
          <el-table-column label="" fixed="right" width="80px" align="center">
            <template #default="{ row }">
              <div class="h-full flex items-center justify-center">
                <el-dropdown trigger="click">
                  <div class="flex items-center cursor-pointer">
                    更多
                    <el-icon>
                      <arrow-down />
                    </el-icon>
                  </div>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item
                        @click="handleView(row)"
                        :disabled="
                          havePermi(['osce:scoring-criteria:view'], true)
                        "
                        >查看</el-dropdown-item
                      >
                      <el-dropdown-item
                        @click="handleEdit(row)"
                        :disabled="
                          havePermi(['osce:scoring-criteria:update'], true)
                        "
                        >修改</el-dropdown-item
                      >
                      <el-dropdown-item
                        @click="handleDuplicate(row)"
                        :disabled="
                          havePermi(['osce:scoring-criteria:duplicate'], true)
                        "
                        >复制</el-dropdown-item
                      >
                      <el-dropdown-item
                        @click="handleCriteriaExport(row)"
                        :disabled="
                          havePermi(['osce:scoring-criteria:view'], true)
                        "
                        >导出</el-dropdown-item
                      >
                      <el-dropdown-item
                        @click="handleDelete(row)"
                        :disabled="
                          havePermi(['osce:scoring-criteria:delete'], true)
                        "
                        style="color: var(--el-color-danger) !important"
                        class="font-bold"
                        >删除</el-dropdown-item
                      >
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </template>
          </el-table-column>
          <!-- TODO 默认暂时用不上，之后可能会用 -->
          <!-- <el-table-column label="默认" fixed="right" width="60px" align="center">
        <template #default="scope">
          <div class="flex justify-center items-center cursor-pointer">
            <div
              class="border border-gray-500 h-15px w-15px rounded-full p-3px"
              @click="onChangeDefault(scope.row)"
            >
              <div
                class="h-full w-full rounded-full"
                :class="scope.row.defaultFlag ? 'bg-gray-500' : ''"
              ></div>
            </div>
          </div>
        </template>
      </el-table-column> -->
        </el-table>
      </template>
    </LevelList>

    <CriteriaDialog
      ref="criteriaDialogRef"
      v-model:dialogType="dialogType"
      :criteriaId="criteriaId"
      :skillId="skillId"
      :typeId="typeId"
      @onRefresh="fetch"
    />
  </div>
</template>

<script setup lang="ts">
import * as XLSX from "xlsx";
import type { WorkSheet } from "xlsx";
import type { UploadFiles } from "element-plus";
import { ArrowDown } from "@element-plus/icons-vue";
import CriteriaDialog from "./CriteriaDialog.vue";
import Import from "./Import/index.vue";
import {
  getCriteriaListApi,
  deleteCriteriaApi,
  patchCriteriaApi,
  criteriaDuplicateApi,
} from "@/api/osce/question/question";
import {
  GetCriteriaReqType,
  CriteriaListItemType,
} from "@/api/osce/question/question";
import { havePermi } from "@/utils/common";
import { downloadFile } from "@/request/utils/blob";

interface Props {
  typeId: number;
  skillId: number;
}
const props = withDefaults(defineProps<Props>(), {
  typeId: -1,
  skillId: -1,
});
const { typeId, skillId } = toRefs(props);

const queryParams = ref<GetCriteriaReqType>({
  skillId: skillId,
  typeId: typeId,
});
watch(
  () => props.typeId,
  () => {
    tableData.value = [];
  },
);
watch(
  () => props.skillId,
  (newVal) => {
    if (newVal >= 0) {
      fetch();
    } else {
      tableData.value = [];
    }
  },
);

/** 模板下载 */
const onDownload = () => {
  downloadFile("/osce/template/files/OSCE评分标准导入模板.xlsx", {});
};

/**
 * 拉取列表
 */
const loading = ref(false);
const totalSize = ref(0);
const tableData = ref<CriteriaListItemType[]>([]);
const fetch = () => {
  loading.value = true;
  getCriteriaListApi(queryParams.value, props.typeId, props.skillId)
    .then((res) => {
      totalSize.value = res.totalSize;
      tableData.value = res.dataList;
      loading.value = false;
    })
    .catch(() => {
      loading.value = false;
    });
};
/**
 * 弹窗控制
 */
const dialogVisible = ref<boolean>(false);
provide("dialogVisible", dialogVisible);
const dialogType = ref<"create" | "edit" | "view">("create");

const onCreate = () => {
  criteriaId.value = -1;
  dialogType.value = "create";
  dialogVisible.value = true;
};
const criteriaId = ref<number>(-1);
const handleEdit = (row: CriteriaListItemType) => {
  criteriaId.value = row.id;
  dialogType.value = "edit";
  dialogVisible.value = true;
};
const handleView = (row: CriteriaListItemType) => {
  criteriaId.value = row.id;
  dialogType.value = "view";
  dialogVisible.value = true;
};
/**
 * 单个删除
 */
const handleDelete = (row: CriteriaListItemType) => {
  CmeMessageBox.confirm(`确定删除评分标准吗？删除之后无法恢复！`, "系统提示", {
    distinguishCancelAndClose: true,
    confirmButtonText: "确定",
    cancelButtonText: "取消",
  })
    .then(() => {
      deleteCriteriaApi(row.id, props.typeId, props.skillId)
        .then(() => {
          CmeMessage({
            title: "成功",
            message: "删除评分标准成功",
            type: "success",
          });
          fetch();
        })
        .catch(() => {});
    })
    .catch(() => {});
};
/**
 * 改变默认
 */
const onChangeDefault = (row: CriteriaListItemType) => {
  let obj = { criteriaId: row.id };
  patchCriteriaApi(props.typeId, props.skillId, obj)
    .then(() => {
      CmeMessage({
        title: "成功",
        message: "评分标准默认项设置成功",
        type: "success",
      });
      fetch();
    })
    .catch(() => {});
};

/** 复制评分标准 */
const handleDuplicate = (row: CriteriaListItemType) => {
  CmeMessageBox.confirm(`确定复制“${row.sceneTitle}”吗？`, "系统提示", {
    distinguishCancelAndClose: true,
    confirmButtonText: "确定",
    cancelButtonText: "取消",
  })
    .then(() => {
      const params = {
        typeId: props.typeId,
        skillId: props.skillId,
        criteriaId: row.id,
      };
      criteriaDuplicateApi(params)
        .then(() => {
          CmeMessage({
            title: "成功",
            message: "复制评分表成功",
            type: "success",
          });
          fetch();
        })
        .catch(() => {});
    })
    .catch(() => {});
};

/** 评分标准导入 */
const onImport = (fileList: UploadFiles) => {
  const fileReader = new FileReader();
  fileReader.readAsArrayBuffer(fileList[0].raw!);

  fileReader.onerror = () => {
    CmeMessage({
      title: "提示",
      message: "提交失败，请重新上传文件后再提交",
      type: "warning",
    });
  };
  fileReader.onload = (e) => {
    const data = e.target?.result;
    // 读取xlsx获得的数据
    const workbook = XLSX.read(data, { type: "array" });
    // xlsx的sheet数组
    const worksheets = workbook.SheetNames.map((name) => {
      return {
        name,
        data: workbook.Sheets[name],
      };
    });

    // 校验模板
    let structureValidate = importStructureValidate(worksheets);
    if (structureValidate === false) {
      return;
    }

    const {
      scoreingHeader,
      deductionHeader,
      sceneHeader,
      scoreingItemsType,
      deductionItemsType,
    } = structureValidate;
    let { scoreingSheet, deductionSheet, sceneSheet } = structureValidate;

    // 校验表头（表头必须一致）

    // 裁剪表体（超出表头的部分的数据将会被忽略）
    scoreingSheet.forEach((item, index) => {
      item;
      scoreingSheet[index].length = scoreingHeader.length;
    });
    deductionSheet.forEach((item, index) => {
      item;
      deductionSheet[index].length = deductionHeader.length;
    });
    sceneSheet.forEach((item, index) => {
      item;
      sceneSheet[index].length = sceneHeader.length;
    });

    // 将空行去除（注意：题干sheet页的行数是固定的，不用去除空行）
    scoreingSheet = getNotEmptyArr(scoreingSheet);
    deductionSheet = getNotEmptyArr(deductionSheet);

    // 表体
    let scoreingBody = scoreingSheet.filter((item, index) => {
      item;
      return index > 2;
    });
    let deductionBody = deductionSheet.filter((item, index) => {
      item;
      return index > 2;
    });

    let sceneBody = sceneSheet
      .filter((item, index) => {
        item;
        return index === 3;
      })
      .map((item) => {
        return item.map((i: any) => i + "");
      });

    // 填充表体
    scoreingBody = setFillTableBody(
      scoreingHeader,
      scoreingBody,
      +scoreingItemsType,
    );
    deductionBody = setFillTableBody(
      deductionHeader,
      deductionBody,
      +deductionItemsType,
    );

    sceneBody = setFillTableBody(sceneHeader, sceneBody);

    /** 只对标题数据做了填充处理的的excel数据 */
    const readyData = {
      scoreing: {
        header: scoreingHeader,
        body: scoreingBody,
      },
      deduction: {
        header: deductionHeader,
        body: deductionBody,
      },
      scene: {
        header: sceneHeader,
        body: sceneBody,
      },
    };

    // 校验数据
    importValidate(readyData)
      .then(() => {
        // 设置需要合并的单元格数据
        setTableBodyEmpty(readyData.scoreing.body);
        setTableBodyEmpty(readyData.deduction.body);
        // 初始化成绩
        setScoreInitial(readyData.scoreing.body, +scoreingItemsType + 2);
        setScoreInitial(readyData.deduction.body, +deductionItemsType + 2);
        // 将存在的null及undefined转为空字符串（这一步要在合并表格后，因为表格合并需要null）
        setNullToString(readyData.scoreing.body);
        setNullToString(readyData.deduction.body);
        setNullToString(readyData.scene.body);

        importRef.value.importDialogVisible = false;
        criteriaDialogRef.value.importCriteria(readyData);
      })
      .catch(() => {
        console.error("导入数据校验失败");
      });
  };
};

/**
 * 通过导入的数据的表头获取ItemType
 * @param headerList 表头数组
 * @returns "0" | "1" | "2" | "3"
 */
const getItemsType = (headerList: string[]) => {
  return `${headerList.length - 3}` as "0" | "1" | "2" | "3";
};

/**
 * 表头长度基础校验
 */
const headerLengthValidate = (
  scoreingHeader: string[],
  deductionHeader: string[],
  sceneHeader: string[],
) => {
  if (!lengthValidate(scoreingHeader)) {
    CmeMessage({
      title: "提示",
      message:
        "导入失败，评分项表头（第三行）长度不符合要求，请确认导入文件是否正确",
      type: "warning",
    });
    return false;
  }

  if (!lengthValidate(deductionHeader)) {
    CmeMessage({
      title: "提示",
      message:
        "导入失败，扣分项表头（第三行）长度不符合要求，请确认导入文件是否正确",
      type: "warning",
    });
    return false;
  }

  if (sceneHeader.length !== 2) {
    CmeMessage({
      title: "提示",
      message:
        "导入失败，场景表头（第二行）长度不符合要求，请确认导入文件是否正确",
      type: "warning",
    });
    return false;
  }

  return true;
};

/**
 * 长度基础校验
 * @param arr 表头数组
 * @returns true 通过
 * @returns false 不通过
 */
const lengthValidate = (arr: string[]): boolean => {
  const length = arr.length;
  if (3 <= length && length <= 6) {
    return true;
  } else {
    return false;
  }
};

/** 将列表数据中的null及undefined转为空字符串 */
const setNullToString = (arr: any[][]) => {
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr[i].length; j++) {
      if (arr[i][j] === null || arr[i][j] === undefined) {
        arr[i][j] = "";
      }
    }
  }
};

/** 设置成绩的初始值
 * @param arr 需要处理的表体
 * @param score_col_num 成绩所在的列数（从1开始）
 */
const setScoreInitial = (arr: any[][], score_col_num: number) => {
  arr.forEach((item) => {
    const colIndex = score_col_num - 1;
    if (!item[colIndex]) {
      // 为空则默认为0
      item[colIndex] = 0;
    } else {
      const value = Number(item[colIndex]);

      if (isNaN(value)) {
        // 非数字则默认为0
        item[colIndex] = 0;
      } else {
        if (value < 0) {
          // 小于0则默认为0
          item[colIndex] = 0;
        } else if (0 <= value && value <= 100) {
          // 大于等于0则赋值（因为excel中可能会为string类型，所以要赋值）
          item[colIndex] = Math.round(value * 100) / 100;
        } else if (value > 100) {
          item[colIndex] = 100;
        }
      }
    }
  });
};

const criteriaDialogRef = ref();
const importRef = ref();

/**
 * 标题的empty的值设置（被合并的单元格）
 * 这个方法会改变传入的源数据
 * @param val 需要处理的表体
 */
const setTableBodyEmpty = (val: any[][]) => {
  // 每一个为空的单元格，都设置为上一个单元格的值
  for (let i = 0; i < val.length; i++) {
    if (i === 0) {
      continue;
    }
    for (let j = 0; j < val[i].length; j++) {
      if (val[i][j] === undefined || val[i][j] === null) {
        val[i][j] = val[i - 1][j];
      }
    }
  }
};

export type ReadImportItem = {
  scoreing: {
    header: string[];
    body: (string | number)[][];
  };
  deduction: {
    header: string[];
    body: (string | number)[][];
  };
  scene: {
    header: string[];
    body: string[][];
  };
};

/** 表头对应关系 */
const headerMapping = {
  scoreing: {
    "0": ["操作内容", "分值", "评分细则"],
    "1": ["一级类型", "操作内容", "分值", "评分细则"],
    "2": ["一级类型", "二级类型", "操作内容", "分值", "评分细则"],
    "3": ["一级类型", "二级类型", "三级类型", "操作内容", "分值", "评分细则"],
  },
  deduction: {
    "0": ["扣分原因", "分值", "扣分说明"],
    "1": ["一级类型", "扣分原因", "分值", "扣分说明"],
    "2": ["一级类型", "二级类型", "扣分原因", "分值", "扣分说明"],
    "3": ["一级类型", "二级类型", "三级类型", "扣分原因", "分值", "扣分说明"],
  },
  scene: ["场景标题", "场景"],
};

type HeaderValidateParam = {
  scoreingItemsType: "0" | "1" | "2" | "3";
  deductionItemsType: "0" | "1" | "2" | "3";
  scoreingHeader: string[];
  deductionHeader: string[];
  sceneHeader: string[];
};

/**
 * 表头校验
 * @param data 需要校验的数据
 * @returns true表示校验通过
 * @returns false表示校验失败
 */
const headerValidate = (data: HeaderValidateParam): Boolean => {
  // 评分项表头
  if (
    headerMapping.scoreing[data.scoreingItemsType].join("") !==
    data.scoreingHeader.join("")
  ) {
    CmeMessage({
      title: "提示",
      message:
        "导入失败，评分项表头（第三行）内容不符合要求，请确认导入文件是否正确",
      type: "warning",
    });
    return false;
  }
  // 扣分项表头
  if (
    headerMapping.deduction[data.deductionItemsType].join("") !==
    data.deductionHeader.join("")
  ) {
    CmeMessage({
      title: "提示",
      message:
        "导入失败，扣分项表头（第三行）内容不符合要求，请确认导入文件是否正确",
      type: "warning",
    });
    return false;
  }
  // 场景表头
  if (headerMapping.scene.join("") !== data.sceneHeader.join("")) {
    CmeMessage({
      title: "提示",
      message:
        "导入失败，场景表头（第二行）内容不符合要求，请确认导入文件是否正确",
      type: "warning",
    });
    return false;
  }

  return true;
};

type WorksheetsData = {
  name: string;
  data: WorkSheet;
};
type HeaderType = {
  scoreingSheet: any[];
  deductionSheet: any[];
  sceneSheet: any[];
  scoreingHeader: string[];
  deductionHeader: string[];
  sceneHeader: string[];
  scoreingItemsType: "0" | "1" | "2" | "3";
  deductionItemsType: "0" | "1" | "2" | "3";
};
/** 导入文件结构校验（校验模板是否正确） */
const importStructureValidate = (worksheets: WorksheetsData[]) => {
  // 检测sheet表数
  if (worksheets.length !== 3) {
    CmeMessage({
      title: "提示",
      message: "导入失败，sheet页数错误，请确认导入文件是否正确",
      type: "warning",
    });
    return false;
  }

  // 读取评分项数据
  let scoreingSheet = XLSX.utils.sheet_to_json(worksheets[0].data, {
    header: 1,
  }) as any[][];
  let deductionSheet = XLSX.utils.sheet_to_json(worksheets[1].data, {
    header: 1,
  }) as any[][];
  let sceneSheet = XLSX.utils.sheet_to_json(worksheets[2].data, {
    header: 1,
  }) as any[][];

  // 文件中的表头
  const scoreingHeader = scoreingSheet[2] || [];
  const deductionHeader = deductionSheet[2] || [];
  const sceneHeader = sceneSheet[1] || [];

  // 表头长度基础检测（长度需满足需求）
  if (!headerLengthValidate(scoreingHeader, deductionHeader, sceneHeader)) {
    return false;
  }

  const scoreingItemsType = getItemsType(scoreingHeader);
  const deductionItemsType = getItemsType(deductionHeader);

  // 校验表头是否正确
  if (
    !headerValidate({
      scoreingItemsType,
      deductionItemsType,
      scoreingHeader,
      deductionHeader,
      sceneHeader,
    })
  ) {
    return false;
  }

  // // 允许的表头
  // const static_scoreingHeader = [
  //   "标准大项",
  //   "标准小项",
  //   "操作内容",
  //   "分值",
  //   "评分细则",
  // ];
  // const static_deductionHeader = ["扣分类型", "扣分原因", "分值", "扣分说明"];
  // const static_sceneHeader = ["场景标题", "场景"];

  // // 判断表头是否正确（表头顺序和表头内容）
  // if (
  //   JSON.stringify(static_scoreingHeader) !== JSON.stringify(scoreingHeader) ||
  //   JSON.stringify(static_deductionHeader) !==
  //     JSON.stringify(deductionHeader) ||
  //   JSON.stringify(static_sceneHeader) !== JSON.stringify(sceneHeader)
  // ) {
  //   CmeMessage({
  //     title: "错误",
  //     message: "导入失败，表头数据无法对应，请检查是否选择了正确的文件",
  //     type: "error",
  //   });
  //   return false;
  // }

  return {
    scoreingSheet,
    deductionSheet,
    sceneSheet,
    scoreingHeader,
    deductionHeader,
    sceneHeader,
    scoreingItemsType,
    deductionItemsType,
  } as HeaderType;
};

/** 导入文件数据校验 */
const importValidate = (importData: ReadImportItem) => {
  return new Promise<void>((resolve, reject) => {
    // 检测通过标识
    let result = true;

    let { scoreing, deduction, scene } = importData;

    if (result) {
      resolve();
    } else {
      CmeMessage({
        title: "导入失败",
        message: "导入错误，请检查文件格式是否正确",
        type: "error",
      });
      reject();
    }
  });
};

/** 填充表体（表体长度未达到表头填充空字符串）
 * @param header 表头
 * @param body 表体
 * @param merge_col_num 需要合并的列数
 */
const setFillTableBody = (header: any[], body: any[][], merge_col_num = 0) => {
  return body.map((item) => {
    if (item.length < header.length) {
      let tempArr = item.concat(
        new Array(header.length - item.length).fill(""),
      );
      return cutEmpty(tempArr, merge_col_num);
    } else {
      return cutEmpty(item, merge_col_num);
    }
  });

  /** 去除列表中部分empty（一些需要合并的列的empty会被保留，用于之后的合并）
   * @param arr 需要处理的数组
   * @param merge_col_num 需要合并的列数
   */
  function cutEmpty(arr: any[], merge_col_num: number) {
    return Array.from(arr, (item, index) => {
      if (index < merge_col_num) {
        return item;
      } else {
        return item || "";
      }
    });
  }
};

const getNotEmptyArr = (arr: any[][]) => {
  // 从末尾删除空行，表格中间的空行不能删除（因为表格合并可能会出现空行）
  let tempArr = JSON.parse(JSON.stringify(arr));
  for (let i = tempArr.length - 1; i >= 0; i--) {
    if (tempArr[i].filter(Boolean).length === 0) {
      tempArr.splice(i, 1);
    } else {
      break;
    }
  }
  return tempArr;

  // // 不再删除末尾的空行（因为表格合并可能会出现空行）
  // return arr;
};

/** 评分标准导出 */
const handleCriteriaExport = (row: any) => {
  downloadFile(
    `/osce/skill-types/${props.typeId}/skills/${props.skillId}/scoring-criteria/${row.id}/export`,
  );
};
</script>

<style scoped lang="less">
::v-deep(.el-table) {
  border: unset !important;
  border-radius: unset !important;
}

.scene {
  position: relative;
  .item-operate {
    display: none;
    position: absolute;
    right: 0;
    top: 0;
  }
}
.scene:hover {
  .item-operate {
    display: block;
  }
}
</style>
