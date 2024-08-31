import type { Ref } from 'vue'
import { isFunction } from 'es-toolkit'
import type { Rec, noop } from './typeUtils'

export function addEventListener<
  T extends {
    addEventListener: (k: string, fn: noop, ...more: any[]) => void
    removeEventListener: (k: string, fn: noop, ...more: any[]) => void
  },
>(target: T, fn: (target: T) => void): () => void {
  const _addEventListener = target.addEventListener

  // eslint-disable-next-line ts/no-unsafe-function-type
  const fnMap: Rec<(Function | { fn: Function, more: any[] })[]> = {}
  target.addEventListener = (key: string, fn: noop, ...more: any[]) => {
    fnMap[key] = fnMap[key] ?? []
    if (more.length) {
      fnMap[key].push({ fn, more })
    }
    else {
      fnMap[key].push(fn)
    }
    _addEventListener.call(target, key, fn, ...more)
  }
  fn(target)
  target.addEventListener = _addEventListener

  return () => {
    Object.entries(fnMap).forEach(([key, fns]) => {
      fns.forEach((fn) => {
        if (typeof fn == 'function')
          // eslint-disable-next-line no-useless-call
          target.removeEventListener.call(target, key, fn as any)
        else
        // eslint-disable-next-line no-useless-call
          target.removeEventListener.call(target, key, fn.fn as any, ...fn.more)
      })
    })
  }
}

export function refToSetVal<T extends Ref<any>>(ref: T) {
  return (val: (T['value'] | ((val: T['value']) => T['value']))) => {
    if (isFunction(val))
      ref.value = val(ref.value)
    else
      ref.value = val
  }
}

export async function readTextFromFile(file: File) {
  const fileReader = new FileReader()
  fileReader.readAsText(file)
  const text = await new Promise<string>((resolve) => {
    fileReader.onload = () => {
      resolve(fileReader.result as string)
    }
  })
  return text
}
