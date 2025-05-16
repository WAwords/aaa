import { expect, test } from "vitest";
import { mount } from "@vue/test-utils";
import Score from "@/views/osce/exam/begin/components/Score.vue";
import { sortData_1, sortData_2, sortData_3, sortData_4 } from "./data/Score";

test.each([sortData_1, sortData_2, sortData_3, sortData_4])(
  "开始考试-自动获取成绩-排序",
  (data, expected) => {
    const wrapper = mount(Score);

    let res = wrapper.vm.sortScoreList(data);
    expect(JSON.stringify(res)).toBe(JSON.stringify(expected));
  },
);
