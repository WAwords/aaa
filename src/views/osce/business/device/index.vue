<template>
  <component :is="activeComponent" @logout="logout"></component>
</template>

<script setup lang="ts">
import { useDeviceState } from "./deviceState";
import Inner from "./components/Inner/index.vue";
import Outer from "./components/Outer/index.vue";
import Login from "./components/Login.vue";
import Wait from "./components/Wait/index.vue";

defineOptions({
  name: "OsceBusinessDevice",
});

const { type: deviceType, deviceLogout } = useDeviceState();

const activeComponent = shallowRef<any>(null);
const comList = {
  "": Login,
  station_inner_display: Inner,
  station_outer_display: Outer,
  waiting_room_display: Wait,
} as { [key: string]: any };

watch(
  () => deviceType.value,
  (val) => {
    activeComponent.value = comList[val];
  },
  {
    immediate: true,
  },
);

/** 设备登出 */
const logout = () => {
  deviceLogout();
};
</script>

<style scoped lang="less"></style>
