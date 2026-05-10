# user-center-frontend-vue

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

## 技术栈
                                                                                                                                                                                    
  - Vue 3 + TypeScript + Vue CLI
  - Ant Design Vue 4 作为 UI 组件库                                                                                                                                                 
  - Pinia 状态管理
  - Vue Router 4 路由
  - Axios HTTP 请求

  ## 项目结构

  - src/
  - ├── main.ts                  # 入口，挂载 App + Router + Pinia + Antd
  - ├── App.vue                  # 根组件，启动时 fetchLoginUser()
  - ├── access.ts                # 路由守卫，/admin/* 需要登录
  - ├── request.ts               # Axios 实例，拦截 40100 跳转登录
  - ├── api/user.ts              # 用户相关 API（注册/登录/登出/查询/删除）
  - ├── store/userLoginUserStore.ts  # 登录用户 Pinia store
  - ├── router/index.ts          # 路由配置（4 个页面）
  - ├── layout/BasicLayout.vue   # 全局布局：Header + Content + Footer
  - ├── components/GlobalHeader.vue  # 顶部导航栏
  - └── pages/
      - ├── HomePage.vue             # 首页，Canvas 粒子动画效果
      - ├── user/
      - │   ├── UserLoginPage.vue    # 登录页
      - │   └── UserRegisterPage.vue # 注册页
      - └── admin/
          - └── UserManagePage.vue   # 用户管理页（表格 + 搜索 + 删除）

  ## 核心功能

  - 1. 登录/注册 — 调用后端 /user/login 和 /user/register 接口
  - 2. 路由守卫 — access.ts 检测访问 /admin/* 时是否已登录，未登录则跳转登录页
  - 3. 响应拦截 — request.ts 收到 code: 40100 自动跳转登录页（但排除获取当前用户接口和登录页本身）
  - 4. 用户管理 — 管理员页面，支持按用户名搜索和删除用户
  - 5. 首页动画 — Canvas 粒子效果展示 "Welcome to user center!"

  ## 开发代理

  vue.config.js 配置了开发服务器运行在 8081 端口，/api 请求代理到 http://localhost:8080（后端）。
