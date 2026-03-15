import type {StoryStatus, StoryType} from '@api/story/story.ts'

export const storyTypeLabelMap: Record<Exclude<StoryType, 'ALL'>, string> = {
  SHORT: '短篇',
  LONG: '长篇',
  SCRIPT: '剧本',
  VIDEO: '视频',
}

export const storyStatusLabelMap: Record<Exclude<StoryStatus, 'ALL'>, string> = {
  DRAFT: '草稿',
  WRITING: '连载中',
  COMPLETED: '已完结',
}

export type StoryTypeKey = keyof typeof storyTypeLabelMap | 'ALL'
