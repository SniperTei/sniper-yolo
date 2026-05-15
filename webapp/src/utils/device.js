/**
 * 设备检测与原生交互工具
 * 用于检测设备类型并提供调用原生代码的接口
 * 适配Vue3项目直接引入使用
 */

class DeviceBridge {
  constructor() {
    this.isIOS = false;
    this.isAndroid = false;
    this.isWeb = false;

    // 开发环境强制Web模式（可通过URL参数 ?forceWeb=true 控制）
    this.forceWebMode = this.shouldForceWebMode();

    this.setup();
  }

  /**
   * 检查是否应该强制使用Web模式
   */
  shouldForceWebMode() {
    // 1. 检查URL参数
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('forceWeb') === 'true') {
      console.log('✅ 检测到forceWeb=true，强制使用Web模式');
      return true;
    }

    // 2. 检查是否在 WebView 中（通过 UserAgent 判断）
    const ua = navigator.userAgent.toLowerCase();
    const isInWebView = /webboxapp|wv|micromessenger/.test(ua);
    if (isInWebView) {
      console.log('✅ 检测到 WebView 环境，使用原生模式');
      return false;  // WebView 中使用原生模式
    }

    // 3. 开发环境默认强制Web模式（但不在 WebView 中）
    if (import.meta.env.DEV) {
      console.log('✅ 开发环境（非 WebView），默认强制使用Web模式');
      return true;
    }

    return false;
  }

  /**
   * 初始化设备检测
   */
  setup() {
    // 如果强制Web模式，跳过设备检测
    if (this.forceWebMode) {
      this.isWeb = true;
      this.isIOS = false;
      this.isAndroid = false;
      console.log('🌐 强制Web模式已启用');
      return;
    }

    // 正常的设备检测逻辑
    const ua = navigator.userAgent.toLowerCase();
    this.isIOS = /iphone|ipad|ipod/.test(ua);
    this.isAndroid = /android/.test(ua);
    this.isWeb = !this.isIOS && !this.isAndroid;

    console.log('设备类型检测:', {
      isIOS: this.isIOS,
      isAndroid: this.isAndroid,
      isWeb: this.isWeb,
      userAgent: navigator.userAgent
    });
  }

  /**
   * Mock数据配置
   * 在Web环境下模拟原生返回的数据
   */
  getMockData(method) {
    // 生成mock token（仅用于开发测试）
    const generateMockToken = () => {
      return "mock-jwt-token-placeholder-for-development-only";
    };

    const mockData = {
      // 用户信息mock数据（与Android返回格式一致）
      'userInfo.getUserInfoFromApp': {
        code: '000000',
        msg: 'success',
        data: {
          token: generateMockToken(),
          tokenType: 'bearer',
          userInfo: {
            id: "1",
            email: "test@example.com",
            username: "testuser",
            mobile: "13000000000",
            is_active: true,
            created_at: "2026-02-08T11:53:21.090883+00:00",
            updated_at: "2026-02-08T11:53:21.090993+00:00"
          },
          isLoggedIn: true
        }
      },

      // 设备信息mock数据
      'device.getDeviceInfo': {
        code: '000000',
        msg: 'success',
        data: {
          deviceId: 'mock-device-id-12345',
          deviceName: 'Mock Device',
          platform: 'web',
          systemVersion: '1.0.0',
          appVersion: '1.0.0'
        }
      },

      // 拍照mock数据
      'camera.takePhoto': {
        code: '000000',
        msg: 'success',
        data: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBD'
      }
    };

    return mockData[method] || {
      code: '900001',
      msg: `Mock数据未定义: ${method}`,
      data: null
    };
  }

  /**
   * 调用原生方法
   * @param {string} method - 方法名
   * @param {object} params - 参数对象
   * @param {function} callback - 回调函数
   */
  callNative(method, params = {}, callback = null) {
    if (this.isWeb) {
      console.log('Web环境，跳过原生调用:', { method, params });
      return;
    }

    // 生成唯一回调ID
    const callbackId = callback ? `callback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` : null;

    if (callbackId && callback) {
      console.log('注册回调:', { callbackId });
      // 注册回调函数，处理原生传递的三个独立参数
      window[callbackId] = (code, msg, data) => {
        console.log('收到原生回调:', { callbackId, code, msg, data });
        // 将三个独立参数转换为包含code、msg、data的对象格式
        const result = {
          code,
          msg,
          data
        };
        callback(result);
        // 清理回调函数
        setTimeout(() => {
          delete window[callbackId];
        }, 100);
      };
    }

    if (this.isIOS) {
      this._callIOS(method, params, callbackId);
    } else if (this.isAndroid) {
      this._callAndroid(method, params, callbackId);
    }
  }

  /**
   * 调用iOS原生方法
   * @private
   */
  _callIOS(method, params, callbackId) {
    try {
      // iOS通过WKWebView的messageHandlers调用原生
      if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.nativeBridge) {
        const callParams = {
          method,
          params,
          callbackId
        };
        window.webkit.messageHandlers.nativeBridge.postMessage(callParams);
      } else {
        console.error('iOS原生桥接未注册');
      }
    } catch (error) {
      console.error('调用iOS原生方法失败:', error);
    }
  }

  /**
   * 调用Android原生方法
   * @private
   */
  _callAndroid(method, params, callbackId) {
    try {
      // Android通过addJavascriptInterface注入的对象调用原生
      if (window.Android && window.Android.callNative) {
        console.log('调用Android原生方法:', { method, params, callbackId });
        // 直接传递三个参数给原生，不需要JSON序列化
        window.Android.callNative(method, JSON.stringify(params), callbackId);
        console.log('Android原生方法调用成功');
      } else {
        console.error('Android原生桥接未注册或方法不存在');
      }
    } catch (error) {
      console.error('调用Android原生方法失败:', error);
    }
  }

  /**
   * 通用调用方法 - 支持Promise
   * @param {string} method - 方法名，支持"模块名.方法名"格式
   * @param {object} params - 参数对象
   * @returns {Promise} 返回Promise对象，resolve整个原始结果（包含code、msg、data）
   */
  call(method, params = {}) {
    return new Promise((resolve) => {
      // 如果是Web环境，使用mock数据
      if (this.isWeb) {
        console.log('🌐 Web环境，使用Mock数据:', { method, params });
        const mockResult = this.getMockData(method);
        console.log('📦 Mock数据返回:', mockResult);

        // 模拟异步延迟，更真实
        setTimeout(() => {
          resolve(mockResult);
        }, 100);
        return;
      }

      // 原生环境：调用原生方法
      this.callNative(method, params, (result) => {
        resolve(result);
      });
    });
  }

  /**
   * 支持回调的通用调用方法
   * @param {string} method - 方法名
   * @param {object} params - 参数对象
   * @param {function} callback - 可选的回调函数，接收完整的原始结果（包含code、msg、data）
   * @returns {Promise} 返回Promise对象，resolve整个原始结果
   */
  async callWithCallback(method, params = {}, callback = null) {
    try {
      const result = await this.call(method, params);
      // 打印完整结果
      console.log('App回调:', result);
      // 如果提供了回调，则调用它，传递完整的原始结果
      if (typeof callback === 'function') {
        callback(result);
      }
      return result;
    } catch (error) {
      // 如果提供了回调，则调用它
      if (typeof callback === 'function') {
        callback({ code: '999999', msg: error.message || '调用失败', data: null });
      }
      throw error;
    }
  }

  /**
   * 获取设备信息
   * @param {function} callback - 可选的回调函数，接收完整的原始结果（包含code、msg、data）
   * @returns {Promise} 返回Promise对象，resolve整个原始结果
   */
  async getDeviceInfo(callback = null) {
    return this.callWithCallback('device.getDeviceInfo', {}, callback);
  }

  /**
   * 获取用户信息
   * @param {function} callback - 可选的回调函数，接收完整的原始结果（包含code、msg、data）
   * @returns {Promise} 返回Promise对象，resolve整个原始结果
   */
  async getUserInfoFromApp(callback = null) {
    return this.callWithCallback('userInfo.getUserInfoFromApp', {}, callback);
  }

  /**
   * 退出登录
   * @param {function} callback - 可选的回调函数，接收完整的原始结果（包含code、msg、data）
   * @returns {Promise} 返回Promise对象，resolve整个原始结果
   */
  async logout(callback = null) {
    return this.callWithCallback('userInfo.logout', {}, callback);
  }

  /**
   * 打开相册选择图片
   * @param {function} callback - 可选的回调函数，接收完整的原始结果（包含code、msg、data）
   * @returns {Promise} 返回Promise对象，resolve整个原始结果
   */
  async selectImage(callback = null) {
    // 如果是web环境，使用浏览器的文件选择器
    if (this.isWeb) {
      return new Promise((resolve) => {
        // 创建input元素
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.multiple = true; // 允许选择多张图片

        input.onchange = (e) => {
          const files = Array.from(e.target.files);
          if (files.length === 0) {
            resolve({ code: '999999', msg: '未选择图片', data: null });
            return;
          }

          // 读取文件并转换为Base64
          const readers = files.map(file => {
            return new Promise((resolveFile, rejectFile) => {
              const reader = new FileReader();
              reader.onload = (event) => {
                resolveFile(event.target.result);
              };
              reader.onerror = () => {
                rejectFile(new Error('读取文件失败'));
              };
              reader.readAsDataURL(file);
            });
          });

          // 等待所有文件读取完成
          Promise.all(readers)
            .then(base64Images => {
              const result = {
                code: '000000',
                msg: 'success',
                data: base64Images
              };

              if (typeof callback === 'function') {
                callback(result);
              }
              resolve(result);
            })
            .catch((error) => {
              const errorResult = {
                code: '999999',
                msg: error.message || '读取图片失败',
                data: null
              };

              if (typeof callback === 'function') {
                callback(errorResult);
              }
              resolve(errorResult);
            });
        };

        // 触发文件选择对话框
        input.click();
      });
    }

    // 原生环境：调用原生方法
    return this.callWithCallback('camera.selectImage', {}, callback);
  }

  /**
   * 显示图片来源选择对话框
   * 让用户选择是拍照还是从相册选择
   * @param {function} callback - 可选的回调函数，接收完整的原始结果（包含code、msg、data）
   * @returns {Promise} 返回Promise对象，resolve整个原始结果
   */
  async showImagePickerDialog(callback = null) {
    // 如果是web环境，使用浏览器的文件选择器
    if (this.isWeb) {
      return new Promise((resolve) => {
        console.log('🌐 Web环境，使用浏览器的文件选择器');

        // 创建input元素
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';

        input.onchange = (e) => {
          const file = e.target.files[0];
          if (!file) {
            resolve({ code: '999999', msg: '未选择图片', data: null });
            return;
          }

          // 读取文件并转换为Base64
          const reader = new FileReader();
          reader.onload = (event) => {
            const result = {
              code: '000000',
              msg: 'success',
              data: [event.target.result] // 返回数组格式，与原生保持一致
            };

            if (typeof callback === 'function') {
              callback(result);
            }
            resolve(result);
          };
          reader.onerror = () => {
            const errorResult = {
              code: '999999',
              msg: '读取图片失败',
              data: null
            };

            if (typeof callback === 'function') {
              callback(errorResult);
            }
            resolve(errorResult);
          };
          reader.readAsDataURL(file);
        };

        // 触发文件选择对话框
        input.click();
      });
    }

    // 原生环境：调用原生方法
    return this.callWithCallback('camera.showImagePickerDialog', {}, callback);
  }

  /**
   * 打开相机拍照
   * @param {function} callback - 可选的回调函数，接收完整的原始结果（包含code、msg、data）
   * @returns {Promise} 返回Promise对象，resolve整个原始结果
   */
  async takePhoto(callback = null) {
    // 如果是web环境，使用浏览器的文件选择器
    if (this.isWeb) {
      return new Promise((resolve) => {
        // 创建input元素
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.capture = 'camera'; // 优先使用相机

        input.onchange = (e) => {
          const file = e.target.files[0];
          if (!file) {
            resolve({ code: '999999', msg: '未拍照', data: null });
            return;
          }

          // 读取文件并转换为Base64
          const reader = new FileReader();
          reader.onload = (event) => {
            const result = {
              code: '000000',
              msg: 'success',
              data: event.target.result // 返回单个Base64字符串
            };

            if (typeof callback === 'function') {
              callback(result);
            }
            resolve(result);
          };
          reader.onerror = () => {
            const errorResult = {
              code: '999999',
              msg: '读取图片失败',
              data: null
            };

            if (typeof callback === 'function') {
              callback(errorResult);
            }
            resolve(errorResult);
          };
          reader.readAsDataURL(file);
        };

        // 触发相机
        input.click();
      });
    }

    // 原生环境：调用原生方法
    return this.callWithCallback('camera.takePhoto', {}, callback);
  }

  /**
   * 执行耗时操作
   * @param {function} callback - 可选的回调函数，接收完整的原始结果（包含code、msg、data）
   * @returns {Promise} 返回Promise对象，resolve整个原始结果
   */
  async doSomethingCostVeryLongTime(callback = null) {
    return this.callWithCallback('device.doSomethingCostVeryLongTime', {}, callback);
  }

  /**
   * 显示Toast提示
   * @param {string} message - 提示消息
   * @param {number} duration - 显示时长（毫秒）
   */
  showToast(message, duration = 2000) {
    this.callNative('showToast', { message, duration });
  }

  /**
   * 结束当前页面
   */
  finishActivity() {
    this.callNative('finishActivity', {});
  }
}

// 创建单例实例
const deviceBridge = new DeviceBridge();

// 同时支持ES模块和CommonJS
if (typeof module !== 'undefined' && module.exports) {
  module.exports = deviceBridge;
}

if (typeof window !== 'undefined') {
  // 挂载到window对象，方便非模块化环境使用
  window.deviceBridge = deviceBridge;
}

// ES模块导出
try {
  module.exports = deviceBridge;
} catch (e) {
  // 忽略CommonJS导出错误
}

export default deviceBridge;

// 供原生调用的全局方法，用于处理回调
// 支持两种调用方式：
// 1. window.nativeCallback(callbackId, code, msg, data) - 原生直接调用
// 2. window.callbackId(code, msg, data) - 通过JSBridge调用
window.nativeCallback = function(callbackId, code, msg, data) {
  if (window[callbackId] && typeof window[callbackId] === 'function') {
    try {
      // 检查是否是三个独立参数的形式（code, msg, data）
      if (arguments.length === 4) {
        // 将三个独立参数转换为包含code、msg、data的对象格式
        const result = {
          code,
          msg,
          data: typeof data === 'string' ? JSON.parse(data) : data
        };
        window[callbackId](result);
      } else if (arguments.length === 2) {
        // 旧格式：callbackId, result（兼容旧版调用）
        const parsedResult = typeof code === 'string' ? JSON.parse(code) : code;
        window[callbackId](parsedResult);
      }
    } catch (e) {
      console.error('处理原生回调时出错:', e);
      // 如果解析失败，传递原始数据
      window[callbackId]({code: '999999', msg: '回调处理失败', data: null});
    }
  }
};
