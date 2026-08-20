# Agent Note: Sidebar Dock 视图注册表

Status: implemented

## Problem

Workspace 终端和文件浏览器分别占有一个固定布局位置，因此操作员无法在另一个位置打开相同功能。增加新的 Workspace 视图也需要再次编写面板集成和标签行为。

## Decision

可安装的 `@skylarking/dsh-sidebar` bundle 同时持有两个辅助布局区域、两个内置 Remote 和一个 Client package。两个区域使用同一种通用标签模型，同时保留各自的标签实例与默认选择。

一种视图需要在 `workspace-sidebar.view` 注册 list entry，并在 `workspace-sidebar.right.view` 与 `workspace-sidebar.bottom.view` 注册匹配的 keyed renderer。list entry 发布菜单元数据和默认标签标题；keyed entry 渲染一个标签实例，接收其 active 状态，并可替换该实例的标题。catalog 是提交点：两个 renderer 齐备前，Sidebar 会拒绝已发布的 id。

终端和文件是该 API 的内置注册。每个新实例绑定最近使用的 Workspace，不再显示第二个 Workspace 选择器。终端用绑定的 Workspace 标题替换标签标题；文件保留 catalog 标题。其他插件无需修改 Dock 宿主或 layout package 即可增加视图。

bundle patch 只插入终端 Host、Files Host 和 Client package，不覆盖 `ui-sidebar`；内置 layout 在辅助 Dock 之外继续渲染官方 `sidebar` slot。

## Alternatives considered

**把布局与 Workspace 功能作为不同插件安装。** 这种方式允许独立发布，但依赖只有一个方向有意义：功能插件没有布局插件就无法渲染，而布局插件单独安装只会暴露空 Dock。一个安装 bundle 为用户提供原子生命周期，内部 package 仍保留角色分离。

**继续让每种功能占有一个固定 slot。** 这种方式改动最小，但会把位置固化在功能内部，并要求后续每种视图重复标签行为。

**在两个 Dock 之间移动同一个已挂载 renderer。** 这种方式可以保留单一实例，但无法同时在两个位置创建终端或文件标签，并增加移动时的所有权复杂度。

## Consequences

catalog 中的每种视图都能在两个 Dock 位置使用，未激活标签保持挂载。关闭 Dock 或卸载 Sidebar 会释放其中的视图实例，包括终止 PTY。bundle 内置 layout support 与 Files Host；`plugins/` 下的兼容路径使父仓库 TypeScript 引用保持有效，无需修改 Desktop 产品代码。
