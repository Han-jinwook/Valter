import type { AssetLine } from '../types/assetLine'
import type { VaultBackupSnapshot, VaultTransaction } from '../stores/vaultStore'

const LOCAL_VAULT_DB = 'vaulter-local-vault'
const LOCAL_VAULT_STORE = 'kv'
const ASSETS_STORE = 'assets'
export const LEDGER_LINES_STORE = 'ledger_lines'
const KEY_VAULT_SNAPSHOT = 'vault_snapshot'

const DB_VERSION = 3

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(LOCAL_VAULT_DB, DB_VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(LOCAL_VAULT_STORE)) {
        db.createObjectStore(LOCAL_VAULT_STORE)
      }
      if (!db.objectStoreNames.contains(ASSETS_STORE)) {
        db.createObjectStore(ASSETS_STORE, { keyPath: 'id' })
      }
      if (!db.objectStoreNames.contains(LEDGER_LINES_STORE)) {
        const st = db.createObjectStore(LEDGER_LINES_STORE, { keyPath: 'id' })
        st.createIndex('date', 'date', { unique: false })
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error || new Error('IndexedDB open failed'))
  })
}

export async function readLocalVaultSnapshot(): Promise<VaultBackupSnapshot | null> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(LOCAL_VAULT_STORE, 'readonly')
    const req = tx.objectStore(LOCAL_VAULT_STORE).get(KEY_VAULT_SNAPSHOT)
    req.onsuccess = () => resolve((req.result as VaultBackupSnapshot | null) || null)
    req.onerror = () => reject(req.error || new Error('로컬 원장 스냅샷을 읽지 못했습니다.'))
  })
}

export async function writeLocalVaultSnapshot(snapshot: VaultBackupSnapshot): Promise<void> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(LOCAL_VAULT_STORE, 'readwrite')
    tx.objectStore(LOCAL_VAULT_STORE).put(snapshot, KEY_VAULT_SNAPSHOT)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error || new Error('로컬 원장 스냅샷을 저장하지 못했습니다.'))
  })
}

export async function clearLocalVaultSnapshot(): Promise<void> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const storeNames: string[] = [LOCAL_VAULT_STORE]
    if (db.objectStoreNames.contains(ASSETS_STORE)) storeNames.push(ASSETS_STORE)
    if (db.objectStoreNames.contains(LEDGER_LINES_STORE)) storeNames.push(LEDGER_LINES_STORE)

    const tx = db.transaction(storeNames, 'readwrite')
    tx.objectStore(LOCAL_VAULT_STORE).delete(KEY_VAULT_SNAPSHOT)
    if (db.objectStoreNames.contains(ASSETS_STORE)) {
      tx.objectStore(ASSETS_STORE).clear()
    }
    if (db.objectStoreNames.contains(LEDGER_LINES_STORE)) {
      tx.objectStore(LEDGER_LINES_STORE).clear()
    }
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error || new Error('로컬 원장 스냅샷을 삭제하지 못했습니다.'))
  })
}

// ── 황금자산 `assets` 오브젝트 스토어
export async function readAllAssets(): Promise<AssetLine[]> {
  const db = await openDb()
  if (!db.objectStoreNames.contains(ASSETS_STORE)) return []
  return new Promise((resolve, reject) => {
    const tx = db.transaction(ASSETS_STORE, 'readonly')
    const req = tx.objectStore(ASSETS_STORE).getAll()
    req.onsuccess = () => resolve((req.result as AssetLine[]) || [])
    req.onerror = () => reject(req.error || new Error('자산 목록을 읽지 못했습니다.'))
  })
}

export async function putAssetLine(row: AssetLine): Promise<void> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(ASSETS_STORE, 'readwrite')
    tx.objectStore(ASSETS_STORE).put(row)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error || new Error('자산을 저장하지 못했습니다.'))
  })
}

export async function deleteAssetLine(id: string): Promise<void> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(ASSETS_STORE, 'readwrite')
    tx.objectStore(ASSETS_STORE).delete(id)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error || new Error('자산을 삭제하지 못했습니다.'))
  })
}

export async function writeAllAssetLines(lines: AssetLine[]): Promise<void> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(ASSETS_STORE, 'readwrite')
    const store = tx.objectStore(ASSETS_STORE)
    store.clear()
    for (const row of lines) {
      store.put(row)
    }
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error || new Error('자산 목록을 덮어쓰지 못했습니다.'))
  })
}

// ── 지기 원장 `ledger_lines` (거래 1행 = 1레코드, KV 스냅샷 `transactions` 대체)

export async function readAllLedgerLines(): Promise<VaultTransaction[]> {
  const db = await openDb()
  if (!db.objectStoreNames.contains(LEDGER_LINES_STORE)) return []
  return new Promise((resolve, reject) => {
    const tx = db.transaction(LEDGER_LINES_STORE, 'readonly')
    const req = tx.objectStore(LEDGER_LINES_STORE).getAll()
    req.onsuccess = () => resolve((req.result as VaultTransaction[]) || [])
    req.onerror = () => reject(req.error || new Error('원장(거래) 목록을 읽지 못했습니다.'))
  })
}

export async function putLedgerLine(row: VaultTransaction): Promise<void> {
  const db = await openDb()
  if (!db.objectStoreNames.contains(LEDGER_LINES_STORE)) {
    throw new Error('ledger_lines store is missing')
  }
  return new Promise((resolve, reject) => {
    const tx = db.transaction(LEDGER_LINES_STORE, 'readwrite')
    tx.objectStore(LEDGER_LINES_STORE).put(row)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error || new Error('원장 행을 저장하지 못했습니다.'))
  })
}

export async function putLedgerLinesBatch(rows: VaultTransaction[]): Promise<void> {
  if (rows.length === 0) return
  const db = await openDb()
  if (!db.objectStoreNames.contains(LEDGER_LINES_STORE)) {
    throw new Error('ledger_lines store is missing')
  }
  return new Promise((resolve, reject) => {
    const tx = db.transaction(LEDGER_LINES_STORE, 'readwrite')
    const store = tx.objectStore(LEDGER_LINES_STORE)
    for (const row of rows) {
      store.put(row)
    }
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error || new Error('원장 행 일괄 저장에 실패했습니다.'))
  })
}

export async function deleteLedgerLine(id: string): Promise<void> {
  const db = await openDb()
  if (!db.objectStoreNames.contains(LEDGER_LINES_STORE)) return
  return new Promise((resolve, reject) => {
    const tx = db.transaction(LEDGER_LINES_STORE, 'readwrite')
    tx.objectStore(LEDGER_LINES_STORE).delete(id)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error || new Error('원장 행을 삭제하지 못했습니다.'))
  })
}

/** 복원·초기화: 기존 행을 비우고 전부 다시 씀(고아 레코드 제거) */
export async function writeAllLedgerLines(lines: VaultTransaction[]): Promise<void> {
  const db = await openDb()
  if (!db.objectStoreNames.contains(LEDGER_LINES_STORE)) {
    throw new Error('ledger_lines store is missing')
  }
  return new Promise((resolve, reject) => {
    const tx = db.transaction(LEDGER_LINES_STORE, 'readwrite')
    const store = tx.objectStore(LEDGER_LINES_STORE)
    store.clear()
    for (const row of lines) {
      store.put(row)
    }
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error || new Error('원장을 덮어쓰지 못했습니다.'))
  })
}
