import { useEffect, useMemo, useState } from 'react'
import { useUIStore } from '../stores/uiStore'
import { useVaultStore } from '../stores/vaultStore'

const initialLedgerRows = [
  { id: 1, date: '2026.04.05', name: 'Netflix 구독', location: '자동결제', category: '미디어', status: 'ok', amount: -17000, icon: 'subscriptions', iconBg: '#e5e9eb', iconColor: '#595c5e' },
  { id: 2, date: '2026.04.05', name: '고메 버거 키친', location: '서울, KR', category: null, status: 'needs_review', amount: -18500, icon: 'restaurant', iconBg: '#ffc2c7', iconColor: '#891a33' },
  { id: 3, date: '2026.04.04', name: '급여 입금', location: 'Vaulter Corp', category: '수입', status: 'ok', amount: 3200000, icon: 'payments', iconBg: '#6e9fff', iconColor: '#002150' },
  { id: 4, date: '2026.04.03', name: '스팀 상점', location: '온라인 결제', category: '게임', status: 'ok', amount: -65000, icon: 'videogame_asset', iconBg: '#fcdf46', iconColor: '#5d5000' },
  { id: 5, date: '2026.04.02', name: '카카오택시', location: '서울 → 강남', category: '교통', status: 'ok', amount: -15200, icon: 'local_taxi', iconBg: '#fcdf46', iconColor: '#5d5000' },
  { id: 6, date: '2026.04.01', name: '쿠팡 마켓', location: '온라인 쇼핑', category: null, status: 'needs_review', amount: -42000, icon: 'shopping_bag', iconBg: '#ffc2c7', iconColor: '#891a33' },
]

function fmtAmount(n) {
  const abs = Math.abs(n).toLocaleString('ko-KR')
  return n > 0 ? `+ ₩${abs}` : `- ₩${abs}`
}

export default function LedgerPage() {
  const [rows, setRows] = useState(initialLedgerRows)
  const [activeFilter, setActiveFilter] = useState('all')
  const openChatPanel = useUIStore((s) => s.openChatPanel)
  const askLedgerReview = useVaultStore((s) => s.askLedgerReview)
  const lastLedgerDecision = useVaultStore((s) => s.lastLedgerDecision)
  const clearLedgerDecision = useVaultStore((s) => s.clearLedgerDecision)

  useEffect(() => {
    if (!lastLedgerDecision) return
    setRows((prev) =>
      prev.map((r) =>
        r.id === lastLedgerDecision.ledgerTxId
          ? { ...r, category: lastLedgerDecision.category, status: 'ok' }
          : r
      )
    )
    clearLedgerDecision()
  }, [lastLedgerDecision, clearLedgerDecision])

  const reviewCount = rows.filter((r) => r.status === 'needs_review').length
  const filteredRows = useMemo(() => {
    if (activeFilter === 'review') return rows.filter((r) => r.status === 'needs_review')
    if (activeFilter === 'income') return rows.filter((r) => r.amount > 0)
    if (activeFilter === 'expense') return rows.filter((r) => r.amount < 0)
    return rows
  }, [rows, activeFilter])

  const openReviewChat = (tx) => {
    openChatPanel()
    askLedgerReview(tx)
  }

  return (
    <section className="bg-surface-container-lowest rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-6 md:p-8 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs text-on-surface-variant font-bold tracking-widest uppercase">Transactions</p>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">거래내역 통제실</h1>
        </div>
        <div className="flex items-center gap-2">
          <FilterChip active={activeFilter === 'all'} onClick={() => setActiveFilter('all')} label="전체" />
          <FilterChip active={activeFilter === 'review'} onClick={() => setActiveFilter('review')} label={`🚨 검토 필요 (${reviewCount})`} />
          <FilterChip active={activeFilter === 'income'} onClick={() => setActiveFilter('income')} label="수입" />
          <FilterChip active={activeFilter === 'expense'} onClick={() => setActiveFilter('expense')} label="지출" />
        </div>
      </div>

      <div className="space-y-3">
        {filteredRows.map((tx) => (
          <button
            key={tx.id}
            onClick={() => openReviewChat(tx)}
            className="w-full text-left bg-white border border-surface-container rounded-2xl p-4 md:p-5 hover:border-primary/25 hover:bg-surface-container-low/30 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: tx.iconBg }}>
                <span className="material-symbols-outlined" style={{ color: tx.iconColor }}>{tx.icon}</span>
              </div>

              <div className="min-w-0">
                <p className="font-bold leading-tight truncate">{tx.name}</p>
                <p className="text-xs text-on-surface-variant mt-1">{tx.date} · {tx.location}</p>
              </div>

              <div className="ml-auto flex items-center gap-3 md:gap-5">
                <div className="flex items-center gap-2">
                  {tx.category ? (
                    <span className="px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface-variant text-[11px] font-bold">
                      {tx.category}
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 text-[11px] font-bold">
                      분류 대기
                    </span>
                  )}
                  {tx.status === 'needs_review' && (
                    <span className="px-2.5 py-1 rounded-full bg-red-100 text-red-700 text-[11px] font-bold">
                      🚨 검토 필요
                    </span>
                  )}
                </div>

                <span className={`font-extrabold tabular-nums text-lg ${tx.amount > 0 ? 'text-primary' : 'text-[#2f3235]'}`}>
                  {fmtAmount(tx.amount)}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  )
}

function FilterChip({ active, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
        active
          ? 'bg-primary text-white'
          : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
      }`}
    >
      {label}
    </button>
  )
}
