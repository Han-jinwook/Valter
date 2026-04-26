import crypto from 'node:crypto'
import {
  CORS,
  initBlobsContext,
  getBlobStore,
  json,
  safeParseJSON,
  parseUserIdToken,
} from './webhookCommon.js'

function parseBody(event) {
  if (!event?.body) return null
  const raw = event.isBase64Encoded
    ? Buffer.from(event.body, 'base64').toString('utf8')
    : String(event.body)
  return safeParseJSON(raw)
}

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS, body: '' }
  }
  if (event.httpMethod !== 'POST') {
    return json(405, { ok: false, error: 'METHOD_NOT_ALLOWED' })
  }
  if (!initBlobsContext(event)) {
    return json(503, { ok: false, error: 'BLOBS_CONTEXT_UNAVAILABLE' })
  }
  const body = parseBody(event)
  if (!body || typeof body !== 'object') {
    return json(400, { ok: false, error: 'INVALID_BODY' })
  }
  const id = String(body.userId || '').trim().toLowerCase()
  const token = String(body.token || '').trim().toLowerCase()
  const check = parseUserIdToken({ queryStringParameters: { userId: id, token } })
  if (!check.ok) {
    return json(400, { ok: false, error: check.error })
  }
  const store = getBlobStore()
  const authKey = `auth/${check.userId}.json`
  const existing = await store.get(authKey, { type: 'text' })
  if (existing) {
    const o = safeParseJSON(existing)
    const prev = o?.t
    if (typeof prev === 'string') {
      const a = Buffer.from(prev, 'utf8')
      const b = Buffer.from(token, 'utf8')
      if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
        return json(409, { ok: false, error: 'USER_ID_TAKEN' })
      }
      return json(200, { ok: true, already: true })
    }
    return json(409, { ok: false, error: 'USER_ID_TAKEN' })
  }
  const payload = JSON.stringify({
    v: 1,
    t: token,
    createdAt: new Date().toISOString(),
  })
  await store.set(authKey, payload, { metadata: { kind: 'webhook-auth' } })
  return json(200, { ok: true, already: false })
}
