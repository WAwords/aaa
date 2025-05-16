<template>
  <StationWrapper
    :station-list="stationList"
    @fullscreen="stationsFullDialogVisible = true"
    class="flex-none"
  />

  <div class="my-20px border-b flex-none"></div>

  <Score class="flex-1" />

  <el-dialog v-model="stationsFullDialogVisible" fullscreen title="考站详情">
    <div
      class="grid gap-20px"
      style="grid-template-columns: repeat(auto-fill, minmax(300px, 1fr))"
    >
      <StationItem v-for="i in stationList" :data="i" mode="unfixed" />
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { useBeginState } from "../../beginState";
import Score from "../Score.vue";
import StationWrapper from "../StationWrapper.vue";
import StationItem from "../StationItem.vue";

const { stationList, examInfo, WS } = useBeginState();

/** 全屏展示考站弹窗 */
const stationsFullDialogVisible = ref(false);

watch(
  () => WS.value.data,
  (val) => {
    if (!val) return;
    let resMsg = JSON.parse(val);

    // 不是非固定模式的话不执行之后的操作
    if (examInfo.value && examInfo.value.examination.mode !== "1") return;

    if (resMsg.type === "station_status") {
      // 更新考试状态（重连时）
      resMsg.data.forEach((item: any, index: number) => {
        let examinee = null;
        if (item.examinee) {
          examinee = examInfo.value.examinees.find(
            (i: any) => i.id === resMsg.data[index].examinee,
          );
        }
        stationList.value[index].examinee = examinee;
        stationList.value[index].status = item.status;
      });
    } else if (resMsg.type === "station_examinee_select") {
      // 考站选择考生
      let examinee = examInfo.value.examinees.find(
        (i: any) => i.id === resMsg.data.examinee,
      );
      let temp = stationList.value.find(
        (i: any) => i.stationId === resMsg.data.station,
      );
      if (!temp) return;
      temp.status = "2";
      temp.examinee = examinee;
    } else if (resMsg.type === "station_examination_begin") {
      // 考站开始考试
      let temp = stationList.value.find(
        (i: any) => i.stationId === resMsg.data.station,
      );
      if (!temp) return;
      temp.status = "3";
    } else if (resMsg.type === "station_scoring_status") {
      // 考站评分完成
      let temp = stationList.value.find(
        (i: any) => i.stationId === resMsg.data.station,
      );
      if (!temp) return;
      temp.status = "1";
    }
  },
  {
    immediate: true,
  },
);
</script>

<style scoped lang="less"></style>
