# Changelog

## v1.0.0 — 2026-11-08

首个公开版本。

### Added

- 左侧栏底部钱包入口，显示实时 DeepSeek 账户余额；宽栏显示金额，收起栏显示图标。
- 悬浮窗：余额总数、充值余额、赠送余额，支持 CNY / USD 多币种。
- 今日与累计 token 消耗：输入、输出、缓存命中、缓存写入、调用次数。
- 按可配置单价估算金额（默认支持 `deepseek-flash` / `deepseek-chat` / `deepseek-reasoner`）。
- 拖拽标题栏移动窗口；位置持久化；双击标题复位。
- 图钉「常驻」：点击外部 / Esc 不关闭；常驻状态与位置持久化。
- 自动刷新：悬浮窗打开 30 秒、关闭 5 分钟、页面重新可见时立即刷新。
- Host 端 `llm/stream` token 账本，JSON storage 持久化为 `balance_monitor_v3`。
- 认证 RPC：`POST /dsh-balance-monitor/snapshot`，未认证请求返回 401。
- 未登录、余额失败、token 统计不可用等状态的界面提示与重试。
- 中文 / 英文 Plugin Manager 标题、描述与本地化界面文案。
- 详细中文 README 与 MIT License。

### Notes

- 余额来自 DeepSeek 平台真实账户；估算金额不是平台账单，存在折扣、赠送、调价等差异。
- 首次安装后从第一次模型调用开始统计，不回溯安装前历史。
- Host 侧代码变更需要重启 DSH 才能加载；Client 侧可通过页面刷新 / HMR 生效。
- 未发布到 npm；通过 GitHub Release 的 `.tgz` / `.zip` 或仓库源码安装。
