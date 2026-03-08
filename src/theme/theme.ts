import { theme as antdTheme } from 'ant-design-vue'

export type ThemeKey = 'dark' | 'light'

type SemanticTheme = {
  accent: {
    primary: string
    primaryHover: string
    primaryActive: string
    success: string
    warning: string
    error: string
    info: string
  }
  bg: {
    page: string
    surface: string
    elevated: string
    muted: string
    spotlight: string
  }
  text: {
    primary: string
    secondary: string
    tertiary: string
    quaternary: string
    disabled: string
    onAccent: string
  }
  border: {
    subtle: string
    default: string
    strong: string
  }
  state: {
    hover: string
    active: string
    focus: string
  }
  shadow: {
    sm: string
    md: string
  }
}

const semanticThemeMap: Record<ThemeKey, SemanticTheme> = {
  light: {
    accent: {
      primary: '#4CAF50',
      primaryHover: '#66BB6A',
      primaryActive: '#43A047',
      success: '#52C41A',
      warning: '#FAAD14',
      error: '#FF4D4F',
      info: '#1677FF'
    },
    bg: {
      page: '#F5F8F6',
      surface: '#FFFFFF',
      elevated: '#FFFFFF',
      muted: '#F7F9F8',
      spotlight: 'rgba(0, 0, 0, 0.85)'
    },
    text: {
      primary: 'rgba(0, 0, 0, 0.88)',
      secondary: 'rgba(0, 0, 0, 0.65)',
      tertiary: 'rgba(0, 0, 0, 0.45)',
      quaternary: 'rgba(0, 0, 0, 0.28)',
      disabled: 'rgba(0, 0, 0, 0.25)',
      onAccent: '#FFFFFF'
    },
    border: {
      subtle: 'rgba(0, 0, 0, 0.06)',
      default: 'rgba(0, 0, 0, 0.12)',
      strong: 'rgba(0, 0, 0, 0.20)'
    },
    state: {
      hover: 'rgba(0, 0, 0, 0.04)',
      active: 'rgba(0, 0, 0, 0.08)',
      focus: 'rgba(76, 175, 80, 0.22)'
    },
    shadow: {
      sm: '0 1px 2px rgba(0, 0, 0, 0.06)',
      md: '0 6px 16px rgba(0, 0, 0, 0.12)'
    }
  },
  dark: {
    accent: {
      primary: '#6BCB77',
      primaryHover: '#82D88D',
      primaryActive: '#58B866',
      success: '#73D13D',
      warning: '#FFC53D',
      error: '#FF7875',
      info: '#4096FF'
    },
    bg: {
      page: '#111417',
      surface: '#171B20',
      elevated: '#1E2329',
      muted: '#14181D',
      spotlight: 'rgba(255, 255, 255, 0.15)'
    },
    text: {
      primary: 'rgba(255, 255, 255, 0.90)',
      secondary: 'rgba(255, 255, 255, 0.68)',
      tertiary: 'rgba(255, 255, 255, 0.50)',
      quaternary: 'rgba(255, 255, 255, 0.34)',
      disabled: 'rgba(255, 255, 255, 0.30)',
      onAccent: '#0F1115'
    },
    border: {
      subtle: 'rgba(255, 255, 255, 0.06)',
      default: 'rgba(255, 255, 255, 0.14)',
      strong: 'rgba(255, 255, 255, 0.24)'
    },
    state: {
      hover: 'rgba(255, 255, 255, 0.08)',
      active: 'rgba(255, 255, 255, 0.14)',
      focus: 'rgba(107, 203, 119, 0.30)'
    },
    shadow: {
      sm: '0 1px 2px rgba(0, 0, 0, 0.35)',
      md: '0 8px 24px rgba(0, 0, 0, 0.45)'
    }
  }
}

function createThemeConfig(mode: ThemeKey): Record<string, unknown> {
  const s = semanticThemeMap[mode]

  return {
    algorithm: mode === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
    token: {
      colorPrimary: s.accent.primary,
      colorPrimaryHover: s.accent.primaryHover,
      colorPrimaryActive: s.accent.primaryActive,
      colorSuccess: s.accent.success,
      colorWarning: s.accent.warning,
      colorError: s.accent.error,
      colorInfo: s.accent.info,

      colorText: s.text.primary,
      colorTextSecondary: s.text.secondary,
      colorTextTertiary: s.text.tertiary,
      colorTextQuaternary: s.text.quaternary,
      colorTextDisabled: s.text.disabled,

      colorBgBase: s.bg.surface,
      colorBgLayout: s.bg.page,
      colorBgContainer: s.bg.surface,
      colorBgElevated: s.bg.elevated,
      colorBgSpotlight: s.bg.spotlight,

      colorBorder: s.border.default,
      colorBorderSecondary: s.border.subtle,
      colorBgTextHover: s.state.hover,
      colorBgTextActive: s.state.active,
      controlOutline: s.state.focus,
      controlItemBgHover: s.state.hover,
      controlItemBgActive: s.state.active,
      controlItemBgActiveHover: s.state.active,

      borderRadius: 10,
      borderRadiusSM: 6,
      borderRadiusLG: 14,
      fontSize: 14,
      fontSizeSM: 12,
      fontSizeLG: 16,
      controlHeight: 36,
      controlHeightSM: 28,
      controlHeightLG: 44,
      boxShadow: s.shadow.md,
      boxShadowSecondary: s.shadow.sm
    },
    components: {
      Layout: {
        headerBg: s.bg.surface,
        siderBg: s.bg.surface,
        bodyBg: s.bg.page,
        footerBg: s.bg.surface,
        triggerBg: s.bg.elevated
      },
      Button: {
        colorPrimary: s.accent.primary,
        colorPrimaryHover: s.accent.primaryHover,
        colorPrimaryActive: s.accent.primaryActive,
        colorPrimaryText: s.text.onAccent,
        primaryShadow: 'none',
        defaultBorderColor: s.border.default,
        defaultHoverBorderColor: s.accent.primary,
        defaultHoverColor: s.accent.primary,
        dangerShadow: 'none'
      },
      Input: {
        colorBgContainer: s.bg.surface,
        colorText: s.text.primary,
        colorTextPlaceholder: s.text.tertiary,
        colorBorder: s.border.default,
        hoverBorderColor: s.accent.primary,
        activeBorderColor: s.accent.primary,
        activeShadow: `0 0 0 2px ${s.state.focus}`
      },
      Select: {
        colorBgContainer: s.bg.surface,
        colorText: s.text.primary,
        colorTextPlaceholder: s.text.tertiary,
        colorBorder: s.border.default,
        optionSelectedBg: s.state.active,
        optionActiveBg: s.state.hover
      },
      Dropdown: {
        colorBgElevated: s.bg.elevated,
        colorText: s.text.primary,
        colorBorder: s.border.subtle
      },
      Menu: {
        colorItemBg: s.bg.surface,
        colorItemText: s.text.secondary,
        colorItemTextHover: s.text.primary,
        colorItemBgHover: s.state.hover,
        colorItemTextSelected: s.text.primary,
        colorItemBgSelected: s.state.active,
        colorSubItemBg: s.bg.surface,
        itemHoverBg: s.state.hover,
        itemSelectedBg: s.state.active
      },
      Tabs: {
        colorText: s.text.secondary,
        colorTextHeading: s.text.primary,
        colorPrimary: s.accent.primary,
        itemHoverColor: s.accent.primary,
        itemActiveColor: s.accent.primary,
        itemSelectedColor: s.accent.primary,
        inkBarColor: s.accent.primary
      },
      Card: {
        colorBgContainer: s.bg.surface,
        colorBorderSecondary: s.border.subtle,
        colorTextHeading: s.text.primary,
        colorText: s.text.secondary,
        boxShadowTertiary: s.shadow.sm
      },
      Modal: {
        contentBg: s.bg.elevated,
        headerBg: s.bg.elevated,
        titleColor: s.text.primary,
        colorText: s.text.secondary,
        colorBgMask: mode === 'dark' ? 'rgba(0, 0, 0, 0.55)' : 'rgba(0, 0, 0, 0.45)'
      },
      Tag: {
        defaultBg: s.state.hover,
        defaultColor: s.text.secondary
      },
      Table: {
        colorBgContainer: s.bg.surface,
        headerBg: s.bg.muted,
        headerColor: s.text.primary,
        rowHoverBg: s.state.hover,
        borderColor: s.border.subtle,
        colorText: s.text.secondary
      },
      Pagination: {
        colorBgContainer: s.bg.surface,
        colorBgTextHover: s.state.hover,
        colorPrimary: s.accent.primary,
        colorPrimaryHover: s.accent.primaryHover,
        colorText: s.text.secondary,
        colorTextDisabled: s.text.disabled
      },
      Tooltip: {
        colorBgSpotlight: s.bg.spotlight,
        colorTextLightSolid: s.text.primary
      }
    }
  }
}

export const themeMap: Record<ThemeKey, Record<string, unknown>> = {
  dark: createThemeConfig('dark'),
  light: createThemeConfig('light')
}
