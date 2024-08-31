export interface SubtitleItem {
  label: string
  value: string
}

export interface SubtitleRow {
  id: string

  startTime: number
  endTime: number

  text: string
  /** 给Html用的 */
  htmlText: string

  x?: number
  y?: number
}

export interface SubtitleManagerEvents {
  'row-enter': SubtitleRow
  'row-leave': SubtitleRow
}
