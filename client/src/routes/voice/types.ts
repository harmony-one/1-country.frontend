export type RecordStatus = 'recording' | 'stopped'

export interface Translation {
  audio: string
  translation: string
  date: number
  inProgress: boolean
}
