<template>
  <div class="question-view-container">
    <Type v-model:type-id="typeId" v-model:skill-id="skillId" />
    <Skill v-model:type-id="typeId" v-model:skill-id="skillId" />
    <Criteria v-model:type-id="typeId" v-model:skill-id="skillId" />
  </div>
</template>

<script lang="ts" setup>
import Type from "./components/Type.vue";
import Skill from "./components/Skill.vue";
import Criteria from "./components/Criteria.vue";

defineOptions({
  name: "OsceQuestionQuestion",
});

const typeId = ref<number>();
const skillId = ref<number>();
watch(
  () => typeId.value,
  () => {
    skillId.value = undefined;
  },
);
</script>

<style lang="less" scoped>
.question-view-container {
  @apply h-full w-full flex box-border overflow-hidden;
  border: var(--el-border);
  border-radius: var(--el-border-radius-base);
  font-size: var(--el-font-size-base);
  color: var(--el-text-color-regular);
}
</style>
