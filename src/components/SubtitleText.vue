<script setup lang="ts">
import { isString } from 'es-toolkit'
import { ref } from 'vue'
import { useOnce } from '@/hooks'
import { refToSetVal } from '@/utils'
import type SubtitleManager from '@/utils/SubtitleManager'
import type { SubtitleRow } from '@/utils/SubtitleManager/types'

interface Props {
  container?: string | HTMLElement
  subtitleManager: SubtitleManager
}
const props = defineProps<Props>()

const containerTarget = props.container
  ? (isString(props.container) ? document.querySelector(props.container) : props.container)
  : undefined

const activeRows = ref<Record<string, SubtitleRow>>({})
const setActiveRows = refToSetVal(activeRows)

useOnce(() => {
  const { subtitleManager } = props
  const enterActiveRows = subtitleManager.activeRows
  const activeRows: Record<string, SubtitleRow> = {}
  enterActiveRows.forEach(row => (activeRows[row.id] = row))
  setActiveRows(activeRows)

  const unListenEnter = subtitleManager.on2('row-enter', (row) => {
    setActiveRows(activeRows => ({ ...activeRows, [row.id]: row }))
  })
  const unListenLeave = subtitleManager.on2('row-leave', (row) => {
    setActiveRows((activeRows) => {
      delete (activeRows as any)[row.id]
      return { ...activeRows }
    })
  })

  return () => {
    unListenEnter()
    unListenLeave()
  }
})
</script>

<template>
  <Teleport :disabled="!containerTarget" :to="containerTarget">
    <div
      className="vp-subtitle w-full flex flex-col justify-center items-center left-0 bottom-[12px] px-[24px]"
      :style="{ opacity: !subtitleManager.showSubtitle ? 0 : 1 }"
    >
      <template v-for="row in activeRows" :key="row.id">
        <div
          className="relative w-fit"
        >
          <div
            className="absolute w-full h-full"
            :style="{
              backgroundColor: '#000000',
              opacity: 0.3,
            }"
          />

          <div
            className="relative z-[2] px-[8px] py-[2px] text-center whitespace-pre-line"
            :style="{
              color: '#ffffff',
              opacity: 1,
              fontWeight: 400,
              fontFamily: 'arial, microsoft yahei, pingfangsc ,helvetica, sans-serif',
              fontSize: 14,
            }"
          >
            {{ row.text }}
          </div>
        </div>
      </template>
    </div>
  </Teleport>

  <!-- <div v-if="!containerTarget" ref="noneContainerTargetRef" /> -->
</template>
