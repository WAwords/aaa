//自定义element-plus表单验证方法
//两位小数验证
export const decimalTwoV = (rule: any, value: any, callback: any) => {
  if (!value) {
    return callback(new Error("请输入"));
  }
  if (typeof parseFloat(value) !== "number" || isNaN(value)) {
    callback(new Error("请输入正确的数值"));
  } else {
    //如果value小数位数大于2位，则返回错误
    if (
      value.toString().split(".")[1] &&
      value.toString().split(".")[1].length > 2
    ) {
      return callback(new Error("最多只允许2位小数"));
    } else {
      callback();
    }
  }
};
//正负整数验证
export const integerV = (rule: any, value: any, callback: any) => {
  if (!value) {
    return callback(new Error("请输入"));
  }
  if (typeof parseInt(value) !== "number" || isNaN(value)) {
    callback(new Error("请输入正确的数值"));
  } else {
    if (value.toString().split(".")[1]) {
      return callback(new Error("请输入正负整数"));
    } else {
      callback();
    }
  }
};
