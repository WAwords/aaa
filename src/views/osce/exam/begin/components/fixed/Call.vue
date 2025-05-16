<template>
  <div class="flex flex-col">
    <div class="handle-wrapper">
      <div class="left-btn">
        <el-button
          type="primary"
          @click="fastCall()"
          :disabled="fastCallDisabled"
        >
          <!-- 叫号（第{{ group + 2 }}组） -->
          叫号{{
            fastCallGroupNum >= 0 ? `（第${fastCallGroupNum + 1}组）` : ""
          }}
        </el-button>
        <el-button
          type="primary"
          @click="fastPush()"
          :disabled="fastPushDisabled"
        >
          <!-- 推送（第{{ group + 2 }}组） -->
          推送{{
            fastPushGroupNum >= 0 ? `（第${fastPushGroupNum + 1}组）` : ""
          }}
        </el-button>

        <!-- 考试控制 -->
        <el-button
          type="primary"
          v-if="examineeGroupExamStatus === 1"
          @click="emit('handleStationExamStart')"
        >
          考试开始
        </el-button>
        <el-button
          type="danger"
          v-if="examineeGroupExamStatus === 2"
          @click="emit('handleStationExamEnd')"
        >
          考试结束
        </el-button>
        <el-button
          type="warning"
          v-if="examineeGroupExamStatus === 3"
          @click="emit('handleStationExamChangeEnd')"
        >
          换站结束
        </el-button>
      </div>

      <div
        class="full-btn"
        @click="fullDialogVisible = true"
        v-if="!fullDialogVisible"
      >
        <Icon icon="ant-design:fullscreen-outlined" size="18px" />
      </div>
    </div>

    <div class="flex-1 overflow-hidden">
      <el-table
        ref="tableRef"
        :data="examInfo.groups"
        class="w-full"
        cell-class-name="cursor-pointer"
        @cell-click="handleCellClick"
        :row-class-name="setRowClassName"
        :cell-style="setCellStyle"
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
          v-for="(item, index) in examInfo.arrangements"
          :label="`${item.roomName}`"
          min-width="120px"
          align="center"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            {{ `${row[index] ? row[index].user.name : ""}` }}
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          fixed="right"
          width="160px"
          align="center"
        >
          <template #default="{ $index }">
            <el-button
              size="small"
              type="primary"
              @click.stop="handleCall($index)"
              :disabled="callDisabled($index)"
              text
            >
              叫号
            </el-button>
            <el-button
              size="small"
              type="primary"
              @click.stop="handlePush($index)"
              :disabled="pushDisabled($index)"
              text
            >
              推送
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 考生操作 -->
    <el-dialog
      v-model="cellHandleVisible"
      title="考生操作"
      width="400px"
      destroy-on-close
      align-center
      @closed="initCellHandleForm"
    >
      <el-form
        :model="cellHandleForm"
        label-width="100px"
        ref="cellHandleFormRef"
        :rules="FormRules"
        label-position="top"
      >
        <el-form-item label="当前考生">
          <el-input v-model="handleCellMsg.examinee.user.name" disabled />
        </el-form-item>
        <el-form-item label="操作" prop="action">
          <el-select
            v-model="cellHandleForm.action"
            placeholder="请选择操作"
            class="w-full"
            clearable
            filterable
            @change="onActionChange"
          >
            <el-option
              :label="
                handleCellMsg
                  ? absentExaminees.includes(handleCellMsg.examinee.id)
                    ? '取消缺考'
                    : '缺考'
                  : '缺考'
              "
              :value="0"
            />
            <el-option label="交换考生" :value="1" />
          </el-select>
        </el-form-item>
        <el-form-item
          label="交换的考生"
          prop="examinee_b"
          v-if="cellHandleForm.action === 1"
        >
          <el-select
            v-model="cellHandleForm.examinee_b"
            placeholder="请选择考生"
            class="w-full"
            clearable
            filterable
          >
            <el-option
              v-for="item in canSwapExaminees"
              :label="`${item.user.name} ${item.studentNumber ? '（' : ''}${
                item.studentNumber ? item.studentNumber : ''
              }${item.studentNumber ? '）' : ''}`"
              :key="item.id"
              :value="item.id"
            >
              <template #default>
                <div class="flex justify-between w-full">
                  <div>{{ item.user.name }}</div>
                  <div>
                    {{ item.studentNumber ? item.studentNumber : "" }}
                  </div>
                </div>
              </template>
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" plain @click="cellHandleVisible = false">
            取消
          </el-button>
          <el-button
            type="primary"
            @click="confirmCellHandle"
            :loading="confirmCellLoading"
          >
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 考生叫号（这个弹窗的内容应该与未弹出弹窗的内容一致） -->
    <el-dialog v-model="fullDialogVisible" fullscreen title="考生叫号">
      <div class="handle-wrapper">
        <div class="left-btn">
          <el-button
            type="primary"
            @click="fastCall()"
            :disabled="fastCallDisabled"
          >
            <!-- 叫号（第{{ group + 2 }}组） -->
            叫号{{
              fastCallGroupNum >= 0 ? `（第${fastCallGroupNum + 1}组）` : ""
            }}
          </el-button>
          <el-button
            type="primary"
            @click="fastPush()"
            :disabled="fastPushDisabled"
          >
            <!-- 推送（第{{ group + 2 }}组） -->
            推送{{
              fastPushGroupNum >= 0 ? `（第${fastPushGroupNum + 1}组）` : ""
            }}
          </el-button>

          <!-- 考试控制 -->
          <el-button
            type="primary"
            v-if="examineeGroupExamStatus === 1"
            @click="emit('handleStationExamStart')"
          >
            考试开始
          </el-button>
          <el-button
            type="danger"
            v-if="examineeGroupExamStatus === 2"
            @click="emit('handleStationExamEnd')"
          >
            考试结束
          </el-button>
          <el-button
            type="warning"
            v-if="examineeGroupExamStatus === 3"
            @click="emit('handleStationExamChangeEnd')"
          >
            换站结束
          </el-button>
        </div>

        <div
          class="full-btn"
          @click="fullDialogVisible = true"
          v-if="!fullDialogVisible"
        >
          <Icon icon="ant-design:fullscreen-outlined" size="18px" />
        </div>
      </div>

      <div class="bg-white">
        <el-table
          ref="tableRef"
          :data="examInfo.groups"
          class="w-full"
          height="100%"
          cell-class-name="cursor-pointer"
          @cell-click="handleCellClick"
          :row-class-name="setRowClassName"
          :cell-style="setCellStyle"
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
            v-for="(item, index) in examInfo.arrangements"
            :label="`${item.roomName}`"
            min-width="120px"
            align="center"
            show-overflow-tooltip
          >
            <template #default="{ row }">
              {{ `${row[index] ? row[index].user.name : ""}` }}
            </template>
          </el-table-column>
          <el-table-column
            label="操作"
            fixed="right"
            width="160px"
            align="center"
          >
            <template #default="{ $index }">
              <el-button
                size="small"
                type="primary"
                @click.stop="handleCall($index)"
                :disabled="callDisabled($index)"
                text
              >
                叫号
              </el-button>
              <el-button
                size="small"
                type="primary"
                @click.stop="handlePush($index)"
                :disabled="pushDisabled($index)"
                text
              >
                推送
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { useBeginState } from "../../beginState";

const {
  group,
  examineeGroupExamStatus,
  round,
  examInfo,
  pushedGroups,
  absentExaminees,
  setStationWait,
  setStationReady,
  sendMessage,
} = useBeginState();

/** 叫号 */
const handleCall = (groupNum: number) => {
  CmeMessageBox.confirm(
    `<div>是否确认叫号第${
      groupNum + 1
    }组考生？</div><div>注：叫号后候考显示设备和站外显示设备将会显示考生信息</div>`,
    "叫号",
    {
      dangerouslyUseHTMLString: true,
      distinguishCancelAndClose: true,
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      beforeClose: (action, instance, done) => {
        if (action === "confirm") {
          instance.confirmButtonLoading = true;

          const obj = {
            type: "group_examinee_call",
            data: {
              group: groupNum,
            },
          };
          sendMessage(obj, true)
            .then(() => {
              setStationWait(obj.data.group, 0, false);
              instance.confirmButtonLoading = false;
              done();
            })
            .catch(() => {
              instance.confirmButtonLoading = false;
              done();
            });
        } else {
          done();
        }
      },
    },
  )
    .then(() => {})
    .catch(() => {});
};

/** 推送 */
const handlePush = (groupNum: number) => {
  CmeMessageBox.confirm(
    `<div>是否确认推送第${
      groupNum + 1
    }组考生？</div><div>注：推送后候考显示设备、站外显示设备和站内显示设备将会显示考生信息</div>`,
    "推送",
    {
      dangerouslyUseHTMLString: true,
      distinguishCancelAndClose: true,
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      beforeClose: (action, instance, done) => {
        if (action === "confirm") {
          instance.confirmButtonLoading = true;

          const obj = {
            type: "group_examinee_push",
            data: {
              group: groupNum,
            },
          };
          sendMessage(obj, true)
            .then(() => {
              setStationReady(obj.data.group);
              examineeGroupExamStatus.value = 1;
              group.value = obj.data.group;
              pushedGroups.value.push(obj.data.group);
              instance.confirmButtonLoading = false;
              done();
            })
            .catch(() => {
              instance.confirmButtonLoading = false;
              done();
            });
        } else {
          done();
        }
      },
    },
  )
    .then(() => {})
    .catch(() => {});
};

/** 快捷叫号 */
const fastCall = () => {
  handleCall(fastCallGroupNum.value);
};

/** 快捷推送 */
const fastPush = () => {
  handlePush(fastPushGroupNum.value);
};
/** 叫号的组数 */
const fastCallGroupNum = computed(() => {
  // 所有考生组号
  let allGroups = Array(examInfo.value.groups.length)
    .fill(0)
    .map((item, index) => {
      item;
      return index;
    });
  // 将已推送的考生组号从所有组号中剔除
  pushedGroups.value.forEach((item) => {
    let index = allGroups.indexOf(item);
    if (index !== -1) {
      allGroups.splice(index, 1);
    }
  });
  // 还有剩余没叫号的组的话则返回最小的一个组号，没有就返undefined
  if (allGroups.length === 0) {
    return -1;
  } else {
    return allGroups[0];
  }
});
/** 推送的组数 */
const fastPushGroupNum = computed(() => {
  // 所有考生组号
  let allGroups = Array(examInfo.value.groups.length)
    .fill(0)
    .map((item, index) => {
      item;
      return index;
    });
  // 将已推送的考生组号从所有组号中剔除
  pushedGroups.value.forEach((item) => {
    let index = allGroups.indexOf(item);
    if (index !== -1) {
      allGroups.splice(index, 1);
    }
  });
  // 还有剩余没叫号的组的话则返回最小的一个组号，没有就返undefined
  if (allGroups.length === 0) {
    return -1;
  } else {
    return allGroups[0];
  }
});

/** 点击表格单元格后需要被操作的考生 */
const handleCellMsg = ref<any>();
/** 单元格被点击 */
const handleCellClick = (row: any, column: any) => {
  if (column.no === 0 || column.no > row.length) return;
  if (!row[column.no - 1]) return;

  handleCellMsg.value = {
    examinee: row[column.no - 1],
    row,
    column,
  };
  cellHandleVisible.value = true;
};

/** 单元格样式设置（显示缺考） */
const setCellStyle = (row: any) => {
  if (row.columnIndex === 0 || row.columnIndex > row.length) {
    return {};
  }

  if (row.row[row.columnIndex - 1]) {
    if (absentExaminees.value.includes(row.row[row.columnIndex - 1].id)) {
      return { color: "var(--el-color-danger)" };
    }
  }
};

const onActionChange = (val: number) => {
  if (val === 1) {
    // 可交换的限制为--考站组特定项目的考生
    // canSwapExaminees.value = getStationGroupExamineeIndexExaminees(
    //   getExamineeGroupIndex()
    // )
    //   .flat()
    //   .filter((item: { id: number }) =>
    //     item.id === handleCellMsg.value.examinee.id ? false : true
    //   );
    // 可交换限制为--出自己以外的所有人
    canSwapExaminees.value = examInfo.value.examinees.filter(
      (item: { id: number }) => item.id !== handleCellMsg.value.examinee.id,
    );
  } else {
    cellHandleForm.value.examinee_b = undefined;
  }
};

/** 考生操作弹窗 */
const cellHandleVisible = ref(false);
/** handle：0-缺考 1-交换考生 */
const cellHandleForm = ref<{ action?: 0 | 1; examinee_b?: number }>({
  action: undefined,
  examinee_b: undefined,
});
const cellHandleFormRef = ref();
const confirmCellHandle = () => {
  cellHandleFormRef.value
    .validate()
    .then(() => {
      if (cellHandleForm.value.action === 0) {
        // 缺考
        confirmCellLoading.value = true;

        const obj = {
          type: "examinee_absent",
          data: {
            examinee: handleCellMsg.value.examinee.id,
            absent: !absentExaminees.value.includes(
              handleCellMsg.value.examinee.id,
            ),
          },
        };
        sendMessage(obj, true)
          .then((resMsg: any) => {
            absentExaminees.value = resMsg.data.absent_examinees;
            cellHandleVisible.value = false;
            confirmCellLoading.value = false;
          })
          .catch(() => {
            confirmCellLoading.value = false;
          });
      } else if (cellHandleForm.value.action === 1) {
        // 交换
        confirmCellLoading.value = true;
        const obj = {
          type: "group_examinee_swap",
          data: {
            examinee_a: handleCellMsg.value.examinee.id,
            examinee_b: cellHandleForm.value.examinee_b,
          },
        };
        sendMessage(obj, true)
          .then((resMsg: any) => {
            examInfo.value.schedules = resMsg.data.updated_schedules;
            examInfo.value.groups = resMsg.data.updated_groups;
            cellHandleVisible.value = false;
            confirmCellLoading.value = false;
          })
          .catch(() => {
            confirmCellLoading.value = false;
          });
      }
    })
    .catch(() => {});
};
/** 初始化操作考生表格 */
const initCellHandleForm = () => {
  confirmCellLoading.value = false;
  cellHandleFormRef.value.resetFields();
};
const FormRules = {
  action: [{ required: true, message: "请选择操作", trigger: ["change"] }],
  examinee_b: [{ required: true, message: "请选择考生", trigger: ["change"] }],
};
const confirmCellLoading = ref(false);

/** 可交换的考生 */
const canSwapExaminees = ref<any[]>([]);

/** 获取当前考生在他的考站组中的位置（index） */
const getExamineeGroupIndex = () => {
  // 考生在当前考站组的index
  const examineeGroupIndex = handleCellMsg.value.column.no - 1;
  return examineeGroupIndex % examInfo.value.rounds;
};
/** 获取在考站组中指定index的所有考生 */
const getStationGroupExamineeIndexExaminees = (indexTag: number) => {
  let filterCanSwapGroups = examInfo.value.groups.map((item: any[]) => {
    return item.filter((i, index) => {
      let nowIndex = index % examInfo.value.rounds;
      if (nowIndex === indexTag && i) {
        return true;
      } else {
        return false;
      }
    });
  });
  return filterCanSwapGroups;
};

/** 快捷叫号的按钮禁用状态 */
const fastCallDisabled = computed(() => {
  if (fastCallGroupNum.value === -1) return true;
  // 考生组考试状态为‘未推送’状态
  if (examineeGroupExamStatus.value === 0) {
    return false;
  }
  // 考生组进行的时当前组的最后一轮考试
  if (
    round.value === examInfo.value.rounds - 1 &&
    examineeGroupExamStatus.value === 2
  ) {
    return false;
  }
  return true;
});

/** 快捷推送的按钮禁用状态 */
const fastPushDisabled = computed(() => {
  if (fastPushGroupNum.value === -1) return true;
  // 考生组考试状态为‘未推送’状态
  if (examineeGroupExamStatus.value === 0) {
    return false;
  }
  // 考生组进行的时当前组的最后一轮考试
  if (
    round.value === examInfo.value.rounds - 1 &&
    examineeGroupExamStatus.value === 2
  ) {
    return false;
  }
  return true;
});

/** 操作栏按钮，叫号的禁用状态 */
const callDisabled = computed(() => (index: number) => {
  if (pushedGroups.value.includes(index)) return true;
  // 考生组考试状态为‘未推送’状态
  if (examineeGroupExamStatus.value === 0) {
    return false;
  }
  // 考生组进行的时当前组的最后一轮考试
  if (
    round.value === examInfo.value.rounds - 1 &&
    examineeGroupExamStatus.value === 2
  ) {
    return false;
  }
  return true;
});

/** 操作栏按钮，推送的禁用状态 */
const pushDisabled = computed(() => (index: number) => {
  if (pushedGroups.value.includes(index)) return true;
  // 考生组考试状态为‘未推送’状态
  if (examineeGroupExamStatus.value === 0) {
    return false;
  }
  // 考生组进行的时当前组的最后一轮考试
  if (
    round.value === examInfo.value.rounds - 1 &&
    examineeGroupExamStatus.value === 2
  ) {
    return false;
  }
  return true;
});

/** 设置行className */
const setRowClassName = (data: { row: any; rowIndex: number }) => {
  if (data.rowIndex === group.value) {
    return "row-ongoing";
  }
  if (pushedGroups.value.includes(data.rowIndex)) {
    return "row-done";
  }
  return "row-waiting";
};

/** =============== 考试控制 =============== */
const emit = defineEmits([
  "handleStationExamStart",
  "handleStationExamEnd",
  "handleStationExamChangeEnd",
]);

const fullDialogVisible = ref(false);
</script>

<style scoped lang="less">
::v-deep(.row-waiting) {
}
::v-deep(.row-ongoing) {
  color: var(--el-color-primary) !important;
  font-weight: bold;
}
::v-deep(.row-done) {
  color: #bbb !important;
}

.handle-wrapper {
  @apply mb-20px flex justify-between items-center;
  ::v-deep(.el-button) {
    width: 140px;
  }

  .full-btn {
    @apply h-32px w-32px flex justify-center items-center ml-4px cursor-pointer;
    border-radius: var(--el-border-radius-base);
    background-color: var(--el-fill-color-lighter);
    &:hover {
      color: var(--el-color-primary);
    }
  }
}
</style>
