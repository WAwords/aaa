<template>
  <div id="wait">
    <div class="wait-container">
      <template v-if="examBegin">
        <div class="exam-begin">
          <div class="main">
            <div class="title">
              <TextScroll :content="examInfo.examination.name" />
            </div>
            <div class="table-container">
              <el-table
                ref="tableRef"
                v-loading="loading"
                :data="tempExamInfo.groups"
                class="w-full"
                height="100%"
                :row-class-name="setRowClassName"
                header-row-class-name="table-header"
                :cell-style="setCellStyle"
                :highlight-current-row="false"
                cell-class-name="body-cell"
                header-cell-class-name="header-cell"
                stripe
              >
                <template #empty>
                  <el-empty description="暂无数据" />
                </template>
                <el-table-column
                  type="index"
                  fixed
                  align="center"
                  :width="groupColMinWidth"
                >
                  <template #header>
                    <div class="fixed-header">组号</div>
                  </template>
                  <template #default="{ $index }">
                    <div class="fixed-body">{{ $index + 1 }}</div>
                  </template>
                </el-table-column>
                <el-table-column
                  v-for="(item, index) in tempExamInfo.arrangements"
                  :label="`${item.roomName}`"
                  :min-width="mainColMinWidth"
                  align="center"
                  show-overflow-tooltip
                >
                  <template #header="{ $index }">
                    <div class="header-container">
                      <div>
                        {{ tempExamInfo.arrangements[$index - 1]?.roomName }}
                      </div>
                      <div>
                        ({{
                          tempExamInfo.arrangements[$index - 1]?.roomNumber
                        }})
                      </div>
                    </div>
                  </template>
                  <template #default="{ row }">
                    {{ `${row[index] ? row[index].user.name : ""}` }}
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>
        </div>
      </template>

      <template v-else>
        <div class="exam-wait">
          <div class="wait-container"
            ><div class="content-container">考试未开始</div>
            <div class="footer-container">考试尚未开始，请考生耐心等待</div>
          </div>
        </div>
        <div class="setting-btn">
          <el-dropdown :teleported="false" trigger="click">
            <el-button>
              <el-icon>
                <Icon icon="ant-design:setting-outlined" />
              </el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="handleScreenChange">
                  {{ isFullscreen ? "退出全屏" : "全屏" }}
                </el-dropdown-item>
                <el-dropdown-item @click="handleLogout"
                  >登出设备</el-dropdown-item
                >
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </template>
    </div>

    <div class="setting-btn">
      <el-dropdown :teleported="false" trigger="click" v-if="examBegin">
        <el-button class="opacity-0">
          <el-icon>
            <Icon icon="ant-design:setting-outlined" />
          </el-icon>
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="handleScreenChange">
              {{ isFullscreen ? "退出全屏" : "全屏" }}
            </el-dropdown-item>
            <el-dropdown-item @click="handleLogout">登出设备</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>

    <el-dialog
      class="call-dialog"
      :show-close="false"
      v-model="noticeVisible"
      destroy-on-close
      align-center
      :close-on-click-modal="false"
    >
      <div class="call-dialog-container">
        <div class="call-title">请以下考生前往指定考站准备进行考试</div>
        <div class="call-mid">
          <el-scrollbar ref="callScrollBarRef">
            <div class="scrollbar-container">
              <div class="examinees-container">
                <div class="station-item" v-for="i in stationList">
                  <div class="station-msg">
                    <TextScroll :content="`${i.roomName}（${i.roomNumber}）`" />
                  </div>
                  <div class="examinee-msg" v-if="i.examinee">
                    <div>
                      <TextScroll :content="i.examinee.user.name" />
                    </div>
                    <div>
                      <TextScroll
                        :content="
                          i.examinee.studentNumber
                            ? `（${i.examinee.studentNumber}）`
                            : ''
                        "
                      />
                    </div>
                  </div>
                  <div class="examinee-msg no-examinee" v-else>
                    <div>暂无考生</div>
                    <div>
                      <TextScroll content="" />
                    </div>
                  </div>
                </div>
              </div>
              <div class="examinees-container">
                <div class="station-item" v-for="i in callTempStationList">
                  <div class="station-msg">
                    <TextScroll :content="`${i.roomName}（${i.roomNumber}）`" />
                  </div>
                  <div class="examinee-msg" v-if="i.examinee">
                    <div>
                      <TextScroll :content="i.examinee.user.name" />
                    </div>
                    <div>
                      <TextScroll
                        :content="
                          i.examinee.studentNumber
                            ? `（${i.examinee.studentNumber}）`
                            : ''
                        "
                      />
                    </div>
                  </div>
                  <div class="examinee-msg no-examinee" v-else>
                    <div>暂无考生</div>
                    <div>
                      <TextScroll content="" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </el-scrollbar>
        </div>

        <div class="call-tip">请各位考生严格遵守考场秩序</div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { useWaitState } from "./waitState";

const {
  WS,
  // 下边是组件需要的信息
  loading,
  examBegin,
  examInfo,
  tempExamInfo,
  groupColMinWidth,
  mainColMinWidth,
  isFullscreen,
  noticeVisible,
  stationList,
  callTempStationList,
  screenfull,
  callScrollBarRef,
  tableRef,
  handleLogout,
  handleScreenChange,
  setRowClassName,
  setCellStyle,
  updateElementVariables,
  initExam,
  deviceLogin,
  disconnect,
} = useWaitState();

// 显示时重新连接
visibilityListener(
  () => {
    initExam();
    if (!WS.value) {
      deviceLogin(); // 登录设备
    }
  },
  () => {
    disconnect();
  },
);

onMounted(() => {
  if (!WS.value) {
    deviceLogin(); // 登录设备
  }

  isFullscreen.value = screenfull.isFullscreen;
  updateElementVariables();
  // 如果需要，也可以在窗口大小变化时更新变量
  window.addEventListener("resize", updateElementVariables);
});

onUnmounted(() => {
  initExam();
  window.removeEventListener("resize", updateElementVariables);
  disconnect();
});

const { startAutoHideMouse, stopAutoHideMouse } = useAutoHideMouse(5000);
watch(
  () => isFullscreen.value,
  (val) => {
    if (val) {
      startAutoHideMouse();
    } else {
      stopAutoHideMouse();
    }
  },
);
</script>

<style scoped lang="less">
.bg-img-set(@image) {
  background-image: url(@image);
  background-size: 100% 100%;
  background-position: center;
  background-repeat: no-repeat;
}

@height-unit: var(--height-unit);
@width-unit: var(--width-unit);

#wait {
  @apply h-full relative;
  font-family: AlimamaShuHeiTi-Bold !important;
  .wait-container {
    @apply relative h-full;
    .exam-begin {
      @apply h-full w-full flex items-center text-center box-border overflow-hidden;
      background-image: url(@/assets/img/osce/device/bg@2x.png);
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      padding: calc(20 * @height-unit) calc(30 * @width-unit)
        calc(30 * @height-unit) calc(30 * @width-unit);
      // 主内容
      .main {
        @apply h-full flex-1 overflow-hidden flex flex-col;
        .bg-img-set("@/assets/img/osce/device/bg-z@2x.png");
        padding-top: calc(75 * @height-unit);
        padding-bottom: calc(50 * @height-unit);
        padding-left: calc(50 * @width-unit);
        padding-right: calc(50 * @width-unit);
        .title {
          @apply flex items-center flex-none;
          .bg-img-set("@/assets/img/osce/device/title-bg@2x.png");
          height: calc(120 * @height-unit);
          font-size: calc(36 * @width-unit);
        }
        .table-container {
          z-index: 0;
          overflow-x: hidden;

          ::v-deep(.table-header) {
            font-family: none;
          }

          // 主内容背景透明（用于显示纵向斑马纹）
          ::v-deep(.el-table) {
            --el-table-row-hover-bg-color: transparent;
            --el-table-fixed-left-column: none;

            // 隐藏水平滚动条
            .el-scrollbar__bar.is-horizontal > div {
              height: 0;
            }
            // 隐藏垂直滚动条
            .el-scrollbar__bar.is-vertical > div {
              width: 0;
            }

            .fixed-header {
              color: #556a80;
            }

            .header-cell {
              height: calc(110 * @width-unit);
              color: #005eac;
              .header-container {
                display: flex;
                flex-direction: column;
                line-height: calc(30 * @width-unit) !important;
              }
            }

            .cell {
              padding: 0 calc(12 * @width-unit);
              line-height: normal;
              font-size: calc(24 * @width-unit);
            }

            .body-cell {
              height: calc(100 * @height-unit);
            }

            .el-table__body tr > td:not(:first-child):nth-child(even) {
              background-color: #e5eef6;
            }
            .el-table__body
              tr.row-ongoing
              > td:not(:first-child):nth-child(even) {
              .bg-img-set("@/assets/img/osce/device/bg-hrm@2x.png");
            }

            // 等待中
            .row-waiting {
            }
            // 进行中
            .row-ongoing {
              color: #fff !important;
              font-weight: bold;
              background-color: transparent;
              .bg-img-set("@/assets/img/osce/device/bg-hrm@2x.png");
              z-index: 100;
            }
            // 已完成
            .row-done {
              color: #bbb !important;
            }
          }

          // 第一列设置背景为白色（第一列使序号列）
          ::v-deep(.el-table__body tbody > tr.hover-row td:nth-of-type(1)) {
            background-color: #f6f9fc !important;
          }
          ::v-deep(.el-table__body tbody > tr td:nth-of-type(1)) {
            background-color: #f6f9fc !important;
          }
          ::v-deep(.el-table__header thead > tr th:nth-of-type(1)) {
            background-color: #f6f9fc !important;
          }

          ::v-deep(.el-table) {
            --el-table-header-bg-color: transparent;
            --el-table-bg-color: transparent;
            --el-table-tr-bg-color: transparent;
          }

          /**
           * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
           */
          // 纵向斑马纹
          // ::v-deep(
          //     .row-class:nth-of-type(1)
          //       td:not(:first-child):nth-child(even)
          //       .cell
          //   )::after {
          //   content: "";
          //   width: 100%;
          //   height: calc(700% + 3px);
          //   position: absolute;
          //   z-index: -1;
          //   left: 0;
          //   top: 0;
          //   background: linear-gradient(
          //     to bottom,
          //     #ffffff00,
          //     #e5eef6 50%,
          //     #ffffff00
          //   );
          // }

          /**
           * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
           */
        }
      }
    }
    .exam-wait {
      @apply bg-white h-full w-full flex justify-center items-center text-center;

      @apply bg-no-repeat bg-cover bg-origin-border bg-right;
      background-image: url(@/assets/img/osce/device/bg@2x.png);

      .wait-container {
        @apply flex flex-col items-center justify-center;
        width: calc(1500 * var(--width-unit));
        height: calc(800 * var(--width-unit));
        border-radius: var(--el-border-radius-base);
        padding: 0 calc(40 * var(--width-unit)) calc(40 * var(--width-unit))
          calc(40 * var(--width-unit));
        word-break: break-all;
        background-color: #fff;
        .content-container {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          font-size: calc(60 * var(--width-unit));
          line-height: calc(100 * var(--width-unit));
          font-weight: bold;
          color: var(--el-color-primary);
          &.disconnected {
            color: var(--el-color-danger);
          }
        }

        .footer-container {
          flex: none;
          height: calc(120 * var(--width-unit));
          width: 100%;
          box-sizing: border-box;
          border: calc(3 * var(--width-unit)) solid var(--el-color-danger);
          border-radius: var(--el-border-radius-base);
          color: var(--el-color-danger);
          font-weight: bold;
          font-size: calc(40 * var(--width-unit));
          display: flex;
          justify-content: center;
          align-items: center;
          background-color: #fcebeb;
        }
      }
    }
    .setting-btn {
      @apply absolute right-20px top-20px;
    }
  }

  .setting-btn {
    @apply absolute right-0 top-0;
  }

  ::v-deep(.el-dialog.call-dialog) {
    .bg-img-set("@/assets/img/osce/device/bg-jh@2x.png");
    background-color: transparent;
    height: calc(830 * @height-unit);
    width: calc(1480 * @width-unit);
    padding: calc(50 * @height-unit) calc(40 * @width-unit);

    // 纵向滚动条隐藏
    .el-scrollbar__bar.is-vertical > div {
      width: 0;
    }

    .el-dialog__header {
      display: none;
    }
    .el-dialog__body {
      overflow: hidden;
      height: 100%;
      .call-dialog-container {
        @apply flex flex-col h-full;
        .call-title {
          @apply flex items-center justify-center flex-none;
          color: #2e4255;
          height: calc(90 * @height-unit);
          font-size: calc(48 * @width-unit);
          background: linear-gradient(
            to right,
            #ffffff00,
            #e5eef6 50%,
            #ffffff00
          );
        }
        .call-tip {
          @apply flex items-center justify-center flex-none;
          color: #e23f3f;
          height: calc(70 * @height-unit);
          font-size: calc(36 * @width-unit);
          background: linear-gradient(
            to right,
            #ffffff00,
            #e5eef6 50%,
            #ffffff00
          );
        }
        .call-mid {
          @apply flex-1 overflow-hidden;
          margin: calc(20 * @height-unit) 0;
        }
        .examinees-container {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          grid-gap: calc(20 * @width-unit);
          overflow: hidden;
          &:nth-of-type(1) {
            margin-bottom: calc(20 * @width-unit);
          }
          .station-item {
            @apply overflow-hidden flex flex-col;
            .bg-img-set("@/assets/img/osce/device/bg-ry@2x.png");
            height: calc(250 * @height-unit);
            padding: calc(20 * @width-unit);
            // 考站信息
            .station-msg {
              @apply flex items-center;
              height: calc(60 * @height-unit);
              color: #2e4255;
              font-size: calc(24 * @width-unit);
            }
            // 考生信息
            .examinee-msg {
              @apply flex-1 text-center flex flex-col items-center justify-center overflow-hidden;
              .bg-img-set("@/assets/img/osce/device/bg-rm@2x.png");
              // 有考生的话
              &:not(.no-examinee) {
                @apply w-full;
                & > div:nth-of-type(1) {
                  @apply w-full;
                  color: #1864ae;
                  font-size: calc(60 * @width-unit);
                }
                & > div:nth-of-type(2) {
                  @apply w-full;
                  color: #ff8400;
                  font-size: calc(30 * @width-unit);
                }
              }
              // 没有考生的话
              &.no-examinee {
                @apply flex-1 flex items-center justify-center;
                color: #435566;
                & > div:nth-of-type(1) {
                  font-size: calc(60 * @width-unit);
                }
                & > div:nth-of-type(2) {
                  font-size: calc(30 * @width-unit);
                }
              }
            }
          }
        }
      }
    }
  }
}

/**
  * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
  */

::v-deep(.el-table) {
  border: unset !important;
}
</style>
