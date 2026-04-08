import { useMemo, useState } from 'react'
import { useVaultStore } from '../../stores/vaultStore'

const weekdays = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일']

function fmtAmount(n) {
  const abs = Math.abs(n).toLocaleString('ko-KR')
  return n > 0 ? `+₩${abs}` : `-₩${abs}`
}

function fmtDateGroup(rawDate) {
  const [year, month, day] = String(rawDate).split('.').map(Number)
  const d = new Date(year, month - 1, day)
  return `${month}월 ${day}일 ${weekdays[d.getDay()]}`
}

export default function TransactionTable() {
  const { transactions, hoveredTxId, setHoveredTx } = useVaultStore()
  const [activeFilter, setActiveFilter] = useState('all')

  const reviewCount = transactions.filter((tx) => tx.status === 'PENDING').length

  const filteredTransactions = useMemo(() => {
    if (activeFilter === 'review') return transactions.filter((tx) => tx.status === 'PENDING')
    if (activeFilter === 'income') return transactions.filter((tx) => tx.amount > 0)
    if (activeFilter === 'expense') return transactions.filter((tx) => tx.amount < 0)
    return transactions
  }, [transactions, activeFilter])

  const groupedTransactions = useMemo(() => {
    return filteredTransactions.reduce((groups, tx) => {
      const last = groups[groups.length - 1]
      if (!last || last.date !== tx.date) {
        groups.push({ date: tx.date, items: [tx] })
      } else {
        last.items.push(tx)
      }
      return groups
    }, [])
  }, [filteredTransactions])

  return (
    <div
      id="data-vault-ledger"
      className="bg-surface-container-lowest rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden flex flex-col flex-grow min-h-[380px]"
    >
      {/* Header */}
      <div className="px-8 py-6 border-b border-surface-container flex flex-wrap justify-between items-center gap-3">
        <h3 className="font-bold text-lg">데이터 원장 (Data Vault Ledger)</h3>
        <div className="flex flex-wrap gap-2">
          <FilterChip
            label="전체"
            active={activeFilter === 'all'}
            onClick={() => setActiveFilter('all')}
          />
          <FilterChip
            label={`🚨 검토 필요 (${reviewCount})`}
            active={activeFilter === 'review'}
            onClick={() => setActiveFilter('review')}
          />
          <FilterChip
            label="수입"
            active={activeFilter === 'income'}
            onClick={() => setActiveFilter('income')}
          />
          <FilterChip
            label="지출"
            active={activeFilter === 'expense'}
            onClick={() => setActiveFilter('expense')}
          />
        </div>
      </div>

      <div className="px-8 pb-2 overflow-y-auto custom-scrollbar">
        {groupedTransactions.map((group) => (
          <div key={group.date} className="pt-4">
            <div className="text-gray-500 text-sm font-medium pb-2">{fmtDateGroup(group.date)}</div>
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden divide-y divide-gray-100">
              {group.items.map((tx) => {
                const isHovered = hoveredTxId === tx.id
                return (
                  <div
                    key={tx.id}
                    onMouseEnter={() => setHoveredTx(tx.id)}
                    onMouseLeave={() => setHoveredTx(null)}
                    className={`px-4 md:px-5 py-4 bg-transparent transition-colors ${
                      isHovered ? 'bg-primary/[0.05]' : 'hover:bg-surface-container-low/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                        style={{ backgroundColor: tx.iconBg }}
                      >
                        <span className="material-symbols-outlined text-base" style={{ color: tx.iconColor }}>
                          {tx.icon}
                        </span>
                      </div>

                      <div className="min-w-0">
                        <p className="font-bold text-sm text-gray-900 truncate">{tx.name}</p>
                        <p className="text-[11px] text-gray-500 mt-0.5">{tx.location}</p>
                      </div>

                      <div className="ml-auto flex items-center gap-2 pr-2">
                        {tx.category ? (
                          <span className="px-2.5 py-1 bg-surface-container-high text-on-surface-variant text-[10px] rounded-full font-bold">
                            {tx.category}
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 bg-amber-100 text-amber-700 text-[10px] rounded-full font-bold">
                            분류 대기
                          </span>
                        )}
                        {tx.status === 'PENDING' && (
                          <span className="px-2.5 py-1 bg-red-100 text-red-700 text-[10px] rounded-full font-bold">
                            🚨 검토 필요
                          </span>
                        )}
                      </div>

                      <div className={`text-right text-lg font-bold tabular-nums ${tx.amount > 0 ? 'text-primary' : 'text-gray-900'}`}>
                        {fmtAmount(tx.amount)}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function FilterChip({ label, active, onClick }) {
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
