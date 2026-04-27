import type { DocumentParseResult } from './visionAIEngine'

export type UploadFileKind = 'image' | 'csv' | 'xlsx' | 'pdf' | 'unsupported'

export type LocalDocumentExtraction = {
  documentType: 'csv' | 'xlsx' | 'pdf'
  sourceName: string
  textBlocks: string[]
  columnHints: string[]
  approxItemCount: number
}

function normalizeCell(value: unknown) {
  return String(value ?? '')
    .replace(/\s+/g, ' ')
    .trim()
}

function getFileExtension(fileName: string) {
  const parts = String(fileName || '').toLowerCase().split('.')
  return parts.length > 1 ? parts.pop() || '' : ''
}

function toSourceName(fileName: string) {
  return String(fileName || '문서')
    .replace(/\.[^.]+$/, '')
    .replace(/[_-]+/g, ' ')
    .trim() || '문서'
}

function isMostlyNumeric(text: string) {
  return /^[\d\s,./:-]+$/.test(text)
}

function looksLikeHeaderRow(row: string[]) {
  const meaningful = row.map(normalizeCell).filter(Boolean)
  if (meaningful.length < 2) return false
  const numericCount = meaningful.filter(isMostlyNumeric).length
  return numericCount <= Math.floor(meaningful.length / 2)
}

function rowsToTextBlocks(rows: string[][], prefix?: string) {
  if (!rows.length) {
    return {
      textBlocks: [] as string[],
      columnHints: [] as string[],
      approxItemCount: 0,
    }
  }

  const normalizedRows = rows
    .map((row) => row.map(normalizeCell))
    .filter((row) => row.some(Boolean))

  if (!normalizedRows.length) {
    return {
      textBlocks: [] as string[],
      columnHints: [] as string[],
      approxItemCount: 0,
    }
  }

  const headerRow = looksLikeHeaderRow(normalizedRows[0]) ? normalizedRows[0] : []
  const dataRows = headerRow.length ? normalizedRows.slice(1) : normalizedRows
  const labelPrefix = prefix ? `[${prefix}] ` : ''

  const textBlocks = dataRows.map((row, index) => {
    if (headerRow.length && row.length) {
      const pairs = row
        .map((cell, cellIndex) => {
          const header = normalizeCell(headerRow[cellIndex] || `col${cellIndex + 1}`)
          return `${header}: ${normalizeCell(cell)}`
        })
        .filter((entry) => !entry.endsWith(':'))
      return `${labelPrefix}row ${index + 1}: ${pairs.join(' | ')}`
    }
    return `${labelPrefix}row ${index + 1}: ${row.filter(Boolean).join(' | ')}`
  })

  return {
    textBlocks,
    columnHints: headerRow,
    approxItemCount: dataRows.length,
  }
}

async function parseCsvFile(file: File): Promise<LocalDocumentExtraction> {
  const Papa = (await import('papaparse')).default
  const text = await file.text()
  const parsed = Papa.parse<string[]>(text, {
    skipEmptyLines: 'greedy',
  })

  if (parsed.errors.length) {
    throw new Error(`CSV 파싱 실패: ${parsed.errors[0]?.message || '형식을 읽지 못했습니다.'}`)
  }

  const rows = Array.isArray(parsed.data) ? parsed.data : []
  const table = rowsToTextBlocks(rows)
  return {
    documentType: 'csv',
    sourceName: toSourceName(file.name),
    ...table,
  }
}

async function parseXlsxFile(file: File): Promise<LocalDocumentExtraction> {
  const XLSX = await import('xlsx')
  const buffer = await file.arrayBuffer()
  const workbook = XLSX.read(buffer, { type: 'array' })
  const sheetNames = workbook.SheetNames || []
  const allBlocks: string[] = []
  const allHints: string[] = []
  let approxItemCount = 0

  for (const sheetName of sheetNames) {
    const sheet = workbook.Sheets[sheetName]
    if (!sheet) continue
    const rows = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      raw: false,
      defval: '',
      blankrows: false,
    }) as string[][]
    const table = rowsToTextBlocks(rows, `sheet ${sheetName}`)
    allBlocks.push(...table.textBlocks)
    allHints.push(...table.columnHints)
    approxItemCount += table.approxItemCount
  }

  if (!allBlocks.length) {
    throw new Error('엑셀에서 읽을 수 있는 데이터 행을 찾지 못했습니다.')
  }

  return {
    documentType: 'xlsx',
    sourceName: toSourceName(file.name),
    textBlocks: allBlocks,
    columnHints: Array.from(new Set(allHints.filter(Boolean))).slice(0, 20),
    approxItemCount,
  }
}

async function parsePdfFile(file: File): Promise<LocalDocumentExtraction> {
  const pdfjs = await import('pdfjs-dist')
  const workerModule = await import('pdfjs-dist/build/pdf.worker.min.mjs?url')
  pdfjs.GlobalWorkerOptions.workerSrc = workerModule.default

  const data = new Uint8Array(await file.arrayBuffer())
  const pdf = await pdfjs.getDocument({ data }).promise
  const textBlocks: string[] = []

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum += 1) {
    const page = await pdf.getPage(pageNum)
    const content = await page.getTextContent()
    const pageText = content.items
      .map((item) => ('str' in item ? normalizeCell(item.str) : ''))
      .filter(Boolean)
      .join(' ')
      .trim()

    if (pageText) {
      textBlocks.push(`[page ${pageNum}] ${pageText}`)
    }
  }

  const totalLength = textBlocks.join('\n').trim().length
  if (totalLength < 40) {
    throw new Error('텍스트 레이어가 거의 없는 PDF입니다. 스캔형 PDF는 아직 지원되지 않습니다.')
  }

  return {
    documentType: 'pdf',
    sourceName: toSourceName(file.name),
    textBlocks,
    columnHints: [],
    approxItemCount: textBlocks.length,
  }
}

export function detectUploadFileKind(file: File): UploadFileKind {
  const type = String(file?.type || '').toLowerCase()
  const ext = getFileExtension(file?.name || '')

  if (type.startsWith('image/')) return 'image'
  if (type === 'application/pdf' || ext === 'pdf') return 'pdf'
  if (type.includes('csv') || ext === 'csv') return 'csv'
  if (
    type.includes('sheet') ||
    type.includes('excel') ||
    ext === 'xlsx' ||
    ext === 'xls'
  ) {
    return 'xlsx'
  }

  return 'unsupported'
}

export async function extractLocalDocument(file: File): Promise<LocalDocumentExtraction> {
  const kind = detectUploadFileKind(file)

  if (kind === 'csv') return parseCsvFile(file)
  if (kind === 'xlsx') return parseXlsxFile(file)
  if (kind === 'pdf') return parsePdfFile(file)

  throw new Error('지원되지 않는 문서 형식입니다.')
}

function buildExtractionFromCsvRows(rows: string[][], sourceName: string): LocalDocumentExtraction {
  const table = rowsToTextBlocks(rows)
  return {
    documentType: 'csv',
    sourceName: String(sourceName || '스프레드시트').trim() || '스프레드시트',
    ...table,
  }
}

/** Drive에서 내보낸 CSV 텍스트를 LocalDocumentExtraction으로 변환 */
export async function parseCsvText(csvText: string, sourceName: string): Promise<LocalDocumentExtraction> {
  const Papa = (await import('papaparse')).default
  const parsed = Papa.parse<string[]>(csvText, { skipEmptyLines: 'greedy' })
  if (parsed.errors.length && !parsed.data.length) {
    throw new Error(`CSV 파싱 실패: ${parsed.errors[0]?.message || '형식을 읽지 못했습니다.'}`)
  }
  const rows = Array.isArray(parsed.data) ? parsed.data : []
  return buildExtractionFromCsvRows(rows, sourceName)
}

/** GSheet/가계부 CSV(열 매칭) → 원장에 넣을 수 있는 `DocumentParseResult` 배열. 열이 안 맞으면 `null` */
export function tryStructuredLedgerFromRows(
  rows: string[][],
  sourceName: string,
): DocumentParseResult[] | null {
  return tryStructuredLedgerFromRowsImpl(rows, sourceName)
}

export type GsheetImportResult = {
  directItems: DocumentParseResult[] | null
  extraction: LocalDocumentExtraction
}

/**
 * Drive에서 내보낸 CSV: 구조화 파싱이 되면 `directItems`, 아니면 AI용 `extraction`만 씀.
 * `parseCsvText`와 동일한 Papa 병합 규칙.
 */
export async function parseGoogleSpreadsheetCsvForImport(
  csvText: string,
  sourceName: string,
): Promise<GsheetImportResult> {
  const Papa = (await import('papaparse')).default
  const parsed = Papa.parse<string[]>(csvText, { skipEmptyLines: 'greedy' })
  if (parsed.errors.length && !parsed.data.length) {
    throw new Error(`CSV 파싱 실패: ${parsed.errors[0]?.message || '형식을 읽지 못했습니다.'}`)
  }
  const rows = Array.isArray(parsed.data) ? (parsed.data as string[][]) : []
  const name = String(sourceName || '스프레드시트').trim() || '스프레드시트'
  const extraction = buildExtractionFromCsvRows(rows, name)
  const direct = tryStructuredLedgerFromRowsImpl(rows, name)
  return {
    directItems: direct && direct.length > 0 ? direct : null,
    extraction,
  }
}

// --- 구조화 가계부 (날짜·금액·적요 열 스코어) ---
// 대원칙(원장 5필드): 분류(카테고리) · 적요(가맹점명) · 계정(결제수단) · 금액 · 메모(비고, 선택)
// 4필드(분류·적요·계정·금액)는 반드시 채우고, 메모는 있으면 기록(없으면 빈칸, 불필요한 질문 없음)

const PAD = (n: string) => String(Number(n)).padStart(2, '0')

function parseLedgerDateCell(v: unknown): string | null {
  if (v == null) return null
  if (typeof v === 'number' && Number.isFinite(v) && v > 20000 && v < 100000) {
    const d = new Date((v - 25569) * 86400 * 1000)
    if (Number.isNaN(d.getTime())) return null
    return `${d.getUTCFullYear()}-${PAD(String(d.getUTCMonth() + 1))}-${PAD(String(d.getUTCDate()))}`
  }
  const t = String(v).replace(/\s+/g, ' ').trim()
  if (!t) return null
  const m4 = t.match(
    /(\d{4})[-./년]\s*(\d{1,2})[-./월]?\s*(\d{1,2})(?:일)?/,
  )
  if (m4) {
    return `${m4[1]}-${PAD(m4[2])}-${PAD(m4[3])}`
  }
  const m2 = t.match(
    /(\d{2})[.\-/]\s*(\d{1,2})[.\-/]\s*(\d{1,2})/,
  )
  if (m2) {
    const y = Number(m2[1])
    const fullY = y >= 50 ? 1900 + y : 2000 + y
    return `${fullY}-${PAD(m2[2])}-${PAD(m2[3])}`
  }
  return null
}

function parseAmountFromCell(v: unknown): number {
  if (typeof v === 'number' && Number.isFinite(v)) {
    return Math.abs(v)
  }
  const s = String(v ?? '').trim()
  if (!s) return 0
  const cleaned = s.replace(/[,，]/g, '').replace(/[^\d.-]/g, '')
  const n = Number(cleaned)
  return Number.isFinite(n) && n > 0 ? Math.abs(n) : 0
}

function parseSignedAmountFromCell(v: unknown): number | null {
  if (v === null || v === undefined || v === '') return null
  if (typeof v === 'number' && Number.isFinite(v) && v !== 0) {
    return v
  }
  const s0 = String(v).trim()
  if (!s0) return null
  const paren = /^\s*\(([\d,.\s]+)\)\s*$/.exec(s0)
  const s = s0.replace(/[,，]/g, '')
  const cleaned = s.replace(/[^\d.-]/g, '')
  const n = Number(cleaned)
  if (!Number.isFinite(n) || n === 0) return null
  if (paren) return -Math.abs(n)
  return n
}

type ColumnScores = {
  date: number
  amount: number
  out: number
  inc: number
  desc: number
  cat: number
  type: number
  account: number
  memo: number
}

function scoreHeaderCellForLedger(cell: string): ColumnScores {
  const c0 = String(cell).replace(/\s+/g, ' ').trim().toLowerCase()
  const c = c0.normalize('NFKC')
  const s: ColumnScores = {
    date: 0,
    amount: 0,
    out: 0,
    inc: 0,
    desc: 0,
    cat: 0,
    type: 0,
    account: 0,
    memo: 0,
  }
  if (!c) return s
  if (/(잔액|잔고|balance)/.test(c) && !/금액|합계|거래|적요|내용/.test(c)) {
    s.amount -= 3
  }
  if (/(날짜|일자|거래일|사용일|년월일|승인일|결제일)/.test(c) || c === 'date') s.date += 4
  if (/(지출\s*\(원\)|^지출\(원\)|지출액|출금|출금액)/.test(c) && !/수입/.test(c)) {
    s.out += 4
  } else if (c.includes('지출') && !c.includes('수입') && !c.includes('지출/수입')) {
    s.out += 3
  }
  if (/(수입\s*\(원\)|^수입\(원\)|수입액|입금|입금액)/.test(c) && !/지출/.test(c)) {
    s.inc += 4
  } else if (c.includes('입금') || (c.includes('수입') && !c.includes('지출') && c !== '지출/수입')) {
    s.inc += 3
  }
  if ((c.includes('금액') || c.includes('합계') || c === 'amount' || c === '₩' || c === '￦') && !/잔/.test(c)) {
    s.amount += 2
  }
  if (/(적요|내용|가맹점|상세|사용처|거래명|description|summary)/.test(c) && !/메모|비고|remarks?/.test(c)) {
    s.desc += 3
  }
  if (c.includes('분류') || c.includes('카테고리') || c.includes('category') || c === '항목' || c === 'type') s.cat += 2
  if (/(구분|유형|이체|transaction|거래구분|수지)/.test(c) || (c.length < 14 && c === 'type')) s.type += 2
  if (c === '메모' || c === '비고' || c === 'memo' || c === 'note' || c === 'remarks' || /^비고\(.+\)$/.test(c) || /^메모\(.+\)$/.test(c)) {
    s.memo += 4
  } else if ((c.startsWith('메모') || c.startsWith('비고')) && c.length < 24) {
    s.memo += 2
  }
  if (/(결제수단|결제방법|지불수단|이체수단|지불|payment|pay\s*method|payment\s*method)/.test(c) && c.length < 36) {
    s.account += 4
  } else if (c === '계정' || c === 'account') {
    s.account += 3
  } else if (/(카드|현금|통장|체크|승인)/.test(c) && !/(과목|코드|분류|금액|잔)/.test(c) && c.length < 20) {
    s.account += 1
  }
  return s
}

type ColMap = {
  date: number
  amount: number
  out: number
  inc: number
  desc: number
  cat: number
  type: number
  account: number
  memo: number
  totalScore: number
}

function pickColumnIndices(headerCells: string[]): ColMap | null {
  if (!headerCells.length) return null
  const scores: ColumnScores[] = headerCells.map(scoreHeaderCellForLedger)
  const used = new Set<number>()
  const take = (role: keyof ColumnScores) => {
    let best = -1
    let bestVal = 0.5
    for (let j = 0; j < scores.length; j += 1) {
      if (used.has(j)) continue
      const v = scores[j][role]
      if (v > bestVal) {
        bestVal = v
        best = j
      }
    }
    if (best < 0) return -1
    used.add(best)
    return best
  }
  const date = take('date')
  const out = take('out')
  const inc = take('inc')
  const type = take('type')
  const desc = take('desc')
  const cat = take('cat')
  const account = take('account')
  const memo = take('memo')
  let amount = take('amount')
  if (date < 0) return null
  if (out < 0 && inc < 0 && amount < 0) {
    let bestA = -1
    let bestN = 0.5
    const reserved = new Set(
      [date, out, inc, type, desc, cat, account, memo].filter((i) => i >= 0),
    )
    for (let j = 0; j < scores.length; j += 1) {
      if (reserved.has(j)) continue
      if (scores[j].memo >= 2 || scores[j].account >= 2) continue
      if (scores[j].amount + scores[j].out * 0.5 + scores[j].inc * 0.5 > bestN) {
        bestN = scores[j].amount + scores[j].out * 0.5 + scores[j].inc * 0.5
        bestA = j
      }
    }
    if (bestA < 0) {
      for (let j = 0; j < headerCells.length; j += 1) {
        if (reserved.has(j)) continue
        const h = String(headerCells[j] || '')
          .toLowerCase()
        if (/(잔액|잔고|^no\.?$|^[#＃])/.test(h)) continue
        if (scoreHeaderCellForLedger(h).date > 0) continue
        if (scoreHeaderCellForLedger(h).memo >= 2 || scoreHeaderCellForLedger(h).account >= 2) continue
        bestA = j
        break
      }
    }
    amount = bestA
  }
  const hasSplit = out >= 0 && inc >= 0
  if (!hasSplit && amount < 0) return null
  let total = 0
  if (date >= 0) total += scores[date].date
  if (hasSplit) {
    if (out >= 0) total += Math.max(2, scores[out].out)
    if (inc >= 0) total += Math.max(2, scores[inc].inc)
  } else if (amount >= 0) {
    total += Math.max(1, scores[amount].amount)
  }
  if (desc >= 0) total += 1
  if (cat >= 0) total += 1
  if (type >= 0) total += 0.5
  if (account >= 0) total += 0.3
  if (memo >= 0) total += 0.3
  if (total < 4) return null
  return {
    date,
    out,
    inc,
    amount,
    desc,
    cat,
    type,
    account,
    memo,
    totalScore: total,
  }
}

function isIncomeTypeCell(s: string): boolean {
  const t = s.replace(/\s+/g, ' ').trim()
  if (!t) return false
  if (/^(수입|입금|환급|이자|급여|plus|income|credit)/i.test(t)) return true
  if (/^(지출|출금|expense|debit)/i.test(t)) return false
  if (/(수입|입금|환급|급여)/.test(t) && !/지출|출금/.test(t)) return true
  return false
}

function tryStructuredLedgerFromRowsImpl(
  rows: string[][],
  sourceName: string,
): DocumentParseResult[] | null {
  const cleanRows = rows
    .map((row) => row.map((c) => normalizeCell(c)))
    .filter((row) => row.some(Boolean))
  if (cleanRows.length < 2) return null

  let best: { headerIdx: number; map: ColMap } | null = null
  for (let hi = 0; hi < Math.min(4, cleanRows.length); hi += 1) {
    if (!looksLikeHeaderRow(cleanRows[hi])) continue
    const m = pickColumnIndices(cleanRows[hi])
    if (m) {
      if (!best || m.totalScore > best.map.totalScore) {
        best = { headerIdx: hi, map: m }
      }
    }
  }
  if (!best) return null

  const { headerIdx, map: col } = best
  const dataStart = headerIdx + 1
  const results: DocumentParseResult[] = []
  const hasSplit = col.out >= 0 && col.inc >= 0
  const label = String(sourceName || '스프레드시트').trim() || '스프레드시트'

  for (let ri = dataStart; ri < cleanRows.length; ri += 1) {
    const row = cleanRows[ri]
    const dStr = row[col.date]
    const ymd = parseLedgerDateCell(dStr)
    if (!ymd) continue

    let amountAbs = 0
    let isIncome = false

    if (hasSplit) {
      const o = parseAmountFromCell(row[col.out])
      const ins = parseAmountFromCell(row[col.inc])
      if (o > 0 && ins > 0) continue
      if (o > 0) {
        amountAbs = o
        isIncome = false
      } else if (ins > 0) {
        amountAbs = ins
        isIncome = true
      } else {
        continue
      }
    } else {
      const rawCell = col.amount >= 0 ? row[col.amount] : undefined
      const sRaw = String(rawCell ?? '').trim()
      const sn = parseSignedAmountFromCell(rawCell)
      if (sn === null) continue
      amountAbs = Math.abs(sn)
      const typeCell = col.type >= 0 ? String(row[col.type] || '').trim() : ''
      if (typeCell) {
        if (/(지출|출금|debit|expense|이체\s*출금)/i.test(typeCell) && !/(수입|입금|환급|급여|이자)/.test(typeCell)) {
          isIncome = false
        } else if (isIncomeTypeCell(typeCell)) {
          isIncome = true
        } else {
          isIncome = sn > 0
        }
      } else if (sRaw.startsWith('(') || sRaw.startsWith('-') || sRaw.startsWith('－') || sRaw.startsWith('–') || sRaw.startsWith('—') || (typeof sn === 'number' && sn < 0)) {
        isIncome = false
      } else if (sRaw.startsWith('+') || sRaw.startsWith('＋')) {
        isIncome = true
      } else {
        const catH = [col.cat >= 0 ? row[col.cat] : '', col.desc >= 0 ? row[col.desc] : '']
          .map((x) => String(x || '').trim())
          .filter(Boolean)
          .join(' ')
        isIncome = /(환급|부수입|급여|이자|캐시백|보너스|배당|용돈|이체\s*입금|캐시|환불|적립|수입|입금|이체\s*수입|용돈)/.test(
          catH,
        ) && !/(쇼핑|식비|교통|마트|편|카페|구독|결제|의료|주유|생활|의류|뷰티|숙박)/.test(catH)
      }
    }

    if (amountAbs <= 0) continue

    const descText =
      (col.desc >= 0 && String(row[col.desc] || '').trim()) ||
      (col.cat >= 0 && !hasSplit && String(row[col.cat] || '').trim()) ||
      ''
    const rawCat = col.cat >= 0 ? String(row[col.cat] || '').trim() : ''
    const merchant = descText || rawCat || `${label} 항목`
    const accountStr = col.account >= 0 ? String(row[col.account] ?? '').trim() : ''
    const memoStr = col.memo >= 0 ? String(row[col.memo] ?? '').trim() : ''

    let category = '기타'
    if (isIncome) {
      if (rawCat) category = /급여|이자|환급|수입|부수입|기타|입금|plus/i.test(rawCat) ? rawCat : `기타 수입`
      else if (hasSplit) category = '기타 수입'
      else if (String(row[col.type] || '').toLowerCase().includes('환급')) category = '환급'
      else category = '기타 수입'
    } else {
      category = rawCat || '기타 지출'
    }

    results.push({
      merchant,
      date: ymd,
      amount: amountAbs,
      category,
      account: accountStr,
      memo: memoStr,
      reasoning: '',
      confidence: 0.9,
      sourceRef: `${label}:row${ri + 1}`,
    })
  }

  if (results.length < 1) return null
  return results
}
