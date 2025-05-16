<template>
  <div class="h-600px flex flex-col" id="management-examinee-concern-container">
    <QueryBar
      :query-params="queryParams"
      @on-search="onSearch()"
      @on-reset="onSearch()"
      class="management-examinee-concern"
    >
      <template #query-form>
        <el-form-item prop="name" label="姓名">
          <el-input
            placeholder="请输入考生姓名"
            clearable
            v-model="queryParams.name"
            style="width: 200px"
            @keyup.enter="onSearch()"
          />
        </el-form-item>
        <el-form-item prop="major" label="专业">
          <el-input
            placeholder="请输入考生专业"
            clearable
            v-model="queryParams.major"
            style="width: 200px"
            @keyup.enter="onSearch()"
          />
        </el-form-item>
        <el-form-item prop="grade" label="年级">
          <el-date-picker
            v-model="queryParams.grade"
            type="year"
            placeholder="请选择年级"
            value-format="YYYY"
            style="width: 200px"
            @change="onGradeChange"
          />
        </el-form-item>
      </template>
    </QueryBar>

    <ActionBar
      @on-reload="fetch()"
      class="management-examinee-concern"
      @on-headerchange="onHeaderChange"
      has-filter-btn
      :header-list="tableHeaderList"
      :header-selected="selectedHeader"
    >
      <el-button type="primary" @click="onActionModify">
        选择考生
        <template #icon>
          <Icon
            icon="ant-design:inbox-outlined"
            size="15px"
            color="var(--el-button-text-color)"
          />
        </template>
      </el-button>
      <el-button type="danger" @click="onActionDelete">
        移除考生
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
      class="w-full drag-table-container"
      :data="tableDataTemp"
      @selection-change="onSelectionChange"
      v-loading="loading"
      row-class-name="can-drag hover-tag"
      row-key="id"
      stripe
      style="height: 100%"
    >
      <template #empty> <el-empty description="暂无数据" /> </template>
      <el-table-column
        type="selection"
        width="55"
        fixed
        class-name="fixed-col"
      />
      <el-table-column
        label="序号"
        width="55"
        fixed
        align="center"
        class-name="fixed-col"
      >
        <template #default="{ row }">
          <div>
            {{ customIndex(row) }}
          </div>
        </template>
      </el-table-column>
      <el-table-column
        prop="user.name"
        label="姓名"
        min-width="150px"
        fixed
        class-name="fixed-col"
        v-if="selectedHeader.includes('name')"
      >
        <template #default="{ row }">
          <div class="flex justify-between">
            <div class="overflow-hidden flex items-center">
              <el-tooltip
                effect="dark"
                :content="row.user.name"
                placement="top"
              >
                <div class="w-full truncate cursor-default">
                  {{ row.user.name }}
                </div>
              </el-tooltip>
            </div>
            <div
              class="drag-handle flex-none"
              v-if="searchTemp.length === tableData.length"
            >
              <el-icon
                ><Icon
                  icon="ant-design:drag-outlined"
                  color="var(--el-color-primary)"
              /></el-icon>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="排序" align="center">
        <template #default="{ row }"> {{ rowSortSet(row) }}</template>
      </el-table-column>
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
        show-overflow-tooltip
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
      <el-table-column
        label="操作"
        fixed="right"
        width="160px"
        align="center"
        class-name="fixed-col"
      >
        <template #default="{ row }">
          <el-button size="small" type="primary" @click="handleMove(row)">
            移动
          </el-button>
          <el-button size="small" type="danger" @click="handleDelete(row)">
            移除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="flex justify-end mt-20px management-examinee-concern">
      <el-pagination
        v-model:current-page="pagination.pageNumber"
        v-model:page-size="pagination.pageSize"
        :page-sizes="[10, 50, 100, 150, 200]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="totalSizeCustom"
      />
    </div>

    <Transfer
      v-model:dialogVisible="dialogVisible"
      v-model:table-data="tableData"
      :examination-id="examinationId"
    />

    <div class="footer-wrapper">
      <div class="footer-left">
        <el-button type="primary" plain @click="editorVisible = false">
          取消
        </el-button>
        <el-button type="primary" plain @click="handleBack">上一步</el-button>
      </div>
      <div class="footer-right">
        <el-button type="primary" @click="handleSave" :loading="saveLoading">
          保存
        </el-button>
        <el-button type="primary" @click="handleNext" :loading="nextLoading">
          下一步
        </el-button>
      </div>
    </div>

    <el-dialog
      v-model="moveVisible"
      title="移动排序"
      width="400px"
      align-center
      @closed="onMoveDialogClosed"
    >
      <el-form
        :model="moveForm"
        ref="moveFromRef"
        :rules="moveFormRules"
        @submit.prevent
        label-position="top"
      >
        <div class="mb-20px">
          {{ moveTipText }}
        </div>
        <el-form-item label="移动到" prop="sort">
          <el-select
            v-model="moveForm.sort"
            placeholder="请选择移动到的序号"
            class="w-full"
            clearable
            filterable
          >
            <el-option
              v-for="i in moveOptions"
              :key="i"
              :label="i"
              :value="i"
              :disabled="moveOptionsDisabled(i)"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button type="primary" plain @click="moveVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="handleMoveConfirm"> 确定 </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import Sortable from "sortablejs";
import { useExamEditorState } from "../examEditorState";
import Transfer from "./Transfer.vue";
import {
  getExamineeListApi,
  modifyExamineeApi,
} from "@/api/osce/exam/management";
import {
  GetExamineeListReqType,
  ExamineeListItemType,
} from "@/api/osce/exam/management";
import {
  idNumberDesensitization,
  phoneNumberDesensitization,
  emailAddressDesensitization,
} from "@/utils/common";

const {
  examinationId,
  serverStep,
  activeComIndex,
  dialogVisible: editorVisible,
  updateExamMsg,
} = useExamEditorState();

const queryParams = ref<GetExamineeListReqType>({
  name: "",
  major: "",
  grade: "",
});
onMounted(async () => {
  if (serverStep.value! >= 2) {
    await fetch();
  }
  setSortable();
});

/** 拉取列表 */
const loading = ref(false);
const totalSize = ref(0);
const tableData = ref<ExamineeListItemType[]>([]);
const fetch = async () => {
  loading.value = true;
  await getExamineeListApi({}, examinationId.value!)
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
const selectIdArr = ref<number[]>([]);
const onSelectionChange = (val: ExamineeListItemType[]) => {
  let idList = val.map((item) => item.id);
  selectIdArr.value = idList;
  selectionIds.value = idList.join(",");
};
/** 批量移除 */
const onActionDelete = () => {
  if (selectionIds.value === "") {
    return CmeMessage({
      title: "提示",
      message: "请选择需要移除的考生",
      type: "warning",
    });
  }
  CmeMessageBox.confirm("确定批量移除考生吗？", "系统提示", {
    distinguishCancelAndClose: true,
    confirmButtonText: "确定",
    cancelButtonText: "取消",
  })
    .then(() => {
      let arr = tableData.value.filter((item: ExamineeListItemType) => {
        return !selectIdArr.value.includes(item.id);
      });
      tableData.value = arr;
    })
    .catch(() => {});
};
/** 操作栏的单个移除 */
const handleDelete = (row: ExamineeListItemType) => {
  CmeMessageBox.confirm(`确定移除考生“${row.user.name}”吗？`, "系统提示", {
    distinguishCancelAndClose: true,
    confirmButtonText: "确定",
    cancelButtonText: "取消",
  })
    .then(() => {
      let arr = tableData.value.filter((item: ExamineeListItemType) => {
        return row.id !== item.id;
      });
      tableData.value = arr;
    })
    .catch(() => {});
};

/** 弹窗控制 */
const dialogVisible = ref(false);
const onActionModify = () => {
  dialogVisible.value = true;
};

/** 分页 */
const totalSizeCustom = computed(() => {
  // 将搜索后的列表作为分页的依据
  return searchTemp.value.length;
});
const pagination = ref({
  pageNumber: 1,
  pageSize: 10,
});
const tableDataTemp = computed(() => {
  return searchTemp.value.slice(
    (pagination.value.pageNumber - 1) * pagination.value.pageSize,
    pagination.value.pageNumber * pagination.value.pageSize,
  );
});

/** 搜索后的暂存列表 */
const searchTemp = ref<any[]>([]);
watch(
  () => tableData.value,
  (newVal) => {
    searchTemp.value = newVal.filter((item: any) => {
      return (
        item.user.name.includes(queryParams.value.name) &&
        item.major.includes(queryParams.value.major) &&
        item.grade.includes(queryParams.value.grade)
      );
    });
  },
  { deep: true },
);

/** 前端搜索 */
const onSearch = () => {
  let tempArr = tableData.value.filter((item: any) => {
    return (
      item.user.name.includes(queryParams.value.name?.trim()) &&
      item.major.includes(queryParams.value.major?.trim()) &&
      item.grade.includes(queryParams.value.grade)
    );
  });
  searchTemp.value = tempArr;
};

/** 年级改变 */
const onGradeChange = (val: any) => {
  if (val === null) {
    // 解决清空年级时是将年级置为null
    queryParams.value.grade = "";
  }
};

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

/** 上一步按钮 */
const handleBack = () => {
  CmeMessageBox.confirm(
    `返回上一步前请先保存信息，确定返回上一步吗？`,
    "系统提示",
    {
      distinguishCancelAndClose: true,
      confirmButtonText: "确定",
      cancelButtonText: "取消",
    },
  )
    .then(() => {
      activeComIndex.value!--;
    })
    .catch(() => {});
};

const saveLoading = ref(false);
/** 保存按钮 */
const handleSave = async () => {
  saveLoading.value = true;
  let tag = await save();
  if (!tag) {
    saveLoading.value = false;
    return;
  }
  await updateExamMsg();
  saveLoading.value = false;
};

const nextLoading = ref(false);
/** 下一步按钮 */
const handleNext = async () => {
  nextLoading.value = true;
  let tag = await save();
  if (!tag) {
    nextLoading.value = false;
    return;
  }
  await updateExamMsg();
  activeComIndex.value!++;
  nextLoading.value = false;
};

/** 保存 */
const save = async () => {
  let tag = true;
  if (tableData.value.length === 0) {
    CmeMessage({
      title: "提示",
      message: "请选择考生",
      type: "warning",
    });
    tag = false;
    return tag;
  }
  let examineeId = tableData.value.map((item) => item.id);
  let obj = {
    examineeIds: examineeId.join(","),
  };
  await modifyExamineeApi(obj, examinationId.value!)
    .then(() => {
      CmeMessage({
        title: "成功",
        message: "保存成功",
        type: "success",
      });
    })
    .catch(() => {
      tag = false;
    });
  return tag;
};

/**
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * 下方为0.2.0固定模式的内容
 */

/** 自定义序号（解决拖动排序后序号混乱） */
const customIndex = (row: any) => {
  return tableDataTemp.value.indexOf(row) + 1;
};

/** 初始化拖拽 */
const setSortable = () => {
  nextTick(() => {
    const el = document.querySelector(
      ".drag-table-container tbody",
    ) as HTMLElement;
    new Sortable(el as HTMLElement, {
      animation: 150,
      draggable: ".can-drag",
      handle: ".drag-handle",
      filter: ".filtered",
      // swap: true,
      // multiDrag: false,
      // swapClass: "highlight",
      dragClass: "sortable-drag",
      onUpdate: function (evt: any) {
        let pageNumber = pagination.value.pageNumber;
        let pageSize = pagination.value.pageSize;

        let oldIndex = (pageNumber - 1) * pageSize + evt.oldIndex;
        let newIndex = (pageNumber - 1) * pageSize + evt.newIndex;
        let temp = tableData.value.splice(oldIndex, 1);
        tableData.value.splice(newIndex, 0, temp[0]);

        tableDomReFresh();
      },
      onStart() {
        const tableElement = document.querySelectorAll(
          ".drag-table-container.el-table .can-drag",
        );
        tableElement.forEach((item) => {
          item.classList.remove("hover-tag");
        });
      },
      onEnd() {
        const tableElement = document.querySelectorAll(
          ".drag-table-container.el-table .can-drag",
        );
        tableElement.forEach((item) => {
          item.classList.add("hover-tag");
        });
      },
    });
  });
};

/** 列表数据id数组 */
const tableDataIdArr = computed(() => {
  return tableData.value.map((item) => {
    return item.id;
  });
});

/** 排序序号设置 */
const rowSortSet = (row: any) => {
  return tableDataIdArr.value.indexOf(row.id) + 1;
};

/** 移动考生row */
const moveRow = ref<any>({});

/** 移动排序 */
const handleMove = (row: any) => {
  moveRow.value = JSON.parse(JSON.stringify(row));
  moveTipText.value = `当前考生为 “${row.user.name}”，排序为 “${rowSortSet(
    row,
  )}”`;
  moveVisible.value = true;
};

/** 移动排序弹窗的提示文字 */
const moveTipText = ref("");

/** 移动顺序的弹窗显示状态 */
const moveVisible = ref(false);

/** 移动排序弹窗form */
const moveForm = ref<{ sort?: number }>({
  sort: undefined,
});

/** 移动排序的禁选项 */
const moveOptionsDisabled = (i: number) => {
  if (moveRow) {
    return i === rowSortSet(moveRow.value);
  } else {
    return false;
  }
};

const moveFromRef = ref();
/** 确定移动排序 */
const handleMoveConfirm = () => {
  moveFromRef.value
    .validate()
    .then(() => {
      // 排序-1才是index
      const oldIndex = rowSortSet(moveRow.value) - 1;
      const newIndex = moveForm.value.sort! - 1;
      let temp = tableData.value.splice(oldIndex, 1);
      tableData.value.splice(newIndex, 0, temp[0]);
      moveVisible.value = false;

      tableDomReFresh();
    })
    .catch(() => {});
};

/** 刷新table的界面展示 */
const tableDomReFresh = () => {
  loading.value = true;
  let temp = JSON.parse(JSON.stringify(tableData.value));
  setTimeout(() => {
    tableData.value = [];
    setTimeout(() => {
      tableData.value = temp;
      loading.value = false;
    }, 0);
  }, 0);
};

/** 移动编辑框关闭 */
const onMoveDialogClosed = () => {
  moveRow.value = {};
  moveFromRef.value.resetFields();
};

/** 移动的可选列表 */
const moveOptions = computed(() => {
  let tempArr = [];
  for (let i = 1; i <= tableData.value.length; i++) {
    tempArr.push(i);
  }
  return tempArr;
});

/** moveFormRules */
const moveFormRules = {
  sort: {
    required: true,
    message: "请选择移动到的序号",
    trigger: ["change"],
  },
};
</script>

<style lang="less" scoped>
// 拖拽按钮
.drag-handle {
  @apply w-23px h-23px flex justify-center items-center cursor-move;
  visibility: hidden;
  background-color: var(--el-color-primary-light-9);
  border-radius: var(--el-border-radius-small);
}

.hover-tag:hover {
  .drag-handle {
    visibility: visible;
  }
}

// 底部操作栏
.footer-wrapper {
  @apply flex justify-between items-center mt-20px;
  .footer-left {
  }
  .footer-right {
  }
  .el-button {
    @apply w-100px;
  }
}

.query-bar {
  .el-form-item:not(.query-btn-container) {
    width: 270px !important;
  }
}
</style>
