# GenUI Web App Sandbox Scaffold

本仓库根目录是可复用的 React/Vite 脚手架，已替换原来的单独依赖清单。
来源：桌面 `openclaw-webapp-kit` 的 `xiaoyiclaw` 分支 scaffold。

包含 180 个直接依赖（129 个运行依赖、51 个开发依赖），覆盖 UI、图表、地图、
动画、3D、字体、文件导出、存储和测试工具。`pnpm-lock.yaml` 固定传递依赖；
`vendor/` 携带三个真实本地 SDK，无需私有 npm registry 凭据。

## 下载包含 node_modules 的完整目录

[下载完整 scaffold](https://github.com/zjing0329/genui-web-app-sandbox-dependencies/releases/latest/download/scaffold-linux-amd64.tar.gz)
及 [SHA-256 校验文件](https://github.com/zjing0329/genui-web-app-sandbox-dependencies/releases/latest/download/SHA256SUMS)。

该包解压后得到 `scaffold/`，包含真实的 `node_modules/.pnpm`、应用源文件、
`package.json`、锁文件和 SDK，约 1.6 GB 磁盘空间。它针对 **Linux amd64、glibc、
Node 22.14.0** 构建，使用 pnpm 9.15.9。Node、Chromium 和系统库仍需由镜像提供。
Mac、ARM64 和 Alpine/musl 应在各自目标平台重新安装。

下载两个文件到同一目录，然后运行：

```sh
sha256sum -c SHA256SUMS
# macOS 可使用 shasum -a 256 -c SHA256SUMS 校验，但不能运行这份 Linux 原生工具。
tar -xzf scaffold-linux-amd64.tar.gz
cd scaffold
npm run type-check
npm run lint
npm run build
```

通过 tar 或 `cp -a` 复制整个目录，保留隐藏目录、相对符号链接和可执行权限。
不要只复制顶层包链接或使用解引用复制。解压包可直接作为任务镜像的 COPY 输入。
首次构建会初始化该副本的数据 app ID；后续构建保持稳定。

## 从 Git 源码安装

Git 仓库存放源码、锁文件与 SDK；预装 node_modules 放在 Release 中。
GitHub 自动生成的 Source code zip/tar.gz 不含预装依赖，请下载上面命名的附件。

在目标平台安装 Node 与 pnpm 9.15.9 后，从仓库根目录执行：

```sh
pnpm install --frozen-lockfile --strict-peer-dependencies
pnpm run type-check
pnpm run lint
pnpm run build
```

React/DOM 为 19.2.8，Vite 7.3.6，TypeScript 6.0.3，Tailwind 4.3.3，Vitest 4.1.2。
保留 React 19.2 补丁范围以满足 Three/Fiber peers，Node 类型匹配 22 系列，
不重复安装已自带类型的库的旧 `@types` 包。具体安装版本及锁文件 SHA-256 见
`scaffold-runtime.json`，SDK 来源与版本见 `vendor/README.md`。

这是一套通用应用开发环境，不会同时替换其他独立场景的框架版本。应用默认
使用 OpenClaw data 的 Dexie/IndexedDB 接口；预装云 SDK 不代表配置了云服务。
该 scaffold 保留应用占位界面，使用者需实现实际功能。

## 验证

依赖目录已通过冻结锁安装、严格 peer 检查和逐包版本核验。经 webkit 实际生成
项目并移动目录后，在断网、没有外部 pnpm store 的 Linux amd64 容器中通过
类型检查、lint、Vite 构建，以及 SDK/常用库功能检查。
