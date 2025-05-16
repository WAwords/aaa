<template>
  <div class="router-page">
    <QueryBar
      :query-params="queryParams"
      @on-search="fetch(1)"
      @on-reset="fetch(1)"
    >
      <template #query-form>
        <el-form-item prop="name" label="姓名">
          <el-input
            placeholder="请输入考官姓名"
            clearable
            v-model="queryParams.name"
            style="width: 200px"
            @keyup.enter="fetch(1)"
          />
        </el-form-item>
        <el-form-item prop="employeeNumber" label="工号">
          <el-input
            placeholder="请输入考官工号"
            clearable
            v-model.trim="queryParams.employeeNumber"
            style="width: 200px"
            @keyup.enter="fetch(1)"
          />
        </el-form-item>
        <el-form-item prop="department" label="科室">
          <el-input
            placeholder="请输入考官科室"
            clearable
            v-model.trim="queryParams.department"
            style="width: 200px"
            @keyup.enter="fetch(1)"
          />
        </el-form-item>
      </template>
    </QueryBar>

    <ActionBar
      @on-reload="fetch(1)"
      @on-headerchange="onHeaderChange"
      has-filter-btn
      :header-list="tableHeaderList"
      :header-selected="selectedHeader"
    >
      <el-button
        type="primary"
        @click="onActionCreate"
        v-hasPermi="['osce:examiner:add']"
      >
        新增
        <template #icon>
          <Icon icon="ant-design:plus-outlined" size="15px" />
        </template>
      </el-button>
      <Import
        ref="importRef"
        title="导入"
        :rules="dialogFormRules"
        :header-list="headerList"
        @submit="onImport"
        @download="onDownload"
        v-hasPermi="['osce:examiner:add']"
      />
      <el-button type="primary" plain @click="handleExaminerExport">
        导出
        <template #icon>
          <Icon icon="ant-design:cloud-download-outlined" size="15px" />
        </template>
      </el-button>
      <el-button
        type="danger"
        @click="onActionDelete"
        v-hasPermi="['osce:examiner:delete']"
      >
        删除
        <template #icon>
          <Icon
            icon="ant-design:delete-outlined"
            size="15px"
            color="var(--el-button-text-color)"
          />
        </template>
      </el-button>
    </ActionBar>

    <el-table
      ref="tableRef"
      v-loading="loading"
      :data="tableData"
      class="w-full"
      @selection-change="onSelectionChange"
      height="100%"
      stripe
    >
      <template #empty> <el-empty description="暂无数据" /> </template>
      <el-table-column type="selection" width="55" fixed />
      <el-table-column
        type="index"
        label="序号"
        width="55"
        fixed
        align="center"
      />
      <el-table-column
        prop="user.name"
        label="姓名"
        min-width="120px"
        fixed
        show-overflow-tooltip
        v-if="selectedHeader.includes('name')"
      />
      <el-table-column
        prop="user.genderName"
        label="性别"
        min-width="80px"
        show-overflow-tooltip
        align="center"
        v-if="selectedHeader.includes('genderName')"
      />
      <el-table-column
        prop="user.idNumber"
        label="唯一识别号"
        min-width="190px"
        align="center"
        v-if="selectedHeader.includes('idNumber')"
      >
        <template #default="{ row }">
          <el-tooltip
            class="box-item"
            effect="dark"
            :content="row.user.idNumber"
            placement="top"
          >
            {{ idNumberDesensitization(row.user.idNumber, row.user.idType) }}
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column
        prop="user.idType"
        label="识别号类型"
        min-width="110px"
        align="center"
        v-if="selectedHeader.includes('idType')"
      >
        <template #default="{ row }">
          {{
            idTypeOption.find((item) => item.value === row.user.idType)!.label
          }}
        </template>
      </el-table-column>
      <el-table-column
        prop="user.phoneNumber"
        label="手机号码"
        min-width="130px"
        show-overflow-tooltip
        align="center"
        v-if="selectedHeader.includes('phoneNumber')"
      >
        <template #default="{ row }">
          <el-tooltip
            class="box-item"
            effect="dark"
            :content="row.user.phoneNumber"
            placement="top"
          >
            {{ phoneNumberDesensitization(row.user.phoneNumber) }}
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column
        prop="user.emailAddress"
        label="邮箱地址"
        min-width="210px"
        show-overflow-tooltip
        align="center"
        v-if="selectedHeader.includes('emailAddress')"
      >
        <template #default="{ row }">
          <el-tooltip
            class="box-item"
            effect="dark"
            :content="row.user.emailAddress"
            placement="top"
          >
            {{ emailAddressDesensitization(row.user.emailAddress) }}
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column
        prop="employeeNumber"
        label="工号"
        min-width="150px"
        show-overflow-tooltip
        align="center"
        v-if="selectedHeader.includes('employeeNumber')"
      />
      <el-table-column
        prop="department"
        label="科室"
        min-width="150px"
        show-overflow-tooltip
        align="center"
        v-if="selectedHeader.includes('department')"
      />
      <el-table-column
        prop="professionalTitle"
        label="职称"
        min-width="100px"
        show-overflow-tooltip
        align="center"
        v-if="selectedHeader.includes('professionalTitle')"
      />
      <el-table-column
        prop="remark"
        label="备注"
        min-width="210px"
        show-overflow-tooltip
        align="center"
        v-if="selectedHeader.includes('remark')"
      />
      <el-table-column label="操作" fixed="right" width="160px" align="center">
        <template #default="scope">
          <el-button
            size="small"
            type="primary"
            @click="onEdit(scope.row)"
            v-hasPermi="['osce:examiner:update']"
            text
          >
            修改
          </el-button>
          <el-button
            size="small"
            type="danger"
            @click="onDelete(scope.row)"
            v-hasPermi="['osce:examiner:delete']"
            text
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <PaginationBar
      :current="queryParams.pageNumber"
      :size="queryParams.pageSize"
      :total="totalSize"
      :selNum="selectionIdList.length"
      @on-size-change="onSizeChange"
      @on-current-change="onCurrentChange"
    />

    <!-- 弹窗 -->
    <el-dialog
      v-model="dialogFormVisible"
      :title="dialogTitle"
      width="800px"
      @closed="onDialogClose"
      align-center
      :close-on-click-modal="false"
    >
      <el-form
        :model="dialogForm"
        label-width="120px"
        ref="dialogFromRef"
        :rules="dialogFormRules"
        label-position="top"
      >
        <el-row :gutter="40">
          <el-col :span="12">
            <el-form-item label="姓名" prop="user.name" required>
              <el-input
                v-model="dialogForm.user.name"
                placeholder="请输入姓名"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="性别" prop="user.gender">
              <el-select
                v-model="dialogForm.user.gender"
                placeholder="请选择性别"
                class="w-full"
                filterable
              >
                <el-option
                  v-for="item in genderOption"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="唯一识别号"
              prop="user.idNumber"
              :rules="getIdNumberRule"
              ref="idNumberRef"
              required
            >
              <template #label>
                <div class="inline-flex items-center">
                  <el-tooltip
                    content="唯一识别号在识别号类型为其他的情况下，长度6至64位，合法组成包括大小写字母（a-zA-Z）、数字（0-9）、
            下划线（_）、短横（-）、艾特符（@）、英文句点（.）"
                    placement="top"
                    :popper-style="{ maxWidth: '500px' }"
                  >
                    <div class="flex items-center h-full mr-1">
                      <el-icon><WarningFilled /></el-icon>
                    </div>
                  </el-tooltip>
                  唯一识别号
                </div>
              </template>
              <el-input
                v-model.trim="dialogForm.user.idNumber"
                :disabled="dialogType === 'edit'"
                placeholder="请输入唯一识别号"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="识别号类型" prop="user.idType">
              <el-select
                v-model="dialogForm.user.idType"
                placeholder="请选择识别号类型"
                class="w-full"
                filterable
                @change="
                  dialogFromRef.validateField(
                    ['user.idNumber'],
                    (valid: boolean) => {
                      return valid;
                    },
                  )
                "
                :disabled="dialogType === 'edit'"
              >
                <el-option
                  v-for="item in idTypeOption"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="手机号码" prop="user.phoneNumber">
              <el-input
                v-model.trim="dialogForm.user.phoneNumber"
                placeholder="请输入手机号"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="邮箱地址" prop="user.emailAddress">
              <el-input
                v-model.trim="dialogForm.user.emailAddress"
                placeholder="请输入邮箱地址"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="工号" prop="employeeNumber">
              <el-input
                v-model.trim="dialogForm.employeeNumber"
                placeholder="请输入工号"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="科室" prop="department">
              <el-input
                v-model.trim="dialogForm.department"
                placeholder="请输入科室"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="职称" prop="professionalTitle">
              <el-input
                v-model.trim="dialogForm.professionalTitle"
                placeholder="请输入职称"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="备注" prop="remark">
              <el-input
                v-model="dialogForm.remark"
                type="textarea"
                placeholder="请输入备注"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" plain @click="dialogFormVisible = false">
            取消
          </el-button>
          <el-button
            type="primary"
            @click="onDialogSubmit"
            :loading="dialogSubmitLoading"
          >
            提交
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { WarningFilled } from "@element-plus/icons-vue";
import {
  getExaminerListApi,
  addExaminerApi,
  editExaminerApi,
  deleteExaminersApi,
  importExaminerApi,
} from "@/api/osce/personnel/examiner";
import {
  GetExaminerListReqType,
  AddExaminerType,
  ExaminerListItemType,
} from "@/api/osce/personnel/examiner";
import { copyObjectValue } from "@/utils/common";
import { downloadFile } from "@/request/utils/blob";
import {
  idNumberDesensitization,
  phoneNumberDesensitization,
  emailAddressDesensitization,
} from "@/utils/common";
import { getFormItemRule } from "@/utils/validate";

defineOptions({
  name: "OscePersonnelExaminer",
});

/**
 * 字典使用
 */
// import { useDict } from "@/hooks/useDict";
// const { getDictList } = useDict(["gender"]);

const queryParams = ref<GetExaminerListReqType>({
  pageNumber: 1,
  pageSize: 10,
  name: "",
  department: "",
  employeeNumber: "",
});
onMounted(() => {
  fetch(1);
});

/** 拉取列表 */
const loading = ref(true);
const totalSize = ref(0);
const tableData = ref([]);
const fetch = (i = 0) => {
  loading.value = true;
  if (i !== 0) {
    queryParams.value.pageNumber = i;
  }
  getExaminerListApi(queryParams.value)
    .then((res) => {
      totalSize.value = res.totalSize;
      tableData.value = res.dataList;
      loading.value = false;
    })
    .catch(() => {
      loading.value = false;
    });
};
/** 列表多选 */
const selectionIds = ref<string>("");
const selectionIdList = ref<number[]>([]);
const onSelectionChange = (val: ExaminerListItemType[]) => {
  let idList = val.map((item) => item.id);
  selectionIdList.value = idList;
  selectionIds.value = idList.join(",");
};
/** 批量删除 */
const onActionDelete = () => {
  if (selectionIds.value === "") {
    return CmeMessage({
      title: "提示",
      message: "请选择需要删除的考官",
      type: "warning",
    });
  }
  CmeMessageBox.confirm("确定批量删除考官吗？", "系统提示", {
    distinguishCancelAndClose: true,
    confirmButtonText: "确定",
    cancelButtonText: "取消",
  })
    .then(() => {
      deleteExaminersApi(selectionIds.value)
        .then(() => {
          CmeMessage({
            title: "成功",
            message: "删除考官成功",
            type: "success",
          });
          fetch(1);
        })
        .catch(() => {});
    })
    .catch(() => {});
};
/** 操作栏的单个删除 */
const onDelete = (row: ExaminerListItemType) => {
  CmeMessageBox.confirm(`确定删除考官“${row.user.name}”吗？`, "系统提示", {
    distinguishCancelAndClose: true,
    confirmButtonText: "确定",
    cancelButtonText: "取消",
  })
    .then(() => {
      deleteExaminersApi(row.id + "")
        .then(() => {
          CmeMessage({
            title: "成功",
            message: "删除考官成功",
            type: "success",
          });
          fetch(1);
        })
        .catch(() => {});
    })
    .catch(() => {});
};
/** 分页控制 */
const onSizeChange = (i: number) => {
  queryParams.value.pageSize = i;
  fetch(1);
};
const onCurrentChange = (i: number) => {
  queryParams.value.pageNumber = i;
  fetch(i);
};
/** 弹窗控制 */
const dialogFromRef = ref();
const dialogFormVisible = ref(false);
const dialogType = ref<"create" | "edit">("create");
const dialogSubmitLoading = ref(false);
const dialogForm = ref<AddExaminerType>({
  user: {
    name: "",
    gender: "",
    idNumber: "",
    idType: "1",
    phoneNumber: "",
    emailAddress: "",
  },
  employeeNumber: "",
  department: "",
  professionalTitle: "",
  remark: "",
});
const dialogTitle = computed(() => {
  enum DialogTitle {
    "create" = "新增考官",
    "edit" = "修改考官",
  }
  return DialogTitle[dialogType.value];
});
const onActionCreate = () => {
  dialogType.value = "create";
  dialogFormVisible.value = true;
};
const editId = ref<number>(-1);
const onEdit = (row: ExaminerListItemType) => {
  dialogType.value = "edit";
  dialogFormVisible.value = true;
  // 弹窗赋值，不用nextTick的话会导致表单初始化值不为空
  nextTick(() => {
    copyObjectValue(dialogForm.value, row);
    dialogForm.value.user.id = row.user.id;
    editId.value = row.id;
  });
};
/** 弹窗改表单提交 */
const onDialogSubmit = () => {
  if (dialogSubmitLoading.value) {
    return;
  }
  dialogFromRef.value
    .validate()
    .then(() => {
      dialogSubmitLoading.value = true;
      if (dialogType.value === "create") {
        addExaminerApi(dialogForm.value)
          .then(() => {
            CmeMessage({
              title: "成功",
              message: "新增考官成功",
              type: "success",
            });
            dialogFormVisible.value = false;
            fetch(1);
          })
          .catch(() => {
            dialogSubmitLoading.value = false;
          });
      } else if (dialogType.value === "edit") {
        let tempObj = JSON.parse(JSON.stringify(dialogForm.value));
        delete tempObj.user.id;
        editExaminerApi(tempObj, editId.value)
          .then(() => {
            CmeMessage({
              title: "成功",
              message: "修改考官成功",
              type: "success",
            });
            dialogFormVisible.value = false;
            fetch();
          })
          .catch(() => {
            dialogSubmitLoading.value = false;
          });
      }
    })
    .catch(() => {});
};
const onDialogClose = () => {
  dialogSubmitLoading.value = false;
  dialogFromRef.value.resetFields();
  // 因为在编辑时，将userid放到了user对象中，所以需要删除（否则下一次新增会带上这个id）
  delete dialogForm.value.user.id;
};

/** 表头控制 */
const tableHeaderList = ref([
  {
    prop: "name",
    label: "姓名",
  },
  {
    prop: "genderName",
    label: "性别",
  },
  {
    prop: "idNumber",
    label: "唯一识别号",
  },
  {
    prop: "idType",
    label: "识别号类型",
  },
  {
    prop: "phoneNumber",
    label: "手机号码",
  },
  {
    prop: "emailAddress",
    label: "邮箱地址",
  },
  {
    prop: "employeeNumber",
    label: "工号",
  },
  {
    prop: "department",
    label: "科室",
  },
  {
    prop: "professionalTitle",
    label: "职称",
  },
  {
    prop: "remark",
    label: "备注",
  },
]);
const selectedHeader = ref(
  tableHeaderList.value
    .map((item) => item.prop)
    .filter((item) => {
      return ![
        "phoneNumber",
        "idNumber",
        "idType",
        "emailAddress",
        "remark",
      ].includes(item);
    }),
);
const onHeaderChange = (val: string[]) => {
  selectedHeader.value = val;
};

/** 字典 */
const genderOption = [
  {
    value: "1",
    label: "男",
  },
  {
    value: "2",
    label: "女",
  },
];

/** 识别号类型 */
const idTypeOption = [
  {
    value: "1",
    label: "身份证号",
  },
  {
    value: "9",
    label: "其他",
  },
];

const idNumberRef = ref<any>(null);
/** 唯一识别号校验规则 */
const getIdNumberRule = computed(() => {
  // 1-身份证号 9-其他
  if (dialogForm.value.user.idType === "1") {
    // 清除校验
    setTimeout(() => {
      idNumberRef.value.clearValidate();
    }, 0);
    return [
      ...getFormItemRule("唯一识别号", -1, -1, true),
      {
        validator: (rule: any, value: any, callback: any) => {
          rule;
          const reg =
            /^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/;
          if (reg.test(value)) {
            callback();
          } else {
            callback(new Error("请输入正确的身份证号码"));
          }
        },
        trigger: "blur",
        patch: true,
      },
    ];
  } else if (dialogForm.value.user.idType === "9") {
    // 清除校验
    setTimeout(() => {
      idNumberRef.value.clearValidate();
    }, 0);
    return [
      ...getFormItemRule("唯一识别号", 64, 6, true),
      {
        validator: (rule: any, value: any, callback: any) => {
          rule;
          const reg = /^[0-9a-zA-Z_\-@.]*$/;
          if (reg.test(value)) {
            callback();
          } else {
            callback(
              new Error(
                "请使用6至64位字母、数字、下划线、短横、艾特符及英文句点",
              ),
            );
          }
        },
        trigger: "blur",
        patch: true,
      },
    ];
  }
});

/** 验证规则 */
const dialogFormRules = {
  "user.name": [
    ...getFormItemRule({
      label: "姓名",
      max: 50,
      min: -1,
      required: true,
    }),
  ],
  "user.idNumber": [
    // 这里的内容只是为了方便导入组件的校验
    ...getFormItemRule("唯一识别号", 64, 6, true),
    {
      validator: (...args: any[]) =>
        checkIdNumber(dialogForm.value, true, ...args),
      trigger: ["blur"],
      patch: true,
    },
  ],
  "user.idType": [
    { required: true, message: "请选择识别号类型", trigger: ["change"] },
  ],
  "user.phoneNumber": [
    {
      pattern: /^1[3456789]\d{9}$/,
      message: "请输入正确的手机号码",
      trigger: ["blur"],
    },
  ],
  "user.emailAddress": [
    ...getFormItemRule("邮箱", 64),
    {
      pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      message: "请输入正确的邮箱",
      trigger: ["blur"],
    },
  ],
  remark: [...getFormItemRule("备注", 100, -1, false)],
  employeeNumber: [
    ...getFormItemRule("工号", 20, -1, false),
    {
      pattern: /^[\w\-]+$/,
      message: "由数字、字母、短横、下划线组成",
      trigger: ["change"],
    },
  ],
  department: [...getFormItemRule("科室", 20, -1, false)],
  professionalTitle: [...getFormItemRule("职称", 20, -1, false)],
};

const importRef = ref();
/** 上传事件 */
const onImport = (val: any) => {
  importRef.value.submitLoading = true;
  importExaminerApi(val)
    .then(() => {
      importRef.value.validateVisible = false;
      fetch(1);
      CmeMessage({
        title: "成功",
        message: "导入成功",
        type: "success",
      });
    })
    .catch((err) => {
      if (err) {
        let tempErr = err.map((item: any) => {
          let obj = JSON.parse(JSON.stringify(item));
          obj.violations = obj.violations.map((i: any) => {
            let temp = JSON.parse(JSON.stringify(i));
            temp.field =
              temp.field.indexOf(".") > -1 ? i.field.split(".").pop() : i.field;
            temp.serverErr = true;
            return temp;
          });
          return obj;
        });
        importRef.value.errArr = tempErr;

        // 只需要在导入请求失败时取消loading（成功时会关闭弹窗，不需要再这里设置loading）
        importRef.value.submitLoading = false;
      }
    });
};
/** 模板下载 */
const onDownload = () => {
  downloadFile("/osce/template/files/OSCE考官导入模板.xlsx", {});
};

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
const headerList: HeaderListType[] = [
  {
    label: "姓名",
    prop: "name",
    required: true,
    belong: "user",
  },
  {
    label: "性别",
    prop: "gender",
    option: genderOption,
    valueProp: "genderName",
    belong: "user",
    type: "dict",
  },
  {
    label: "唯一识别号",
    prop: "idNumber",
    required: true,
    belong: "user",
  },
  {
    label: "识别号类型",
    prop: "idType",
    required: true,
    option: idTypeOption,
    valueProp: "idTypeName",
    type: "dict",
    belong: "user",
  },
  {
    label: "手机号码",
    prop: "phoneNumber",
    belong: "user",
  },
  {
    label: "邮箱地址",
    prop: "emailAddress",
    belong: "user",
  },
  {
    label: "工号",
    prop: "employeeNumber",
  },
  {
    label: "科室",
    prop: "department",
  },
  {
    label: "职称",
    prop: "professionalTitle",
  },
  {
    label: "备注",
    prop: "remark",
    type: "textarea",
  },
];

/** 考官导出（选择导出） */
const handleExaminerExport = () => {
  if (selectionIds.value) {
    downloadFile("/osce/examiners/export", {
      examinerIds: selectionIds.value,
    });
  } else {
    CmeMessage({
      title: "提示",
      message: "请选择需要导出的考官",
      type: "warning",
    });
  }
};
</script>

<style scoped></style>
