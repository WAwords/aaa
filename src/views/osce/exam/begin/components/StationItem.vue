<template>
  <div class="station-item">
    <div class="header">
      <div class="station-name">
        <TextTooltip
          :content="`${data.roomName}${
            data.roomNumber ? '（' + data.roomNumber + '）' : ''
          }`"
        />
      </div>
      <div
        class="station-status"
        :class="{
          wait: +data.status === 1,
          ready: +data.status === 2,
          ongoing: +data.status === 3,
        }"
      >
        {{ ["", "等待中", "准备中", "考试中"][Number(data.status)] }}
      </div>
    </div>

    <div class="content">
      <div class="skill-name">
        <TextTooltip :content="data.skillTypeName" />
      </div>

      <div class="content-wrapper">
        <!-- 考官信息 -->
        <div class="examiner-wrapper">
          <div class="examiner-item">
            <div class="examiner-name">
              <div class="title">主考官</div>
              <div class="msg">
                <TextTooltip :content="`${data.chiefExaminerName}`" />
              </div>
            </div>
            <div class="examiner-ratio">
              <div class="title">评分占比</div>
              <div class="msg">{{ data.chiefExaminerRatio }}</div>
            </div>
          </div>
          <div class="examiner-item">
            <div class="examiner-name">
              <div class="title">副考官</div>
              <div class="msg">
                <TextTooltip :content="data.deputyExaminerName" />
              </div>
            </div>
            <div class="examiner-ratio">
              <div class="title">评分占比</div>
              <div class="msg">{{ data.deputyExaminerRatio }}</div>
            </div>
          </div>
        </div>

        <!-- 是否已提交 -->
        <div class="signature-wrapper" v-if="mode === 'fixed'">
          <div class="examiner-item">
            <div
              class="signature-status"
              v-if="examineeGroupExamStatus === 2 && data.examineeStatus === 0"
              :class="{
                signed: data.chiefExaminerSubmitted,
              }"
            >
              {{ data.chiefExaminerSubmitted ? "已提交" : "未提交" }}
            </div>
          </div>
          <div class="examiner-item">
            <div
              class="signature-status"
              v-if="
                examineeGroupExamStatus === 2 &&
                data.examineeStatus === 0 &&
                data.deputyExaminerName
              "
              :class="{
                signed: data.deputyExaminerSubmitted,
              }"
            >
              {{ data.deputyExaminerSubmitted ? "已提交" : "未提交" }}
            </div>
          </div>
        </div>
      </div>

      <div class="footer">
        <!-- 非固定模式 -->
        <div
          v-if="mode === 'unfixed'"
          :class="{
            wait: +data.status === 1,
            ready: +data.status === 2,
            ongoing: +data.status === 3,
          }"
        >
          <div v-if="data.status === '1'"> 等候考生中 </div>
          <div v-else>
            <TextTooltip
              :content="`${data.examinee ? data.examinee.user.name : ''}${
                data.examinee.studentNumber
                  ? '（' + data.examinee.studentNumber + '）'
                  : ''
              }`"
            />
          </div>
        </div>

        <!-- 固定模式 -->
        <div v-if="mode === 'fixed'" class="mode-fixed">
          <div
            v-if="
              !data.examinee &&
              !data.waitExaminee &&
              !data.examineeStatus &&
              !data.waitExamineeStatus
            "
            class="h-40px"
          >
            等候考生中
          </div>

          <template v-else>
            <!-- 当前考生 -->
            <div class="fixed-footer-item">
              <span>当前考生：</span>
              <span
                v-if="data.examinee"
                :class="{
                  'has-examinee': data.examineeStatus !== 2,
                  'absent-examinee': data.examineeStatus === 2,
                }"
              >
                {{ data.examinee.user.name }}
                {{ data.examineeStatus === 2 ? "（缺考）" : "" }}
              </span>
              <span v-else-if="data.examineeStatus === 1" class="no-examinee">
                无（轮空）
              </span>
              <span v-else class="no-examinee">无</span>
            </div>

            <!-- 下一个考生 -->
            <div class="fixed-footer-item">
              <span>下一考生：</span>
              <span
                v-if="data.waitExaminee"
                :class="{
                  'has-examinee': data.waitExamineeStatus !== 2,
                  'absent-examinee': data.waitExamineeStatus === 2,
                }"
              >
                {{ data.waitExaminee.user.name }}
                {{ data.waitExamineeStatus === 2 ? "（缺考）" : "" }}
              </span>
              <span
                v-else-if="data.waitExamineeStatus === 1"
                class="no-examinee"
                >无（轮空）</span
              >
              <span v-else class="no-examinee">无</span>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useBeginState } from "../beginState";
const { examineeGroupExamStatus } = useBeginState();

interface Props {
  data: any;
  mode?: "fixed" | "unfixed";
}
withDefaults(defineProps<Props>(), {
  data: () => {},
  mode: "unfixed",
});
</script>

<style scoped lang="less">
.station-item {
  border: var(--el-border);
  border-radius: var(--el-border-radius-base);
  font-size: var(--el-font-size-base);
  background-color: var(--el-fill-color-lighter);
  color: var(--el-text-color-regular);
  min-width: 300px;

  @apply bg-no-repeat bg-cover bg-right cursor-default;
  background-image: url(@/assets/img/osce/exam/station-bg.png);

  // 头部
  .header {
    @apply h-40px px-10px flex items-center justify-between overflow-hidden;
    border-bottom: var(--el-border);
    .station-name {
      @apply font-bold flex-1 overflow-hidden;
    }
    .station-status {
      @apply flex-none ml-10px h-26px flex items-center justify-center px-10px rounded-full text-[#ffffff] font-bold;

      &.wait {
        background-color: var(--el-color-warning);
      }
      &.ready {
        background-color: var(--el-color-success);
      }
      &.ongoing {
        background-color: var(--el-color-primary);
      }
    }
  }

  // 主内容
  .content {
    @apply p-10px;
    .skill-name {
      @apply font-bold;
    }

    .content-wrapper {
      @apply my-15px;
      .examiner-wrapper {
        @apply flex;
        .examiner-item {
          @apply w-1/2 flex flex-none;
          &:first-child {
            @apply pr-10px mr-10px;
            border-right: var(--el-border);
          }

          & > div {
            @apply w-1/2;

            &:first-child {
              @apply pr-5px mr-5px;
            }
            .title {
              font-size: var(--el-font-size-extra-small);
              color: var(--el-text-color-secondary);
            }
            .msg {
              @apply font-bold mt-10px;
              line-height: 20px;
            }
          }

          .examiner-name {
            .msg {
            }
          }
          .examiner-ratio {
            .msg {
              color: var(--el-color-primary);
              font-family: D-DIN-Bold;
              font-size: var(--el-font-size-large);
            }
          }
        }
      }
      .signature-wrapper {
        @apply flex;
        .examiner-item {
          @apply w-1/2 flex pt-10px h-30px flex-none;
          &:first-child {
            @apply pr-10px mr-10px;
            border-right: var(--el-border);
          }

          .signature-status {
            @apply h-full flex items-center justify-center px-10px rounded-full text-[#ffffff];
            background-color: var(--el-color-danger);
            font-size: var(--el-font-size-extra-small);
            &.signed {
              background-color: var(--el-color-primary);
            }
          }
        }
      }
    }

    .footer {
      @apply pt-10px font-bold;
      border-top: var(--el-border);
      .wait {
        color: var(--el-text-color-secondary);
      }
      .ready {
        color: var(--el-color-primary);
      }
      .ongoing {
        color: var(--el-color-primary);
      }

      .fixed-footer-item {
        @apply h-20px;
        // 三种状态（无考生，有考生，考生缺考）
        .no-examinee {
          color: var(--el-text-color-secondary);
        }
        .has-examinee {
          color: var(--el-color-primary);
        }
        .absent-examinee {
          color: var(--el-color-danger);
        }
      }
    }
  }
}
</style>
