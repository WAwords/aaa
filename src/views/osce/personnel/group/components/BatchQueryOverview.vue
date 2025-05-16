<template>
  <el-dialog
    v-model="batchQueryOverview"
    title="批量查询概览"
    width="800px"
    align-center
    :close-on-click-modal="false"
  >
    <div class="overview-wrapper">
      <div class="count-row">
        <div class="count-item">
          您共输入考生：
          <span>{{ queryNamesTrimmed.length }}</span>
          个
        </div>
        <el-divider direction="vertical" class="px-20px flex-none" />
        <div class="count-item">
          共查询出考生：
          <span>{{ leftList.length }}</span>
          个
        </div>
      </div>

      <div class="have-title">
        <div class="title">系统不存在的考生</div>
        <div class="content">
          <span style="color: var(--el-color-danger)">
            {{ absentExamineeNamesNum }}
          </span>
        </div>
      </div>

      <div class="have-title">
        <div class="title">系统中重名的考生</div>
        <div class="content">
          <el-table
            :data="batchOverView.repeat"
            class="w-full"
            style="height: 100%"
            stripe
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
              prop="user.name"
              label="姓名"
              min-width="120px"
              fixed
              show-overflow-tooltip
            />
            <el-table-column
              prop="user.genderName"
              label="性别"
              min-width="80px"
              show-overflow-tooltip
              align="center"
            />
            <el-table-column
              prop="user.idNumber"
              label="唯一识别号"
              min-width="190px"
              align="center"
            >
              <template #default="{ row }">
                <el-tooltip
                  class="box-item"
                  effect="dark"
                  :content="row.user.idNumber"
                  placement="top"
                >
                  {{
                    idNumberDesensitization(row.user.idNumber, row.user.idType)
                  }}
                </el-tooltip>
              </template>
            </el-table-column>
            <el-table-column
              prop="user.idType"
              label="识别号类型"
              min-width="110px"
              align="center"
            >
              <template #default="{ row }">
                {{
                  idTypeOption.find((item) => item.value === row.user.idType)!
                    .label
                }}
              </template>
            </el-table-column>
            <el-table-column
              prop="studentNumber"
              label="学号"
              min-width="150px"
              show-overflow-tooltip
              align="center"
            />
            <el-table-column
              prop="major"
              label="专业"
              min-width="150px"
              show-overflow-tooltip
              align="center"
            />
            <el-table-column
              prop="grade"
              label="年级"
              min-width="80px"
              show-overflow-tooltip
              align="center"
            />
            <el-table-column
              label="操作"
              fixed="right"
              width="80px"
              align="center"
            >
              <template #default="{ row }">
                <el-button
                  size="small"
                  type="danger"
                  @click="handleRemove(row)"
                  text
                >
                  移除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </div>

    <template #footer>
      <span class="dialog-footer">
        <el-button type="primary" @click="batchQueryOverview = false">
          确定
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { idNumberDesensitization } from "@/utils/common";

interface Props {
  queryNames: string;
  leftList: any[];
  batchQueryVisible: boolean;
  leftListTotal: number;
}
const props = withDefaults(defineProps<Props>(), {
  queryNames: "",
  leftList: () => [],
});

const emit = defineEmits([
  "update:queryNames",
  "update:batchQueryVisible",
  "update:leftList",
  "update:leftListTotal",
]);
/** 输入去空后的数组 */
const queryNamesTrimmed = computed(() => {
  // props.queryNames = props.queryNames.trim();
  let temp = props.queryNames.trim();
  // 去掉空行、去掉每个名字的前后空格、去重
  let names = temp
    .split("\n")
    .filter(Boolean)
    .map((item) => item.trim());
  return names;
});

/**
 * 批量查询--异常处理
 * @param list 查询得到的数组
 * @param query 查询的数组
 */
const handleBatchException = (list: any[], query: string[]) => {
  // 没有查询到的姓名
  let absent: string[] = query.filter(
    (item) =>
      !list.some((i) => i.user.name.toUpperCase() === item.toUpperCase()),
  );

  // 将姓名存在set中，判断是否重复
  let tempSet = new Set();

  let tempNames = list
    .filter((item) => {
      if (tempSet.has(item.user.name)) {
        // 如果set中有，则重复，返回true过滤出来
        return true;
      } else {
        // 如果set中没有，则添加进去
        tempSet.add(item.user.name);
        return false;
      }
    })
    .map((item) => item.user.name);

  // 重复的姓名string[]
  let repeatNames = [...new Set(tempNames)];

  // 重复姓名的考生
  let repeatNameExaminee: any[] = [];
  repeatNames.forEach((item) => {
    let tempArr = list.filter((i) => i.user.name === item);
    repeatNameExaminee = [...repeatNameExaminee, ...tempArr];
  });

  if (absent.length > 0 || repeatNameExaminee.length > 0) {
    // 关闭批量查询框
    emit("update:batchQueryVisible", false);
    // 打开批量查询概览
    batchQueryOverview.value = true;
    batchOverView.value.absent = absent;
    batchOverView.value.repeat = repeatNameExaminee;
  }
};
/** 批量查询--概览弹窗 */
const batchQueryOverview = ref(false);
/** 批量查询--概览 */
const batchOverView = ref<{
  absent: string[];
  repeat: any[];
}>({
  absent: [],
  repeat: [],
});
/** 批量搜索后不存在的考生 */
const absentExamineeNamesNum = computed(() => {
  return batchOverView.value.absent.join("，");
});
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

const handleRemove = (row: any) => {
  CmeMessageBox.confirm(
    `确定将考生“${row.user.name}（唯一识别号为：${row.user.idNumber}）”从搜索结果中移除吗？`,
    "系统提示",
    {
      distinguishCancelAndClose: true,
      confirmButtonText: "确定",
      cancelButtonText: "取消",
    },
  )
    .then(() => {
      // 更新搜索结果列表
      let temp = props.leftList.filter((item) => item.id !== row.id);
      emit("update:leftList", temp);
      emit("update:leftListTotal", temp.length);
      // 更新概览框的列表
      batchOverView.value.repeat = batchOverView.value.repeat.filter(
        (item) => item.id !== row.id,
      );
      CmeMessage({
        title: "成功",
        message: "移除成功成功",
        type: "success",
      });
    })
    .catch(() => {});
};

defineExpose({
  handleBatchException,
});
</script>

<style scoped lang="less">
.overview-wrapper {
  @apply h-500px p-20px overflow-hidden flex flex-col;
  border: var(--el-border);
  border-radius: var(--el-border-radius-base);
  .count-row {
    @apply flex justify-between items-center flex-none;
    .count-item {
      @apply w-1/2;
      span {
        color: var(--el-color-primary);
        font-family: D-DIN-Bold;
      }
    }
  }

  .have-title {
    @apply mt-20px pt-20px overflow-hidden flex flex-col;
    border-top: var(--el-border);
    &:first-child {
      @apply flex-none;
    }
    &:last-child {
      @apply flex-1;
    }
    .title {
      @apply font-bold flex-none;
    }
    .content {
      @apply mt-10px overflow-hidden flex-1;
    }
  }
}
</style>
