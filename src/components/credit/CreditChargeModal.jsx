import { useState, useEffect } from 'react'
import { useUIStore } from '../../stores/uiStore'

const options = [
  { id: 1, credits: '1,000', price: '1,000원', icon: 'add_circle' },
  { id: 2, credits: '5,000', price: '5,000원', icon: 'stars', popular: true },
  { id: 3, credits: '10,000', price: '10,000원', icon: 'local_fire_department' },
]

export default function CreditChargeModal() {
  const { closeCreditModal } = useUIStore()
  const [selected, setSelected] = useState(2)

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') closeCreditModal() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [closeCreditModal])

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeCreditModal} />

      {/* Modal */}
      <div className="bg-surface-container-lowest w-full max-w-md rounded-xl shadow-2xl overflow-hidden flex flex-col p-6 relative z-10">
        {/* Close */}
        <button
          onClick={closeCreditModal}
          className="absolute top-6 right-6 text-outline hover:text-on-surface transition-colors"
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        {/* Header */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-on-surface mb-1">크레딧 충전소</h2>
          <p className="text-sm text-on-surface-variant">원하시는 금액을 선택해 주세요</p>
        </div>

        {/* Current balance */}
        <div className="bg-surface-container-low rounded-2xl p-5 mb-8 flex justify-between items-center">
          <span className="text-sm font-semibold text-on-surface-variant">현재 잔액</span>
          <div className="flex items-center gap-1">
            <span className="text-lg font-extrabold text-primary tabular-nums">1,250.3 C</span>
            <span className="text-on-surface-variant text-sm font-medium">남음</span>
          </div>
        </div>

        {/* Options */}
        <div className="space-y-3 mb-10">
          {options.map((opt) => {
            const isSelected = selected === opt.id
            return (
              <button
                key={opt.id}
                onClick={() => setSelected(opt.id)}
                className={`w-full flex items-center justify-between p-5 bg-surface-container-lowest rounded-2xl transition-all active:scale-[0.98] ${
                  isSelected
                    ? 'border-2 border-primary ring-4 ring-primary/5'
                    : 'border-2 border-surface-container-high hover:border-primary'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary-container/20 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                      {opt.icon}
                    </span>
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold text-on-surface tabular-nums">{opt.credits} C</span>
                      {opt.popular && (
                        <span className="px-2 py-0.5 bg-secondary text-[10px] text-white font-bold rounded-full">인기</span>
                      )}
                    </div>
                    <div className="text-xs text-on-surface-variant">{opt.price} 결제</div>
                  </div>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  isSelected ? 'border-primary' : 'border-surface-container-high'
                }`}>
                  <div className={`w-3 h-3 rounded-full bg-primary transition-opacity ${
                    isSelected ? 'opacity-100' : 'opacity-0'
                  }`} />
                </div>
              </button>
            )
          })}
        </div>

        {/* CTA */}
        <button className="w-full bg-gradient-to-tr from-primary to-primary-container py-5 rounded-2xl text-white font-bold text-lg shadow-lg shadow-primary/20 active:scale-[0.97] transition-transform">
          충전하기
        </button>
        <p className="mt-4 text-center text-xs text-on-surface-variant font-medium">
          결제 시 약관에 동의하는 것으로 간주됩니다.
        </p>
      </div>
    </div>
  )
}
