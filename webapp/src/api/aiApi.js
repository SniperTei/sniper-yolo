import { post } from '@/utils/request'

/**
 * AI 推荐 -- 根据用户历史记录推荐美食/饮品
 * @param {Object} params - { category: 'food'|'drink'|'all', extra_prompt: string }
 * @returns {Promise}
 */
export function aiSuggest(params) {
  return post('/api/v1/ai/suggest', params)
}

/**
 * AI 分析 -- 分析用户饮食习惯
 * @param {Object} params - { period_days: number, category: string, extra_question: string }
 * @returns {Promise}
 */
export function aiAnalyze(params) {
  return post('/api/v1/ai/analyze', params)
}

/**
 * AI 每日洞察 -- 一句话总结 + 建议
 * @returns {Promise}
 */
export function aiInsight() {
  return post('/api/v1/ai/insight', {})
}
