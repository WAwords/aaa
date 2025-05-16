import { expect, test } from "vitest";
import { mount } from "@vue/test-utils";
import CriteriaDialog from "@/views/osce/question/question/components/CriteriaDialog.vue";
import source from "./data/CriteriaDialog";

test.each([
  source.successInput_1,
  source.successInput_2,
  source.successInput_3,
])(
  "分组分数检测--成功--常规 scoringItemsType:$scoringItemsType deductionItemsType:$deductionItemsType",
  async (input) => {
    const wrapper = mount(CriteriaDialog, {
      props: {
        dialogType: "create",
        criteriaId: 1,
        typeId: 1,
        skillId: 1,
      },
      global: {
        provide: {
          dialogVisible: false,
        },
      },
    });

    wrapper.vm.dialogForm = input;
    await expect(wrapper.vm.groupScoreValidate()).resolves.toBe(undefined);
  },
);

test("分组分数检测--错误--常规", async () => {
  const wrapper = mount(CriteriaDialog, {
    props: {
      dialogType: "create",
      criteriaId: 1,
      typeId: 1,
      skillId: 1,
    },
    global: {
      provide: {
        dialogVisible: false,
      },
    },
  });

  // type为 1 常规
  wrapper.vm.dialogForm = source.failInput_1;
  await expect(wrapper.vm.groupScoreValidate()).rejects.toEqual(
    source.failOutput_1,
  );
});
