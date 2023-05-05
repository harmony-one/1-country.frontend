import { type Block, BlockMap, type ExtendedRecordMap } from 'notion-types'

interface BlockEntry {
  role: string
  value: Block
}
export const extractTitle = (blocks: BlockEntry[]): string => {
  return blocks[0].value.properties?.title?.flat().join(' ')
}

export const extractPageEmoji = (blocks: BlockEntry[]): string | undefined => {
  return blocks[0].value?.format?.page_icon
}

export const extractPageCover = (blocks: BlockEntry[]): string | undefined => {
  return blocks[0].value?.format?.page_cover
}

export const extractPageImagePreview = (
  page: ExtendedRecordMap
): string | undefined => {
  const blocks = Object.values(page.block)
  console.log(
    blocks[0].value.id,
    page.signed_urls[blocks[0].value.id],
    page.signed_urls
  )
  return page.signed_urls[blocks[0].value.id] || extractPageCover(blocks)
}

export const extractTextFromBlock = (block: BlockEntry): string => {
  if (block.value.type === 'text') {
    return block?.value?.properties?.title?.flat().join(' ') as string
  }
  return ''
}
export const extractDescription = (page: ExtendedRecordMap): string => {
  const blocks = Object.values(page.block)
  let currentBlock = blocks[0]
  if (!currentBlock) {
    return ''
  }
  if (!currentBlock.value.content) {
    return ''
  }
  const blockPaths = [...currentBlock.value.content].reverse()
  currentBlock = page.block[blockPaths.pop() as string]
  let desc = extractTextFromBlock(currentBlock)
  if (desc) {
    return desc
  }
  while (!desc) {
    if (currentBlock.value?.content) {
      blockPaths.push(...currentBlock.value.content.reverse())
    }
    if (blockPaths.length === 0) {
      return ''
    }
    currentBlock = page.block[blockPaths.pop() as string]
    desc = extractTextFromBlock(currentBlock)
    if (desc) {
      return desc
    }
  }
  return ''
}

export const makeEmojiDataUrl = (emoji: string): string => {
  return `data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>${emoji}</text></svg>`
}

export const extractEmoji = (text: string): string => {
  const m = text.match(
    /(\p{EPres}|\p{ExtPict})(\u200d(\p{EPres}|\p{ExtPict}))*/gu
  )
  if (m) {
    return m[0]
  }
  return ''
}

const HexRegex = /[0-9a-f]+/
export const isValidNotionPageId = (id: string): boolean => {
  if (id.length !== 32) {
    return false
  }
  if (!id.match(HexRegex)) {
    return false
  }
  return true
}

export const getValidSubpagesIds = (subpages: string[]): string[] => {
  if (subpages.length === 0) {
    return subpages
  }
  return subpages.filter((page) => isValidNotionPageId(page))
}
