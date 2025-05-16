<template>
  <div class="h-600px flex flex-col" id="management-examiner-concern-container">
    <div class="management-examiner-concern mb-10px">
      <el-form
        :model="fixedForm"
        ref="fixedFromRef"
        :rules="fixedFormRules"
        @submit.prevent
        class="flex"
        label-width="120"
      >
        <el-form-item label="考站考试时长" prop="duration">
          <el-input-number
            placeholder="请输入考站考试时长"
            v-model="fixedForm.duration"
            :min="1"
            :step="1"
            step-strictly
            @keydown="onDurationKeyDown"
            @blur="onDurationBlur"
            @change="onFixedDurationChange"
          />
        </el-form-item>
        <el-form-item label="考站组数" prop="groupCount">
          <el-select
            v-model="fixedForm.groupCount"
            placeholder="请选择考站组数"
            filterable
            style="width: 150px"
          >
            <el-option
              v-for="i in groupCountOptions"
              :key="i"
              :label="i"
              :value="i"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="换站时长" prop="interval">
          <el-input-number
            placeholder="请输入换站时长"
            v-model="fixedForm.interval"
            :min="0"
            :step="1"
            step-strictly
            @keydown="onDurationKeyDown"
            @blur="onIntervalBlur"
          />
        </el-form-item>
      </el-form>
    </div>

    <el-table
      ref="tableRef"
      v-loading="loading"
      :data="tableData"
      class="w-full drag-table-container"
      row-class-name="can-drag hover-tag"
      row-key="stationId"
      stripe
      style="height: 100%"
    >
      <template #empty> <el-empty description="暂无数据" /> </template>
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
        prop="roomName"
        label="考站"
        fixed
        show-overflow-tooltip
        min-width="150px"
        class-name="fixed-col"
      >
        <template #default="{ row }">
          <div class="flex justify-between">
            <div class="overflow-hidden flex items-center">
              <el-tooltip effect="dark" :content="row.roomName" placement="top">
                <div class="w-full truncate cursor-default">
                  {{ row.roomName }}
                </div>
              </el-tooltip>
            </div>
            <div class="drag-handle flex-none">
              <el-icon
                ><Icon
                  icon="ant-design:drag-outlined"
                  color="var(--el-color-primary)"
              /></el-icon>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column
        prop="group"
        label="组别"
        fixed
        show-overflow-tooltip
        width="55px"
        align="center"
        class-name="fixed-col"
      >
        <template #default="{ $index }">
          {{ getGroupNum($index) }}
        </template>
      </el-table-column>
      <el-table-column
        prop="skillTypeName"
        label="技能类型"
        show-overflow-tooltip
        min-width="145px"
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
              <TextTooltip :content="item.skillName" />
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
              <TextTooltip :content="item.sceneTitle" />
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
      <el-table-column
        label="操作"
        fixed="right"
        width="80px"
        align="center"
        class-name="fixed-col"
      >
        <template #default="{ row }">
          <el-button text size="small" type="primary" @click="onEdit(row)">
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

    <!-- TODO 打开速度慢优化 -->
    <!-- 弹窗 -->
    <el-dialog
      v-model="dialogFormVisible"
      title="编辑"
      width="800px"
      @closed="onDialogClose"
      align-center
      :close-on-click-modal="false"
    >
      <el-form
        :model="dialogForm"
        label-width="120px"
        ref="dialogFromRef"
        label-position="top"
      >
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
                  :disabled="
                    skillTypeDisabled(
                      item,
                      tableData,
                      fixedForm.groupCount,
                      tableData.findIndex(
                        (el) => el.stationId === dialogForm.stationId,
                      ),
                    )
                  "
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="技能及评分标准" prop="skillDetails">
              <div class="w-full">
                <div
                  v-for="(item, index) in dialogForm.skillDetails"
                  class="flex mb-10px"
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
                    class="w-1/8"
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
                    >新增</el-button
                  >
                </div>
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="时长" prop="duration">
              <el-input-number
                v-model="dialogForm.duration"
                :min="1"
                disabled
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
import Sortable from "sortablejs";
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
import { isNumber } from "@/request/utils/is";

const {
  examinationId,
  activeComIndex,
  dialogVisible: editorVisible,
  updateExamMsg,
  examMsg,
} = useExamEditorState();

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
        .then((stationRes) => {
          let serverStationsId = res.arrangements.map((i: any) => i.stationId);
          // 为没有考试安排的考站创建空安排
          let emptyArrangements = stationRes.stations
            .filter((i: any) => !serverStationsId.includes(i.id))
            .map((i: any) => {
              let obj = {
                stationId: i.id,
                roomName: i.roomName,
                skillTypeId: undefined,
                skillTypeName: "",
                skillDetails: [],
                duration: isNumber(res.duration) ? res.duration : 10,
                chiefExaminerId: undefined,
                chiefExaminerName: "",
                chiefExaminerRatio: 100,
                deputyExaminerId: undefined,
                deputyExaminerName: "",
                deputyExaminerRatio: 0,
                scoreDifferenceRatio: undefined,
              };
              return obj;
            });
          let nowArrangements = [...res.arrangements, ...emptyArrangements];
          tableData.value = nowArrangements;
          fixedForm.value.groupCount = isNumber(res.groupCount)
            ? res.groupCount
            : 1;
          fixedForm.value.duration = isNumber(res.duration) ? res.duration : 10;
          fixedForm.value.interval = isNumber(res.interval) ? res.interval : 1;
          // 去重第一组
          setGroupTypeUnique(fixedForm.value.groupCount);
          // 设置其他组的数据与第一组相同
          setGroupSame(fixedForm.value.groupCount);
          setSortable();
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
      `<div>数据没有填写完整，可能会导致无法保存，问题如下：</div>${str}`,
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

  function submit() {
    let index = tableData.value
      .map((item) => item.stationId)
      .indexOf(editRowId.value);
    tableData.value.splice(index, 1, dialogForm.value);
    for (let i of tableData.value) {
      if (i.skillTypeId === dialogForm.value.skillTypeId) {
        i.skillDetails = dialogForm.value.skillDetails;
        i.scoreDifferenceRatio = dialogForm.value.scoreDifferenceRatio;
      }
    }
    // 组数据同步
    setGroupSame(fixedForm.value.groupCount, index);
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

    // 如果当前选择的技能类型已经存在，将已经存在的技能类型的（技能及评分标准）
    if (alreadyItem) {
      row.skillDetails = JSON.parse(JSON.stringify(alreadyItem.skillDetails));
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
    // 校验技能类型
    if (!i.skillTypeId) {
      valid = false;
      break;
    }
    // 校验主考官
    if (!i.chiefExaminerId) {
      valid = false;
      break;
    }
    // 校验技能和评分表
    if (i.skillDetails.length === 0) {
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
  // 校验考官信息
  if (valid && validExaminer(fixedForm.value.groupCount)) {
    valid = false;
  }

  if (!valid) {
    CmeMessage({
      title: "提示",
      message: "请将技能类型、技能及评分标准、考官等内容填写完整",
      type: "warning",
    });
    tag = false;
    return tag;
  } else {
    let arrangements = [] as any[];
    JSON.parse(JSON.stringify(tableData.value)).forEach(
      (item: any[], index: number) => {
        arrangements.push({
          ...item,
          group: getGroupNum(index),
        });
      },
    );
    let obj = {
      ...fixedForm.value,
      arrangements,
    };
    await modifyArrangementsListApi(obj, examinationId.value!)
      .then(() => {
        CmeMessage({
          title: "成功",
          message: "保存成功",
          type: "success",
        });
        return true;
      })
      .catch(() => {
        tag = false;
      });
  }
  return tag;
};

/**
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * 下方为0.2.0固定模式的内容
 */

/** 自定义序号（解决拖动排序后序号混乱） */
const customIndex = (row: any) => {
  return tableData.value.indexOf(row) + 1;
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
      swap: true,
      // multiDrag: false,
      swapClass: "swapHighlight",
      dragClass: "sortable-drag",
      onUpdate: function (evt: any) {
        // 酯交换考站信息
        let tempNew = JSON.parse(JSON.stringify(tableData.value[evt.newIndex]));
        let tempOld = JSON.parse(JSON.stringify(tableData.value[evt.oldIndex]));
        tableData.value[evt.oldIndex].roomName = tempNew.roomName;
        tableData.value[evt.oldIndex].roomNumber = tempNew.roomNumber;
        tableData.value[evt.oldIndex].stationId = tempNew.stationId;

        tableData.value[evt.newIndex].roomName = tempOld.roomName;
        tableData.value[evt.newIndex].roomNumber = tempOld.roomNumber;
        tableData.value[evt.newIndex].stationId = tempOld.stationId;
        // 交换除了技能类型、技能和评分表之外的所有信息
        // tableData.value[evt.oldIndex] = JSON.parse(JSON.stringify(tempNew));
        // tableData.value[evt.oldIndex].skillTypeName = tempOld.skillTypeName;
        // tableData.value[evt.oldIndex].skillTypeId = tempOld.skillTypeId;
        // tableData.value[evt.oldIndex].skillDetails = JSON.parse(
        //   JSON.stringify(tempOld.skillDetails)
        // );
        // tableData.value[evt.newIndex] = JSON.parse(JSON.stringify(tempOld));
        // tableData.value[evt.newIndex].skillTypeName = tempNew.skillTypeName;
        // tableData.value[evt.newIndex].skillTypeId = tempNew.skillTypeId;
        // tableData.value[evt.newIndex].skillDetails = JSON.parse(
        //   JSON.stringify(tempNew.skillDetails)
        // );

        // // 组数据同步
        // setGroupSame(fixedForm.value.groupCount);
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
        setTimeout(() => {
          tableElement.forEach((item) => {
            item.classList.add("hover-tag");
          });
        }, 0);
      },
    });
  });
};

/** 阻止考试时长输入运算符 */
const onDurationKeyDown = (event: KeyboardEvent) => {
  // 阻止输入运算符
  if (event.key === "+" || event.key === "-") {
    event.preventDefault();
  }
};

/** 考试时长不能为空，至少为1 */
const onDurationBlur = (event: FocusEvent) => {
  const target = event.target as HTMLInputElement & {
    value: any;
  };
  if (!target.value) {
    fixedForm.value.duration = 1;
  }
};

/** 换站时长不能未空，至少为1 */
const onIntervalBlur = (event: FocusEvent) => {
  const target = event.target as HTMLInputElement & {
    value: any;
  };
  if (!target.value) {
    fixedForm.value.interval = 1;
  }
};

/** 固定模式需要的几个字段 */
const fixedForm = ref<{
  groupCount: number;
  duration: number;
  interval: number;
}>({
  groupCount: 1,
  duration: 10,
  interval: 1,
});

/** fixedForm考站考试时长发生变化 */
const onFixedDurationChange = (newVal: number | undefined) => {
  if (!newVal) {
    fixedForm.value.duration = 1;
  }
  for (let i of tableData.value) {
    i.duration = fixedForm.value.duration;
  }
};

/** 考站组数可选列表 */
const groupCountOptions = computed(() => {
  const divisors = [];
  for (let i = 1; i <= tableData.value.length; i++) {
    if (tableData.value.length % i === 0) {
      divisors.push(i);
    }
  }
  return divisors;
});

/** 设置组别 */
const getGroupNum = (index: number) => {
  let group = Math.floor(
    index / (tableData.value.length / fixedForm.value.groupCount),
  );
  return group + 1;
};

/** 去重第一组 */
const setGroupTypeUnique = (count: number) => {
  // 第一组的数据
  let tempArr = [];
  let groupHasStationNum = tableData.value.length / count;
  // 将tableData分为newVal组
  for (let i = 0; i < groupHasStationNum; i++) {
    tempArr.push(tableData.value[i]);
  }

  // skillTypeId数组：不重复并且不为空
  let setArr = [
    ...new Set(tempArr.map((item) => item.skillTypeId).filter(Boolean)),
  ];
  // 将第一组重复的技能类型清空
  for (let i = 0; i < groupHasStationNum; i++) {
    if (setArr.includes(tempArr[i].skillTypeId)) {
      setArr.splice(setArr.indexOf(tempArr[i].skillTypeId), 1);
    } else if (tempArr[i].skillTypeId) {
      tempArr[i] = {
        stationId: tempArr[i].stationId,
        roomName: tempArr[i].roomName,
        skillTypeId: undefined,
        skillTypeName: "",
        skillDetails: [],
        duration: fixedForm.value.duration,
        chiefExaminerId: undefined,
        chiefExaminerName: "",
        chiefExaminerRatio: 100,
        deputyExaminerId: undefined,
        deputyExaminerName: "",
        deputyExaminerRatio: 0,
        scoreDifferenceRatio: 100,
      };
    }
  }

  // 将tableData的第一组去掉
  tableData.value.splice(0, groupHasStationNum);
  // 将去重后的第一组放进tableData
  tableData.value = [...tempArr, ...[...tableData.value]];
};

/**
 * 将不同组的数据设置为一第一组数据相同
 * @param count 总组数
 * @param index 编辑行时需要传入，
 */
const setGroupSame = (count: number, rowIndex?: number) => {
  let temp = [];
  let groupHasStationNum = tableData.value.length / count;
  // 将tableData分为newVal组
  for (let i = 0; i < count; i++) {
    tableData.value[i];
    temp.push(
      tableData.value.slice(
        i * groupHasStationNum,
        i * groupHasStationNum + groupHasStationNum,
      ),
    );
  }

  // 如果设置rowIndex，先将第一组对应的数据变为和rowIndex对应的数据一样
  if (rowIndex) {
    let groupInnerIndex =
      rowIndex - (getGroupNum(rowIndex) - 1) * groupHasStationNum;

    // 第一组的x行
    let temp0Item = temp[0][groupInnerIndex];
    // 当前编辑组的x行
    let tempRowItem = temp[getGroupNum(rowIndex) - 1][groupInnerIndex];

    temp0Item.skillDetails = JSON.parse(
      JSON.stringify(tempRowItem.skillDetails),
    );
    temp0Item.chiefExaminerRatio = tempRowItem.chiefExaminerRatio;
    temp0Item.deputyExaminerRatio = tempRowItem.deputyExaminerRatio;
    temp0Item.skillTypeName = tempRowItem.skillTypeName;
    temp0Item.skillTypeId = tempRowItem.skillTypeId;

    // 如果这项没有主考官，将其他组的对应考站主考官清空
    if (!tempRowItem.chiefExaminerId) {
      temp0Item.chiefExaminerId = undefined;
      temp0Item.chiefExaminerName = "";
      temp0Item.chiefExaminerRatio = 100;
    }
    // 如果这项没有副考官，将其他组的对应考站副考官清空
    if (
      !tempRowItem.deputyExaminerId &&
      tempRowItem.deputyExaminerRatio === 0
    ) {
      temp0Item.deputyExaminerId = undefined;
      temp0Item.deputyExaminerName = "";
      temp0Item.deputyExaminerRatio = 0;
      temp0Item.chiefExaminerRatio = 100;
    }
  }

  // 将除了第一组的组内容变为和第一组一样
  for (let i = 0; i < temp.length; i++) {
    if (i !== 0) {
      for (let j = 0; j < groupHasStationNum; j++) {
        temp[i][j].skillDetails = JSON.parse(
          JSON.stringify(temp[0][j].skillDetails),
        );
        temp[i][j].chiefExaminerRatio = temp[0][j].chiefExaminerRatio;
        temp[i][j].deputyExaminerRatio = temp[0][j].deputyExaminerRatio;
        temp[i][j].skillTypeName = temp[0][j].skillTypeName;
        temp[i][j].skillTypeId = temp[0][j].skillTypeId;
        // 如果第一组的这项没有主考官，将其他组的对应考站主考官清空
        if (!temp[0][j].chiefExaminerId) {
          temp[i][j].chiefExaminerId = undefined;
          temp[i][j].chiefExaminerName = "";
          temp[i][j].chiefExaminerRatio = 100;
        }
        // 如果第一组的这项没有副考官，将其他组的对应考站副考官清空
        if (
          !temp[0][j].deputyExaminerId &&
          temp[0][j].deputyExaminerRatio === 0
        ) {
          temp[i][j].deputyExaminerId = undefined;
          temp[i][j].deputyExaminerName = "";
          temp[i][j].chiefExaminerRatio = 100;
          temp[i][j].deputyExaminerRatio = 0;
        }

        // 分差同步
        temp[i][j].scoreDifferenceRatio = temp[0][j].scoreDifferenceRatio;
      }
    }
  }
};

/** 校验考官（不同组的相同技能类型的考官数量应该一致）（同类型考官人数不一致会反false） */
const validExaminer = (count: number) => {
  const groupArr = [];
  const groupHasStationNum = tableData.value.length / count;
  // 将tableData分为newVal组
  for (let i = 0; i < count; i++) {
    tableData.value[i];
    groupArr.push(
      tableData.value.slice(
        i * groupHasStationNum,
        i * groupHasStationNum + groupHasStationNum,
      ),
    );
  }

  // 考站是否有副考官（数组）
  let firstGroupHasDepArr = Array(groupHasStationNum).fill(false);
  for (let i = 0; i < groupArr.length; i++) {
    for (let j = 0; j < groupArr[i].length; j++) {
      if (groupArr[i][j].deputyExaminerId) {
        firstGroupHasDepArr[j] = true;
      }
    }
  }

  for (let i = 0; i < groupArr.length; i++) {
    for (let j = 0; j < groupArr[i].length; j++) {
      if (!groupArr[i][j].deputyExaminerId) {
        if (firstGroupHasDepArr[j]) {
          return true;
        }
      }
    }
  }
  return false;
};

/** 监听组数变化 */
watch(
  () => fixedForm.value.groupCount,
  (newVal) => {
    setGroupTypeUnique(newVal);
    // 设置其他组的数据与第一组相同
    setGroupSame(newVal);
  },
);

/**
 * 设置选项是否可选
 * @param item 当前选项
 * @param arr 主数组（tableData）
 * @param num 组数
 * @param index 当前编辑框编辑的行
 */
const skillTypeDisabled = (
  item: any,
  arr: any[],
  num: number,
  index: number,
) => {
  let groups = getGroups(arr, num);
  let groupNum = getGroupNum(index);
  let skillTypeIdArr = groups[groupNum - 1]
    .map((i: any) => i.skillTypeId)
    .filter(Boolean);
  return skillTypeIdArr.includes(item.id) && arr[index].skillTypeId !== item.id;
};

/**
 * 将数组分组（返回浅拷贝）
 * @param arr 需要分组的数组
 * @param num 需要分的组数
 */
const getGroups = (arr: any, num: number): any[][] => {
  let tempArr = [];
  let groupHasStationNum = arr.length / num;
  for (let i = 0; i < num; i++) {
    arr[i];
    tempArr.push(
      arr.slice(
        i * groupHasStationNum,
        i * groupHasStationNum + groupHasStationNum,
      ),
    );
  }
  return tempArr;
};

/** 校验规则 */
const fixedFormRules = {
  groupCount: [
    { required: true, message: "请选择考站组数", trigger: ["change"] },
  ],
  duration: [
    { required: true, message: "请输入考站考试时长", trigger: ["change"] },
  ],
  interval: [
    { required: true, message: "请输入换站时长", trigger: ["change"] },
  ],
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

.divider-father .inner-row:not(:last-child) .divider-custom {
  @apply w-full h-1px mt-1 mb-1;
  background-color: var(--el-table-border-color);
}
.inner-row-item {
}
.divider-col-label .cell {
  padding: 0 10px !important;
}
.divider-col .cell {
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
