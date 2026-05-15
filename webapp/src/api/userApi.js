import { post } from '@/utils/request'

/**
 * 用户登录
 * @param {string} identifier - 用户名/邮箱/手机号
 * @param {string} password - 密码
 * @returns {Promise}
 */
export function login(identifier, password) {
  return post('/api/v1/users/login', { identifier, password })
}
