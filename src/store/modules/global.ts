const THEME_SETTING_KEY = "theme-setting";

/** 主题 */
const theme = ref(
  JSON.parse(localStorage.getItem(THEME_SETTING_KEY) ?? JSON.stringify({}))
    ?.theme || "main-theme",
);

/** 切换主题的监听，存储主题至本地 */
watchEffect(() => {
  document.documentElement.setAttribute("data-theme", theme.value);

  let themeSetting = localStorage.getItem(THEME_SETTING_KEY);

  if (themeSetting) {
    let themeSettingObj = JSON.parse(themeSetting) as ThemeSettingType;
    themeSettingObj!.theme = theme.value;
    localStorage.setItem(THEME_SETTING_KEY, JSON.stringify(themeSettingObj));
  } else {
    themeSetting = JSON.stringify({ theme: theme.value });
    localStorage.setItem(THEME_SETTING_KEY, themeSetting);
  }
});

/** 改变主题 */
const changeTheme = (data: string) => {
  theme.value = data;
};

/** 全局初始化 */
export const useGlobalInit = () => {
  return {
    theme,
    changeTheme,
  };
};

/** 主题设置的缓存类型 */
type ThemeSettingType = {
  theme: string;
};
