const LS_USER = 'vaulter.webhookUserId'
const LS_TOKEN = 'vaulter.webhookToken'

const RE_USER = /^[a-f0-9]{32,128}$/
const RE_TOK = /^[a-f0-9]{32,256}$/

function randomHex(bytes: number): string {
  const a = new Uint8Array(bytes)
  crypto.getRandomValues(a)
  return [...a].map((b) => b.toString(16).padStart(2, '0')).join('')
}

export function getOrCreateWebhookIdentity(): { userId: string; token: string } {
  let userId = (typeof localStorage !== 'undefined' && localStorage.getItem(LS_USER)) || ''
  let token = (typeof localStorage !== 'undefined' && localStorage.getItem(LS_TOKEN)) || ''
  if (!RE_USER.test(userId) || !RE_TOK.test(token)) {
    userId = randomHex(32)
    token = randomHex(32)
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(LS_USER, userId)
      localStorage.setItem(LS_TOKEN, token)
    }
  }
  return { userId, token }
}

export function getWebhookBaseUrl(): string {
  if (typeof window === 'undefined') return ''
  return window.location.origin.replace(/\/$/, '')
}

export function buildWebhookPostUrl(userId: string, token: string): string {
  const base = getWebhookBaseUrl()
  const q = new URLSearchParams({ userId, token })
  return `${base}/api/webhook-receipt?${q.toString()}`
}

export function buildLedgerPullUrl(userId: string, token: string): string {
  const base = getWebhookBaseUrl()
  const q = new URLSearchParams({ userId, token })
  return `${base}/api/webhook-ledger-pull?${q.toString()}`
}
