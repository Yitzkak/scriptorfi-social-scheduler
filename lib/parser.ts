import { DayContent, PlatformContent } from './types'

export function parseStrategy(markdown: string): DayContent[] {
  const days: DayContent[] = []

  // Split by DAY headers
  const dayBlocks = markdown.split(/\n# DAY (\d+) /)
  
  // The first element is header/structure content, skip it
  for (let i = 1; i < dayBlocks.length; i += 2) {
    const dayNum = parseInt(dayBlocks[i])
    const block = dayBlocks[i + 1]
    if (!block) continue

    const day: DayContent = {
      day: dayNum,
      date: extractDateFromBlock(block, dayNum),
      instagram: extractPlatform(block, 'Instagram'),
      tiktok: extractPlatform(block, 'TikTok'),
      bluesky: extractPlatform(block, 'Bluesky'),
    }

    days.push(day)
  }

  // Sort by day number
  days.sort((a, b) => a.day - b.day)
  return days
}

function extractDateFromBlock(block: string, dayNum: number): string {
  // Map day numbers to dates (our 14-day calendar starts Apr 28)
  const startDate = new Date(2026, 3, 27) // Apr 27, 2026
  const d = new Date(startDate)
  d.setDate(d.getDate() + dayNum)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function extractPlatform(block: string, platform: string): PlatformContent {
  const sectionRegex = new RegExp(`## ${platform} [^]*?(?=\n## |\n\n# |$)`)
  const match = block.match(sectionRegex)
  
  const raw = match ? match[0].trim() : ''
  
  // Extract image prompt (ChatGPT Image Prompt)
  const imagePromptMatch = raw.match(/\*\*ChatGPT Image Prompt:\*\*\s*([\s\S]*?)(?=\n\*\*|$)/)
  const imagePrompt = imagePromptMatch ? imagePromptMatch[1].trim() : undefined

  // Extract caption (Instagram/TikTok) or text content
  const captionMatch = raw.match(/\*\*Caption:\*\*\s*```\s*([\s\S]*?)```/)
  const caption = captionMatch ? captionMatch[1].trim() : undefined

  // Extract script (TikTok)
  const scriptMatch = raw.match(/\*\*Script:\*\*\s*```\s*([\s\S]*?)```/)
  const script = scriptMatch ? scriptMatch[1].trim() : undefined
  
  // Extract thread text (Bluesky)
  const textMatch = raw.match(/\*\*Post.*?:\*\*\s*```\s*([\s\S]*?)```/)
  const text = textMatch ? textMatch[1].trim() : undefined

  // Determine the type
  let type = 'post'
  if (raw.includes('Reel')) type = 'reel'
  else if (raw.includes('Carousel')) type = 'carousel'
  else if (raw.includes('Thread')) type = 'thread'
  else if (raw.includes('Single image')) type = 'single'

  return { raw, imagePrompt, caption, script, text, type }
}
