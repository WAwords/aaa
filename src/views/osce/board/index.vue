<template>
  <div class="flex flex-col h-full">
    <div class="board-container">
      <div
        class="view-item flex cursor-pointer"
        v-for="item in boardList"
        @click="handleRouterTo(item.path)"
      >
        <div class="img-container">
          <img :src="item.src" alt="" class="h-80px w-80px" />
        </div>
        <div class="msg-container">
          <div class="num-container">
            <span class="num">
              <NumberTrans :num="item.num" />
            </span>
            <span>
              {{ item.unit }}
            </span>
          </div>
          <div class="title">{{ item.title }}</div>
        </div>
      </div>
    </div>
    <div
      class="mt-20px bg-white flex justify-center py-20px flex-1 flex justify-center items-center"
    >
      <img src="@/assets/img/logo/cme-mix.png" alt="" class="w-4/10" />
    </div>
  </div>
</template>

<script setup lang="ts">
import examinerImg from "@/assets/img/osce/board/examiner.png";
import examineeImg from "@/assets/img/osce/board/examinee.png";
import skillImg from "@/assets/img/osce/board/skill.png";
import skillTypeImg from "@/assets/img/osce/board/skill-type.png";
import criteriaImg from "@/assets/img/osce/board/criteria.png";
import examImg from "@/assets/img/osce/board/exam.png";
import paperImg from "@/assets/img/osce/board/paper.png";
import stationImg from "@/assets/img/osce/board/station.png";
import { getOverviewsApi } from "@/api/osce/board/index";

onMounted(() => {
  fetchListData();
});

const fetchListData = () => {
  getOverviewsApi()
    .then((res) => {
      for (let item of boardList.value) {
        item.num = res[item.field];
      }
    })
    .catch(() => {});
};

const router = useRouter();
const handleRouterTo = (path: string) => {
  if (path) {
    router.push(path);
  }
};

const boardList = ref<any[]>([
  {
    src: examineeImg,
    title: "考生数据量",
    num: 0,
    unit: "人",
    field: "examineeCount",
    path: "/osce/personnel/examinee",
  },
  {
    src: examinerImg,
    title: "考官数据量",
    num: 0,
    unit: "人",
    field: "examinerCount",
    path: "/osce/personnel/examiner",
  },
  {
    src: skillTypeImg,
    title: "技能类型数据量",
    num: 0,
    unit: "种",
    field: "skillTypeCount",
    path: "/osce/question/question",
  },
  {
    src: skillImg,
    title: "技能数据量",
    num: 0,
    unit: "个",
    field: "skillCount",
    path: "/osce/question/question",
  },
  {
    src: criteriaImg,
    title: "评分标准数据量",
    num: 0,
    unit: "个",
    field: "criteriaCount",
    path: "/osce/question/question",
  },
  {
    src: examImg,
    title: "考试数据量",
    num: 0,
    unit: "场",
    field: "examinationCount",
    path: "/osce/exam/management",
  },
  {
    src: stationImg,
    title: "考站数据量",
    num: 0,
    unit: "个",
    field: "stationCount",
    path: "/osce/business/station",
  },
  {
    src: paperImg,
    title: "预计节省纸张（A4）",
    num: 0,
    unit: "张",
    field: "paperSavedCount",
  },

  // {
  //   src: criteriaImg,
  //   title: "考试考生数",
  //   num: 0,
  //   unit: "张",
  // field: "allExaminationExamineeCount",
  // },
  // {
  //   src: criteriaImg,
  //   title: "成绩数",
  //   num: 0,
  //   unit: "张",
  // field: "scoreCount",
  // },
]);
</script>

<style scoped lang="less">
.board-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  // grid-gap: 2px;
}

.view-item {
  @apply p-20px text-16px;
  &:hover {
    background-color: var(--el-fill-color-lighter);
  }

  .img-container {
  }

  .msg-container {
    @apply ml-30px flex-1 flex flex-col;
    color: #86909c;

    .num-container {
      .num {
        @apply font-bold text-36px;
        color: var(--el-color-primary);
        font-family: D-DIN-Bold;
      }

      > span:nth-child(2) {
        @apply ml-8px;
      }
    }

    .title {
      @apply mt-15px;
    }
  }
}
</style>
