# 用户管理中心 (User Center)

<p align="center">
  <img src="https://img.shields.io/badge/Vue-3.4+-4FC08D?style=flat-square&logo=vuedotjs&logoColor=white" alt="Vue 3" />
  <img src="https://img.shields.io/badge/Spring%20Boot-3.x-6DB33F?style=flat-square&logo=springboot&logoColor=white" alt="Spring Boot" />
  <img src="https://img.shields.io/badge/Ant%20Design%20Vue-4.x-0170FE?style=flat-square&logo=antdesign&logoColor=white" alt="Ant Design Vue" />
  <img src="https://img.shields.io/badge/MyBatis--Plus-3.x-FF6A00?style=flat-square" alt="MyBatis-Plus" />
</p>

一个基于 **Vue 3 + Spring Boot** 的全栈用户管理系统，实现了用户注册、登录、头像上传裁剪、管理员用户管理等核心功能。

---

##  项目结构

```
user-center/
├── user-center-frontend-vue/    # 前端项目（Vue 3 + Ant Design Vue）
├── user-center-backend/         # 后端项目（Spring Boot）
│   └── user-center-backend-master/
└── Log.md                       # 开发日志
```

---

## 核心功能

### 前端 (Vue 3 + Ant Design Vue)

| 功能 | 说明 |
|------|------|
| 首页粒子动画 | 基于 Canvas 的交互式粒子动画，展示欢迎文字，鼠标悬停时粒子散开后回归 |
| 用户注册 | 账号/密码/确认密码/用户名，支持密码一致性校验、特殊字符检测、最小长度限制 |
| 用户登录 | 基于 Cookie/Session 的认证，登录后自动跳转管理页，401 错误自动重定向 |
| 会话保持 | 启动时自动获取登录状态，刷新页面不丢失 |
| 路由守卫 | 未登录拦截管理页；已登录拦截登录/注册页 |
| 用户管理 | 表格展示用户信息，支持按用户名搜索，管理员可删除用户 |
| 头像上传裁剪 | 上传后弹出裁剪模态框，支持拖拽定位、滚轮缩放、调整裁剪框 |
| 角色权限控制 | 管理员绿色标签，普通用户蓝色标签，仅管理员可删除用户 |

### 后端 (Spring Boot + MyBatis-Plus)

| 功能 | 说明 |
|------|------|
| 用户注册 | 校验长度、特殊字符过滤、唯一性检查，密码 MD5 加盐哈希存储 |
| 用户登录/登出 | Session 有效期 24 小时，登出清除 Session |
| 用户数据脱敏 | 返回时自动剔除密码、逻辑删除标记等敏感字段 |
| 用户搜索 | 按用户名模糊查询 |
| 用户删除 | 仅管理员可执行（账号 "admin" 即为管理员） |
| 头像文件上传 | UUID 重命名存储，静态资源映射可通过 URL 访问 |
| 统一响应格式 | `{code, data, message, description}` 结构，覆盖参数/登录/权限/系统错误 |
| 全局异常处理 | 捕获 BusinessException 和 RuntimeException，统一返回标准错误响应 |

---

##  实现效果

| 场景 | 效果 |
|------|------|
| 访问首页 | 全屏粒子动画 + 欢迎文字，鼠标交互散开回归 |
| 注册 | 填写信息后注册成功，自动跳转登录页 |
| 登录 | 成功跳转管理页，右上角显示「退出登录」 |
| 未登录访问管理页 | 弹出提示，自动跳转登录页 |
| 管理员管理用户 | 搜索、查看列表（头像/角色标签/时间）、删除普通用户 |
| 上传头像 | 选择图片 → 裁剪框 → 拖拽缩放 → 确认更新 |
| 刷新页面 | 登录状态保持，不丢失用户信息 |

---

##  技术栈

**前端**
- Vue 3 + Vite
- Ant Design Vue 4.x
- Vue Router 4
- Axios

**后端**
- Spring Boot 3.x
- MyBatis-Plus
- MySQL
- Session + Cookie 认证

---

## 快速启动

### 前端

```bash
cd user-center-frontend-vue
npm install
npm run dev
```

### 后端

```bash
cd user-center-backend/user-center-backend-master
# 配置 application.yml 中的数据库连接
mvn spring-boot:run
```
