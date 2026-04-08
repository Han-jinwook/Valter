const fixedExpenses = [
  { icon: 'subscriptions', name: 'Netflix 구독', desc: '월 자동결제', amount: 17000 },
  { icon: 'cell_tower', name: '통신비', desc: '가족 데이터 결합', amount: 50000 },
  { icon: 'home', name: '주택 담보 대출', desc: '할부 24/60', amount: 850000 },
]

const variableBudgets = [
  { label: '외식', spent: 180000, budget: 300000, color: '#a53046' },
  { label: '쇼핑', spent: 45000, budget: 150000, color: '#0057bd' },
  { label: '교통', spent: 80000, budget: 100000, color: '#6a5b00' },
]

const savingsGoals = [
  { icon: 'laptop_mac', name: '새 맥북 프로', saved: 1500000, goal: 2000000, pct: 75, gradient: 'from-blue-50 to-white', border: 'border-primary/10', color: 'text-primary', bgColor: 'bg-primary' },
  { icon: 'flight', name: '제주도 가족 여행', saved: 400000, goal: 1000000, pct: 40, gradient: 'from-red-50 to-white', border: 'border-secondary/10', color: 'text-secondary', bgColor: 'bg-secondary' },
]

export default function BudgetPage() {
  return (
    <>
      {/* Summary */}
      <section className="bg-surface-container-lowest p-8 rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-end">
            <div>
              <span className="text-xs font-bold text-on-surface-variant tracking-widest uppercase">가용 자금</span>
              <h1 className="text-4xl font-extrabold text-on-surface mt-1 tabular-nums">₩450,000</h1>
            </div>
            <span className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
              +2.5% 지난달 대비
            </span>
          </div>

          {/* Stacked bar */}
          <div className="h-6 w-full flex rounded-full overflow-hidden bg-surface-container-low">
            <div className="h-full bg-primary flex items-center justify-center text-[10px] text-white font-bold" style={{ width: '45%' }}>수입</div>
            <div className="h-full bg-secondary flex items-center justify-center text-[10px] text-white font-bold" style={{ width: '30%' }}>고정</div>
            <div className="h-full bg-tertiary-container flex items-center justify-center text-[10px] text-on-tertiary-container font-bold" style={{ width: '15%' }}>변동</div>
            <div className="h-full bg-surface-container-highest" style={{ width: '10%' }} />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 text-center">
            {[
              { label: '총 수입', value: '₩3,200,000', color: 'text-primary' },
              { label: '고정 지출', value: '₩1,850,000', color: 'text-secondary' },
              { label: '변동 예산', value: '₩900,000', color: 'text-tertiary' },
              { label: '저축 잠재력', value: '₩450,000', color: 'text-on-surface' },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-[10px] font-bold text-on-surface-variant">{s.label}</p>
                <p className={`text-sm font-bold tabular-nums ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fixed + Variable grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Fixed Expenses */}
        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">lock</span>
              고정 지출
            </h2>
            <span className="text-xs font-semibold text-on-surface-variant">{fixedExpenses.length}개 항목</span>
          </div>
          <div className="flex flex-col gap-3">
            {fixedExpenses.map((item) => (
              <div key={item.name} className="group flex items-center justify-between p-3 rounded-2xl bg-surface-container-low hover:bg-surface-container transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-surface-container-lowest flex items-center justify-center">
                    <span className="material-symbols-outlined text-on-surface text-lg">{item.icon}</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold">{item.name}</p>
                    <p className="text-xs text-on-surface-variant">{item.desc}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-bold tabular-nums">₩{item.amount.toLocaleString()}</span>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1 hover:text-primary"><span className="material-symbols-outlined text-sm">edit</span></button>
                    <button className="p-1 hover:text-secondary"><span className="material-symbols-outlined text-sm">close</span></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Variable Budget */}
        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-tertiary">category</span>
              변동 예산
            </h2>
            <span className="text-xs font-semibold text-on-surface-variant">추적 중</span>
          </div>
          <div className="flex flex-col gap-5">
            {variableBudgets.map((b) => (
              <div key={b.label} className="flex flex-col gap-2">
                <div className="flex justify-between text-xs font-bold">
                  <span>{b.label}</span>
                  <span style={{ color: b.color }}>
                    ₩{b.spent.toLocaleString()} / ₩{b.budget.toLocaleString()}
                  </span>
                </div>
                <div className="h-3 w-full bg-surface-container-low rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${(b.spent / b.budget) * 100}%`, backgroundColor: b.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Savings & Quest Goals */}
      <div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">military_tech</span>
            저축 및 퀘스트
          </h2>
          <button className="text-xs font-bold text-primary hover:underline">+ 새 목표</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {savingsGoals.map((g) => (
            <div key={g.name} className={`relative overflow-hidden p-6 rounded-2xl bg-gradient-to-br ${g.gradient} border ${g.border}`}>
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-surface-container-lowest rounded-2xl shadow-sm flex items-center justify-center">
                  <span className={`material-symbols-outlined ${g.color}`}>{g.icon}</span>
                </div>
                <span className={`text-2xl font-black ${g.color} opacity-20`}>{g.pct}%</span>
              </div>
              <h3 className="font-bold text-on-surface">{g.name}</h3>
              <p className="text-xs text-on-surface-variant mb-4 tabular-nums">
                ₩{g.saved.toLocaleString()} / ₩{g.goal.toLocaleString()}
              </p>
              <div className="h-2 w-full bg-surface-container-lowest/50 rounded-full overflow-hidden">
                <div className={`h-full ${g.bgColor} transition-all duration-700`} style={{ width: `${g.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
