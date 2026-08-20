# `@skylarking/dsh-client-ui-workspace-console`

[English](README.md) | 中文

可安装 Sidebar 插件的浏览器 package。它使用通用标签宿主占据 layout 持有的 `shell.rightPanel` 与 `shell.bottomPanel` slot。右侧 Dock 默认打开文件，底部 Dock 默认打开终端；两处使用相同的新增菜单，并保留未激活标签的组件身份。新建的内置视图绑定最近使用的 Workspace，不再渲染第二个 Workspace 选择器；终端标签会用绑定的 Workspace 标题替换 catalog 标题。

该 package 在注册 UI 前挂载 `workspaceConsole` 与 `workspaceFiles` Remote contribution。卸载会移除两个 Dock、入口和已注册视图，关闭布局区域，终止已挂载 PTY，并释放文件浏览状态。

## 视图扩展

一种视图需要向 `workspace-sidebar.view` 提交一个 catalog entry，并向 `workspace-sidebar.right.view` 与 `workspace-sidebar.bottom.view` 提交匹配的 keyed renderer。catalog entry 的 `id` 是分发 key，`label` 是新增菜单文本与默认标签标题。每个 renderer 都会收到 `active` 和 `setTitle`；标签保持挂载但隐藏时，`active` 为 false，`setTitle` 用于替换该标签实例的标题。

先注册两个 keyed renderer，再发布 catalog entry；释放时先移除 catalog，再移除 renderer。Dock 会拒绝缺少任意一个 renderer 的 catalog id。该对称约束保证菜单中的每种视图都能在两个位置打开；后续 Review 插件只需注册这三个 slot，无需修改 Sidebar。

## 模型体验

无，因为该操作界面没有模型可见输出。

#### KV Cache 影响

无。

## 已知限制与暂缓事项

- 视图实例在标签切换时保持，但关闭 Dock 或卸载插件会释放实例。
- 终端专用内部 package 保留 `workspace-console`；可安装项目和 bundle 分别是 `dsh-sidebar` 与 `@skylarking/dsh-sidebar`。
