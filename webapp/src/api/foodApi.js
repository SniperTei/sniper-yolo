import { get, post, put, del } from '@/utils/request'

/**
 * 食物列表
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export function getFoodList(params) {
  // 转一层，将params转换为data
  // const data = {
  //   ...params
  // }
  console.log("参数:" + params)
  return get('/api/v1/foods/', params)
}

/**
 * 创建食品
 * @param {Object} data - 食品数据
 * @returns {Promise}
 */
export function createFood(params) {
  // 转一层，将params转换为data
  const data = {
    ...params
  }
  console.log("参数:" + data)
  return post('/api/v1/foods/', data)
}

/**
 * 获取单个食品
 * @param {string} foodId - 食品ID
 * @returns {Promise}
 */
export function getFoodDetail(foodId) {
  return get(`/api/v1/foods/${foodId}`)
}

/**
 * 更新食品
 * @param {string} foodId - 食品ID
 * @param {Object} params - 要更新的数据
 * @returns {Promise}
 */
export function updateFood(foodId, params) {
  // 转一层，将params转换为data
  const data = {
    ...params
  }
  return put(`/api/v1/foods/${foodId}`, data)
}

/**
 * 删除食品
 * @param {string} foodId - 食品ID
 * @returns {Promise}
 */
export function deleteFood(foodId) {
  return del(`/api/v1/foods/${foodId}`)
}
