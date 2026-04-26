import { useVaultStore } from '../stores/vaultStore'
import { pullLedgerWebhookInbox, registerWebhookAuthPair } from './webhookLedgerClient'

export type SyncWebhookResult =
  | { ok: true; registered: boolean; pulled: number; error?: string }
  | { ok: false; phase: 'register' | 'pull' | 'ingest'; error: string }

/** 설정 동기화 후 서버 대기 큐(Pull) → 로컬 원장 머지. 순수 Vite(503)는 조용히 무시. */
export async function registerAndSyncWebhookInbox(): Promise<SyncWebhookResult> {
  let registered = false
  const reg = await registerWebhookAuthPair()
  if (!reg.ok) {
    if (reg.status === 503) {
      return { ok: true, registered: false, pulled: 0, error: 'BLOBS_CONTEXT_UNAVAILABLE' }
    }
    return { ok: false, phase: 'register', error: reg.error }
  }
  registered = true

  const pull = await pullLedgerWebhookInbox()
  if (!pull.ok) {
    if (pull.status === 503) {
      return { ok: true, registered, pulled: 0, error: 'BLOBS_CONTEXT_UNAVAILABLE' }
    }
    return { ok: false, phase: 'pull', error: pull.error }
  }
  const wrapped = pull.items
    .map((row) => {
      const p = row.record?.parsed
      if (!p || row.key == null) return null
      return {
        key: row.key,
        parsed: p as {
          type: string
          category: string
          amount: number
          date: string
          title: string
        },
      }
    })
    .filter(
      (x): x is {
        key: string
        parsed: { type: string; category: string; amount: number; date: string; title: string }
      } => x != null,
    )
  if (!wrapped.length) {
    return { ok: true, registered, pulled: 0 }
  }
  try {
    const res = await useVaultStore.getState().ingestWebhookInboxItems(wrapped)
    return { ok: true, registered, pulled: res.insertedCount }
  } catch (e) {
    return { ok: false, phase: 'ingest', error: e instanceof Error ? e.message : 'ingest_failed' }
  }
}
