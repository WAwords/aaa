<template>
  <div class="h-600px flex flex-col">
    <div class="flex justify-center flex-1">
      <el-form
        :model="form"
        ref="fromRef"
        class="w-3/4"
        :rules="rules"
        label-position="top"
      >
        <el-row :gutter="40">
          <el-col :span="12">
            <el-form-item label="考试名" prop="name" tag="name">
              <el-input v-model="form.name" placeholder="请输入考试名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="考试类型" prop="type" tag="type">
              <el-select
                v-model="form.type"
                placeholder="请选择考试类型"
                class="w-full"
                filterable
              >
                <el-option
                  v-for="item in typeOption"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="考试模式" prop="mode" tag="mode">
              <el-select
                v-model="form.mode"
                placeholder="请选择考试模式"
                class="w-full"
                filterable
              >
                <el-option
                  v-for="item in modeOption"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="抽题方式"
              prop="skillSelectionMethod"
              tag="skillSelectionMethod"
            >
              <el-select
                v-model="form.skillSelectionMethod"
                placeholder="请选择抽题方式"
                class="w-full"
                filterable
              >
                <el-option
                  v-for="item in skillSelectionMethodOption"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="考官签字"
              prop="requireSignature"
              tag="requireSignature"
            >
              <el-radio-group v-model="form.requireSignature">
                <el-radio :label="false" :value="false">
                  不需要考官签字
                </el-radio>
                <el-radio :label="true" :value="true"> 需要考官签字 </el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="分差检测"
              prop="scoreDifferenceDetection"
              tag="scoreDifferenceDetection"
            >
              <el-radio-group v-model="form.scoreDifferenceDetection">
                <el-radio :label="false" :value="false">
                  不开启分差检测
                </el-radio>
                <el-radio :label="true" :value="true"> 开启分差检测 </el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="考试时间" prop="timeRange" tag="timeRange">
              <el-date-picker
                v-model="timeRange"
                type="datetimerange"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                value-format="YYYY-MM-DD HH:mm:ss"
                format="YYYY-MM-DD HH:mm"
                :clearable="false"
                :editable="false"
                time-format="HH:mm"
                date-format="YYYY-MM-DD"
                unlink-panels
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>

    <div class="footer-wrapper">
      <div class="footer-left">
        <el-button type="primary" plain @click="editorVisible = false">
          取消
        </el-button>
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
      v-model="dialogVisible"
      title="保存失败"
      width="500px"
      destroy-on-close
      align-center
    >
      <div>以下考站在新的考试时间内被占用</div>
      <div class="my-10px font-semibold">
        <div v-for="(item, index) in errList">
          {{
            `${index + 1}. 考站【${item.roomName}】于【${item.beginAt}】至【${
              item.endAt
            }】被【${item.description}】占用`
          }}
        </div>
      </div>
      <div>是否继续？继续会导致新的考试时间内存在占用的考站被取消选择。</div>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button
          type="primary"
          @click="handleContinueClick()"
          :loading="continueLoading"
        >
          继续
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { getTodayStartDate } from "@/utils/common";
import { useExamEditorState } from "./examEditorState";
import {
  addExaminationApi,
  editExaminationApi,
} from "@/api/osce/exam/management";
import { AddExaminationType } from "@/api/osce/exam/management";
import { dayjs } from "element-plus";
import { getFormItemRule } from "@/utils/validate";

const {
  examinationId,
  examMsg,
  activeComIndex,
  dialogVisible: editorVisible,
  updateExamMsg,
} = useExamEditorState();

onMounted(() => {
  if (examMsg.value) {
    timeRange.value = [examMsg.value!.beginAt, examMsg.value!.endAt];
    Object.keys(form.value).forEach((key) => {
      form.value[key] = examMsg.value![key];
    });
    memento.value = JSON.parse(JSON.stringify(form.value));
  }

  datePickerPatch();
});

/** 将范围选择器的确定按钮样式改变 */
const datePickerPatch = () => {
  let element = document.querySelector(
    ".el-popper .el-date-range-picker .el-button",
  );
  if (!element) return;

  element.classList.add("el-button--primary");
  element.classList.remove("is-plain");
};

const form = ref<AddExaminationType>({
  name: "",
  type: "",
  mode: "",
  skillSelectionMethod: "",
  requireSignature: false,
  scoreDifferenceDetection: false,
  beginAt: "",
  endAt: "",
});

/** 时间范围 */
const timeRange = ref<[string, string]>([
  dayjs(getTodayStartDate()).format("YYYY-MM-DD HH:mm:ss"),
  dayjs(getTodayStartDate()).format("YYYY-MM-DD HH:mm:ss"),
]);
form.value.beginAt = timeRange.value[0];
form.value.endAt = timeRange.value[1];
watch(
  timeRange,
  (val) => {
    form.value.beginAt = val[0];
    form.value.endAt = val[1];
  },
  {
    deep: false,
  },
);
/** 备忘录 */
const memento = ref<AddExaminationType>(JSON.parse(JSON.stringify(form.value)));

/** 字典 */
const typeOption = [
  {
    value: "1",
    label: "普通考试",
  },
  {
    value: "2",
    label: "期末考试",
  },
  {
    value: "3",
    label: "年度考试",
  },
];
const modeOption = [
  {
    value: "1",
    label: "非固定模式",
  },
  {
    value: "2",
    label: "固定模式",
  },
];
const skillSelectionMethodOption = [
  {
    value: "1",
    label: "考官手动抽题",
  },
  {
    value: "2",
    label: "系统随机抽题",
  },
];
/** 校验规则 */
const rules = {
  name: [...getFormItemRule("考试名", 40, -1, true)],
  type: [{ required: true, message: "请选择考试类型", trigger: ["change"] }],
  mode: [{ required: true, message: "请选择考试模式", trigger: ["change"] }],
  skillSelectionMethod: [
    { required: true, message: "请选抽题方式", trigger: ["change"] },
  ],
  requireSignature: [
    { required: true, message: "请选择是否需要签字", trigger: ["change"] },
  ],
  scoreDifferenceDetection: [
    { required: true, message: "请选择是否需要签字", trigger: ["change"] },
  ],
};

// (el-radio\s+)(:?)(label=(["'])([^"']+)\4)(?!\s+value)

/** 保存失败的弹窗 */
const errList = ref<any[]>([]);
const dialogVisible = ref(false);
const continueLoading = ref(false);
const handleContinueClick = () => {
  editExaminationApi(form.value, examinationId.value as number, {
    force: true,
  })
    .then(async () => {
      CmeMessage({
        title: "成功",
        message: "数据保存成功",
        type: "success",
      });
      await updateExamMsg();
      if (clickType.value === "next") {
        activeComIndex.value!++;
      }
      dialogVisible.value = false;
    })
    .catch(() => {
      dialogVisible.value = true;
    });
};

const clickType = ref<"save" | "next">();

const saveLoading = ref(false);
/** 保存按钮 */
const handleSave = async () => {
  clickType.value = "save";
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
  clickType.value = "next";
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

const fromRef = ref();
/** 保存 */
const save = async () => {
  let tag = true;
  await fromRef.value
    .validate()
    .then(async () => {
      if (examinationId.value) {
        // 修改
        await editExaminationApi(form.value, examinationId.value)
          .then(() => {
            CmeMessage({
              title: "成功",
              message: "保存成功",
              type: "success",
            });
          })
          .catch((err) => {
            if (err instanceof Array) {
              let tempErr = [] as any[];
              err.forEach((item: any) => {
                item.activities.forEach((activeItem: any) => {
                  tempErr.push({
                    roomName: item.roomName,
                    beginAt: activeItem.beginAt,
                    endAt: activeItem.endAt,
                    description: activeItem.description,
                  });
                });
              });
              errList.value = tempErr;
              dialogVisible.value = true;
            }
            tag = false;
          });
      } else {
        // 新增
        await addExaminationApi(form.value)
          .then((res: { examinationId: number }) => {
            examinationId.value = res.examinationId;
            CmeMessage({
              title: "成功",
              message: "保存成功",
              type: "success",
            });
          })
          .catch(() => {
            tag = false;
          });
      }
    })
    .catch(() => {
      tag = false;
    });
  return tag;
};
</script>

<style scoped lang="less">
.buttom-group {
  @apply pt-10px flex justify-center;
  .buttom-container {
    @apply w-100px flex justify-center;
  }
}

// 时间选择器样式（悬停鼠标样式）
::v-deep(.el-date-editor) {
  cursor: pointer !important;
  &.el-range-editor {
    input {
      cursor: pointer !important;
    }
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
</style>
