<template>
  <div class="device-login-wrapper">
    <div class="login-card">
      <div class="header-wrapper">
        <div class="title">设备登录</div>
      </div>
      <el-form
        :model="selectForm"
        ref="formRef"
        :rules="rules"
        class="content-wrapper"
      >
        <el-form-item prop="type">
          <el-select
            v-model="selectForm.type"
            placeholder="请选择设备"
            style="width: 100%"
            clearable
          >
            <el-option
              v-for="item in deviceList"
              :key="item.type"
              :label="item.label"
              :value="item.type"
            />
          </el-select>
        </el-form-item>

        <el-form-item
          prop="station"
          v-if="
            ['station_inner_display', 'station_outer_display'].includes(
              selectForm.type,
            )
          "
        >
          <el-select
            v-model="selectForm.station"
            placeholder="请选择考站"
            style="width: 100%"
            :loading="stationLoading"
            filterable
            clearable
          >
            <el-option
              v-for="item in stationList"
              :key="item.id"
              :label="item.roomName"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <div class="flex justify-center w-full">
            <el-button
              type="primary"
              @click="handleDeviceComfirm"
              class="w-full"
              :loading="loading"
            >
              确定
            </el-button>
          </div>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getStationListApi } from "@/api/osce/business/stations";
import type { StationListItemType } from "@/api/osce/business/stations";

import { useDeviceState } from "../deviceState";
import type { DeviceType } from "../deviceState";

const { deviceList, deviceLogin } = useDeviceState();
const stationList = ref<StationListItemType[]>([]);

onMounted(() => {
  getStationList();
});

const selectForm = ref<{ station: number | string; type: DeviceType }>({
  station: "",
  type: "",
});

/** 如果是候考设备，将考站置空 */
watch(
  () => selectForm.value.type,
  (newVal) => {
    if (newVal === "waiting_room_display") {
      selectForm.value.station = "";
    }
  },
);

const stationLoading = ref(false);
/** 获取考站列表 */
const getStationList = () => {
  return new Promise((resolve, reject) => {
    if (stationList.value.length > 0) return;
    stationLoading.value = true;
    getStationListApi({})
      .then((res) => {
        stationList.value = res.dataList;
        stationLoading.value = false;
        resolve(res);
      })
      .catch(() => {
        stationLoading.value = false;
        reject();
      });
  });
};

/** 设备登录 */
const formRef = ref();
const loading = ref(false);
const handleDeviceComfirm = () => {
  formRef.value
    .validate()
    .then(() => {
      let tempObj = JSON.parse(JSON.stringify(selectForm.value));
      tempObj.station = stationList.value.find((item) => {
        return item.id == tempObj.station;
      });

      deviceLogin(tempObj);
    })
    .catch(() => {});
};

/** 校验 */
const rules = {
  type: [{ required: true, message: "请选择设备", trigger: ["change"] }],
  station: [{ required: true, message: "请选择考站", trigger: ["change"] }],
};
</script>

<style scoped lang="less">
.device-login-wrapper {
  @apply h-full flex justify-center items-center;

  @apply bg-no-repeat bg-cover bg-origin-border bg-right;
  background-image: url(@/assets/img/osce/device/bg@2x.png);

  .login-card {
    @apply w-450px h-300px bg-white flex flex-col;

    border-radius: var(--el-border-radius-base);

    // 头部
    .header-wrapper {
      @apply h-60px flex justify-center font-bold flex-none;

      .title {
        @apply bg-no-repeat bg-cover bg-center w-340px flex justify-center items-center;
        background-image: url(@/assets/img/osce/login/login-bg-top.png);
        color: var(--el-text-color-regular);
      }
    }

    // 内容
    .content-wrapper {
      @apply p-45px flex flex-col justify-center flex-1;
    }
  }
}
</style>
