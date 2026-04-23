import { buildLocalKvSnapshot } from './backupSnapshot'
import { writeLocalVaultSnapshot } from './localVaultPersistence'

/** `transactions`는 `ledger_lines` IDB에만 — KV는 메시지·원장 UI 상태만 동기화 */
export function flushLocalVaultSnapshotToKv(): Promise<void> {
  return writeLocalVaultSnapshot(buildLocalKvSnapshot())
}
