import { Directive } from 'vue'
import { MaskaDetail, MaskInput, MaskInputOptions } from './mask-input'

type MaskaDirective = Directive<HTMLElement, MaskaDetail&MaskInputOptions | undefined>

const masks = new WeakMap<HTMLInputElement, MaskInput>()

const checkValue = (input: HTMLInputElement): void => {
  setTimeout(() => {
    if (masks.get(input)?.needUpdateValue(input) === true) {
      input.dispatchEvent(new CustomEvent('input'))
    }
  })
}

export const vMaska: MaskaDirective = (el, binding) => {
  const input = el instanceof HTMLInputElement ? el : el.querySelector('input')
  const opts:MaskInputOptions = { ...(binding.arg as MaskInputOptions) } ?? {}

  if (input == null) return

  checkValue(input)

  const existed = masks.get(input)
  if (existed != null) {
    if (!existed.needUpdateOptions(input, opts)) {
      return
    }

    existed.destroy()
  }

  if (binding.value != null) {
    const binded = binding.value
    if (!binding.arg) {
      opts.mask = binded.mask;
      opts.tokens = binded.tokens;
      opts.tokensReplace = binded.tokensReplace;
      opts.eager = binded.eager;
      opts.reversed = binded.reversed;
      opts.onMaska = binded.onMaska;
      opts.preProcess = binded.preProcess;
      opts.postProcess = binded.postProcess;
    }

    const onMaska = (detail: MaskaDetail): void => {
      binded.masked = detail.masked
      binded.unmasked = detail.unmasked
      binded.completed = detail.completed
    }

    opts.onMaska =
      opts.onMaska == null
        ? onMaska
        : Array.isArray(opts.onMaska)
          ? [...opts.onMaska, onMaska]
          : [opts.onMaska, onMaska]
  }

  masks.set(input, new MaskInput(input, opts))
}
