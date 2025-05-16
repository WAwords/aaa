<template>
  <div>
    <el-button type="primary" plain @click="handleImport">
      {{ title }}
      <template #icon>
        <Icon icon="ant-design:cloud-upload-outlined" size="15px" />
      </template>
    </el-button>
    <el-dialog
      v-model="importDialogVisible"
      :title="title"
      width="500px"
      destroy-on-close
      align-center
      @closed="onImportClose"
    >
      <div class="import-step-container">
        <div class="step-title">第一步：下载导入模板</div>
        <div class="step-content">
          <div>下载模板后请不要改变格式</div>
          <el-button type="primary" @click="emit('download')" class="mt-10px">
            模板下载
            <template #icon>
              <Icon icon="ant-design:cloud-download-outlined" size="15px" />
            </template>
          </el-button>
        </div>
      </div>
      <div class="import-step-container mt-20px">
        <div class="step-title">第二步：导入数据</div>
        <div class="step-content">
          <el-upload
            ref="uploadRef"
            drag
            accept=".xls, .xlsx"
            :auto-upload="false"
            :limit="1"
            :on-change="onFileChange"
            :on-exceed="onFileExceed"
            :on-remove="onRemove"
          >
            <div class="upload-icon">
              <Icon icon="ant-design:cloud-upload-outlined" size="70px" />
            </div>
            <div class="el-upload__text">
              拖动文件到这里或者
              <em>点击上传</em>
            </div>
            <template #tip>
              <div class="el-upload__tip"></div>
            </template>
          </el-upload>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" plain @click="importDialogVisible = false">
            取消
          </el-button>
          <el-button type="primary" @click="handleUpload"> 提交 </el-button>
        </span>
      </template>
    </el-dialog>

    <el-dialog
      v-model="validateVisible"
      title="验证"
      width="1200px"
      destroy-on-close
      :close-on-click-modal="false"
      @opened="validateOpened"
      @closed="validateClosed"
      align-center
    >
      <div class="pb-10px cursor-default">
        未处理的错误数量：
        <span style="color: var(--el-color-danger)">{{ errCount }}</span>
      </div>
      <div class="pb-10px" style="color: var(--el-color-primary)">
        <span class="cursor-pointer" @click="handleToErr"> 跳转至错误</span>
      </div>
      <el-table
        :data="tableData"
        class="w-full"
        max-height="500px"
        :row-style="{
          backgroundColor: 'var(--el-fill-color-lighter)',
        }"
      >
        <el-table-column type="index" label="序号" width="55" fixed />
        <el-table-column
          align="center"
          min-width="200px"
          :label="item.label"
          v-for="item in headerList"
        >
          <template #header>
            <span style="color: var(--el-color-danger)" v-if="item.required"
              >*</span
            >
            {{ item.label }}
          </template>
          <template #default="{ row, $index }">
            <div
              :id="`${$index}-${item.prop}`"
              class="value-view"
              :class="
                errArr
                  .find((errItem) => errItem.index === $index)
                  ?.violations?.map((x: any) => x.field)
                  .includes(item.prop)
                  ? 'value-error'
                  : ''
              "
              @mouseenter="
                (e) => {
                  handleTableValueMouseenter(e, item.prop, $index);
                }
              "
              @mousemove="handleTableValueMove(item.prop, $index)"
              @mouseleave="handleTableValueLeave"
            >
              <div v-if="item.belong" class="truncate px-10px">
                {{
                  row[item.belong][
                    item.type === "dict" ? item.valueProp! : item.prop
                  ]
                }}
              </div>
              <div v-else class="truncate px-10px">
                {{ row[item.type === "dict" ? item.valueProp! : item.prop] }}
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="140px">
          <template #default="{ row, $index }">
            <el-button
              size="small"
              type="primary"
              @click="handleEdit(row, $index)"
              text
            >
              修改
            </el-button>
            <el-button
              size="small"
              type="danger"
              @click="handleDelete($index)"
              text
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pt-20px px-20px flex justify-end">
        <el-pagination layout="total" :total="tableData.length" />
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" plain @click="validateVisible = false">
            取消
          </el-button>
          <el-button
            type="primary"
            @click="handleSubmit()"
            :loading="submitLoading"
          >
            提交
          </el-button>
        </span>
      </template>

      <el-tooltip
        ref="tooltipRef"
        :visible="errTipVisible"
        :virtual-ref="buttonRef"
        virtual-triggering
        popper-class="singleton-tooltip"
        :auto-close="1000"
        placement="top"
      >
        <template #content>
          <span> {{ tooltipValue }} </span>
        </template>
      </el-tooltip>
    </el-dialog>

    <!-- 编辑弹窗 -->
    <el-dialog
      v-model="editVisible"
      title="修改"
      width="800px"
      @closed="onDialogClose"
      destroy-on-close
      align-center
    >
      <el-form ref="editFormRef" :model="editForm" label-position="top">
        <el-row :gutter="40">
          <template v-for="item in headerList">
            <el-col :span="item.type !== 'textarea' ? 12 : 24">
              <template v-if="item.belong">
                <el-form-item
                  :label="item.label"
                  :prop="`${item.belong}.${item.prop}`"
                  :rules="formItemRule(item)"
                  :ref="
                    (el) => {
                      tempRefs.push({ prop: `${item.prop}`, el });
                    }
                  "
                >
                  <el-input
                    v-if="!item.type || item.type === 'input'"
                    v-model="editForm[item.belong][item.prop]"
                    :placeholder="`请输入${item.label}`"
                  />
                  <el-input
                    v-else-if="item.type === 'textarea'"
                    type="textarea"
                    v-model="editForm[item.belong][item.prop]"
                    :placeholder="`请输入${item.label}`"
                  />
                  <el-select
                    v-else-if="item.type === 'dict'"
                    v-model="editForm[item.belong][item.prop]"
                    :placeholder="`请选择${item.label}`"
                    class="w-full"
                    @change="(val) => onSelectChange(val, item)"
                    filterable
                  >
                    <el-option
                      v-for="_item in item.option"
                      :key="_item.value"
                      :label="_item.label"
                      :value="_item.value"
                    />
                  </el-select>
                  <el-date-picker
                    v-else-if="item.type === 'year'"
                    v-model="editForm[item.belong][item.prop]"
                    type="year"
                    :disabled-date="item.disabled"
                    :placeholder="`请选择${item.label}`"
                    value-format="YYYY"
                    style="width: 100%"
                  />
                </el-form-item>
              </template>
              <template v-else>
                <el-form-item
                  :label="item.label"
                  :prop="item.prop"
                  :rules="formItemRule(item)"
                  :ref="
                    (el) => {
                      tempRefs.push({ prop: `${item.prop}`, el });
                    }
                  "
                >
                  <el-input
                    v-if="!item.type || item.type === 'input'"
                    v-model="editForm[item.prop]"
                    :placeholder="`请输入${item.label}`"
                  />
                  <el-input
                    v-else-if="item.type === 'textarea'"
                    type="textarea"
                    v-model="editForm[item.prop]"
                    :placeholder="`请输入${item.label}`"
                  />
                  <el-select
                    v-else-if="item.type === 'dict'"
                    v-model="editForm[item.prop]"
                    :placeholder="`请选择${item.label}`"
                    class="w-full"
                    @change="(val) => onSelectChange(val, item)"
                  >
                    <el-option
                      v-for="_item in item.option"
                      :key="_item.value"
                      :label="_item.label"
                      :value="_item.value"
                    />
                  </el-select>
                  <el-date-picker
                    v-else-if="item.type === 'year'"
                    v-model="editForm[item.prop]"
                    type="year"
                    :disabled-date="item.disabled"
                    :placeholder="`请选择${item.label}`"
                    value-format="YYYY"
                    style="width: 100%"
                  />
                </el-form-item>
              </template>
            </el-col>
          </template>
        </el-row>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" plain @click="editVisible = false">
            取消
          </el-button>
          <el-button type="primary" @click="handleEditConfirmClick">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import * as XLSX from "xlsx";
// @ts-ignore
import { cloneDeep } from "lodash-es";

interface HeaderListType {
  // 字段名（中文）
  label: string;
  // 字段名（英文）
  prop: string;
  // 字典选项
  option?: any[];
  // 字典选项的value值
  valueProp?: string;
  // 是否是属于某个属性下的对象属性 比如user.gender
  belong?: string;
  // 是否是必填项
  required?: boolean;
  // 编辑类型
  type?: "input" | "dict" | "textarea" | "year";
  [prop: string]: any;
}

interface Props {
  title: string;
  rules?: any;
  headerList: HeaderListType[];
  // 校验补丁(唯一识别码的校验依赖于其他字段)
  patchRules?: { prop: string; func: Function }[];
}
const props = withDefaults(defineProps<Props>(), {
  title: "导入",
  rules: {},
  headerList: () => [],
  patchRules: () => [],
});

/** 将校验规则从父组件中脱离，方便设置 */
const rules = cloneDeep(props.rules);
onMounted(() => {});

const tempRefs = ref<any[]>([]);
// 为 el-form-item 设置校验规则
const formItemRule = (data: HeaderListType) => {
  if (data.belong) {
    // idNumber的校验规则需要单独处理
    if (data.prop === "idNumber") {
      return [
        // 这里的内容只是为了方便导入组件的校验
        ...getFormItemRule("唯一识别号", 64, 6, true),
        {
          validator: (...args: any[]) =>
            checkIdNumber(editForm.value, true, ...args),
          trigger: ["blur"],
          patch: true,
        },
      ];
    } else {
      return props.rules[`${data.belong}.${data.prop}`];
    }
  } else {
    // idNumber的校验规则需要单独处理
    if (data.prop === "idNumber") {
      return [
        // 这里的内容只是为了方便导入组件的校验
        ...getFormItemRule("唯一识别号", 64, 6, true),
        {
          validator: (...args: any[]) =>
            checkIdNumber(editForm.value, false, ...args),
          trigger: ["blur"],
          patch: true,
        },
      ];
    } else {
      return props.rules[data.prop];
    }
  }
};

const importDialogVisible = ref(false);
const handleImport = () => {
  importDialogVisible.value = true;
};

const uploadRef = ref();
const tableData = ref<any[]>([]);

/** 上传 */
const handleUpload = async () => {
  if (fileList.value.length === 0) {
    return CmeMessage({
      title: "提示",
      message: "请先上传文件",
      type: "warning",
    });
  }
  const fileReader = new FileReader();
  fileReader.readAsArrayBuffer(fileList.value[0].raw);

  fileReader.onerror = () => {
    CmeMessage({
      title: "提示",
      message: "提交失败，请重新上传文件后再提交",
      type: "warning",
    });
  };
  fileReader.onload = (e) => {
    const data = e.target?.result;
    const workbook = XLSX.read(data, { type: "array" });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    // 读取xlsx获得的数组（有非表体的部分）
    const jsonData = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
    }) as any[][];

    // 导入表格的表头数据
    const sheetHeaderList = jsonData[1] as string[];
    // 期望得到的表头数据
    const expectHeaderList = props.headerList.map((item) => item.label);

    if (sheetHeaderList.join(",") !== expectHeaderList.join(",")) {
      return CmeMessage({
        title: "提示",
        message:
          "导入失败，表头（第二行）内容与模板不一致，请确认导入文件是否正确",
        type: "warning",
      });
    }

    // 在这里将超出表头长度的数据截取到表头长度
    let cutForMaxLengthList = jsonData.slice(2).filter((item) => {
      if (item.length > props.headerList.length) {
        return false;
      } else {
        return true;
      }
    });

    // 表体数组（将长度为0的行过滤）
    let bodyData = cutForMaxLengthList.filter(
      (item: any) => item.length !== 0,
    ) as any[][];

    for (let i = 0; i < bodyData.length; i++) {
      let obj = {} as any;
      for (let j = 0; j < props.headerList.length; j++) {
        // 如果设置了值类型（valueType）或者值类型为string，则将值转换为字符串
        if (
          bodyData[i][j] &&
          (!props.headerList[j].valueType ||
            props.headerList[j].valueType === "string")
        ) {
          bodyData[i][j] = String(bodyData[i][j]);
        }

        // 去除信息前后空格
        if (typeof bodyData[i][j] === "string") {
          bodyData[i][j] = bodyData[i][j].trim();
        }

        if (props.headerList[j].belong) {
          if (!obj.hasOwnProperty([props.headerList[j].belong])) {
            obj[props.headerList[j].belong as string] = {};
          }
          if (props.headerList[j].type === "dict") {
            let temp = props.headerList[j].option?.find(
              (item) => item.label === bodyData[i][j],
            );
            obj[props.headerList[j].belong as string][
              props.headerList[j].valueProp!
            ] = bodyData[i][j] && temp ? bodyData[i][j] : "";
            obj[props.headerList[j].belong as string][
              props.headerList[j].prop
            ] = temp ? temp.value : "";
          } else {
            obj[props.headerList[j].belong as string][
              props.headerList[j].prop
            ] = bodyData[i][j] ? bodyData[i][j] : "";
          }
        } else {
          if (props.headerList[j].type === "dict") {
            let temp = props.headerList[j].option?.find(
              (item) => item.label === bodyData[i][j],
            );
            obj[props.headerList[j].valueProp!] =
              bodyData[i][j] && temp ? bodyData[i][j] : "";
            obj[props.headerList[j].prop] = temp ? temp.value : "";
          } else {
            obj[props.headerList[j].prop] = bodyData[i][j]
              ? bodyData[i][j]
              : "";
          }
        }
      }
      bodyData[i] = obj;
    }
    // 将身份证号码中的小x转为大写
    transformIdNumber(bodyData);
    tableData.value = bodyData;
    importDialogVisible.value = false;
    validateVisible.value = true;
  };
};

/** 导入弹窗关闭 */
const onImportClose = () => {
  fileList.value = [];
};

/** 文件列表 */
const fileList = ref<any[]>([]);
/** 文件发生改变 */
const onFileChange = (uploadFile: any, uploadFiles: any) => {
  uploadFile;
  fileList.value = uploadFiles;
};
/** 文件超出数量 */
const onFileExceed = (val: any) => {
  uploadRef.value.clearFiles();
  uploadRef.value.handleStart(val[0]);
};

/** 身份证号转大写 */
const transformIdNumber = (list: any[]) => {
  list = list.map((item) => {
    if (item.idType && item.idType === "1") {
      // 没有嵌套user的情况
      item.idNumber = item.idNumber.toUpperCase();
    } else if (item.user && item.user.idType && item.user.idType === "1") {
      // 嵌套了user的情况
      item.user.idNumber = item.user.idNumber.toUpperCase();
    }
    return item;
  });
};

/**
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 */

const emit = defineEmits(["submit", "download"]);
const handleSubmit = async () => {
  //  handleValidate();
  if (errCount.value === 0) {
    emit("submit", tableData.value);
    // let arr = transformData(tableData.value, props.headerList);
    // emit("submit", arr);
  } else {
    CmeMessage({
      title: "提示",
      message: "请处理完错误后提交",
      type: "warning",
    });
  }
};

type ViolationsItem = {
  field: string;
  message: string;
  [property: string]: any;
};
type ErrItemType = {
  index: number;
  violations: ViolationsItem[];
};
const errCount = ref(0);
const errArr = ref<ErrItemType[]>([]);
const handleValidate = () => {
  errArr.value = clientErrClear(errArr.value);
  let ruleKeys: string[] = Object.keys(rules);
  // 三层for
  // 便利整个列表,进行字段校验
  for (let i = 0; i < tableData.value.length; i++) {
    // 便利每个规则
    for (let j = 0; j < ruleKeys.length; j++) {
      // 便利规则中的规则项（校验规则数组里的每个项）
      for (let k = 0; k < rules[ruleKeys[j]].length; k++) {
        // 当前规则项
        let nowRule = rules[ruleKeys[j]][k];
        // 校验规则的key（name || user.name）
        let tableKey = ruleKeys[j];
        // 当前格的值
        let tableDataValue;
        // 如果有.的话将其拆分为数组并取得最后的值
        if (tableKey.indexOf(".")) {
          tableDataValue = tableKey
            .split(".")
            .reduce((acc, key) => acc && acc[key], tableData.value[i]);
        }
        // 当前行的err对象
        let nowErr = errArr.value.find((item: any) => item.index === i);

        // 临时err对象，用来暂存错误（可能没错，没错为undefined）
        let tempErr;
        if (nowRule.required && !tableDataValue) {
          // 必填
          tempErr = {
            field: tableKey.indexOf(".") ? tableKey.split(".").pop() : tableKey,
            message: nowRule.message,
          };
        } else if (
          (nowRule.min || nowRule.max) &&
          !(nowRule.min <= tableDataValue?.length <= nowRule.max)
        ) {
          // 长度校验
          tempErr = {
            field: tableKey.indexOf(".") ? tableKey.split(".").pop() : tableKey,
            message: nowRule.message,
          };
        } else if (
          nowRule.pattern &&
          nowRule.pattern.test(tableDataValue) === false &&
          tableDataValue !== ""
        ) {
          // 正则校验
          tempErr = {
            field: tableKey.indexOf(".") ? tableKey.split(".").pop() : tableKey,
            message: nowRule.message,
          };
        } else if (nowRule.validator) {
          // 特殊处理idNumber，因为idNumber的校验规则依赖于其他属性
          // TODO 先写死吧，暂时没弄拓展性的校验
          if (tableKey === "idNumber" || tableKey === "user.idNumber") {
            if (tableKey === "idNumber") {
              checkIdNumber(
                tableData.value[i],
                false,
                "",
                tableDataValue,
                (err: Error) => {
                  if (err) {
                    tempErr = {
                      field: tableKey.indexOf(".")
                        ? tableKey.split(".").pop()
                        : tableKey,
                      message: err.message,
                    };
                  }
                },
              );
            } else if (tableKey === "user.idNumber") {
              checkIdNumber(
                tableData.value[i],
                true,
                "",
                tableDataValue,
                (err: Error) => {
                  if (err) {
                    tempErr = {
                      field: tableKey.indexOf(".")
                        ? tableKey.split(".").pop()
                        : tableKey,
                      message: err.message,
                    };
                  }
                },
              );
            }
          } else {
            // 自定义校验
            nowRule.validator("", tableDataValue, (err: Error) => {
              if (err) {
                tempErr = {
                  field: tableKey.indexOf(".")
                    ? tableKey.split(".").pop()
                    : tableKey,
                  message: nowRule.message || err.message,
                };
              }
            });
          }
        }

        // tempErr不为空的话，说明校验不通过
        if (tempErr) {
          // nowErr没有的话就在errArr新增err，有的话就直接在nowErr的violations新增
          if (!nowErr) {
            nowErr = {
              index: i,
              violations: [tempErr as ViolationsItem],
            };
            errArr.value.push(nowErr);
          } else {
            nowErr.violations.push(tempErr as ViolationsItem);
          }
          break;
        }
      }
    }
  }
  repeatValidate("idNumber");
  repeatValidate("phoneNumber");
  repeatValidate("emailAddress");
  repeatValidate("employeeNumber");
  repeatValidate("studentNumber");
};

const onRemove = () => {
  fileList.value = [];
};

const clientErrClear = (arr: any) => {
  let tempArr = JSON.parse(JSON.stringify(arr));
  tempArr = tempArr.map((item: ErrItemType) => {
    item.violations = item.violations.filter(
      (i: ViolationsItem) => i.serverErr,
    );
    return item;
  });
  tempArr = tempArr.filter((item: ErrItemType) => item.violations.length > 0);
  return tempArr;
};

// 重复性校验
const repeatValidate = (val: string) => {
  let headerItem = props.headerList.find((item) => item.prop === val);
  if (!headerItem) {
    // 如果当前导入中没有该字段，则不进行校验
    return;
  }

  let hashMap = new Map();
  // 将每个内容（身份证号）当作key放到map中，value为一个对象，包含内容（身份证号）和所有含有该内容的下标
  for (let i = 0; i < tableData.value.length; i++) {
    if (
      tableData.value[i].user &&
      tableData.value[i].user.hasOwnProperty(val)
    ) {
      // 有user嵌套的情况
      if (tableData.value[i].user[val] === "") continue;
      // 暂存当前的value值
      let tempStr = tableData.value[i].user[val];
      // 将暂存的value值转换为大写用于判断，因为系统中不区分大小写（是字符串才转换）
      let tempStrUp = tempStr;
      if (typeof tempStr === "string") {
        tempStrUp = tempStr.toUpperCase();
      }
      if (hashMap.has(tempStrUp)) {
        // 如果map中已经存在该内容，向map中相应项的indexArr数组中添加当前下标
        let temp = hashMap.get(tempStrUp);
        temp.indexArr.push(i);
        hashMap.set(tempStrUp, temp);
      } else {
        let obj = {
          [val]: tableData.value[i][val],
          indexArr: [i],
        } as { [key: string]: any };
        hashMap.set(tempStrUp, obj);
      }
    } else {
      if (tableData.value[i][val] === "") continue;
      // 暂存当前的value值
      let tempStr = tableData.value[i][val];
      // 将暂存的value值转换为大写用于判断，因为系统中不区分大小写（是字符串才转换）
      let tempStrUp = tempStr;
      if (typeof tempStr === "string") {
        tempStrUp = tempStr.toUpperCase();
      }
      if (hashMap.has(tempStrUp)) {
        // 如果map中已经存在该内容，向map中相应项的indexArr数组中添加当前下标
        let temp = hashMap.get(tempStrUp);
        temp.indexArr.push(i);
        hashMap.set(tempStrUp, temp);
      } else {
        let obj = {
          [val]: tempStrUp,
          indexArr: [i],
        } as { [key: string]: any };
        hashMap.set(tempStrUp, obj);
      }
    }
  }

  // 过滤出有重复内容的（indexArr长度大于1则有重复）
  let tempArr = Array.from(hashMap.values()).filter(
    (i) => i.indexArr.length > 1,
  );

  for (let i = 0; i < tempArr.length; i++) {
    // 遍历重复的行号
    for (let j = 0; j < tempArr[i].indexArr.length; j++) {
      // 判断errArr中是否有重复的行号
      let errRow = errArr.value.find(
        (item) => item.index === tempArr[i].indexArr[j],
      );
      if (errRow) {
        if (!errRow.violations.find((item) => item.field === val)) {
          errRow.violations.push({
            field: val,
            message: `${headerItem.label}重复`,
          });
        }
      } else {
        errArr.value.push({
          index: tempArr[i].indexArr[j],
          violations: [{ field: val, message: `${headerItem.label}重复` }],
        });
      }
    }
  }
};

watch(
  errArr,
  (val) => {
    errCount.value = val
      .map((i) => {
        return i.violations.length;
      })
      .reduce((accumulator, currentValue) => {
        return accumulator + currentValue;
      }, 0);
  },
  {
    deep: true,
  },
);

/** 编辑的dialog */
const editVisible = ref(false);
/**  */
const editForm = ref<any>({});
/**  */
const editIndex = ref<number>(-1);
/**  */
const editFormRef = ref();
/** 编辑 */
const handleEdit = (row: any, $index: number) => {
  editIndex.value = $index;
  editForm.value = JSON.parse(JSON.stringify(row));
  editVisible.value = true;
  nextTick(() => {
    editFormRef.value.validate().catch(() => {});
  });
};
/** 删除 */
const handleDelete = ($index: number) => {
  CmeMessageBox.confirm(`确定删除序号为“${$index + 1}”的数据吗？`, "系统提示", {
    distinguishCancelAndClose: true,
    confirmButtonText: "确定",
    cancelButtonText: "取消",
  })
    .then(() => {
      tableData.value.splice($index, 1);
      errArr.value.splice(
        errArr.value.findIndex((i) => i.index === $index),
        1,
      );
      for (let i = 0; i < errArr.value.length; i++) {
        if (errArr.value[i].index > $index) {
          errArr.value[i].index -= 1;
        }
      }
      handleValidate();
    })
    .catch(() => {});
};
/**  */
const onDialogClose = () => {};
/** 编辑确定 */
const handleEditConfirmClick = () => {
  editFormRef.value
    .validate()
    .then(() => {
      if (editForm.value.idType === "1") {
        editForm.value.idNumber = editForm.value.idNumber.toUpperCase();
      }
      tableData.value.splice(editIndex.value, 1, editForm.value);
      editVisible.value = false;
      let needDelErrIndex = errArr.value.findIndex(
        (i) => i.index === editIndex.value,
      );
      if (needDelErrIndex >= 0) {
        errArr.value.splice(needDelErrIndex, 1);
      }

      editIndex.value = -1;
      handleValidate();
    })
    .catch(() => {});
};

/** 选择改变 */
const onSelectChange = (val: any, item: any) => {
  if (item.belong) {
    editForm.value[item.belong][item.valueProp] = item.option.find(
      (i: any) => i.value === val,
    ).label;
    editFormRef.value.validateField(["user.idNumber"], (valid: boolean) => {
      return valid;
    });
  } else {
    editForm.value[item.valueProp] = item.option.find(
      (i: any) => i.value === val,
    ).label;
    editFormRef.value.validateField(["idNumber"], (valid: boolean) => {
      return valid;
    });
  }
};

/** 校验dialog显示 */
const validateVisible = ref(false);

/** 校验的提交按钮加载 */
const submitLoading = ref(false);

watch(
  () => validateVisible.value,
  () => {
    setTimeout(() => {
      handleValidate();
    }, 0);
  },
);

/** 抛出 */
defineExpose({ submitLoading, validateVisible, errArr });

// watch(validateVisible, () => {
//   console.time("time");
// });
const validateOpened = () => {
  // console.timeEnd("time");
};

const validateClosed = () => {
  errArr.value = [];
  errTipVisible.value = false;
  submitLoading.value = false;
};

/** 单例tooltip相关 */
const buttonRef = ref();
const tooltipRef = ref();
const errTipVisible = ref(false);
const tooltipValue = ref("");
/**
 * @param e
 * @param key 属性键
 * @param $index 行号
 */
const handleTableValueMouseenter = (e: any, key: string, $index: number) => {
  buttonRef.value = e.currentTarget;
  let val = errArr.value.find(
    (errItem) => errItem.index === $index,
  )?.violations;
  if (!val) {
    errTipVisible.value = false;
    return;
  }
  let errItem = val.find((item) => item.field === key);
  if (errItem) {
    tooltipValue.value = errItem.message;
  } else {
    errTipVisible.value = false;
  }
};
/**
 * @param key 属性键
 * @param $index 行号
 */
const handleTableValueMove = (key: string, $index: number) => {
  let val = errArr.value.find(
    (errItem) => errItem.index === $index,
  )?.violations;
  if (!val) return;
  let errItem = val.find((item) => item.field === key);
  if (errItem) {
    tooltipValue.value = errItem.message;
    errTipVisible.value = true;
  } else {
    errTipVisible.value = false;
  }
};
const handleTableValueLeave = () => {
  errTipVisible.value = false;
};

/** 跳转至错误 */
const handleToErr = () => {
  if (errArr.value.length > 0) {
    let tempId = `${errArr.value[0].index}-${errArr.value[0].violations[0].field}`;
    // 假设你想要滚动到id为"bottom"的元素
    const element = document.getElementById(tempId);

    // 使用scrollIntoView方法
    element!.scrollIntoView({
      inline: "center",
    });
  }
};
</script>

<style scoped lang="less">
.value-view {
  @apply flex justify-center items-center w-full bg-white min-h-32px cursor-default;
}

.value-error {
  color: var(--el-color-danger);
  background-color: var(--el-color-danger-light-8);
}

.import-step-container {
  .step-title {
    @apply font-bold;
    font-size: var(--el-font-size-medium);
  }

  .step-content {
    @apply mt-10px p-10px;
    background-color: var(--el-fill-color-lighter);
    border-radius: var(--el-border-radius-base);
    color: var(--el-text-color-secondary);
    .upload-icon {
      @apply flex justify-center items-center;
      color: var(--el-text-color-secondary);
    }
  }
}

::v-deep(.el-upload-dragger) {
  background-color: unset;
  &:hover {
    .upload-icon {
    }
  }
}

::v-deep(tbody tr:last-child td) {
  border-bottom: 1px solid transparent;
}
</style>
