const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      ...CORS_HEADERS,
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify(body),
  }
}

function safeParseJSON(text) {
  try {
    return JSON.parse(text)
  } catch {
    const match = String(text || '').match(/\{[\s\S]*\}/)
    if (!match) return null
    try {
      return JSON.parse(match[0])
    } catch {
      return null
    }
  }
}

function parseAmount(value) {
  if (typeof value === 'number' && Number.isFinite(value)) return Math.abs(value)
  const digits = String(value || '')
    .replace(/[^\d.-]/g, '')
    .trim()
  const n = Number(digits)
  if (!Number.isFinite(n)) return 0
  return Math.abs(n)
}

function normalizeCategory(rawCategory, sourceText) {
  const raw = String(rawCategory || '').trim()
  const key = raw.toLowerCase()
  const text = String(sourceText || '').toLowerCase()
  const dict = {
    subscription: '구독',
    subscriptions: '구독',
    media: '미디어',
    entertainment: '미디어',
    cloud: '클라우드',
    'cloud services': '클라우드',
    service: '서비스',
    services: '서비스',
    shopping: '쇼핑',
    food: '식비',
    transport: '교통',
    utility: '공과금',
    utilities: '공과금',
    tax: '세금',
    income: '수입',
    refund: '환급',
    transfer: '이체',
    others: '기타',
    other: '기타',
  }
  if (dict[key]) return dict[key]
  if (text.includes('netflix') || text.includes('youtube')) return '미디어'
  if (text.includes('openai') || text.includes('google cloud')) return '클라우드'
  if (text.includes('coupang') || text.includes('11st') || text.includes('gmarket')) return '쇼핑'
  return raw || '기타'
}

function normalizeModelData(data, fallbackSource) {
  const merchant = String(data?.merchant || '').trim() || '가맹점 미확인'
  const dateRaw = String(data?.date || '').trim()
  const dateMatch = dateRaw.match(/(\d{4})[-./](\d{2})[-./](\d{2})/)
  const date = dateMatch ? `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}` : null
  const amount = parseAmount(data?.amount)
  const confidence = Math.max(0, Math.min(1, Number(data?.confidence ?? 0.75)))
  return {
    merchant,
    date,
    amount,
    category: normalizeCategory(data?.category, `${fallbackSource}\n${merchant}`),
    reasoning: String(data?.reasoning || '').trim(),
    confidence,
  }
}

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS_HEADERS, body: '' }
  }
  if (event.httpMethod !== 'POST') {
    return json(405, { error: 'Method not allowed' })
  }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return json(503, { error: 'OPENAI_API_KEY is not configured' })
  }

  let requestBody
  try {
    requestBody = JSON.parse(event.body || '{}')
  } catch {
    return json(400, { error: 'Invalid JSON body' })
  }

  const subject = String(requestBody.subject || '')
  const from = String(requestBody.from || '')
  const date = String(requestBody.date || '')
  const snippet = String(requestBody.snippet || '')
  const body = String(requestBody.body || '')

  const sourceText = [subject, from, date, snippet, body].join('\n').trim()
  if (!sourceText) {
    return json(400, { error: 'Email text payload is empty' })
  }

  const systemPrompt = [
    '너는 대한민국 최고의 재무/회계 분류 전문가다.',
    'Gmail 결제/영수증 메일에서 결제 데이터를 구조화한다.',
    '광고/푸터/개인식별성이 불필요한 정보는 무시하고 merchant/date/amount/category/reasoning/confidence를 추출한다.',
    'amount는 반드시 숫자만 반환한다. 통화기호, 쉼표, KRW 문자열을 포함하지 않는다.',
    'category는 한국어 한 단어로 반환한다. (예: 식비, 쇼핑, 구독, 서비스, 미디어, 교통, 공과금, 세금, 수입, 환급, 이체, 기타)',
    '부가세 표기 문구는 세금 카테고리 근거로 사용하지 않는다.',
    '반드시 JSON 형식으로만 응답한다.',
    '{"merchant":"","date":"YYYY-MM-DD","amount":0,"category":"","reasoning":"","confidence":0.0}',
  ].join('\n')

  const openaiPayload = {
    model: 'gpt-4o-mini',
    temperature: 0.1,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: [
          '아래 이메일 결제 내역을 분석해 JSON으로만 답변해 주세요.',
          `subject: ${subject}`,
          `from: ${from}`,
          `date: ${date}`,
          `snippet: ${snippet}`,
          `body:\n${body}`,
        ].join('\n'),
      },
    ],
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(openaiPayload),
    })

    const raw = await response.text()
    if (!response.ok) {
      return json(response.status, { error: 'OpenAI request failed', detail: raw })
    }

    const parsed = safeParseJSON(raw)
    const content =
      parsed?.choices?.[0]?.message?.content ||
      parsed?.output_text ||
      ''
    const data = safeParseJSON(content)

    if (!data) {
      return json(502, { error: 'Failed to parse model JSON response', detail: content })
    }

    const normalized = normalizeModelData(data, sourceText)
    return json(200, { ok: true, data: normalized })
  } catch (error) {
    return json(500, {
      error: 'analyze-email-receipt exception',
      detail: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}
