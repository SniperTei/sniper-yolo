import { get, post, put, del } from '@/utils/request'

/**
 * 饮品列表
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export function getDrinkList(params) {
  console.log("参数:" + params)
  return get('/api/v1/drinks/', params)
}

/**
 * 创建饮品
 * @param {Object} data - 饮品数据
 * @returns {Promise}
 */
export function createDrink(params) {
  const data = {
    ...params
  }
  console.log("参数:" + data)
  return post('/api/v1/drinks/', data)
}

/**
 * 获取单个饮品
 * @param {string} drinkId - 饮品ID
 * @returns {Promise}
 */
export function getDrinkDetail(drinkId) {
  return get(`/api/v1/drinks/${drinkId}`)
}

/**
 * 更新饮品
 * @param {string} drinkId - 饮品ID
 * @param {Object} params - 要更新的数据
 * @returns {Promise}
 */
export function updateDrink(drinkId, params) {
  const data = {
    ...params
  }
  return put(`/api/v1/drinks/${drinkId}`, data)
}

/**
 * 删除饮品
 * @param {string} drinkId - 饮品ID
 * @returns {Promise}
 */
export function deleteDrink(drinkId) {
  return del(`/api/v1/drinks/${drinkId}`)
}
