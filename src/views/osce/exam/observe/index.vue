<template>
  <table class="table">
    <colgroup>
      <col width="50" />
      <col width="100" />
      <col width="100" />
      <col width="200" />
      <col width="50" />
      <col width="200" />
    </colgroup>
    <thead>
      <tr>
        <td>序号</td>
        <td>标准大项</td>
        <td>标准小项</td>
        <td>操作内容</td>
        <td>分值</td>
        <td>评分细则</td>
      </tr>
    </thead>
    <tr v-for="(item, index) in tableData">
      <td>
        <div class="flex justify-center items-center">{{ index + 1 }}</div>
      </td>
      <td
        :rowspan="asd(item, tableData, index, 'header1')"
        v-if="show(item, tableData, index, 'header1')"
        class="can-add"
      >
        <div>{{ item.header1 }}</div>
        <div
          class="add-item"
          @click="addItem(item, tableData, index, 'header1')"
        >
          +
        </div>
      </td>
      <td
        :rowspan="asd(item, tableData, index, 'header2')"
        v-if="show(item, tableData, index, 'header2')"
        class="can-add"
      >
        <div>{{ item.header2 }}</div>
        <div
          class="add-item"
          @click="addItem(item, tableData, index, 'header2')"
        >
          +
        </div>
      </td>
      <td>
        <div>{{ item.header3 }}</div>
      </td>
      <td>
        <div>{{ item.score }}</div>
      </td>
      <td>
        <div>{{ item.rule }}</div>
      </td>
    </tr>
    <!-- <tr>
      <td>Big Item0</td>
      <td>Big Item1</td>
      <td>Big Item2</td>
      <td>Big Item3</td>
      <td>Big Item4</td>
      <td>Big Item4</td>
    </tr> -->
  </table>
</template>
<script setup lang="ts">
let resData = [
  {
    content: "操作前准备",
    itemNumber: 1,
    children: [
      {
        content: "环境评估",
        itemNumber: 1,
        children: [
          {
            content: "操作内容",
            rule: "未评估不得分",
            score: "1",
          },
        ],
      },
    ],
  },
  {
    content: "其他的准备",
    itemNumber: 1,
    children: [
      {
        content: "其他评估",
        itemNumber: 1,
        children: [
          {
            content: "操作内容",
            rule: "未评估不得分",
            score: "1",
          },
          {
            content: "操作内容222",
            rule: "休想得分",
            score: "0",
          },
        ],
      },
      {
        content: "其他评估22222",
        itemNumber: 1,
        children: [
          {
            content: "操作内容",
            rule: "未评估不得分",
            score: "1",
          },
          {
            content: "操作内容222",
            rule: "休想得分",
            score: "0",
          },
        ],
      },
    ],
  },
];
let header = [
  {
    prop: "header1",
    label: "评分大项",
  },
  {
    prop: "header2",
    label: "评分小项",
  },
  {
    prop: "header3",
    label: "评分内容",
  },
];
const transfer = (arr: any[], level = 0) => {
  let temp = [] as any;
  arr.forEach((item) => {
    if (item.children && item.children.length > 0) {
      let _arr = transfer(item.children, level + 1);
      _arr.forEach((i) => {
        i[header[level].prop] = item.content;
        temp.push(i);
      });
    } else {
      let obj = {} as { [key: string]: any };
      obj[header[level].prop] = item.content;
      obj.rule = item.rule;
      obj.score = item.score;
      temp.push(obj);
    }
  });
  return temp;
};
let tableData = ref(transfer(resData));
console.log(tableData);
const asd = (item, data, index, key) => {
  if (index === 0) {
    let aaa = 1;
    for (let i = index + 1; i < data.length; i++) {
      if (data[i][key] === item[key]) {
        aaa += 1;
      } else {
        break;
      }
    }
    console.log(aaa);
    return aaa;
  } else {
    if (item[key] === data[index - 1][key]) {
      return 1;
    } else {
      let aaa = 1;
      for (let i = index + 1; i < data.length; i++) {
        if (data[i][key] === item[key]) {
          aaa += 1;
        } else {
          break;
        }
      }
      console.log(aaa);
      return aaa;
    }
  }
};
const show = (item, data, index, key) => {
  if (index === 0) {
    return true;
  } else {
    if (item[key] === data[index - 1][key]) {
      return false;
    }
    return true;
  }
};

const addItem = (item, data, index, key) => {
  let aaa = header.map((item) => {
    return item.prop;
  });
  let obj = {
    header3: "",
    rule: "",
    score: "",
    header2: "",
    header1: "",
  } as any;
  if (aaa.indexOf(key) === 0) {
    obj[key] = item[key];
    for (let i = index + 1; i < data.length; i++) {}
    data.splice(index + 1, 0, obj);
  } else if (aaa.indexOf(key) === 1) {
    // obj[key] = item[key];
    // obj[aaa[0]] = item[aaa[0]];
    // data.splice(index + 1, 0, obj);
  }
  // console.log(key);

  // obj[key] = item[key];
  // data.splice(index + 1, 0, obj);
};
</script>
<style lang="less" scoped>
.table {
  @apply bg-white border w-full;
  td {
    @apply border px-12px h-40px;
  }
}

.can-add {
  @apply relative;
  .add-item {
    @apply absolute bottom-0 h-20px w-20px bg-red-300 flex justify-center items-center;
    display: none;
  }
  &:hover .add-item {
    display: block;
  }
}
</style>
