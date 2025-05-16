<template>
  <div>
    <component :is="activeComponent"></component>
  </div>
</template>

<script setup lang="ts">
import { useExamEditorState } from "../examEditorState";
import Unfixed from "./Unfixed.vue";
import Fixed from "./Fixed.vue";

const { examMsg } = useExamEditorState();

const activeComponent = shallowRef<any>(null);
const list = {
  "1": Unfixed,
  "2": Fixed,
} as { [key: string]: any };

onMounted(() => {
  activeComponent.value = list[examMsg.value!.mode];
});
</script>

<style scoped lang="less"></style>
