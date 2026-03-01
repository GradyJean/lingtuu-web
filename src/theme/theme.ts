import { theme as antdTheme } from 'ant-design-vue'

export type ThemeKey = 'dark' | 'light'

export const themeMap: Record<ThemeKey, unknown> = {
  dark: {
    algorithm: antdTheme.darkAlgorithm,
    token: {
      /* ===== Layout / 背景层级 ===== */
      colorBgLayout: '#1f2226',
      colorBgContainer: '#14161a',

      /* ===== 文本 / 图标 ===== */
      colorText: 'rgba(255, 255, 255, 0.88)',
      colorTextSecondary: 'rgba(255, 255, 255, 0.62)',
      colorTextTertiary: 'rgba(255, 255, 255, 0.42)',
      colorTextQuaternary: 'rgba(255, 255, 255, 0.28)',
      colorTextDisabled: 'rgba(255, 255, 255, 0.34)',

      /* ===== 边框（只做结构，不提亮）===== */
      colorBorderSecondary: 'rgba(255, 255, 255, 0.02)',

      /* ===== hover / active（在深底上提亮）===== */
      colorBgTextHover: 'rgba(255, 255, 255, 0.10)',
      colorBgTextActive: 'rgba(255, 255, 255, 0.16)'
    }
  },

  light: {
    algorithm: antdTheme.defaultAlgorithm,
    token: {
      /* ===== Layout / 背景层级 ===== */
      colorBgLayout: '#FFFFFF',
      colorBgContainer: '#F5F6F8FF',

      /* ===== 文本 / 图标 ===== */
      colorText: 'rgba(0, 0, 0, 0.88)',
      colorTextSecondary: 'rgba(0, 0, 0, 0.64)',
      colorTextTertiary: 'rgba(0, 0, 0, 0.44)',
      colorTextQuaternary: 'rgba(0, 0, 0, 0.28)',
      colorTextDisabled: 'rgba(0, 0, 0, 0.36)',

      /* ===== 边框（弱分割）===== */
      colorBorderSecondary: 'rgba(0, 0, 0, 0.02)',

      /* ===== hover / active ===== */
      colorBgTextHover: 'rgba(0, 0, 0, 0.045)',
      colorBgTextActive: 'rgba(0, 0, 0, 0.085)'
    }
  }
}
