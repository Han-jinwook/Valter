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
 * 로컬 `kv` 단일 키 저장용.
 * `ledger_lines`를 원천으로 사용하더라도, 부트스트랩/복구 실패 시 데이터 유실을 막기 위해
 * transactions를 함께 보관한다.
 * Drive/내보내기 백업은 `buildFullBackupSnapshot()`을 사용한다.
 */
export function buildLocalKvSnapshot(): VaultBackupSnapshot {
  return buildFullBackupSnapshot()
}
