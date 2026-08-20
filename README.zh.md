# `@skylarking/dsh-sidebar`

[English](README.md) | 中文

DeepSeek Harness Desktop 的可安装 Sidebar 插件。一个插件生命周期同时挂载可调节宽高的右侧与底部 Dock、持久终端与有界文件 Remote，以及对应的浏览器视图。底部 Dock 首次打开终端，右侧 Dock 首次打开文件；两个 Dock 都能从加号菜单新增终端或文件标签，切换标签时不会卸载未激活视图的状态。

在 **设置 > 插件 > 插件列表 > 安装本地插件** 中选择 `plugins/dsh-sidebar`。package 和安装后的插件身份均为 `@skylarking/dsh-sidebar`。

Client package 持有[视图注册 API](packages/client/README.md#view-extension)。终端、文件和后续外部视图都使用同一份 catalog 与 keyed renderer，Dock 布局不导入具体视图实现。

## 安全与限制

两个内置视图都只接受已注册的 Workspace id。文件操作强制限制在 Workspace 内，并限制预览大小。终端以所选 Workspace 为初始目录，但保留 Host 用户的文件系统与进程权限；选择 Workspace 并不构成沙箱。

## 模型体验

无，因为 Sidebar 交互不会改变 prompt、tool、message 或 provider request。

#### KV Cache 影响

无。

## 已知限制与暂缓事项

- 终端输出使用有界轮询，而不是流式 Remote 订阅。
- Dock 标签和尺寸属于瞬时状态；关闭 Dock 会释放其中已挂载的视图实例。
