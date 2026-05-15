import { get, post, put, del } from '@/utils/request'

/**
 * 创建饭店
 * @param {Object} params - 饭店数据
 * @returns {Promise}
 */
export function createEnjoy(params) {
  const data = {
    ...params
  }
  return post('/api/v1/enjoys/', data)
}

/**
 * 获取饭店列表
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export function getEnjoyList(params) {
  return get('/api/v1/enjoys/', params)
}

/**
 * 获取单个饭店
 * @param {string} enjoyId - 饭店ID
 * @returns {Promise}
 */
export function getEnjoyDetail(enjoyId) {
  return get(`/api/v1/enjoys/${enjoyId}`)
}

/**
 * 更新饭店
 * @param {string} enjoyId - 饭店ID
 * @param {Object} params - 要更新的数据
 * @returns {Promise}
 */
export function updateEnjoy(enjoyId, params) {
  const data = {
    ...params
  }
  return put(`/api/v1/enjoys/${enjoyId}`, data)
}

/**
 * 删除饭店
 * @param {string} enjoyId - 饭店ID
 * @returns {Promise}
 */
export function deleteEnjoy(enjoyId) {
  return del(`/api/v1/enjoys/${enjoyId}`)
}