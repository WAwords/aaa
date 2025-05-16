<template>
  <div class="router-page">
    <QueryBar
      :query-params="queryParams"
      @on-search="fetch(1)"
      @on-reset="fetch(1)"
      label-width="70px"
    >
      <template #query-form>
        <el-form-item prop="name" label="姓名" class="prop-name">
          <el-input
            placeholder="请输入用户姓名"
            clearable
            v-model="queryParams.name"
            @keyup.enter="fetch(1)"
          />
        </el-form-item>
        <el-form-item prop="gender" label="性别" class="prop-gender">
          <el-select
            v-model="queryParams.gender"
            placeholder="请选择性别"
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
        <el-form-item prop="idNumber" label="唯一识别号" class="prop-idNumber">
          <el-input
            placeholder="请输入唯一识别号"
            clearable
            v-model.trim="queryParams.idNumber"
            @keyup.enter="fetch(1)"
          />
        </el-form-item>
        <el-form-item
          prop="phoneNumber"
          label="手机号码"
          class="prop-phoneNumber"
        >
          <el-input
            placeholder="请输入手机号码"
            clearable
            v-model.trim="queryParams.phoneNumber"
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
        @click="handleActionCreate"
        v-hasPermi="['system:user:add']"
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
        v-hasPermi="['system:user:add']"
      />
      <el-button type="primary" @click="handleUserExport" plain>
        导出
        <template #icon>
          <Icon icon="ant-design:cloud-download-outlined" size="15px" />
        </template>
      </el-button>
      <el-button
        type="danger"
        @click="handleActionDelete"
        v-hasPermi="['system:user:delete']"
      >
        删除
        <template #icon>
          <Icon icon="ant-design:delete-outlined" size="15px" />
        </template>
      </el-button>
    </ActionBar>

    <el-table
      ref="tableRef"
      v-loading="loading"
      :data="tableData"
      class="w-full"
      @selection-change="onSelectionChange"
      style="height: 100%"
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
        prop="name"
        label="姓名"
        min-width="120px"
        fixed
        show-overflow-tooltip
        v-if="selectedHeader.includes('name')"
      />
      <el-table-column
        prop="genderName"
        label="性别"
        min-width="80px"
        show-overflow-tooltip
        v-if="selectedHeader.includes('genderName')"
        align="center"
      />
      <el-table-column
        prop="idNumber"
        label="唯一识别号"
        min-width="190px"
        v-if="selectedHeader.includes('idNumber')"
        align="center"
      >
        <template #default="{ row }">
          <el-tooltip
            class="box-item"
            effect="dark"
            :content="row.idNumber"
            placement="top"
          >
            {{ idNumberDesensitization(row.idNumber, row.idType) }}
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column
        prop="idType"
        label="识别号类型"
        min-width="110px"
        align="center"
        v-if="selectedHeader.includes('idType')"
      >
        <template #default="{ row }">
          {{ idTypeOption.find((item) => item.value === row.idType)!.label }}
        </template>
      </el-table-column>
      <el-table-column
        prop="phoneNumber"
        label="手机号码"
        min-width="130px"
        v-if="selectedHeader.includes('phoneNumber')"
        align="center"
      >
        <template #default="{ row }">
          <el-tooltip
            class="box-item"
            effect="dark"
            :content="row.phoneNumber"
            placement="top"
          >
            {{ phoneNumberDesensitization(row.phoneNumber) }}
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column
        prop="emailAddress"
        label="邮箱地址"
        min-width="210px"
        v-if="selectedHeader.includes('emailAddress')"
        align="center"
      >
        <template #default="{ row }">
          <el-tooltip
            class="box-item"
            effect="dark"
            :content="row.emailAddress"
            placement="top"
          >
            {{ emailAddressDesensitization(row.emailAddress) }}
          </el-tooltip>
        </template>
      </el-table-column>
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
            v-hasPermi="['system:user:update']"
            text
          >
            修改
          </el-button>
          <el-button
            size="small"
            type="danger"
            @click="onDelete(scope.row)"
            v-hasPermi="['system:user:delete']"
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
      destroy-on-close
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
            <el-form-item label="姓名" prop="name" required class="prop-name">
              <el-input v-model="dialogForm.name" placeholder="请输入姓名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="性别" prop="gender" class="prop-gender">
              <el-select
                v-model="dialogForm.gender"
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
              prop="idNumber"
              :rules="getIdNumberRule"
              ref="idNumberRef"
              required
              class="prop-idNumber"
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
                v-model.trim="dialogForm.idNumber"
                :disabled="dialogType === 'edit'"
                placeholder="请输入唯一识别号"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="识别号类型" prop="idType" class="prop-idType">
              <el-select
                v-model="dialogForm.idType"
                placeholder="请选择识别号类型"
                class="w-full"
                filterable
                @change="
                  dialogFromRef.validateField(
                    ['idNumber'],
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
            <el-form-item
              label="手机号码"
              prop="phoneNumber"
              class="prop-phoneNumber"
            >
              <el-input
                v-model.trim="dialogForm.phoneNumber"
                placeholder="请输入手机号码"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="邮箱地址"
              prop="emailAddress"
              class="prop-emailAddress"
            >
              <el-input
                v-model.trim="dialogForm.emailAddress"
                placeholder="请输入邮箱地址"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="备注" prop="remark" class="prop-remark">
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
  getUserListApi,
  addUserApi,
  editUserApi,
  deleteUsersApi,
  importUsersApi,
} from "@/api/system/management/users";
import {
  GetUserListReqType,
  AddUserType,
  UserListItemType,
} from "@/api/system/management/users";
import { downloadFile } from "@/request/utils/blob";
import {
  idNumberDesensitization,
  phoneNumberDesensitization,
  emailAddressDesensitization,
} from "@/utils/common";

defineOptions({
  name: "SystemManagementUser",
});

const queryParams = ref<GetUserListReqType>({
  pageNumber: 1,
  pageSize: 10,
  name: "",
  gender: "",
  idNumber: "",
  phoneNumber: "",
});
onMounted(() => {
  fetch(1);
});

/** 拉取列表 */
const loading = ref(false);
const totalSize = ref(0);
const tableData = ref<any[]>([]);
const fetch = (i = 0) => {
  loading.value = true;
  if (i !== 0) {
    queryParams.value.pageNumber = i;
  }
  getUserListApi(queryParams.value)
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
const onSelectionChange = (val: UserListItemType[]) => {
  let idList = val.map((item) => item.id);
  selectionIdList.value = idList;
  selectionIds.value = idList.join(",");
};
/** 批量删除 */
const handleActionDelete = () => {
  if (selectionIds.value === "") {
    return CmeMessage({
      title: "提示",
      message: "请选择需要删除的用户",
      type: "warning",
    });
  }
  CmeMessageBox.confirm("确定批量删除用户吗？", "系统提示", {
    distinguishCancelAndClose: true,
    confirmButtonText: "确定",
    cancelButtonText: "取消",
  })
    .then(() => {
      deleteUsersApi(selectionIds.value)
        .then(() => {
          CmeMessage({
            title: "成功",
            message: "删除用户成功",
            type: "success",
          });
          fetch(1);
        })
        .catch(() => {});
    })
    .catch(() => {});
};
/** 操作栏的单个删除 */
const onDelete = (row: UserListItemType) => {
  CmeMessageBox.confirm(`确定删除用户“${row.name}”吗？`, "系统提示", {
    distinguishCancelAndClose: true,
    confirmButtonText: "确定",
    cancelButtonText: "取消",
  })
    .then(() => {
      deleteUsersApi(row.id + "")
        .then(() => {
          CmeMessage({
            title: "成功",
            message: "删除用户成功",
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
const dialogForm = ref<AddUserType>({
  name: "",
  gender: "",
  idNumber: "",
  idType: "1",
  phoneNumber: "",
  emailAddress: "",
  remark: "",
});

const dialogTitle = computed(() => {
  enum DialogTitle {
    "create" = "新增用户",
    "edit" = "修改用户",
  }
  return DialogTitle[dialogType.value];
});
const handleActionCreate = () => {
  dialogType.value = "create";
  dialogFormVisible.value = true;
};
const editId = ref<number>(-1);
const onEdit = (row: UserListItemType) => {
  dialogType.value = "edit";
  dialogFormVisible.value = true;
  // 弹窗赋值，不用nextTick的话会导致表单初始化值不为空
  nextTick(() => {
    Object.keys(dialogForm.value).forEach((key) => {
      dialogForm.value[key] = row[key];
    });
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
        addUserApi(dialogForm.value)
          .then(() => {
            CmeMessage({
              title: "成功",
              message: "新增用户成功",
              type: "success",
            });
            dialogFormVisible.value = false;
            fetch(1);
          })
          .catch(() => {
            dialogSubmitLoading.value = false;
          });
      } else if (dialogType.value === "edit") {
        editUserApi(dialogForm.value, editId.value)
          .then(() => {
            CmeMessage({
              title: "成功",
              message: "修改用户成功",
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
    prop: "remark",
    label: "备注",
  },
]);
const selectedHeader = ref(
  tableHeaderList.value
    .map((item) => item.prop)
    .filter((item) => {
      return !["remark"].includes(item);
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
  if (dialogForm.value.idType === "1") {
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
  } else if (dialogForm.value.idType === "9") {
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

/** 验证 */
const dialogFormRules = {
  name: [...getFormItemRule("姓名", 50, -1, true)],
  idNumber: [
    // 这里的内容只是为了方便导入组件的校验
    { required: true, message: "请输入唯一识别号", trigger: ["change"] },
    ...getFormItemRule("唯一识别号", 64, 6, true),
    {
      validator: (...args: any[]) =>
        checkIdNumber(dialogForm.value, false, ...args),
      trigger: ["blur"],
      patch: true,
    },
  ],
  idType: [
    { required: true, message: "请选择识别号类型", trigger: ["change"] },
  ],
  phoneNumber: [
    {
      pattern: /^1[3456789]\d{9}$/,
      message: "请输入正确的手机号码",
      trigger: ["blur"],
    },
  ],
  emailAddress: [
    ...getFormItemRule("邮箱", 64),
    {
      pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      message: "请输入正确的邮箱",
      trigger: ["blur"],
    },
  ],
  remark: [...getFormItemRule("备注", 100, -1, false)],
};

const importRef = ref();
/** 上传事件 */
const onImport = (val: any) => {
  importRef.value.submitLoading = true;
  importUsersApi(val)
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
  downloadFile("/system/template/files/系统用户导入模板.xlsx", {});
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
  },
  {
    label: "性别",
    prop: "gender",
    option: genderOption,
    valueProp: "genderName",
    type: "dict",
  },
  {
    label: "唯一识别号",
    prop: "idNumber",
    required: true,
  },
  {
    label: "识别号类型",
    prop: "idType",
    required: true,
    option: idTypeOption,
    valueProp: "idTypeName",
    type: "dict",
  },
  {
    label: "手机号码",
    prop: "phoneNumber",
  },
  {
    label: "邮箱地址",
    prop: "emailAddress",
  },
  {
    label: "备注",
    prop: "remark",
    type: "textarea",
  },
];

/** 用户导出（选择导出） */
const handleUserExport = () => {
  if (selectionIds.value) {
    downloadFile("/system/users/export", { userIds: selectionIds.value });
  } else {
    CmeMessage({
      title: "提示",
      message: "请选择需要导出的用户",
      type: "warning",
    });
  }
};
</script>
<style scoped></style>
