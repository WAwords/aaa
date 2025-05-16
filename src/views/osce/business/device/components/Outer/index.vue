<template>
  <div id="outer">
    <div class="out-container">
      <template v-if="examBegin">
        <div class="exam-begin">
          <div class="aside">
            <div class="station">
              <TextScroll
                :content="`${displayMsg.roomName}（${displayMsg.roomNumber}）`"
              />
            </div>
            <div class="skill-type">
              <TextScroll :content="displayMsg.skillTypeName" />
            </div>
            <div class="time-tag">
              <div class="time-tag-msg">
                <img src="@/assets/img/osce/device/ico-time@2x.png" alt="" />
                <span> 项目时长 </span>
              </div>
              <div class="time-tag-msg">
                <div>
                  <span>{{ displayMsg.duration }}</span>
                  <span>分钟</span>
                </div>
              </div>
            </div>
          </div>
          <div class="main">
            <div class="status-container">
              <div class="status">
                <span class="wait" v-if="stationStatus === 0">等待考生中</span>
                <span class="ready" v-else-if="stationStatus === 1">
                  考生准备中
                </span>
                <span class="ongoing" v-else-if="stationStatus === 2">
                  考生考试中
                </span>
              </div>
              <div class="time-left" v-if="stationStatus === 2">
                <img src="@/assets/img/osce/device/ico-time@2x.png" alt="" />
                <span>本站考试倒计时</span>
                <span>{{ timeLeftFormat }}</span>
              </div>
            </div>
            <div
              class="time-left portrait"
              :style="{
                visibility: stationStatus === 2 ? 'visible' : 'hidden',
              }"
            >
              <div>
                <img src="@/assets/img/osce/device/ico-time@2x.png" alt="" />
                <span>本站考试倒计时</span>
              </div>
              <div>
                <span>{{ timeLeftFormat }}</span>
              </div>
            </div>
            <div class="main-container">
              <template v-if="examInfo.examination.mode === '1'">
                <div class="main-f-important">
                  <div class="wait" v-if="stationStatus === 0">
                    当前暂无考生
                  </div>
                  <div class="other" v-else>
                    <div class="other-msg">当前考站考生</div>
                    <div class="other-msg">
                      <TextScroll :content="examinee.user.name" />
                    </div>
                    <div class="other-msg">
                      <TextScroll
                        :content="
                          examinee?.studentNumber
                            ? `(${examinee.studentNumber})`
                            : ''
                        "
                      />
                    </div>
                  </div>
                </div>
              </template>
              <template v-else-if="examInfo.examination.mode === '2'">
                <div class="main-f-important">
                  <div class="wait" v-if="!lastingMsg?.examinee">
                    当前暂无考生
                  </div>
                  <div class="other" v-else>
                    <div class="other-msg">当前考站考生</div>
                    <div class="other-msg">
                      <TextScroll
                        :content="
                          examInfo.examinees.find(
                            (i: any) => i.id === lastingMsg?.examinee,
                          )?.user?.name
                        "
                      />
                    </div>
                    <div class="other-msg">
                      <TextScroll
                        :content="
                          examInfo.examinees.find(
                            (i: any) => i.id === lastingMsg?.examinee,
                          )?.studentNumber
                            ? `(${
                                examInfo.examinees.find(
                                  (i: any) => i.id === lastingMsg?.examinee,
                                )?.studentNumber
                              })`
                            : ''
                        "
                      />
                    </div>
                  </div>
                </div>
              </template>
            </div>
            <div
              v-if="examInfo.examination.mode === '2'"
              class="below-container"
            >
              <div class="below-item">
                <div>当前考生下一考站</div>
                <TextScroll :content="nextStationComVal" />
              </div>
              <div class="below-item">
                <div>当前考站下一考生</div>
                <TextScroll :content="nextExamineeComVal" />
              </div>
            </div>
          </div>
        </div>
      </template>

      <template v-else>
        <div class="exam-wait">
          <div class="wait-container">
            <div class="header-container">当前考站</div>
            <div class="content-container">
              <div>{{ station?.roomName }}<br />{{ station?.roomNumber }}</div>
              <div>站外显示设备</div>
            </div>
            <div class="footer-container"> 考试尚未开始，请考生耐心等待 </div>
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
  </div>
</template>

<script setup lang="ts">
import { useOuterState } from "./outerState";

const {
  WS,
  station,
  deviceLogin,
  disconnect,
  nextStationComVal,
  nextExamineeComVal,
  timeLeftFormat,
  examBegin,
  displayMsg,
  stationStatus,
  examInfo,
  examinee,
  lastingMsg,
  isFullscreen,
  screenfull,
  handleScreenChange,
  handleLogout,
  initExam,
} = useOuterState();

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
  isFullscreen.value = screenfull.isFullscreen;
  updateElementVariables();
  // 如果需要，也可以在窗口大小变化时更新变量
  window.addEventListener("resize", updateElementVariables);

  if (!WS.value) {
    deviceLogin(); // 登录设备
  }
});

onUnmounted(() => {
  initExam();
  window.removeEventListener("resize", updateElementVariables);
  disconnect();
});

/** 0：横屏 1：竖屏 */
const screenStatus = ref(0);

watch(
  () => screenStatus.value,
  (val) => {
    let element = document.getElementById("outer");
    if (val === 0) {
      element!.classList.remove("portrait");
    } else {
      element!.classList.add("portrait");
    }

    element!.style.visibility = "hidden";
    setTimeout(() => {
      element!.style.visibility = "visible";
    }, 0);
  },
);

const updateElementVariables = () => {
  // var element = document.getElementsByTagName("body")[0];
  var element = document.getElementById("outer");

  var height = element!.offsetHeight;
  var width = element!.offsetWidth;

  // 根据宽高比设置变量
  if (width / height > 1) {
    screenStatus.value = 0;
    document.documentElement.style.setProperty(
      "--height-unit",
      height / 1080 + "px",
    );
    document.documentElement.style.setProperty(
      "--width-unit",
      width / 1920 + "px",
    );
  } else {
    screenStatus.value = 1;
    document.documentElement.style.setProperty(
      "--height-unit",
      height / 1920 + "px",
    );
    document.documentElement.style.setProperty(
      "--width-unit",
      width / 1080 + "px",
    );
  }
};
</script>

<style scoped lang="less">
.exam-wait {
  @apply bg-white h-full w-full flex justify-center items-center text-center;

  @apply bg-no-repeat bg-cover bg-origin-border bg-right;
  background-image: url(@/assets/img/osce/device/bg@2x.png);

  .wait-container {
    @apply flex flex-col items-center;

    border-radius: var(--el-border-radius-base);
    padding: 0 calc(40 * var(--width-unit)) calc(40 * var(--width-unit))
      calc(40 * var(--width-unit));
    word-break: break-all;
    background-color: #fff;
    .header-container {
      flex: none;
      height: calc(140 * var(--width-unit));
      width: calc(800 * var(--width-unit));
      display: flex;
      align-items: center;
      justify-content: center;
      color: #2e4255;
      font-size: calc(50 * var(--width-unit));
      font-weight: bold;
      background-image: url(@/assets/img/osce/login/login-bg-top.png);
      background-size: 100% 100%;
      background-position: center;
      background-repeat: no-repeat;
    }
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

  .main-text {
    @apply text-30px font-bold;
  }
}

.sec-text {
  @apply text-20px mt-10px;
}

.bg-img-set(@image) {
  background-image: url(@image);
  background-size: 100% 100%;
  background-position: center;
  background-repeat: no-repeat;
}

@height-unit: var(--height-unit);
@width-unit: var(--width-unit);

// 横屏
#outer:not(.portrait) {
  @apply h-full relative;
  font-family: AlimamaShuHeiTi-Bold !important;
  .out-container {
    @apply relative h-full;
    .exam-begin {
      @apply h-full w-full flex items-center text-center box-border overflow-hidden;
      background-image: url(@/assets/img/osce/device/bg@2x.png);
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      padding: calc(50 * @height-unit) calc(60 * @width-unit);
      // 侧边栏
      .aside {
        @apply h-full overflow-hidden flex flex-col justify-between;
        .bg-img-set("@/assets/img/osce/device/bg-l@2x.png");
        padding: calc(50 * @height-unit) calc(30 * @height-unit);
        width: calc(500 * @width-unit);
        // 考站信息
        .station {
          @apply h-full w-full overflow-hidden flex items-center justify-center flex-none;
          .bg-img-set("@/assets/img/osce/device/bg-kzmc@2x.png");
          height: calc(120 * @height-unit);
          color: #2e4255;
          font-size: calc(36 * @width-unit);
          line-height: calc(60 * @height-unit);
        }
        // 技能类型
        .skill-type {
          @apply h-full w-full overflow-hidden flex items-center flex-none truncate;
          .bg-img-set("@/assets/img/osce/device/bg-kkmc@2x.png");
          height: calc(148 * @height-unit);
          color: #005eac;
          font-size: calc(48 * @width-unit);
          line-height: calc(60 * @height-unit);
          box-sizing: border-box;
        }
        // 考试时间
        .time-tag {
          @apply h-full w-full overflow-hidden flex items-center justify-center flex-none truncate flex-col;
          .bg-img-set("@/assets/img/osce/device/bg-xmsj@2x.png");
          height: calc(215 * @height-unit);
          .time-tag-msg {
            font-family: SourceHanSansSCVF-Regular;
            &:nth-of-type(1) {
              @apply flex items-center justify-center;
              font-size: calc(24 * @width-unit);
              color: #2e4255;
              img {
                width: calc(30 * @width-unit);
                height: calc(30 * @width-unit);
                margin-right: calc(10 * @width-unit);
              }
            }
            &:nth-of-type(2) {
              @apply flex justify-center items-center;
              .bg-img-set("@/assets/img/osce/device/bg-time@2x.png");
              width: calc(360 * @width-unit);
              height: calc(80 * @width-unit);
              span:nth-of-type(1) {
                font-size: calc(60 * @width-unit);
                color: #ff8400;
                font-weight: bold;
                letter-spacing: 2px;
              }
              span:nth-of-type(2) {
                font-size: calc(24 * @width-unit);
              }
            }
          }
        }
      }

      // 主内容
      .main {
        @apply h-full flex-1 overflow-hidden flex flex-col;
        .bg-img-set("@/assets/img/osce/device/bg-r@2x.png");
        margin-left: calc(18 * @width-unit);
        padding-top: calc(75 * @height-unit);
        padding-bottom: calc(50 * @height-unit);
        .status-container {
          flex: none;
          height: calc(70 * @height-unit);
          background-color: rgba(24, 100, 174, 0.1);
          position: relative;
          .status {
            @apply h-full w-full flex items-center justify-center;
            font-size: calc(48 * @width-unit);
            .wait {
              color: #19c469;
            }
            .ready {
              color: #3c9cff;
            }
            .ongoing {
              color: #ff8400;
            }
          }
          .time-left {
            .bg-img-set("@/assets/img/osce/device/bg-ksdjs@2x.png");
            height: calc(82 * @height-unit);
            width: calc(520 * @width-unit);
            position: absolute;
            right: 0;
            top: 0;
            @apply flex items-center justify-end;
            padding-right: calc(40 * @width-unit);
            padding-bottom: calc(10 * @height-unit);
            font-family: SourceHanSansSCVF-Regular;
            img {
              width: calc(30 * @width-unit);
              height: calc(30 * @width-unit);
              margin-right: calc(10 * @width-unit);
            }
            span:nth-of-type(1) {
              font-size: calc(24 * @width-unit);
              color: #2e4255;
              margin-right: calc(10 * @width-unit);
            }
            span:nth-of-type(2) {
              font-size: calc(48 * @width-unit);
              color: #ff8400;
              font-weight: bold;
              letter-spacing: 2px;
            }
          }
        }
        // 倒计时
        .time-left.portrait {
          display: none;
        }
        // 主内容（考生姓名）
        .main-container {
          @apply h-full w-full flex items-center flex-1;
          .main-f-important {
            @apply w-full flex justify-center items-center;
            .bg-img-set("@/assets/img/osce/device/bg-ksxm@2x.png");
            height: calc(330 * @height-unit);
            .wait {
              font-size: calc(72 * @width-unit);
              color: #435566;
            }
            .other {
              @apply w-full flex flex-col items-center justify-center overflow-hidden;
              padding: 0 calc(30 * @height-unit);
              .other-msg {
                @apply w-full;
              }
              .other-msg:nth-of-type(1) {
                font-family: SourceHanSansSCVF-Regular;
                font-size: calc(36 * @width-unit);
                color: #2e4255;
                line-height: calc(50 * @width-unit);
                font-weight: 600;
              }
              .other-msg:nth-of-type(2) {
                font-size: calc(156 * @width-unit);
                color: #1864ae;
                font-weight: 600;
                line-height: calc(180 * @width-unit);
              }
              .other-msg:nth-of-type(3) {
                font-family: SourceHanSansSCVF-Regular;
                font-size: calc(48 * @width-unit);
                color: #ff8400;
                font-weight: 600;
                line-height: calc(60 * @width-unit);
              }
            }
          }
        }

        .below-container {
          @apply flex flex-col items-center justify-center;
          height: calc(220 * @height-unit);
          .bg-img-set("@/assets/img/osce/device/bg-xzxx@2x.png");
          .below-item {
            @apply flex;
            width: calc(740 * @width-unit);
            background-image: url(@/assets/img/osce/device/bg-text-bottom@2x.png);
            background-size: 100% 50%;
            background-position: bottom;
            background-repeat: no-repeat;
            div:nth-of-type(1) {
              @apply w-1/2 flex items-center justify-end;
              font-family: SourceHanSansSCVF-Regular;
              font-size: calc(24 * @width-unit);
              color: #2e4255;
            }
            div:nth-of-type(2) {
              @apply w-1/2;
              margin-left: calc(20 * @width-unit);
              font-size: calc(24 * @width-unit);
              color: #1864ae;
            }
          }
          .below-item:nth-of-type(2) {
            margin-top: calc(25 * @width-unit);
          }
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

  // 考试等待
  .exam-wait {
    .wait-container {
      width: calc(1500 * var(--width-unit));
      height: calc(800 * var(--width-unit));
    }
  }
}

// 竖屏
#outer.portrait {
  @apply h-full relative;
  font-family: AlimamaShuHeiTi-Bold !important;
  .out-container {
    @apply relative h-full;
    .exam-begin {
      @apply h-full w-full flex items-center text-center box-border overflow-hidden;
      background-image: url(@/assets/img/osce/device/bg@2x.png);
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      padding: calc(30 * @width-unit);
      @apply flex-col;
      background-image: url(@/assets/img/osce/device/portrait-bg@2x.png);
      // 侧边栏
      // 竖屏
      .aside {
        @apply w-full overflow-hidden flex flex-col justify-between;
        .bg-img-set("@/assets/img/osce/device/portrait-bg-top@2x.png");
        padding: calc(50 * @height-unit) calc(30 * @height-unit);
        height: calc(620 * @height-unit);
        // 考站信息
        .station {
          @apply h-full w-full overflow-hidden flex items-center justify-center flex-none;
          .bg-img-set("@/assets/img/osce/device/bg-kzmc@2x.png");
          height: calc(120 * @height-unit);
          color: #2e4255;
          font-size: calc(36 * @width-unit);
          line-height: calc(60 * @height-unit);
        }
        // 技能类型
        .skill-type {
          @apply h-full w-full overflow-hidden flex items-center flex-none truncate;
          .bg-img-set("@/assets/img/osce/device/bg-kkmc@2x.png");
          height: calc(148 * @height-unit);
          color: #005eac;
          font-size: calc(48 * @width-unit);
          line-height: calc(60 * @width-unit);
          box-sizing: border-box;
        }
        // 考试时间
        .time-tag {
          @apply h-full w-full overflow-hidden flex items-center justify-center flex-none truncate flex-col;
          .bg-img-set("@/assets/img/osce/device/bg-xmsj@2x.png");
          height: calc(180 * @height-unit);
          .time-tag-msg {
            font-family: SourceHanSansSCVF-Regular;
            &:nth-of-type(1) {
              @apply flex items-center justify-center;
              font-size: calc(24 * @width-unit);
              color: #2e4255;
              img {
                width: calc(30 * @width-unit);
                height: calc(30 * @width-unit);
                margin-right: calc(10 * @width-unit);
              }
            }
            &:nth-of-type(2) {
              @apply flex justify-center items-center;
              .bg-img-set("@/assets/img/osce/device/bg-time@2x.png");
              width: calc(360 * @width-unit);
              height: calc(80 * @width-unit);
              span:nth-of-type(1) {
                font-size: calc(60 * @width-unit);
                color: #ff8400;
                font-weight: bold;
                letter-spacing: 2px;
              }
              span:nth-of-type(2) {
                font-size: calc(24 * @width-unit);
              }
            }
          }
        }
      }

      // 主内容
      .main {
        @apply w-full flex-1 overflow-hidden flex flex-col;
        .bg-img-set("@/assets/img/osce/device/portrait-bg-bottom@2x.png");
        margin-top: calc(20 * @height-unit);
        padding-bottom: calc(50 * @height-unit);
        padding-top: calc(70 * @height-unit);
        .status-container {
          flex: none;
          height: calc(128 * @height-unit);
          background: linear-gradient(
            to left,
            rgba(0, 0, 0, 0),
            rgba(231, 239, 247, 1) 50%,
            rgba(0, 0, 0, 0)
          );
          position: relative;
          .status {
            @apply h-full w-full flex items-center justify-center;
            font-size: calc(48 * @width-unit);
            .wait {
              color: #19c469;
            }
            .ready {
              color: #3c9cff;
            }
            .ongoing {
              color: #ff8400;
            }
          }
          .time-left {
            display: none;
          }
        }
        // 倒计时
        .time-left.portrait {
          .bg-img-set("@/assets/img/osce/device/bg-djs@2x.png");
          @apply w-full;
          height: calc(120 * @height-unit);
          margin-top: calc(30 * @height-unit);
          padding-bottom: calc(10 * @height-unit);
          font-family: SourceHanSansSCVF-Regular;
          div:nth-of-type(1) {
            @apply flex items-center justify-center;
            img {
              width: calc(30 * @width-unit);
              height: calc(30 * @width-unit);
              margin-right: calc(10 * @width-unit);
            }
            span {
              font-size: calc(24 * @width-unit);
              color: #2e4255;
            }
          }
          div:nth-of-type(2) {
            span {
              font-size: calc(48 * @width-unit);
              color: #ff8400;
              font-weight: bold;
              letter-spacing: 2px;
            }
          }
        }
        // 主内容（考生姓名）
        .main-container {
          @apply h-full w-full flex items-center flex-1;
          .main-f-important {
            @apply w-full flex justify-center items-center;
            .bg-img-set("@/assets/img/osce/device/bg-ksxm@2x.png");
            height: calc(330 * @height-unit);
            .wait {
              font-size: calc(72 * @width-unit);
              color: #435566;
            }
            .other {
              @apply w-full flex flex-col items-center justify-center overflow-hidden;
              padding: 0 calc(30 * @height-unit);
              .other-msg {
                @apply w-full;
              }
              .other-msg:nth-of-type(1) {
                font-family: SourceHanSansSCVF-Regular;
                font-size: calc(36 * @width-unit);
                color: #2e4255;
                line-height: calc(50 * @width-unit);
                font-weight: 600;
              }
              .other-msg:nth-of-type(2) {
                font-size: calc(156 * @width-unit);
                color: #1864ae;
                font-weight: 600;
                line-height: calc(180 * @width-unit);
              }
              .other-msg:nth-of-type(3) {
                font-family: SourceHanSansSCVF-Regular;
                font-size: calc(48 * @width-unit);
                color: #ff8400;
                font-weight: 600;
                line-height: calc(60 * @width-unit);
              }
            }
          }
        }

        .below-container {
          @apply flex flex-col items-center justify-center;
          height: calc(220 * @height-unit);
          .bg-img-set("@/assets/img/osce/device/bg-xzxx@2x.png");
          .below-item {
            @apply flex;
            width: calc(740 * @width-unit);
            background-image: url(@/assets/img/osce/device/bg-text-bottom@2x.png);
            background-size: 100% 50%;
            background-position: bottom;
            background-repeat: no-repeat;
            div:nth-of-type(1) {
              @apply w-1/2 flex items-center justify-end;
              font-family: SourceHanSansSCVF-Regular;
              font-size: calc(24 * @width-unit);
              color: #2e4255;
            }
            div:nth-of-type(2) {
              @apply w-1/2;
              margin-left: calc(20 * @width-unit);
              font-size: calc(24 * @width-unit);
              color: #1864ae;
            }
          }
          .below-item:nth-of-type(2) {
            margin-top: calc(25 * @width-unit);
          }
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

  // 考试等待
  .exam-wait {
    .wait-container {
      width: calc(900 * var(--width-unit));
      height: calc(600 * var(--width-unit));
      .header-container {
        font-size: calc(40 * var(--width-unit));
      }
      .content-container {
        font-size: calc(40 * var(--width-unit));
        line-height: calc(60 * var(--width-unit));
      }
      .footer-container {
        font-size: calc(30 * var(--width-unit));
      }
    }
  }
}

// 竖屏
@media (max-aspect-ratio: 1/1) {
}
// 横屏
@media (min-aspect-ratio: 1/1) {
}

/**
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 */

// 解决el-button点击后出现蓝色边框的问题
.el-button.is-text:not(.is-disabled):focus-visible {
  outline: none;
}
.el-button.is-text:not(.is-disabled):hover {
  outline: none;
}
</style>
