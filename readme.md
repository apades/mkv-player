# mkv-player
mkv-player是一个为了在web上播放mkv视频而开发的，mkv里自带有很多功能用默认的video标签不会完全支持，比如内封字幕和音轨，目的就是想不用下载就可以直接在web上播放

## 目标实现
- [x] 提取字幕和播放
- [ ] 切换音轨
- [ ] 提取[metadata](https://mediainfo.js.org/demo/)
  - [ ] 章节标记
  - [ ] 字体文件(?)
- [ ] 支持url格式
  - [ ] 流式解析相关数据
  - [ ] seek time后请求对应的range

## 参考

### mkv-extract
- [github](https://github.com/qgustavor/mkv-extract)
- [demo](https://qgustavor.github.io/mkv-extract/en/)

用ffmpeg + ffprobe的wasm解析mkv文件和提取内置文件 + 音视轨

### mkv-player
- [github](https://github.com/pawitp/mkv-player)
- [demo](https://mkv-player.netlify.app/)

实际里面用的[JavascriptSubtitlesOctopus](https://github.com/libass/JavascriptSubtitlesOctopus)里自带的wasm读取mkv的字幕文件并用canvas渲染出来

### mediainfo.js
- [github](https://github.com/buzz/mediainfo.js)
- [demo](https://mediainfo.js.org/demo/)

用来提取mkv的metadata
