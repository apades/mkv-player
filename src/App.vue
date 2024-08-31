<script setup lang="ts">
import { ref } from 'vue'
import SubtitleManager from './utils/SubtitleManager'
import { useOnce } from './hooks'
import MkvSubtitleParser from './utils/MkvSubtitleParser'
import type { SubtitleRow } from './utils/SubtitleManager/types'

const videoRef = ref<HTMLVideoElement>()
const subtitleManager = new SubtitleManager()
window.subtitleManager = subtitleManager

useOnce(() => {
  if (!videoRef.value) {
    console.error('no videoRef')
    return
  }
  subtitleManager.init(videoRef.value)
})

function handleAddSubtitleFromFile() {
  const fileInput = document.createElement('input')
  fileInput.type = 'file'
  fileInput.accept = '.srt, .ass'
  fileInput.addEventListener('change', (event) => {
    const file = (event.target as HTMLInputElement).files?.[0]
    if (!file) {
      console.error('no file selected')
      return
    }
    subtitleManager.addFileSubtitle(file)
  })
  fileInput.click()
}

const mkvSubtitleParser = new MkvSubtitleParser()
function handleChangeVideo() {
  const fileInput = document.createElement('input')
  fileInput.type = 'file'
  fileInput.accept = '.mkv'
  fileInput.addEventListener('change', (event) => {
    if (!videoRef.value)
      return

    const file = (event.target as HTMLInputElement).files?.[0]
    if (!file) {
      console.error('no file selected')
      return
    }
    subtitleManager.reset()
    videoRef.value.src = URL.createObjectURL(file)
    mkvSubtitleParser.parserFile(file).then((res) => {
      res.forEach((item) => {
        subtitleManager.addSubtitle(item.name, item.rows)
      })
    })
  })
  fileInput.click()
}
</script>

<template>
  <div>
    <div class="relative bg-black">
      <video ref="videoRef" class="w-[800px] block mx-auto" controls src="https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4" />
      <div class="absolute bottom-12 w-full">
        <SubtitleText :subtitle-manager="subtitleManager" />
      </div>
    </div>

    <div>
      <h2>action area</h2>
      <div class="flex gap-2">
        <button @click="handleAddSubtitleFromFile">
          add subtitle
        </button>
        <button @click="handleChangeVideo">
          change mkv video
        </button>
      </div>
      <div>subtitle list</div>
      <div
        v-for="subtitle in subtitleManager.subtitleItems.value"
        :key="subtitle.label"
        :class="`cursor-pointer ${subtitleManager.activeSubtitleLabel.value === subtitle.label ? 'text-red-500' : ''}`"
        @click="subtitleManager.useSubtitle(subtitle.label)"
      >
        {{ subtitle.label }}
      </div>
    </div>
  </div>
</template>
