# dsh-balance-monitor

> 一个给 **DeepSeek Harness（DSH）** 使用的余额与 token 消耗监控插件。
>
> 左侧栏钱包入口 + 可拖拽 / 可常驻的悬浮窗，显示 DeepSeek 账户余额、今日与累计 token 用量，以及按可配置单价估算的金额。
>
> 仓库：<https://github.com/Circe5728/dsh-balance-monitor>

---

## 功能概览

### 左侧栏入口

- 位于侧栏底部、账号行上方，与「设置」同一区域。
- 宽栏显示钱包图标 + `余额` + 实时金额；收起为 56px 侧栏时只显示钱包图标。
- 金额读取失败时显示「读取失败」，未登录时显示「未登录」，加载中显示「读取中」。
- 鼠标悬停和读屏标签包含当前状态。

### 悬浮窗

点击侧栏入口展开 / 收起；悬浮窗包含：

| 区域 | 内容 |
| --- | --- |
| 余额总数 | 充值余额 + 赠送余额合计，按币种分别展示（CNY / USD） |
| 余额明细 | 充值余额、赠送余额 |
| 今日消耗 | 今日 token 总量 + 估算金额；输入 / 输出 / 缓存命中 / 缓存写入 / 调用次数 |
| 累计消耗 | 自插件首次记录起的 token 总量 + 估算金额 |
| 页脚 | 最后更新时间、「查看用量明细」链接 |

### 拖拽

- 按住标题栏即可拖动窗口。
- 窗口位置保存在浏览器 `localStorage`，关闭再打开、刷新页面后仍会回到上次位置。
- 双击标题栏可复位到侧栏上方。
- 拖动时自动限制在可视区域内。

### 常驻（Pin）

- 标题栏图钉按钮切换「常驻」。
- 常驻后，点击窗口外或按 `Esc` **不会**关闭窗口。
- 常驻状态与窗口位置一起持久化；重新加载页面后会按常驻状态自动打开。
- 点击关闭按钮会关闭窗口并取消常驻；再次点击图钉可取消常驻。

### 状态处理

- **未登录**：显示提示，引导到「设置 › 账号」登录。
- **余额接口失败**：显示错误码和「重试」按钮；保留上次成功读取的数据。
- **token 统计暂时不可用**：余额仍正常显示，token 卡片单独提示，不影响余额入口。
- **自动刷新**：悬浮窗打开时每 30 秒刷新；关闭时每 5 分钟刷新；页面重新可见时立即刷新。

---

## 工作原理

```text
Host（Node / Cordis）
  llm/stream 瀑布 ──► token 账本（今日 / 累计）
                          │
                          ├─ JSON storage：balance_monitor_v3.json
                          │
                          └─ 认证 RPC：POST /dsh-balance-monitor/snapshot
                                              │
Browser（Client 模块）                        ▼
  remote.account.getBalance / getState / getProfile ──► 余额
  connection.rpc.call ──► usage 快照
                          │
                          └─ store ──► sidebar.footer.action（侧栏入口）
                                       └─ 悬浮窗（React，无 JSX 构建）
```

### 余额

- 通过 Host 的 `remote.account` 命名空间读取当前登录的 DeepSeek 账户：
  - `getState()`：是否已登录、平台链接（用量页 / 充值页）。
  - `getProfile()`：昵称 / 脱敏联系方式，用于悬浮窗副标题；每次页面生命周期只读取一次并缓存。
  - `getBalance()`：充值钱包与赠送钱包；按币种求和得到「余额总数」。
- 渲染层不会接触任何 token、Cookie 或原始凭据。

### Token 用量

- Host 注册 `llm/stream` 瀑布监听器，包住每一次模型调用：
  - 透传所有 chunk，不改变模型输出；
  - 记录本次调用的最后一个 `usage` chunk（大多数 provider 在结束时给出累计值）；
  - 即使流被中止，也会保留已经上报的用量。
- 统计字段：
  - `inputTokens`：未命中缓存的输入 token；
  - `outputTokens`：输出 token；
  - `cacheReadTokens`：缓存命中 token；
  - `cacheWriteTokens`：缓存写入 token；
  - `totalTokens`：provider 给出的总量；缺失时使用 `input + output + cacheRead + cacheWrite`。
- 今日与累计分别累加；今日在 Host 本地日期变化时归零。

### 估算金额

金额是**估算值**，不是平台账单。默认价格（人民币 / 每百万 token）：

| 模型 | 输入 | 缓存命中 | 输出 |
| --- | ---: | ---: | ---: |
| `deepseek-flash` | 0.5 | 0.1 | 2 |
| `deepseek-chat` | 2 | 0.5 | 8 |
| `deepseek-reasoner` | 4 | 1 | 16 |
| 其他模型 | 2 | 0.5 | 8 |

计算方式：

```text
cost = (input × input价 + cacheRead × cacheRead价
        + cacheWrite × input价 + output × output价) / 1,000,000
```

> 不同模型、折扣、赠送额度、平台调价都会让估算与真实扣费有差异。
> 真正准确的余额以上方「余额总数」为准；估算金额仅用于趋势参考。

### 持久化

- Host 使用已挂载的 JSON storage backend，单位名为 `balance_monitor_v3`，版本 3。
- 文件位于 DSH 的 storage 根目录下，通常为：
  - Windows：`%USERPROFILE%\.dsh\storages\balance_monitor_v3.json`
  - 其他平台：`$DSH_HOME/storages/balance_monitor_v3.json`
- 内容是可读 JSON：`today`、`total`、`day`、`since`、`updatedAt`。
- 今日在本地零点后第一次记录 / 读取快照时清零；累计保留。
- 同一天内重启 DSH / 重新加载插件：Host 先从账本恢复 `today` 与 `total`，再返回第一个快照，不会清零今日。
- 浏览器侧只保存窗口状态：
  - `localStorage["dsh-balance-monitor.window.v1"]`
  - 字段：`pinned`、`position { left, top }`。

### RPC 与安全

- 自定义 RPC 路由：`POST /dsh-balance-monitor/snapshot`
- 每个请求先经过 DSH 的 `connection.admit()`：
  - 校验 Host / Origin 信任边界；
  - 校验浏览器会话 Cookie；
  - 未认证请求返回 `401`。
- RPC 只返回聚合后的 token 计数与估算金额，不返回会话内容、消息或凭据。
- 插件不发送遥测，不读取其他插件或页面的数据。

---

## 安装
最简单的DeepSeek Harness或DSH NEXT直接添加插件填入dsh-balance-monitor安装.或者直接让AI帮你直接说，帮我安装这个插件dsh-balance-monitor
### 前置条件

- 一个可用的 DSH profile（Desktop 或 Web）。
- 如需余额显示：已在 DSH「设置 › 账号」登录 DeepSeek 账户。
- 如需 token 统计：当前 DSH 进程中有模型调用（任何会话、子代理、压缩、标题生成都会计入）。

### 方式一：Plugin Manager 本地安装

1. 克隆 / 下载本仓库。
2. 在 DSH 的 **Plugin Manager** 中选择从本地目录安装 bundle，指向本仓库根目录（包含 `package.json` 和 `cordis.patch.yml`）。
3. 安装后确认左侧栏底部出现「余额」入口。
对应 CLI / 自动化方式（以 DSH 的 plugin manager API 为准）：

```text
install_bundle  target = <绝对路径>/dsh-balance-monitor
```

### 方式二：作为 profile bundle

把本目录加入 profile 的 bundle 列表，并在 `cordis.patch.yml` 中插入：

```yaml
- insert:
    - id: balance-monitor
      name: '@local/dsh-balance-monitor'
      config: {}
```

> 本插件没有构建步骤：Host 是普通 ESM，Client 是 `window.__ModuleLoader__.load` 形式的普通 JS 工厂。

### 关于 Host 代码更新

DSH 的 HMR 对 **Host 模块**采用“改动模块保持旧代码直到重启”的策略。修改 `index.js` 后：

- 仅切换插件 bundle / 重新安装 **不会** 加载新的 Host 代码；
- 需要重启 DSH，或在开发时使用一个新的包名加载新模块。
- Client 侧 `client.js` 的纯前端改动通常可以通过页面刷新 / HMR 生效。

---

## 配置

插件没有独立的设置页；可在 bundle 行的 `config` 中覆盖价格（可选）：

```yaml
- id: balance-monitor
  config:
    prices:
      deepseek-flash:
        input: 0.5
        cacheRead: 0.1
        output: 2
      my-model:
        input: 1
        cacheRead: 0.2
        output: 4
```

- 单位：人民币元 / 每百万 token。
- `cacheWrite` 按 `input` 价格计算。
- 未列出的模型使用 `default`（2 / 0.5 / 8）。
- 价格只在**新的用量记录**写入时使用；修改价格不会重算历史账本。

当前版本中，刷新频率为代码内常量：

- 悬浮窗打开：30 秒
- 悬浮窗关闭：5 分钟
- 页面重新可见：立即刷新

---

## 数据口径与限制

- **余额**：平台真实余额（充值 + 赠送），按币种分别求和；不是估算。
- **今日 / 累计 token**：provider 实际返回的 usage 累计；包含子代理、压缩、标题生成等所有经过 `llm/stream` 的调用。
- **估算金额**：按上表单价估算，**不是**平台账单；不包含折扣、赠送额度、调价、充值赠送等。
- **今日**：Host 本地时区日期；跨零点后第一次记录 / 读取快照时归零。
- **重启**：同一天内重启 DSH / 重新加载插件不会清零今日；Host 会等账本加载完再返回第一个快照。跨日重启仍按新的一天归零。
- **未登录 / 网络不可达**：余额显示错误或「未登录」；token 统计是 Host 本地的，仍可显示（只要 Host 在运行）。
- **Provider 未返回 usage**：该次调用不会计入 token；不会凭空估算 token。
- **首次安装**：今日与累计从安装后第一次模型调用开始累计；不会回溯安装前的历史。
- **多账号切换**：余额会随当前登录账号变化；token 账本是进程级的，不按账号拆分。
- **平台没有公开的用量 / 账单 API**：因此本插件使用「provider token 实际用量 + 可配置单价」作为消耗口径；平台真实余额作为对照。

---

## 文件结构

```text
dsh-balance-monitor/
├─ package.json          # bundle + dsh.client 声明
├─ cordis.patch.yml      # 插入 balance-monitor 行
├─ index.js              # Host：token 账本、JSON 持久化、认证 RPC
├─ client.js             # Client：侧栏入口、悬浮窗、拖拽 / 常驻
├─ locale/
│  ├─ zh.json            # Plugin Manager 中文标题 / 描述
│  └─ en.json            # Plugin Manager 英文标题 / 描述
├─ icon.svg              # 插件图标
├─ README.md
└─ LICENSE
```

---

## 开发与验证

### 本地开发

- 无构建、无依赖安装；直接修改 `index.js` / `client.js`。
- Client 是浏览器 factory 形式，React 来自 DSH 的共享模块表，不需要额外安装 React。
- Host 只使用 DSH 已提供的服务：
  - `ctx.on('llm/stream', ...)`
  - `ctx.inject(['storage'], ...)`
  - `ctx.inject(['webServer', 'connection'], ...)`
  - `connection.admit(req)` 做认证

### 验证清单

- [x] `plugin_manager install_bundle` 返回 `application: applied`
- [x] `sidebar.footer.action` 中出现 active 的 `balance-monitor` 入口
- [x] 侧栏入口显示实时余额
- [x] 悬浮窗显示余额总数、充值 / 赠送余额
- [x] 今日 / 累计 token 与输入 / 输出 / 缓存命中 / 调用次数一致
- [x] 估算金额按配置单价计算
- [x] 账本写入 `balance_monitor_v3.json`
- [x] 拖拽移动窗口；关闭再打开保持位置
- [x] 常驻后点击外部不关闭；取消常驻后点击外部关闭
- [x] 双击标题复位
- [x] 登录失效 / 余额失败时显示错误与重试
- [x] 未认证 RPC 返回 401

---

## English summary

A DeepSeek Harness plugin that adds a wallet entry at the sidebar foot and a draggable, pinnable floating window showing the account balance, today's and cumulative token usage (input / output / cache reads / cache writes / calls) and an estimated cost.

The Host half observes the `llm/stream` waterfall, keeps a daily and cumulative token ledger, persists it through the JSON storage backend, and exposes it over an authenticated Connection RPC route. The browser half reads the signed-in account balance through the existing `remote.account` namespace, fetches the token snapshot, and renders the sidebar entry and floating window with the Harness theme tokens. No secrets enter the renderer, no telemetry is sent, and no build step is required.

---

## License

MIT
