import {
  CORS,
  initBlobsContext,
  getBlobStore,
  json,
  safeParseJSON,
  parseUserIdToken,
  assertAuthPair,
} from './webhookCommon.js'

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS, body: '' }
  }
  if (event.httpMethod !== 'GET' && event.httpMethod !== 'POST') {
    return json(405, { ok: false, error: 'METHOD_NOT_ALLOWED' })
  }
  if (!initBlobsContext(event)) {
    return json(503, { ok: false, error: 'BLOBS_CONTEXT_UNAVAILABLE' })
  }
  const parsedQs = parseUserIdToken(event)
  if (!parsedQs.ok) {
    return json(400, { ok: false, error: parsedQs.error })
  }
  const { userId, token } = parsedQs
  const store = getBlobStore()
  const auth = await assertAuthPair(store, userId, token)
  if (!auth.ok) {
    return json(auth.status, { ok: false, error: auth.error })
  }
  const prefix = `q/${userId}/`
  const listResult = await store.list({ prefix })
  const blobs = listResult?.blobs || []
  const items = []
  for (const b of blobs) {
    const key = b.key
    if (!key) continue
    const raw = await store.get(key, { type: 'text' })
    let record = null
    if (raw) {
      try {
        record = safeParseJSON(raw)
      } catch {
        record = null
      }
    }
    if (raw != null) {
      try {
        await store.delete(key)
      } catch (e) {
        return json(500, {
          ok: false,
          error: 'CONSUME_FAILED',
          key,
          detail: e instanceof Error ? e.message : String(e),
        })
      }
    }
    if (record) {
      items.push({ key, record })
    }
  }
  return json(200, { ok: true, items })
}
