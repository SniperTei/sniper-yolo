import { get, post, put, del } from '@/utils/request'

/**
 * 娱乐列表
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export function getFunList(params) {
  console.log("参数:" + params)
  return get('/api/v1/fun/', params)
}

/**
 * 创建娱乐
 * @param {Object} data - 娱乐数据
 * @returns {Promise}
 */
export function createFun(params) {
  const data = {
    ...params
  }
  console.log("参数:" + data)
  return post('/api/v1/fun/', data)
}

/**
 * 获取单个娱乐
 * @param {string} funId - 娱乐ID
 * @returns {Promise}
 */
export function getFunDetail(funId) {
  return get(`/api/v1/fun/${funId}`)
}

/**
 * 更新娱乐
 * @param {string} funId - 娱乐ID
 * @param {Object} params - 要更新的数据
 * @returns {Promise}
 */
export function updateFun(funId, params) {
  const data = {
    ...params
  }
  return put(`/api/v1/fun/${funId}`, data)
}

/**
 * 删除娱乐
 * @param {string} funId - 娱乐ID
 * @returns {Promise}
 */
export function deleteFun(funId) {
  return del(`/api/v1/fun/${funId}`)
}
