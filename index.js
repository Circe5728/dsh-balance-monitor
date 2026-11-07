/**
 * Host half of the balance-monitor bundle.
 *
 * It owns one process-local token ledger fed by the `llm/stream` waterfall and
 * exposes it to the browser half over a private Connection RPC channel. The
 * ledger is persisted through the mounted JSON storage backend when available,
 * so "today" and "cumulative" survive a Host restart.
 */

const RPC_CHANNEL = '/dsh-balance-monitor'
const UNIT_NAME = 'balance_monitor_v3'
const UNIT_VERSION = 3
const SAVE_DELAY_MS = 2000

const DEFAULT_PRICE = { input: 2, cacheRead: 0.5, output: 8 }
const MODEL_PRICES = {
  'deepseek-chat': { input: 2, cacheRead: 0.5, output: 8 },
  'deepseek-reasoner': { input: 4, cacheRead: 1, output: 16 },
  'deepseek-flash': { input: 0.5, cacheRead: 0.1, output: 2 },
}

function localDay(now = Date.now()) {
  const date = new Date(now)
  const year = String(date.getFullYear())
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function round(value) {
  return Math.round(value * 1e6) / 1e6
}

function emptyBucket() {
  return { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, total: 0, calls: 0, cost: 0 }
}

function initialState() {
  return {
    version: 1,
    day: localDay(),
    since: Date.now(),
    today: emptyBucket(),
    total: emptyBucket(),
    updatedAt: Date.now(),
  }
}

function numberOr(value, fallback) {
  const number = Number(value)
  return Number.isFinite(number) && number >= 0 ? number : fallback
}

function resolvePrices(config) {
  const prices = { default: { ...DEFAULT_PRICE } }
  for (const [model, price] of Object.entries(MODEL_PRICES)) prices[model] = { ...price }
  const custom = config !== null && config !== undefined && typeof config.prices === 'object' ? config.prices : null
  if (custom !== null) {
    for (const [model, price] of Object.entries(custom)) {
      if (price === null || typeof price !== 'object') continue
      prices[model] = {
        input: numberOr(price.input, DEFAULT_PRICE.input),
        cacheRead: numberOr(price.cacheRead, DEFAULT_PRICE.cacheRead),
        output: numberOr(price.output, DEFAULT_PRICE.output),
      }
    }
  }
  return prices
}

function sanitizeBucket(value) {
  const bucket = emptyBucket()
  if (value === null || typeof value !== 'object') return bucket
  bucket.input = numberOr(value.input, 0)
  bucket.output = numberOr(value.output, 0)
  bucket.cacheRead = numberOr(value.cacheRead, 0)
  bucket.cacheWrite = numberOr(value.cacheWrite, 0)
  bucket.total = numberOr(value.total, 0)
  bucket.calls = Math.floor(numberOr(value.calls, 0))
  bucket.cost = numberOr(value.cost, 0)
  return bucket
}

function addBucket(target, source) {
  target.input = round(target.input + numberOr(source.input, 0))
  target.output = round(target.output + numberOr(source.output, 0))
  target.cacheRead = round(target.cacheRead + numberOr(source.cacheRead, 0))
  target.cacheWrite = round(target.cacheWrite + numberOr(source.cacheWrite, 0))
  target.total = round(target.total + numberOr(source.total, 0))
  target.calls += Math.floor(numberOr(source.calls, 0))
  target.cost = round(target.cost + numberOr(source.cost, 0))
}

function usageCost(usage, price) {
  const input = Math.max(0, numberOr(usage.inputTokens, 0))
  const output = Math.max(0, numberOr(usage.outputTokens, 0))
  const cacheRead = Math.max(0, numberOr(usage.cacheReadTokens, 0))
  const cacheWrite = Math.max(0, numberOr(usage.cacheWriteTokens, 0))
  return (input * price.input + cacheRead * price.cacheRead + cacheWrite * price.input + output * price.output) / 1e6
}

export function apply(ctx, config = {}) {
  const prices = resolvePrices(config)
  const state = initialState()
  let storageUnit = null
  let storageEpoch = 0
  let dirty = false
  let saveTimer = null
  let stopped = false
  let markStorageReady = null
  const storageReady = new Promise((resolve) => {
    const timer = setTimeout(() => {
      if (markStorageReady !== null) {
        markStorageReady = null
        resolve()
      }
    }, 3000)
    markStorageReady = () => {
      clearTimeout(timer)
      markStorageReady = null
      resolve()
    }
  })

  const currentDay = () => {
    const day = localDay()
    if (state.day !== day) {
      state.day = day
      state.today = emptyBucket()
    }
    return day
  }

  const save = async (unit = storageUnit) => {
    if (unit === null || !dirty) return
    dirty = false
    try {
      await unit.setGlobal(state)
    } catch (error) {
      console.warn('[balance-monitor] saving the token ledger failed:', error)
    }
  }

  const scheduleSave = () => {
    dirty = true
    if (saveTimer !== null) return
    saveTimer = setTimeout(() => {
      saveTimer = null
      void save()
    }, SAVE_DELAY_MS)
  }

  const record = (provider, model, usage) => {
    if (usage === null || typeof usage !== 'object') return
    currentDay()
    const input = Math.max(0, numberOr(usage.inputTokens, 0))
    const output = Math.max(0, numberOr(usage.outputTokens, 0))
    const cacheRead = Math.max(0, numberOr(usage.cacheReadTokens, 0))
    const cacheWrite = Math.max(0, numberOr(usage.cacheWriteTokens, 0))
    const reportedTotal = Number(usage.totalTokens)
    const total = Number.isFinite(reportedTotal) && reportedTotal > 0
      ? reportedTotal
      : input + output + cacheRead + cacheWrite
    const modelId = typeof model === 'string' && model.length > 0 ? model : 'unknown'
    const price = prices[modelId] || prices.default
    const cost = usageCost(usage, price)
    const contribution = { input, output, cacheRead, cacheWrite, total, calls: 1, cost }
    addBucket(state.today, contribution)
    addBucket(state.total, contribution)
    state.updatedAt = Date.now()
    scheduleSave()
  }

  /**
   * Observe one model call without changing its chunks. The last usage chunk
   * wins: providers report cumulative totals, and an aborted stream still keeps
   * what it already reported.
   */
  const observe = (options, next) => {
    const provider = options !== null && options !== undefined ? options.provider : undefined
    const model = options !== null && options !== undefined ? options.model : undefined
    return (async function* observed() {
      let lastUsage = null
      try {
        const upstream = next()
        for await (const chunk of upstream) {
          if (chunk !== null && chunk !== undefined && chunk.type === 'usage' && chunk.usage) {
            lastUsage = chunk.usage
          }
          yield chunk
        }
      } finally {
        if (lastUsage !== null) {
          try {
            record(provider, model, lastUsage)
          } catch (error) {
            console.warn('[balance-monitor] recording token usage failed:', error)
          }
        }
      }
    })()
  }

  ctx.on('llm/stream', (options, next) => observe(options, next))

  const snapshot = () => {
    currentDay()
    return {
      day: state.day,
      today: { ...state.today },
      total: { ...state.total },
      since: state.since,
      updatedAt: state.updatedAt,
      persisted: storageUnit !== null,
    }
  }

  const openStorage = async (storage, epoch) => {
    try {
      const names = storage.backend.names()
      const backendName = names.includes('json') ? 'json' : names[0]
      if (backendName === undefined) return
      const backend = storage.backend.get(backendName)
      if (backend === null || backend === undefined || backend.kv === undefined) return
      const unit = await backend.kv.open({
        name: UNIT_NAME,
        version: UNIT_VERSION,
        tables: [],
        hasGlobal: true,
        layout: 'single',
      })
      if (stopped || epoch !== storageEpoch) {
        await unit.close()
        return
      }
      const loaded = await unit.loadAll()
      currentDay()
      const saved = loaded !== null && loaded !== undefined ? loaded.global : null
      if (saved !== null && typeof saved === 'object' && saved.version === 1) {
        if (saved.day === state.day) addBucket(state.today, sanitizeBucket(saved.today))
        addBucket(state.total, sanitizeBucket(saved.total))
        if (Number.isFinite(saved.since)) state.since = Math.min(state.since, saved.since)
        state.updatedAt = Date.now()
      }
      storageUnit = unit
      dirty = true
      scheduleSave()
    } catch (error) {
      console.warn('[balance-monitor] opening the token ledger storage failed:', error)
    }
  }

  ctx.inject(['storage'], (storageCtx) => {
    const epoch = ++storageEpoch
    void openStorage(storageCtx.storage, epoch).finally(() => {
      if (markStorageReady !== null) markStorageReady()
    })
    return async () => {
      storageEpoch += 1
      const unit = storageUnit
      storageUnit = null
      if (unit !== null) {
        if (dirty) {
          dirty = false
          try {
            await unit.setGlobal(state)
          } catch (error) {
            console.warn('[balance-monitor] flushing the token ledger failed:', error)
          }
        }
        await unit.close()
      }
    }
  })

  const readRequestBody = async (request) => {
    const chunks = []
    for await (const chunk of request) chunks.push(chunk)
    return Buffer.concat(chunks).toString('utf8')
  }

  ctx.inject(['webServer', 'connection'], (webCtx) => {
    try {
      return webCtx.webServer.register({
        kind: 'prefix',
        path: RPC_CHANNEL,
        handler: async (request, response) => {
          try {
            const admission = webCtx.connection.admit(request)
            if ('rejection' in admission) {
              response.writeHead(admission.rejection)
              response.end(admission.rejection === 401 ? 'unauthorized' : 'forbidden')
              return
            }
            if (request.method !== 'POST') {
              response.writeHead(405)
              response.end()
              return
            }
            const pathname = new URL(request.url ?? '/', 'http://localhost').pathname
            const prefix = `${RPC_CHANNEL}/`
            if (!pathname.startsWith(prefix)) {
              response.writeHead(404)
              response.end()
              return
            }
            const endpoint = pathname.slice(prefix.length)
            if (endpoint !== 'snapshot') {
              response.writeHead(404)
              response.end()
              return
            }
            const contentType = request.headers['content-type']
            if (typeof contentType !== 'string' || !contentType.toLowerCase().startsWith('application/json')) {
              response.writeHead(415)
              response.end('content type must be application/json')
              return
            }
            let message
            try {
              message = JSON.parse(await readRequestBody(request))
            } catch (_error) {
              response.writeHead(400)
              response.end('body is not JSON')
              return
            }
            if (message === null || typeof message !== 'object'
              || typeof message.rpcId !== 'string' || message.method !== endpoint) {
              response.writeHead(400)
              response.end('invalid envelope')
              return
            }
            await storageReady
            const result = { ok: true, value: snapshot() }
            response.writeHead(200, { 'content-type': 'application/json' })
            response.end(JSON.stringify({ type: 'server-response', rpcId: message.rpcId, result }))
          } catch (error) {
            console.warn('[balance-monitor] usage RPC request failed:', error)
            if (!response.headersSent) {
              response.writeHead(500)
              response.end('handler failure')
            }
          }
        },
      })
    } catch (error) {
      console.warn('[balance-monitor] registering the usage RPC route failed:', error)
      return () => {}
    }
  })

  ctx.effect(() => () => {
    stopped = true
    if (saveTimer !== null) {
      clearTimeout(saveTimer)
      saveTimer = null
    }
    const unit = storageUnit
    if (unit === null) return
    const pending = save()
    storageUnit = null
    void pending.finally(() => unit.close())
  }, 'balance-monitor: token ledger lifetime')
}
