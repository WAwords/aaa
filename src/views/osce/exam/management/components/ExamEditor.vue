<template>
  <el-dialog
    v-model="dialogVisible"
    :title="dialogTitle"
    width="1200px"
    @closed="closed()"
    :close-on-click-modal="false"
    destroy-on-close
    align-center
  >
    <div v-loading="updateExamMsgLoading">
      <Steps>
        <StepItem
          :step="1"
          title="填写考试信息"
          :active="activeComIndex === 1"
          :finished="activeStepTag >= 1"
          isFirst
          @click="handleStepTo(1)"
        />
        <StepItem
          :step="2"
          title="选择考试考生"
          :active="activeComIndex === 2"
          :finished="activeStepTag >= 2"
          @click="handleStepTo(2)"
        />
        <StepItem
          :step="3"
          title="选择考试考站"
          :active="activeComIndex === 3"
          :finished="activeStepTag >= 3"
          @click="handleStepTo(3)"
        />
        <StepItem
          :step="4"
          title="设置考站安排"
          :active="activeComIndex === 4"
          :finished="activeStepTag >= 4"
          @click="handleStepTo(4)"
        />
        <StepItem
          :step="5"
          title="完成考试排考"
          :active="activeComIndex === 5"
          :finished="activeStepTag >= 5"
          @click="handleStepTo(5)"
        />
        <StepItem
          :step="6"
          title="确认考试创建"
          :active="activeComIndex === 6"
          :finished="activeStepTag >= 6"
          @click="handleStepTo(6)"
        />
      </Steps>
      <!-- <el-steps
        class="cursor-pointer justify-center mb-10px"
        :active="activeStepTag"
        align-center
      >
        <el-step title="填写考试信息" @click="handleStepTo(1)" />
        <el-step title="选择考试考生" @click="handleStepTo(2)" />
        <el-step title="选择考试考站" @click="handleStepTo(3)" />
        <el-step title="设置考站安排" @click="handleStepTo(4)" />
        <el-step title="完成考试排考" @click="handleStepTo(5)" />
        <el-step title="确认考试创建" @click="handleStepTo(6)" />
      </el-steps> -->
      <div class="editor-wrapper">
        <component
          :is="StepComponent[activeComIndex!]"
          ref="stepComRef"
        ></component>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { useExamEditorState } from "./examEditorState";
import Message from "./Message.vue";
import Examinee from "./examinee/index.vue";
import Station from "./Station.vue";
import Examiner from "./examiner/index.vue";
import Arrangement from "./Arrangement.vue";
import Done from "./Done.vue";
import Loading from "./Loading.vue";
import StepItem from "@/components/Steps/components/StepItem.vue";

const {
  activeStepTag,
  dialogVisible,
  dialogTitle,
  activeComIndex,
  updateExamMsgLoading,
  closeDialog,
} = useExamEditorState();

const StepComponent = [
  Loading,
  Message,
  Examinee,
  Station,
  Examiner,
  Arrangement,
  Done,
];

/** 步骤跳转（展示的步骤com） */
const handleStepTo = (step: number) => {
  if (step <= activeStepTag.value + 1) {
    activeComIndex.value = step;
  }
};

const refreshTable = inject("handleEditorClosed", () => {});
/** 编辑框关闭 */
const closed = () => {
  closeDialog();
  refreshTable();
};
</script>

<style scoped lang="less">
.editor-wrapper {
  @apply mt-20px border-t pt-20px;
}
</style>
