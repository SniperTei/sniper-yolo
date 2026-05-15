/**
 * 环境配置文件
 * 用于管理不同环境下的配置参数
 */

// 获取当前环境 - 使用 import.meta.env 替代 process.env
const env = import.meta.env.MODE || 'development';

// 基础配置
const baseConfig = {
  // 当前环境
  env,
  // 是否为开发环境
  isDev: env === 'dev',
  // 是否为生产环境
  isProd: env === 'prod',
  // 应用标题
  title: import.meta.env.VITE_APP_TITLE || '移动端H5应用',
  // 应用版本
  version: '1.0.0',
  // 网络请求模式：'auto' 自动检测 | 'native' 强制coconut bridge | 'axios' 强制axios
  useNativeRequest: 'auto',
};

// 不同环境的特定配置
const environmentConfigs = {
  // 开发环境配置
  dev: {
    apiBaseUrl: import.meta.env.VITE_APP_API_URL || 'http://localhost:8000',
    debug: true,
    requestTimeout: 30000,
  },
  // 测试环境配置
  test: {
    apiBaseUrl: import.meta.env.VITE_APP_API_URL || 'https://api-test.sniper14.online',
    debug: true,
    requestTimeout: 30000,
  },
  // 生产环境配置
  prod: {
    apiBaseUrl: import.meta.env.VITE_APP_API_URL || 'https://api-prod.sniper14.online',
    debug: false,
    requestTimeout: 30000,
  },
};

// 合并配置
const config = {
  ...baseConfig,
  ...environmentConfigs[env] || environmentConfigs.dev,
};

// 导出配置 - 同时支持 baseURL 和 apiBaseUrl 属性名以保持兼容性
export default {
  ...config,
  baseURL: config.apiBaseUrl, // 添加 baseURL 别名
  timeout: config.requestTimeout, // 添加 timeout 别名
};

// 导出配置的类型定义（TypeScript 类型提示）
// export type EnvConfig = typeof config;
