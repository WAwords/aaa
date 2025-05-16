import { getCurrentInstance, onMounted } from "vue";
import { useDebounceFn } from "@vueuse/core";
import { useUserStore } from "@/store/modules/user";

/**
 * 数组转树
 * @param arr
 * @param id
 * @param pid
 * @returns
 */
export function handleTree(arr: any[], id = "id", pid = "parentId") {
  const roots = [];
  const map = new Map();
  // 将数组中的对象转换为节点，并将节点保存到map中
  for (const item of arr) {
    map.set(item[id], item);
  }

  // 遍历数组中的每一个对象，将其添加到对应的父节点的子节点数组中
  for (const item of arr) {
    item.children = [];
    // 去集合中找对应的子节点
    const node = map.get(item[id]);
    if (item[pid]) {
      // 去集合中找对应的父节点
      const parent = map.get(item[pid]);
      // 如果父节点存在，把子节点放入到父节点的children数组中
      if (parent) parent.children.push(node);
      // 如果父节点有值，但是集合中不存在，如上述数据 parentId: 11 ，找不到对应id为11的，也设置为子节点
      if (!parent) roots.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
}

/**
 * 将树打平为数组（评分标准）
 * @param arr
 * @param level
 * @returns
 */
export function tableTransfer(arr: any[], level = 0) {
  let temp = [] as any;
  arr.forEach((item) => {
    if (item.children && item.children.length > 0) {
      let _arr = tableTransfer(item.children, level + 1);
      _arr.forEach((i: any) => {
        i[level + 1 + ""] = item.content;
        temp.push(i);
      });
    } else {
      let obj = {} as { [key: string]: any };
      obj[level + 1 + ""] = item.content;
      Object.keys(item).forEach((i) => {
        if (i !== "content") {
          obj[i] = item[i];
        }
      });
      // obj.rule = item.rule;
      // obj.score = item.score;
      temp.push(obj);
    }
  });
  return temp;
}

/**
 * 提取富文本中的文字
 * @param richString
 * @returns
 */
export function extractTextFromRichString(richString: string) {
  // 创建一个新的DOM元素
  const tempDiv = document.createElement("div");
  // 设置其innerHTML属性为富文本内容
  tempDiv.innerHTML = richString;

  // 用于存储提取出的文本
  let textContent = "";

  // 遍历所有文本节点
  function extractText(node: any) {
    if (node.nodeType === Node.TEXT_NODE) {
      textContent += node.textContent;
    } else {
      node = node.firstChild;
      while (node) {
        extractText(node);
        node = node.nextSibling;
      }
    }
  }
  // 从DOM元素中提取文本
  extractText(tempDiv);
  // 返回提取出的文本
  return textContent;
}

/**
 * 从元对象中复制目标对象中有的属性值至目标对象（编辑时常用）
 * @param target
 * @param source
 */
export function copyObjectValue(target: any, source: any) {
  Object.keys(target).forEach((key) => {
    if (typeof source[key] !== "object") {
      target[key] = source[key];
    } else {
      copyObjectValue(target[key], source[key]);
    }
  });
}

/**
 * 判断两个对象是否完全相同
 * @param obj1
 * @param obj2
 * @returns
 */
export function deepEqual(obj1: any, obj2: any) {
  // 判断两个对象是否是相同的引用
  if (obj1 === obj2) {
    return true;
  }

  // 判断两个对象是否是对象类型
  if (
    typeof obj1 !== "object" ||
    obj1 === null ||
    typeof obj2 !== "object" ||
    obj2 === null
  ) {
    return false;
  }

  // 判断两个对象的属性数量是否相等
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  if (keys1.length !== keys2.length) {
    return false;
  }

  // 递归遍历两个对象的属性
  for (let key of keys1) {
    if (!keys2.includes(key) || !deepEqual(obj1[key], obj2[key])) {
      return false;
    }
  }

  return true;
}

/**
 * 获取元素高度
 * @param val 类选择器
 */
export function getElementHeight(val: string) {
  let elements = document.querySelectorAll(val);
  let height = 0;
  for (let i = 0; i < elements.length; i++) {
    height += elements[i].clientHeight;
    height += parseInt(
      getComputedStyle(elements[i]).getPropertyValue("margin-top"),
    );
    height += parseInt(
      getComputedStyle(elements[i]).getPropertyValue("margin-bottom"),
    );
  }
  return height;
}

/**
 * 设置表格高度
 * @param val 表格滚动高度
 * @param container 容器id
 * @param selector 与表格滚动相关的元素类名，这类类名（除了concern-table以外）最好保证唯一性：一种类名只用于一个表格的高度相关元素
 */
export function setTableHeight(
  val: any,
  container: string = "main-layout-id",
  selector: string = ".concern-table",
) {
  // 获取当前组件实例
  const instance = getCurrentInstance();
  // 如果存在当前组件实例
  if (instance) {
    onMounted(() => {
      setHeight();
      window.addEventListener("resize", setHeight);
    });
    onBeforeUnmount(() => {
      window.removeEventListener("resize", setHeight);
    });

    const setHeightHandler = () => {
      let mainLayoutElement = document.getElementById(container)!;
      let mainLayoutPaddingHeight =
        parseInt(
          getComputedStyle(mainLayoutElement).getPropertyValue("padding-top"),
        ) +
        parseInt(
          getComputedStyle(mainLayoutElement).getPropertyValue(
            "padding-bottom",
          ),
        );
      val.value =
        mainLayoutElement.clientHeight -
        mainLayoutPaddingHeight -
        getElementHeight(selector);
    };
    const setHeight = useDebounceFn(setHeightHandler, 0);
  }
}

/**
 * 获取多余高度
 * @param container 容器id
 * @param selector 与表格滚动相关的元素类名，这类类名（除了concern-table以外）最好保证唯一性：一种类名只用于一个表格的高度相关元素
 */
export function getFreeHeight(
  container: string = "main-layout-id",
  selector: string = ".concern-table",
) {
  // 获取当前组件实例
  const instance = getCurrentInstance();
  // 如果存在当前组件实例
  if (instance) {
    onMounted(() => {
      setHeight();
      window.addEventListener("resize", setHeight);
    });
    onBeforeUnmount(() => {
      window.removeEventListener("resize", setHeight);
    });

    const setHeightHandler = () => {
      let mainLayoutElement = document.getElementById(container)!;
      let mainLayoutPaddingHeight =
        parseInt(
          getComputedStyle(mainLayoutElement).getPropertyValue("padding-top"),
        ) +
        parseInt(
          getComputedStyle(mainLayoutElement).getPropertyValue(
            "padding-bottom",
          ),
        );
      return (
        mainLayoutElement.clientHeight -
        mainLayoutPaddingHeight -
        getElementHeight(selector)
      );
    };
    const setHeight = useDebounceFn(setHeightHandler, 0);
  }
}

/**
 * 唯一识别号脱敏
 * @param idNumber 唯一识别号
 * @returns
 */
export function idNumberDesensitization(idNumber: string, idType: string) {
  if (idType == "1") {
    // 是身份证号
    return idNumber.replace(/(\d{2})\d{12}([\dxX]{4})/, "$1************$2");
  } else if (idType == "9") {
    return idNumber;
  }
}

/**
 * 手机号码脱敏
 * @param phoneNumber 手机号码
 * @returns
 */
export function phoneNumberDesensitization(phoneNumber: string) {
  if (/^1[3456789]\d{9}$/.test(phoneNumber)) {
    return phoneNumber.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2");
  } else {
    return phoneNumber;
  }
}

/**
 * 邮箱脱敏
 * @param emailAddress 邮箱
 * @returns
 */
export function emailAddressDesensitization(emailAddress: string) {
  if (/^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/.test(emailAddress)) {
    return emailAddress.replace(
      /^(.{1}).+(.@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+)$/,
      "$1****$2",
    );
  } else {
    return emailAddress;
  }
}

/**
 * 判断当前是否有权限
 * @param value 权限字符数组
 * @param reverse 是否反转返回值
 * @returns
 */
export function havePermi(value: string[], reverse = false) {
  // 最高权限角色列表
  let top_roles = ["system_maintainer"];
  const userStore = useUserStore();
  let permissions: string[] = userStore.permissions;

  // 当前用户角色
  let now_roles = userStore.roles.map((item: any) => item.code);

  if (value && value instanceof Array && value.length > 0) {
    const permissionFlag = value;

    const hasPermissions = permissions.some((permission: string) => {
      return (
        now_roles.some((item) => top_roles.includes(item)) ||
        permissionFlag.includes(permission)
      );
    });

    if (reverse) {
      return !hasPermissions;
    } else {
      return hasPermissions;
    }
  } else {
    return false;
  }
}

/**
 * 获取当前天的初始时间
 * @returns 初始时间的date
 */
export function getTodayStartDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const day = now.getDate();
  return new Date(year, month, day, 0, 0, 0);
}

/**
 * 延时自动隐藏鼠标指针
 * @param timeout 隐藏前的延时时间
 * @returns startAutoHideMouse 开启鼠标自动隐藏
 * @returns stopAutoHideMouse 关闭鼠标自动隐藏
 */
export function useAutoHideMouse(timeout = 3000) {
  const isMouseVisible = ref(true);
  let timer = null as any;

  /** 设置鼠标会自动隐藏 */
  const changeMouse = () => {
    isMouseVisible.value = true;
    document.body.style.cursor = "auto";
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      isMouseVisible.value = false;
      document.body.style.cursor = "none";
    }, timeout);
  };

  /** 停止鼠标自动隐藏 */
  const stopAutoHideMouse = () => {
    document.removeEventListener("mousemove", changeMouse);
    if (timer) clearTimeout(timer);
    isMouseVisible.value = true;
    document.body.style.cursor = "auto";
  };

  // 开始鼠标自动隐藏
  const startAutoHideMouse = () => {
    document.addEventListener("mousemove", changeMouse);
  };

  // 清空
  onUnmounted(() => {
    document.removeEventListener("mousemove", changeMouse);
    if (timer) clearTimeout(timer);
  });

  return {
    startAutoHideMouse,
    stopAutoHideMouse,
  };
}

/**
 * 按照指定精度进行加法运算
 * @param num1 数字1
 * @param num2 数字2
 * @param precision 精度（10代表一位小数，100代表两位小数，以此类推）
 * @returns 相加后的数字
 */
export function preciseAdd(num1: number, num2: number, precision: number) {
  return Math.round(num1 * precision + Number(num2) * precision) / precision;
}

/**
 * 树型转换
 * @param arr 树形数据
 * @returns 平铺数据
 */
export function treeToList(arr: any[], level = 0) {
  if (arr.length === 0) return [];

  let temp = [] as any;
  arr.forEach((item) => {
    if (item.children && item.children.length > 0) {
      // 如果有children则不是最里层
      let _arr = treeToList(item.children, level + 1);
      // 将最里层数据封装到对象level_${level}中
      _arr.forEach((i: any) => {
        i[`level_${level}`] = {};
        Object.keys(item).forEach((x) => {
          if (x !== "children") {
            i[`level_${level}`][x] = item[x];
          }
        });
        temp.push(i);
      });
    } else {
      // 最里层
      let obj = {} as { [key: string]: any };
      obj[`level_${level}`] = {};
      // 将最里层数据封装到对象level_${level}中
      Object.keys(item).forEach((i) => {
        obj[`level_${level}`][i] = item[i];
      });
      temp.push(obj);
    }
  });
  return temp;
}

/**
 * 四舍五入
 * @param number 需要转换的数字
 * @param precision 小数位数
 * @returns
 */
export function numberRound(number: number, precision = 2) {
  return (
    Math.round(Math.round(+number * Math.pow(10, precision + 2)) / 100) /
    Math.pow(10, precision)
  );
}

/**
 * 属性为level_x的对象，获取最大的level_x（主要用于属性转换后的数据）
 * @param obj 行数据
 * @returns
 */
export function getRowMaxLevelProp(obj: any) {
  let levelPropList = Object.keys(obj).sort((a, b) => {
    return Number(a.match(/_(.*)/)![1]) - Number(b.match(/_(.*)/)![1]);
  });
  return levelPropList[levelPropList.length - 1];
}

/**
 * 根据类型进行特殊变化（type为0和为1返回的数据结构时一样的，但是表格展示不同，前端需要将其变为不一样）
 * @param {any[]} list 评分项列表（或扣分项列表）
 * @param {number} type 类型（可能为null）
 */
export function transListForType(list: any[], type: any) {
  if (list.length === 0) return [];

  if (typeof type !== "string" || type === "") return list;
  if (type === "0") {
    list = list.map((item) => {
      item.level_0 = item.level_1;
      delete item.level_1;

      return item;
    });
  }

  return list;
}

/** 滚动到form表单的第一个错误 */
export function goFirstError() {
  // 加一个延时，否则el-form-item__error可能还没被添加到dom中
  setTimeout(() => {
    let isError = document.getElementsByClassName("el-form-item__error");
    isError[0].scrollIntoView({
      // 滚动到指定节点
      // 值有start,center,end，nearest，当前显示在视图区域中间
      block: "center",
      // 值有auto,smooth，缓动动画（当前是慢速的）
      behavior: "smooth",
    });
  }, 100);
}
