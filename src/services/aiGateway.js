import { z } from 'zod'

const ParseResultSchema = z.object({
  amount: z.number().optional(),
  category: z.string().optional(),
  merchant: z.string().optional(),
  confidence: z.number().min(0).max(1).optional(),
  rawText: z.string().optional(),
})

const AdviceResultSchema = z.object({
  answer: z.string(),
  creditCost: z.number().optional(),
})

async function postJson(url, payload) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error(`AI gateway failed: ${res.status}`)
  return res.json()
}

// Tier-2: low cost parsing
export async function requestLowCostParse(input, context = {}) {
  const data = await postJson('/.netlify/functions/ai-parse', { input, context })
  return ParseResultSchema.parse(data)
}

// Tier-3: high reasoning advice
export async function requestHighReasoningAdvice(input, context = {}) {
  const data = await postJson('/.netlify/functions/ai-advice', { input, context })
  return AdviceResultSchema.parse(data)
}

