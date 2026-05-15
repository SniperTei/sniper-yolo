import axios from 'axios';
import envConfig from '@/config/env';
import { showDialog } from 'vant';
import { useUserStore } from '@/stores/user';

// 创建axios实例
const service = axios.create({
  baseURL: envConfig.baseURL, // 从环境配置中获取API基础URL
  timeout: envConfig.timeout, // 从环境配置中获取超时时间
});

// 请求拦截器
service.interceptors.request.use(
  config => {
    // 从user store获取token并添加到请求头
    const userStore = useUserStore();
    // 打印config
    console.log('userStore:', userStore);
    const token = userStore.token;
    // 打印token
    console.log('token:', token);
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    // 如果token还是空 就从localstorage获取
    // if (!token) {
    //   let token2 = localStorage.getItem('token');
    //   if (token2) {
    //     config.headers['token'] = token2;
    //   }
    // }
    return config;
  },
  error => {
    console.error('请求错误:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
service.interceptors.response.use(
  response => {
    const res = response.data;
    console.log('接口返回:', res);

    // 如果响应码不是000000，认为请求有错误
    if (res.code !== '000000') {
      console.error('接口返回错误:', res.msg);

      // 可以在这里处理特定错误码，例如token过期等
      if (res.code === 'A00102') { // 假设A00102是token过期的错误码
        // 清除token并重定向到登录页
        localStorage.removeItem('token');
        window.location.href = '/login';
      }

      // 返回服务器返回的错误消息，而不是创建新的错误对象
      return Promise.reject({
        message: res.msg || '未知错误',
        code: res.code,
        response: res
      });
    }

    return res;
  },
  error => {
    console.error('响应错误:', error);
    // 处理网络错误等
    const errorMsg = error.response?.data?.msg || error.message || '网络错误，请稍后重试';
    return Promise.reject({
      message: errorMsg,
      code: error.response?.data?.code || 'NETWORK_ERROR',
      response: error.response?.data
    });
  }
);

/**
 * 过滤对象中的空字段
 * @param {Object} obj - 要过滤的对象
 * @returns {Object} - 过滤后的对象
 */
function filterEmptyFields(obj) {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }
  const filteredObj = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key];
      // 过滤掉 null、undefined 和空字符串
      if (value !== null && value !== undefined && value !== '') {
        filteredObj[key] = value;
      }
    }
  }
  return filteredObj;
}

/**
 * 判断是否应使用原生请求
 * @returns {boolean}
 */
function shouldUseNativeRequest() {
  const mode = envConfig.useNativeRequest || 'auto';

  if (mode === 'native') return true;
  if (mode === 'axios') return false;

  // auto 模式：仅在 Android WebView 中使用 native 请求
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('forceWeb') === 'true') return false;

  // 检测是否在 Android WebView 中（排除浏览器 web mock）
  const isAndroidWebView = /Android.*wv/.test(navigator.userAgent);
  return isAndroidWebView && !!(window.Coconut && window.Coconut.network);
}

/**
 * 通过 coconut bridge 发起原生网络请求
 * @param {string} method - HTTP 方法 (GET/POST/PUT/DELETE)
 * @param {string} url - 请求路径（相对路径）
 * @param {Object} data - 请求数据
 * @param {boolean} autoShowError - 是否自动显示错误
 * @returns {Promise} - 返回与 axios 响应拦截器格式一致的 Promise
 */
async function nativeRequest(method, url, data, autoShowError) {
  const fullUrl = envConfig.baseURL + url;
  const headers = { 'Content-Type': 'application/json' };

  // 从 userStore 获取 token
  try {
    const userStore = useUserStore();
    if (userStore.token) {
      headers['Authorization'] = `Bearer ${userStore.token}`;
    }
  } catch (e) {
    // userStore 可能尚未初始化
  }

  // 构造 coconut network.request 参数
  const params = {
    url: fullUrl,
    method: method.toUpperCase(),
    headers,
  };

  // GET 请求参数拼接到 URL
  if (method === 'get' && data) {
    const filtered = filterEmptyFields(data);
    const qs = new URLSearchParams(filtered).toString();
    if (qs) params.url += '?' + qs;
  } else if (data) {
    params.body = JSON.stringify(filterEmptyFields(data));
  }

  try {
    console.log('[nativeRequest]', params.method, params.url);
    const response = await window.Coconut.callAsync('network.request', params);

    // v2.0.0 响应格式：{jsonrpc, id, code, message, result}
    // result 是组件返回值：{ code, message, data: { statusCode, body, headers } }
    // body 是 HTTP 响应体的 JSON 字符串，包含实际业务数据
    const componentResult = response.result || response;

    // 解析 HTTP 响应体（业务数据）
    let body;
    if (componentResult.data && componentResult.data.body) {
      body = typeof componentResult.data.body === 'string'
        ? JSON.parse(componentResult.data.body)
        : componentResult.data.body;
    } else if (typeof componentResult === 'string') {
      body = JSON.parse(componentResult);
    } else {
      body = componentResult;
    }

    const code = body.code;
    const msg = body.msg || body.message;

    console.log('[nativeRequest] 响应:', body);

    // 与 axios 响应拦截器一致的错误处理
    if (code !== '000000') {
      console.error('[nativeRequest] 错误:', msg);

      if (code === 'A00102') {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }

      const error = {
        message: msg || '未知错误',
        code: code,
        response: body
      };

      if (autoShowError) {
        showDialog({ message: error.message });
      }
      return Promise.reject(error);
    }

    return body;
  } catch (err) {
    console.error('[nativeRequest] 异常:', err);
    const error = {
      message: err.message || '网络错误，请稍后重试',
      code: 'NETWORK_ERROR',
      response: null
    };
    if (autoShowError) {
      showDialog({ message: error.message });
    }
    return Promise.reject(error);
  }
}

/**
 * 封装GET请求
 */
export function get(url, params, autoShowError = true) {
  if (shouldUseNativeRequest()) {
    return nativeRequest('get', url, params, autoShowError);
  }
  const filteredParams = filterEmptyFields(params);
  return service({
    url,
    method: 'get',
    params: filteredParams
  }).catch(error => {
    if (autoShowError) {
      showDialog({ message: error.message || '请求失败' });
    }
    return Promise.reject(error);
  });
}

/**
 * 封装POST请求
 */
export function post(url, data, autoShowError = true) {
  if (shouldUseNativeRequest()) {
    return nativeRequest('post', url, data, autoShowError);
  }
  const filteredData = filterEmptyFields(data);
  return service({
    url,
    method: 'post',
    data: filteredData
  }).catch(error => {
    if (autoShowError) {
      showDialog({ message: error.message || '请求失败' });
    }
    return Promise.reject(error);
  });
}

/**
 * 封装PUT请求
 */
export function put(url, data, autoShowError = true) {
  if (shouldUseNativeRequest()) {
    return nativeRequest('put', url, data, autoShowError);
  }
  const filteredData = filterEmptyFields(data);
  return service({
    url,
    method: 'put',
    data: filteredData
  }).catch(error => {
    if (autoShowError) {
      showDialog({ message: error.message || '请求失败' });
    }
    return Promise.reject(error);
  });
}

/**
 * 封装DELETE请求
 */
export function del(url, data, autoShowError = true) {
  if (shouldUseNativeRequest()) {
    return nativeRequest('delete', url, data, autoShowError);
  }
  const filteredData = filterEmptyFields(data);
  return service({
    url,
    method: 'delete',
    data: filteredData
  }).catch(error => {
    if (autoShowError) {
      showDialog({ message: error.message || '请求失败' });
    }
    return Promise.reject(error);
  });
}

/**
 * 封装文件上传请求
 */
export function upload(url, formData, onProgress, autoShowError = true) {
  // 文件上传始终走 axios（coconut bridge 不支持 FormData）
  return service({
    url,
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        onProgress(percentCompleted)
      }
    }
  }).catch(error => {
    if (autoShowError) {
      showDialog({ message: error.message || '上传失败' })
    }
    return Promise.reject(error)
  })
}

export default service;
