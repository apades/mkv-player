import { onMounted, onUnmounted } from 'vue'

export function useOnce(cb: () => (void | (() => void))): void {
  // eslint-disable-next-line unicorn/consistent-function-scoping
  let callback = () => {}

  onMounted(async () => {
    callback = (await cb()) || callback
  })

  onUnmounted(() => {
    callback()
  })
}
