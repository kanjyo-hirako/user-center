# 项目长期记忆

## user-center-frontend-vue 项目概况

**类型**：用户中心前端项目（Vue 3 + TypeScript）

**技术栈**：
- Vue 3.2 + TypeScript
- Vue Router 4
- Pinia 3（状态管理）
- Ant Design Vue 4.2
- Axios（HTTP 请求）
- Vue CLI 5 构建

**目录结构**：
- `src/pages/user/` — 用户相关页面（登录 UserLoginPage.vue、注册 UserRegisterPage.vue）
- `src/pages/admin/` — 管理员页面（用户管理 UserManagePage.vue）
- `src/pages/HomePage.vue` — 首页
- `src/router/index.ts` — 路由配置（/, /user/login, /user/register, /admin/userManage）
- `src/store/userLoginUserStore.ts` — 用户登录状态 Pinia store
- `src/api/user.ts` — 用户相关 API 封装
- `src/request.ts` — Axios 请求封装
- `src/components/GlobalHeader.vue` — 全局头部组件
- `src/layout/` — 布局文件

**协作备注**：用户（Yui）准备与 AI 进行协作 coding，工作区为该 Vue 前端项目。
