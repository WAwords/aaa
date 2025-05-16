/**
 * 监听组件的显示与隐藏
 * @param showFun 显示时触发的方法
 */
export function visibilityListener(showFun: Function, hiddenFun?: Function) {
  const isPageVisible = ref(false);

  const handleVisibilityChange = () => {
    isPageVisible.value = !document.hidden;
    // 页面显示时触发
    if (isPageVisible.value) {
      showFun();
    }
    // 页面隐藏时触发
    else {
      hiddenFun && hiddenFun();
    }
  };

  onMounted(() => {
    document.addEventListener("visibilitychange", handleVisibilityChange);
  });

  onUnmounted(() => {
    document.removeEventListener("visibilitychange", handleVisibilityChange);
  });
}
