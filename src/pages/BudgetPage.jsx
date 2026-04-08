import { useState } from 'react'
import { useVaultStore } from '../stores/vaultStore'
import { useUIStore } from '../stores/uiStore'

const alertOptions = ['한 달 전', '1주 전', '하루 전', '당일', '알림 끔']

const initialRows = [
  { id: 1, name: '아파트 관리비', kind: 'regular', amount: 250000, notify: '하루 전' },
  { id: 2, name: '속도위반 벌금', kind: 'onetime', amount: 120000, notify: '1주 전' },
  { id: 3, name: '가족 여행 예산', kind: 'onetime', amount: 1800000, notify: '한 달 전' },
  { id: 4, name: '자동차 보험 갱신', kind: 'regular', amount: 98000, notify: '당일' },
]

const goalCards = [
  { id: 1, emoji: '✈️', title: '올여름 하와이 가족 여행', current: 1850000, target: 3000000, dday: 'D-120' },
  { id: 2, emoji: '💻', title: '업무용 노트북 업그레이드', current: 1275000, target: 1500000, dday: 'D-35' },
  { id: 3, emoji: '🏠', title: '내 집 마련 초기 자금', current: 9200000, target: 20000000, dday: 'D-420' },
]

function pct(current, target) {
  return Math.min(100, Math.round((current / target) * 100))
}

export default function BudgetPage() {
  const [rows, setRows] = useState(initialRows)
  const simulateEmailLanding = useVaultStore((s) => s.simulateEmailLanding)
  const openChatPanel = useUIStore((s) => s.openChatPanel)

  const setNotify = (id, notify) => {
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, notify } : row)))
  }

  const runLandingSimulation = () => {
    openChatPanel()
    simulateEmailLanding()
  }

  const monthlyBudget = 3200000
  const monthlySpent = 1845000
  const monthlyRemain = monthlyBudget - monthlySpent
  const monthlyPct = Math.round((monthlySpent / monthlyBudget) * 100)

  return (
    <section className="space-y-6">
      {/* Hero: goals first */}
      <div className="bg-surface-container-lowest rounded-xl p-6 md:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
        <div>
          <p className="text-xs font-bold text-on-surface-variant tracking-widest uppercase">예산 & 목표</p>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">나의 꿈과 목표</h1>
          <p className="text-sm text-on-surface-variant mt-1">가슴 뛰는 목표를 먼저 보고, 아래에서 지출/알림을 통제합니다.</p>
        </div>

        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {goalCards.map((goal) => {
            const progress = pct(goal.current, goal.target)
            return (
              <article key={goal.id} className="bg-white rounded-2xl border border-surface-container shadow-sm p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-2xl">{goal.emoji}</div>
                  <span className="text-xs font-bold text-outline">{goal.dday}</span>
                </div>
                <h3 className="font-bold text-sm leading-snug min-h-[38px]">{goal.title}</h3>
                <div className="mt-3 w-full h-2.5 rounded-full bg-surface-container-low overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all duration-700" style={{ width: `${progress}%` }} />
                </div>
                <div className="mt-2 flex items-center justify-between text-xs">
                  <span className="text-on-surface-variant">진행률 {progress}%</span>
                  <span className="font-bold tabular-nums text-primary">
                    ₩{goal.current.toLocaleString('ko-KR')} / ₩{goal.target.toLocaleString('ko-KR')}
                  </span>
                </div>
              </article>
            )
          })}
        </div>
      </div>

      {/* Monthly budget strip */}
      <div className="bg-surface-container-lowest rounded-xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
        <div className="flex flex-wrap items-end justify-between gap-3 mb-3">
          <h2 className="text-lg font-bold">이번 달 가용 예산</h2>
          <div className="text-sm font-bold tabular-nums">
            <span className="text-on-surface-variant mr-2">잔액</span>
            <span className="text-primary">₩{monthlyRemain.toLocaleString('ko-KR')}</span>
          </div>
        </div>
        <div className="w-full h-3 rounded-full bg-surface-container-low overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all duration-700" style={{ width: `${monthlyPct}%` }} />
        </div>
        <div className="mt-2 text-xs text-on-surface-variant">
          ₩{monthlySpent.toLocaleString('ko-KR')} 사용 / 총 예산 ₩{monthlyBudget.toLocaleString('ko-KR')}
        </div>
      </div>

      {/* Alert table as supporter */}
      <div className="bg-surface-container-lowest rounded-xl p-6 md:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <p className="text-xs font-bold text-on-surface-variant tracking-widest uppercase">서포터 영역</p>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">고정 지출 및 알림 통제실</h2>
            <p className="text-sm text-on-surface-variant mt-1">목표 달성을 방해하는 고정 지출과 알림 타이밍을 관리하세요.</p>
          </div>
          <button
            onClick={runLandingSimulation}
            className="px-4 py-2 rounded-full bg-primary text-white text-sm font-bold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all active:scale-95"
          >
            🔔 이메일 랜딩 시뮬레이션
          </button>
        </div>

        <div className="overflow-x-auto rounded-xl border border-surface-container">
        <table className="w-full border-collapse">
          <thead className="bg-surface-container-low/50">
            <tr>
              <th className="px-5 py-3 text-left text-[10px] uppercase tracking-wider text-outline font-bold">항목명</th>
              <th className="px-5 py-3 text-left text-[10px] uppercase tracking-wider text-outline font-bold">유형</th>
              <th className="px-5 py-3 text-right text-[10px] uppercase tracking-wider text-outline font-bold">예상 금액</th>
              <th className="px-5 py-3 text-left text-[10px] uppercase tracking-wider text-outline font-bold">알림 설정</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-surface-container hover:bg-surface-container-low/40 transition-colors">
                <td className="px-5 py-4">
                  <div className="font-semibold text-on-surface">{row.name}</div>
                </td>
                <td className="px-5 py-4">
                  {row.kind === 'regular' ? (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-primary/10 text-primary">
                      정기성(매월)
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-tertiary-container/30 text-on-tertiary-container">
                      일회성
                    </span>
                  )}
                </td>
                <td className="px-5 py-4 text-right font-bold tabular-nums">₩{row.amount.toLocaleString('ko-KR')}</td>
                <td className="px-5 py-4">
                  <div className="flex flex-wrap gap-2">
                    {alertOptions.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => setNotify(row.id, opt)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${
                          row.notify === opt
                            ? 'bg-primary/12 text-primary border-primary/25'
                            : 'bg-white text-on-surface-variant border-surface-container hover:border-primary/20'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </section>
  )
}
