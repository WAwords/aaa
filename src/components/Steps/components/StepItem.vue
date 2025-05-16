<template>
  <!-- TODO 优化，参考element-plus -->
  <div
    class="step-item-wrapper"
    :class="{ 'is-finished': finished, 'is-active': active }"
  >
    <div class="step-item-tag-wrapper">
      <div class="step-item-tag">{{ step }} </div>
      <div class="step-link-line" v-if="!isFirst">
        <div class="dot" v-for="i in 6" :key="i"></div>
      </div>
    </div>
    <div class="step-item-text">
      {{ title }}
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  step: number;
  title: string;
  active: boolean;
  finished: boolean;
  isFirst?: boolean;
}
withDefaults(defineProps<Props>(), {
  isFirst: false,
});
</script>

<style lang="less">
// 容器
.step-item-wrapper {
  @apply flex-1 flex flex-col justify-center items-center cursor-pointer;

  // 步骤标签容器
  .step-item-tag-wrapper {
    @apply relative w-full flex justify-center items-center;

    // 步骤标签
    .step-item-tag {
      @apply w-42px h-42px rounded-full flex justify-center items-center relative;
      background-color: var(--el-color-primary-light-8);
      color: #ffffff;
      border: 6px solid #ffffff;
      font-family: D-DIN-Bold;
      user-select: none;
    }

    // 步骤连接线
    .step-link-line {
      @apply absolute top-1/2 left-0 overflow-hidden flex justify-center items-center;
      transform: translate(-50%, -50%);
      .dot {
        @apply w-4px h-4px rounded-full;
        background-color: var(--el-color-primary-light-8);
        &:not(:first-child) {
          margin-left: 4px;
        }
      }
    }
  }

  // 步骤文本
  .step-item-text {
    @apply mt-16px;
    color: var(--el-text-color-disabled);
  }

  // 完成状态
  &.is-finished {
    .step-item-tag-wrapper {
      .step-item-tag {
        background-color: var(--el-color-primary);
        color: #ffffff;
      }
      .step-link-line {
        .dot {
          background-color: var(--el-color-primary);
        }
      }
    }

    .step-item-text {
      color: var(--el-text-color-primary);
    }
  }

  // 激活状态
  &.is-active {
    .step-item-tag-wrapper {
      .step-item-tag {
        @apply text-[#ffffff] w-42px h-42px;
        background-color: var(--el-color-primary);
        border: 6px solid var(--el-color-primary-light-8);
      }
      .step-link-line {
        .dot {
        }
      }
    }

    .step-item-text {
      color: var(--el-color-primary);
    }
  }
}
</style>
