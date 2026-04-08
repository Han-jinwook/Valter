import { useMemo, useState, useEffect } from 'react'
import ReactECharts from 'echarts-for-react'
import { selectSankeyModel } from '../../selectors/vaultSelectors'
import { useUIStore } from '../../stores/uiStore'

const periodOptions = [
  { key: 'last_7d', label: '최근 7일' },
  { key: 'this_month', label: '이번 달' },
]

const nodeColors = {
  income: '#0057bd',
  pool: '#6e9fff',
  expense: '#a53046',
  debt: '#6a5b00',
  saving: '#2f7d32',
}

export default function VaultSankeyCard({ transactions = [], chartHeight = 220 }) {
  const [period, setPeriod] = useState('last_7d')
  const isLeftExpanded = useUIStore((s) => s.isLeftExpanded)
  const isChartMode = useUIStore((s) => s.isChartMode)
  const model = useMemo(
    () => selectSankeyModel(transactions, { confirmedOnly: true, period }),
    [transactions, period]
  )

  const option = useMemo(() => {
    const nodes = model.nodes.map((node) => ({
      name: node.id,
      itemStyle: { color: nodeColors[node.group] || '#747779' },
      label: {
        color: '#2c2f31',
        fontSize: 11,
        formatter: () => node.name,
      },
    }))
    const links = model.links.map((link) => ({
      ...link,
      lineStyle: { color: 'source', curveness: 0.45, opacity: 0.35 },
    }))

    return {
      animationDuration: 500,
      tooltip: {
        trigger: 'item',
        backgroundColor: '#ffffff',
        borderColor: '#e5e9eb',
        borderWidth: 1,
        textStyle: { color: '#2c2f31' },
        formatter: (params) => {
          if (params.dataType === 'edge') {
            return `${params.data.sourceLabel || params.data.source} → ${params.data.targetLabel || params.data.target}<br/>₩${Number(params.data.value || 0).toLocaleString('ko-KR')}`
          }
          return `${params.data.label || params.data.name}`
        },
      },
      series: [
        {
          type: 'sankey',
          left: 8,
          right: 8,
          top: 8,
          bottom: 8,
          nodeWidth: 16,
          nodeGap: 14,
          emphasis: { focus: 'adjacency' },
          data: nodes,
          links,
          draggable: false,
          lineStyle: { color: 'source', curveness: 0.45, opacity: 0.35 },
          label: { color: '#2c2f31', fontWeight: 600 },
        },
      ],
    }
  }, [model])

  useEffect(() => {
    const timer = setTimeout(() => {
      window.dispatchEvent(new Event('resize'))
    }, 520)
    return () => clearTimeout(timer)
  }, [isLeftExpanded, isChartMode])

  return (
    <div className="bg-surface-container-low p-4 rounded-xl">
      <div className="flex items-center justify-between gap-2 mb-3">
        <h4 className="text-[11px] font-bold text-outline uppercase">자금 흐름도 (Sankey)</h4>
        <div className="flex items-center gap-1 bg-surface-container rounded-full p-1">
          {periodOptions.map((p) => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-colors ${
                period === p.key
                  ? 'bg-primary text-white'
                  : 'text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {model.links.length === 0 ? (
        <div
          className="rounded-lg bg-surface-container-high/50 flex items-center justify-center text-xs text-outline"
          style={{ height: chartHeight }}
        >
          표시할 확정 데이터가 아직 없습니다.
        </div>
      ) : (
        <ReactECharts option={option} style={{ height: chartHeight, width: '100%' }} notMerge lazyUpdate />
      )}

      <div className="mt-2 flex items-center justify-between text-[10px] text-outline">
        <span>{model.periodLabel} 기준</span>
        <span>as of {model.asOf}</span>
      </div>
    </div>
  )
}

