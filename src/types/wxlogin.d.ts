declare global {
  interface Window {
    WxLogin: new (options: {
      self_redirect: boolean
      id: string
      appid: string
      scope: string
      redirect_uri: string
      state: string
      style?: string
      href?: string
      onReady?: (isReady: boolean) => void
    }) => void
  }
}

export {}
