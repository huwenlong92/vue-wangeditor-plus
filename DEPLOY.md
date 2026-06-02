# 发布流程

包名：`@zixinit/vue-wangeditor-plus`

## 1. 发布前检查

进入包目录：

```bash
cd /Users/huwenlong/data/lab/vue-wangeditor
```

执行检查和构建：

```bash
pnpm typecheck
pnpm build
pnpm pack
```

`pnpm pack` 会生成本地安装包，例如：

```bash
zixinit-vue-wangeditor-plus-0.1.0.tgz
```

可以先在业务项目里用这个 `.tgz` 测试，确认没问题再发布 npm。

## 2. 首次发布

登录 npm：

```bash
npm login
```

首次发布 scoped 包必须带 `--access public`：

```bash
npm publish --access public
```

发布成功后，业务项目安装：

```bash
pnpm add @zixinit/vue-wangeditor-plus
```

## 3. 日常更新发布

每次重新发布前必须先升级版本号。npm 不允许重复发布同一个版本。

小修复：

```bash
npm version patch
```

新功能：

```bash
npm version minor
```

破坏性变更：

```bash
npm version major
```

然后执行：

```bash
pnpm typecheck
pnpm build
npm publish --access public
```

## 4. Beta 测试版

如果想先发布测试版：

```bash
npm version prerelease --preid beta
pnpm typecheck
pnpm build
npm publish --tag beta --access public
```

业务项目安装 beta：

```bash
pnpm add @zixinit/vue-wangeditor-plus@beta
```

## 5. 业务项目使用

安装正式版：

```bash
pnpm add @zixinit/vue-wangeditor-plus
```

升级到最新正式版：

```bash
pnpm update @zixinit/vue-wangeditor-plus
```

组件引用：

```ts
import WangEditorPlus from "@zixinit/vue-wangeditor-plus";
import "@zixinit/vue-wangeditor-plus/style.css";
```

## 6. 本地 tarball 测试

发布前可以先用本地包在业务项目里验证：

```bash
cd /Users/huwenlong/data/lab/vue-wangeditor
pnpm build
pnpm pack
```

然后到业务项目安装：

```bash
pnpm add /Users/huwenlong/data/lab/vue-wangeditor/zixinit-vue-wangeditor-plus-0.1.0.tgz
```

注意把文件名里的版本号换成当前生成的版本。

## 7. 常见问题

### 发布时报版本已存在

说明当前 `package.json` 里的 `version` 已经发布过。先执行：

```bash
npm version patch
```

再重新发布。

### scoped 包发布失败

确认发布命令带了：

```bash
--access public
```

完整命令：

```bash
npm publish --access public
```

### 不确定当前登录账号

```bash
npm whoami
```

### 查看 npm 上的包信息

```bash
npm view @zixinit/vue-wangeditor-plus
```
