import { defineStore } from 'pinia'

const STORAGE_MENU = 'ui:menuState'
const STORAGE_WINDOW = 'ui:windowPosition'
type WindowPosition = 'left' | 'right' | 'center' | 'top' | 'bottom'

interface WindowConfig {
  display: boolean
  size: number
  lastSize: number
}
export const uiStateStore = defineStore('ui', {
  state: () => ({
    menuState: {
      database: true,
      project: true
    } as Record<string, boolean>,
    windowPosition: {
      left: {
        display: true,
        size: 20,
        lastSize: 20
      },
      right: {
        display: true,
        size: 20,
        lastSize: 20
      },
      center: {
        display: true,
        size: 60,
        lastSize: 60
      },
      top: {
        display: true,
        size: 80,
        lastSize: 80
      },
      bottom: {
        display: true,
        size: 20,
        lastSize: 20
      }
    } as Record<WindowPosition, WindowConfig>
  }),
  actions: {
    menuClick(menuKey: string): void {
      const current = !!this.menuState[menuKey]
      this.menuState[menuKey] = !current
    },
    // 打开窗口
    windowShow(position: WindowPosition, display: boolean): void {
      const win = this.windowPosition[position]
      if (win.display === display) return

      if (!display) {
        win.lastSize = win.size
      }

      const effectiveSize = display ? win.lastSize : win.size

      switch (position) {
        case 'left':
        case 'right':
          if (display) {
            this.windowPosition.center.size -= effectiveSize
          } else {
            this.windowPosition.center.size += effectiveSize
          }
          break
        case 'bottom':
          if (display) {
            this.windowPosition.top.size -= effectiveSize
          } else {
            this.windowPosition.top.size += effectiveSize
          }
          break
      }

      win.display = display
      win.size = display ? win.lastSize : 0

      this.windowPositionSave()
    },

    windowPositionSave(): void {
      localStorage.setItem(STORAGE_WINDOW, JSON.stringify(this.windowPosition))
    },
    // 保存到 localStorage
    menuStateSave(): void {
      localStorage.setItem(STORAGE_MENU, JSON.stringify(this.menuState))
    },
    // 从 localStorage 恢复
    loadStore(): void {
      const menuRaw = localStorage.getItem(STORAGE_MENU)
      if (menuRaw) {
        this.menuState = JSON.parse(menuRaw)
      }
      const windowRaw = localStorage.getItem(STORAGE_WINDOW)
      if (windowRaw) {
        this.windowPosition = JSON.parse(windowRaw)
      }
    },
    // 重置
    resetStore(): void {
      localStorage.removeItem(STORAGE_MENU)
      localStorage.removeItem(STORAGE_WINDOW)
    }
  }
})
