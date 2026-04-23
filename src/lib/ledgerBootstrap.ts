import { readAllLedgerLines } from './localVaultPersistence'
import type { VaultBackupSnapshot, VaultTransaction } from '../stores/vaultStore'

function sortLedgerTransactionsDesc(txs: VaultTransaction[]): VaultTransaction[] {
  return [...txs].sort((a, b) => {
    const ad = String(a.date || '').replace(/\./g, '-')
    const bd = String(b.date || '').replace(/\./g, '-')
    const c = bd.localeCompare(ad)
    if (c !== 0) return c
    return String(b.id).localeCompare(String(a.id), undefined, { numeric: true })
  })
}

/**
 * IDB `ledger_lines`에 데이터가 있으면 그것이 원천(소스 오브 트루스).
 * 비어 있을 때만 KV 스냅샷의 `transactions`를 레거시로 사용·마이그레이션 대상(복원에서 writeAll로 IDB에 일괄 기록).
 */
export async function resolveTransactionsForLoad(
  snapshot: VaultBackupSnapshot | null,
): Promise<VaultTransaction[]> {
  const fromIdb = (await readAllLedgerLines()) as VaultTransaction[]
  if (fromIdb.length > 0) {
    return sortLedgerTransactionsDesc(fromIdb)
  }
  const legacy = Array.isArray(snapshot?.transactions) ? snapshot.transactions : []
  return sortLedgerTransactionsDesc(legacy)
}
