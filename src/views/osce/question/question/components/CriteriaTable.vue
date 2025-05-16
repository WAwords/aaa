<template>
  <div>
    <table class="table" v-if="tableType">
      <colgroup>
        <col width="55px" />
        <col
          :width="headerListWidthContainer[type][tableType][index]"
          v-for="(item, index) in headerListContainer[type][tableType]"
          :key="item"
        />
        <col width="250px" />
        <col width="100px" />
        <col />
      </colgroup>
      <thead>
        <tr>
          <td style="text-align: center">序号</td>
          <td v-for="item in headerListContainer[type][tableType]" :key="item">
            {{ item }}
          </td>
          <td>{{ type === "scoring" ? "操作内容" : "扣分原因" }}</td>
          <td style="text-align: center">分值</td>
          <td>{{ type === "scoring" ? "评分细则" : "扣分说明" }}</td>
        </tr>
      </thead>
      <tbody>
        <template v-for="(item, index) in tableData">
          <!-- 查看模式 -->
          <tr v-if="dialogType === 'view'">
            <td>
              <div class="flex justify-center items-center">
                {{ index + 1 }}
              </div>
            </td>
            <!-- 活动列 -->
            <template v-for="key in Object.keys(item).sort().slice(0, -1)">
              <td :rowspan="getRowSpan(key, index)" v-if="colShow(key, index)">
                <div
                  class="content"
                  :class="
                    key === 'score' ? 'flex justify-center items-center' : ''
                  "
                >
                  {{ item[key].content }}
                </div>
                <!-- 组显示 -->
                <div class="group-num cursor-default" v-if="item[key].group">
                  {{ item[key].group }}
                </div>
              </td>
            </template>
            <!-- 操作内容 -->
            <td>
              <div class="content">
                {{ item[maxLevel].content }}
              </div>
            </td>
            <!-- 分值 -->
            <td>
              <div class="flex justify-center items-center">
                {{ item[maxLevel].score }}
              </div>
            </td>
            <!-- 评分细则 -->
            <td>
              <div class="content">
                {{ item[maxLevel].rule }}
              </div>
            </td>
          </tr>

          <!-- 编辑模式（包含修改和新增） -->
          <tr v-else>
            <td>
              <div class="flex justify-center items-center">
                {{ index + 1 }}
              </div>
            </td>
            <!-- 活动列 -->
            <template v-for="key in Object.keys(item).sort().slice(0, -1)">
              <td
                :rowspan="getRowSpan(key, index)"
                v-if="colShow(key, index)"
                @click="handleEdit(index, key)"
              >
                <div
                  v-if="editTag !== `${index}-${key}-content`"
                  class="content"
                  :class="{
                    'has-group': item[key].group,
                  }"
                >
                  {{ item[key].content }}
                </div>
                <div
                  v-else
                  class="content"
                  :class="{
                    'has-group': item[key].group,
                  }"
                >
                  <el-input
                    ref="tableInputRef"
                    type="textarea"
                    :autosize="{ minRows: 1, maxRows: 100 }"
                    v-model="editVal"
                    @blur="onExitEdit(index, key)"
                  />
                </div>
                <!-- 操作按钮 -->
                <div
                  v-if="editTag !== `${index}-${key}-content`"
                  class="add-item"
                  @click.stop="handleAddClick(index, key)"
                >
                  +
                </div>
                <div
                  v-if="editTag !== `${index}-${key}-content`"
                  class="sub-item"
                  @click.stop="handleSubClick(index, key)"
                >
                  -
                </div>
                <div
                  v-if="
                    editTag !== `${index}-${key}-content` &&
                    key === `level_${+tableType - 1}`
                  "
                  class="group-item"
                  @click.stop="handleSetGroupClick(index, key)"
                >
                  分组
                </div>
                <!-- 组显示 -->
                <div class="group-num cursor-default" v-if="item[key].group">
                  {{ item[key].group }}
                </div>
              </td>
            </template>
            <!-- 操作内容 -->
            <td @click="handleEdit(index, maxLevel)">
              <div
                v-if="editTag !== `${index}-${maxLevel}-content`"
                class="content"
              >
                {{ item[maxLevel].content }}
              </div>
              <div v-else>
                <el-input
                  ref="tableInputRef"
                  type="textarea"
                  :autosize="{ minRows: 1, maxRows: 100 }"
                  v-model="editVal"
                  @blur="onExitEdit(index, maxLevel)"
                />
              </div>
              <!-- 操作按钮 -->
              <div
                v-if="editTag !== `${index}-${maxLevel}-content`"
                class="add-item"
                @click.stop="handleAddClick(index, maxLevel)"
              >
                +
              </div>
              <div
                v-if="editTag !== `${index}-${maxLevel}-content`"
                class="sub-item"
                @click.stop="handleSubClick(index, maxLevel)"
              >
                -
              </div>
            </td>
            <!-- 分值 -->
            <td @click="handleEdit(index, maxLevel, 'score')">
              <div
                v-if="editTag !== `${index}-${maxLevel}-score`"
                class="flex justify-center items-center"
              >
                {{ item[maxLevel].score }}
              </div>
              <div v-else>
                <el-input-number
                  v-model.number="editVal"
                  controls-position="right"
                  :min="0"
                  :max="100"
                  ref="tableInputRef"
                  @blur="onExitEdit(index, maxLevel, 'score')"
                  :controls="false"
                  style="width: 100%"
                  :step="0.01"
                />
              </div>
            </td>
            <!-- 评分细则 -->
            <td @click="handleEdit(index, maxLevel, 'rule')">
              <div
                v-if="editTag !== `${index}-${maxLevel}-rule`"
                class="content"
              >
                {{ item[maxLevel].rule }}
              </div>
              <div v-else>
                <el-input
                  ref="tableInputRef"
                  type="textarea"
                  :autosize="{ minRows: 1, maxRows: 100 }"
                  v-model="editVal"
                  @blur="onExitEdit(index, maxLevel, 'rule')"
                />
              </div>
            </td>
          </tr>
        </template>
        <tr v-if="tableData.length === 0 && dialogType !== 'view'">
          <td
            :colspan="4 + +tableType"
            @click="handleAddOneClick()"
            class="cursor-pointer empty-row"
          >
            <div class="flex justify-center items-center">
              暂无数据（点击此栏增加第一行数据）
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-else class="w-full">
      <el-button
        type="primary"
        plain
        class="w-full"
        @click="tableTypeDialogVisible = true"
        v-if="dialogType !== 'view'"
      >
        设置表格类型
      </el-button>
      <el-empty v-else description="暂无数据" />
    </div>

    <el-dialog
      v-model="tableTypeDialogVisible"
      title="设置类型"
      width="400px"
      @closed="onTableTypeDialogClose"
      destroy-on-close
      align-center
    >
      <el-form
        :model="tableTypeForm"
        ref="tableTypeFormRef"
        :rules="tableTypeFormRules"
        label-width="80"
        label-position="top"
      >
        <el-form-item label="类型" prop="tableType">
          <el-select
            v-model="tableTypeForm.tableType"
            placeholder="请选择类型"
            filterable
          >
            <el-option
              v-for="i in ['0', '1', '2', '3']"
              :key="i"
              :label="i"
              :value="i"
            />
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button type="primary" plain @click="tableTypeDialogVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="handleTableTypeDialogConfirm">
          确定
        </el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="groupSetDialogVisible"
      title="设置分组"
      width="400px"
      @closed="onGroupSetDialogClosed"
      destroy-on-close
      align-center
    >
      <div class=""
        >当前分组：
        <span class="primary-text">
          {{ nowGroup > 0 ? nowGroup : "未分组" }}
        </span></div
      >
      <div class="h-1px bg-gray-300 my-10px"></div>
      <div class="">选择分组：</div>
      <div class="mt-10px">
        <el-space wrap>
          <el-button
            class="w-80px"
            @click="handleSelectGroupClick(0)"
            :type="selectGroupNum ? 'primary' : 'primary'"
            :plain="selectGroupNum >= 0"
          >
            不分组
          </el-button>
          <el-button
            class="w-80px"
            v-for="i in groupList[groupList.length - 1]"
            :key="i"
            @click="handleSelectGroupClick(i)"
            :type="selectGroupNum === i ? 'primary' : 'primary'"
            :plain="selectGroupNum !== i"
          >
            第{{ i }}组
          </el-button>
          <el-button
            class="w-80px"
            type="primary"
            plain
            @click="handleAddGroupClick"
          >
            新增组
          </el-button>
        </el-space>
      </div>

      <template #footer>
        <el-button type="primary" plain @click="groupSetDialogVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="handleGroupSetConfirm">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { isNumber } from "@/request/utils/is";
import { getNowMergeIndex, getLevelNum } from "./utils.ts";

interface Props {
  data?: any[];
  /** 弹窗类型 */
  dialogType: "create" | "edit" | "view";
  /** 类型 */
  type: "scoring" | "deduction";
  /** 表格类型（与列数相关） */
  tableType?: "0" | "1" | "2" | "3";
}
const props = withDefaults(defineProps<Props>(), {
  data: () => [],
  dialogType: "create",
  type: "scoring",
});
watch(
  () => props.data,
  (newVal) => {
    tableData.value = newVal;
  },
);
const tableData = ref(props.data);

const emit = defineEmits(["update:data", "update:tableType"]);
watch(
  () => tableData.value,
  () => {
    emit("update:data", tableData.value);
  },
  {
    deep: true,
  },
);

/**
 * 获取rowspan（配合colShow实现单元格合并）
 * @param level 层级
 * @param index 行索引
 */
const getRowSpan = (level: string, index: number) => {
  let count = 1; // 初始化合并行数为1
  // 从当前行开始，向后寻找相同value的行，并增加合并行数
  for (let i = index + 1; i < tableData.value.length; i++) {
    let levelNum = getLevelNum(level);

    // 最后层level不需要合并
    if (levelNum === +props.tableType!) {
      break;
    }

    let tag = true;
    for (let j = levelNum; j >= 0; j--) {
      if (
        tableData.value[index][`level_${j}`].content !==
          tableData.value[i][`level_${j}`].content ||
        tableData.value[index][`level_${j}`].content === ""
      ) {
        tag = false;
      }
    }

    // 默认会++，但只要content为空或者当前遍历到的单元格与使用getRowSpan的content不同，
    // 则退出循环（因为之后的行不涉及与它的合并了）
    if (tag) {
      count++;
    } else {
      break;
    }
  }
  return count;
};

/** 设置单元格是否隐藏（配合getRowSpan实现单元格合并效果）
 * @param level 层级
 * @param index 行索引
 */
const colShow = (level: string, index: number) => {
  if (index === 0) return true;

  let levelNum = getLevelNum(level);

  let tag = true;
  for (let j = levelNum; j >= 0; j--) {
    if (
      tableData.value[index][`level_${j}`].content !==
        tableData.value[index - 1][`level_${j}`].content ||
      tableData.value[index][`level_${j}`].content === ""
    ) {
      tag = false;
    }
  }

  if (tag) {
    return false;
  }

  return true;
};
const editTag = ref("");
const tableInputRef = ref();
const editVal = ref<any>();
/** 触发编辑
 * @param index 行索引
 * @param level 级别
 * @param key 级别对象中编辑的属性键
 */
const handleEdit = (index: number, level: string, key = "content") => {
  let inputRef: undefined | HTMLElement;
  if (tableInputRef.value) {
    inputRef = tableInputRef.value[0];
  }
  editTag.value = `${index}-${level}-${key}`;
  nextTick(() => {
    // 如果当前的input和上一个的input相同，则不触发赋值事件
    if (!inputRef || inputRef !== tableInputRef.value[0]) {
      editVal.value = tableData.value[index][level][key];
      tableInputRef.value[0].focus();
    }
  });
};

/**
 * 输入框失焦
 * @param index 行索引
 * @param level 级别
 * @param key 级别对象中编辑的属性键
 */
const onExitEdit = (index: number, level: string, key = "content") => {
  if (key === "score") {
    const toNum = Number(editVal.value);
    if (isNumber(toNum)) {
      if (editVal.value <= 0) {
        // 如果小于0，设置为0
        editVal.value = 0;
      } else {
        // 如果大于0，保留两位小数
        editVal.value = Math.round(editVal.value * 100) / 100;
      }
    } else {
      // 如果不是数字，设置为0
      editVal.value = 0;
    }
  }
  // 获取与编辑的单元格进行了合并的行
  let mergeRowIndex = getNowMergeIndex(
    tableData.value,
    level,
    index,
    +props.tableType!,
    key,
  );
  // 更改合并的单元格对应数据更改
  mergeRowIndex.forEach((item) => {
    tableData.value[item][level][key] = editVal.value;
  });

  // 这里重新获取一次合并的行索引，如果和之前的长度不一致，代表着改变内容后触发了合并（合并后需要改变其组号）
  let tempMergeRowIndex = getNowMergeIndex(
    tableData.value,
    level,
    index,
    +props.tableType!,
    key,
  );

  if (tempMergeRowIndex.length !== mergeRowIndex.length) {
    // 重新设置组号
    tempMergeRowIndex.forEach((item) => {
      tableData.value[item][level].group =
        tableData.value[tempMergeRowIndex[0]][level].group;
    });
  }

  editVal.value = undefined;
  editTag.value = "";
};

/** 新增行
 * @param index 行索引
 * @param level 层级
 */
const handleAddClick = (index: number, level: string) => {
  let initObj = {} as Record<string, any>;
  // 根据tableType生成初始对象
  for (let i = 0; i <= +props.tableType!; i++) {
    let tempObj = {
      content: "",
    } as Record<string, any>;
    if (i === +props.tableType!) {
      tempObj.score = 0;
      tempObj.rule = "";
    }
    initObj[`level_${i}`] = tempObj;
  }

  // 当前操作的行
  const handleRow = tableData.value[index];
  let initFuncContainer = {
    level_0: () => {},
    level_1: () => {
      initObj["level_0"].content = handleRow["level_0"].content;
      initObj["level_0"].group = handleRow["level_0"].group;
    },
    level_2: () => {
      initObj["level_0"].content = handleRow["level_0"].content;
      initObj["level_0"].group = handleRow["level_0"].group;
      initObj["level_1"].content = handleRow["level_1"].content;
      initObj["level_1"].group = handleRow["level_1"].group;
    },
    level_3: () => {
      initObj["level_0"].content = handleRow["level_0"].content;
      initObj["level_0"].group = handleRow["level_0"].group;
      initObj["level_1"].content = handleRow["level_1"].content;
      initObj["level_1"].group = handleRow["level_1"].group;
      initObj["level_2"].content = handleRow["level_2"].content;
      initObj["level_2"].group = handleRow["level_2"].group;
    },
  } as Record<string, Function>;

  initFuncContainer[level]();

  tableData.value.splice(index + getRowSpan(level, index), 0, initObj);
};

/**
 * 行数为 ‘0’ 时的新增按钮
 */
const handleAddOneClick = () => {
  let initObj = {} as Record<string, any>;
  // 根据tableType生成初始对象
  for (let i = 0; i <= +props.tableType!; i++) {
    let tempObj = {
      content: "",
    } as Record<string, any>;
    if (i === +props.tableType!) {
      tempObj.score = 0;
      tempObj.rule = "";
    }
    initObj[`level_${i}`] = tempObj;
  }

  tableData.value.push(initObj);
};

/** 删除行
 * @param index 行索引
 * @param level 层级
 */
const handleSubClick = (index: number, level: string) => {
  let val = tableData.value[index][level];

  CmeMessageBox.confirm(`确定删除吗？`, "系统提示", {
    distinguishCancelAndClose: true,
    confirmButtonText: "确定",
    cancelButtonText: "取消",
  })
    .then(() => {
      if (val === "") {
        // 如果内容为空，直接删除就行（为空的数据不会表格合并）
        tableData.value.splice(index, 1);
      } else {
        // 内容不为空，删掉和当前单元格进行合并的行
        tableData.value.splice(index, getRowSpan(level, index));
      }
    })
    .catch(() => {});
};

/** 表头数组容器 */
const headerListContainer = {
  // scoring: {
  //   "0": [],
  //   "1": ["评分项"],
  //   "2": ["评分大项", "评分小项"],
  //   "3": ["评分大项", "评分中项", "评分小项"],
  // },
  // deduction: {
  //   "0": [],
  //   "1": ["扣分项"],
  //   "2": ["扣分大项", "扣分小项"],
  //   "3": ["扣分大项", "扣分中项", "扣分小项"],
  // },
  scoring: {
    "0": [],
    "1": ["一级类型"],
    "2": ["一级类型", "二级类型"],
    "3": ["一级类型", "二级类型", "三级类型"],
  },
  deduction: {
    "0": [],
    "1": ["一级类型"],
    "2": ["一级类型", "二级类型"],
    "3": ["一级类型", "二级类型", "三级类型"],
  },
};
/** 表头数组宽度容器 */
const headerListWidthContainer = {
  scoring: {
    "0": [],
    "1": ["25%"],
    "2": ["18%", "18%"],
    "3": ["15%", "15%", "15%"],
  },
  deduction: {
    "0": [],
    "1": ["25%"],
    "2": ["18%", "18%"],
    "3": ["15%", "15%", "15%"],
  },
};

/** 最大层level prop */
const maxLevel = computed(() => {
  if (tableData.value.length === 0) return "";
  return getRowMaxLevelProp(tableData.value[0]);
});

/** 类型设置弹窗 */
const tableTypeDialogVisible = ref(false);
const onTableTypeDialogClose = () => {};
/** 设置类型弹窗的选项 */
const tableTypeForm = ref({
  tableType: undefined,
});
const tableTypeFormRef = ref();
/** 设置类型弹窗确定 */
const handleTableTypeDialogConfirm = () => {
  tableTypeFormRef.value
    .validate()
    .then(() => {
      tableTypeDialogVisible.value = false;
      emit("update:tableType", tableTypeForm.value.tableType);
    })
    .catch(() => {});
};

const tableTypeFormRules = {
  tableType: [
    {
      required: true,
      message: "请选择表格类型",
      trigger: "change",
    },
  ],
};

/**
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * 分组相关
 */
/**
 * 单元格分组按钮点击事件
 * @param index 行索引
 * @param level 层级
 */
const handleSetGroupClick = (index: number, level: string) => {
  groupSetEditData.value.index = index;
  groupSetEditData.value.level = level;

  // 设置分组列表
  groupList.value = getGroupList(index, level);

  // 设置当前单元格分组
  nowGroup.value =
    tableData.value[groupSetEditData.value.index!][
      groupSetEditData.value.level!
    ].group;

  // 设置选择的分组
  selectGroupNum.value = nowGroup.value;

  groupSetDialogVisible.value = true;
};
const groupSetDialogVisible = ref(false);
const groupSetEditData = ref<{
  index?: number;
  level?: string;
}>({
  index: 0,
  level: "",
});
const onGroupSetDialogClosed = () => {};

/** 编辑的单元格的当前分组 */
const nowGroup = ref<any>();
/** 选择的分组 */
const selectGroupNum = ref<any>();

/** 选择分组 */
const handleSelectGroupClick = (num: number) => {
  selectGroupNum.value = num;
};

/** 分组弹窗中的分组列表 */
const groupList = ref<any[]>([]);
/** 获取分组列表
 * @param index 行索引
 * @param level 层级
 */
const getGroupList = (index: number, level: string) => {
  let levelNum = +getLevelNum(level);

  let result = [];
  // 如果分组的列层级为0，单独处理（没有父层级）
  if (levelNum === 0) {
    result = tableData.value
      .map((item) => {
        return item[level].group;
      })
      .filter(Boolean);
  } else {
    let sameParentRowIndexList = getNowMergeIndex(
      tableData.value,
      `level_${levelNum - 1}`,
      index,
      +props.tableType!,
    );

    result = sameParentRowIndexList
      .map((item) => {
        return tableData.value[item][level].group;
      })
      .filter(Boolean);
  }

  result = [...new Set(result)].sort((a, b) => a - b);

  return result;
};

/** 分组弹窗确定 */
const handleGroupSetConfirm = () => {
  let mergedRowIndex = getNowMergeIndex(
    tableData.value,
    groupSetEditData.value.level!,
    groupSetEditData.value.index!,
    +props.tableType!,
  );

  mergedRowIndex.forEach((item) => {
    tableData.value[item][groupSetEditData.value.level!].group =
      selectGroupNum.value;
  });

  groupSetDialogVisible.value = false;
};

/** 新增分组 */
const handleAddGroupClick = () => {
  let addVal;
  if (groupList.value.length === 0) {
    addVal = 1;
  } else {
    addVal = groupList.value[groupList.value.length - 1] + 1;
  }
  groupList.value.push(addVal);
};
</script>

<style lang="less" scoped>
.table {
  @apply bg-white w-full;
  table-layout: fixed;

  border: 1px solid transparent;
  td {
    @apply px-10px h-40px;
    .content {
      white-space: pre-wrap;
      word-break: break-all;

      &.has-group {
        padding-right: 20px;
      }
    }
  }

  td {
    border: 1px solid var(--el-border-color);
  }

  // 下边是表格圆角（临时方案，在页面缩放时会出现显示异常，非缩放不影响）
  thead tr td:first-child {
    border: none;
    position: relative;
    border-top-left-radius: var(--el-border-radius-base);
    &::after {
      content: "";
      width: 100%;
      height: 100%;
      left: -1px;
      top: -1px;
      box-sizing: content-box;
      border: 1px solid var(--el-border-color);
      position: absolute;
      border-bottom: none;
      border-right: none;
      border-top-left-radius: var(--el-border-radius-base);
    }
  }
  thead tr td:last-child {
    border: none;
    position: relative;
    &::after {
      content: "";
      width: 100%;
      height: 100%;
      left: 0;
      top: -1px;
      box-sizing: content-box;
      border: 1px solid var(--el-border-color);
      position: absolute;
      border-bottom: none;
      border-left: none;
      border-top-right-radius: var(--el-border-radius-base);
    }
  }
  tbody tr:last-child {
    &:not(:first-child) td:first-child:not(.empty-row) {
      border: none;
      position: relative;
      &::after {
        content: "";
        width: 100%;
        height: 100%;
        left: -1px;
        top: 0;
        box-sizing: content-box;
        border: 1px solid var(--el-border-color);
        position: absolute;
        border-top: none;
        border-right: none;
        border-bottom-left-radius: var(--el-border-radius-base);
      }
    }
    &:first-child td:first-child:not(.empty-row) {
      border: none;
      position: relative;
      &::after {
        content: "";
        width: 100%;
        height: calc(100% - 1px);
        left: -1px;
        top: 0;
        box-sizing: content-box;
        border: 1px solid var(--el-border-color);
        position: absolute;
        border-right: none;
        border-bottom-left-radius: var(--el-border-radius-base);
      }
    }

    &:not(:first-child) td:last-child:not(.empty-row) {
      border: none;
      position: relative;
      &::after {
        content: "";
        width: 100%;
        height: 100%;
        left: 0;
        top: 0;
        box-sizing: content-box;
        border: 1px solid var(--el-border-color);
        position: absolute;
        border-top: none;
        border-left: none;
        border-bottom-right-radius: var(--el-border-radius-base);
      }
    }
    &:first-child td:last-child:not(.empty-row) {
      border: none;
      position: relative;
      &::after {
        content: "";
        width: 100%;
        height: calc(100% - 1px);
        left: 0;
        top: 0;
        box-sizing: content-box;
        border: 1px solid var(--el-border-color);
        position: absolute;
        border-left: none;
        border-bottom-right-radius: var(--el-border-radius-base);
      }
    }

    // 空表的新增行按钮
    .empty-row {
      border-bottom: none;
      border-left: none;
      border-right: none;
      &::after {
        content: "";
        width: 100%;
        height: 100%;
        left: -1px;
        top: 0;
        box-sizing: content-box;
        border: 1px solid var(--el-border-color);
        position: absolute;
        border-top: none;
        border-radius: 0 0 var(--el-border-radius-base)
          var(--el-border-radius-base);
      }
    }
  }
}

td {
  @apply relative;
  .add-item {
    @apply absolute -bottom-0px right-0 h-20px flex justify-center items-center text-white cursor-pointer;
    @apply w-40px h-0 overflow-hidden;
    background-color: var(--el-color-primary);
    font-size: var(--el-font-size-base);
    z-index: 10;
    border-bottom-right-radius: var(--el-border-radius-base);
    border-bottom-left-radius: var(--el-border-radius-base);
  }
  &:hover .add-item {
    @apply h-20px -bottom-20px;
  }
  .sub-item {
    @apply absolute top-0 -right-20px h-full flex justify-center items-center text-white cursor-pointer;
    @apply w-0px overflow-hidden;
    background-color: var(--el-color-danger);
    font-size: var(--el-font-size-base);
    z-index: 10;
    border-top-right-radius: var(--el-border-radius-base);
    border-bottom-right-radius: var(--el-border-radius-base);
  }
  &:hover .sub-item {
    @apply w-20px;
  }

  .group-item {
    @apply absolute -bottom-20px right-40px h-20px flex justify-center items-center text-white cursor-pointer;
    @apply w-40px h-0 overflow-hidden;
    background-color: var(--el-color-primary-light-3);
    font-size: var(--el-font-size-extra-small);
    z-index: 10;
    border-bottom-right-radius: var(--el-border-radius-base);
    border-bottom-left-radius: var(--el-border-radius-base);
  }
  &:hover .group-item {
    @apply h-20px;
  }

  .group-num {
    @apply absolute top-0 right-0 w-20px flex justify-center items-center;
    background-color: var(--el-color-primary-light-9);
    color: var(--el-color-primary);
  }
}

.el-input-number.is-without-controls .el-input__wrapper {
  padding-left: 5px;
  padding-right: 5px;
}

.primary-text {
  color: var(--el-color-primary);
}
</style>
