<template>
  <div>
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="1200px"
      @closed="onDialogClose"
      destroy-on-close
      :close-on-click-modal="dialogType === 'view'"
      align-center
    >
      <el-form
        :model="dialogForm"
        :rules="rules"
        ref="formRef"
        v-loading="dialogMainLoading"
        label-position="top"
      >
        <el-row :gutter="40">
          <el-col :span="24">
            <el-form-item
              prop="sceneTitle"
              label="场景标题"
              class="label-sceneTitle"
            >
              <el-input
                v-model="dialogForm.sceneTitle"
                placeholder="请输入场景标题"
                :disabled="dialogType === 'view'"
              />
            </el-form-item>
          </el-col>

          <el-col :span="24">
            <el-form-item label="题干" class="prop-scene">
              <Editor
                v-model:editor-content="dialogForm.scene"
                :disable="dialogType === 'view'"
                :placeholder="editorPlaceholder"
              ></Editor>
            </el-form-item>
          </el-col>

          <el-col :span="24">
            <el-form-item label="评分标准" class="is-required label-critera">
              <div class="w-full">
                <div class="flex justify-between mb-8px">
                  <el-radio-group v-model="criteriaRadio">
                    <el-radio-button :label="0" :value="0">
                      评分项
                    </el-radio-button>
                    <el-radio-button :label="1" :value="1">
                      扣分项
                    </el-radio-button>
                  </el-radio-group>
                  <div class="my-10px">
                    评分项共
                    <span class="primary-text">
                      {{ scoringCount }}
                    </span>
                    分，扣分项共
                    <span class="primary-text">
                      {{ deductionCount }}
                    </span>
                    分
                  </div>
                </div>
                <div v-if="criteriaRadio === 0">
                  <CriteriaTable
                    v-model:data="dialogForm.scoringItems"
                    :dialog-type="dialogType"
                    type="scoring"
                    v-model:tableType="dialogForm.scoringItemsType"
                  />
                </div>
                <div v-if="criteriaRadio === 1">
                  <CriteriaTable
                    v-model:data="dialogForm.deductionItems"
                    :dialog-type="dialogType"
                    type="deduction"
                    v-model:tableType="dialogForm.deductionItemsType"
                  />
                </div>
              </div>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer v-if="dialogType != 'view'">
        <span class="dialog-footer">
          <el-button type="primary" plain @click="dialogVisible = false">
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

    <!-- 组成及错误的弹窗 -->
    <el-dialog
      v-model="groupScoreErrDialogVisible"
      title="系统提示"
      width="800px"
      destroy-on-close
      align-center
    >
      <div style="line-height: var(--el-messagebox-font-line-height)">
        <div>
          成绩设置有误！同一类型下的
          <strong style="color: var(--el-color-danger)">
            同一分组分数需要相同
          </strong>
          。以下是错误的分组。
        </div>
        <div v-if="groupScoreErr.scoring.length > 0" class="mt-10px">
          评分项：
          <GroupScoreErrTable
            class="mt-5px"
            :data="groupScoreErr.scoring"
            :tableType="groupScoreErr.scoringType"
          />
        </div>
        <div v-if="groupScoreErr.deduction.length > 0" class="mt-10px">
          扣分项：
          <GroupScoreErrTable
            class="mt-5px"
            :data="groupScoreErr.deduction"
            :tableType="groupScoreErr.deductionType"
          />
        </div>
      </div>
      <template #footer>
        <el-button type="primary" @click="groupScoreErrDialogVisible = false">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>
<script setup lang="ts">
import CriteriaTable from "./CriteriaTable.vue";
import GroupScoreErrTable from "./GroupScoreErrTable.vue";
import type { ReadImportItem } from "./Criteria.vue";
import {
  addCriteriaApi,
  editCriteriaApi,
  getCriteriaApi,
} from "@/api/osce/question/question";
import { getFormItemRule } from "@/utils/validate";
import { getNowMergeIndex } from "./utils.ts";

interface Props {
  dialogType: "create" | "edit" | "view";
  criteriaId: number;
  typeId: number;
  skillId: number;
}
const props = withDefaults(defineProps<Props>(), {
  dialogType: "create",
});

/** 当前组件的弹窗显隐 */
const dialogVisible = inject<Ref<boolean>>("dialogVisible");

const editorPlaceholder = computed(() => {
  return props.dialogType == "view" ? "" : "请输入内容...";
});
/** 控制评分项和扣分项 */
const criteriaRadio = ref(0);

watch(
  () => dialogVisible!.value,
  (newVal) => {
    if (newVal) {
      if (props.criteriaId >= 0 && props.dialogType !== "create") {
        // 如果有id则请求
        fetch();
      }
    } else {
      // 关闭弹窗时重置
      dialogInit();
    }
  },
);

const dialogInit = () => {
  scoringCount.value = 0;
  deductionCount.value = 0;
};

// 导入评分标准
const importCriteria = (val: ReadImportItem) => {
  emit("update:dialogType", "create");
  dialogVisible!.value = true;
  const scoringItemsType = getItemsType(val.scoreing.header);
  const deductionItemsType = getItemsType(val.deduction.header);

  nextTick(() => {
    dialogForm.value = {
      sceneTitle: val.scene.body[0][0],
      scene: val.scene.body[0][1],
      scoringItemsType: scoringItemsType,
      deductionItemsType: deductionItemsType,
      scoringItems: importTrans(val.scoreing.body, scoringItemsType),
      deductionItems: importTrans(val.deduction.body, deductionItemsType),
    };
  });
};

/**
 * 通过导入的数据的表头获取ItemType
 * @param headerList 表头数组
 * @returns "0" | "1" | "2" | "3"
 */
const getItemsType = (headerList: string[]) => {
  return `${headerList.length - 3}` as "0" | "1" | "2" | "3";
};

/** 将导入的数据转换为表格数据 */
const importTrans = (data: any[][], itemsType: string | number) => {
  return data.map((item) => {
    let tempRowObj = {} as any;

    for (let i = 0; i <= +itemsType; i++) {
      tempRowObj[`level_${i}`] = {};
      tempRowObj[`level_${i}`].content = item[i];

      if (i === +itemsType) {
        tempRowObj[`level_${i}`].score = item[i + 1];
        tempRowObj[`level_${i}`].rule = item[i + 2];
      }
    }
    return tempRowObj;
  });
};

defineExpose({
  importCriteria,
});

const dialogForm = ref<{
  sceneTitle: string;
  scoringItems: any[];
  deductionItems: any[];
  scene: string;
  scoringItemsType?: "0" | "1" | "2" | "3";
  deductionItemsType?: "0" | "1" | "2" | "3";
  [key: string]: any;
}>({
  sceneTitle: "",
  scene: "",
  scoringItemsType: undefined,
  deductionItemsType: undefined,
  scoringItems: [],
  deductionItems: [],
});
watch(
  () => dialogForm.value.scoringItems,
  (newVal) => {
    if (dialogForm.value.scoringItemsType) {
      scoringCount.value = scoreCount(
        newVal,
        dialogForm.value.scoringItemsType,
      );
    }
  },
  {
    deep: true,
  },
);
watch(
  () => dialogForm.value.deductionItems,
  (newVal) => {
    if (dialogForm.value.deductionItemsType) {
      deductionCount.value = scoreCount(
        newVal,
        dialogForm.value.deductionItemsType,
      );
    }
  },
  {
    deep: true,
  },
);

/** 计算分数（涉及分组分数） */
const scoreCount = (data: any[], type: string) => {
  type GroupScoreItem = {
    group: number;
    scoreList: number[];
  };

  type ParentListItem = {
    parent: string;
    groupScore: GroupScoreItem[];
  };

  let resultScore = 0;

  if (+type - 1 < 0) {
    // 如果根本不涉及分组的情况，直接加分数
    let arr = data.map((item) => item[`level_${type}`].score).filter(Boolean);
    resultScore = arr.reduce(
      (pre, cur) => preciseAdd(pre, Number(cur), 100),
      0,
    );
  } else if (+type - 1 === 0) {
    // 可能涉及分组的情况（分组列为第一列）
    let noGroupRowScoreList = [];

    let groupScore = [] as GroupScoreItem[];
    // 需要跳过的行的最后行索引
    let jumpTo = -1;

    for (let i = 0; i < data.length; i++) {
      // 当前行小于等于跳过的行索引时，跳过
      if (i <= jumpTo) continue;

      if (!data[i][`level_${+type - 1}`]?.group) {
        // 如果没有分组
        noGroupRowScoreList.push(data[i][`level_${+type}`].score);
      } else {
        // 如果有分组
        let thisGroup = groupScore.find(
          (item) => item.group === data[i][`level_${+type - 1}`].group,
        );
        let mergedRowIndexList = getNowMergeIndex(
          data,
          `level_${+type - 1}`,
          i,
          +type,
        );

        jumpTo = mergedRowIndexList[mergedRowIndexList.length - 1];

        // 当前合并行的总分
        let mergedRowScoreSum = 0;
        mergedRowIndexList.forEach((item) => {
          mergedRowScoreSum += data[item][`level_${+type}`].score;
        });

        if (thisGroup) {
          thisGroup.scoreList.push(mergedRowScoreSum);
        } else {
          groupScore.push({
            group: data[i][`level_${+type - 1}`].group,
            scoreList: [mergedRowScoreSum],
          });
        }
      }
    }

    // 当前组号的最大分数
    let groupMaxScoreList = groupScore.map((item) => {
      return Math.max(...item.scoreList);
    });

    resultScore = [...noGroupRowScoreList, ...groupMaxScoreList].reduce(
      (pre, cur) => preciseAdd(pre, Number(cur), 100),
      0,
    );
  } else {
    // 可能涉及分组的情况（分组列为第二列及以上）
    let noGroupRowScoreList = [];

    let parentList = [] as ParentListItem[];
    // 需要跳过的行的最后行索引
    let jumpTo = -1;

    for (let i = 0; i < data.length; i++) {
      // 当前行小于等于跳过的行索引时，跳过
      if (i <= jumpTo) continue;

      if (!data[i][`level_${+type - 1}`]?.group) {
        // 如果没有分组
        noGroupRowScoreList.push(data[i][`level_${+type}`].score);
      } else {
        // 如果有分组
        let parent = getNowMergeIndex(
          data,
          `level_${+type - 2}`,
          i,
          +type,
        ).join(",");

        // 找到当前行的父级成员
        let thisParentMember = parentList.find(
          (item) => item.parent === parent,
        );

        // 没有父级成员，则创建
        if (!thisParentMember) {
          parentList.push({
            parent: parent,
            groupScore: [],
          });
          thisParentMember = parentList.find((item) => item.parent === parent);
        }

        let groupScore = thisParentMember!.groupScore;

        let thisGroup = groupScore.find(
          (item) => item.group === data[i][`level_${+type - 1}`].group,
        );
        let mergedRowIndexList = getNowMergeIndex(
          data,
          `level_${+type - 1}`,
          i,
          +type,
        );

        jumpTo = mergedRowIndexList[mergedRowIndexList.length - 1];

        // 当前合并行的总分
        let mergedRowScoreSum = 0;
        mergedRowIndexList.forEach((item) => {
          mergedRowScoreSum += data[item][`level_${+type}`].score;
        });

        if (thisGroup) {
          thisGroup.scoreList.push(mergedRowScoreSum);
        } else {
          groupScore.push({
            group: data[i][`level_${+type - 1}`].group,
            scoreList: [mergedRowScoreSum],
          });
        }
      }
    }

    let groupMaxScoreList = parentList
      .map((item) => {
        return item.groupScore.map((_item) => {
          return Math.max(..._item.scoreList);
        });
      })
      .flat(2);

    resultScore = [...noGroupRowScoreList, ...groupMaxScoreList].reduce(
      (pre, cur) => preciseAdd(pre, Number(cur), 100),
      0,
    );
  }

  return resultScore;
};

const scoringCount = ref(0);
const deductionCount = ref(0);

/** 组分数错误提示弹窗 */
const groupScoreErrDialogVisible = ref(false);
/** 组分数的错误 */
const groupScoreErr = ref();

/** 弹窗表单提交 */
const dialogSubmitLoading = ref(false);
const onDialogSubmit = () => {
  groupScoreValidate()
    .then(() => {
      dialogSubmitLoading.value = true;
      if (props.dialogType === "create") {
        doValidate()
          .then(() => {
            let obj = {
              sceneTitle: dialogForm.value.sceneTitle,
              scene: dialogForm.value.scene,
              scoringItemsType: dialogForm.value.scoringItemsType,
              deductionItemsType: dialogForm.value.deductionItemsType,
              // scoringItems: transSIArr(dialogForm.value.scoringItems),
              // deductionItems: transDIArr(dialogForm.value.deductionItems),
              scoringItems: transSubmitList(
                dialogForm.value.scoringItems,
                dialogForm.value.scoringItemsType!,
              ),
              deductionItems: transSubmitList(
                dialogForm.value.deductionItems,
                dialogForm.value.deductionItemsType!,
              ),
            };

            // 后端要求当扣分项为空的时候deductionItemsType为空
            if (obj.deductionItems.length === 0) {
              // @ts-ignore
              obj.deductionItemsType = "";
            }
            addCriteriaApi(obj, props.typeId, props.skillId)
              .then(() => {
                CmeMessage({
                  title: "成功",
                  message: "新增评分标准成功",
                  type: "success",
                });
                dialogVisible!.value = false;
                emit("onRefresh");
              })
              .catch(() => {
                dialogSubmitLoading.value = false;
              });
          })
          .catch(() => {
            dialogSubmitLoading.value = false;
          });
      } else if (props.dialogType === "edit") {
        doValidate()
          .then(() => {
            let obj = {
              sceneTitle: dialogForm.value.sceneTitle,
              scene: dialogForm.value.scene,
              scoringItemsType: dialogForm.value.scoringItemsType,
              deductionItemsType: dialogForm.value.deductionItemsType,
              // scoringItems: transSIArr(dialogForm.value.scoringItems),
              // deductionItems: transDIArr(dialogForm.value.deductionItems),
              scoringItems: transSubmitList(
                dialogForm.value.scoringItems,
                dialogForm.value.scoringItemsType!,
              ),
              deductionItems: transSubmitList(
                dialogForm.value.deductionItems,
                dialogForm.value.deductionItemsType!,
              ),
            };

            // 后端要求当扣分项为空的时候deductionItemsType为空
            if (obj.deductionItems.length === 0) {
              // @ts-ignore
              obj.deductionItemsType = "";
            }
            editCriteriaApi(obj, props.criteriaId, props.typeId, props.skillId)
              .then(() => {
                CmeMessage({
                  title: "成功",
                  message: "修改评分标准成功",
                  type: "success",
                });
                dialogVisible!.value = false;
                emit("onRefresh");
              })
              .catch(() => {
                dialogSubmitLoading.value = false;
              });
          })
          .catch(() => {
            dialogSubmitLoading.value = false;
          });
      } else {
        dialogSubmitLoading.value = false;
      }
    })
    .catch((err) => {
      let errMsg = {
        deduction: err.deduction,
        scoring: err.scoring,
        deductionType: "0",
        scoringType: "0",
      };

      groupScoreErr.value = transErr(errMsg);

      groupScoreErrDialogVisible.value = true;
    });
};

/** 错误转换 */
const transErr = (errMsg: any) => {
  if (
    errMsg.scoring.length > 0 &&
    errMsg.scoring[0].parent.indexOf("-1") === -1
  ) {
    errMsg.scoringType = "1";
  }
  if (
    errMsg.deduction.length > 0 &&
    errMsg.deduction[0].parent.indexOf("-1") === -1
  ) {
    errMsg.deductionType = "1";
  }

  errMsg.scoring = treeToList(transErrToTree(errMsg, "scoring"));
  errMsg.deduction = treeToList(transErrToTree(errMsg, "deduction"));

  return errMsg;
};

/** 将错误转为树形结构 */
const transErrToTree = (err: any, type: "scoring" | "deduction") => {
  let transObj = {
    scoring: "scoringItems",
    deduction: "deductionItems",
  };

  let result = err[type].map((item: any) => {
    if (item.parent.indexOf("-1") !== -1) {
      let temp = item.children.map((_item: any) => {
        let innerRes = _item.rows.map((i: any) => {
          let scoreSum = i.scoreArr.reduce((pre: number, cur: any) => {
            return pre + cur.score;
          }, 0);

          let childrenContent =
            dialogForm.value[transObj[type]][i.scoreArr[0].index][
              `level_${item.colIndex}`
            ].content;
          return {
            group: _item.group,
            content: childrenContent,
            score: scoreSum,
          };
        });

        return innerRes;
      });

      return temp;
    } else {
      let parentFirstIndex = item.parent.split(",")[0];
      let parentContent =
        dialogForm.value[transObj[type]][parentFirstIndex][
          `level_${item.colIndex - 1}`
        ].content;
      return {
        content: parentContent,
        children: item.children
          .map((_item: any) => {
            let innerRes = _item.rows.map((i: any) => {
              let scoreSum = i.scoreArr.reduce((pre: number, cur: any) => {
                return pre + cur.score;
              }, 0);

              let childrenContent =
                dialogForm.value[transObj[type]][i.scoreArr[0].index][
                  `level_${item.colIndex}`
                ].content;
              return {
                group: _item.group,
                content: childrenContent,
                score: scoreSum,
              };
            });

            return innerRes;
          })
          .flat(),
      };
    }
  });

  return result.flat(2);
};

const dialogMainLoading = ref(false);
/** 获取评分标准 */
const fetch = () => {
  dialogMainLoading.value = true;
  getCriteriaApi(props.criteriaId, props.typeId, props.skillId)
    .then((res: any) => {
      res.deductionItems = transListForType(
        treeToList(res.deductionItems),
        res.deductionItemsType,
      );
      res.scoringItems = transListForType(
        treeToList(res.scoringItems),
        res.scoringItemsType,
      );
      !res.scene && (res.scene = "");
      dialogForm.value = res;
      dialogMainLoading.value = false;
    })
    .catch(() => {
      dialogMainLoading.value = false;
    });
};

/** 初始化表单 */
const initForm = () => {
  criteriaRadio.value = 0;
  dialogForm.value = {
    sceneTitle: "",
    scene: "",
    scoringItemsType: undefined,
    deductionItemsType: undefined,
    scoringItems: [],
    deductionItems: [],
  };
};
/**
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 */
const onDialogClose = () => {
  dialogVisible!.value = false;
  dialogSubmitLoading.value = false;
  // 初始化表单
  initForm();
};
const emit = defineEmits(["onRefresh", "update:dialogType"]);

const dialogTitle = computed(() => {
  enum DialogTitle {
    "create" = "新增评分标准",
    "edit" = "修改评分标准",
    "view" = "查看评分标准",
  }
  return DialogTitle[props.dialogType];
});

/**
 * 将评分项列表转换为后端需要的二维数组
 * @param {any[]} arr 评分项列表（或扣分项列表）
 * @param {string} type 类型（最高层级）
 */
const transSubmitList = (arr: any[], type: string) => {
  // 最大层级
  const maxLevel = +type;

  let temp = arr.map((item) => {
    let _arr = [];

    // 将展示的数据简单打平
    for (let i = 0; i <= maxLevel; i++) {
      _arr.push(item[`level_${i}`].content);
      if (i === maxLevel) {
        _arr.push(item[`level_${i}`].score);
        _arr.push(item[`level_${i}`].rule);
      }
    }

    if (maxLevel > 0) {
      // 如果最大层级大于0（大于0才有分组），则添加分组
      if (item[`level_${maxLevel - 1}`].group) {
        _arr.splice(maxLevel, 0, item[`level_${maxLevel - 1}`].group);
      } else {
        _arr.splice(maxLevel, 0, 0);
      }
    } else if (maxLevel === 0) {
      // type为0时，需要在每一行数据的第一个位置添加一个空字符串（后端需要）
      _arr.splice(0, 0, "");
    }

    return _arr;
  });

  return temp;
};

const formRef = ref();
/** 校验 */
const doValidate = () => {
  return new Promise<void>((resolve, reject) => {
    formRef.value
      .validate()
      .then(() => {
        if (dialogForm.value.scoringItems.length === 0) {
          CmeMessage({
            title: "失败",
            message: "请添加评分项",
            type: "error",
          });
          reject();
        } else {
          resolve();
        }
      })
      .catch(() => {
        // 滚动到form
        goFirstError();
        reject();
      });
  });
};

/** 组分数校验 */
function groupScoreValidate() {
  return new Promise<void>((resolve, reject) => {
    const scoringItemsType = dialogForm.value.scoringItemsType;
    const deductionItemsType = dialogForm.value.deductionItemsType;
    let scoringGroupList = getTableGroupScoreList(
      scoringItemsType!,
      "scoringItems",
    );
    let deductionGroupList = getTableGroupScoreList(
      deductionItemsType!,
      "deductionItems",
    );

    // groupNumValidate(getGroupData(scoringItemsType!, "scoringItems"));

    let scoringErrRowIndexList = getGroupScoreErrorList(scoringGroupList);
    let deductionErrRowIndexList = getGroupScoreErrorList(deductionGroupList);
    if (
      scoringErrRowIndexList.length > 0 ||
      deductionErrRowIndexList.length > 0
    ) {
      reject({
        scoring: scoringErrRowIndexList,
        deduction: deductionErrRowIndexList,
      });
    } else {
      resolve();
    }
  });
}

/**
 * 组号校验
 * @param {any[]} data 分组的整理数据
 * @returns false 校验失败
 * @returns true 校验成功
 */
const groupNumValidate = (data: any) => {
  for (let i = 0; i < data.length; i++) {
    // 校验分组应该从1开始
    if (data[i].groupArr[0].group !== "1") {
      console.error(`分组应该从1开始`);
      return false;
    }

    // 校验一个组号应该有不少于两项
    for (let j = 0; j < data[i].groupArr.length; j++) {
      if (data[i].groupArr[j].mergedRowArr.length < 2) {
        console.error(
          `${data[i].groupArr[j].mergedRowArr[0].index.split(",")[0]}行的分组${
            data[i].groupArr[j].group
          }应该有不少于两项`,
        );
        return false;
      }
    }

    // 校验分组跳跃情况
    let groupNumList = data[i].groupArr.map((item: any) => +item.group);
    for (let j = 0; j < groupNumList.length; j++) {
      if (groupNumList[j] !== j + 1) {
        console.error(
          `分组跳跃了，${
            data[i].groupArr[j].mergedRowArr[0].index.split(",")[0]
          }行应该为${j + 1}，但是却为${groupNumList[j]}`,
        );
        return false;
      }
    }

    // 校验分组不连贯
    for (let j = 0; j < data[i].groupArr.length; j++) {
      let tempList = data[i].groupArr[j].mergedRowArr.map((item: any) =>
        item.index.split(","),
      );
      tempList = tempList.flat().map((item: string) => +item);
      for (let k = 1; k < tempList.length; k++) {
        if (tempList[k] - tempList[k - 1] !== 1) {
          console.error(`分组不连贯，问题出在${tempList[k] + 1}行`);
          return false;
        }
      }
    }
  }

  return true;
};

/**
 * 获取分组数据
 * @param itemsType
 * @param type
 */
const getGroupData = (itemsType: string, type: string) => {
  // 某个层级下的分组分数列表
  let tempGroupScoreList: GroupItem[] = [];

  for (let j = 0; j < dialogForm.value[type].length; j++) {
    // 当前单元格
    let nowCell = dialogForm.value[type][j][`level_${+itemsType - 1}`];

    if (nowCell.group) {
      // 父节点数组（可能包含许多被合并的列，第一列的为[-1]）
      let parent = [-1];
      if (+itemsType - 1 > 0) {
        parent = getNowMergeIndex(
          dialogForm.value[type],
          `level_${+itemsType - 1 - 1}`,
          j,
          +itemsType!,
        );
      }

      let child = getNowMergeIndex(
        dialogForm.value[type],
        `level_${+itemsType - 1}`,
        j,
        +itemsType!,
      );

      // 找到当前单元格在tempGroupScoreList中的索引
      let groupScoreIndex = tempGroupScoreList.findIndex((item) => {
        return item.parent === parent.join(",");
      });

      // 父单元格没有记录过，则新增元素
      if (groupScoreIndex === -1) {
        tempGroupScoreList.push({
          parent: parent.join(","),
          groupArr: [
            {
              group: nowCell.group + "",
              mergedRowArr: [
                {
                  index: child.join(","),
                  scoreArr: child.map((thisRowItem) => {
                    return {
                      index: thisRowItem,
                      score:
                        dialogForm.value[type][thisRowItem][
                          `level_${itemsType}`
                        ].score,
                    };
                  }),
                },
              ],
            },
          ],
        });
      } else {
        const groupIndex = tempGroupScoreList[
          groupScoreIndex
        ].groupArr.findIndex(
          (groupItem) => groupItem.group === nowCell.group + "",
        );

        // 如果当前组号没被记录过，则直接添加
        if (groupIndex === -1) {
          tempGroupScoreList[groupScoreIndex].groupArr.push({
            group: nowCell.group + "",
            mergedRowArr: [
              {
                index: child.join(","),
                scoreArr: child.map((thisRowItem) => {
                  return {
                    index: thisRowItem,
                    score:
                      dialogForm.value[type][thisRowItem][`level_${itemsType}`]
                        .score,
                  };
                }),
              },
            ],
          });
        } else {
          // 如果被记录过，则判断当前合并的单元格是否已经记录过（被记录过则跳过）
          const mergedRowIndex = tempGroupScoreList[groupScoreIndex].groupArr[
            groupIndex
          ].mergedRowArr.findIndex((mergedRowItem) => {
            return mergedRowItem.index === child.join(",");
          });

          if (mergedRowIndex === -1) {
            tempGroupScoreList[groupScoreIndex].groupArr[
              groupIndex
            ].mergedRowArr.push({
              index: child.join(","),
              scoreArr: child.map((thisRowItem) => {
                return {
                  index: thisRowItem,
                  score:
                    dialogForm.value[type][thisRowItem][`level_${itemsType}`]
                      .score,
                };
              }),
            });
          } else {
            continue;
          }
        }
      }
    }
  }

  return tempGroupScoreList;
};

/** 获取组成绩不同的行索引 */
const getGroupScoreErrorList = (arr: GroupItem[][]) => {
  let result = [] as any[];

  // 遍历列
  for (let colIndex = 0; colIndex < arr.length; colIndex++) {
    if (arr[colIndex].length === 0) continue;

    // 遍历列中的父节点
    for (
      let parentIndex = 0;
      parentIndex < arr[colIndex].length;
      parentIndex++
    ) {
      // 遍历父节点下的分组
      for (
        let groupIndex = 0;
        groupIndex < arr[colIndex][parentIndex].groupArr.length;
        groupIndex++
      ) {
        // 分组分数
        let scoreSum = 0;
        for (
          let i = 0;
          i <
          arr[colIndex][parentIndex].groupArr[groupIndex].mergedRowArr.length;
          i++
        ) {
          // 如果是一组的第一个，则计算分数总和
          if (i === 0) {
            scoreSum =
              arr[colIndex][parentIndex].groupArr[groupIndex].mergedRowArr[
                i
              ].scoreArr.reduce((prev, cur) => prev + cur.score, 0) || 0;
          } else {
            // 如果不是第一个，则判断分数是否相同

            let thisSum =
              arr[colIndex][parentIndex].groupArr[groupIndex].mergedRowArr[
                i
              ].scoreArr.reduce((prev, cur) => prev + cur.score, 0) || 0;
            if (scoreSum !== thisSum) {
              // 不同的话，则代表分组的分数设置有误

              let resultParentIndex = result.findIndex(
                (item) => item.parent === arr[colIndex][parentIndex].parent,
              );

              if (resultParentIndex === -1) {
                result.push({
                  colIndex,
                  parent: arr[colIndex][parentIndex].parent,
                  children: [
                    {
                      group:
                        arr[colIndex][parentIndex].groupArr[groupIndex].group,
                      rows: arr[colIndex][parentIndex].groupArr[groupIndex]
                        .mergedRowArr,
                    },
                  ],
                });
              } else {
                let tempIndex = result[resultParentIndex].children.findIndex(
                  (item: any) => {
                    return (
                      item.group ===
                      arr[colIndex][parentIndex].groupArr[groupIndex].group
                    );
                  },
                );
                if (tempIndex === -1) {
                  result[resultParentIndex].children.push({
                    group:
                      arr[colIndex][parentIndex].groupArr[groupIndex].group,
                    rows: arr[colIndex][parentIndex].groupArr[groupIndex]
                      .mergedRowArr,
                  });
                }
              }
            }
          }
        }
      }
    }
  }

  return result;
};

type GroupItem = {
  /** 父节点的index */
  parent: string;
  /** 分组数组 */
  groupArr: GroupArrItem[];
  [key: string]: any;
};

type GroupArrItem = {
  group: string;
  mergedRowArr: MergedRowArr[];
};

interface MergedRowArr {
  index: string;
  scoreArr: ScoreArrItem[];
}

interface ScoreArrItem {
  index: number;
  score: number;
}

/** 获取表格的分组-成绩列表
 * @param {string} itemsType 列表类型（0，1，2，3）等
 * @param {string} type 列表类型（scoringItems，deductionItems）
 * @returns {any[][]} 分组-成绩列表
 */
const getTableGroupScoreList = (itemsType: string, type: string) => {
  let resultArr = [];

  for (let i = 0; i <= +itemsType!; i++) {
    // 某个层级下的分组分数列表
    let tempGroupScoreList: GroupItem[] = [];

    for (let j = 0; j < dialogForm.value[type].length; j++) {
      // 当前单元格
      let nowCell = dialogForm.value[type][j][`level_${i}`];

      if (nowCell.group) {
        // 父节点数组（可能包含许多被合并的列，第一列的为[-1]）
        let parent = [-1];
        if (i > 0) {
          parent = getNowMergeIndex(
            dialogForm.value[type],
            `level_${i - 1}`,
            j,
            +itemsType!,
          );
        }

        let child = getNowMergeIndex(
          dialogForm.value[type],
          `level_${i}`,
          j,
          +itemsType!,
        );

        // 找到当前单元格在tempGroupScoreList中的索引
        let groupScoreIndex = tempGroupScoreList.findIndex((item) => {
          return item.parent === parent.join(",");
        });

        // 父单元格没有记录过，则新增元素
        if (groupScoreIndex === -1) {
          tempGroupScoreList.push({
            parent: parent.join(","),
            groupArr: [
              {
                group: nowCell.group + "",
                mergedRowArr: [
                  {
                    index: child.join(","),
                    scoreArr: child.map((thisRowItem) => {
                      return {
                        index: thisRowItem,
                        score:
                          dialogForm.value[type][thisRowItem][
                            `level_${itemsType}`
                          ].score,
                      };
                    }),
                  },
                ],
              },
            ],
          });
        } else {
          const groupIndex = tempGroupScoreList[
            groupScoreIndex
          ].groupArr.findIndex(
            (groupItem) => groupItem.group === nowCell.group + "",
          );

          // 如果当前组号没被记录过，则直接添加
          if (groupIndex === -1) {
            tempGroupScoreList[groupScoreIndex].groupArr.push({
              group: nowCell.group + "",
              mergedRowArr: [
                {
                  index: child.join(","),
                  scoreArr: child.map((thisRowItem) => {
                    return {
                      index: thisRowItem,
                      score:
                        dialogForm.value[type][thisRowItem][
                          `level_${itemsType}`
                        ].score,
                    };
                  }),
                },
              ],
            });
          } else {
            // 如果被记录过，则判断当前合并的单元格是否已经记录过（被记录过则跳过）
            const mergedRowIndex = tempGroupScoreList[groupScoreIndex].groupArr[
              groupIndex
            ].mergedRowArr.findIndex((mergedRowItem) => {
              return mergedRowItem.index === child.join(",");
            });

            if (mergedRowIndex === -1) {
              tempGroupScoreList[groupScoreIndex].groupArr[
                groupIndex
              ].mergedRowArr.push({
                index: child.join(","),
                scoreArr: child.map((thisRowItem) => {
                  return {
                    index: thisRowItem,
                    score:
                      dialogForm.value[type][thisRowItem][`level_${itemsType}`]
                        .score,
                  };
                }),
              });
            } else {
              continue;
            }
          }
        }
      }
    }

    resultArr.push(tempGroupScoreList);
  }

  return resultArr;
};

/** 校验规则 */
const rules = {
  sceneTitle: [...getFormItemRule("场景标题", 40, -1, true)],
};
</script>

<style scoped lang="less">
::v-deep(.el-form-item) {
  // 题干，评分标准
  &.label-scene,
  &.label-critera {
    .el-form-item__content {
      line-height: unset;
    }
  }
}

.primary-text {
  color: var(--el-color-primary);
}
</style>
