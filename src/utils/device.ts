/**
 * 获取设备类型
 */
function getDeviceType(): string {
  const ua = navigator.userAgent
  
  // 微信小程序
  if (/micromessenger/i.test(ua)) {
    return 'wechat_mp'
  }
  
  // 微信浏览器
  if (/wechat/i.test(ua)) {
    return 'wechat'
  }
  
  // 支付宝
  if (/alipay/i.test(ua)) {
    return 'alipay'
  }
  
  // iOS
  if (/iphone|ipad|ipod/i.test(ua)) {
    return 'ios'
  }
  
  // Android
  if (/android/i.test(ua)) {
    return 'android'
  }
  
  // Windows
  if (/windows/i.test(ua)) {
    return 'windows'
  }
  
  // Mac
  if (/macintosh/i.test(ua)) {
    return 'mac'
  }
  
  // Linux
  if (/linux/i.test(ua)) {
    return 'linux'
  }
  
  return 'web'
}

/**
 * 获取浏览器名称
 */
function getBrowserName(): string {
  const ua = navigator.userAgent
  
  if (/edg/i.test(ua)) {
    return 'edge'
  }
  if (/chrome/i.test(ua)) {
    return 'chrome'
  }
  if (/firefox/i.test(ua)) {
    return 'firefox'
  }
  if (/safari/i.test(ua)) {
    return 'safari'
  }
  if (/opr/i.test(ua)) {
    return 'opera'
  }
  if (/msie|trident/i.test(ua)) {
    return 'ie'
  }
  
  return 'unknown'
}

/**
 * 获取设备 ID
 * 格式：web_chrome_windows_xxx 或 wechat_mp_xxx
 */
export function getDeviceId(): string {
  let deviceId = localStorage.getItem('device_id')
  
  if (!deviceId) {
    const deviceType = getDeviceType()
    const browserName = getBrowserName()
    const randomId = Math.random().toString(36).substring(2, 8)
    
    // 格式：前缀_浏览器_系统_随机数
    deviceId = `${deviceType}_${browserName}_${randomId}`
    localStorage.setItem('device_id', deviceId)
  }
  
  return deviceId
}
