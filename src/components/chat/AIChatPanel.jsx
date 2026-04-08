import { useState, useEffect, useRef } from 'react'
import { useVaultStore } from '../../stores/vaultStore'
import { useUIStore } from '../../stores/uiStore'

export default function AIChatPanel() {
  const { messages, hoveredTxId, transactions, confirmTransaction, isProcessing } = useVaultStore()
  const isChartMode = useUIStore((s) => s.isChartMode)
  const openVizMode = useUIStore((s) => s.openVizMode)
  const restoreTrinityMode = useUIStore((s) => s.restoreTrinityMode)
  const [input, setInput] = useState('')
  const bottomRef = useRef(null)

  const hoveredTx = hoveredTxId ? transactions.find((t) => t.id === hoveredTxId) : null

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <aside className="w-[380px] shrink-0 bg-surface-container-lowest/80 backdrop-blur-xl rounded-xl shadow-2xl flex flex-col overflow-hidden hidden lg:flex">
      {/* Header */}
      <div className="p-6 border-b border-surface-container">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary-container flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined text-white text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                smart_toy
              </span>
            </div>
            <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 border-2 border-surface-container-lowest rounded-full ${isProcessing ? 'bg-amber-400 animate-pulse' : 'bg-green-500'}`} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-on-surface">금고 AI</h2>
            <p className="text-[11px] text-on-surface-variant font-medium">
              {isProcessing ? '분석 중...' : '재무 비서 · 온라인'}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-grow overflow-y-auto p-6 space-y-4 text-sm custom-scrollbar">
        {messages.map((msg) => (
          <ChatBubble key={msg.id} msg={msg} transactions={transactions} onConfirm={confirmTransaction} />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Hover Context Chip */}
      {hoveredTx && (
        <div className="px-6 py-2 animate-fade-in">
          <div className="bg-primary/5 border border-primary/15 rounded-xl px-4 py-2.5 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-base">visibility</span>
            <span className="text-xs">
              <span className="text-primary font-bold">{hoveredTx.name}</span>
              <span className="text-on-surface-variant ml-1">내역 선택됨</span>
            </span>
            <span className="ml-auto text-xs font-bold tabular-nums text-on-surface-variant">
              {hoveredTx.amount > 0 ? '+' : ''}₩{Math.abs(hoveredTx.amount).toLocaleString()}
            </span>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-6 pt-3">
        <div className="relative flex items-center bg-surface-container-low rounded-2xl p-2 px-4 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full bg-transparent border-none focus:ring-0 focus:outline-none text-sm py-2 placeholder:text-outline-variant"
            placeholder="검색, 질문, 기록 등 무엇이든 지시하세요..."
          />
          <button
            onClick={isChartMode ? restoreTrinityMode : openVizMode}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors active:scale-95 shrink-0 mr-2 ${
              isChartMode
                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                : 'bg-surface-container-high text-on-surface hover:bg-surface-container-highest'
            }`}
            title="데이터 시각화"
          >
            <span className="material-symbols-outlined text-lg">radio_button_checked</span>
          </button>
          <button className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center shadow-lg shadow-primary/30 hover:scale-105 transition-transform active:scale-95 shrink-0">
            <span className="material-symbols-outlined text-xl">send</span>
          </button>
        </div>
      </div>
    </aside>
  )
}

function ChatBubble({ msg, transactions, onConfirm }) {
  if (msg.type === 'processing') {
    return (
      <div className="flex flex-col gap-1 max-w-[85%] animate-fade-in">
        <div className="bg-surface-container-low p-4 rounded-2xl rounded-tl-none">
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-primary/70 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span className="text-on-surface-variant text-xs">영수증을 분석하고 있습니다...</span>
          </div>
        </div>
      </div>
    )
  }

  if (msg.type === 'result') {
    return (
      <div className="flex flex-col gap-1 max-w-[85%] animate-fade-in">
        <div className="bg-primary/5 border border-primary/10 p-4 rounded-2xl rounded-tl-none space-y-2">
          <p className="text-on-surface leading-relaxed font-semibold">{msg.text}</p>
          <div className="pt-1 border-t border-primary/10 flex justify-between items-center text-[11px]">
            <span className="text-on-surface-variant italic">{msg.subtitle}</span>
            <span className="text-primary font-bold tabular-nums">소모: {msg.credit} C</span>
          </div>
        </div>
        <span className="text-[10px] text-outline ml-1">{msg.time}</span>
      </div>
    )
  }

  if (msg.type === 'confirm') {
    const tx = transactions.find((t) => t.id === msg.txId)
    const isResolved = msg.resolved || (tx && tx.status === 'confirmed')
    return (
      <div className="flex flex-col gap-1 max-w-[85%] animate-fade-in">
        <div className="bg-surface-container-low text-on-surface p-4 rounded-2xl rounded-tl-none leading-relaxed">
          {msg.text}
        </div>
        {!isResolved ? (
          <div className="flex flex-wrap gap-2 mt-1 ml-1">
            {msg.options.map((opt) => (
              <button
                key={opt.label}
                onClick={() => onConfirm(msg.txId, opt.category)}
                className="px-3 py-1.5 bg-primary/5 text-primary text-xs font-bold rounded-lg border border-primary/15 hover:bg-primary hover:text-white transition-all duration-200 active:scale-95"
              >
                {opt.label}
              </button>
            ))}
          </div>
        ) : (
          <div className="ml-1 mt-1 flex items-center gap-1.5 text-[11px] text-green-600 font-medium">
            <span className="material-symbols-outlined text-sm">check_circle</span>
            분류 완료
          </div>
        )}
        <span className="text-[10px] text-outline ml-1">{msg.time}</span>
      </div>
    )
  }

  if (msg.role === 'user') {
    return (
      <div className="flex flex-col gap-1 items-end ml-auto max-w-[85%] animate-fade-in">
        <div className="bg-primary text-white p-4 rounded-2xl rounded-tr-none shadow-md shadow-primary/20 leading-relaxed">
          {msg.text}
        </div>
        <span className="text-[10px] text-outline mr-1">{msg.time}</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-1 max-w-[85%] animate-fade-in">
      <div className="bg-surface-container-low text-on-surface p-4 rounded-2xl rounded-tl-none leading-relaxed">
        {msg.text}
      </div>
      <span className="text-[10px] text-outline ml-1">{msg.time}</span>
    </div>
  )
}
