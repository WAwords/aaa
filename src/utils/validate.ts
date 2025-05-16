/** =============== 长度校验 begin =============== */

/**
 * 校验提示优先级：
 * 1. 必填校验（blur触发、change内容至空触发）
 * 2. 长度校验（最短长度：只有在blur时触发，最大长度：会在change和blur时触发）
 * 3. 格式校验（只有blur触发）
 */

/**
 * 获取校验规则
 * @param options 校验参数
 * @returns 校验规则
 */
export function getFormItemRule(options: RuleParams): any;
/**
 * 获取校验规则
 * @param label 校验字段名
 * @param max 最大长度（默认0，-1代表不校验）
 * @param min 最小长度（默认20，-1代表不校验）
 * @param required 是否必填（默认false）
 * @returns 校验规则
 */
export function getFormItemRule(
  label: string,
  max?: number,
  min?: number,
  required?: boolean,
): any;

export function getFormItemRule(
  label: string | RuleParams,
  max = 20,
  min = -1,
  required = false,
) {
  // 检查是否传入了对象
  if (typeof label === "object") {
    ({ label, max = 20, min = -1, required = false } = label);
  }

  let resultRule = [];

  // 必填校验（这样写是为了把全输入空格当做没有输入）
  if (required) {
    resultRule.push({
      required: true,
      message: `请输入${label}`,
      trigger: ["change"],
    });

    resultRule.push({
      validator: (rule: any, value: any, callback: any) => {
        rule;
        value = `${value}`;
        if (!checkRequired(value)) {
          callback(new Error(`请输入${label}`));
        } else {
          callback();
        }
      },
      trigger: ["change", "blur"],
    });
  }

  // 最大长度校验
  if (max !== -1) {
    resultRule.push({
      validator: (rule: any, value: any, callback: any) => {
        rule;
        value = `${value}`;
        if (!checkMax(value, max)) {
          callback(new Error(`${label}的长度不能超过${max}个字符`));
        } else {
          callback();
        }
      },
      // 加上blur是为了阻止其后的格式校验报错
      trigger: ["change", "blur"],
    });
  }

  // 最小长度校验（最小长度错误要在失焦时触发）
  if (min !== -1) {
    resultRule.push({
      validator: (rule: any, value: any, callback: any) => {
        rule;
        value = `${value}`;
        if (!checkMin(value, min)) {
          callback(new Error(`${label}的长度不能少于${min}个字符`));
        } else {
          if (!checkMax(value, max)) {
            callback(new Error(`${label}的长度不能超过${max}个字符`));
          } else if (!checkRequired(value)) {
            callback(new Error(`请输入${label}`));
          } else {
            callback();
          }
        }
      },
      trigger: ["blur"],
    });
  }

  return resultRule;
}

/**
 * 校验最大长度
 * @param data 校验数据
 * @param num 最大长度
 * @returns true 校验通过
 * @returns false 校验不通过
 */
function checkMax(data: any, num: number) {
  return !(typeof data === "string" && data.trim().length > num);
}
/**
 * 校验最小长度
 * @param data 校验数据
 * @param num 最小长度
 * @returns true 校验通过
 * @returns false 校验不通过
 */
function checkMin(data: any, num: number) {
  return !(typeof data === "string" && data.trim().length < num);
}
/**
 * 校验必填
 * @param data 校验数据
 * @returns true 校验通过
 * @returns false 校验不通过
 */
function checkRequired(data: any) {
  return typeof data === "string" && data.trim().length > 0;
}

/** 规则传入的参数 */
type RuleParams = {
  label: string;
  max?: number;
  min?: number;
  required?: boolean;
};

/** =============== 长度校验 end =============== */

/** =============== 唯一识别码校验 begin =============== */

/**
 * 唯一识别号校验
 * @param source 源（表单编辑对象，如：dialogForm）
 * @param isWrapped 用户信息是否使用对象包裹
 * @param args
 * @returns
 */
export function checkIdNumber(source: any, isWrapped: boolean, ...args: any[]) {
  let editObj = isWrapped ? source.user : source;

  const func = (rule: any, value: any, callback: any) => {
    rule;
    if (editObj.idType === "1") {
      const reg =
        /^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/;
      if (reg.test(value)) {
        callback();
      } else {
        callback(new Error("请输入正确的身份证号码"));
      }
    } else if (editObj.idType === "9") {
      const reg = /^[0-9a-zA-Z_\-@.]*$/;
      if (reg.test(value)) {
        callback();
      } else {
        callback(
          new Error("请使用6至64位字母、数字、下划线、短横、艾特符及英文句点"),
        );
      }
    } else {
      callback();
    }
  };
  return func(args[0], args[1], args[2]);
}

/** =============== 唯一识别码校验 end =============== */
