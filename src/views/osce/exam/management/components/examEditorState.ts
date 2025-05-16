import {
  getExaminationApi,
  ExaminationDetail,
} from "@/api/osce/exam/management";

/** 编辑弹窗显示状态 */
const dialogVisible = ref(false);
/** 编辑弹窗title */
const dialogTitle = computed(() => {
  return DialogTitleEnum[dialogType.value];
});
/** 编辑框类型 */
const dialogType = ref<DialogType>("create");
/** 考试id */
const examinationId = ref<number>();
/** 考试信息 */
const examMsg = ref<ExaminationDetail>();
/** 后端的步骤 */
const serverStep = ref<number>();
/** 步骤条激活的步骤 */
const activeStepTag = ref<number>(0);
/** 激活的组件index */
const activeComIndex = ref<number>(0);
/** 更新考试信息的加载状态 */
const updateExamMsgLoading = ref<boolean>(false);

/** 更新考试信息 */
const updateExamMsg = async () => {
  updateExamMsgLoading.value = true;
  await getExaminationApi(examinationId.value as number)
    .then((res: ExaminationDetail) => {
      examMsg.value = res;
      serverStep.value = res.step;
      // 如果考试状态为已以确定完成创建，则激活步骤为6（在后端的步骤里没有步骤6）
      if (res.step === 5 && res.status === "2") {
        activeStepTag.value = 6;
      } else {
        activeStepTag.value = res.step;
      }
    })
    .catch(() => {});
  updateExamMsgLoading.value = false;
};
/** 打开编辑弹窗 */
const openDialog = async (type: DialogType, id?: number) => {
  dialogType.value = type;
  dialogVisible.value = true;
  if (type !== "create") {
    examinationId.value = id;
    await updateExamMsg();
    if (activeStepTag.value === 6) {
      activeComIndex.value = activeStepTag.value;
    } else {
      activeComIndex.value = activeStepTag.value + 1;
    }
  } else {
    activeComIndex.value = activeStepTag.value + 1;
  }
};
/** 关闭编辑弹窗 */
const closeDialog = () => {
  dialogVisible.value = false;
  init();
};
/** 初始化 */
const init = () => {
  dialogType.value = "create";
  examinationId.value = undefined;
  examMsg.value = undefined;
  serverStep.value = undefined;
  activeComIndex.value = 0;
  activeStepTag.value = 0;
};

export function useExamEditorState() {
  return {
    dialogVisible,
    dialogTitle,
    examinationId,
    examMsg,
    serverStep,
    activeStepTag,
    activeComIndex,
    updateExamMsgLoading,
    updateExamMsg,
    openDialog,
    closeDialog,
  };
}

type DialogType = "create" | "edit";

enum DialogTitleEnum {
  "create" = "创建考试",
  "edit" = "修改考试",
}
