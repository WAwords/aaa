<template>
  <div>
    <LevelList title="技能类型" :loading="loading">
      <template #btn>
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
      </template>
      <template #list>
        <ListItem
          :title="row.name"
          v-for="row in tableData"
          :key="row.id"
          @click="onSelect(row)"
          :active="typeId === row.id"
        >
          <template #btn>
            <el-button
              size="small"
              type="primary"
              @click.stop="onEdit(row)"
              v-hasPermi="['osce:scoring-criteria:update']"
            >
              <!-- 修改 -->
              <template #icon>
                <Icon icon="ant-design:form-outlined" size="15px" />
              </template>
            </el-button>
            <el-button
              size="small"
              type="danger"
              @click.stop="onDelete(row)"
              v-hasPermi="['osce:scoring-criteria:delete']"
            >
              <!-- 删除 -->
              <template #icon>
                <Icon icon="ant-design:delete-outlined" size="15px" />
              </template>
            </el-button>
          </template>
        </ListItem>
      </template>
    </LevelList>

    <!-- 弹窗 -->
    <el-dialog
      v-model="dialogFormVisible"
      :title="dialogTitle"
      width="400px"
      @closed="onDialogClose"
      align-center
    >
      <el-form
        :model="dialogForm"
        ref="dialogFromRef"
        :rules="dialogFormRules"
        @submit.prevent
        label-position="top"
      >
        <el-form-item label="技能类型名" prop="name">
          <el-input
            v-model="dialogForm.name"
            @keyup.enter="onDialogSubmit"
            placeholder="请输入技能类型名"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" plain @click="dialogFormVisible = false"
            >取消</el-button
          >
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
import {
  getOsceSkillTypesListApi,
  addOsceSkillTypesApi,
  editOsceSkillTypesApi,
  deleteOsceSkillTypesApi,
} from "@/api/osce/question/question";
import {
  GetOsceSkillTypesReqType,
  GetOsceSkillTypesItemType,
  AddOsceSkillTypesReqType,
} from "@/api/osce/question/question";
import { getFormItemRule } from "@/utils/validate";

interface Props {
  typeId: number;
  skillId: number;
}
const props = withDefaults(defineProps<Props>(), {
  typeId: -1,
  skillId: -1,
});

const queryParams = ref<GetOsceSkillTypesReqType>({});
onMounted(() => {
  fetch();
});
/**
 * 拉取列表
 */
const loading = ref(true);
const totalSize = ref(0);
const tableData = ref<GetOsceSkillTypesItemType[]>([]);
const fetch = (i = 0) => {
  loading.value = true;
  if (i !== 0) {
    queryParams.value.pageNumber = i;
  }
  getOsceSkillTypesListApi(queryParams.value)
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
const dialogFromRef = ref();
const dialogFormVisible = ref(false);
const dialogType = ref<"create" | "edit">("create");
const dialogForm = ref<AddOsceSkillTypesReqType>({
  name: "",
});
const dialogTitle = computed(() => {
  enum DialogTitle {
    "create" = "新增技能类型",
    "edit" = "修改技能类型",
  }
  return DialogTitle[dialogType.value];
});
const onCreate = () => {
  dialogType.value = "create";
  dialogFormVisible.value = true;
};
const editId = ref<number>(-1);
const onEdit = (row: GetOsceSkillTypesItemType) => {
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
/**
 * 弹窗改表单提交
 */
const dialogSubmitLoading = ref(false);
const onDialogSubmit = () => {
  if (dialogSubmitLoading.value) {
    return;
  }
  dialogFromRef.value
    .validate()
    .then(() => {
      dialogSubmitLoading.value = true;
      if (dialogType.value === "create") {
        addOsceSkillTypesApi(dialogForm.value)
          .then(() => {
            CmeMessage({
              title: "成功",
              message: "新增技能类型成功",
              type: "success",
            });
            dialogFormVisible.value = false;
            fetch();
          })
          .catch(() => {
            dialogSubmitLoading.value = false;
          });
      } else if (dialogType.value === "edit") {
        editOsceSkillTypesApi(dialogForm.value, editId.value)
          .then(() => {
            CmeMessage({
              title: "成功",
              message: "修改技能类型成功",
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
/**
 * 单个删除
 */
const onDelete = (row: GetOsceSkillTypesItemType) => {
  CmeMessageBox.confirm(`确定删除技能类型“${row.name}”吗？`, "系统提示", {
    distinguishCancelAndClose: true,
    confirmButtonText: "确定",
    cancelButtonText: "取消",
  })
    .then(() => {
      deleteOsceSkillTypesApi(row.id)
        .then(() => {
          CmeMessage({
            title: "成功",
            message: "删除技能类型成功",
            type: "success",
          });
          if (props.typeId === row.id) {
            emit("update:typeId", -1);
            emit("update:skillId", -1);
          }
          fetch();
        })
        .catch(() => {});
    })
    .catch(() => {});
};
/**
 * 验证规则
 */
const dialogFormRules = {
  name: [...getFormItemRule("技能类型名", 20, -1, true)],
};
/**
 * 选择技能类型
 */
const emit = defineEmits(["update:typeId", "update:skillId"]);
const onSelect = (row: GetOsceSkillTypesItemType) => {
  emit("update:typeId", row.id);
};
</script>

<style scoped lang="less"></style>
