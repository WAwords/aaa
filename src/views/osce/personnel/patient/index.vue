<template>
  <QueryBar
    :query-params="queryParams"
    @on-search="fetch(1)"
    @on-reset="fetch(1)"
    label-width="90px"
  >
    <template #query-form>
      <el-form-item prop="标准化病人姓名查询prop" label="姓名">
        <el-input
          placeholder="请输入标准化病人姓名"
          clearable
          v-model.trim="queryParams.标准化病人姓名查询prop"
          style="width: 200px"
          @keyup.enter="fetch(1)"
        />
      </el-form-item>
      <el-form-item prop="标准化病人类型请求查询prop" label="类型">
        <el-input
          placeholder="请输入标准化病人类型"
          clearable
          v-model.trim="queryParams.标准化病人类型请求查询prop"
          style="width: 200px"
          @keyup.enter="fetch(1)"
        />
      </el-form-item>
    </template>
  </QueryBar>

  <ActionBar @on-reload="fetch(1)">
    <el-button type="primary" @click="onActionCreate"> 新增 </el-button>
    <el-button type="danger" @click="onActionDelete"> 删除 </el-button>
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
    <el-table-column type="index" label="序号" width="55" fixed />
    <el-table-column
      prop="列表姓名prop"
      label="姓名"
      width="100px"
      fixed
      show-overflow-tooltip
    />
    <el-table-column prop="列表性别prop" label="性别" show-overflow-tooltip />
    <el-table-column
      prop="列表身份证号码prop"
      label="身份证号码"
      show-overflow-tooltip
    />
    <el-table-column
      prop="列表手机号码prop"
      label="手机号码"
      show-overflow-tooltip
    />
    <el-table-column
      prop="列表邮箱地址prop"
      label="邮箱地址"
      show-overflow-tooltip
    />
    <el-table-column
      prop="列表银行卡号prop"
      label="银行卡号"
      show-overflow-tooltip
    />
    <el-table-column
      prop="列表开户行prop"
      label="开户行"
      show-overflow-tooltip
    />
    <el-table-column
      prop="列表标准化病人类型prop"
      label="标准化病人类型"
      show-overflow-tooltip
    />
    <el-table-column label="操作" fixed="right" width="160px">
      <template #default="scope">
        <el-button size="small" type="primary" @click="onEdit(scope.row)" text>
          修改
        </el-button>
        <el-button size="small" type="danger" @click="onDelete(scope.row)" text>
          删除
        </el-button>
      </template>
    </el-table-column>
  </el-table>

  <PaginationBar
    :current="queryParams.pageNumber"
    :size="queryParams.pageSize"
    :total="totalSize"
    @on-size-change="onSizeChange"
    @on-current-change="onCurrentChange"
  />

  <el-dialog
    v-model="dialogFormVisible"
    :title="dialogTitle"
    width="500px"
    @closed="onDialogClose"
    align-center
  >
    <el-form
      :model="dialogForm"
      label-width="100px"
      ref="dialogFromRef"
      :rules="dialogFormRules"
    >
      <el-form-item label="姓名" prop="标准化病人formprop_姓名">
        <el-input v-model.trim="dialogForm.标准化病人formprop_姓名" clearable />
      </el-form-item>
      <el-form-item label="性别" prop="标准化病人formprop_性别">
        <!-- <el-input v-model.trim="dialogForm.标准化病人formprop_性别" /> -->
        <el-select
          v-model="dialogForm.标准化病人formprop_性别"
          placeholder="请选择性别"
          class="w-full"
          clearable
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
      <el-form-item label="身份证号码" prop="标准化病人formprop_身份证号码">
        <el-input
          v-model.trim="dialogForm.标准化病人formprop_身份证号码"
          clearable
        />
      </el-form-item>
      <el-form-item label="手机号码" prop="标准化病人formprop_手机号码">
        <el-input
          v-model.trim="dialogForm.标准化病人formprop_手机号码"
          clearable
        />
      </el-form-item>
      <el-form-item label="邮箱地址" prop="标准化病人formprop_邮箱地址">
        <el-input
          v-model.trim="dialogForm.标准化病人formprop_邮箱地址"
          clearable
        />
      </el-form-item>
      <el-form-item label="银行卡号" prop="标准化病人formprop_银行卡号">
        <el-input
          v-model.trim="dialogForm.标准化病人formprop_银行卡号"
          clearable
        />
      </el-form-item>
      <el-form-item label="银行卡开户行" prop="标准化病人formprop_银行卡开户行">
        <el-input
          v-model.trim="dialogForm.标准化病人formprop_银行卡开户行"
          clearable
        />
      </el-form-item>
      <el-form-item label="标准病人类型" prop="标准化病人formprop_标准病人类型">
        <el-input
          v-model.trim="dialogForm.标准化病人formprop_标准病人类型"
          clearable
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
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
</template>

<script lang="ts" setup>
import { getFormItemRule } from "@/utils/validate";

const queryParams = ref<any>({
  pageNumber: 1,
  pageSize: 10,
  标准化病人姓名查询prop: "",
  标准化病人类型请求查询prop: "",
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
  // getUserListApi(queryParams.value)
  //   .then((res) => {
  //     totalSize.value = res.totalSize;
  //     tableData.value = res.dataList;
  //     loading.value = false;
  //   })
  //   .catch(() => {
  loading.value = false;
  //   });
};

/** 列表多选 */
const selectionIds = ref<string>("");
const onSelectionChange = (val: any[]) => {
  let idList = val.map((item) => item.id);
  selectionIds.value = idList.join(",");
};
/** actionBar */
const onActionCreate = () => {
  dialogType.value = "create";
  dialogFormVisible.value = true;
};
const onActionDelete = () => {
  if (selectionIds.value === "") {
    return CmeMessage({
      title: "提示",
      message: "请选择需要删除的标准化病人",
      type: "warning",
    });
  }
  CmeMessageBox.confirm("确定批量删除标准化病人吗？", "系统提示", {
    distinguishCancelAndClose: true,
    confirmButtonText: "确定",
    cancelButtonText: "取消",
  })
    .then(() => {
      // deleteUsersApi(selectionIds.value).then(() => {
      //   CmeMessage({
      //     title: "成功",
      //     message: "删除标准化病人成功",
      //     type: "success",
      //   });
      //   fetch(1);
      // });
    })
    .catch(() => {});
};

/** 弹窗控制 */
const dialogFromRef = ref();
const dialogFormVisible = ref(false);
const dialogType = ref<"create" | "edit">("create");
const dialogSubmitLoading = ref(false);
const dialogForm = ref<any>({
  标准化病人formprop_姓名: "",
  标准化病人formprop_性别: "",
  标准化病人formprop_身份证号码: "",
  标准化病人formprop_手机号码: "",
  标准化病人formprop_邮箱地址: "",
  标准化病人formprop_银行卡号: "",
  标准化病人formprop_银行卡开户行: "",
  标准化病人formprop_标准病人类型: "",
});
const dialogTitle = computed(() => {
  enum DialogTitle {
    "create" = "新增标准化病人",
    "edit" = "修改标准化病人",
  }
  return DialogTitle[dialogType.value];
});
const editId = ref<number>(-1);
const onEdit = (row: any) => {
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
const onDelete = (row: any) => {
  CmeMessageBox.confirm(`确定删除标准化病人“${row.name}”吗？`, "系统提示", {
    distinguishCancelAndClose: true,
    confirmButtonText: "确定",
    cancelButtonText: "取消",
  })
    .then(() => {
      // deleteUsersApi(row.id + "").then(() => {
      //   CmeMessage({
      //     title: "成功",
      //     message: "删除标准化病人成功",
      //     type: "success",
      //   });
      //   fetch(1);
      // });
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

/**  */
const onDialogClose = () => {
  dialogSubmitLoading.value = false;
  dialogFromRef.value.resetFields();
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
        // addUserApi(dialogForm.value)
        //   .then(() => {
        //     CmeMessage({
        //       title: "成功",
        //       message: "新增用户成功",
        //       type: "success",
        //     });
        //     dialogFormVisible.value = false;
        //     fetch(1);
        //   })
        //   .catch(() => {
        dialogSubmitLoading.value = false;
        //   });
      } else if (dialogType.value === "edit") {
        // editUserApi(dialogForm.value, editId.value)
        //   .then(() => {
        //     CmeMessage({
        //       title: "成功",
        //       message: "修改用户成功",
        //       type: "success",
        //     });
        //     dialogFormVisible.value = false;
        //     fetch();
        //   })
        //   .catch(() => {
        dialogSubmitLoading.value = false;
        //   });
      }
    })
    .catch(() => {});
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
/** 校验 */
const dialogFormRules = {
  标准化病人formprop_姓名: [
    { required: true, message: "请输入姓名", trigger: ["change"] },
    ...getFormItemRule("姓名", 50, -1, true),
  ],
  标准化病人formprop_身份证号码: [
    { required: true, message: "请输入身份证号码", trigger: ["change"] },
    {
      pattern:
        /^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/,
      message: "请输入正确的身份证号码",
      trigger: ["blur"],
    },
  ],
  标准化病人formprop_手机号码: [
    {
      pattern: /^1[3456789]\d{9}$/,
      message: "请输入正确的手机号码",
      trigger: ["blur"],
    },
  ],
  标准化病人formprop_邮箱地址: [
    {
      pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      message: "请输入正确的邮箱",
      trigger: ["blur"],
    },
    ...getFormItemRule("邮箱", 64),
  ],
  标准化病人formprop_银行卡号: [
    {
      pattern: /^([1-9]{1})(\d{14}|\d{18})$/,
      message: "请输入正确的银行卡号",
      trigger: ["blur"],
    },
  ],
  标准化病人formprop_银行卡开户行: [
    {
      min: 1,
      max: 40,
      message: "银行卡开户行的长度不能超过40个字符",
      trigger: ["change"],
    },
  ],
  标准化病人formprop_标准病人类型: [
    {
      min: 1,
      max: 20,
      message: "标准病人类型的长度不能超过20个字符",
      trigger: ["change"],
    },
  ],
};
</script>

<style></style>
