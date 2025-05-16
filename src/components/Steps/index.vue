<template>
  <div class="step-wrapper">
    <slot />
  </div>
</template>

<script setup lang="ts"></script>

<style lang="less">
.step-wrapper {
  @apply flex items-center;
  .step-item-wrapper {
    &:not(:first-child) {
      .step-item-tag {
        .step-link-line {
        }
      }
    }
  }
}
</style>
