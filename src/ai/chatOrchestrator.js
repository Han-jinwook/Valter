import { detectIntent } from './intentRouter'
import { requestLowCostParse, requestHighReasoningAdvice } from '../services/aiGateway'

/**
 * Hybrid 3-tier chat orchestrator
 * - tier1_local_router: local intent + route/action
 * - tier2_low_cost: parse/classification JSON
 * - tier3_high_reasoning: deep advice text
 */
export async function runChatPipeline(input, handlers = {}) {
  const intent = detectIntent(input)

  if (intent.tier === 'tier1_local_router') {
    if (intent.route && handlers.onRoute) handlers.onRoute(intent.route)
    return { tier: intent.tier, intent: intent.intent, kind: 'action', route: intent.route }
  }

  if (intent.tier === 'tier2_low_cost') {
    const parsed = await requestLowCostParse(input, handlers.context || {})
    if (handlers.onParsed) handlers.onParsed(parsed)
    return { tier: intent.tier, intent: intent.intent, kind: 'parse', data: parsed }
  }

  const advice = await requestHighReasoningAdvice(input, handlers.context || {})
  if (handlers.onAdvice) handlers.onAdvice(advice)
  return { tier: intent.tier, intent: intent.intent, kind: 'advice', data: advice }
}

