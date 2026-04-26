/**
 * 지기 원장 카테고리 정책
 * - 상환(카드대금·대출)은 현금은 나가나 "소비/예산" 통계에서는 제외한다.
 */
export const NON_BUDGET_EXPENSE_CATEGORIES = ['카드대금 결제', '대출 상환'] as const

export function isConsumptiveLedgerExpense(tx: { type: string; category?: string }): boolean {
  if (tx.type !== 'EXPENSE') return false
  const c = String(tx.category || '').trim()
  return !(NON_BUDGET_EXPENSE_CATEGORIES as readonly string[]).includes(c)
}
