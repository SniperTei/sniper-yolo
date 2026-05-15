import { upload } from '@/utils/request'

/**
 * 上传Base64图片
 * @param {string} base64Data - Base64编码的图片数据
 * @param {Function} onProgress - 上传进度回调函数
 * @returns {Promise}
 */
export function uploadBase64Image(base64Data, onProgress) {
  const formData = new FormData()

  // 将base64转换为blob
  const arr = base64Data.split(',')
  const mime = arr[0].match(/:(.*?);/)[1]
  const bstr = atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }

  // 获取文件扩展名
  let extension = 'jpg'
  if (mime.includes('png')) {
    extension = 'png'
  } else if (mime.includes('gif')) {
    extension = 'gif'
  } else if (mime.includes('webp')) {
    extension = 'webp'
  }

  // 创建文件对象
  const blob = new Blob([u8arr], { type: mime })
  const file = new File([blob], `image.${extension}`, { type: mime })

  formData.append('file', file)

  return upload('/api/v1/upload/image', formData, onProgress)
}

/**
 * 上传多张Base64图片
 * @param {string[]} base64DataArray - Base64编码的图片数据数组
 * @param {Function} onProgress - 上传进度回调函数
 * @returns {Promise}
 */
export function uploadBase64Images(base64DataArray, onProgress) {
  const formData = new FormData()

  // 将每个base64转换为文件
  base64DataArray.forEach((base64Data, index) => {
    const arr = base64Data.split(',')
    const mime = arr[0].match(/:(.*?);/)[1]
    const bstr = atob(arr[1])
    let n = bstr.length
    const u8arr = new Uint8Array(n)
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n)
    }

    // 获取文件扩展名
    let extension = 'jpg'
    if (mime.includes('png')) {
      extension = 'png'
    } else if (mime.includes('gif')) {
      extension = 'gif'
    } else if (mime.includes('webp')) {
      extension = 'webp'
    }

    // 创建文件对象
    const blob = new Blob([u8arr], { type: mime })
    const file = new File([blob], `image_${index}.${extension}`, { type: mime })

    formData.append('files', file)
  })

  return upload('/api/v1/upload/images', formData, onProgress)
}

/**
 * 上传单张图片文件
 * @param {File} file - 要上传的文件对象
 * @param {Function} onProgress - 上传进度回调函数
 * @returns {Promise}
 */
export function uploadImage(file, onProgress) {
  const formData = new FormData()
  formData.append('file', file)

  return upload('/api/v1/upload/image', formData, onProgress)
}

/**
 * 上传多张图片文件
 * @param {File[]} files - 要上传的文件对象数组
 * @param {Function} onProgress - 上传进度回调函数
 * @returns {Promise}
 */
export function uploadImages(files, onProgress) {
  const formData = new FormData()
  files.forEach((file) => {
    formData.append('files', file)
  })

  return upload('/api/v1/upload/images', formData, onProgress)
}
