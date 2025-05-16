<template>
  <div class="w-full overflow-hidden">
    <LevelList title="房间" :loading="loading" :border="false" width="100%">
      <template #btn>
        <el-button
          type="primary"
          @click="onCreate"
          v-if="buildingId >= 0 && floorId >= 0"
          v-hasPermi="['system:room:add']"
        >
          新增
          <template #icon>
            <Icon icon="ant-design:plus-outlined" size="15px" />
          </template>
        </el-button>
      </template>
      <template #list>
        <el-table
          ref="tableRef"
          v-loading="loading"
          :data="tableData"
          height="100%"
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
          <el-table-column prop="name" label="房间名" show-overflow-tooltip />
          <el-table-column
            prop="number"
            label="房间号"
            fixed
            show-overflow-tooltip
            align="center"
          />
          <el-table-column
            prop="typeName"
            label="房间类型"
            show-overflow-tooltip
            align="center"
          />
          <el-table-column
            label="操作"
            fixed="right"
            width="160px"
            align="center"
          >
            <template #default="scope">
              <el-button
                size="small"
                type="primary"
                @click="onEdit(scope.row)"
                v-hasPermi="['system:room:update']"
                text
              >
                修改
              </el-button>
              <el-button
                size="small"
                type="danger"
                @click="onDelete(scope.row)"
                v-hasPermi="['system:room:delete']"
                text
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </template>
    </LevelList>

    <!-- 弹窗 -->
    <el-dialog
      v-model="dialogFormVisible"
      :title="dialogTitle"
      width="400px"
      @closed="onDialogClose"
      align-center
      :close-on-click-modal="false"
    >
      <el-form
        :model="dialogForm"
        ref="dialogFromRef"
        :rules="dialogFormRules"
        label-position="top"
      >
        <el-form-item label="房间号" prop="number">
          <el-input
            v-model.trim="dialogForm.number"
            :disabled="dialogType === 'edit'"
            placeholder="请输入房间号"
          />
        </el-form-item>
        <el-form-item label="房间名" prop="name">
          <el-input
            v-model="dialogForm.name"
            @change="onNameChange"
            placeholder="请输入房间名"
          />
        </el-form-item>
        <el-form-item label="房间类型" prop="type">
          <el-select
            v-model="dialogForm.type"
            placeholder="请选择房间类型"
            class="w-full"
            filterable
            clearable
          >
            <el-option
              v-for="item in typeOption"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
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
import {
  getRoomListApi,
  addRoomApi,
  editRoomApi,
  deleteRoomApi,
} from "@/api/system/management/rooms";
import {
  GetRoomReqType,
  RoomListItemType,
  AddRoomType,
} from "@/api/system/management/rooms";
import { getFormItemRule } from "@/utils/validate";

interface Props {
  buildingId: number;
  floorId: number;
}
const props = withDefaults(defineProps<Props>(), {
  buildingId: -1,
  floorId: -1,
});
const { buildingId, floorId } = toRefs(props);

const queryParams = ref<GetRoomReqType>({
  floorId: floorId,
  buildingId: buildingId,
});
watch(
  () => props.buildingId,
  () => {
    tableData.value = [];
  },
);
watch(
  () => props.floorId,
  (newVal) => {
    if (newVal >= 0) {
      fetch();
    } else {
      tableData.value = [];
    }
  },
);
/**
 * 拉取列表
 */
const loading = ref(false);
const totalSize = ref(0);
const tableData = ref<RoomListItemType[]>([]);
const fetch = (i = 0) => {
  loading.value = true;
  if (i !== 0) {
    queryParams.value.pageNumber = i;
  }
  getRoomListApi(queryParams.value, props.buildingId, props.floorId)
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
const dialogForm = ref<AddRoomType>({
  name: "",
  number: "",
  type: "",
});
const dialogTitle = computed(() => {
  enum DialogTitle {
    "create" = "新增房间",
    "edit" = "修改房间",
  }
  return DialogTitle[dialogType.value];
});
const onCreate = () => {
  dialogType.value = "create";
  dialogFormVisible.value = true;
};
const editId = ref<number>(-1);
const onEdit = (row: RoomListItemType) => {
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
        addRoomApi(dialogForm.value, props.buildingId, props.floorId)
          .then(() => {
            CmeMessage({
              title: "成功",
              message: "新增房间成功",
              type: "success",
            });
            dialogFormVisible.value = false;
            fetch();
          })
          .catch(() => {
            dialogSubmitLoading.value = false;
          });
      } else if (dialogType.value === "edit") {
        editRoomApi(
          dialogForm.value,
          editId.value,
          props.buildingId,
          props.floorId,
        )
          .then(() => {
            CmeMessage({
              title: "成功",
              message: "修改房间成功",
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

/** 填写房间名后自动选择房间类型 */
const onNameChange = (val: string) => {
  let temp = typeOption.find((item) => val.indexOf(item.label) > -1);
  if (temp) {
    dialogForm.value.type = temp.value;
  }
};

/**
 * 单个删除
 */
const onDelete = (row: RoomListItemType) => {
  CmeMessageBox.confirm(`确定删除房间“${row.name}”吗？`, "系统提示", {
    distinguishCancelAndClose: true,
    confirmButtonText: "确定",
    cancelButtonText: "取消",
  })
    .then(() => {
      deleteRoomApi(row.id, props.buildingId, props.floorId)
        .then(() => {
          CmeMessage({
            title: "成功",
            message: "删除房间成功",
            type: "success",
          });
          fetch();
        })
        .catch(() => {});
    })
    .catch(() => {});
};
/**
 * 字典
 */
const typeOption = [
  {
    value: "1",
    label: "普通房间",
  },
  {
    value: "2",
    label: "教室",
  },
  {
    value: "3",
    label: "考站",
  },
  {
    value: "4",
    label: "训练室",
  },
  {
    value: "5",
    label: "会议室",
  },
];
/** 验证规则 */
const dialogFormRules = {
  name: [...getFormItemRule("房间名", 20, -1, true)],
  number: [...getFormItemRule("房间号", 20, -1, true)],
};
</script>

<style scoped lang="less">
::v-deep(.el-table) {
  border: unset !important;
  border-radius: unset !important;
}
</style>
