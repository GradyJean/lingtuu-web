/**
 * 微信登录 API 模拟（用于前端开发测试）
 * 实际项目中需要替换为真实后端 API
 */

interface QrData {
  status: 'idle' | 'scanned' | 'success'
  userInfo?: any
}

// 模拟二维码场景 ID
let mockSceneId = 0

// 模拟二维码数据
const mockQrData: Record<string, QrData> = {}

export function createQrCode() {
  const sceneId = `mock_${++mockSceneId}`
  mockQrData[sceneId] = { status: 'idle' }
  
  // 模拟：5 秒后自动变为已扫码，10 秒后自动登录成功
  setTimeout(() => {
    if (mockQrData[sceneId]) {
      mockQrData[sceneId].status = 'scanned'
    }
  }, 5000)
  
  setTimeout(() => {
    if (mockQrData[sceneId]) {
      mockQrData[sceneId].status = 'success'
      mockQrData[sceneId].userInfo = {
        openid: 'mock_openid_' + sceneId,
        nickname: '微信用户',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + sceneId,
      }
    }
  }, 10000)
  
  return {
    success: true,
    sceneId,
    qrCodeUrl: `https://open.weixin.qq.com/connect/qrconnect?appid=YOUR_APP_ID&redirect_uri=xxx&response_type=code&scope=snsapi_login&state=${sceneId}#wechat_redirect`,
  }
}

export function checkQrCodeStatus(sceneId: string) {
  const data = mockQrData[sceneId]
  if (!data) {
    return { status: 'expired' }
  }
  
  return {
    status: data.status,
    userInfo: data.userInfo,
  }
}
