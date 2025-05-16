<template>
  {{ Math.round(output) }}
</template>

<script setup lang="ts">
import { useTransition } from "@vueuse/core";

interface Props {
  num: number;
}
const props = withDefaults(defineProps<Props>(), {});

const source = toRef(props, "num");

const output = useTransition(source, {
  duration: 300, // 过渡持续时间
});
</script>

<style scoped lang="less"></style>
