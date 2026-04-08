const routeRules = [
  { intent: 'open_keeper', pattern: /(지기|메인|홈|대시보드)/i, path: '/' },
  { intent: 'open_ledger', pattern: /(내역|원장|거래)/i, path: '/ledger' },
  { intent: 'open_assets', pattern: /(자산|포트폴리오|황금자산)/i, path: '/assets' },
  { intent: 'open_budget', pattern: /(예산|목표|플랜)/i, path: '/budget' },
  { intent: 'open_vault', pattern: /(비밀금고|증빙|계약서|보증서|문서)/i, path: '/vault' },
]

const parseRules = [
  /(축의금|더치페이|개인\s*송금|분류)/i,
  /(카카오페이|토스|송금).*(\d{1,3}(,\d{3})*|\d+)\s*원/i,
]

const adviceRules = [
  /(재조정|전략|어떻게|추천|상담|분석|시나리오)/i,
  /(식비|고정지출|저축).*(늘|줄|관리)/i,
]

export function detectIntent(input = '') {
  const text = String(input).trim()
  if (!text) return { tier: 'tier1_local_router', intent: 'empty' }

  for (const rule of routeRules) {
    if (rule.pattern.test(text)) {
      return { tier: 'tier1_local_router', intent: rule.intent, route: rule.path }
    }
  }

  if (parseRules.some((r) => r.test(text))) {
    return { tier: 'tier2_low_cost', intent: 'parse_transaction' }
  }

  if (adviceRules.some((r) => r.test(text))) {
    return { tier: 'tier3_high_reasoning', intent: 'financial_advice' }
  }

  return { tier: 'tier2_low_cost', intent: 'general_parse' }
}

