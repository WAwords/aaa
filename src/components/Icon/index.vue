<template>
  <Icon
    :icon="`${icon}`"
    :style="{ color: color, height: size, width: size }"
  />
</template>

<script setup lang="ts">
import { Icon } from "@iconify/vue";
interface Props {
  icon: string;
  color?: string;
  size?: string;
}
const props = withDefaults(defineProps<Props>(), {
  icon: "",
  size: "1rem",
});
props;
</script>

<style scoped lang="less"></style>
