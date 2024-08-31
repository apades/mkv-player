import { ref } from 'vue'
import Events2 from '../Events2'
import { addEventListener, readTextFromFile } from '../index'
import type { SubtitleItem, SubtitleManagerEvents, SubtitleRow } from './types'
import srtParser from './subtitleParser/srt'
import assParser from './subtitleParser/ass'

class SubtitleManager
  extends Events2<SubtitleManagerEvents> {
  initd = false
  subtitleItems = ref<SubtitleItem[]>([])

  video?: HTMLVideoElement
  private subtitleCache = new Map<string, { rows: SubtitleRow[] }>()
  /** 正在使用的字幕rows */
  rows: SubtitleRow[] = []
  rowIndex = ref(0)
  activeRows = new Set<SubtitleRow>()
  activeSubtitleLabel = ref('')
  showSubtitle = ref(false)

  /** 停止监听所有video事件 */
  private videoUnListen = () => {}
  constructor() {
    super()
  }

  init(video: HTMLVideoElement) {
    this.reset()
    this.video = video

    this.onInit()
    this.initd = true
  }

  onInit() {}
  unload() {
    this.reset()
    this.onUnload()
  }

  onUnload() {}

  addSubtitle(label: string, rows: SubtitleRow[]) {
    this.subtitleItems.value.push({ label, value: label })
    this.subtitleCache.set(label, { rows })
  }

  addSubtitleItem(item: SubtitleItem) {
    this.subtitleItems.value.push(item)
  }

  updateSubtitle(label: string, rows: SubtitleRow[]) {
    const rowsAddr = this.subtitleCache.get(label)
    if (!rowsAddr)
      return
    rowsAddr.rows.length = 0
    rowsAddr.rows.push(...rows)
    this.rowIndex.value = 0
  }

  async addFileSubtitle(file: File) {
    const label = file.name
    if (this.subtitleCache.has(label)) {
      throw new Error('Already add this file')
    }
    const fileType = (label.split('.').pop() ?? '').toLowerCase()
    let rows: SubtitleRow[] = []
    switch (fileType) {
      case 'srt': {
        const text = await readTextFromFile(file)
        rows = srtParser(text)
        break
      }
      case 'ass': {
        const text = await readTextFromFile(file)
        rows = assParser(text)
        break
      }
      default: {
        throw new Error('Unsupported subtitle file. Only support .srt .ass')
      }
    }
    this.subtitleItems.value.push({ label, value: label })
    this.subtitleCache.set(label, { rows })
    this.useSubtitle(label)
  }

  private listenVideoEvents(video = this.video) {
    if (!video)
      throw new Error('No videoEl')
    const rowUnListenMap = new Map<SubtitleRow, () => void>()
    const unListenRows = () => {
      ;[...rowUnListenMap.entries()].forEach(([row, unListen]) => {
        this.emit('row-leave', row)
        this.activeRows.delete(row)
        unListen()
      })
    }
    const mainUnListen = addEventListener(video, (video) => {
      const handleOnTimeUpdate = () => {
        const cTime = video.currentTime
        while (this.rowIndex.value < this.rows.length) {
          const row = this.rows[this.rowIndex.value]
          if (row.endTime <= cTime) {
            this.rowIndex.value++
            continue
          }
          if (row.startTime >= cTime) {
            break
          }
          this.rowIndex.value++
          // 触发enter
          this.emit('row-enter', row)
          this.activeRows.add(row)

          const rowUnListen = addEventListener(video, (video) => {
            video.addEventListener('timeupdate', () => {
              const cTime = video.currentTime
              if (row.endTime <= cTime) {
                // 触发leave
                this.emit('row-leave', row)
                this.activeRows.delete(row)

                // 删除监听
                rowUnListenMap.delete(row)
                rowUnListen()
              }
            })
          })
          rowUnListenMap.set(row, rowUnListen)
        }
      }
      video.addEventListener('timeupdate', () => {
        handleOnTimeUpdate()
      })

      // 跳进度条就重置所有字幕
      video.addEventListener('seeked', () => {
        unListenRows()
        rowUnListenMap.clear()
        this.rowIndex.value = 0
        handleOnTimeUpdate()
      })
    })

    this.videoUnListen = () => {
      mainUnListen()
      unListenRows()
    }
  }

  updateVideo(video: HTMLVideoElement) {
    this.videoUnListen()
    this.video = video
    this.listenVideoEvents(video)
  }

  async useSubtitle(subtitleItemsLabel: string) {
    this.resetSubtitleState()
    this.activeSubtitleLabel.value = subtitleItemsLabel
    let subtitleData = this.subtitleCache.get(subtitleItemsLabel)
    const subtitleItemsValue = this.subtitleItems.value.find(
      item => item.label === subtitleItemsLabel,
    )?.value

    if (!subtitleData && subtitleItemsValue) {
      const subtitleRows = await this.loadSubtitle(subtitleItemsValue)
      subtitleData = { rows: subtitleRows }
    }
    if (subtitleData) {
      this.rows = [...subtitleData.rows]
    }

    this.listenVideoEvents()
    this.showSubtitle.value = true
  }

  // eslint-disable-next-line unused-imports/no-unused-vars
  async loadSubtitle(value: string): Promise<SubtitleRow[]> {
    return []
  }

  reset() {
    this.subtitleItems.value.length = 0
    this.subtitleCache.clear()
    this.resetSubtitleState()
  }

  resetSubtitleState() {
    // this.unListenRows()
    this.videoUnListen()
    this.rows.length = 0
    this.rowIndex.value = 0
    this.activeRows.clear()
    this.activeSubtitleLabel.value = ''
    this.showSubtitle.value = false
  }
}

export class CommonSubtitleManager extends SubtitleManager {
  constructor() {
    super()
  }

  // eslint-disable-next-line unused-imports/no-unused-vars
  async loadSubtitle(value: string): Promise<SubtitleRow[]> {
    return []
  }
}

export default SubtitleManager
