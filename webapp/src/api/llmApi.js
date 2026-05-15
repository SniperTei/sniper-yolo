import { get, post } from '@/utils/request'

/**
 * 生成文本（非流式）
 * @param {Object} params - 请求参数
 * @param {string} params.model - 模型名称，如 deepseek-r1:1.5b
 * @param {string} params.prompt - 输入提示词
 * @param {boolean} params.stream - 是否流式输出，默认false
 * @param {number} params.temperature - 控制随机性，0-2，默认0.8
 * @param {number} params.top_p - 核采样参数，0-1，默认0.9
 * @param {number} params.max_tokens - 最大生成token数，默认500
 * @param {number} params.num_ctx - 上下文窗口大小，默认2048
 * @returns {Promise}
 */
export function generateText(params) {
  const data = {
    ...params
  }
  console.log('生成文本参数:', data)
  return post('/api/v1/llm/generate', data)
}

/**
 * 生成文本（流式）
 * @param {Object} params - 请求参数，与generateText相同
 * @returns {Promise}
 */
export function generateTextStream(params) {
  const data = {
    ...params,
    stream: true
  }
  console.log('生成文本流式参数:', data)
  return post('/api/v1/llm/generate/stream', data)
}

/**
 * 对话模式（非流式）
 * @param {Object} params - 请求参数
 * @param {string} params.model - 模型名称
 * @param {Array} params.messages - 对话消息列表，每条消息包含role和content
 * @param {boolean} params.stream - 是否流式输出，默认false
 * @param {number} params.temperature - 控制随机性，0-2，默认0.8
 * @param {number} params.top_p - 核采样参数，0-1，默认0.9
 * @param {number} params.max_tokens - 最大生成token数，默认500
 * @param {number} params.num_ctx - 上下文窗口大小，默认2048
 * @returns {Promise}
 */
export function chat(params) {
  const data = {
    ...params
  }
  console.log('对话参数:', data)
  return post('/api/v1/llm/chat', data)
}

/**
 * 对话模式（流式）
 * @param {Object} params - 请求参数，与chat相同
 * @returns {Promise}
 */
export function chatStream(params) {
  const data = {
    ...params,
    stream: true
  }
  console.log('对话流式参数:', data)
  return post('/api/v1/llm/chat/stream', data)
}

/**
 * 获取可用模型列表
 * @returns {Promise}
 */
export function getModels() {
  console.log('获取模型列表')
  return get('/api/v1/llm/models')
}
