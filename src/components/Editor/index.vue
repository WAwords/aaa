<template>
  <div class="edit-container">
    <div>
      <Toolbar
        :editor="editorRef"
        :defaultConfig="toolbarConfig"
        :mode="mode"
        class="toolbar"
      />
      <Editor
        :defaultConfig="editorConfig"
        :mode="mode"
        v-model="valueHtml"
        style="height: 300px; overflow-y: hidden"
        @onCreated="handleCreated"
        @onChange="handleChange"
        @onDestroyed="handleDestroyed"
        @onFocus="handleFocus"
        @onBlur="handleBlur"
        @customAlert="customAlert"
        @customPaste="customPaste"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
// @ts-nocheck
import "@wangeditor/editor/dist/css/style.css";
import { Editor, Toolbar } from "@wangeditor/editor-for-vue";
import { DomEditor } from "@wangeditor/editor";
const props = defineProps({
  editorContent: {
    type: String,
    default: "",
  },
  disable: {
    type: Boolean,
    default: false,
  },
  placeholder: {
    type: String,
    default: "请输入内容...",
  },
});
watch(
  () => props.editorContent,
  (newVal) => {
    if (newVal !== valueHtml.value) {
      valueHtml.value = newVal;
    }
  },
);

watch(
  () => props.disable,
  (newVal) => {
    if (newVal) {
      nextTick(() => {
        disable();
      });
    }
  },
  {
    immediate: true,
  },
);
// 编辑器实例，必须用 shallowRef，重要！
const editorRef = shallowRef();
const mode = ref("default");
// 内容 HTML
const valueHtml = ref("");

const emit = defineEmits(["update:editorContent"]);
watch(
  () => valueHtml.value,
  (newVal) => {
    emit("update:editorContent", newVal);
  },
);

const toolbarConfig = {
  toolbarKeys: [
    "headerSelect",
    "blockquote",
    "bold",
    "underline",
    "italic",
    "clearStyle",
    {
      key: "group-more-style",
      title: "更多",
      iconSvg:
        '<svg viewBox="0 0 1024 1024"><path d="M204.8 505.6m-76.8 0a76.8 76.8 0 1 0 153.6 0 76.8 76.8 0 1 0-153.6 0Z"></path><path d="M505.6 505.6m-76.8 0a76.8 76.8 0 1 0 153.6 0 76.8 76.8 0 1 0-153.6 0Z"></path><path d="M806.4 505.6m-76.8 0a76.8 76.8 0 1 0 153.6 0 76.8 76.8 0 1 0-153.6 0Z"></path></svg>',
      menuKeys: ["through", "code", "sup", "sub"],
    },
    "color",
    "bgColor",
    "|",
    "fontSize",
    "fontFamily",
    "lineHeight",
    "|",
    "bulletedList",
    "numberedList",
    "todo",
    {
      key: "group-justify",
      title: "对齐",
      iconSvg:
        '<svg viewBox="0 0 1024 1024"><path d="M768 793.6v102.4H51.2v-102.4h716.8z m204.8-230.4v102.4H51.2v-102.4h921.6z m-204.8-230.4v102.4H51.2v-102.4h716.8zM972.8 102.4v102.4H51.2V102.4h921.6z"></path></svg>',
      menuKeys: [
        "justifyLeft",
        "justifyRight",
        "justifyCenter",
        "justifyJustify",
      ],
    },
    {
      key: "group-indent",
      title: "缩进",
      iconSvg:
        '<svg viewBox="0 0 1024 1024"><path d="M0 64h1024v128H0z m384 192h640v128H384z m0 192h640v128H384z m0 192h640v128H384zM0 832h1024v128H0z m0-128V320l256 192z"></path></svg>',
      menuKeys: ["indent", "delIndent"],
    },
    "|",
    "emotion",
    "insertLink",
    {
      key: "group-image",
      title: "图片",
      iconSvg:
        '<svg viewBox="0 0 1024 1024"><path d="M959.877 128l0.123 0.123v767.775l-0.123 0.122H64.102l-0.122-0.122V128.123l0.122-0.123h895.775zM960 64H64C28.795 64 0 92.795 0 128v768c0 35.205 28.795 64 64 64h896c35.205 0 64-28.795 64-64V128c0-35.205-28.795-64-64-64zM832 288.01c0 53.023-42.988 96.01-96.01 96.01s-96.01-42.987-96.01-96.01S682.967 192 735.99 192 832 234.988 832 288.01zM896 832H128V704l224.01-384 256 320h64l224.01-192z"></path></svg>',
      menuKeys: ["insertImage", "uploadImage"],
    },
    {
      key: "group-video",
      title: "视频",
      iconSvg:
        '<svg viewBox="0 0 1024 1024"><path d="M981.184 160.096C837.568 139.456 678.848 128 512 128S186.432 139.456 42.816 160.096C15.296 267.808 0 386.848 0 512s15.264 244.16 42.816 351.904C186.464 884.544 345.152 896 512 896s325.568-11.456 469.184-32.096C1008.704 756.192 1024 637.152 1024 512s-15.264-244.16-42.816-351.904zM384 704V320l320 192-320 192z"></path></svg>',
      menuKeys: ["insertVideo", "uploadVideo"],
    },
    "insertTable",
    "codeBlock",
    "divider",
    "|",
    "undo",
    "redo",
    "|",
    "fullScreen",
  ],
  excludeKeys: [
    "group-image",
    "group-video",
    "blockquote",
    "code",
    "bulletedList",
    "numberedList",
    "todo",
    "emotion",
    "insertLink",
    "insertTable",
    "codeBlock",
  ],
  insertKeys: {
    index: 0,
    keys: [],
  },
  modalAppendToBody: false,
};
const editorConfig = { placeholder: props.placeholder };

// 组件销毁时，也及时销毁编辑器，重要！
onBeforeUnmount(() => {
  const editor = editorRef.value;
  if (editor == null) return;
  editor.destroy();
});

// 编辑器回调函数
const handleCreated = (editor) => {
  // console.log("created", editor);
  editorRef.value = editor; // 记录 editor 实例，重要！
};
const handleChange = (editor) => {
  // console.log("change:", editor.getHtml());
};
const handleDestroyed = (editor) => {
  // console.log("destroyed", editor);
};
const handleFocus = (editor) => {
  // console.log("focus", editor);
};
const handleBlur = (editor) => {
  // console.log("blur", editor);
};
const customAlert = (info, type) => {
  // alert(`【自定义提示】${type} - ${info}`);
};
const customPaste = (editor, event, callback) => {
  // console.log("ClipboardEvent 粘贴事件对象", event);
  // 自定义插入内容
  // editor.insertText("xxx");
  // 返回值（注意，vue 事件的返回值，不能用 return）
  // callback(false); // 返回 false ，阻止默认粘贴行为
  callback(true); // 返回 true ，继续默认的粘贴行为
};
// 插入内容
const insertText = () => {
  const editor = editorRef.value;
  if (editor == null) return;
  // editor.insertText("hello world");
};
// 打印editor的内容
const printHtml = () => {
  const editor = editorRef.value;
  if (editor == null) return;
  console.log(editor.getHtml());
};
// 让editor不可编辑
const disable = () => {
  const editor = editorRef.value;
  if (editor == null) return;
  editor.disable();
};
</script>

<style scoped lang="less">
// style="border: 1px solid #ccc"
.edit-container {
  @apply z-1 relative w-full overflow-hidden;
  border: var(--el-border);
  border-radius: var(--el-border-radius-base);
  .toolbar {
    border-bottom: var(--el-border-width) var(--el-border-style)
      var(--el-border-color);
    color: var(--el-border-color);
  }
}
</style>
