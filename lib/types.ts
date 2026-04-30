export interface DayContent {
  day: number
  date: string
  instagram: PlatformContent
  tiktok: PlatformContent
  bluesky: PlatformContent
}

export interface PlatformContent {
  type: string
  imagePrompt?: string
  caption?: string
  script?: string
  text?: string
  raw: string
}

export interface AppState {
  days: DayContent[]
  selectedDay: number
  activePlatform: 'instagram' | 'tiktok' | 'bluesky'
  generatedImages: Record<string, string[]>
  completedTasks: string[]
}

export interface ParsedStrategy {
  title: string
  days: DayContent[]
}
