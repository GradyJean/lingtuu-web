import { reactive } from 'vue'
import type { ThemeKey } from './theme'

export type ThemeMode = 'dark' | 'light' | 'system'

export const themeState = reactive({
  mode: 'dark' as ThemeKey
})

export function setTheme(mode: ThemeMode): void {
  if (mode === 'system') {
    followSystemTheme()
    return
  }
  themeState.mode = mode
}
export function followSystemTheme(): void {
  const mq = window.matchMedia('(prefers-color-scheme: dark)')

  themeState.mode = mq.matches ? 'dark' : 'light'

  mq.addEventListener('change', (e) => {
    themeState.mode = e.matches ? 'dark' : 'light'
  })
}
