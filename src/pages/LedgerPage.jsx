import { useState } from 'react'

const ledgerData = [
  { id: 1, date: '2026.04.05', name: 'Netflix 구독', location: '자동결제', category: '미디어', method: '자동이체', status: 'confirmed', amount: -17000, icon: 'subscriptions', iconBg: '#e5e9eb', iconColor: '#595c5e' },
  { id: 2, date: '2026.04.05', name: '고메 버거 키친', location: '서울, KR', category: '식비', method: '신용카드', status: 'editing', amount: -18500, icon: 'restaurant', iconBg: '#ffc2c7', iconColor: '#891a33' },
  { id: 3, date: '2026.04.04', name: '급여 입금', location: 'Vaulter Corp', category: '수입', method: '계좌이체', status: 'confirmed', amount: 3200000, icon: 'payments', iconBg: '#6e9fff', iconColor: '#002150' },
  { id: 4, date: '2026.04.03', name: '스팀 상점', location: '온라인 결제', category: '게임', method: '신용카드', status: 'confirmed', amount: -65000, icon: 'videogame_asset', iconBg: '#fcdf46', iconColor: '#5d5000' },
  { id: 5, date: '2026.04.02', name: '카카오택시', location: '서울 → 강남', category: '교통', method: '카카오페이', status: 'confirmed', amount: -15200, icon: 'local_taxi', iconBg: '#fcdf46', iconColor: '#5d5000' },
  { id: 6, date: '2026.04.01', name: '쿠팡 마켓', location: '온라인 쇼핑', category: '쇼핑', method: '신용카드', status: 'pending', amount: -42000, icon: 'shopping_bag', iconBg: '#ffc2c7', iconColor: '#891a33' },
  { id: 7, date: '2026.03.31', name: '스타벅스', location: '강남역점', category: '카페', method: '체크카드', status: 'confirmed', amount: -6500, icon: 'coffee', iconBg: '#edd139', iconColor: '#5c4f00' },
]

const statusConfig = {
  confirmed: { label: '확정', dotClass: 'bg-green-500', textClass: 'text-green-700' },
  editing: { label: '수정 중', dotClass: 'bg-primary', textClass: 'text-primary' },
  pending: { label: '미확정', dotClass: 'bg-amber-400 animate-pulse', textClass: 'text-amber-600' },
}

function fmt(n) {
  const abs = Math.abs(n).toLocaleString('ko-KR')
  return n > 0 ? `+ ₩${abs}` : `- ₩${abs}`
}

export default function LedgerPage() {
  const [selectedId, setSelectedId] = useState(2)

  return (
    <>
      {/* Header */}
      <div className="bg-surface-container-lowest rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden flex flex-col flex-grow">
        <div className="px-8 py-6 flex justify-between items-center border-b border-surface-container">
          <h3 className="text-xl font-extrabold tracking-tight">Data Vault 원장</h3>
          <div className="flex gap-2">
            <button className="p-2 hover:bg-surface-container rounded-full transition-colors">
              <span className="material-symbols-outlined text-on-surface-variant">filter_list</span>
            </button>
            <button className="p-2 hover:bg-surface-container rounded-full transition-colors">
              <span className="material-symbols-outlined text-on-surface-variant">search</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant border-b border-surface-container">
                <th className="px-8 py-4">상태</th>
                <th className="px-4 py-4">거래처</th>
                <th className="px-4 py-4">카테고리</th>
                <th className="px-4 py-4">결제 수단</th>
                <th className="px-8 py-4 text-right">금액</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {ledgerData.map((tx) => {
                const st = statusConfig[tx.status]
                const isSelected = tx.id === selectedId
                return (
                  <tr
                    key={tx.id}
                    onClick={() => setSelectedId(tx.id)}
                    className={`transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-primary/5 ring-1 ring-primary/20'
                        : 'hover:bg-surface-container-low'
                    }`}
                  >
                    <td className="px-8 py-5">
                      <span
                        className="material-symbols-outlined text-primary"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        {isSelected ? 'edit_square' : 'check_circle'}
                      </span>
                    </td>
                    <td className="px-4 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: tx.iconBg }}>
                          <span className="material-symbols-outlined text-sm" style={{ color: tx.iconColor }}>{tx.icon}</span>
                        </div>
                        <div>
                          <div className="font-bold">{tx.name}</div>
                          <div className="text-[10px] text-on-surface-variant">{tx.location}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-5">
                      <span className="px-3 py-1 bg-surface-container-high text-on-surface-variant rounded-full text-[10px] font-bold uppercase">
                        {tx.category}
                      </span>
                    </td>
                    <td className="px-4 py-5 text-on-surface-variant">{tx.method}</td>
                    <td className={`px-8 py-5 text-right font-bold tabular-nums ${tx.amount > 0 ? 'text-primary' : 'text-secondary'}`}>
                      {fmt(tx.amount)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Panel (shown below table when a row is selected) */}
      {selectedId && <EditPanel tx={ledgerData.find((t) => t.id === selectedId)} />}
    </>
  )
}

function EditPanel({ tx }) {
  if (!tx) return null
  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
      <div className="px-6 py-5 flex items-center justify-between border-b border-surface-container-low">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-on-surface-variant">arrow_back</span>
          <h3 className="font-extrabold text-lg tracking-tight">상세 내역 수정</h3>
        </div>
        <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-on-surface">close</span>
      </div>
      <div className="p-6 space-y-6">
        {/* Form fields */}
        <div className="space-y-4">
          <Field label="가맹점 이름" value={tx.name} />
          <div className="grid grid-cols-2 gap-4">
            <Field label="거래 날짜" value={tx.date} />
            <Field label="결제 수단" value={tx.method} />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-1 block mb-1.5">결제 금액</label>
            <input
              type="text"
              readOnly
              value={`₩ ${Math.abs(tx.amount).toLocaleString()}`}
              className="w-full bg-surface-container-low border-none rounded-xl px-4 py-4 text-right font-extrabold text-2xl text-secondary focus:ring-2 focus:ring-secondary/20 tabular-nums"
            />
          </div>
        </div>
        {/* Actions */}
        <div className="pt-2 flex gap-3">
          <button className="flex-1 bg-gradient-to-br from-primary to-primary-container text-white py-4 rounded-full font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
            수정 완료
          </button>
          <button className="flex-1 bg-surface-container-high text-error font-bold py-4 rounded-full hover:bg-error/10 active:scale-95 transition-all">
            내역 삭제하기
          </button>
        </div>
      </div>
    </div>
  )
}

function Field({ label, value }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">{label}</label>
      <input
        type="text"
        readOnly
        value={value}
        className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 font-semibold focus:ring-2 focus:ring-primary/20 transition-all"
      />
    </div>
  )
}
