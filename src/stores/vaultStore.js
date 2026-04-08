import { create } from 'zustand'

function timeNow() {
  return new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
}

let _id = 100

const initialTransactions = [
  { id: 1, date: '2026.04.05', name: '고메 버거 키친', location: '서울, KR', category: '식비', icon: 'restaurant', iconBg: '#ffc2c7', iconColor: '#891a33', status: 'confirmed', amount: -18500 },
  { id: 2, date: '2026.04.04', name: '급여 입금', location: 'Vaulter Corp', category: '수입', icon: 'payments', iconBg: '#6e9fff', iconColor: '#002150', status: 'confirmed', amount: 3200000 },
  { id: 3, date: '2026.04.04', name: '카카오페이 송금', location: '김민수', category: null, icon: 'currency_exchange', iconBg: '#fcdf46', iconColor: '#5d5000', status: 'unconfirmed', amount: -50000 },
  { id: 4, date: '2026.04.03', name: '스팀 상점', location: '온라인 결제', category: '게임', icon: 'videogame_asset', iconBg: '#fcdf46', iconColor: '#5d5000', status: 'confirmed', amount: -65000 },
  { id: 5, date: '2026.04.02', name: 'Netflix 구독', location: '자동결제', category: '미디어', icon: 'subscriptions', iconBg: '#e5e9eb', iconColor: '#595c5e', status: 'confirmed', amount: -17000 },
]

const initialMessages = [
  {
    id: 1, role: 'ai', type: 'text',
    text: '안녕하세요! 금고지기 AI입니다. 이번 달 지출 내역을 분석해 보았어요. 공과금 관리를 아주 효율적으로 잘하고 계시네요!',
    time: '오전 10:30',
  },
  {
    id: 2, role: 'ai', type: 'confirm',
    text: '4월 4일 "카카오페이 송금" ₩50,000 내역이 있네요. 이 송금은 어떤 분류인가요?',
    txId: 3,
    options: [
      { label: '축의금', category: '경조사' },
      { label: '더치페이', category: '식비' },
      { label: '개인 송금', category: '이체' },
    ],
    time: '오전 10:30',
  },
]

export const useVaultStore = create((set, get) => ({
  transactions: initialTransactions,
  messages: initialMessages,
  hoveredTxId: null,
  isDragging: false,
  isProcessing: false,

  setHoveredTx: (id) => set({ hoveredTxId: id }),
  setDragging: (v) => set({ isDragging: v }),

  askAboutTransaction: (txId) => {
    const tx = get().transactions.find((t) => t.id === txId)
    if (!tx || tx.status !== 'unconfirmed') return
    const alreadyAsked = get().messages.some((m) => m.type === 'confirm' && m.txId === txId && !m.resolved)
    if (alreadyAsked) return

    set((s) => ({
      messages: [...s.messages, {
        id: ++_id, role: 'ai', type: 'confirm',
        text: `${tx.date} "${tx.name}" ₩${Math.abs(tx.amount).toLocaleString()} 내역이 있네요. 이 송금은 어떤 분류인가요?`,
        txId,
        options: [
          { label: '축의금', category: '경조사' },
          { label: '더치페이', category: '식비' },
          { label: '개인 송금', category: '이체' },
          { label: '기타', category: '기타' },
        ],
        time: timeNow(),
      }],
    }))
  },

  confirmTransaction: (txId, category) => {
    const tx = get().transactions.find((t) => t.id === txId)
    if (!tx) return

    set((s) => ({
      transactions: s.transactions.map((t) =>
        t.id === txId ? { ...t, status: 'confirmed', category } : t
      ),
      messages: [
        ...s.messages.map((m) =>
          m.type === 'confirm' && m.txId === txId ? { ...m, resolved: true } : m
        ),
        { id: ++_id, role: 'user', type: 'text', text: category, time: timeNow() },
        { id: ++_id, role: 'ai', type: 'text', text: `"${tx.name}"을(를) "${category}"(으)로 분류 완료했습니다!`, time: timeNow() },
      ],
    }))
  },

  processDroppedFiles: async () => {
    set({ isProcessing: true, isDragging: false })

    set((s) => ({
      messages: [...s.messages, { id: ++_id, role: 'ai', type: 'processing', text: '', time: timeNow() }],
    }))

    await new Promise((r) => setTimeout(r, 2800))

    const newTxId = ++_id
    const newTxs = [
      { id: ++_id, date: '2026.04.05', name: '맥도날드 강남점', location: '서울, KR', category: '식비', icon: 'fastfood', iconBg: '#ffc2c7', iconColor: '#891a33', status: 'confirmed', amount: -8900 },
      { id: ++_id, date: '2026.04.05', name: 'GS25 편의점', location: '서울역점', category: '생활', icon: 'local_convenience_store', iconBg: '#e5e9eb', iconColor: '#595c5e', status: 'confirmed', amount: -4200 },
      { id: newTxId, date: '2026.04.05', name: '토스 송금', location: '이영희', category: null, icon: 'currency_exchange', iconBg: '#fcdf46', iconColor: '#5d5000', status: 'unconfirmed', amount: -35000 },
    ]

    set((s) => ({
      isProcessing: false,
      transactions: [...newTxs, ...s.transactions],
      messages: [
        ...s.messages.filter((m) => m.type !== 'processing'),
        {
          id: ++_id, role: 'ai', type: 'result',
          text: '총 3건의 내역을 분석 및 분류했습니다.',
          subtitle: '직접 하셨다면 약 12분이 소요되었을 작업입니다',
          credit: '-0.3',
          time: timeNow(),
        },
        {
          id: ++_id, role: 'ai', type: 'confirm',
          text: '4월 5일 "토스 송금" ₩35,000 내역이 있네요. 이 송금은 어떤 분류인가요?',
          txId: newTxId,
          options: [
            { label: '축의금', category: '경조사' },
            { label: '더치페이', category: '식비' },
            { label: '개인 송금', category: '이체' },
            { label: '기타', category: '기타' },
          ],
          time: timeNow(),
        },
      ],
    }))
  },
}))
