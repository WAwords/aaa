// mix 颜色混合函数
function mix(color1: string, color2: string, weight = 50) {
  const c1 = hexToRgb(color1);
  const c2 = hexToRgb(color2);

  // 确保weight在0-100之间
  weight = Math.min(100, Math.max(0, weight)) / 100;

  // 线性插值计算
  return rgbToHex({
    r: Math.round(c1.r * (1 - weight) + c2.r * weight),
    g: Math.round(c1.g * (1 - weight) + c2.g * weight),
    b: Math.round(c1.b * (1 - weight) + c2.b * weight),
  });
}

// 辅助函数：将十六进制颜色转换为RGB对象
function hexToRgb(hex: string) {
  hex = hex.replace("#", "");
  return {
    r: parseInt(hex.substring(0, 2), 16),
    g: parseInt(hex.substring(2, 4), 16),
    b: parseInt(hex.substring(4, 6), 16),
  };
}

// 辅助函数：将RGB对象转换为十六进制颜色
function rgbToHex(rgb: { r: number; g: number; b: number }) {
  const toHex = (n: number) => {
    const hex = Math.max(0, Math.min(255, Math.round(n))).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };
  return "#" + toHex(rgb.r) + toHex(rgb.g) + toHex(rgb.b);
}

/**
 * 颜色混合生成函数
 * @param baseColor 主题色
 * @param minColor 混合色
 * @param startNum 遍历生成颜色的开始值（值越高代表混合色的占比越高）
 * @param endNum 遍历生成颜色的结束值
 * @returns
 */
export function generateColors(
  baseColor: string,
  minColor: string = "#ffffff",
  startNum: number = 1,
  endNum: number = 9,
) {
  const colors = [];

  for (let i = startNum; i <= endNum; i++) {
    const weight = i * 10;
    const lightColor = mix(baseColor, minColor, weight);
    colors.push(lightColor);
  }

  return colors;
}
