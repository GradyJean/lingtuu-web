import {defineStore} from 'pinia'

const STORAGE_MENU = 'ui:menuState'
const STORAGE_WINDOW = 'ui:windowPosition'
type WindowPane = 'left' | 'center' | 'right'
type TogglePane = 'left' | 'right'

interface WindowConfig {
    display: boolean
    size: number
    lastSize: number
}

export const uiStateStore = defineStore('ui', {
    state: () => ({
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
            }
        } as Record<WindowPane, WindowConfig>
    }),
    actions: {
        // 打开窗口
        windowShow(position: TogglePane, display: boolean): void {
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
            }

            win.display = display
            win.size = display ? win.lastSize : 0

            this.windowPositionSave()
        },

        windowPositionSave(): void {
            localStorage.setItem(STORAGE_WINDOW, JSON.stringify(this.windowPosition))
        },
        // 从 localStorage 恢复
        loadStore(): void {
            const windowRaw = localStorage.getItem(STORAGE_WINDOW)
            if (windowRaw) {
                const parsed = JSON.parse(windowRaw)
                this.windowPosition = {
                    left: parsed.left ?? this.windowPosition.left,
                    center: parsed.center ?? this.windowPosition.center,
                    right: parsed.right ?? this.windowPosition.right
                }
            }
        },
        // 重置
        resetStore(): void {
            localStorage.removeItem(STORAGE_MENU)
            localStorage.removeItem(STORAGE_WINDOW)
        }
    }
})

/* =======================
 * button 状态 Store
 * ======================= */

export const menuStateStore = defineStore('menu', {
    state: () => ({
        menuState: {} as Record<string, boolean>
    }),

    actions: {
        menuStateSave(): void {
            localStorage.setItem(STORAGE_MENU, JSON.stringify(this.menuState))
        },

        loadStore(): void {
            const menuRaw = localStorage.getItem(STORAGE_MENU)
            if (menuRaw) this.menuState = JSON.parse(menuRaw)
        },

        resetStore(): void {
            localStorage.removeItem(STORAGE_MENU)
        }
    }
})