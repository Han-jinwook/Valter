import { useVaultStore } from '../stores/vaultStore'
import { useAssetStore } from '../stores/assetStore'
import type { VaultBackupSnapshot } from '../stores/vaultStore'

/** Drive / JSON 내보내기: 원장(거래) + KV 메타 + 황금자산 라인(메모리·자산 IDB) */
export function buildFullBackupSnapshot(): VaultBackupSnapshot {
  const base = useVaultStore.getState().exportBackupSnapshot()
  return {
    ...base,
    goldenAssetLines: useAssetStore.getState().lines,
  }
}

/**
 * 로컬 `kv` 단일 키에 쓰는 용도: `transactions`는 `ledger_lines` IDB에만 두고 KV 용량·직렬화 비용을 줄인다.
 * Drive/내보내기 백업은 `buildFullBackupSnapshot()`(전체 거래 포함)을 사용할 것.
 */
export function buildLocalKvSnapshot(): VaultBackupSnapshot {
  return {
    ...buildFullBackupSnapshot(),
    transactions: [],
  }
}
