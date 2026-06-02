# @zixinit/vue-wangeditor-plus

Vue 3 的 WangEditor 封装组件，内置：

- 源码编辑，使用 CodeMirror 高亮
- 图片自定义宽高编辑面板
- 一键排版
- 上传图片、上传视频、上传附件
- 图片/视频/附件共用上传进度浮层
- 粘贴图片上传
- 全屏样式修正

## 本地调试

```bash
pnpm install
pnpm dev
```

打开 Vite 输出的地址。`playground/` 会直接引用 `src/WangEditorPlus.vue`，所以改源码后刷新页面即可验证。

## 打包

```bash
pnpm build
```

产物输出到 `dist/`。

## 本地模拟 npm 安装

```bash
pnpm pack
```

然后在业务项目中安装生成的 `.tgz`：

```bash
pnpm add /path/to/zixinit-vue-wangeditor-plus-0.1.0.tgz
```

## 使用

```vue
<template>
  <WangEditorPlus v-model="content" height="620px" scroll :upload="upload" />
</template>

<script setup lang="ts">
import { ref } from "vue";
import WangEditorPlus from "@zixinit/vue-wangeditor-plus";
import "@zixinit/vue-wangeditor-plus/style.css";
import type { UploadKind } from "@zixinit/vue-wangeditor-plus";

const content = ref("");

async function upload(file: File, context: { kind: UploadKind; path: string }) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("path", context.path);

  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });
  const data = await response.json();
  return data.url;
}
</script>
```

## 上传接口

组件不绑定具体业务上传器，只通过 `upload` prop 调用外部逻辑。

```ts
type UploadKind = "image" | "video" | "file";

type UploadHandler = (
  file: File,
  context: {
    kind: UploadKind;
    path: string;
  },
) => Promise<string | { url?: string; path?: string }>;
```

默认路径：

- 图片：`${uploadPath}/image`
- 视频：`${uploadPath}/video`
- 附件：`${uploadPath}/file`

也可以分别传：

- `imageUploadPath`
- `videoUploadPath`
- `fileUploadPath`

如果后端返回的是相对路径，可以传 `resolveUploadUrl` 做 URL 转换。
