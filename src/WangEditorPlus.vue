<template>
  <div
    ref="editorRootRef"
    class="wang-editor-plus"
    :class="{ 'wang-editor-plus--scroll': scroll }"
    :style="rootStyle"
  >
    <div
      v-if="noticeState.visible"
      class="wang-editor-plus__notice"
      :class="`wang-editor-plus__notice--${noticeState.type}`"
      role="status"
    >
      {{ noticeState.text }}
    </div>

    <div
      v-if="uploadProgressState.processing"
      class="wang-editor-plus__upload-progress"
      role="status"
    >
      <div class="upload-progress-main">
        <span class="upload-spinner"></span>
        <span>{{ uploadProgressState.label }}</span>
      </div>
      <div class="upload-progress-meta">
        {{ uploadProgressState.done }}/{{ uploadProgressState.total }}
      </div>
      <div class="upload-progress-track">
        <div
          class="upload-progress-bar"
          :style="{ width: `${uploadProgressPercent}%` }"
        ></div>
      </div>
    </div>

    <Toolbar
      class="wang-editor-plus__toolbar"
      :default-config="toolbarConfig"
      :editor="editorRef"
      :mode="mode"
      @mouseover="handleToolbarMouseover"
    />

    <Editor
      v-show="!sourceMode"
      v-model="html"
      class="wang-editor-plus__content"
      :default-config="editorConfig"
      :mode="mode"
      :style="editorStyle"
      @on-created="handleCreated"
    />

    <div
      v-show="sourceMode"
      class="wang-editor-plus__source"
      :style="editorStyle"
    >
      <div ref="sourceEditorRef" class="wang-editor-plus__source-editor"></div>
      <footer class="source-footer">
        <button class="source-button" type="button" @click="exitSourceMode">
          退出源码
        </button>
        <button
          class="source-button source-button--primary"
          type="button"
          @click="applySourceCode"
        >
          应用源码
        </button>
      </footer>
    </div>

    <Teleport to="body">
      <section
        v-if="typesetPanelVisible"
        aria-labelledby="typeset-title"
        class="wang-editor-plus-typeset-panel"
        role="dialog"
        :style="typesetPanelStyle"
      >
        <header class="panel-header">
          <span id="typeset-title">魔术棒</span>
          <button
            aria-label="关闭"
            class="panel-close"
            type="button"
            @click="hideTypesetPanel"
          >
            ×
          </button>
        </header>

        <div class="typeset-body">
          <div class="typeset-grid">
            <label>
              <input v-model="typesetOptions.mergeEmptyline" type="checkbox" />
              <span>合并空行</span>
            </label>
            <label>
              <input v-model="typesetOptions.removeEmptyline" type="checkbox" />
              <span>删除空行</span>
            </label>
            <label>
              <input v-model="typesetOptions.removeClass" type="checkbox" />
              <span>去除 class</span>
            </label>
            <label>
              <input
                v-model="typesetOptions.clearInlineFormat"
                type="checkbox"
              />
              <span>清除格式</span>
            </label>
            <label>
              <input v-model="typesetOptions.clearFontSize" type="checkbox" />
              <span>清理字号</span>
            </label>
            <label>
              <input v-model="typesetOptions.clearFontFamily" type="checkbox" />
              <span>清理字体</span>
            </label>
            <label>
              <input v-model="typesetOptions.removeEmptyNode" type="checkbox" />
              <span>清除冗余HTML</span>
            </label>
            <label>
              <input v-model="typesetOptions.hideTableBorder" type="checkbox" />
              <span>隐藏表格边框</span>
            </label>
            <label>
              <input v-model="typesetOptions.pasteFilter" type="checkbox" />
              <span>粘贴过滤</span>
            </label>
          </div>

          <div class="typeset-option">
            <div class="typeset-label">段落缩进</div>
            <label>
              <input v-model="typesetOptions.indent" type="checkbox" />
              <span>首行缩进</span>
            </label>
            <input
              v-model="typesetOptions.indentValue"
              class="panel-text"
              :disabled="!typesetOptions.indent"
              placeholder="例如 2"
            />
          </div>

          <div class="typeset-option">
            <div class="typeset-label">段落对齐</div>
            <label>
              <input v-model="textAlignEnabled" type="checkbox" />
              <span>启用</span>
            </label>
            <label>
              <input
                v-model="textAlignValue"
                :disabled="!textAlignEnabled"
                type="radio"
                value="left"
              />
              <span>左对齐</span>
            </label>
            <label>
              <input
                v-model="textAlignValue"
                :disabled="!textAlignEnabled"
                type="radio"
                value="center"
              />
              <span>居中</span>
            </label>
            <label>
              <input
                v-model="textAlignValue"
                :disabled="!textAlignEnabled"
                type="radio"
                value="right"
              />
              <span>右对齐</span>
            </label>
          </div>

          <div class="typeset-option">
            <div class="typeset-label">图片对齐</div>
            <label>
              <input v-model="imageBlockLineEnabled" type="checkbox" />
              <span>启用</span>
            </label>
            <label>
              <input
                v-model="imageBlockLineValue"
                :disabled="!imageBlockLineEnabled"
                type="radio"
                value="none"
              />
              <span>默认</span>
            </label>
            <label>
              <input
                v-model="imageBlockLineValue"
                :disabled="!imageBlockLineEnabled"
                type="radio"
                value="left"
              />
              <span>左浮动</span>
            </label>
            <label>
              <input
                v-model="imageBlockLineValue"
                :disabled="!imageBlockLineEnabled"
                type="radio"
                value="center"
              />
              <span>居中</span>
            </label>
            <label>
              <input
                v-model="imageBlockLineValue"
                :disabled="!imageBlockLineEnabled"
                type="radio"
                value="right"
              />
              <span>右浮动</span>
            </label>
          </div>

          <div class="typeset-option">
            <div class="typeset-label">符号转换</div>
            <label>
              <input v-model="symbolConvertEnabled" type="checkbox" />
              <span>启用</span>
            </label>
            <label>
              <input
                v-model="symbolConvertValue"
                :disabled="!symbolConvertEnabled"
                type="radio"
                value="bdc2sb"
              />
              <span>全角转半角</span>
            </label>
            <label>
              <input
                v-model="symbolConvertValue"
                :disabled="!symbolConvertEnabled"
                type="radio"
                value="tobdc"
              />
              <span>半角转全角</span>
            </label>
          </div>
        </div>

        <footer class="panel-footer">
          <button
            class="panel-button"
            type="button"
            @click="resetTypesetOptions"
          >
            恢复默认
          </button>
          <button class="panel-button" type="button" @click="hideTypesetPanel">
            取消
          </button>
          <button
            class="panel-button panel-button--primary"
            type="button"
            @click="applyTypesetOptions"
          >
            执行排版
          </button>
        </footer>
      </section>

      <section
        v-if="imageEditPanelVisible"
        aria-labelledby="image-edit-title"
        class="wang-editor-plus-image-edit-panel"
        role="dialog"
        :style="imageEditPanelStyle"
      >
        <form @submit.prevent="applyImageEdit">
          <header class="panel-header">
            <span id="image-edit-title">编辑图片</span>
            <button
              aria-label="关闭"
              class="panel-close"
              type="button"
              @click="hideImageEditPanel"
            >
              ×
            </button>
          </header>

          <div class="image-edit-body">
            <label class="image-edit-field image-edit-field--wide">
              <span>地址</span>
              <input
                v-model="imageEditForm.src"
                class="panel-text"
                placeholder="图片地址"
              />
            </label>
            <label class="image-edit-field">
              <span>描述</span>
              <input
                v-model="imageEditForm.alt"
                class="panel-text"
                placeholder="alt 文本"
              />
            </label>
            <label class="image-edit-field">
              <span>链接</span>
              <input
                v-model="imageEditForm.href"
                class="panel-text"
                placeholder="点击跳转地址"
              />
            </label>
            <label class="image-edit-field">
              <span>宽度</span>
              <input
                v-model="imageEditForm.width"
                class="panel-text"
                placeholder="例如 320px 或 50%"
              />
            </label>
            <label class="image-edit-field">
              <span>高度</span>
              <input
                v-model="imageEditForm.height"
                class="panel-text"
                placeholder="例如 180px 或 auto"
              />
            </label>
            <div v-if="imageEditError" class="image-edit-error">
              {{ imageEditError }}
            </div>
          </div>

          <footer class="panel-footer">
            <button
              class="panel-button"
              type="button"
              @click="clearImageDimensions"
            >
              清空尺寸
            </button>
            <button
              class="panel-button"
              type="button"
              @click="hideImageEditPanel"
            >
              取消
            </button>
            <button class="panel-button panel-button--primary" type="submit">
              确定
            </button>
          </footer>
        </form>
      </section>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import type { IDomEditor } from "@wangeditor/editor";
import type { UploadKind, UploadResult } from "./types";
import { Boot, DomEditor, SlateTransforms } from "@wangeditor/editor";
import { Editor, Toolbar } from "@wangeditor/editor-for-vue";
import CodeMirror from "codemirror";
import "codemirror/addon/display/autorefresh";
import "codemirror/lib/codemirror.css";
import "codemirror/mode/css/css";
import "codemirror/mode/htmlmixed/htmlmixed";
import "codemirror/mode/javascript/javascript";
import "codemirror/mode/xml/xml";
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
  shallowRef,
} from "vue";

interface Props {
  modelValue?: string;
  value?: string;
  placeholder?: string;
  height?: string;
  mode?: "default" | "simple";
  uploadPath?: string;
  imageUploadPath?: string;
  videoUploadPath?: string;
  fileUploadPath?: string;
  excludeKeys?: string[];
  scroll?: boolean;
  contentBleedX?: string;
  upload?: (
    file: File,
    context: { kind: UploadKind; path: string },
  ) => Promise<UploadResult>;
  resolveUploadUrl?: (path: string) => string;
}

type TextAlignValue = false | "left" | "center" | "right";
type ImageBlockLineValue = false | "none" | "left" | "center" | "right";
type SymbolConvertValue = false | "bdc2sb" | "tobdc";

interface TypesetOptions {
  mergeEmptyline: boolean;
  removeClass: boolean;
  removeEmptyline: boolean;
  textAlign: TextAlignValue;
  imageBlockLine: ImageBlockLineValue;
  clearFontSize: boolean;
  clearFontFamily: boolean;
  clearInlineFormat: boolean;
  removeEmptyNode: boolean;
  pasteFilter: boolean;
  indent: boolean;
  indentValue: string;
  bdc2sb: boolean;
  tobdc: boolean;
  hideTableBorder: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: undefined,
  value: undefined,
  placeholder: "请输入内容...",
  height: "auto",
  mode: "default",
  uploadPath: "uploads",
  imageUploadPath: undefined,
  videoUploadPath: undefined,
  fileUploadPath: undefined,
  excludeKeys: () => [],
  scroll: false,
  contentBleedX: "0px",
  upload: undefined,
  resolveUploadUrl: undefined,
});

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
  (e: "update:value", value: string): void;
  (e: "change", value: string): void;
}>();

const TYPESET_EVENT = "vue-wangeditor-plus:typeset";
const IMAGE_EDIT_EVENT = "vue-wangeditor-plus:image-edit";
const SOURCE_EVENT = "vue-wangeditor-plus:source";
const ATTACHMENT_UPLOAD_EVENT = "vue-wangeditor-plus:upload-attachment";
const IDEOGRAPHIC_SPACE = "\u3000";
const IMAGE_EDIT_PANEL_WIDTH = 420;
const IMAGE_EDIT_PANEL_HEIGHT = 260;
const TYPESET_TRIGGER_SELECTOR = [
  "[data-wangeditor-plus-typeset-trigger]",
  '[data-menu-key="typeset"]',
  '[data-tooltip="一键排版"]',
  '[data-tooltip="魔术棒"]',
  '[title="一键排版"]',
  '[title="魔术棒"]',
  '[aria-label="一键排版"]',
  '[aria-label="魔术棒"]',
].join(",");

const MAGIC_WAND_ICON = `
  <svg data-wangeditor-plus-typeset-trigger="1" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="m15 4 5 5" />
    <path d="m14 5 5 5" />
    <path d="M4 20 19 5" />
    <path d="M5 4v4" />
    <path d="M3 6h4" />
    <path d="M19 16v4" />
    <path d="M17 18h4" />
  </svg>
`;
const IMAGE_EDIT_ICON = `
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
  </svg>
`;
const SOURCE_ICON = `
  <svg data-wangeditor-plus-source-trigger="1" viewBox="0 0 34 16" width="34" height="16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="0.75" y="1.75" width="32.5" height="12.5" rx="2" stroke="currentColor" stroke-width="1.5" />
    <text x="17" y="11.2" fill="currentColor" font-family="Arial, sans-serif" font-size="8.5" font-weight="700" text-anchor="middle">HTML</text>
  </svg>
`;
const MORE_STYLE_ICON = `
  <svg viewBox="0 0 1024 1024">
    <path d="M204.8 505.6m-76.8 0a76.8 76.8 0 1 0 153.6 0 76.8 76.8 0 1 0-153.6 0Z"></path>
    <path d="M505.6 505.6m-76.8 0a76.8 76.8 0 1 0 153.6 0 76.8 76.8 0 1 0-153.6 0Z"></path>
    <path d="M806.4 505.6m-76.8 0a76.8 76.8 0 1 0 153.6 0 76.8 76.8 0 1 0-153.6 0Z"></path>
  </svg>
`;
const JUSTIFY_ICON = `
  <svg viewBox="0 0 1024 1024">
    <path d="M768 793.6v102.4H51.2v-102.4h716.8z m204.8-230.4v102.4H51.2v-102.4h921.6z m-204.8-230.4v102.4H51.2v-102.4h716.8zM972.8 102.4v102.4H51.2V102.4h921.6z"></path>
  </svg>
`;
const INDENT_ICON = `
  <svg viewBox="0 0 1024 1024">
    <path d="M0 64h1024v128H0z m384 192h640v128H384z m0 192h640v128H384z m0 192h640v128H384zM0 832h1024v128H0z m0-128V320l256 192z"></path>
  </svg>
`;
const IMAGE_GROUP_ICON = `
  <svg viewBox="0 0 1024 1024">
    <path d="M959.877 128l0.123 0.123v767.775l-0.123 0.122H64.102l-0.122-0.122V128.123l0.122-0.123h895.775zM960 64H64C28.795 64 0 92.795 0 128v768c0 35.205 28.795 64 64 64h896c35.205 0 64-28.795 64-64V128c0-35.205-28.795-64-64-64zM832 288.01c0 53.023-42.988 96.01-96.01 96.01s-96.01-42.987-96.01-96.01S682.967 192 735.99 192 832 234.988 832 288.01zM896 832H128V704l224.01-384 256 320h64l224.01-192z"></path>
  </svg>
`;
const VIDEO_GROUP_ICON = `
  <svg viewBox="0 0 1024 1024">
    <path d="M981.184 160.096C837.568 139.456 678.848 128 512 128S186.432 139.456 42.816 160.096C15.296 267.808 0 386.848 0 512s15.264 244.16 42.816 351.904C186.464 884.544 345.152 896 512 896s325.568-11.456 469.184-32.096C1008.704 756.192 1024 637.152 1024 512s-15.264-244.16-42.816-351.904zM384 704V320l320 192-320 192z"></path>
  </svg>
`;
const ATTACHMENT_ICON = `
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
  </svg>
`;
const TOOLBAR_KEYS = [
  "sourceCode",
  "|",
  "headerSelect",
  "blockquote",
  "|",
  "bold",
  "underline",
  "italic",
  {
    key: "group-more-style",
    title: "更多",
    iconSvg: MORE_STYLE_ICON,
    menuKeys: ["through", "code", "sup", "sub", "clearStyle"],
  },
  "color",
  "typeset",
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
    iconSvg: JUSTIFY_ICON,
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
    iconSvg: INDENT_ICON,
    menuKeys: ["indent", "delIndent"],
  },
  "|",
  "emotion",
  "insertLink",
  {
    key: "group-image",
    title: "图片",
    iconSvg: IMAGE_GROUP_ICON,
    menuKeys: ["insertImage", "uploadImage"],
  },
  {
    key: "group-video",
    title: "视频",
    iconSvg: VIDEO_GROUP_ICON,
    menuKeys: ["insertVideo", "uploadVideo"],
  },
  "uploadAttachment",
  "insertTable",
  "codeBlock",
  "divider",
  "|",
  "undo",
  "redo",
  "|",
  "fullScreen",
];

registerCustomMenus();

const editorRootRef = ref<HTMLElement>();
const editorRef = shallowRef<IDomEditor>();
const sourceEditorRef = ref<HTMLElement>();
const sourceMode = ref(false);
const sourceCode = ref("");
const uploadProgressState = reactive({
  processing: false,
  label: "上传中",
  done: 0,
  total: 0,
});
const noticeState = reactive({
  visible: false,
  text: "",
  type: "info" as "info" | "success" | "warning" | "danger",
});
const typesetPanelVisible = ref(false);
const typesetPanelStyle = reactive({
  top: "0px",
  left: "0px",
});
const imageEditPanelVisible = ref(false);
const imageEditPanelStyle = reactive({
  top: "0px",
  left: "0px",
});
const imageEditForm = reactive({
  src: "",
  alt: "",
  href: "",
  width: "",
  height: "",
});
const imageEditError = ref("");
const typesetOptions = reactive<TypesetOptions>(defaultTypesetOptions());
let typesetButtonElement: HTMLElement | null = null;
let imageEditTargetPath: number[] | null = null;
let noticeTimer: number | undefined;
let sourceCodeEditor: CodeMirror.Editor | null = null;
const lastImageEditTargetPath = new WeakMap<IDomEditor, number[]>();

const uploadProgressPercent = computed(() => {
  if (!uploadProgressState.total) return 0;
  return Math.max(
    8,
    Math.min(
      100,
      Math.round((uploadProgressState.done / uploadProgressState.total) * 100),
    ),
  );
});
const rootStyle = computed(() => ({
  "--wang-editor-plus-content-bleed-x": props.contentBleedX,
}));
const editorStyle = computed(() =>
  props.scroll
    ? { height: props.height }
    : { minHeight: props.height === "auto" ? "720px" : props.height },
);
const html = computed({
  get: () => props.modelValue ?? props.value ?? "",
  set: (value: string) => emitValue(value),
});
const toolbarConfig = computed(() => ({
  toolbarKeys: TOOLBAR_KEYS,
  excludeKeys: props.excludeKeys,
}));
const editorConfig = computed(() => ({
  placeholder: props.placeholder,
  scroll: props.scroll,
  hoverbarKeys: {
    image: {
      menuKeys: [
        "customEditImage",
        "imageWidth30",
        "imageWidth50",
        "imageWidth100",
        "viewImageLink",
        "deleteImage",
      ],
    },
  },
  customPaste: (editor: IDomEditor, event: ClipboardEvent) => {
    const pastedHTML = event.clipboardData?.getData("text/html") || "";
    const imageFiles = imageFilesFromClipboard(event);
    if (imageFiles.length) {
      event.preventDefault();
      uploadClipboardFiles(editor, imageFiles);
      return false;
    }
    if (pastedHTML && typesetOptions.pasteFilter) {
      event.preventDefault();
      const filteredHTML = typesetHTML(pastedHTML, { ...typesetOptions });
      insertHTML(editor, filteredHTML);
      const imageSources = imageSourcesFromHTML(filteredHTML);
      if (imageSources.length) replacePastedRemoteImages(editor, imageSources);
      return false;
    }
    const imageSources = imageSourcesFromHTML(pastedHTML);
    if (imageSources.length) replacePastedRemoteImages(editor, imageSources);
    return true;
  },
  MENU_CONF: {
    uploadImage: {
      maxFileSize: 50 * 1024 * 1024,
      allowedFileTypes: ["image/*"],
      customUpload: async (
        file: File,
        insertFn: (url: string, alt?: string, href?: string) => void,
      ) => {
        await runSingleUpload("image", file, "图片上传中", (url) =>
          insertFn(url, file.name, url),
        );
      },
    },
    uploadVideo: {
      maxFileSize: 200 * 1024 * 1024,
      allowedFileTypes: ["video/*"],
      customUpload: async (
        file: File,
        insertFn: (url: string, poster?: string) => void,
      ) => {
        await runSingleUpload("video", file, "视频上传中", (url) =>
          insertFn(url),
        );
      },
    },
  },
}));
const textAlignEnabled = computed({
  get: () => Boolean(typesetOptions.textAlign),
  set: (enabled) => {
    typesetOptions.textAlign = enabled ? "left" : false;
  },
});
const textAlignValue = computed({
  get: () => typesetOptions.textAlign || "left",
  set: (value: Exclude<TextAlignValue, false>) => {
    typesetOptions.textAlign = value;
  },
});
const imageBlockLineEnabled = computed({
  get: () => Boolean(typesetOptions.imageBlockLine),
  set: (enabled) => {
    typesetOptions.imageBlockLine = enabled ? "center" : false;
  },
});
const imageBlockLineValue = computed({
  get: () => typesetOptions.imageBlockLine || "center",
  set: (value: Exclude<ImageBlockLineValue, false>) => {
    typesetOptions.imageBlockLine = value;
  },
});
const symbolConvertEnabled = computed({
  get: () => typesetOptions.bdc2sb || typesetOptions.tobdc,
  set: (enabled) => {
    typesetOptions.bdc2sb = enabled;
    typesetOptions.tobdc = false;
  },
});
const symbolConvertValue = computed({
  get: (): Exclude<SymbolConvertValue, false> =>
    typesetOptions.tobdc ? "tobdc" : "bdc2sb",
  set: (value: Exclude<SymbolConvertValue, false>) => {
    typesetOptions.bdc2sb = value === "bdc2sb";
    typesetOptions.tobdc = value === "tobdc";
  },
});

onMounted(() => {
  window.addEventListener(TYPESET_EVENT, handleTypesetEvent as EventListener);
  window.addEventListener(
    IMAGE_EDIT_EVENT,
    handleImageEditEvent as EventListener,
  );
  window.addEventListener(SOURCE_EVENT, handleSourceEvent as EventListener);
  window.addEventListener(
    ATTACHMENT_UPLOAD_EVENT,
    handleAttachmentUploadEvent as EventListener,
  );
});

onBeforeUnmount(() => {
  window.removeEventListener(
    TYPESET_EVENT,
    handleTypesetEvent as EventListener,
  );
  window.removeEventListener(
    IMAGE_EDIT_EVENT,
    handleImageEditEvent as EventListener,
  );
  window.removeEventListener(SOURCE_EVENT, handleSourceEvent as EventListener);
  window.removeEventListener(
    ATTACHMENT_UPLOAD_EVENT,
    handleAttachmentUploadEvent as EventListener,
  );
  if (noticeTimer) window.clearTimeout(noticeTimer);
  destroySourceEditor();
  editorRef.value?.destroy();
});

function emitValue(value: string) {
  const output = normalizeOutputHTML(value || "");
  emit("update:modelValue", output);
  emit("update:value", output);
  emit("change", output);
}

async function runSingleUpload(
  kind: UploadKind,
  file: File,
  label: string,
  insert: (url: string) => void,
) {
  startUploadProgress(label, 1);
  try {
    const url = await uploadAndResolveURL(file, kind);
    insert(url);
    advanceUploadProgress();
  } catch (error) {
    showEditorNotice(`${label.replace("中", "")}失败`, "danger");
    throw error;
  } finally {
    stopUploadProgress();
  }
}

function handleCreated(editor: IDomEditor) {
  editorRef.value = editor;
}

function handleTypesetEvent(event: CustomEvent<{ editor?: IDomEditor }>) {
  if (!event.detail?.editor || event.detail.editor !== editorRef.value) return;
  typesetButtonElement = typesetButtonElement || findTypesetButtonFromToolbar();
  showTypesetPanel();
}

function applyTypesetOptions() {
  const editor = editorRef.value;
  if (!editor) return;
  editor.setHtml(typesetHTML(editor.getHtml(), { ...typesetOptions }));
  hideTypesetPanel();
  showEditorNotice("排版完成", "success");
}

function resetTypesetOptions() {
  Object.assign(typesetOptions, defaultTypesetOptions());
}

function handleToolbarMouseover(event: MouseEvent) {
  const button = findTypesetButton(event);
  if (button) typesetButtonElement = button;
}

function findTypesetButton(event: MouseEvent) {
  if (!(event.target instanceof Element)) return null;
  const toolbarElement =
    event.currentTarget instanceof HTMLElement
      ? event.currentTarget
      : undefined;
  const target = event.target.closest<HTMLElement>(TYPESET_TRIGGER_SELECTOR);
  if (!target || (toolbarElement && !toolbarElement.contains(target)))
    return null;
  return (
    target.closest<HTMLElement>(
      'button, [role="button"], .w-e-bar-item, .w-e-menu-tooltip-v5, .w-e-menu',
    ) || target
  );
}

function findTypesetButtonFromToolbar() {
  const toolbarElement = editorRootRef.value?.querySelector<HTMLElement>(
    ".wang-editor-plus__toolbar",
  );
  const target =
    toolbarElement?.querySelector<HTMLElement>(TYPESET_TRIGGER_SELECTOR) ||
    null;
  return (
    target?.closest<HTMLElement>(
      'button, [role="button"], .w-e-bar-item, .w-e-menu-tooltip-v5, .w-e-menu',
    ) || target
  );
}

function showTypesetPanel() {
  if (!typesetButtonElement) return;
  const rect = typesetButtonElement.getBoundingClientRect();
  typesetPanelStyle.top = `${rect.bottom + 6}px`;
  typesetPanelStyle.left = `${Math.max(8, rect.left - 12)}px`;
  typesetPanelVisible.value = true;
}

function hideTypesetPanel() {
  typesetPanelVisible.value = false;
}

function handleAttachmentUploadEvent(
  event: CustomEvent<{ editor?: IDomEditor }>,
) {
  const editor = event.detail?.editor;
  if (!editor || editor !== editorRef.value) return;
  uploadAttachment(editor);
}

function uploadAttachment(editor: IDomEditor) {
  const input = document.createElement("input");
  input.type = "file";
  input.multiple = true;
  input.style.display = "none";
  input.addEventListener(
    "change",
    () => {
      const files = Array.from(input.files || []);
      document.body.removeChild(input);
      if (files.length) uploadAttachmentFiles(editor, files);
    },
    { once: true },
  );
  document.body.appendChild(input);
  input.click();
}

async function uploadAttachmentFiles(editor: IDomEditor, files: File[]) {
  startUploadProgress("附件上传中", files.length);
  editor.focus();
  try {
    for (const file of files) {
      const url = await uploadAndResolveURL(file, "file");
      insertHTML(editor, attachmentHTML(url, file.name));
      advanceUploadProgress();
    }
  } catch (error) {
    showEditorNotice("附件上传失败", "danger");
    throw error;
  } finally {
    stopUploadProgress();
  }
}

function handleSourceEvent(event: CustomEvent<{ editor?: IDomEditor }>) {
  if (!event.detail?.editor || event.detail.editor !== editorRef.value) return;
  if (sourceMode.value) {
    applySourceCode();
    return;
  }
  showSourceMode();
}

function showSourceMode() {
  const editor = editorRef.value;
  if (!editor) return;
  hideTypesetPanel();
  hideImageEditPanel();
  sourceCode.value = editor.getHtml();
  sourceMode.value = true;
  nextTick(() => {
    const sourceEditor = ensureSourceEditor();
    sourceEditor?.setValue(sourceCode.value);
    sourceEditor?.refresh();
    sourceEditor?.focus();
  });
}

function applySourceCode() {
  const editor = editorRef.value;
  if (!editor) return;
  const value = currentSourceCode();
  editor.setHtml(value);
  emitValue(value);
  sourceMode.value = false;
  showEditorNotice("源码已应用", "success");
}

function exitSourceMode() {
  const editor = editorRef.value;
  const value = currentSourceCode();
  if (editor) editor.setHtml(value);
  emitValue(value);
  sourceMode.value = false;
}

function currentSourceCode() {
  return sourceCodeEditor?.getValue() ?? sourceCode.value;
}

function ensureSourceEditor() {
  if (sourceCodeEditor) return sourceCodeEditor;
  if (!sourceEditorRef.value) return null;
  sourceCodeEditor = CodeMirror(sourceEditorRef.value, {
    value: sourceCode.value,
    mode: "htmlmixed",
    lineNumbers: true,
    lineWrapping: true,
    tabSize: 2,
    indentUnit: 2,
    autoRefresh: true,
  });
  sourceCodeEditor.on("change", (sourceEditor) => {
    sourceCode.value = sourceEditor.getValue();
  });
  sourceCodeEditor.on("blur", () => emitValue(currentSourceCode()));
  return sourceCodeEditor;
}

function destroySourceEditor() {
  if (!sourceCodeEditor) return;
  sourceCodeEditor.getWrapperElement().remove();
  sourceCodeEditor = null;
}

function handleImageEditEvent(
  event: CustomEvent<{ editor?: IDomEditor; path?: number[] }>,
) {
  const editor = event.detail?.editor;
  if (!editor || editor !== editorRef.value) return;
  showImageEditPanel(editor, event.detail.path);
}

function showImageEditPanel(editor: IDomEditor, path?: number[]) {
  const image =
    getSelectedImageNode(editor) ||
    getImageNodeByPath(editor, path || lastImageEditTargetPath.get(editor));
  if (!image) return;
  imageEditTargetPath =
    path ||
    lastImageEditTargetPath.get(editor) ||
    DomEditor.findPath(editor, image as any);
  imageEditForm.src = image.src || "";
  imageEditForm.alt = image.alt || "";
  imageEditForm.href = image.href || "";
  imageEditForm.width = image.style?.width || "";
  imageEditForm.height = image.style?.height || "";
  imageEditError.value = "";

  const rect = imageRect(editor, image);
  const nextPosition = imageEditPanelPosition(rect);
  imageEditPanelStyle.top = `${nextPosition.top}px`;
  imageEditPanelStyle.left = `${nextPosition.left}px`;
  imageEditPanelVisible.value = true;
}

function hideImageEditPanel() {
  imageEditPanelVisible.value = false;
}

function clearImageDimensions() {
  imageEditForm.width = "";
  imageEditForm.height = "";
}

function applyImageEdit() {
  const editor = editorRef.value;
  if (!editor || !imageEditTargetPath) return;
  imageEditError.value = "";
  const src = imageEditForm.src.trim();
  if (!src) {
    imageEditError.value = "图片地址不能为空";
    return;
  }
  const width = normalizeImageDimension(imageEditForm.width);
  const height = normalizeImageDimension(imageEditForm.height);
  if (width === null || height === null) {
    imageEditError.value = "请输入合法尺寸，例如 320px、50% 或 auto";
    return;
  }
  const nextStyle: Record<string, string> = {};
  if (width) nextStyle.width = width;
  if (height) nextStyle.height = height;
  SlateTransforms.setNodes(
    editor,
    {
      src,
      alt: imageEditForm.alt.trim() || undefined,
      href: imageEditForm.href.trim() || undefined,
      style: Object.keys(nextStyle).length ? nextStyle : undefined,
    } as any,
    { at: imageEditTargetPath, voids: true } as any,
  );
  hideImageEditPanel();
  showEditorNotice("图片已更新", "success");
}

function normalizeOutputHTML(value: string) {
  return value;
}

function showEditorNotice(
  text: string,
  type: typeof noticeState.type = "info",
) {
  noticeState.text = text;
  noticeState.type = type;
  noticeState.visible = true;
  if (noticeTimer) window.clearTimeout(noticeTimer);
  noticeTimer = window.setTimeout(() => {
    noticeState.visible = false;
  }, 2600);
}

function insertHTML(editor: IDomEditor, value: string) {
  const htmlEditor = editor as IDomEditor & {
    dangerouslyInsertHtml?: (html: string) => void;
  };
  if (htmlEditor.dangerouslyInsertHtml) {
    htmlEditor.dangerouslyInsertHtml(value);
    return;
  }
  editor.insertText(htmlToPlainText(value));
}

function htmlToPlainText(value: string) {
  const doc = new DOMParser().parseFromString(value, "text/html");
  return doc.body.textContent || "";
}

async function uploadAndResolveURL(file: File, kind: UploadKind) {
  if (!props.upload) {
    showEditorNotice("请先传入 upload 方法", "danger");
    throw new Error(
      "WangEditorPlus: upload prop is required for file uploads.",
    );
  }
  const result = await props.upload(file, {
    kind,
    path: uploadPathForKind(kind),
  });
  const rawURL = uploadResultURL(result);
  if (!rawURL)
    throw new Error("WangEditorPlus: upload result must include url or path.");
  return props.resolveUploadUrl?.(rawURL) || rawURL;
}

function uploadPathForKind(kind: UploadKind) {
  if (kind === "image")
    return props.imageUploadPath || `${props.uploadPath}/image`;
  if (kind === "video")
    return props.videoUploadPath || `${props.uploadPath}/video`;
  return props.fileUploadPath || `${props.uploadPath}/file`;
}

function uploadResultURL(result: UploadResult) {
  if (typeof result === "string") return result;
  return result.url || result.path || "";
}

function imageFilesFromClipboard(event: ClipboardEvent) {
  const items = Array.from(event.clipboardData?.items || []);
  return items
    .filter((item) => item.kind === "file" && item.type.startsWith("image/"))
    .map((item) => item.getAsFile())
    .filter((file): file is File => Boolean(file));
}

async function uploadClipboardFiles(editor: IDomEditor, files: File[]) {
  startUploadProgress("图片上传中", files.length);
  editor.focus();
  try {
    for (const file of files) {
      const url = await uploadAndResolveURL(file, "image");
      editor.insertNode({
        type: "image",
        src: url,
        alt: file.name,
        href: url,
        children: [{ text: "" }],
      } as any);
      advanceUploadProgress();
    }
  } catch (error) {
    showEditorNotice("粘贴图片上传失败", "danger");
    throw error;
  } finally {
    stopUploadProgress();
  }
}

function imageSourcesFromHTML(value: string) {
  if (!value) return [];
  const doc = new DOMParser().parseFromString(value, "text/html");
  return Array.from(doc.querySelectorAll("img"))
    .map((img) => img.getAttribute("src") || "")
    .filter(
      (src) => src && !src.startsWith("blob:") && !src.startsWith("data:"),
    )
    .filter((src, index, list) => list.indexOf(src) === index);
}

async function replacePastedRemoteImages(
  editor: IDomEditor,
  sources: string[],
) {
  startUploadProgress("图片上传中", sources.length);
  setTimeout(async () => {
    try {
      const failures: string[] = [];
      await waitForPastedImageSources(editor, sources);
      for (const source of sources) {
        try {
          const file = await fileFromRemoteImage(source);
          const url = await uploadAndResolveURL(file, "image");
          replaceEditorHTML(editor, source, url);
        } catch {
          failures.push(source);
        } finally {
          advanceUploadProgress();
        }
      }
      if (failures.length)
        showEditorNotice("部分远程图片受跨域限制，已保留原图片地址", "warning");
    } finally {
      stopUploadProgress();
    }
  });
}

async function waitForPastedImageSources(
  editor: IDomEditor,
  sources: string[],
) {
  for (let index = 0; index < 10; index += 1) {
    const content = editor.getHtml();
    if (sources.some((source) => content.includes(source))) return content;
    await new Promise((resolve) => window.setTimeout(resolve, 50));
  }
  return editor.getHtml();
}

function startUploadProgress(label: string, total: number) {
  uploadProgressState.processing = true;
  uploadProgressState.label = label;
  uploadProgressState.done = 0;
  uploadProgressState.total = total;
}

function advanceUploadProgress() {
  uploadProgressState.done = Math.min(
    uploadProgressState.total,
    uploadProgressState.done + 1,
  );
}

function stopUploadProgress() {
  setTimeout(() => {
    uploadProgressState.processing = false;
    uploadProgressState.label = "上传中";
    uploadProgressState.done = 0;
    uploadProgressState.total = 0;
  }, 300);
}

function replaceEditorHTML(
  editor: IDomEditor,
  search: string,
  replacement: string,
) {
  const content = editor.getHtml();
  if (content.includes(search))
    editor.setHtml(content.split(search).join(replacement));
}

function attachmentHTML(url: string, name: string) {
  const safeUrl = escapeHTMLAttribute(url);
  const safeName = escapeHTMLText(name || fileNameFromURL(url));
  return `<p><a href="${safeUrl}" target="_blank" rel="noopener noreferrer" download="${safeName}">附件：${safeName}</a></p>`;
}

function escapeHTMLText(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeHTMLAttribute(value: string) {
  return escapeHTMLText(value).replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function fileNameFromURL(value: string) {
  try {
    const url = new URL(value, window.location.href);
    return decodeURIComponent(
      url.pathname.split("/").filter(Boolean).pop() || "附件",
    );
  } catch {
    return "附件";
  }
}

async function fileFromRemoteImage(source: string) {
  const response = await fetch(source);
  if (!response.ok) throw new Error(`fetch image failed: ${response.status}`);
  const blob = await response.blob();
  const type = blob.type || "image/png";
  return new File([blob], imageFileName(source, type), { type });
}

function imageFileName(source: string, type: string) {
  try {
    const url = new URL(source, window.location.href);
    const name = url.pathname.split("/").filter(Boolean).pop();
    if (name) return name;
  } catch {
    // fallback by mime type
  }
  const ext = type.split("/")[1] || "png";
  return `pasted-image.${ext}`;
}

function registerCustomMenus() {
  const globalState = globalThis as typeof globalThis & {
    __VUE_WANG_EDITOR_PLUS_MENUS__?: {
      typeset: boolean;
      imageEdit: boolean;
      sourceCode: boolean;
      attachmentUpload: boolean;
    };
  };
  const registeredMenus = globalState.__VUE_WANG_EDITOR_PLUS_MENUS__ || {
    typeset: false,
    imageEdit: false,
    sourceCode: false,
    attachmentUpload: false,
  };
  globalState.__VUE_WANG_EDITOR_PLUS_MENUS__ = registeredMenus;

  class TypesetMenu {
    title = "魔术棒";
    tag = "button";
    iconSvg = MAGIC_WAND_ICON;
    getValue() {
      return "";
    }
    isActive() {
      return false;
    }
    isDisabled() {
      return false;
    }
    exec(editor: IDomEditor) {
      window.dispatchEvent(
        new CustomEvent(TYPESET_EVENT, { detail: { editor } }),
      );
    }
  }

  class CustomEditImageMenu {
    title = "编辑图片";
    tag = "button";
    iconSvg = IMAGE_EDIT_ICON;
    getValue() {
      return "";
    }
    isActive() {
      return false;
    }
    isDisabled(editor: IDomEditor) {
      const image = getSelectedImageNode(editor);
      if (!image) return true;
      lastImageEditTargetPath.set(
        editor,
        DomEditor.findPath(editor, image as any),
      );
      return false;
    }
    exec(editor: IDomEditor) {
      if (this.isDisabled(editor)) return;
      window.dispatchEvent(
        new CustomEvent(IMAGE_EDIT_EVENT, {
          detail: { editor, path: lastImageEditTargetPath.get(editor) },
        }),
      );
    }
  }

  class SourceCodeMenu {
    title = "源码";
    tag = "button";
    iconSvg = SOURCE_ICON;
    getValue() {
      return "";
    }
    isActive() {
      return false;
    }
    isDisabled() {
      return false;
    }
    exec(editor: IDomEditor) {
      window.dispatchEvent(
        new CustomEvent(SOURCE_EVENT, { detail: { editor } }),
      );
    }
  }

  class AttachmentUploadMenu {
    title = "上传附件";
    tag = "button";
    iconSvg = ATTACHMENT_ICON;
    getValue() {
      return "";
    }
    isActive() {
      return false;
    }
    isDisabled() {
      return false;
    }
    exec(editor: IDomEditor) {
      window.dispatchEvent(
        new CustomEvent(ATTACHMENT_UPLOAD_EVENT, { detail: { editor } }),
      );
    }
  }

  if (!registeredMenus.typeset) {
    Boot.registerMenu({
      key: "typeset",
      factory() {
        return new TypesetMenu() as any;
      },
    });
    registeredMenus.typeset = true;
  }
  if (!registeredMenus.imageEdit) {
    Boot.registerMenu({
      key: "customEditImage",
      factory() {
        return new CustomEditImageMenu() as any;
      },
    });
    registeredMenus.imageEdit = true;
  }
  if (!registeredMenus.sourceCode) {
    Boot.registerMenu({
      key: "sourceCode",
      factory() {
        return new SourceCodeMenu() as any;
      },
    });
    registeredMenus.sourceCode = true;
  }
  if (!registeredMenus.attachmentUpload) {
    Boot.registerMenu({
      key: "uploadAttachment",
      factory() {
        return new AttachmentUploadMenu() as any;
      },
    });
    registeredMenus.attachmentUpload = true;
  }
}

function getSelectedImageNode(editor: IDomEditor) {
  return DomEditor.getSelectedNodeByType(editor, "image") as {
    type: "image";
    src: string;
    alt?: string;
    href?: string;
    style?: {
      width?: string;
      height?: string;
    };
    children: { text: "" }[];
  } | null;
}

function getImageNodeByPath(editor: IDomEditor, path?: number[]) {
  if (!path?.length) return null;
  let node: any = editor;
  for (const index of path) {
    node = node?.children?.[index];
    if (!node) return null;
  }
  return node?.type === "image"
    ? (node as NonNullable<ReturnType<typeof getSelectedImageNode>>)
    : null;
}

function imageRect(
  editor: IDomEditor,
  image: NonNullable<ReturnType<typeof getSelectedImageNode>>,
) {
  try {
    return DomEditor.toDOMNode(editor, image as any).getBoundingClientRect();
  } catch {
    return {
      top: window.innerHeight / 2 - 80,
      right: window.innerWidth / 2 + 160,
      bottom: window.innerHeight / 2 - 80,
      left: window.innerWidth / 2 - 160,
      width: 320,
      height: 0,
      x: window.innerWidth / 2 - 160,
      y: window.innerHeight / 2 - 80,
      toJSON: () => ({}),
    } as DOMRect;
  }
}

function imageEditPanelPosition(rect: DOMRect) {
  const viewportWidth = window.innerWidth || IMAGE_EDIT_PANEL_WIDTH;
  const viewportHeight = window.innerHeight || IMAGE_EDIT_PANEL_HEIGHT;
  const maxLeft = Math.max(8, viewportWidth - IMAGE_EDIT_PANEL_WIDTH - 8);
  const maxTop = Math.max(8, viewportHeight - IMAGE_EDIT_PANEL_HEIGHT - 8);
  const preferredTop =
    rect.bottom + IMAGE_EDIT_PANEL_HEIGHT + 8 <= viewportHeight
      ? rect.bottom + 8
      : rect.top - IMAGE_EDIT_PANEL_HEIGHT - 8;
  return {
    top: Math.max(8, Math.min(preferredTop, maxTop)),
    left: Math.max(8, Math.min(rect.left, maxLeft)),
  };
}

function normalizeImageDimension(value: string) {
  const nextValue = value.trim();
  if (!nextValue) return "";
  if (nextValue === "auto") return "auto";
  if (/^\d+(\.\d+)?$/.test(nextValue)) return `${nextValue}px`;
  if (/^\d+(\.\d+)?(px|%|rem|em|vw|vh)$/i.test(nextValue)) return nextValue;
  return null;
}

function defaultTypesetOptions(): TypesetOptions {
  return {
    mergeEmptyline: true,
    removeClass: true,
    removeEmptyline: false,
    textAlign: false,
    imageBlockLine: "center",
    clearFontSize: false,
    clearFontFamily: false,
    clearInlineFormat: false,
    removeEmptyNode: false,
    pasteFilter: false,
    indent: false,
    indentValue: "2",
    bdc2sb: false,
    tobdc: false,
    hideTableBorder: false,
  };
}

function typesetHTML(
  content: string,
  options: TypesetOptions = defaultTypesetOptions(),
) {
  const doc = new DOMParser().parseFromString(
    `<main>${content || ""}</main>`,
    "text/html",
  );
  const root = doc.body.firstElementChild as HTMLElement;
  replaceDivsWithParagraphs(root, doc);
  if (options.clearInlineFormat) clearInlineFormatting(root);
  cleanElementAttributes(root, options);
  applyLineOptions(root, options);
  normalizeMedia(root, doc, options);
  normalizeTables(root, options);
  normalizeTextNodes(root, options);
  if (options.mergeEmptyline) collapseBlankParagraphs(root);
  if (options.removeEmptyline) removeBlankParagraphs(root);
  if (options.removeEmptyNode) removeRedundantHTML(root);
  return root.innerHTML;
}

function replaceDivsWithParagraphs(root: HTMLElement, doc: Document) {
  root.querySelectorAll("div").forEach((div) => {
    const paragraph = doc.createElement("p");
    while (div.firstChild) paragraph.appendChild(div.firstChild);
    div.replaceWith(paragraph);
  });
}

function cleanElementAttributes(root: HTMLElement, options: TypesetOptions) {
  root.querySelectorAll<HTMLElement>("*").forEach((element) => {
    if (
      options.removeClass &&
      !["selectTdClass", "pagebreak", "anchorclass"].includes(
        element.className.toLowerCase(),
      )
    ) {
      element.removeAttribute("class");
    }
    if (options.clearFontSize) {
      element.style.removeProperty("font-size");
      removeEmptyStyleAttribute(element);
    }
    if (options.clearFontFamily) {
      element.style.removeProperty("font-family");
      removeEmptyStyleAttribute(element);
    }
    if (
      ["IMG", "VIDEO", "IFRAME", "EMBED", "OBJECT", "TABLE"].includes(
        element.tagName,
      )
    ) {
      element.removeAttribute("width");
      element.removeAttribute("height");
    }
  });
}

function clearInlineFormatting(root: HTMLElement) {
  root
    .querySelectorAll<HTMLElement>(
      "b, big, code, del, dfn, em, font, i, ins, kbd, q, samp, small, span, strike, strong, sub, sup, tt, u, var",
    )
    .forEach((element) => {
      element.replaceWith(...Array.from(element.childNodes));
    });
}

function applyLineOptions(root: HTMLElement, options: TypesetOptions) {
  root
    .querySelectorAll<HTMLElement>(
      "p, blockquote, center, h1, h2, h3, h4, h5, h6",
    )
    .forEach((element) => {
      if (isBlankParagraph(element)) return;
      if (options.indent && !isMediaParagraph(element))
        applyLeadingIndentSpaces(
          element,
          indentSpaceCount(options.indentValue),
        );
      if (options.textAlign) element.style.textAlign = options.textAlign;
    });
}

function applyLeadingIndentSpaces(element: HTMLElement, count: number) {
  element.style.removeProperty("text-indent");
  removeEmptyStyleAttribute(element);
  removeLeadingIndentSpaces(element);
  if (count)
    element.insertBefore(
      element.ownerDocument.createTextNode(IDEOGRAPHIC_SPACE.repeat(count)),
      element.firstChild,
    );
}

function removeLeadingIndentSpaces(element: HTMLElement) {
  let node = element.firstChild;
  while (node) {
    if (node.nodeType !== Node.TEXT_NODE) return;
    const text = node.textContent || "";
    const nextText = text.replace(/^[\u3000\u00a0 ]+/, "");
    if (nextText) {
      node.textContent = nextText;
      return;
    }
    const nextNode = node.nextSibling;
    node.remove();
    node = nextNode;
  }
}

function indentSpaceCount(value: string) {
  const count = Number.parseInt(value, 10);
  if (!Number.isFinite(count)) return 2;
  return Math.min(Math.max(count, 0), 12);
}

function normalizeMedia(
  root: HTMLElement,
  doc: Document,
  options: TypesetOptions,
) {
  root
    .querySelectorAll<HTMLElement>("img, video, iframe, embed, object")
    .forEach((element) => {
      element.style.maxWidth = "100%";
      if (element.tagName === "IMG" || element.tagName === "VIDEO") {
        if (!element.style.height) element.style.height = "auto";
        element.style.verticalAlign = "middle";
      }
      if (options.imageBlockLine === "center") {
        centerMediaElement(element, doc);
        return;
      }
      const imageBlockLine = options.imageBlockLine;
      if (
        imageBlockLine &&
        ["left", "right", "none"].includes(imageBlockLine)
      ) {
        element.style.float =
          imageBlockLine === "none" ? "none" : imageBlockLine;
      }
    });
}

function normalizeTables(root: HTMLElement, options: TypesetOptions) {
  root.querySelectorAll<HTMLElement>("table").forEach((table) => {
    table.style.width = "100%";
    table.style.maxWidth = "100%";
    table.style.tableLayout = "fixed";
    table.style.borderCollapse = "collapse";
    if (options.hideTableBorder) table.classList.add("table-hide-border");
  });
  root.querySelectorAll<HTMLElement>("td, th").forEach((cell) => {
    cell.style.wordBreak = "break-word";
    cell.style.overflowWrap = "anywhere";
  });
}

function collapseBlankParagraphs(root: HTMLElement) {
  let previousBlank = false;
  root.querySelectorAll("p").forEach((paragraph) => {
    const blank = isBlankParagraph(paragraph as HTMLElement);
    if (blank && previousBlank) {
      paragraph.remove();
      return;
    }
    previousBlank = blank;
  });
}

function removeBlankParagraphs(root: HTMLElement) {
  root.querySelectorAll<HTMLElement>("p").forEach((paragraph) => {
    if (isBlankParagraph(paragraph)) paragraph.remove();
  });
}

function removeRedundantHTML(root: HTMLElement) {
  removeCommentNodes(root);
  root
    .querySelectorAll<HTMLElement>(
      "div, span, font, em, strong, s, u, b, i, small, big, code, del, ins, strike, sub, sup",
    )
    .forEach((element) => {
      if (!element.attributes.length && isEmptyFormattingNode(element))
        element.remove();
    });
}

function removeCommentNodes(root: HTMLElement) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_COMMENT);
  const comments: Comment[] = [];
  while (walker.nextNode()) comments.push(walker.currentNode as Comment);
  comments.forEach((comment) => comment.remove());
}

function isEmptyFormattingNode(element: HTMLElement) {
  return (
    !element.textContent?.trim() &&
    !element.querySelector("img, video, iframe, embed, object, table, br")
  );
}

function normalizeTextNodes(root: HTMLElement, options: TypesetOptions) {
  if (!options.bdc2sb && !options.tobdc) return;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const textNodes: Text[] = [];
  while (walker.nextNode()) textNodes.push(walker.currentNode as Text);
  textNodes.forEach((node) => {
    node.data = options.bdc2sb
      ? toHalfWidth(node.data)
      : toFullWidth(node.data);
  });
}

function centerMediaElement(element: HTMLElement, doc: Document) {
  element.style.float = "none";
  const paragraph = element.closest("p");
  if (paragraph && isMediaParagraph(paragraph)) {
    paragraph.style.textAlign = "center";
    paragraph.style.textIndent = "";
    return;
  }
  const wrapper = doc.createElement("p");
  wrapper.style.textAlign = "center";
  element.parentNode?.insertBefore(wrapper, element);
  wrapper.appendChild(element);
}

function removeEmptyStyleAttribute(element: HTMLElement) {
  if (!element.getAttribute("style")) element.removeAttribute("style");
}

function isBlankParagraph(paragraph: HTMLElement) {
  return (
    !paragraph.textContent?.trim() &&
    !paragraph.querySelector("img, video, iframe, embed, object, table")
  );
}

function isMediaParagraph(paragraph: HTMLElement) {
  const meaningfulNodes = Array.from(paragraph.childNodes).filter(
    (node) =>
      node.nodeType !== Node.TEXT_NODE || Boolean(node.textContent?.trim()),
  );
  if (!meaningfulNodes.length) return false;
  return meaningfulNodes.every(
    (node) =>
      node.nodeType === Node.ELEMENT_NODE &&
      ["IMG", "VIDEO", "IFRAME", "EMBED", "OBJECT", "TABLE"].includes(
        (node as Element).tagName,
      ),
  );
}

function toHalfWidth(value: string) {
  return value
    .replace(/[\uff01-\uff5e]/g, (char) =>
      String.fromCharCode(char.charCodeAt(0) - 65248),
    )
    .replace(/\u3000/g, " ");
}

function toFullWidth(value: string) {
  return value
    .replace(/[!-~]/g, (char) =>
      String.fromCharCode(char.charCodeAt(0) + 65248),
    )
    .replace(/ /g, "\u3000");
}
</script>

<style scoped>
.wang-editor-plus {
  position: relative;
  overflow: hidden;
  background: #fff;
  border: 1px solid var(--wang-editor-plus-border-color, #dcdfe6);
  border-radius: 4px;
}

.wang-editor-plus__notice,
.wang-editor-plus__upload-progress {
  position: absolute;
  top: 8px;
  right: 8px;
  pointer-events: none;
}

.wang-editor-plus__notice {
  z-index: 20;
  max-width: min(360px, calc(100% - 16px));
  padding: 7px 10px;
  overflow: hidden;
  font-size: 12px;
  line-height: 18px;
  color: #303133;
  text-overflow: ellipsis;
  white-space: nowrap;
  background: #fff;
  border: 1px solid #dcdfe6;
  border-radius: 2px;
  box-shadow: 0 2px 8px rgb(0 0 0 / 10%);
}

.wang-editor-plus__notice--success {
  color: #067647;
  background: #ecfdf3;
  border-color: #abefc6;
}

.wang-editor-plus__notice--warning {
  color: #b54708;
  background: #fffaeb;
  border-color: #fedf89;
}

.wang-editor-plus__notice--danger {
  color: #b42318;
  background: #fef3f2;
  border-color: #fecdca;
}

.wang-editor-plus__upload-progress {
  z-index: 30;
  width: min(260px, calc(100% - 16px));
  padding: 10px 12px;
  color: #1d4ed8;
  background: #eff6ff;
  border: 1px solid #93c5fd;
  border-radius: 4px;
  box-shadow: 0 6px 18px rgb(37 99 235 / 18%);
}

.upload-progress-main {
  display: flex;
  gap: 8px;
  align-items: center;
  font-size: 13px;
  font-weight: 600;
  line-height: 18px;
}

.upload-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid #bfdbfe;
  border-top-color: #2563eb;
  border-radius: 50%;
  animation: wang-editor-plus-upload-spin 0.8s linear infinite;
}

.upload-progress-meta {
  margin-top: 6px;
  font-size: 12px;
  line-height: 16px;
  color: #64748b;
}

.upload-progress-track {
  height: 6px;
  margin-top: 8px;
  overflow: hidden;
  background: #bfdbfe;
  border-radius: 999px;
}

.upload-progress-bar {
  height: 100%;
  background: #2563eb;
  border-radius: inherit;
  transition: width 0.2s ease;
}

@keyframes wang-editor-plus-upload-spin {
  to {
    transform: rotate(360deg);
  }
}

.wang-editor-plus__toolbar {
  border-bottom: 1px solid var(--wang-editor-plus-border-color, #dcdfe6);
}

.wang-editor-plus__toolbar :deep(.w-e-bar) {
  padding-right: 0;
  padding-left: 0;
}

.wang-editor-plus__toolbar :deep(.w-e-bar-item) {
  padding-right: 2px;
  padding-left: 2px;
}

.wang-editor-plus__toolbar :deep(.w-e-bar-item button) {
  padding-right: 6px;
  padding-left: 6px;
}

.wang-editor-plus__toolbar :deep(.w-e-bar-divider) {
  margin-right: 3px;
  margin-left: 3px;
}

.wang-editor-plus__toolbar :deep(svg[data-wangeditor-plus-source-trigger]) {
  width: 34px;
  height: 16px;
}

.wang-editor-plus__content {
  margin-right: calc(var(--wang-editor-plus-content-bleed-x, 0px) * -1);
  margin-left: calc(var(--wang-editor-plus-content-bleed-x, 0px) * -1);
  overflow-y: hidden;
}

.wang-editor-plus__content :deep(.w-e-text-container) {
  min-height: 100%;
}

.wang-editor-plus__content :deep(.w-e-text-container .w-e-scroll) {
  padding: 0 !important;
}

.wang-editor-plus__content :deep(.w-e-text-container [data-slate-editor]) {
  padding: 8px 10px 16px !important;
}

.wang-editor-plus__content :deep(.w-e-text-placeholder) {
  top: 8px;
  left: 10px;
}

.wang-editor-plus__content :deep(img),
.wang-editor-plus__content :deep(video) {
  max-width: 100%;
  height: auto;
}

.wang-editor-plus__content :deep(.table-hide-border td),
.wang-editor-plus__content :deep(.table-hide-border th) {
  font-weight: normal !important;
  background: none !important;
  border: 0 !important;
}

.wang-editor-plus__source {
  display: flex;
  flex-direction: column;
  min-height: 220px;
  margin-right: calc(var(--wang-editor-plus-content-bleed-x, 0px) * -1);
  margin-left: calc(var(--wang-editor-plus-content-bleed-x, 0px) * -1);
  overflow: hidden;
  background: #fff;
}

.wang-editor-plus__source-editor {
  flex: 1 1 auto;
  min-height: 0;
  overflow: hidden;
  background: #fbfcff;
  border-bottom: 1px solid #ebeef5;
}

.wang-editor-plus__source-editor :deep(.CodeMirror) {
  height: 100%;
  font-family: Menlo, Monaco, Consolas, "Liberation Mono", monospace;
  font-size: 13px;
  line-height: 1.6;
  color: #303133;
  background: #fbfcff;
}

.wang-editor-plus__source-editor :deep(.CodeMirror-gutters) {
  background: #f5f7fa;
  border-right-color: #ebeef5;
}

.wang-editor-plus__source-editor :deep(.CodeMirror-linenumber) {
  color: #a8abb2;
}

.wang-editor-plus__source-editor :deep(.CodeMirror-lines) {
  padding: 8px 0;
}

.wang-editor-plus__source-editor :deep(.CodeMirror pre.CodeMirror-line),
.wang-editor-plus__source-editor :deep(.CodeMirror pre.CodeMirror-line-like) {
  padding: 0 14px;
}

.source-footer,
.panel-footer {
  display: flex;
  flex: 0 0 auto;
  gap: 6px;
  justify-content: flex-end;
  padding: 8px 12px;
  background: #fafafa;
  border-top: 1px solid #ebeef5;
}

.source-button,
.panel-button {
  height: 26px;
  padding: 0 10px;
  font-size: 12px;
  color: #606266;
  cursor: pointer;
  background: #fff;
  border: 1px solid #dcdfe6;
  border-radius: 2px;
}

.source-button:hover,
.panel-button:hover {
  color: var(--wang-editor-plus-primary-color, #409eff);
  border-color: var(--wang-editor-plus-primary-color, #409eff);
}

.source-button--primary,
.panel-button--primary {
  color: #fff;
  background: var(--wang-editor-plus-primary-color, #409eff);
  border-color: var(--wang-editor-plus-primary-color, #409eff);
}

.source-button--primary:hover,
.panel-button--primary:hover {
  color: #fff;
}

.wang-editor-plus--scroll .wang-editor-plus__content {
  overflow-y: auto;
}

:global(.wang-editor-plus.w-e-full-screen-container) {
  position: fixed !important;
  inset: 0 !important;
  z-index: 9999 !important;
  display: flex !important;
  flex-direction: column;
  width: 100vw !important;
  height: 100dvh !important;
  max-height: 100dvh !important;
  box-sizing: border-box;
  overflow: hidden !important;
  background: #fff;
  border: 0;
  border-radius: 0;
}

:global(
  .wang-editor-plus.w-e-full-screen-container .wang-editor-plus__toolbar
) {
  position: relative !important;
  top: auto !important;
  z-index: 2 !important;
  flex: 0 0 auto;
  padding: 0 !important;
  margin: 0 !important;
  background: #fff;
  border-top: 0 !important;
}

:global(.wang-editor-plus.w-e-full-screen-container .wang-editor-plus__content),
:global(.wang-editor-plus.w-e-full-screen-container .wang-editor-plus__source) {
  flex: 1 1 auto;
  height: calc(100dvh - 41px) !important;
  min-height: 0 !important;
  margin: 0 !important;
  overflow: hidden !important;
}

:global(.wang-editor-plus.w-e-full-screen-container .w-e-text-container) {
  height: 100% !important;
  min-height: 0 !important;
}

:global(
  .wang-editor-plus.w-e-full-screen-container .w-e-text-container .w-e-scroll
) {
  height: 100% !important;
  overflow-y: auto !important;
}

:global(.wang-editor-plus.w-e-full-screen-container .wang-editor-plus__notice),
:global(
  .wang-editor-plus.w-e-full-screen-container .wang-editor-plus__upload-progress
) {
  z-index: 10001;
}

.wang-editor-plus-typeset-panel,
.wang-editor-plus-image-edit-panel {
  position: fixed;
  z-index: 10002;
  overflow: hidden;
  color: #303133;
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 2px;
  box-shadow: 0 2px 10px rgb(0 0 0 / 12%);
}

.wang-editor-plus-typeset-panel {
  width: 380px;
}

.wang-editor-plus-image-edit-panel {
  width: 420px;
}

.wang-editor-plus-typeset-panel::before,
.wang-editor-plus-image-edit-panel::before {
  position: absolute;
  top: -6px;
  left: 20px;
  width: 10px;
  height: 10px;
  content: "";
  background: #fff;
  border-top: 1px solid #e8e8e8;
  border-left: 1px solid #e8e8e8;
  transform: rotate(45deg);
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 30px;
  padding: 0 10px 0 12px;
  font-size: 13px;
  font-weight: 600;
  background: #fafafa;
  border-bottom: 1px solid #eee;
}

.panel-close {
  width: 24px;
  height: 24px;
  padding: 0;
  font-size: 20px;
  line-height: 22px;
  color: #909399;
  cursor: pointer;
  background: transparent;
  border: 0;
}

.panel-close:hover {
  color: #303133;
}

.typeset-body {
  padding: 10px 12px 2px;
}

.typeset-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px 12px;
}

.typeset-grid label,
.typeset-option label {
  display: inline-flex;
  gap: 5px;
  align-items: center;
  font-size: 12px;
  line-height: 18px;
  color: #606266;
}

.typeset-option {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 12px;
  align-items: center;
  padding: 10px 0;
  border-top: 1px solid #f0f0f0;
}

.typeset-option:first-of-type {
  margin-top: 10px;
}

.typeset-label {
  flex: 0 0 64px;
  font-size: 12px;
  font-weight: 600;
  color: #303133;
}

.image-edit-body {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  padding: 12px;
}

.image-edit-field {
  display: grid;
  grid-template-columns: 44px minmax(0, 1fr);
  gap: 8px;
  align-items: center;
  font-size: 12px;
  color: #606266;
}

.image-edit-field--wide,
.image-edit-error {
  grid-column: 1 / -1;
}

.image-edit-error {
  padding-left: 52px;
  font-size: 12px;
  line-height: 18px;
  color: #b42318;
}

.panel-text {
  width: 100%;
  height: 28px;
  padding: 0 8px;
  font-size: 12px;
  color: #303133;
  border: 1px solid #dcdfe6;
  border-radius: 2px;
  outline: none;
}

.panel-text:focus {
  border-color: var(--wang-editor-plus-primary-color, #409eff);
}
</style>
