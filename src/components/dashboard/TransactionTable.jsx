import { useVaultStore } from '../../stores/vaultStore'

const statusStyles = {
  confirmed: { dot: 'bg-green-500', text: 'text-green-700', label: '확정' },
  unconfirmed: { dot: 'bg-amber-400 animate-pulse', text: 'text-amber-600', label: '미확정', clickable: true },
  pending: { dot: 'bg-surface-container-highest', text: 'text-outline', label: '예정' },
}

function fmtAmount(n) {
  const abs = Math.abs(n).toLocaleString('ko-KR')
  return n > 0 ? `+₩${abs}` : `-₩${abs}`
}

export default function TransactionTable() {
  const { transactions, hoveredTxId, setHoveredTx, askAboutTransaction } = useVaultStore()

  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden flex flex-col flex-grow min-h-[380px]">
      {/* Header */}
      <div className="px-8 py-6 border-b border-surface-container flex justify-between items-center">
        <h3 className="font-bold text-lg">최근 거래 내역</h3>
        <div className="flex gap-2">
          <button className="p-2 hover:bg-surface-container rounded-lg text-outline transition-colors">
            <span className="material-symbols-outlined text-xl">filter_list</span>
          </button>
          <button className="p-2 hover:bg-surface-container rounded-lg text-outline transition-colors">
            <span className="material-symbols-outlined text-xl">download</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-low/50">
              {['날짜', '가맹점 / 상세', '카테고리', '상태', '금액'].map((col, i) => (
                <th
                  key={col}
                  className={`px-8 py-4 text-[10px] font-bold text-outline uppercase tracking-wider ${i === 4 ? 'text-right' : ''}`}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-container">
            {transactions.map((tx) => {
              const st = statusStyles[tx.status] || statusStyles.pending
              const isHovered = hoveredTxId === tx.id
              return (
                <tr
                  key={tx.id}
                  onMouseEnter={() => setHoveredTx(tx.id)}
                  onMouseLeave={() => setHoveredTx(null)}
                  className={`transition-all duration-200 cursor-pointer ${
                    isHovered
                      ? 'bg-primary/[0.04] shadow-[inset_3px_0_0_var(--color-primary)]'
                      : 'hover:bg-surface-container-low/60'
                  } ${tx.status === 'unconfirmed' ? 'bg-amber-50/40' : ''}`}
                >
                  {/* 날짜 */}
                  <td className="px-8 py-5 text-sm text-outline tabular-nums">{tx.date}</td>

                  {/* 가맹점 */}
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                        style={{ backgroundColor: tx.iconBg }}
                      >
                        <span className="material-symbols-outlined text-sm" style={{ color: tx.iconColor }}>
                          {tx.icon}
                        </span>
                      </div>
                      <div>
                        <div className="font-bold text-sm">{tx.name}</div>
                        <div className="text-[10px] text-outline">{tx.location}</div>
                      </div>
                    </div>
                  </td>

                  {/* 카테고리 */}
                  <td className="px-8 py-5">
                    {tx.category ? (
                      <span className="px-2 py-1 bg-surface-container-high text-on-surface-variant text-[10px] rounded-md font-bold">
                        {tx.category}
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-amber-100 text-amber-700 text-[10px] rounded-md font-bold">
                        분류 대기
                      </span>
                    )}
                  </td>

                  {/* 상태 */}
                  <td className="px-8 py-5">
                    <button
                      onClick={(e) => {
                        if (!st.clickable) return
                        e.stopPropagation()
                        askAboutTransaction(tx.id)
                      }}
                      className={`flex items-center gap-1.5 text-[10px] font-bold ${st.text} ${
                        st.clickable ? 'hover:underline cursor-pointer' : 'cursor-default'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${st.dot}`} />
                      {st.label}
                    </button>
                  </td>

                  {/* 금액 */}
                  <td className={`px-8 py-5 text-right font-bold tabular-nums ${tx.amount > 0 ? 'text-primary' : 'text-secondary'}`}>
                    {fmtAmount(tx.amount)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="h-1 w-full bg-surface-container-low cursor-row-resize hover:bg-primary/20 transition-colors mt-auto" />
    </div>
  )
}
