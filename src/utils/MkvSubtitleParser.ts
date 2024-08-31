import matroskaSubtitlesJsUrl from 'matroska-subtitles/dist/matroska-subtitles.min.js?url'
import Events2 from './Events2'
import type { SubtitleRow } from './SubtitleManager/types'

export interface MkvSubtitleParserEvents {
  tracks: { tracks: any }
  subtitle: { subtitle: any, trackNumber: number }
  end: void
}

export default class MkvSubtitleParser extends Events2<MkvSubtitleParserEvents> {
  private loadModule() {
    return new Promise<any>((res, rej) => {
      if (window.MatroskaSubtitles)
        return res(window.MatroskaSubtitles)
      const script = document.createElement('script')
      script.src = matroskaSubtitlesJsUrl

      script.onload = () => res(window.MatroskaSubtitles)
      script.onerror = (e: any) => rej(e)
      document.body.appendChild(script)
    })
  }

  async parserFile(file: File) {
    await this.loadModule()
    const parser = new window.MatroskaSubtitles.SubtitleParser()

    const mkvSubtitlesDataMap = new Map<number, Record<number, SubtitleRow>>()
    const mkvTrackNumberToNameMap = new Map<number, string>()

    parser.once('tracks', (tracks: any) => {
      this.emit('tracks', { tracks })
      tracks.forEach((track: any) => {
        const { number: trackNumber, language, name } = track

        const saveName = name || language
        mkvSubtitlesDataMap.set(trackNumber, {})
        mkvTrackNumberToNameMap.set(trackNumber, saveName)
      })
    })

    // afterwards each subtitle is emitted
    parser.on('subtitle', (subtitle: any, trackNumber: any) => {
      this.emit('subtitle', { subtitle, trackNumber })

      const subtitleData = mkvSubtitlesDataMap.get(trackNumber)
      if (!subtitleData)
        return

      const { time, duration, text } = subtitle
      subtitleData[time] = {
        startTime: time / 1000,
        endTime: (time + duration) / 1000,
        text,
        htmlText: text,
        id: `${trackNumber}-${time}`,
      }
    })

    async function readStreamToUint8Array(readableStream: ReadableStream<Uint8Array>) {
      const reader = readableStream.getReader()
      // const chunks = [];
      let result

      // 读取数据直到流结束
      // eslint-disable-next-line no-cond-assign
      while (!(result = await reader.read()).done) {
        // chunks.push(result.value);
        const buffer = result.value
        parser.write(buffer)
      }
      await parser.end()
    }

    await readStreamToUint8Array(file.stream())
    this.emit('end')

    return [...mkvSubtitlesDataMap.entries()].map(([trackNumber, value]) => {
      const name = mkvTrackNumberToNameMap.get(trackNumber)!
      return {
        name,
        rows: Object.values(value).sort((a, b) => a.startTime - b.startTime),
      }
    })
  }
}
