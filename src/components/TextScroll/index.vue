<template>
  <div class="scrolling-text-container" ref="container">
    <div
      class="scrolling-text"
      :class="{ scrolling: isScrolling }"
      ref="textRef"
    >
      <span>{{ content }}</span>
    </div>
    <!-- 这里主要用于当前文本是否超出的判断 -->
    <div class="inline-block absolute h-0 invisible" ref="absoluteText">
      <span>{{ content }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  content: {
    type: String,
    required: true,
  },
  align: {
    type: String,
    default: "center",
  },
});

const container = ref<any>(null);
const textRef = ref<any>(null);
const absoluteText = ref<any>(null);
const isScrolling = ref(false);

const checkOverflow = () => {
  nextTick(() => {
    let textEl = container.value.querySelector(".scrolling-text");
    // 每一次判断前将paddingLeft重置为0，避免上一次的padding影响判断
    textEl.style.paddingLeft = 0;
    if (container.value && textRef.value) {
      isScrolling.value =
        absoluteText.value?.offsetWidth > container.value?.offsetWidth;

      // 每次检查溢出都先清除上一次添加的元素
      var elementsToRemove = textRef.value.querySelectorAll(".added-el");
      elementsToRemove.forEach((item: any) => {
        textRef.value.removeChild(item);
      });

      if (isScrolling.value) {
        // 这里设置滚动完整个容器宽度的时间为5s
        let multiple =
          absoluteText.value.offsetWidth / container.value.offsetWidth;
        textEl.style.animationDuration = `${multiple * 5}s`;

        // 文字循环的优化（拼接另一段相同的文字，让动画更顺滑）
        const containerWidth = container.value.offsetWidth;
        textEl.style.paddingLeft = containerWidth / 2 + "px";
        const childEl = document.createElement("span");
        childEl.textContent = props.content;
        childEl.style.paddingLeft = containerWidth / 2 + "px";
        childEl.classList.add("added-el");
        textEl.appendChild(childEl);
      }
    }
  });
};

// 这里的监听是为了确保在父组件传递的content发生变化时，重新检查文本是否溢出
watch(
  () => props.content,
  () => {
    nextTick(checkOverflow);
  },
);

onMounted(() => {
  setAlign();
  checkOverflow();
  window.addEventListener("resize", checkOverflow);
});

const setAlign = () => {
  if (props.align !== "center") {
    container.value.style.display = "flex";
    container.value.style.justifyContent = props.align;
  }
};

onUnmounted(() => {
  window.removeEventListener("resize", checkOverflow);
});

watch(
  () => props.content,
  () => {
    nextTick(checkOverflow);
  },
);
</script>

<style scoped>
.scrolling-text-container {
  width: 100%;
  overflow: hidden;
  white-space: nowrap;
  position: relative;
}

.scrolling-text {
  display: inline-block;
  animation-duration: 5s;
}

@keyframes scroll {
  0% {
    transform: translate(0, 0);
  }
  100% {
    transform: translate(-50%, 0);
  }
}

.scrolling {
  animation-name: scroll;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
}
</style>
