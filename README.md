# 餐饮点餐系统

## 项目概述

这是一个基于 Node.js、Express 和 MongoDB 构建的餐饮点餐系统后端 API。系统支持用户注册登录、菜品管理、分类管理、订单处理等功能，适用于餐厅、外卖等餐饮业务场景。

## 技术栈

- **后端框架**: Express.js
- **数据库**: MongoDB (使用 Mongoose ORM)
- **缓存**: Redis
- **认证**: JWT (JSON Web Token)
- **密码加密**: bcryptjs
- **其他工具**: Winston (日志), Agenda (定时任务)

## 系统功能

### 用户管理

- 用户注册与登录
- 支持微信登录集成
- 用户角色权限控制 (普通用户、商家、管理员)

### 菜品管理

- 菜品的增删改查
- 菜品分类管理
- 菜品上下架控制

### 订单系统

- 用户下单
- 订单状态管理 (待确认、已确认、已完成、已取消)
- 商家订单处理
- 预约时间验证

### 备注模板

- 用户可创建个人备注模板
- 支持公共模板共享
- 模板使用次数统计

## 项目结构

## API 端点

### 用户相关

- `POST /api/users/register` - 用户注册
- `POST /api/users/login` - 用户登录

### 菜品相关

- `GET /api/dishes` - 获取所有菜品
- `POST /api/dishes` - 创建菜品
- `PUT /api/dishes/:id` - 更新菜品
- `DELETE /api/dishes/:id` - 删除菜品

### 分类相关

- `GET /api/categories` - 获取所有分类
- `POST /api/categories` - 创建分类
- `PUT /api/categories/:id` - 更新分类
- `DELETE /api/categories/:id` - 删除分类

### 订单相关

- `POST /api/orders` - 创建订单
- `GET /api/orders` - 获取用户订单
- `DELETE /api/orders/:id` - 取消订单
- `PATCH /api/merchant-orders/:id/status` - 商家更新订单状态

### 备注模板相关

- `POST /api/note-templates` - 创建备注模板
- `GET /api/note-templates` - 获取用户备注模板
- `DELETE /api/note-templates/:id` - 删除备注模板
