/**
 * 순수 `vite` 개발 시 @netlify/vite-plugin 이 일부 /api 경로를 404로 둘 때,
 * Netlify 함수를 Node에서 직접 로드해 응답한다. (프로덕션/ netlify dev 는 기존 동작)
 */
import { pathToFileURL } from 'node:url'
import { join } from 'node:path'

const ROUTES = {
  '/api/chat-assistant': { file: 'chat-assistant.js', methods: new Set(['POST']) },
  '/api/chat-assistant-assets': { file: 'chat-assistant-assets.js', methods: new Set(['POST']) },
  '/api/chat-assistant-budget': { file: 'chat-assistant-budget.js', methods: new Set(['POST']) },
  '/api/chat-assistant-vault': { file: 'chat-assistant-vault.js', methods: new Set(['POST']) },
  '/api/vault-verify-pin': { file: 'vault-verify-pin.js', methods: new Set(['POST']) },
  '/api/analyze-receipt': { file: 'analyze-receipt.js', methods: new Set(['POST']) },
  '/api/analyze-document': { file: 'analyze-document.js', methods: new Set(['POST']) },
  '/api/analyze-email-receipt': { file: 'analyze-email-receipt.js', methods: new Set(['POST']) },
  '/api/webhook-receipt': { file: 'webhook-receipt.js', methods: new Set(['POST', 'OPTIONS']) },
  '/api/webhook-ledger-pull': { file: 'webhook-ledger-pull.js', methods: new Set(['GET', 'POST', 'OPTIONS']) },
  '/api/webhook-auth-register': { file: 'webhook-auth-register.js', methods: new Set(['POST', 'OPTIONS']) },
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', (c) => chunks.push(c))
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    req.on('error', reject)
  })
}

const fnCache = new Map()

function buildEvent(req, pathOnly) {
  const u = new URL(req.url || '/', 'http://vite.local')
  const qs = u.searchParams
  const queryStringParameters = {}
  for (const [k, v] of qs.entries()) {
    queryStringParameters[k] = v
  }
  return {
    httpMethod: req.method || 'GET',
    path: pathOnly,
    queryStringParameters: Object.keys(queryStringParameters).length ? queryStringParameters : null,
    body: null,
    headers: req.headers || {},
    isBase64Encoded: false,
    /** 로컬 순수 Vite: Netlify Blobs 컨텍스트 없음 → 함수가 503 반환 */
    blobs: null,
  }
}

export function localNetlifyApi() {
  return {
    name: 'local-netlify-api',
    /** @netlify/vite-plugin 의 NetlifyDev 미들웨어보다 **먼저** 등록해 `/api/*` 를 여기서 처리(안 그러면 404) */
    enforce: 'pre',
    configureServer(server) {
      const root = server.config.root
      server.middlewares.use(async (req, res, next) => {
        const pathOnly = (req.url || '').split('?')[0]
        const route = ROUTES[pathOnly]
        if (!route) return next()

        const baseHeaders = {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        }
        if (req.method === 'OPTIONS') {
          for (const [k, v] of Object.entries(baseHeaders)) {
            res.setHeader(k, v)
          }
          res.statusCode = 204
          res.end()
          return
        }
        if (!route.methods.has(req.method)) {
          return next()
        }

        const abs = join(root, 'netlify', 'functions', route.file)
        const href = pathToFileURL(abs).href
        let mod = fnCache.get(href)
        if (!mod) {
          mod = await import(href)
          fnCache.set(href, mod)
        }
        const { handler } = mod
        if (typeof handler !== 'function') return next()

        const event = buildEvent(req, pathOnly)
        if (req.method === 'POST' || req.method === 'PUT') {
          const raw = await readBody(req)
          event.body = raw || null
        }

        let result
        try {
          result = await handler(event)
        } catch (e) {
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json; charset=utf-8')
          for (const [k, v] of Object.entries(baseHeaders)) {
            res.setHeader(k, v)
          }
          res.end(
            JSON.stringify({ error: e instanceof Error ? e.message : '함수 실행 오류' }),
            'utf8',
          )
          return
        }
        if (!result || typeof result !== 'object') {
          return next()
        }
        for (const [k, v] of Object.entries(baseHeaders)) {
          res.setHeader(k, v)
        }
        const outHeaders = result.headers || {}
        for (const [k, v] of Object.entries(outHeaders)) {
          if (v != null) res.setHeader(k, v)
        }
        res.statusCode = result.statusCode ?? 200
        res.end(typeof result.body === 'string' ? result.body : String(result.body ?? ''), 'utf8')
      })
    },
  }
}
