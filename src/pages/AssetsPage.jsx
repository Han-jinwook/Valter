import { useMemo } from 'react'
import ReactECharts from 'echarts-for-react'

const summaryCards = [
  { label: '총 평가금액', amount: 12450000, tone: 'text-gray-900' },
  { label: '이번 달 증감', amount: 850000, tone: 'text-teal-600', prefix: '+' },
  { label: '현금화 가능 자산', amount: 6120000, tone: 'text-gray-900' },
]

const allocation = [
  { name: '현금성 자산', amount: 3500000, color: '#FFD700' },
  { name: '국내/해외 투자', amount: 5250000, color: '#1C3A36' },
  { name: '부동산/실물', amount: 3700000, color: '#26334D' },
]

const rebalanceIdeas = [
  '현금성 자산 비중이 목표 대비 4% 낮습니다. 이번 달 저축분 일부를 안전자산으로 이동해 보세요.',
  '투자 자산 변동성이 높아졌습니다. 분기 리밸런싱 시점을 2주 앞당기는 것을 권장합니다.',
]

export default function AssetsPage() {
  const chartOption = useMemo(() => {
    const total = allocation.reduce((sum, a) => sum + a.amount, 0)
    return {
      tooltip: {
        trigger: 'item',
        backgroundColor: '#1a1a1a',
        borderColor: '#FFD700',
        borderWidth: 1,
        textStyle: { color: '#EDEDED' },
        formatter: (params) =>
          `${params.name}<br/>₩${Number(params.value).toLocaleString('ko-KR')} (${params.percent}%)`,
      },
      series: [
        {
          type: 'pie',
          radius: ['50%', '78%'],
          center: ['50%', '50%'],
          padAngle: 2,
          minAngle: 8,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#121212',
            borderWidth: 2,
          },
          label: { show: true, color: '#EDEDED', fontSize: 11, formatter: '{b}' },
          emphasis: {
            scale: true,
            scaleSize: 10,
            itemStyle: { shadowBlur: 22, shadowColor: 'rgba(255,215,0,0.42)' },
          },
          data: allocation.map((a) => ({
            value: a.amount,
            name: a.name,
            itemStyle:
              a.name === '현금성 자산'
                ? {
                    color: a.color,
                    shadowBlur: 16,
                    shadowColor: 'rgba(255,215,0,0.35)',
                  }
                : { color: a.color },
          })),
        },
      ],
      graphic: [
        {
          type: 'text',
          left: 'center',
          top: '46%',
          style: {
            text: '황금자산',
            fill: '#F1C40F',
            fontSize: 12,
            fontWeight: 600,
          },
        },
        {
          type: 'text',
          left: 'center',
          top: '52%',
          style: {
            text: `₩${total.toLocaleString('ko-KR')}`,
            fill: '#FFD700',
            fontSize: 20,
            fontWeight: 800,
          },
        },
      ],
    }
  }, [])

  return (
    <div className="-mx-4 md:-mx-8 px-4 md:px-8 py-6 min-h-full space-y-6 bg-[#F8F9FA]">
      <section className="bg-white rounded-xl p-8 shadow-[0_8px_20px_rgba(0,0,0,0.05)] border border-gray-100">
        <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
          <div>
            <p className="text-xs text-gray-500 font-bold tracking-widest uppercase">황금자산 포트폴리오</p>
            <h1 className="text-3xl md:text-4xl font-extrabold tabular-nums mt-1 text-gray-900">₩12,450,000</h1>
            <p className="text-xs text-gray-500 mt-1">자산 가치를 한눈에 보는 프리미엄 통제실</p>
          </div>
          <span className="px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-bold">2026년 4월 기준</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {summaryCards.map((item) => (
            <div key={item.label} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
              <p className="text-[11px] text-gray-500 font-bold mb-1">{item.label}</p>
              <p className={`text-xl font-bold tabular-nums ${item.tone}`}>
                {item.prefix || ''}₩{item.amount.toLocaleString('ko-KR')}
              </p>
            </div>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-6">
        <section className="bg-[#232323] rounded-xl p-6 shadow-[0_12px_32px_rgba(0,0,0,0.4)] border border-[#26334D]/20">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-[#EDEDED]">
            <span className="material-symbols-outlined text-[#F1C40F]">auto_graph</span>
            포트폴리오 비중
          </h2>
          <div className="rounded-2xl bg-gradient-to-br from-[#1f1f1f] to-[#171717] border border-[#26334D]/25 p-4">
            <ReactECharts option={chartOption} style={{ height: 360, width: '100%' }} notMerge lazyUpdate />
          </div>
        </section>

        <div className="p-[1px] rounded-xl bg-[#FFD700]/50 shadow-[0_12px_32px_rgba(0,0,0,0.4)] hover:shadow-[0_0_0_1px_rgba(255,215,0,0.55),0_0_24px_rgba(255,215,0,0.35)] transition-all duration-300">
          <section className="bg-[#232323] rounded-xl p-6 h-full">
            <h2
              className="text-lg mb-4 flex items-center gap-2 text-[#EDEDED]"
              style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontWeight: 700 }}
            >
              <span className="material-symbols-outlined text-[#F1C40F]">workspace_premium</span>
              VIP 자산 리포트
            </h2>
            <div className="space-y-3">
              {rebalanceIdeas.map((tip) => (
                <div
                  key={tip}
                  className="rounded-xl bg-[#121212] border border-[#26334D]/20 p-4 text-sm leading-relaxed text-[#EDEDED]"
                >
                  {tip}
                </div>
              ))}
            </div>
            <button className="mt-4 w-full py-3 rounded-xl bg-gradient-to-r from-[#F1C40F] via-[#FFD700] to-[#F1C40F] text-[#121212] font-bold shadow-[0_0_18px_rgba(255,215,0,0.28)] hover:shadow-[0_0_28px_rgba(255,215,0,0.5)] transition-all">
              PB 시나리오 시뮬레이션 실행
            </button>
          </section>
        </div>
      </div>
    </div>
  )
}

