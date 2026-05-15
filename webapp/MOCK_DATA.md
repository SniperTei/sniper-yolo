# Mock数据说明

## 概述

前端项目现在支持在浏览器环境下使用Mock数据进行调试，无需依赖Android App。

## Mock数据位置

Mock数据定义在 `src/utils/device.js` 文件的 `getMockData()` 方法中。

## 当前Mock数据

### 1. 用户信息 Mock

**方法**: `userInfo.getUserInfoFromApp`

**数据格式**:
```javascript
{
  code: '000000',
  msg: 'success',
  data: {
    token: 'mock_jwt_token_for_development_only',
    tokenType: 'bearer',
    userInfo: {
      id: 2,
      email: 'test@example.com',
      username: 'test',
      mobile: null,
      is_active: true,
      created_at: '2026-02-05T05:06:24.142815+00:00',
      updated_at: '2026-02-05T05:06:24.142815+00:00'
    },
    isLoggedIn: true
  }
}
```

**注意**: token 使用占位符，实际代码中会动态生成。

### 2. 设备信息 Mock

**方法**: `device.getDeviceInfo`

**数据格式**:
```javascript
{
  code: '000000',
  msg: 'success',
  data: {
    deviceId: 'mock-device-id-12345',
    deviceName: 'Mock Device',
    platform: 'web',
    systemVersion: '1.0.0',
    appVersion: '1.0.0'
  }
}
```

## 使用方式

### 在浏览器中调试

1. **启动开发服务器**
   ```bash
   npm run dev
   ```

2. **在浏览器中打开**
   - 访问 `http://localhost:5173`
   - 会自动检测到Web环境
   - 自动使用Mock数据进行登录

3. **控制台日志**
   打开浏览器控制台，会看到：
   ```
   🌐 Web环境，使用Mock数据: {method: "userInfo.getUserInfoFromApp", params: {}}
   📦 Mock数据返回: {code: "000000", msg: "success", data: {...}}
   ✅ 用户数据验证通过，开始保存
   ✅ 用户信息已保存
     - username: test
     - email: test@example.com
   ```

### 在Android App中调试

- App环境会自动调用原生方法
- 不会使用Mock数据

## 添加新的Mock数据

在 `src/utils/device.js` 的 `getMockData()` 方法中添加：

```javascript
getMockData(method) {
  const mockData = {
    // 现有的mock数据...

    // 添加新的mock数据
    'your.module.method': {
      code: '000000',
      msg: 'success',
      data: {
        // 你的mock数据
      }
    }
  };

  return mockData[method] || {
    code: '900001',
    msg: `Mock数据未定义: ${method}`,
    data: null
  };
}
```

## Mock数据与真实数据的一致性

Mock数据的格式完全基于Android App返回的真实数据，确保：
1. ✅ 数据结构一致
2. ✅ 字段名称一致
3. ✅ 数据类型一致
4. ✅ 响应格式一致（code、msg、data）

这样在Web环境调试好的代码，在App中也能正常运行。
