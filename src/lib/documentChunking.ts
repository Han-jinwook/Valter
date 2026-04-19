import type { LocalDocumentExtraction } from './documentParsers'

export type DocumentChunk = {
  documentType: 'csv' | 'xlsx' | 'pdf'
  sourceName: string
  chunkIndex: number
  totalChunks: number
  chunkText: string
  columnHints: string[]
  itemStart: number
  itemEnd: number
}

const ROWS_PER_CHUNK = 75
const PDF_CHARS_PER_CHUNK = 5500

function buildChunkText(extraction: LocalDocumentExtraction, blocks: string[]) {
  const header = extraction.columnHints.length
    ? `column hints: ${extraction.columnHints.join(' | ')}\n`
    : ''
  return `${header}${blocks.join('\n')}`.trim()
}

export function buildDocumentChunks(extraction: LocalDocumentExtraction): DocumentChunk[] {
  const chunks: Omit<DocumentChunk, 'chunkIndex' | 'totalChunks'>[] = []

  if (extraction.documentType === 'pdf') {
    let current: string[] = []
    let currentLength = 0
    let itemStart = 1

    extraction.textBlocks.forEach((block, blockIndex) => {
      const nextLength = currentLength + block.length
      if (current.length && nextLength > PDF_CHARS_PER_CHUNK) {
        chunks.push({
          documentType: extraction.documentType,
          sourceName: extraction.sourceName,
          chunkText: buildChunkText(extraction, current),
          columnHints: extraction.columnHints,
          itemStart,
          itemEnd: blockIndex,
        })
        current = []
        currentLength = 0
        itemStart = blockIndex + 1
      }
      current.push(block)
      currentLength += block.length
    })

    if (current.length) {
      chunks.push({
        documentType: extraction.documentType,
        sourceName: extraction.sourceName,
        chunkText: buildChunkText(extraction, current),
        columnHints: extraction.columnHints,
        itemStart,
        itemEnd: extraction.textBlocks.length,
      })
    }
  } else {
    for (let index = 0; index < extraction.textBlocks.length; index += ROWS_PER_CHUNK) {
      const slice = extraction.textBlocks.slice(index, index + ROWS_PER_CHUNK)
      chunks.push({
        documentType: extraction.documentType,
        sourceName: extraction.sourceName,
        chunkText: buildChunkText(extraction, slice),
        columnHints: extraction.columnHints,
        itemStart: index + 1,
        itemEnd: index + slice.length,
      })
    }
  }

  return chunks.map((chunk, index, list) => ({
    ...chunk,
    chunkIndex: index + 1,
    totalChunks: list.length,
  }))
}
