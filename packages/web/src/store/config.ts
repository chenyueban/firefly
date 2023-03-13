import type { CubicBezierPoints, EasingFunction } from '@vueuse/core'
import { TransitionPresets } from '@vueuse/core'
import { defineStore } from 'pinia'

const isMobileScreen = useMediaQuery('(max-width: 640px)')
const DEFAULT_SIZE = 40
const leftBarShow = useLocalStorage('leftBarShow', true)
const leftBarSizeCached = useLocalStorage('leftBarSize', DEFAULT_SIZE)
const DURATION = 300
export const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n))
function createEasingFunction([p0, p1, p2, p3]: CubicBezierPoints): EasingFunction {
  const a = (a1: number, a2: number) => 1 - 3 * a2 + 3 * a1
  const b = (a1: number, a2: number) => 3 * a2 - 6 * a1
  const c = (a1: number) => 3 * a1

  const calcBezier = (t: number, a1: number, a2: number) => ((a(a1, a2) * t + b(a1, a2)) * t + c(a1)) * t

  const getSlope = (t: number, a1: number, a2: number) => 3 * a(a1, a2) * t * t + 2 * b(a1, a2) * t + c(a1)

  const getTforX = (x: number) => {
    let aGuessT = x

    for (let i = 0; i < 4; ++i) {
      const currentSlope = getSlope(aGuessT, p0, p2)
      if (currentSlope === 0)
        return aGuessT
      const currentX = calcBezier(aGuessT, p0, p2) - x
      aGuessT -= currentX / currentSlope
    }

    return aGuessT
  }

  return (x: number) => (p0 === p1 && p2 === p3) ? x : calcBezier(getTforX(x), p1, p3)
}
const easingFunction = createEasingFunction(TransitionPresets.easeInOutCubic)

export const useConfigStore = defineStore('config', {
  state: () => {
    return {
      rootPaddingTop: 40,
      rootPaddingLeft: 44,
      /**
       * 左侧显示内容 文件列表/搜索
       */
      leftCurrentTool: 'blockList',
      title: '',

      isMobileScreen,
      leftBarShow,
      leftBarSize: DEFAULT_SIZE,
      leftBarSizeCached,
    }
  },
  getters: {
    contentSize(state) {
      if (state.isMobileScreen)
        return 100

      return 100 - state.leftBarSize
    },
  },
  actions: {
    setTitle(title: string) {
      this.title = title
    },
    toggleLeftBarCollapse() {
      const startAt = Date.now()
      const endAt = startAt + DURATION
      const originalSize = this.leftBarSizeCached
      // 展开
      if (!this.leftBarShow) {
        this.leftBarShow = true
        const { pause, resume } = useRafFn(() => {
          nextTick(() => {
            const now = Date.now()
            const progress = clamp(1 - ((endAt - now) / DURATION), 0, 1)
            this.leftBarSize = originalSize * easingFunction(progress)
            if (progress >= 1)
              pause()
          })
        }, { immediate: false })
        if (!this.isMobileScreen)
          resume()
      }
      // 收起
      else {
        const { pause, resume } = useRafFn(() => {
          nextTick(() => {
            const now = Date.now()
            const progress = clamp(1 - ((endAt - now) / DURATION), 0, 1)
            this.leftBarSize = originalSize - originalSize * easingFunction(progress)
            if (progress >= 1) {
              pause()
              this.leftBarShow = false
            }
          })
        }, { immediate: false })
        if (!this.isMobileScreen)
          resume()
        else
          this.leftBarShow = false
      }
    },
  },
})
