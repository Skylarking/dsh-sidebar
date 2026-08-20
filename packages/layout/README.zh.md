# `@skylarking/dsh-client-ui-workspace-layout`

[English](README.md) | 中文

Sidebar 插件内置的私有 support package。Sidebar 启用期间，Desktop 会把它安装到 profile-local 的 `@deepseek-ai/dsh-client-ui-layout` dependency key。它保留官方 sidebar、conversation、details、overlay、theme 和 `ctx.layout` 行为，同时增加可调节尺寸的 `shell.rightPanel`、`shell.bottomPanel` 与 `shell.hero.utilities` 区域。

该 package 不能独立管理。停用 Sidebar 会移除 profile-local alias，并恢复 DSH 内置的 layout package。

## 模型体验

无，因为该 package 只改变操作员控制的布局。

#### KV Cache 影响

无。

## 已知限制与暂缓事项

- 该 package 会替换一项 profile-local dependency resolution，因此与 Sidebar 共享插件生命周期。
