<template>
  <main class="page">
    <aside class="panel">
      <div>
        <h1>WangEditor Plus</h1>
        <p>本地调试页直接引用源码组件，改完组件后刷新即可验证。</p>
      </div>

      <label class="field">
        <span>上传延迟</span>
        <select v-model.number="uploadDelay">
          <option :value="300">300ms</option>
          <option :value="1200">1.2s</option>
          <option :value="3000">3s</option>
          <option :value="6000">6s</option>
        </select>
      </label>

      <label class="check">
        <input v-model="failNextUpload" type="checkbox" />
        <span>下一次上传失败</span>
      </label>

      <div class="stats">
        <div>
          <span>上传次数</span>
          <strong>{{ uploadCount }}</strong>
        </div>
        <div>
          <span>字数</span>
          <strong>{{ plainTextLength }}</strong>
        </div>
      </div>
    </aside>

    <section class="workspace">
      <WangEditorPlus
        v-model="content"
        content-bleed-x="0px"
        height="620px"
        placeholder="输入正文，试试源码、图片尺寸、粘贴图片、上传视频和附件"
        scroll
        upload-path="demo"
        :upload="mockUpload"
      />

      <section class="html-preview">
        <header>
          <span>HTML 输出</span>
          <button type="button" @click="resetContent">重置</button>
        </header>
        <pre>{{ content }}</pre>
      </section>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import WangEditorPlus from "../../src/WangEditorPlus.vue";
import type { UploadKind } from "../../src/types";

const uploadDelay = ref(1200);
const failNextUpload = ref(false);
const uploadCount = ref(0);
const content = ref(
  [
    "<h2>调试内容</h2>",
    "<p>这里可以测试源码编辑、图片自定义宽高、一键排版、全屏，以及图片/视频/附件上传进度。</p>",
    '<p><img src="https://www.wangeditor.com/demo/demo.png" alt="demo" /></p>',
  ].join(""),
);
const plainTextLength = computed(
  () => content.value.replace(/<[^>]+>/g, "").trim().length,
);

async function mockUpload(
  file: File,
  context: { kind: UploadKind; path: string },
) {
  uploadCount.value += 1;
  await sleep(uploadDelay.value);
  if (failNextUpload.value) {
    failNextUpload.value = false;
    throw new Error("模拟上传失败");
  }
  return {
    url: URL.createObjectURL(file),
    path: context.path,
  };
}

function resetContent() {
  content.value = "<p>内容已重置，可以继续调试。</p>";
}

function sleep(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}
</script>

<style scoped>
.page {
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr);
  min-height: 100vh;
}

.panel {
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 24px;
  background: #fff;
  border-right: 1px solid #e5e7eb;
}

h1 {
  margin: 0 0 8px;
  font-size: 22px;
  line-height: 1.2;
}

p {
  margin: 0;
  font-size: 13px;
  line-height: 1.6;
  color: #6b7280;
}

.field {
  display: grid;
  gap: 8px;
  font-size: 13px;
}

.field select {
  height: 34px;
  padding: 0 10px;
  color: #111827;
  background: #fff;
  border: 1px solid #d1d5db;
  border-radius: 4px;
}

.check {
  display: flex;
  gap: 8px;
  align-items: center;
  font-size: 13px;
}

.stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.stats div {
  padding: 10px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
}

.stats span {
  display: block;
  margin-bottom: 4px;
  font-size: 12px;
  color: #6b7280;
}

.stats strong {
  font-size: 18px;
}

.workspace {
  min-width: 0;
  padding: 24px;
}

.html-preview {
  margin-top: 16px;
  overflow: hidden;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
}

.html-preview header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 38px;
  padding: 0 12px;
  font-size: 13px;
  font-weight: 600;
  border-bottom: 1px solid #e5e7eb;
}

.html-preview button {
  height: 26px;
  padding: 0 10px;
  cursor: pointer;
  background: #fff;
  border: 1px solid #d1d5db;
  border-radius: 4px;
}

pre {
  max-height: 220px;
  padding: 12px;
  margin: 0;
  overflow: auto;
  font-size: 12px;
  line-height: 1.6;
  white-space: pre-wrap;
}
</style>
