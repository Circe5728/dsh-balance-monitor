window.__ModuleLoader__.load({
  id: '@local/dsh-balance-monitor',
  factory(require) {
    const React = require('react');
    const h = React.createElement;

    const NS = 'balance-monitor';
    const CLIENT_VERSION = '0.2.1';
    const RPC_CHANNEL = '/dsh-balance-monitor';
    const WINDOW_KEY = 'dsh-balance-monitor.window.v1';
    const PANEL_WIDTH = 336;
    const REFRESH_OPEN_MS = 30000;
    const REFRESH_CLOSED_MS = 300000;

    const zh = {
      'entry.label': '余额',
      'entry.aria': '余额与消耗',
      'entry.loading': '读取中',
      'entry.offline': '读取失败',
      'entry.signedOut': '未登录',
      'panel.title': '余额与消耗',
      'panel.subtitle': 'DeepSeek 账户',
      'panel.close': '关闭',
      'panel.refresh': '刷新',
      'panel.pin': '常驻',
      'panel.unpin': '取消常驻',
      'panel.dragHint': '拖动窗口；双击标题复位',
      'panel.loading': '正在读取余额…',
      'panel.signedOutTitle': '尚未登录 DeepSeek 账号',
      'panel.signedOutHint': '请先在「设置 › 账号」中登录，再回到这里查看余额与消耗。',
      'panel.errorTitle': '余额读取失败',
      'panel.errorHint': '请检查网络或账号状态后重试。',
      'panel.retry': '重试',
      'panel.total': '余额总数',
      'panel.recharge': '充值余额',
      'panel.bonus': '赠送余额',
      'panel.today': '今日消耗',
      'panel.totalSpent': '累计消耗',
      'panel.input': '输入',
      'panel.output': '输出',
      'panel.cacheRead': '缓存命中',
      'panel.cacheWrite': '缓存写入',
      'panel.calls': '调用',
      'panel.usageHint': '按模型返回的 token 用量统计；金额按 DeepSeek 单价估算。',
      'panel.usageMemoryOnly': '记账只保存在本次运行内',
      'panel.usageUnavailable': 'token 统计暂不可用',
      'panel.usageLoading': '正在读取 token 统计…',
      'panel.since': '自 {time} 起',
      'panel.updated': '更新于 {time}',
      'panel.updatedNever': '尚未更新',
      'panel.unknown': '—',
      'panel.usage': '查看用量明细',
      'panel.refreshFailed': '刷新失败，当前显示上次读取的数据。',
      'panel.balanceFailed': '平台返回了失败状态',
      'panel.remoteFailed': '无法连接本地服务',
    };

    const en = {
      'entry.label': 'Balance',
      'entry.aria': 'Balance and consumption',
      'entry.loading': 'Loading',
      'entry.offline': 'Offline',
      'entry.signedOut': 'Signed out',
      'panel.title': 'Balance & Consumption',
      'panel.subtitle': 'DeepSeek account',
      'panel.close': 'Close',
      'panel.refresh': 'Refresh',
      'panel.pin': 'Keep open',
      'panel.unpin': 'Stop keeping open',
      'panel.dragHint': 'Drag the window; double-click the title to reset',
      'panel.loading': 'Reading balance…',
      'panel.signedOutTitle': 'Not signed in to DeepSeek',
      'panel.signedOutHint': 'Sign in from Settings › Account, then come back here to see your balance and consumption.',
      'panel.errorTitle': 'Could not read the balance',
      'panel.errorHint': 'Check your network or account state and try again.',
      'panel.retry': 'Retry',
      'panel.total': 'Total balance',
      'panel.recharge': 'Top-up balance',
      'panel.bonus': 'Bonus balance',
      'panel.today': 'Today',
      'panel.totalSpent': 'Total spent',
      'panel.input': 'Input',
      'panel.output': 'Output',
      'panel.cacheRead': 'Cache hits',
      'panel.cacheWrite': 'Cache writes',
      'panel.calls': 'Calls',
      'panel.usageHint': 'Measured from the token usage each model call reports; amounts are estimated with DeepSeek prices.',
      'panel.usageMemoryOnly': 'This ledger lives only for the current Host run',
      'panel.usageUnavailable': 'Token statistics are unavailable',
      'panel.usageLoading': 'Reading token statistics…',
      'panel.since': 'Since {time}',
      'panel.updated': 'Updated {time}',
      'panel.updatedNever': 'Not updated yet',
      'panel.unknown': '—',
      'panel.usage': 'Usage details',
      'panel.refreshFailed': 'Refresh failed; showing the last reading.',
      'panel.balanceFailed': 'The platform returned a failure state',
      'panel.remoteFailed': 'Cannot reach the local service',
    };

    const CSS = `
.bm-layer{flex:none;align-items:center;width:100%;height:42px;margin:8px 0 0;display:flex;position:relative}
.bm-layer.bm-rail{width:36px;height:36px;margin:0}
.bm-button{box-sizing:border-box;width:100%;height:42px;margin:0 -2px;padding:0 10px 0 8px;display:inline-flex;align-items:center;gap:8px;border:0;border-radius:12px;background:transparent;color:var(--dsw-alias-label-primary);font-family:inherit;font-size:14px;line-height:20px;cursor:pointer;overflow:hidden}
.bm-button:hover,.bm-button[data-active]{background:color-mix(in srgb,var(--dsw-alias-label-primary) 8%,transparent)}
.bm-button:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:-2px}
.bm-rail .bm-button{width:36px;height:36px;padding:0;justify-content:center;border-radius:50%}
.bm-label{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.bm-amount{margin-left:auto;flex:none;max-width:52%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--dsw-alias-label-secondary);font-size:12px;line-height:16px;font-variant-numeric:tabular-nums}
.bm-panel{box-sizing:border-box;position:fixed;z-index:60;width:${PANEL_WIDTH}px;max-width:calc(100vw - 16px);max-height:min(74vh,640px);display:flex;flex-direction:column;overflow:hidden;border:1px solid var(--dsw-alias-border-l1);border-radius:14px;background:var(--dsw-alias-bg-overlay);box-shadow:var(--dsw-elevation-prominent,0 18px 48px rgba(0,0,0,.22));color:var(--dsw-alias-label-primary);text-align:left}
.bm-head{flex:none;display:flex;align-items:flex-start;justify-content:space-between;gap:12px;padding:14px 14px 10px;cursor:grab;user-select:none;touch-action:none}
.bm-head[data-dragging]{cursor:grabbing}
.bm-headText{min-width:0}
.bm-title{font-size:14px;font-weight:600;line-height:20px}
.bm-sub{margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--dsw-alias-label-secondary);font-size:11px;line-height:16px}
.bm-headActions{flex:none;display:flex;gap:2px;cursor:default}
.bm-iconButton{width:26px;height:26px;padding:0;display:inline-flex;align-items:center;justify-content:center;border:0;border-radius:7px;background:transparent;color:var(--dsw-alias-label-secondary);cursor:pointer}
.bm-iconButton:hover{background:color-mix(in srgb,var(--dsw-alias-label-primary) 8%,transparent);color:var(--dsw-alias-label-primary)}
.bm-iconButton:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:-2px}
.bm-pin[data-active]{color:var(--dsw-alias-brand-primary)}
.bm-body{flex:1;min-height:0;padding:0 14px 14px;overflow-y:auto}
.bm-totalCard{padding:14px;border:1px solid color-mix(in srgb,var(--dsw-alias-brand-primary) 24%,var(--dsw-alias-border-l1));border-radius:12px;background:color-mix(in srgb,var(--dsw-alias-brand-primary) 7%,var(--dsw-alias-bg-overlay))}
.bm-cardLabel{color:var(--dsw-alias-label-secondary);font-size:12px;line-height:16px}
.bm-totalValue{margin-top:4px;font-size:28px;line-height:34px;font-weight:600;letter-spacing:-.02em;font-variant-numeric:tabular-nums;word-break:break-all}
.bm-otherTotals{margin-top:2px;display:flex;flex-wrap:wrap;gap:8px}
.bm-otherTotal{color:var(--dsw-alias-label-secondary);font-size:11px;line-height:16px;font-variant-numeric:tabular-nums}
.bm-rows{margin-top:10px;display:flex;flex-direction:column;gap:6px}
.bm-row{display:flex;align-items:baseline;justify-content:space-between;gap:12px;font-size:12px;line-height:18px}
.bm-rowLabel{color:var(--dsw-alias-label-secondary)}
.bm-rowValue{font-variant-numeric:tabular-nums;white-space:nowrap}
.bm-usageCard{margin-top:10px;padding:12px 14px;border:1px solid var(--dsw-alias-border-l1);border-radius:12px}
.bm-usageHead{display:flex;align-items:baseline;justify-content:space-between;gap:12px}
.bm-usageValue{font-size:20px;line-height:26px;font-weight:600;font-variant-numeric:tabular-nums;white-space:nowrap}
.bm-usageUnit{font-size:11px;font-weight:400;color:var(--dsw-alias-label-secondary)}
.bm-usageMoney{margin-top:2px;color:var(--dsw-alias-label-secondary);font-size:11px;line-height:16px;font-variant-numeric:tabular-nums}
.bm-usageUnavailable{margin-top:8px;color:var(--dsw-alias-label-secondary);font-size:11px;line-height:16px}
.bm-spentSub{margin-top:8px;display:flex;align-items:baseline;justify-content:space-between;gap:12px;color:var(--dsw-alias-label-secondary);font-size:11px;line-height:16px}
.bm-hint{margin-top:8px;color:var(--dsw-alias-label-secondary);font-size:11px;line-height:16px}
.bm-foot{margin-top:10px;display:flex;align-items:center;justify-content:space-between;gap:8px;color:var(--dsw-alias-label-secondary);font-size:11px;line-height:16px}
.bm-link{padding:0;border:0;background:transparent;color:var(--dsw-alias-brand-primary);font:inherit;cursor:pointer}
.bm-link:hover{text-decoration:underline}
.bm-link:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px}
.bm-banner{margin-bottom:10px;padding:7px 10px;border:1px solid color-mix(in srgb,var(--dsw-alias-state-error-primary) 32%,var(--dsw-alias-border-l1));border-radius:8px;color:var(--dsw-alias-state-error-primary);font-size:11px;line-height:16px}
.bm-state{padding:18px 4px 12px;text-align:center}
.bm-stateIcon{display:flex;justify-content:center;margin-bottom:10px;color:var(--dsw-alias-label-secondary)}
.bm-stateTitle{font-size:13px;font-weight:500;line-height:20px}
.bm-stateHint{margin-top:6px;color:var(--dsw-alias-label-secondary);font-size:11px;line-height:17px}
.bm-stateCode{margin-top:4px;color:var(--dsw-alias-label-secondary);font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:10px;line-height:14px;opacity:.75;word-break:break-all}
.bm-action{margin-top:12px;height:28px;padding:0 14px;border:1px solid var(--dsw-alias-border-l1);border-radius:8px;background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:12px;cursor:pointer}
.bm-action:hover{background:color-mix(in srgb,var(--dsw-alias-label-primary) 8%,transparent)}
.bm-action:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px}
.bm-spin{animation:bm-spin .9s linear infinite}
@keyframes bm-spin{to{transform:rotate(360deg)}}
@media (prefers-reduced-motion:reduce){.bm-spin{animation:none}}
`;

    function readLocale(ctx) {
      try {
        const snapshot = ctx.locale.getSnapshot();
        if (snapshot && typeof snapshot.active === 'string' && snapshot.active.length > 0) return snapshot.active;
      } catch (_error) {
        // Fall through to the default below.
      }
      return 'zh';
    }

    function numberValue(value) {
      const number = Number(value);
      return Number.isFinite(number) && number > 0 ? number : 0;
    }

    function roundMoney(value) {
      return Math.round(value * 1e6) / 1e6;
    }

    function formatMoney(value, currency) {
      if (currency === null || currency === undefined) return '—';
      if (value === null || value === undefined || !Number.isFinite(Number(value))) return '—';
      const amount = Number(value);
      const symbol = currency === 'CNY' ? '¥' : currency === 'USD' ? '$' : `${currency} `;
      const magnitude = Math.abs(amount);
      if (magnitude > 0 && magnitude < 0.01) return `${amount < 0 ? '-' : ''}${symbol}<0.01`;
      let text;
      try {
        text = new Intl.NumberFormat(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
      } catch (_error) {
        text = amount.toFixed(2);
      }
      return `${symbol}${text}`;
    }

    function formatTokens(value) {
      const number = numberValue(value);
      if (number < 1000) return String(Math.round(number));
      try {
        return new Intl.NumberFormat(undefined, { notation: 'compact', maximumFractionDigits: 1 }).format(number);
      } catch (_error) {
        return `${Math.round(number / 100) / 10}K`;
      }
    }

    function formatTime(timestamp) {
      if (!timestamp) return '';
      try {
        return new Date(timestamp).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      } catch (_error) {
        return '';
      }
    }

    function formatDateTime(timestamp) {
      if (!timestamp) return '';
      try {
        return new Date(timestamp).toLocaleString(undefined, { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
      } catch (_error) {
        return '';
      }
    }

    function readWindowState() {
      try {
        const raw = window.localStorage.getItem(WINDOW_KEY);
        if (raw === null) return { pinned: false, position: null };
        const parsed = JSON.parse(raw);
        if (parsed === null || typeof parsed !== 'object') return { pinned: false, position: null };
        let position = null;
        if (parsed.position !== null && typeof parsed.position === 'object'
          && Number.isFinite(parsed.position.left) && Number.isFinite(parsed.position.top)) {
          position = { left: parsed.position.left, top: parsed.position.top };
        }
        return { pinned: parsed.pinned === true, position };
      } catch (_error) {
        return { pinned: false, position: null };
      }
    }

    function writeWindowState(state) {
      try {
        window.localStorage.setItem(WINDOW_KEY, JSON.stringify({
          version: 1,
          pinned: state.pinned === true,
          position: state.position !== null && state.position !== undefined
            && Number.isFinite(state.position.left) && Number.isFinite(state.position.top)
            ? { left: state.position.left, top: state.position.top }
            : null,
        }));
      } catch (_error) {
        // Storage failures only lose the remembered window geometry.
      }
    }

    function walletIcon(size) {
      return h('svg', {
        width: size, height: size, viewBox: '0 0 24 24', fill: 'none',
        'aria-hidden': true, focusable: false,
      },
      h('path', {
        d: 'M4 7.5A2.5 2.5 0 0 1 6.5 5H18a2 2 0 0 1 2 2v1.5',
        stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round',
      }),
      h('path', {
        d: 'M4 7.5v9A2.5 2.5 0 0 0 6.5 19H19a1 1 0 0 0 1-1v-7a1 1 0 0 0-1-1H6.5A2.5 2.5 0 0 1 4 7.5Z',
        stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round',
      }),
      h('circle', { cx: 16, cy: 14.5, r: 1, fill: 'currentColor' }));
    }

    function refreshIcon(size, spinning) {
      return h('svg', {
        width: size, height: size, viewBox: '0 0 24 24', fill: 'none',
        'aria-hidden': true, focusable: false, className: spinning ? 'bm-spin' : undefined,
      },
      h('path', {
        d: 'M20 12a8 8 0 1 1-2.34-5.66M20 4v4h-4',
        stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round',
      }));
    }

    function closeIcon(size) {
      return h('svg', {
        width: size, height: size, viewBox: '0 0 24 24', fill: 'none',
        'aria-hidden': true, focusable: false,
      },
      h('path', {
        d: 'M6 6l12 12M18 6L6 18',
        stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round',
      }));
    }

    function pinIcon(size, active) {
      return h('svg', {
        width: size, height: size, viewBox: '0 0 24 24', fill: 'none',
        'aria-hidden': true, focusable: false,
      },
      h('path', {
        d: 'M9 3h6l-1 5 4 4v1H6v-1l4-4-1-5Z',
        stroke: 'currentColor', strokeWidth: 1.6, strokeLinejoin: 'round',
        fill: active ? 'currentColor' : 'none', fillOpacity: active ? 0.18 : 0,
      }),
      h('path', {
        d: 'M12 13v7',
        stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round',
      }));
    }

    function externalIcon(size) {
      return h('svg', {
        width: size, height: size, viewBox: '0 0 24 24', fill: 'none',
        'aria-hidden': true, focusable: false,
      },
      h('path', {
        d: 'M14 4h6v6M20 4l-9 9M18 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4',
        stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round',
      }));
    }

    function spinnerIcon(size) {
      return h('svg', {
        width: size, height: size, viewBox: '0 0 24 24', fill: 'none',
        'aria-hidden': true, focusable: false, className: 'bm-spin',
      },
      h('circle', { cx: 12, cy: 12, r: 8, stroke: 'currentColor', strokeWidth: 2, strokeOpacity: 0.25 }),
      h('path', { d: 'M20 12a8 8 0 0 0-8-8', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' }));
    }

    function errorIcon(size) {
      return h('svg', {
        width: size, height: size, viewBox: '0 0 24 24', fill: 'none',
        'aria-hidden': true, focusable: false,
      },
      h('circle', { cx: 12, cy: 12, r: 8.5, stroke: 'currentColor', strokeWidth: 1.7 }),
      h('path', { d: 'M12 7.5v5.5M12 16.5h.01', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round' }));
    }

    function signedOutIcon(size) {
      return h('svg', {
        width: size, height: size, viewBox: '0 0 24 24', fill: 'none',
        'aria-hidden': true, focusable: false,
      },
      h('circle', { cx: 12, cy: 8.5, r: 3.5, stroke: 'currentColor', strokeWidth: 1.7 }),
      h('path', {
        d: 'M5 20a7 7 0 0 1 10.2-6.2M17 17v4M15 19h4',
        stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round',
      }));
    }

    function totalWallets(normal, bonus) {
      const totals = {};
      for (const list of [normal, bonus]) {
        if (!Array.isArray(list)) continue;
        for (const wallet of list) {
          if (wallet === null || typeof wallet !== 'object') continue;
          const amount = Number(wallet.balance);
          if (!Number.isFinite(amount)) continue;
          const currency = typeof wallet.currency === 'string' ? wallet.currency : 'CNY';
          totals[currency] = roundMoney((totals[currency] || 0) + amount);
        }
      }
      return totals;
    }

    function sumWallets(list) {
      const totals = {};
      if (!Array.isArray(list)) return totals;
      for (const wallet of list) {
        if (wallet === null || typeof wallet !== 'object') continue;
        const amount = Number(wallet.balance);
        if (!Number.isFinite(amount)) continue;
        const currency = typeof wallet.currency === 'string' ? wallet.currency : 'CNY';
        totals[currency] = roundMoney((totals[currency] || 0) + amount);
      }
      return totals;
    }

    function choosePrimary(totals) {
      const currencies = Object.keys(totals || {});
      if (currencies.length === 0) return null;
      if (Object.prototype.hasOwnProperty.call(totals, 'CNY')) return 'CNY';
      if (Object.prototype.hasOwnProperty.call(totals, 'USD')) return 'USD';
      return currencies[0];
    }

    function createStore(ctx) {
      let snapshot = {
        phase: 'loading',
        refreshing: false,
        wallets: [],
        bonusWallets: [],
        totals: {},
        updatedAt: 0,
        error: null,
        profile: null,
        usageUrl: '',
        usage: null,
        usageError: null,
        usageRefreshing: false,
      };
      const listeners = new Set();
      let balanceInFlight = null;
      let usageInFlight = null;
      let generation = 0;
      let disposed = false;
      let timer = null;
      let startupRetryTimer = null;
      let visibilityHandler = null;
      let cachedProfile = null;
      let profileInFlight = null;

      const publish = (patch) => {
        snapshot = { ...snapshot, ...patch };
        for (const listener of [...listeners]) listener();
      };

      const metadata = () => ({
        version: CLIENT_VERSION,
        locale: readLocale(ctx),
        timezoneOffsetSeconds: -new Date().getTimezoneOffset() * 60,
      });

      const failBalance = (code, detail) => {
        const hasData = Object.keys(snapshot.totals || {}).length > 0;
        publish({
          phase: hasData ? 'ready' : 'error',
          refreshing: false,
          error: { code: code || 'unknown', detail: detail || '' },
        });
      };

      const refreshBalance = () => {
        if (disposed) return Promise.resolve();
        if (balanceInFlight !== null) return balanceInFlight;
        const issued = generation;
        publish({ refreshing: true });
        const request = (async () => {
          try {
            let profileRequest = null;
            if (cachedProfile === null) {
              if (profileInFlight === null) {
                try {
                  profileInFlight = ctx.remote.account.getProfile(metadata()).catch(() => null);
                } catch (_error) {
                  profileInFlight = null;
                }
              }
              profileRequest = profileInFlight;
            }
            const [stateResult, balanceResult] = await Promise.all([
              ctx.remote.account.getState(),
              ctx.remote.account.getBalance(metadata()),
            ]);
            if (disposed || issued !== generation) return;
            if (!stateResult.ok || !balanceResult.ok) {
              const failure = !stateResult.ok ? stateResult.error : balanceResult.error;
              failBalance(failure !== null && failure !== undefined && failure.code ? failure.code : 'remote-failed');
              return;
            }
            const state = stateResult.value;
            const balance = balanceResult.value;
            if (state === null || state === undefined || state.status !== 'credential-stored' || balance === null) {
              cachedProfile = null;
              publish({
                phase: 'signed-out',
                refreshing: false,
                wallets: [],
                bonusWallets: [],
                totals: {},
                updatedAt: Date.now(),
                error: null,
                profile: null,
                usageUrl: state !== null && state !== undefined && state.links ? state.links.usageUrl : '',
              });
              return;
            }
            if (balance.status !== 'ready') {
              failBalance('account/balance-failed');
              return;
            }
            const totals = totalWallets(balance.value, balance.bonusWallets);
            publish({
              phase: 'ready',
              refreshing: false,
              wallets: Array.isArray(balance.value) ? balance.value : [],
              bonusWallets: Array.isArray(balance.bonusWallets) ? balance.bonusWallets : [],
              totals,
              updatedAt: Date.now(),
              error: null,
              profile: cachedProfile,
              usageUrl: state.links ? state.links.usageUrl : '',
            });
            if (profileRequest !== null) {
              profileRequest.then((result) => {
                if (disposed || issued !== generation) return;
                if (result !== null && result !== undefined && result.ok && result.value !== null
                  && result.value !== undefined && result.value.status === 'ready') {
                  if (snapshot.phase === 'signed-out') return;
                  cachedProfile = result.value.value;
                  publish({ profile: cachedProfile });
                }
              }).catch(() => {}).finally(() => {
                if (profileInFlight === profileRequest) profileInFlight = null;
              });
            }
          } catch (error) {
            if (disposed || issued !== generation) return;
            failBalance('client-exception', error !== null && error !== undefined && error.message ? error.message : String(error));
          } finally {
            if (issued === generation) balanceInFlight = null;
          }
        })();
        balanceInFlight = request;
        return request;
      };

      const refreshUsage = () => {
        if (disposed) return Promise.resolve();
        if (usageInFlight !== null) return usageInFlight;
        const issued = generation;
        publish({ usageRefreshing: true });
        const request = (async () => {
          try {
            const result = await ctx.connection.rpc.call(RPC_CHANNEL, 'snapshot', null);
            if (disposed || issued !== generation) return;
            if (result === null || result === undefined || result.ok !== true) {
              const code = result !== null && result !== undefined && result.error
                ? result.error.code || 'rpc-failed'
                : 'rpc-failed';
              publish({ usageRefreshing: false, usageError: code });
              return;
            }
            const value = result.value;
            if (value === null || typeof value !== 'object'
              || value.today === null || typeof value.today !== 'object'
              || value.total === null || typeof value.total !== 'object') {
              publish({ usageRefreshing: false, usageError: 'invalid-snapshot' });
              return;
            }
            publish({ usageRefreshing: false, usageError: null, usage: value });
          } catch (error) {
            if (disposed || issued !== generation) return;
            publish({
              usageRefreshing: false,
              usageError: error !== null && error !== undefined && error.code ? error.code : 'offline',
            });
          } finally {
            if (issued === generation) usageInFlight = null;
          }
        })();
        usageInFlight = request;
        return request;
      };

      const refresh = () => Promise.all([refreshBalance(), refreshUsage()]);

      const start = () => {
        disposed = false;
        void refresh();
        startupRetryTimer = window.setTimeout(() => {
          startupRetryTimer = null;
          if (!disposed) void refresh();
        }, 2000);
        visibilityHandler = () => {
          if (!document.hidden) void refresh();
        };
        document.addEventListener('visibilitychange', visibilityHandler);
        timer = window.setInterval(() => {
          if (!document.hidden) void refresh();
        }, REFRESH_CLOSED_MS);
      };

      const stop = () => {
        disposed = true;
        generation += 1;
        balanceInFlight = null;
        usageInFlight = null;
        if (timer !== null) {
          window.clearInterval(timer);
          timer = null;
        }
        if (startupRetryTimer !== null) {
          window.clearTimeout(startupRetryTimer);
          startupRetryTimer = null;
        }
        if (visibilityHandler !== null) {
          document.removeEventListener('visibilitychange', visibilityHandler);
          visibilityHandler = null;
        }
        listeners.clear();
      };

      const openUsage = () => {
        const url = snapshot.usageUrl;
        if (typeof url !== 'string' || url.length === 0) return;
        try {
          window.open(url, '_blank', 'noopener,noreferrer');
        } catch (_error) {
          // A blocked popup leaves the link inert.
        }
      };

      return {
        getSnapshot: () => snapshot,
        subscribe: (listener) => {
          listeners.add(listener);
          return () => {
            listeners.delete(listener);
          };
        },
        refresh,
        openUsage,
        start,
        stop,
      };
    }

    function UsageCard(props) {
      const { usage, error, refreshing, t } = props;
      const row = (label, value) => h('div', { className: 'bm-row' },
        h('span', { className: 'bm-rowLabel' }, label),
        h('span', { className: 'bm-rowValue' }, value));

      if (usage === null || usage === undefined) {
        return h('div', { className: 'bm-usageCard' },
          h('div', { className: 'bm-cardLabel' }, t('panel.today')),
          h('div', { className: 'bm-usageUnavailable' }, refreshing ? t('panel.usageLoading') : t('panel.usageUnavailable')),
          error ? h('div', { className: 'bm-stateCode' }, error) : null);
      }

      const today = usage.today || {};
      const total = usage.total || {};
      const todayTokens = numberValue(today.total);
      const totalTokens = numberValue(total.total);
      const todayCost = numberValue(today.cost);
      const totalCost = numberValue(total.cost);
      const since = formatDateTime(usage.since);

      return h('div', { className: 'bm-usageCard' },
        h('div', { className: 'bm-usageHead' },
          h('span', { className: 'bm-cardLabel' }, t('panel.today')),
          h('span', { className: 'bm-usageValue' },
            formatTokens(todayTokens),
            h('span', { className: 'bm-usageUnit' }, ' tok'))),
        todayTokens > 0 ? h('div', { className: 'bm-usageMoney' }, `≈ ${formatMoney(todayCost, 'CNY')}`) : null,
        h('div', { className: 'bm-rows' },
          row(t('panel.input'), formatTokens(today.input)),
          row(t('panel.output'), formatTokens(today.output)),
          row(t('panel.cacheRead'), formatTokens(today.cacheRead)),
          numberValue(today.cacheWrite) > 0 ? row(t('panel.cacheWrite'), formatTokens(today.cacheWrite)) : null,
          row(t('panel.calls'), String(Math.floor(numberValue(today.calls))))),
        h('div', { className: 'bm-spentSub' },
          h('span', null, t('panel.totalSpent')),
          h('span', { className: 'bm-rowValue' }, `${formatTokens(totalTokens)} tok · ≈ ${formatMoney(totalCost, 'CNY')}`)),
        h('div', { className: 'bm-hint' }, t('panel.usageHint')),
        usage.persisted === false
          ? h('div', { className: 'bm-hint' }, t('panel.usageMemoryOnly'))
          : since
            ? h('div', { className: 'bm-hint' }, t('panel.since', { time: since }))
            : null,
        error ? h('div', { className: 'bm-banner', role: 'alert', style: { marginTop: '8px', marginBottom: '0' } }, t('panel.refreshFailed')) : null);
    }

    function BalancePanel(props) {
      const account = props.useAccount((value) => value);
      const t = props.t;
      const wide = props.wide === true;
      const onRefresh = props.onRefresh;
      const onOpenUsage = props.onOpenUsage;
      const initialRef = React.useRef(null);
      if (initialRef.current === null) initialRef.current = readWindowState();
      const rootRef = React.useRef(null);
      const panelRef = React.useRef(null);
      const dragRef = React.useRef(null);
      const positionRef = React.useRef(initialRef.current.position);
      const [open, setOpen] = React.useState(initialRef.current.pinned);
      const [pinned, setPinned] = React.useState(initialRef.current.pinned);
      const [position, setPosition] = React.useState(initialRef.current.position);
      const [anchor, setAnchor] = React.useState(null);
      const [dragging, setDragging] = React.useState(false);

      React.useEffect(() => {
        positionRef.current = position;
      }, [position]);

      const clamp = React.useCallback((left, top) => {
        const panel = panelRef.current;
        const width = panel !== null ? panel.offsetWidth : PANEL_WIDTH;
        const height = panel !== null ? panel.offsetHeight : 320;
        const maxLeft = Math.max(8, window.innerWidth - width - 8);
        const maxTop = Math.max(8, window.innerHeight - height - 8);
        return {
          left: Math.min(Math.max(8, left), maxLeft),
          top: Math.min(Math.max(8, top), maxTop),
        };
      }, []);

      const place = React.useCallback(() => {
        if (positionRef.current !== null) {
          const clamped = clamp(positionRef.current.left, positionRef.current.top);
          if (clamped.left !== positionRef.current.left || clamped.top !== positionRef.current.top) {
            positionRef.current = clamped;
            setPosition(clamped);
          }
          return;
        }
        const root = rootRef.current;
        if (root === null) return;
        const rect = root.getBoundingClientRect();
        const width = Math.min(PANEL_WIDTH, Math.max(160, window.innerWidth - 16));
        const left = Math.max(8, Math.min(rect.left, window.innerWidth - width - 8));
        setAnchor({ left, bottom: Math.max(8, window.innerHeight - rect.top + 8) });
      }, [clamp]);

      React.useLayoutEffect(() => {
        if (!open) return;
        place();
        window.addEventListener('resize', place);
        return () => {
          window.removeEventListener('resize', place);
        };
      }, [open, wide, place]);

      React.useEffect(() => {
        if (typeof onRefresh === 'function') onRefresh();
      }, [onRefresh]);

      React.useEffect(() => {
        if (!open) return;
        if (typeof onRefresh === 'function') onRefresh();
        const interval = window.setInterval(() => {
          if (!document.hidden && typeof onRefresh === 'function') onRefresh();
        }, REFRESH_OPEN_MS);
        const onKey = (event) => {
          if (event.key !== 'Escape' || pinned) return;
          event.stopPropagation();
          setOpen(false);
        };
        const onPointer = (event) => {
          if (pinned) return;
          const root = rootRef.current;
          if (root !== null && event.target instanceof Node && root.contains(event.target)) return;
          setOpen(false);
        };
        document.addEventListener('keydown', onKey, true);
        document.addEventListener('pointerdown', onPointer, true);
        return () => {
          window.clearInterval(interval);
          document.removeEventListener('keydown', onKey, true);
          document.removeEventListener('pointerdown', onPointer, true);
        };
      }, [open, pinned, onRefresh]);

      const togglePin = () => {
        const next = !pinned;
        setPinned(next);
        if (next) setOpen(true);
        writeWindowState({ pinned: next, position: positionRef.current });
      };

      const close = () => {
        setOpen(false);
        if (pinned) {
          setPinned(false);
          writeWindowState({ pinned: false, position: positionRef.current });
        }
      };

      const beginDrag = (event) => {
        if (event.button !== 0) return;
        const target = event.target;
        if (target instanceof Element && target.closest('button') !== null) return;
        const panel = panelRef.current;
        if (panel === null) return;
        const rect = panel.getBoundingClientRect();
        const next = { left: rect.left, top: rect.top };
        dragRef.current = {
          pointerId: event.pointerId,
          dx: event.clientX - rect.left,
          dy: event.clientY - rect.top,
        };
        positionRef.current = next;
        setPosition(next);
        setDragging(true);
        event.currentTarget.setPointerCapture(event.pointerId);
      };

      const moveDrag = (event) => {
        const drag = dragRef.current;
        if (drag === null || drag.pointerId !== event.pointerId) return;
        const next = clamp(event.clientX - drag.dx, event.clientY - drag.dy);
        positionRef.current = next;
        setPosition(next);
      };

      const endDrag = (event) => {
        const drag = dragRef.current;
        if (drag === null || drag.pointerId !== event.pointerId) return;
        dragRef.current = null;
        setDragging(false);
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
          event.currentTarget.releasePointerCapture(event.pointerId);
        }
        writeWindowState({ pinned, position: positionRef.current });
      };

      const resetPosition = (event) => {
        const target = event.target;
        if (target instanceof Element && target.closest('button') !== null) return;
        positionRef.current = null;
        setPosition(null);
        writeWindowState({ pinned, position: null });
        place();
      };

      const totals = account.totals || {};
      const primary = choosePrimary(totals);
      const primaryTotal = primary === null ? null : totals[primary];
      const normalByCurrency = sumWallets(account.wallets);
      const bonusByCurrency = sumWallets(account.bonusWallets);
      const primaryNormal = primary === null ? 0 : normalByCurrency[primary] || 0;
      const primaryBonus = primary === null ? 0 : bonusByCurrency[primary] || 0;
      const otherCurrencies = Object.keys(totals).filter((currency) => currency !== primary);
      const hasData = Object.keys(totals).length > 0;

      const amountText = primaryTotal === null ? t('panel.unknown') : formatMoney(primaryTotal, primary);
      const statusText = account.phase === 'ready'
        ? amountText
        : account.phase === 'loading'
          ? t('entry.loading')
          : account.phase === 'signed-out'
            ? t('entry.signedOut')
            : t('entry.offline');
      const subtitle = account.profile !== null && account.profile !== undefined && (account.profile.name || account.profile.contact)
        ? account.profile.name || account.profile.contact
        : t('panel.subtitle');

      let balanceBody;
      if (account.phase === 'loading' && !hasData) {
        balanceBody = h('div', { className: 'bm-state' },
          h('div', { className: 'bm-stateIcon' }, spinnerIcon(22)),
          h('div', { className: 'bm-stateTitle' }, t('panel.loading')));
      } else if (account.phase === 'signed-out') {
        balanceBody = h('div', { className: 'bm-state' },
          h('div', { className: 'bm-stateIcon' }, signedOutIcon(26)),
          h('div', { className: 'bm-stateTitle' }, t('panel.signedOutTitle')),
          h('div', { className: 'bm-stateHint' }, t('panel.signedOutHint')));
      } else if (account.phase === 'error' && !hasData) {
        const code = account.error && account.error.code ? account.error.code : '';
        balanceBody = h('div', { className: 'bm-state' },
          h('div', { className: 'bm-stateIcon', style: { color: 'var(--dsw-alias-state-error-primary)' } }, errorIcon(26)),
          h('div', { className: 'bm-stateTitle' }, t('panel.errorTitle')),
          h('div', { className: 'bm-stateHint' }, t('panel.errorHint')),
          code ? h('div', { className: 'bm-stateCode' }, code) : null,
          h('button', {
            type: 'button',
            className: 'bm-action',
            onClick: () => {
              if (typeof onRefresh === 'function') onRefresh();
            },
          }, t('panel.retry')));
      } else {
        balanceBody = h(React.Fragment, null,
          account.error ? h('div', { className: 'bm-banner', role: 'alert' }, t('panel.refreshFailed')) : null,
          h('div', { className: 'bm-totalCard' },
            h('div', { className: 'bm-cardLabel' }, t('panel.total')),
            h('div', { className: 'bm-totalValue' }, primaryTotal === null ? t('panel.unknown') : formatMoney(primaryTotal, primary)),
            otherCurrencies.length > 0
              ? h('div', { className: 'bm-otherTotals' },
                otherCurrencies.map((currency) => h('span', { key: currency, className: 'bm-otherTotal' }, formatMoney(totals[currency], currency))))
              : null,
            h('div', { className: 'bm-rows' },
              h('div', { className: 'bm-row' },
                h('span', { className: 'bm-rowLabel' }, t('panel.recharge')),
                h('span', { className: 'bm-rowValue' }, primary === null ? t('panel.unknown') : formatMoney(primaryNormal, primary))),
              h('div', { className: 'bm-row' },
                h('span', { className: 'bm-rowLabel' }, t('panel.bonus')),
                h('span', { className: 'bm-rowValue' }, primary === null ? t('panel.unknown') : formatMoney(primaryBonus, primary))))));
      }

      const foot = account.phase === 'ready'
        ? h('div', { className: 'bm-foot' },
          h('span', null, account.updatedAt ? t('panel.updated', { time: formatTime(account.updatedAt) }) : t('panel.updatedNever')),
          account.usageUrl
            ? h('button', {
              type: 'button',
              className: 'bm-link',
              onClick: (event) => {
                event.stopPropagation();
                if (typeof onOpenUsage === 'function') onOpenUsage();
              },
            }, h('span', { style: { display: 'inline-flex', alignItems: 'center', gap: '4px' } }, t('panel.usage'), externalIcon(11)))
            : null)
        : null;

      const panelStyle = position !== null
        ? { left: `${position.left}px`, top: `${position.top}px` }
        : anchor !== null
          ? { left: `${anchor.left}px`, bottom: `${anchor.bottom}px` }
          : { left: '8px', top: '8px', visibility: 'hidden' };

      return h('div', {
        ref: rootRef,
        className: wide ? 'bm-layer' : 'bm-layer bm-rail',
      },
      open
        ? h('section', {
          ref: panelRef,
          className: 'bm-panel',
          style: panelStyle,
          role: 'dialog',
          'aria-label': t('panel.title'),
          'aria-busy': account.refreshing || account.usageRefreshing ? true : undefined,
          'data-balance-monitor': 'panel',
        },
        h('header', {
          className: 'bm-head',
          title: t('panel.dragHint'),
          'data-dragging': dragging ? true : undefined,
          onPointerDown: beginDrag,
          onPointerMove: moveDrag,
          onPointerUp: endDrag,
          onPointerCancel: endDrag,
          onDoubleClick: resetPosition,
        },
        h('div', { className: 'bm-headText' },
          h('div', { className: 'bm-title' }, t('panel.title')),
          h('div', { className: 'bm-sub', title: subtitle }, subtitle)),
        h('div', { className: 'bm-headActions' },
          h('button', {
            type: 'button',
            className: 'bm-iconButton bm-pin',
            'data-active': pinned ? true : undefined,
            'aria-pressed': pinned,
            'aria-label': pinned ? t('panel.unpin') : t('panel.pin'),
            title: pinned ? t('panel.unpin') : t('panel.pin'),
            onClick: (event) => {
              event.stopPropagation();
              togglePin();
            },
          }, pinIcon(14, pinned)),
          h('button', {
            type: 'button',
            className: 'bm-iconButton',
            'aria-label': t('panel.refresh'),
            title: t('panel.refresh'),
            onClick: (event) => {
              event.stopPropagation();
              if (typeof onRefresh === 'function') onRefresh();
            },
          }, refreshIcon(14, account.refreshing || account.usageRefreshing)),
          h('button', {
            type: 'button',
            className: 'bm-iconButton',
            'aria-label': t('panel.close'),
            title: t('panel.close'),
            onClick: (event) => {
              event.stopPropagation();
              close();
            },
          }, closeIcon(14)))),
        h('div', { className: 'bm-body' },
          balanceBody,
          h(UsageCard, {
            usage: account.usage,
            error: account.usageError,
            refreshing: account.usageRefreshing,
            t,
          }),
          foot))
        : null,
      h('button', {
        type: 'button',
        className: 'bm-button',
        'data-active': open ? true : undefined,
        'aria-label': `${t('entry.aria')} · ${statusText}`,
        'aria-expanded': open,
        title: `${t('entry.aria')} · ${statusText}`,
        onClick: () => {
          setOpen((value) => !value);
        },
      },
      walletIcon(wide ? 16 : 18),
      wide ? h('span', { className: 'bm-label' }, t('entry.label')) : null,
      wide ? h('span', { className: 'bm-amount' }, statusText) : null),
      h('style', null, CSS));
    }

    return {
      inject: ['slots', 'locale', 'remote', 'remote.account', 'connection'],
      apply(ctx) {
        ctx.effect(() => ctx.locale.register(NS, { en, zh }), 'balance-monitor: dictionaries');
        const store = createStore(ctx);
        ctx.effect(() => {
          store.start();
          return () => {
            store.stop();
          };
        }, 'balance-monitor: polling');
        const t = ctx.locale.bind(NS);
        ctx.slots.inject('sidebar.footer.action', () => ctx.slots.register({
          name: 'sidebar.footer.action',
          id: 'balance-monitor',
          order: 20,
          locale: NS,
          label: () => t('entry.label'),
          inject: () => ({
            hooks: { account: store },
            onRefresh: () => store.refresh(),
            onOpenUsage: () => store.openUsage(),
          }),
        }, BalancePanel));
      },
    };
  },
});
