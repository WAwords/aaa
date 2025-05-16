<template>
  <div class="router-page">
    <QueryBar
      :query-params="queryParams"
      @on-search="fetch(1)"
      @on-reset="fetch(1)"
      labelWidth="50px"
    >
      <template #query-form>
        <el-form-item prop="name" label="姓名">
          <el-input
            placeholder="请输入考生姓名"
            clearable
            v-model="queryParams.name"
            style="width: 200px"
            @keyup.enter="fetch(1)"
          />
        </el-form-item>
        <el-form-item prop="major" label="专业">
          <el-input
            placeholder="请输入考生专业"
            clearable
            v-model.trim="queryParams.major"
            style="width: 200px"
            @keyup.enter="fetch(1)"
          />
        </el-form-item>
        <el-form-item prop="grade" label="年级">
          <el-date-picker
            v-model="queryParams.grade"
            type="year"
            placeholder="请选择年级"
            value-format="YYYY"
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item prop="studentNumber" label="学号">
          <el-input
            placeholder="请输入考生学号"
            clearable
            v-model.trim="queryParams.studentNumber"
            style="width: 200px"
            @keyup.enter="fetch(1)"
          />
        </el-form-item>
        <el-form-item prop="examineeGroupId" label="考生组">
          <el-select
            v-model="queryParams.examineeGroupId"
            placeholder="请选择考生组"
            style="width: 200px"
            :loading="selectGroupLoading"
            @visible-change="(val) => (val ? fetchExamineeGroupOption() : null)"
            filterable
          >
            <el-option
              v-for="item in examineeGroupOption"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
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
        v-hasPermi="['osce:examinee:add']"
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
        v-hasPermi="['osce:examinee:add']"
      />
      <el-button type="primary" plain @click="handleExamineeExport">
        导出
        <template #icon>
          <Icon icon="ant-design:cloud-download-outlined" size="15px" />
        </template>
      </el-button>
      <el-button
        type="danger"
        @click="onActionDelete"
        v-hasPermi="['osce:examinee:delete']"
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
        prop="studentNumber"
        label="学号"
        min-width="150px"
        show-overflow-tooltip
        align="center"
        v-if="selectedHeader.includes('studentNumber')"
      />
      <el-table-column
        prop="college"
        label="院系"
        min-width="150px"
        show-overflow-tooltip
        align="center"
        v-if="selectedHeader.includes('college')"
      />
      <el-table-column
        prop="major"
        label="专业"
        min-width="150px"
        show-overflow-tooltip
        align="center"
        v-if="selectedHeader.includes('major')"
      />
      <el-table-column
        prop="grade"
        label="年级"
        min-width="80px"
        show-overflow-tooltip
        align="center"
        v-if="selectedHeader.includes('grade')"
      />
      <el-table-column
        prop="className"
        label="班级"
        min-width="230px"
        show-overflow-tooltip
        align="center"
        v-if="selectedHeader.includes('className')"
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
            v-hasPermi="['osce:examinee:update']"
            text
          >
            修改
          </el-button>
          <el-button
            size="small"
            type="danger"
            @click="onDelete(scope.row)"
            v-hasPermi="['osce:examinee:delete']"
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
          <!-- 姓名 -->
          <el-col :span="12">
            <el-form-item label="姓名" prop="user.name">
              <el-input
                v-model="dialogForm.user.name"
                placeholder="请输入姓名"
              />
            </el-form-item>
          </el-col>
          <!-- 性别 -->
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
          <!-- 唯一识别号 -->
          <el-col :span="12">
            <el-form-item label="唯一识别号" prop="user.idNumber">
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
          <!-- 识别号类型 -->
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
          <!-- 手机号码 -->
          <el-col :span="12">
            <el-form-item label="手机号码" prop="user.phoneNumber">
              <el-input
                v-model.trim="dialogForm.user.phoneNumber"
                placeholder="请输入手机号码"
              />
            </el-form-item>
          </el-col>
          <!-- 邮箱地址 -->
          <el-col :span="12">
            <el-form-item label="邮箱地址" prop="user.emailAddress">
              <el-input
                v-model.trim="dialogForm.user.emailAddress"
                placeholder="请输入邮箱地址"
              />
            </el-form-item>
          </el-col>
          <!-- 学号 -->
          <el-col :span="12">
            <el-form-item label="学号" prop="studentNumber">
              <el-input
                v-model.trim="dialogForm.studentNumber"
                placeholder="请输入学号"
              />
            </el-form-item>
          </el-col>
          <!-- 院系 -->
          <el-col :span="12">
            <el-form-item label="院系" prop="college">
              <el-input
                v-model.trim="dialogForm.college"
                placeholder="请输入院系"
              />
            </el-form-item>
          </el-col>
          <!-- 专业 -->
          <el-col :span="12">
            <el-form-item label="专业" prop="major">
              <el-input
                v-model.trim="dialogForm.major"
                placeholder="请输入专业"
              />
            </el-form-item>
          </el-col>
          <!-- 年级 -->
          <el-col :span="12">
            <el-form-item label="年级" prop="grade">
              <el-date-picker
                v-model="dialogForm.grade"
                type="year"
                placeholder="请选择年级"
                value-format="YYYY"
                :disabled-date="setDisabledDate"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <!-- 班级 -->
          <el-col :span="12">
            <el-form-item label="班级" prop="className">
              <el-input
                v-model.trim="dialogForm.className"
                placeholder="请输入班级"
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
  getExamineeListApi,
  addExamineeApi,
  editExamineeApi,
  deleteExamineesApi,
  importExamineeApi,
} from "@/api/osce/personnel/examinee";
import {
  GetExamineeListReqType,
  AddExamineeType,
  ExamineeListItemType,
} from "@/api/osce/personnel/examinee";
import { getGroupListApi } from "@/api/osce/personnel/group";
import { copyObjectValue } from "@/utils/common";
import { downloadFile } from "@/request/utils/blob";
import {
  idNumberDesensitization,
  phoneNumberDesensitization,
  emailAddressDesensitization,
} from "@/utils/common";
import { getFormItemRule } from "@/utils/validate";

defineOptions({
  name: "OscePersonnelExaminee",
});

const queryParams = ref<GetExamineeListReqType>({
  pageNumber: 1,
  pageSize: 10,
  name: "",
  major: "",
  grade: "",
  studentNumber: "",
  examineeGroupId: undefined,
});
onMounted(() => {
  fetch(1);
});

/**
 * 拉取列表
 */
const loading = ref(true);
const totalSize = ref(0);
const tableData = ref([]);
const fetch = (i = 0) => {
  loading.value = true;
  if (i !== 0) {
    queryParams.value.pageNumber = i;
  }
  getExamineeListApi(queryParams.value)
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
 * 列表多选
 */
const selectionIds = ref<string>("");
const selectionIdList = ref<number[]>([]);
const onSelectionChange = (val: ExamineeListItemType[]) => {
  let idList = val.map((item) => item.id);
  selectionIdList.value = idList;
  selectionIds.value = idList.join(",");
};
/**
 * 批量删除
 */
const onActionDelete = () => {
  if (selectionIds.value === "") {
    return CmeMessage({
      title: "提示",
      message: "请选择需要删除的考生",
      type: "warning",
    });
  }
  CmeMessageBox.confirm("确定批量删除考生吗？", "系统提示", {
    distinguishCancelAndClose: true,
    confirmButtonText: "确定",
    cancelButtonText: "取消",
  })
    .then(() => {
      deleteExamineesApi(selectionIds.value)
        .then(() => {
          CmeMessage({
            title: "成功",
            message: "删除考生成功",
            type: "success",
          });
          fetch(1);
        })
        .catch(() => {});
    })
    .catch(() => {});
};
/**
 * 操作栏的单个删除
 */
const onDelete = (row: ExamineeListItemType) => {
  CmeMessageBox.confirm(`确定删除考生“${row.user.name}”吗？`, "系统提示", {
    distinguishCancelAndClose: true,
    confirmButtonText: "确定",
    cancelButtonText: "取消",
  })
    .then(() => {
      deleteExamineesApi(row.id + "")
        .then(() => {
          CmeMessage({
            title: "成功",
            message: "删除考生成功",
            type: "success",
          });
          fetch(1);
        })
        .catch(() => {});
    })
    .catch(() => {});
};
/**
 * 分页控制
 */
const onSizeChange = (i: number) => {
  queryParams.value.pageSize = i;
  fetch(1);
};
const onCurrentChange = (i: number) => {
  queryParams.value.pageNumber = i;
  fetch(i);
};
/**
 * 弹窗控制
 */
const dialogFromRef = ref();
const dialogFormVisible = ref(false);
const dialogType = ref<"create" | "edit">("create");
const dialogSubmitLoading = ref(false);
const dialogForm = ref<AddExamineeType>({
  user: {
    name: "",
    gender: "",
    idNumber: "",
    idType: "1",
    phoneNumber: "",
    emailAddress: "",
  },
  studentNumber: "",
  college: "",
  major: "",
  grade: "",
  className: "",
  remark: "",
});
const dialogTitle = computed(() => {
  enum DialogTitle {
    "create" = "新增考生",
    "edit" = "修改考生",
  }
  return DialogTitle[dialogType.value];
});
const onActionCreate = () => {
  dialogType.value = "create";
  dialogFormVisible.value = true;
};
const editId = ref<number>(-1);
const onEdit = (row: ExamineeListItemType) => {
  dialogType.value = "edit";
  dialogFormVisible.value = true;
  // 弹窗赋值，不用nextTick的话会导致表单初始化值不为空
  nextTick(() => {
    copyObjectValue(dialogForm.value, row);
    dialogForm.value.user.id = row.user.id;
    editId.value = row.id;
  });
};
/**
 * 弹窗改表单提交
 */
const onDialogSubmit = () => {
  if (dialogSubmitLoading.value) {
    return;
  }
  dialogFromRef.value
    .validate()
    .then(() => {
      dialogSubmitLoading.value = true;
      if (dialogType.value === "create") {
        addExamineeApi(dialogForm.value)
          .then(() => {
            CmeMessage({
              title: "成功",
              message: "新增考生成功",
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
        editExamineeApi(tempObj, editId.value)
          .then(() => {
            CmeMessage({
              title: "成功",
              message: "修改考生成功",
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
    prop: "studentNumber",
    label: "学号",
  },
  {
    prop: "college",
    label: "院系",
  },
  {
    prop: "major",
    label: "专业",
  },
  {
    prop: "grade",
    label: "年级",
  },
  {
    prop: "className",
    label: "班级",
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

/**
 * 字典
 */
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

/** 设置不可选年份 */
const setDisabledDate = (time: Date) => {
  time;
  // return time.getTime() > Date.now();
  return false;
};
/**
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * 考生组选择列表获取
 */
const selectGroupLoading = ref(false);
const examineeGroupOption = ref<any[]>([]);
const fetchExamineeGroupOption = () => {
  selectGroupLoading.value = true;
  getGroupListApi({})
    .then((res) => {
      examineeGroupOption.value = res.dataList;
      selectGroupLoading.value = false;
    })
    .catch(() => {
      selectGroupLoading.value = false;
    });
};
/** 验证规则 */
const dialogFormRules = {
  "user.name": [...getFormItemRule("姓名", 50, -1, true)],
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
  "user.idType": [...getFormItemRule("识别号类型", -1, -1, true)],
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
  studentNumber: [
    ...getFormItemRule("学号", 20, -1, false),
    {
      pattern: /^[\w\-]+$/,
      message: "由数字、字母、短横、下划线组成",
      trigger: ["blur"],
    },
  ],
  college: [...getFormItemRule("院系", 20, -1, false)],
  major: [...getFormItemRule("专业", 20, -1, false)],
  className: [...getFormItemRule("班级", 20, -1, false)],
};

const importRef = ref();
/** 上传事件 */
const onImport = (val: any) => {
  importRef.value.submitLoading = true;
  importExamineeApi(val)
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
    });
};
/** 模板下载 */
const onDownload = () => {
  downloadFile("/osce/template/files/OSCE考生导入模板.xlsx", {});
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
    label: "学号",
    prop: "studentNumber",
  },
  {
    label: "院系",
    prop: "college",
  },
  {
    label: "专业",
    prop: "major",
  },
  {
    label: "年级",
    prop: "grade",
    type: "year",
    disabled: setDisabledDate,
  },
  {
    label: "班级",
    prop: "className",
  },
  {
    label: "备注",
    prop: "remark",
    type: "textarea",
  },
];

/** 考生导出（选择导出） */
const handleExamineeExport = () => {
  if (selectionIds.value) {
    downloadFile("/osce/examinees/export", {
      examineeIds: selectionIds.value,
    });
  } else {
    CmeMessage({
      title: "提示",
      message: "请选择需要导出的考生",
      type: "warning",
    });
  }
};
</script>
<style scoped></style>
