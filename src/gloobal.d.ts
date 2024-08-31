declare module 'ass-parser' {
  const assParser: (text: string, option?: any) => any[]
  export default assParser
}

declare module 'matroska-subtitles' {
  const output: any
  export default output
}

interface Window {
  documentPictureInPicture: {
    window: Window
    requestWindow: (options?: {
      width: number
      height: number
    }) => Promise<Window>
    onenter: () => void
  }
  MatroskaSubtitles: any
  [k: string]: any
}
