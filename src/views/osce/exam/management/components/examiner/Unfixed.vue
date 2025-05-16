<template>
  <div class="h-600px flex flex-col" id="management-examiner-concern-container">
    <el-table
      ref="tableRef"
      v-loading="loading"
      :data="tableData"
      class="w-full"
      stripe
      style="height: 100%"
    >
      <template #empty> <el-empty description="暂无数据" /> </template>
      <el-table-column
        type="index"
        label="序号"
        width="55"
        fixed
        align="center"
      />
      <el-table-column
        prop="roomName"
        label="考站"
        fixed
        show-overflow-tooltip
        min-width="150px"
      />
      <el-table-column
        prop="skillTypeName"
        label="技能类型"
        show-overflow-tooltip
        min-width="150px"
      />
      <el-table-column
        prop=""
        label="技能"
        class-name="divider-col"
        label-class-name="divider-col-label"
        min-width="120px"
      >
        <template #default="{ row }">
          <div class="divider-father">
            <div v-for="item in row.skillDetails" class="inner-row">
              <el-tooltip
                effect="dark"
                :content="`${item.skillName}`"
                placement="top-start"
              >
                <div class="truncate cursor-default inner-row-item">
                  {{ `${item.skillName}` }}
                </div>
              </el-tooltip>
              <div class="divider-custom"></div>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column
        prop=""
        label="评分标准"
        class-name="divider-col"
        label-class-name="divider-col-label"
        min-width="120px"
      >
        <template #default="{ row }">
          <div class="divider-father">
            <div v-for="item in row.skillDetails" class="inner-row">
              <el-tooltip
                effect="dark"
                :content="`${item.sceneTitle}`"
                placement="top-start"
              >
                <div class="truncate cursor-default inner-row-item">
                  {{ `${item.sceneTitle}` }}
                </div>
              </el-tooltip>
              <div class="divider-custom"></div>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column
        prop="duration"
        label="时长（分钟）"
        show-overflow-tooltip
        min-width="110px"
        align="center"
      />
      <el-table-column
        prop="chiefExaminerName"
        label="主考官"
        show-overflow-tooltip
        min-width="100px"
        align="center"
      />
      <el-table-column
        prop="chiefExaminerRatio"
        label="权重"
        show-overflow-tooltip
        width="60px"
        align="center"
      />
      <el-table-column
        prop="deputyExaminerName"
        label="副考官"
        show-overflow-tooltip
        min-width="100px"
        align="center"
      />
      <el-table-column
        prop="deputyExaminerRatio"
        label="权重"
        show-overflow-tooltip
        width="60px"
        align="center"
      />
      <el-table-column
        v-if="examMsg!.scoreDifferenceDetection"
        prop="scoreDifferenceRatio"
        label="分差限制"
        show-overflow-tooltip
        width="120px"
        align="center"
      />
      <el-table-column label="操作" fixed="right" width="80px" align="center">
        <template #default="{ row }">
          <el-button size="small" type="primary" @click="onEdit(row)" text>
            编辑
          </el-button>
        </template>
      </el-table-column>
    </el-table>

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

    <!-- 弹窗 -->
    <el-dialog
      v-model="dialogFormVisible"
      title="编辑"
      width="800px"
      @closed="onDialogClose"
      align-center
      :close-on-click-modal="false"
    >
      <el-form :model="dialogForm" ref="dialogFromRef" label-position="top">
        <el-row :gutter="40">
          <el-col :span="12">
            <el-form-item label="考站" prop="roomName">
              <el-input v-model="dialogForm.roomName" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="技能类型" prop="skillTypeId">
              <el-select
                v-model="dialogForm.skillTypeId"
                placeholder="请选择技能类型"
                class="w-full"
                @change="(value) => typeChange(value, dialogForm)"
                clearable
                filterable
              >
                <el-option
                  v-for="item in skillTypesList"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="技能及评分标准" prop="skillDetails">
              <div
                v-for="(item, index) in dialogForm.skillDetails"
                class="skill-detail-item"
              >
                <el-select
                  v-model="item.skillId"
                  placeholder="请选择技能"
                  class="w-3/8 pr-10px"
                  @change="(value) => skillChange(value, item)"
                  clearable
                  filterable
                >
                  <el-option
                    v-for="i in skillList"
                    :key="i.id"
                    :label="i.name"
                    :value="i.id"
                    :disabled="skillDisabled(i, item)"
                  />
                </el-select>
                <el-select
                  v-model="item.criteriaId"
                  placeholder="请选择评分标准"
                  class="w-4/8 pr-10px"
                  @change="(value) => criteriaChange(value, item)"
                  clearable
                  filterable
                >
                  <el-option
                    v-for="i in item.options"
                    :key="i.id"
                    :label="i.sceneTitle"
                    :value="i.id"
                  />
                </el-select>
                <el-button
                  type="danger"
                  plain
                  class="w-90px"
                  @click="delSkill(dialogForm.skillDetails, index)"
                >
                  删除
                  <template #icon>
                    <Icon icon="ant-design:delete-outlined" size="15px" />
                  </template>
                </el-button>
              </div>
              <div class="w-full">
                <el-button
                  type="primary"
                  plain
                  class="w-full"
                  @click="addSkill(dialogForm.skillDetails)"
                  :disabled="!dialogForm.skillTypeId || skillAddBtnDisabled()"
                >
                  新增
                  <template #icon>
                    <Icon icon="ant-design:plus-outlined" size="15px" />
                  </template>
                </el-button>
              </div>
            </el-form-item>
            <!-- <el-form-item>
              <div class="w-full" v-if="dialogForm.skillDetails.length > 0">
                <el-button
                  type="primary"
                  plain
                  class="w-full"
                  @click="addSkill(dialogForm.skillDetails)"
                  :disabled="!dialogForm.skillTypeId || skillAddBtnDisabled()"
                  >新增</el-button
                >
              </div>
            </el-form-item> -->
          </el-col>
          <el-col :span="24">
            <el-form-item label="时长" prop="duration">
              <el-input-number
                v-model="dialogForm.duration"
                :min="1"
                :step="1"
                step-strictly
                @keydown="onDurationKeyDown"
                @blur="onDurationBlur"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="主考官" prop="chiefExaminerId">
              <el-select
                v-model="dialogForm.chiefExaminerId"
                placeholder="请选择主考官"
                class="w-full"
                @change="chiefExaminerChange"
                filterable
              >
                <el-option
                  v-for="item in examinerOption"
                  :key="item.id"
                  :label="`${item.user.name} ${
                    item.employeeNumber ? item.employeeNumber : ''
                  }`"
                  :value="item.id"
                  :disabled="chiefExaminerDisabled(item)"
                >
                  <template #default>
                    <div class="flex justify-between w-full">
                      <div>{{ item.user.name }}</div>
                      <div>
                        {{ item.employeeNumber ? item.employeeNumber : "" }}
                      </div>
                    </div>
                  </template>
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="主考官权重" prop="chiefExaminerRatio">
              <el-input-number
                v-model.number="dialogForm.chiefExaminerRatio"
                :min="0"
                :max="100"
                :step="1"
                step-strictly
                @change="chiefExaminerRatioChange"
                :disabled="!dialogForm.deputyExaminerId"
                @keydown="onNumberInputKeydown"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="副考官" prop="deputyExaminerId">
              <el-select
                v-model="dialogForm.deputyExaminerId"
                placeholder="请选择副考官"
                class="w-full"
                @change="deputyExaminerChange"
                clearable
                filterable
              >
                <el-option
                  v-for="item in examinerOption"
                  :key="item.id"
                  :label="`${item.user.name} ${
                    item.employeeNumber ? item.employeeNumber : ''
                  }`"
                  :value="item.id"
                  :disabled="deputyExaminerDisabled(item)"
                >
                  <template #default>
                    <div class="flex justify-between w-full">
                      <div>{{ item.user.name }}</div>
                      <div>
                        {{ item.employeeNumber ? item.employeeNumber : "" }}
                      </div>
                    </div>
                  </template>
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="副考官权重" prop="deputyExaminerRatio">
              <el-input-number
                v-model.number="dialogForm.deputyExaminerRatio"
                :min="0"
                :max="100"
                :step="1"
                step-strictly
                @change="deputyExaminerRatioChange"
                :disabled="!dialogForm.deputyExaminerId"
                @keydown="onNumberInputKeydown"
              />
            </el-form-item>
          </el-col>
          <el-col
            :span="12"
            v-if="
            examMsg!.scoreDifferenceDetection && dialogForm.deputyExaminerId
          "
          >
            <el-form-item label="分差限制" prop="scoreDifferenceRatio">
              <el-input-number
                v-model.number="dialogForm.scoreDifferenceRatio"
                :min="0"
                :max="100"
                :step="1"
                step-strictly
                @keydown="onNumberInputKeydown"
                @change="scoreDifferenceRatioChange"
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
          <el-button type="primary" @click="onDialogSubmit"> 确定 </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { useExamEditorState } from "../examEditorState";
import {
  getArrangementsListApi,
  modifyArrangementsListApi,
} from "@/api/osce/exam/management";
import {
  getOsceSkillTypesListApi,
  getOsceSkillTypesSkillsListApi,
  getCriteriaListApi,
} from "@/api/osce/question/question";
import {
  getExaminerListApi,
  ExaminerListItemType,
} from "@/api/osce/personnel/examiner";
import { getStationsListApi } from "@/api/osce/exam/management";

const {
  examinationId,
  activeComIndex,
  updateExamMsg,
  examMsg,
  dialogVisible: editorVisible,
} = useExamEditorState();

/** 阻止考试时长输入运算符 */
const onDurationKeyDown = (event: KeyboardEvent) => {
  // 阻止输入运算符
  if (event.key === "+" || event.key === "-") {
    event.preventDefault();
  }
};

/** 考试时长不能为空 */
const onDurationBlur = (event: FocusEvent) => {
  const target = event.target as HTMLInputElement & {
    value: any;
  };
  if (!target.value) {
    dialogForm.value.duration = 1;
  }
};

onMounted(() => {
  fetch();
});
/** 拉取列表 */
const loading = ref(false);
const tableData = ref<any[]>([]);
const fetch = () => {
  loading.value = true;
  getArrangementsListApi({}, examinationId.value!)
    .then((res) => {
      getStationsListApi(examinationId.value!)
        .then((stationRws) => {
          let serverStationsId = res.arrangements.map((i: any) => i.stationId);
          let nowArrangements = stationRws.stations.map((item: any) => {
            if (serverStationsId.includes(item.id)) {
              return res.arrangements.find((i: any) => i.stationId == item.id);
            } else {
              let obj = {
                stationId: item.id,
                roomName: item.roomName,
                skillTypeId: undefined,
                skillTypeName: "",
                skillDetails: [],
                duration: 10,
                chiefExaminerId: undefined,
                chiefExaminerName: "",
                chiefExaminerRatio: 100,
                deputyExaminerId: undefined,
                deputyExaminerName: "",
                deputyExaminerRatio: 0,
                scoreDifferenceRatio: undefined,
              };
              return obj;
            }
          });
          tableData.value = nowArrangements;
          loading.value = false;
        })
        .catch(() => {
          loading.value = false;
        });
    })
    .catch(() => {
      loading.value = false;
    });
};

/** 编辑 */
const dialogFormVisible = ref(false);
const dialogForm = ref<{
  chiefExaminerName: string;
  [key: string]: any;
}>({
  skillDetails: [],
  chiefExaminerName: "",
});
/** 编辑的行以stationId为主键 */
const editRowId = ref();
const editRow = ref();
const onEdit = async (row: any) => {
  editRowId.value = row.stationId;
  editRow.value = row;
  let temp = JSON.parse(JSON.stringify(row));
  dialogForm.value = temp;
  // 初始化编辑(所需要的列表)
  let tag = await editInit(temp);
  if (tag) {
    dialogFormVisible.value = true;
  }
};
/** 关闭弹窗时 */
const onDialogClose = () => {};
/** 编辑框提交 */
const dialogFromRef = ref();
const onDialogSubmit = () => {
  let validateList = [];
  if (!dialogForm.value.skillTypeId) {
    validateList.push("没有选择技能类型");
  }
  if (dialogForm.value.skillDetails.length === 0) {
    validateList.push("没有添加技能及评分标准");
  } else {
    for (let i of dialogForm.value.skillDetails) {
      if (!i.skillId) {
        validateList.push("没有选择技能");
        break;
      } else if (!i.criteriaId) {
        validateList.push("没有选择评分标准");
        break;
      }
    }
  }
  if (!dialogForm.value.chiefExaminerId) {
    validateList.push("没有选择主考官");
  }

  if (validateList.length > 0) {
    let str = validateList
      .map((i) => {
        return `<div><strong>${i}</strong></div>`;
      })
      .join("");
    CmeMessageBox.confirm(
      `<div>数据没有填写完整，可能会导致无法保存，问题如下：</div>${str}<div>确定继续吗?</div>`,
      "系统提示",
      {
        dangerouslyUseHTMLString: true,
        distinguishCancelAndClose: true,
        confirmButtonText: "确定",
        cancelButtonText: "取消",
      },
    )
      .then(() => {
        // submit();
      })
      .catch(() => {});
  } else {
    submit();
  }

  /** 弹窗校验通过后的提交，在这里会将相同技能类型的行的部分内容覆盖
   * 覆盖包括：技能类型、技能、评分标准、时长、主考官比例、副考官比例
   */
  function submit() {
    let index = tableData.value
      .map((item) => item.stationId)
      .indexOf(editRowId.value);

    // // 如果没有副考官，则分差设置为100
    // if (!dialogForm.value.deputyExaminerName) {
    //   dialogForm.value.scoreDifferenceRatio = 100;
    // }

    tableData.value.splice(index, 1, dialogForm.value);
    for (let i of tableData.value) {
      if (i.skillTypeId === dialogForm.value.skillTypeId) {
        i.skillDetails = dialogForm.value.skillDetails;
        i.duration = dialogForm.value.duration;
        i.chiefExaminerRatio = dialogForm.value.chiefExaminerRatio;
        i.deputyExaminerRatio = dialogForm.value.deputyExaminerRatio;
        i.scoreDifferenceRatio = dialogForm.value.scoreDifferenceRatio;
      }
    }
    dialogFormVisible.value = false;
  }
};
/** 技能类型改变 */
const typeChange = (value: any, row: any) => {
  if (value) {
    // 设置技能类型名
    row.skillTypeName =
      skillTypesList.value.find((item) => item.id === value)?.name || "";

    // 技能类型与当前选择的技能类型一样的item
    let alreadyItem = tableData.value.find(
      (item) => item.skillTypeId === value,
    );

    // 如果当前选择的技能类型已经存在，将已经存在的技能类型的（技能及评分标准）赋值给当前行
    if (alreadyItem) {
      row.skillDetails = JSON.parse(JSON.stringify(alreadyItem.skillDetails));
      row.scoreDifferenceRatio = alreadyItem.scoreDifferenceRatio;
      getCriteriaOption(row);
    } else {
      row.skillDetails = [
        {
          skillId: undefined,
          skillName: "",
          criteriaId: undefined,
          sceneTitle: "",
          options: [],
        },
      ];
    }

    getSkillOption(row);
  } else {
    row.skillDetails = [];
  }
};
/** 技能改变 */
const skillChange = (value: any, item: any) => {
  item.skillName = skillList.value.find((i) => i.id === value)?.name || "";
  item.criteriaId = undefined;
  item.sceneTitle = "";
  getCriteriaOption(dialogForm.value);
};

/** 技能禁选 */
const skillDisabled = (i: any, item: any) => {
  let selectSkillIdArr = dialogForm.value.skillDetails.map(
    (x: any) => x.skillId,
  );
  selectSkillIdArr.splice(selectSkillIdArr.indexOf(item.skillId), 1);

  return selectSkillIdArr.includes(i.id);
};

/** 新增技能按钮禁用 */
const skillAddBtnDisabled = () => {
  let selectSkillIdArr = dialogForm.value.skillDetails.map(
    (x: any) => x.skillId,
  );
  if (selectSkillIdArr.length >= skillList.value.length) {
    return true;
  } else {
    return false;
  }
};

/** 评分标准改变 */
const criteriaChange = (value: any, item: any) => {
  item.sceneTitle =
    item.options.find((i: any) => i.id === value)?.sceneTitle || "";
};
/** 主考官变化 */
const chiefExaminerChange = (val: number) => {
  dialogForm.value.chiefExaminerName =
    examinerOption.value.find((item) => item.id === val)?.user.name || "";
};
/** 副考官变化 */
const deputyExaminerChange = (val: number) => {
  // 赋值副考官
  dialogForm.value.deputyExaminerName =
    examinerOption.value.find((item) => item.id === val)?.user.name || "";

  // 如果权重为100：0，则将权重改为50：50
  if (
    dialogForm.value.chiefExaminerRatio === 100 &&
    dialogForm.value.deputyExaminerRatio === 0
  ) {
    dialogForm.value.chiefExaminerRatio = 50;
    dialogForm.value.deputyExaminerRatio = 50;
  }

  // 如果副考官置空，则将权重改为100：0
  if (!val) {
    dialogForm.value.deputyExaminerRatio = 0;
    dialogForm.value.chiefExaminerRatio = 100;
  }

  // 如果开启了分差检测
  if (examMsg.value!.scoreDifferenceDetection) {
    if (val) {
      // 当前有副考官，没有分差值，则设置分叉之默认为100
      if (!dialogForm.value.scoreDifferenceRatio) {
        dialogForm.value.scoreDifferenceRatio = 100;
      }
    } else {
      // 如果是删除了考官，将分差值删除
      delete dialogForm.value.scoreDifferenceRatio;
    }
  }
};
/** 主考官禁选 */
const chiefExaminerDisabled = computed(() => (item: ExaminerListItemType) => {
  let arr = [];
  for (let i of tableData.value) {
    if (i.deputyExaminerId) arr.push(i.deputyExaminerId);
    if (i.chiefExaminerId) arr.push(i.chiefExaminerId);
  }
  // arr是所有的主考官和副考官的id数组
  arr = [...new Set(arr)];
  // 当前考站的考官id数组
  let thisArr = [editRow.value.chiefExaminerId, editRow.value.deputyExaminerId];
  // 其他考站的考官id数组
  let otherArr = arr.filter((i) => thisArr.includes(i) === false);
  // return arr.includes(item.id) || item.id === dialogForm.value.deputyExaminerId;
  return (
    otherArr.includes(item.id) || item.id === dialogForm.value.deputyExaminerId
  );
});
/** 副考官禁选 */
const deputyExaminerDisabled = computed(() => (item: ExaminerListItemType) => {
  let arr = [];
  for (let i of tableData.value) {
    if (i.deputyExaminerId) arr.push(i.deputyExaminerId);
    if (i.chiefExaminerId) arr.push(i.chiefExaminerId);
  }
  // arr是所有的主考官和副考官的id数组
  arr = [...new Set(arr)];
  // 当前考站的考官id数组
  let thisArr = [editRow.value.chiefExaminerId, editRow.value.deputyExaminerId];
  // 其他考站的考官id数组
  let otherArr = arr.filter((i) => thisArr.includes(i) === false);
  return (
    otherArr.includes(item.id) || item.id === dialogForm.value.chiefExaminerId
  );
});
/** 删除技能 */
const delSkill = (arr: any[], index: number) => {
  arr.splice(index, 1);
};
/** 新增技能 */
const addSkill = (arr: any[]) => {
  if (dialogForm.value.skillTypeId) {
    let obj = {
      skillId: undefined,
      skillName: "",
      criteriaId: undefined,
      sceneTitle: "",
      options: [],
    };
    arr.push(obj);
  } else {
    CmeMessage({
      title: "提示",
      message: "请先选择技能类型",
      type: "warning",
    });
  }
};
/** 初始化编辑所需要的列表 */
const editInit = async (row: any) => {
  let promiseST = getOsceSkillTypesListApi({})
    .then((res) => {
      skillTypesList.value = res.dataList;
    })
    .catch(() => {});
  let promiseS = new Promise<void>((resolve, reject) => {
    if (!row.skillTypeId) {
      resolve();
    } else {
      // 获取技能选择列表
      getOsceSkillTypesSkillsListApi({}, row.skillTypeId)
        .then((res) => {
          skillList.value = res.dataList;
          resolve();
        })
        .catch(() => {
          reject();
        });
    }
  });
  let promiseC = new Promise<void>((resolve, reject) => {
    if (!row.skillTypeId) {
      resolve();
    } else {
      let tempPromises = row.skillDetails.map((i: any) => {
        if (i.skillId) {
          return getCriteriaListApi({}, row.skillTypeId, i.skillId)
            .then((res) => {
              i.options = res.dataList;
            })
            .catch(() => {});
        } else {
          i.options = [];
          return Promise.resolve();
        }
      });
      Promise.all(tempPromises)
        .then(() => {
          resolve();
        })
        .catch(() => {
          reject();
        });
    }
  });
  let promiseE = getExaminerListApi({})
    .then((res) => {
      examinerOption.value = res.dataList;
    })
    .catch(() => {});
  return await Promise.all([promiseST, promiseS, promiseC, promiseE])
    .then(() => {
      return true;
    })
    .catch(() => {
      return false;
    });
  // // 获取技能类型选择列表
  // getSkillTypeOption();
  // // 获取技能选择列表
  // getSkillOption(row);
  // // 获取评分标准列表
  // getCriteriaOption(row);
  // // 获取考官列表
  // getExaminerOption();
};
/** 获取option */
const skillTypesList = ref<any[]>([]);
const skillList = ref<any[]>([]);
const examinerOption = ref<any[]>([]);
const getSkillOption = (row: any) => {
  if (!row.skillTypeId) {
    return;
  }
  // 获取技能选择列表
  getOsceSkillTypesSkillsListApi({}, row.skillTypeId)
    .then((res) => {
      skillList.value = res.dataList;
    })
    .catch(() => {});
};

/** 为当前行获取需要用到的评分标准列表 */
const getCriteriaOption = (row: any) => {
  if (!row.skillTypeId) {
    return;
  }
  row.skillDetails.forEach((i: any) => {
    if (i.skillId) {
      getCriteriaListApi({}, row.skillTypeId, i.skillId)
        .then((res) => {
          i.options = res.dataList;
        })
        .catch(() => {});
    } else {
      i.options = [];
    }
  });
};
/** 主考官权重变化 */
const chiefExaminerRatioChange = (val?: number) => {
  if (val === undefined || val === null) {
    dialogForm.value.chiefExaminerRatio = 0;
  }
  // 对权重四舍五入（不允许有小数）
  dialogForm.value.chiefExaminerRatio = Math.round(
    dialogForm.value.chiefExaminerRatio,
  );
  dialogForm.value.deputyExaminerRatio =
    100 - dialogForm.value.chiefExaminerRatio;
};
/** 副考官权重变化 */
const deputyExaminerRatioChange = (val?: number) => {
  if (val === undefined || val === null) {
    dialogForm.value.deputyExaminerRatio = 0;
  }
  // 对权重四舍五入（不允许有小数）
  dialogForm.value.deputyExaminerRatio = Math.round(
    dialogForm.value.deputyExaminerRatio,
  );
  dialogForm.value.chiefExaminerRatio =
    100 - dialogForm.value.deputyExaminerRatio;
};
/** 分差检测变化 */
const scoreDifferenceRatioChange = (val?: number) => {
  if (val === undefined || val === null) {
    dialogForm.value.scoreDifferenceRatio = 0;
  }
};

/** 设置数字输入框不能输入加减号 */
const onNumberInputKeydown = (e: any) => {
  let key = e.key;
  if (key === "+" || key === "-" || key === ".") {
    e.returnValue = false;
  } else {
    e.returnValue = true;
  }
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
  let valid = true;
  for (let i of tableData.value) {
    if (!i.skillTypeId) {
      CmeMessage({
        title: "提示",
        message: "请将技能类型填写完整",
        type: "warning",
      });
      valid = false;
      break;
    }
    if (!i.chiefExaminerId) {
      CmeMessage({
        title: "提示",
        message: "请将主考官填写完整",
        type: "warning",
      });
      valid = false;
      break;
    }
    if (i.deputyExaminerRatio !== 0 && !i.deputyExaminerId) {
      CmeMessage({
        title: "提示",
        message: "请将副考官填写完整",
        type: "warning",
      });
      valid = false;
      break;
    }
    if (i.skillDetails.length === 0) {
      CmeMessage({
        title: "提示",
        message: "技能及评分标准等内容填写完整",
        type: "warning",
      });
      valid = false;
      break;
    } else {
      for (let j of i.skillDetails) {
        if (!j.criteriaId || !j.skillId) {
          valid = false;
          break;
        }
      }
    }
  }

  if (!valid) {
    tag = false;
    return tag;
  } else {
    await modifyArrangementsListApi(
      {
        arrangements: tableData.value,
      },
      examinationId.value!,
    )
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
  }
  return tag;
};
</script>

<style scoped lang="less">
// 技能及评分标准 列表项
.skill-detail-item {
  @apply flex mb-10px items-center w-full;
  border-radius: var(--el-border-radius-base);
  // @apply px-10px h-46px;
  // background-color: var(--el-color-primary-light-9);
}

.divider-father .inner-row:not(:last-child) .divider-custom {
  @apply w-full h-1px mt-1 mb-1;
  background-color: var(--el-table-border-color);
}
.inner-row-item {
  padding: 0 10px;
}
::v-deep(.divider-col-label .cell) {
  padding: 0 10px !important;
}
::v-deep(.divider-col .cell) {
  padding: 0;
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
