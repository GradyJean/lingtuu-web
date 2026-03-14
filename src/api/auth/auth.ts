import {baseApi} from '@api/base'

export interface TokenInfo {
  token: string
  expireAt: number
}

export interface AuthTokenPair {
  accessToken: TokenInfo
  refreshToken: TokenInfo
}

export type IdentifierType = 'PHONE_NUMBER' | 'EMAIL'

export interface ThirdPlatformItem {
  name: string
  platform: string
}

export interface WechatInfo {
  appId?: string
  scope?: string
}

export interface SendVerifyCodeInput {
  identifier: string
  identifierType: IdentifierType
}

export interface LoginInput extends SendVerifyCodeInput {
  credential: string
  verifyCodeLogin: boolean
  verifyCode?: string
}

export interface RegisterInput extends SendVerifyCodeInput {
  credential: string
  verifyCode: string
}

export interface ResetCredentialInput extends SendVerifyCodeInput {
  credential: string
  verifyCode: string
}

export function refreshAuthToken(token: string): Promise<AuthTokenPair> {
  return baseApi.post<AuthTokenPair>('/auth/token/refresh', {
    token,
  })
}

export function logoutAuth(token?: string | null): Promise<null> {
  return baseApi.post<null>('/auth/logout', {
    token,
  })
}

export function getThirdPlatforms(): Promise<ThirdPlatformItem[]> {
  return baseApi.get<ThirdPlatformItem[]>('/auth/third/platforms', undefined, {silent: true})
}

export function getWechatInfo(): Promise<WechatInfo> {
  return baseApi.get<WechatInfo>('/auth/third/wechat/info', undefined, {silent: true})
}

export function sendVerifyCode(data: SendVerifyCodeInput): Promise<null> {
  return baseApi.post<null>('/auth/verifyCode/send', data)
}

export function checkIdentifierExists(identifier: string): Promise<boolean> {
  return baseApi.get<boolean>('/auth/identifier/exists', {identifier}, {silent: true})
}

export function loginAuth(data: LoginInput): Promise<AuthTokenPair> {
  return baseApi.post<AuthTokenPair>('/auth/login', data)
}

export function loginWithWechat(code: string, state?: string): Promise<AuthTokenPair> {
  return baseApi.post<AuthTokenPair>(
    '/auth/third/wechat/login',
    undefined,
    {
      params: {code, state},
    }
  )
}

export function registerAuth(data: RegisterInput): Promise<null> {
  return baseApi.post<null>('/auth/register', data)
}

export function resetCredential(data: ResetCredentialInput): Promise<null> {
  return baseApi.post<null>('/auth/credential/reset', data)
}
