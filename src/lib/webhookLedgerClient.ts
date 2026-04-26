import { getOrCreateWebhookIdentity } from './webhookIdentity'

type RegisterResult =
  | { ok: true; already: boolean }
  | { ok: false; error: string; status: number }

type PullItem = {
  key: string
  record: {
    v?: number
    createdAt?: string
    key?: string
    parsed: {
      type: string
      category: string
      amount: number
      date: string
      title: string
    }
  }
}

type PullResult =
  | { ok: true; items: PullItem[] }
  | { ok: false; error: string; status: number }

export async function registerWebhookAuthPair(): Promise<RegisterResult> {
  const { userId, token } = getOrCreateWebhookIdentity()
  const res = await fetch('/api/webhook-auth-register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, token }),
  })
  const data = (await res.json().catch(() => ({}))) as { ok?: boolean; already?: boolean; error?: string }
  if (!res.ok) {
    return { ok: false, error: String(data.error || res.statusText || 'register_failed'), status: res.status }
  }
  if (data.ok) {
    return { ok: true, already: Boolean(data.already) }
  }
  return { ok: false, error: 'UNEXPECTED', status: res.status }
}

export async function pullLedgerWebhookInbox(): Promise<PullResult> {
  const { userId, token } = getOrCreateWebhookIdentity()
  const q = new URLSearchParams({ userId, token })
  const res = await fetch(`/api/webhook-ledger-pull?${q.toString()}`, { method: 'GET' })
  const data = (await res.json().catch(() => ({}))) as { ok?: boolean; items?: PullItem[]; error?: string }
  if (!res.ok) {
    return { ok: false, error: String(data.error || res.statusText || 'pull_failed'), status: res.status }
  }
  if (data.ok && Array.isArray(data.items)) {
    return { ok: true, items: data.items }
  }
  return { ok: false, error: 'UNEXPECTED', status: res.status }
}
