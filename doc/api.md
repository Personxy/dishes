# 餐饮点餐系统 API 接口文档

## 目录

- [用户相关接口](#用户相关接口)
- [菜品相关接口](#菜品相关接口)
- [分类相关接口](#分类相关接口)
- [订单相关接口](#订单相关接口)
- [备注模板相关接口](#备注模板相关接口)

## 用户相关接口

### 1. 用户注册

- **URL**: `/api/users/register`
- **方法**: `POST`
- **请求体**:
  ```json
  {
    "username": "用户名",
    "password": "密码",
    "phone": "手机号"
  }
  ```
- **响应**:
  ```json
  {
    "success": true,
    "data": {
      "_id": "用户ID",
      "username": "用户名",
      "phone": "手机号",
      "role": "user",
      "createdAt": "创建时间"
    }
  }
  ```

### 2. 用户登录

- **URL**: `/api/users/login`
- **方法**: `POST`
- **请求体**:
  ```json
  {
    "username": "用户名",
    "password": "密码"
  }
  ```
- **响应**:
  ```json
  {
    "success": true,
    "token": "JWT令牌"
  }
  ```

### 3. 发送短信验证码

- **URL**: `/api/users/sms`
- **方法**: `POST`
- **请求体**:
  ```json
  {
    "phone": "手机号"
  }
  ```
- **响应**:
  ```json
  {
    "success": true
  }
  ```

### 4. 短信验证码登录

- **URL**: `/api/users/login-sms`
- **方法**: `POST`
- **请求体**:
  ```json
  {
    "phone": "手机号",
    "code": "验证码"
  }
  ```
- **响应**:
  ```json
  {
    "success": true,
    "token": "JWT令牌"
  }
  ```

### 5. 微信登录

- **URL**: `/api/users/wechatLogin`
- **方法**: `POST`
- **请求体**:
  ```json
  {
    "code": "微信授权码"
  }
  ```
- **响应**:
  ```json
  {
    "success": true,
    "token": "JWT令牌"
  }
  ```

## 菜品相关接口

### 1. 获取所有菜品

- **URL**: `/api/dishes`
- **方法**: `GET`
- **请求头**: `Authorization: Bearer {token}`
- **响应**:
  ```json
  {
    "success": true,
    "data": [
      {
        "_id": "菜品ID",
        "name": "菜品名称",
        "price": 价格,
        "description": "描述",
        "image": "图片URL",
        "category": "分类ID",
        "isAvailable": true
      }
    ]
  }
  ```

### 2. 创建菜品

- **URL**: `/api/dishes`
- **方法**: `POST`
- **请求头**: `Authorization: Bearer {token}`
- **请求体**:
  ```json
  {
    "name": "菜品名称",
    "price": 价格,
    "description": "描述",
    "image": "图片URL",
    "category": "分类ID",
    "isAvailable": true
  }
  ```
- **响应**:
  ```json
  {
    "success": true,
    "data": {
      "_id": "菜品ID",
      "name": "菜品名称",
      "price": 价格,
      "description": "描述",
      "image": "图片URL",
      "category": "分类ID",
      "isAvailable": true
    }
  }
  ```

### 3. 更新菜品

- **URL**: `/api/dishes/:id`
- **方法**: `PUT`
- **请求头**: `Authorization: Bearer {token}`
- **请求体**:
  ```json
  {
    "name": "菜品名称",
    "price": 价格,
    "description": "描述",
    "image": "图片URL",
    "category": "分类ID",
    "isAvailable": true
  }
  ```
- **响应**:
  ```json
  {
    "success": true,
    "data": {
      "_id": "菜品ID",
      "name": "菜品名称",
      "price": 价格,
      "description": "描述",
      "image": "图片URL",
      "category": "分类ID",
      "isAvailable": true
    }
  }
  ```

### 4. 删除菜品

- **URL**: `/api/dishes/:id`
- **方法**: `DELETE`
- **请求头**: `Authorization: Bearer {token}`
- **响应**:
  ```json
  {
    "success": true,
    "data": {}
  }
  ```

## 分类相关接口

### 1. 获取所有分类

- **URL**: `/api/categories`
- **方法**: `GET`
- **请求头**: `Authorization: Bearer {token}`
- **响应**:
  ```json
  {
    "success": true,
    "data": [
      {
        "_id": "分类ID",
        "name": "分类名称",
        "description": "描述"
      }
    ]
  }
  ```

### 2. 创建分类

- **URL**: `/api/categories`
- **方法**: `POST`
- **请求头**: `Authorization: Bearer {token}`
- **请求体**:
  ```json
  {
    "name": "分类名称",
    "description": "描述"
  }
  ```
- **响应**:
  ```json
  {
    "success": true,
    "data": {
      "_id": "分类ID",
      "name": "分类名称",
      "description": "描述"
    }
  }
  ```

### 3. 更新分类

- **URL**: `/api/categories/:id`
- **方法**: `PUT`
- **请求头**: `Authorization: Bearer {token}`
- **请求体**:
  ```json
  {
    "name": "分类名称",
    "description": "描述"
  }
  ```
- **响应**:
  ```json
  {
    "success": true,
    "data": {
      "_id": "分类ID",
      "name": "分类名称",
      "description": "描述"
    }
  }
  ```

### 4. 删除分类

- **URL**: `/api/categories/:id`
- **方法**: `DELETE`
- **请求头**: `Authorization: Bearer {token}`
- **响应**:
  ```json
  {
    "success": true,
    "data": {}
  }
  ```

## 订单相关接口

### 1. 创建订单

- **URL**: `/api/orders`
- **方法**: `POST`
- **请求头**: `Authorization: Bearer {token}`
- **请求体**:
  ```json
  {
    "items": [
      {
        "dish": "菜品ID",
        "quantity": 数量
      }
    ],
    "scheduledTime": "预定时间",
    "templateId": "备注模板ID",
    "customRemark": "自定义备注"
  }
  ```
- **响应**:
  ```json
  {
    "success": true,
    "data": {
      "_id": "订单ID",
      "user": "用户ID",
      "items": [
        {
          "dish": "菜品ID",
          "name": "菜品名称",
          "price": 价格,
          "quantity": 数量,
          "image": "图片URL"
        }
      ],
      "totalAmount": 总金额,
      "status": "pending",
      "remark": "备注",
      "scheduledTime": "预定时间",
      "createdAt": "创建时间"
    }
  }
  ```

### 2. 获取用户订单

- **URL**: `/api/orders`
- **方法**: `GET`
- **请求头**: `Authorization: Bearer {token}`
- **响应**:
  ```json
  {
    "success": true,
    "data": [
      {
        "_id": "订单ID",
        "user": {
          "_id": "用户ID",
          "username": "用户名",
          "phone": "手机号"
        },
        "items": [
          {
            "dish": "菜品ID",
            "name": "菜品名称",
            "price": 价格,
            "quantity": 数量,
            "image": "图片URL"
          }
        ],
        "totalAmount": 总金额,
        "status": "订单状态",
        "remark": "备注",
        "scheduledTime": "预定时间",
        "createdAt": "创建时间"
      }
    ]
  }
  ```

### 3. 取消订单

- **URL**: `/api/orders/:id`
- **方法**: `DELETE`
- **请求头**: `Authorization: Bearer {token}`
- **响应**:
  ```json
  {
    "success": true,
    "data": {
      "_id": "订单ID",
      "status": "canceled",
      "user": "用户ID",
      "items": [
        {
          "dish": "菜品ID",
          "name": "菜品名称",
          "price": 价格,
          "quantity": 数量,
          "image": "图片URL"
        }
      ],
      "totalAmount": 总金额,
      "remark": "备注",
      "scheduledTime": "预定时间",
      "createdAt": "创建时间"
    }
  }
  ```

### 4. 商家更新订单状态

- **URL**: `/api/merchant-orders/:id/status`
- **方法**: `PATCH`
- **请求头**: `Authorization: Bearer {token}` (需要商家权限)
- **请求体**:
  ```json
  {
    "status": "订单状态" // pending, confirmed, preparing, ready, completed, canceled
  }
  ```
- **响应**:
  ```json
  {
    "success": true,
    "data": {
      "_id": "订单ID",
      "status": "更新后的状态",
      "user": "用户ID",
      "items": [
        {
          "dish": "菜品ID",
          "name": "菜品名称",
          "price": 价格,
          "quantity": 数量,
          "image": "图片URL"
        }
      ],
      "totalAmount": 总金额,
      "remark": "备注",
      "scheduledTime": "预定时间",
      "createdAt": "创建时间"
    }
  }
  ```

## 备注模板相关接口

### 1. 创建备注模板

- **URL**: `/api/note-templates`
- **方法**: `POST`
- **请求头**: `Authorization: Bearer {token}`
- **请求体**:
  ```json
  {
    "content": "模板内容",
    "isPublic": false
  }
  ```
- **响应**:
  ```json
  {
    "success": true,
    "data": {
      "_id": "模板ID",
      "user": "用户ID",
      "content": "模板内容",
      "isPublic": false,
      "usedCount": 0,
      "createdAt": "创建时间"
    }
  }
  ```

### 2. 获取用户备注模板

- **URL**: `/api/note-templates`
- **方法**: `GET`
- **请求头**: `Authorization: Bearer {token}`
- **响应**:
  ```json
  {
    "success": true,
    "data": [
      {
        "_id": "模板ID",
        "user": "用户ID",
        "content": "模板内容",
        "isPublic": false,
        "usedCount": 使用次数,
        "createdAt": "创建时间"
      }
    ]
  }
  ```

### 3. 删除备注模板

- **URL**: `/api/note-templates/:id`
- **方法**: `DELETE`
- **请求头**: `Authorization: Bearer {token}`
- **响应**:
  ```json
  {
    "success": true,
    "data": {}
  }
  ```

## 认证说明

所有需要认证的接口都需要在请求头中添加 `Authorization: Bearer {token}`，其中 `{token}` 是通过登录接口获取的 JWT 令牌。

## 错误响应

当接口发生错误时，会返回以下格式的响应：

```json
{
  "success": false,
  "error": "错误信息"
}
```

状态码说明：

- 200: 请求成功
- 201: 创建成功
- 400: 请求参数错误
- 401: 未授权
- 404: 资源不存在
- 500: 服务器内部错误
