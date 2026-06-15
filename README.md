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

##  前端核心代码解析

### 项目架构总览

```
src/
├── main.ts                          # 应用入口，注册 Vue/插件的根实例
├── App.vue                          # 根组件，挂载布局并初始化登录状态
├── access.ts                        # 全局路由守卫（权限控制核心）
├── request.ts                       # Axios 实例 + 拦截器（统一错误处理）
├── api/
│   └── user.ts                      # 用户相关 API 封装（7 个接口）
├── router/
│   └── index.ts                     # 路由配置（4 条路由）
├── store/
│   └── userLoginUserStore.ts        # Pinia 用户状态管理
├── layout/
│   └── BasicLayout.vue              # 全局布局（Header + Content + Footer）
├── components/
│   └── GlobalHeader.vue             # 顶部导航栏（菜单 + 登录/登出按钮）
└── pages/
    ├── HomePage.vue                 # 首页 — Canvas 粒子动画
    ├── user/
    │   ├── UserLoginPage.vue        # 用户登录页
    │   └── UserRegisterPage.vue     # 用户注册页
    └── admin/
        └── UserManagePage.vue       # 用户管理页（搜索/删除/头像上传裁剪）
```

### 1. 入口初始化 — `main.ts`
- 创建 Vue 3 应用实例，依次注册 **Ant Design Vue**、**Vue Router**、**Pinia**
- 开发环境下全局屏蔽 `ResizeObserver` 的良性报错，避免控制台噪音
- 加载 `access.ts` 中的路由守卫

### 2. Axios 封装 — `request.ts`
创建统一的 Axios 实例，核心配置：
- `baseURL`：通过 `VUE_APP_BASE_API` 环境变量配置，默认 `http://localhost:8080/api`
- `withCredentials: true`：跨域请求携带 Cookie，支持 Session 认证
- **响应拦截器**：拦截 `code === 40100`（未登录），自动跳转到登录页并携带 `redirect` 参数
- `resolveApiAssetUrl` 工具函数：将服务端返回的相对路径拼装为完整资源 URL，兼容绝对路径直传

### 3. 路由守卫 — `access.ts`
`router.beforeEach` 全局前置守卫，实现两套拦截逻辑：
- **已登录用户**：访问 `/user/login` 或 `/user/register` 时自动重定向到首页，防止重复登录
- **未登录用户**：访问 `/admin/*` 管理页时弹出提示并重定向到登录页（携带 `redirect` 参数），登录后自动跳回目标页
- 用户信息未加载时，先通过 `getCurrentUser()` 接口获取最新状态再做判断

### 4. 状态管理 — `store/userLoginUserStore.ts`
基于 Pinia Composition API 风格的状态管理：
- `loginUser`：响应式用户对象，默认 `{ userName: "未登录" }`
- `fetchLoginUser()`：应用启动时调用，获取当前登录用户信息；后端不可用时降级为游客状态
- `setLoginUser()`：登录/登出时手动更新用户状态

### 5. API 接口层 — `api/user.ts`
封装 7 个后端接口调用：

| 函数 | 方法 | 路径 | 说明 |
|------|------|------|------|
| `userRegister` | POST | `/user/register` | 用户注册 |
| `userLogin` | POST | `/user/login` | 用户登录 |
| `userLogout` | POST | `/user/logout` | 用户登出 |
| `getCurrentUser` | GET | `/user/current` | 获取当前登录用户 |
| `searchUsers` | GET | `/user/search` | 按用户名模糊搜索 |
| `deleteUser` | POST | `/user/delete` | 删除用户（管理员） |
| `uploadAvatar` | POST | `/file/upload` | 上传头像（FormData） |

### 6. 首页粒子动画 — `HomePage.vue`
纯 Canvas 实现的交互式粒子动画：
- **文字粒子**：将 "欢迎来到\n用户中心！" （蓝色系渐变,随机取色）渲染到离屏 Canvas，采样像素点生成文字形状粒子
- **背景粒子**：800 个随机分布的小粒子填充画布
- **鼠标交互**：通过 `mousemove` 事件计算鼠标与粒子距离，在 120px 半径内施加向外的斥力；鼠标移出后粒子通过缓动回归原位
- **动画循环**：`requestAnimationFrame` 驱动，每帧绘制半透明白色矩形实现拖尾残影效果
- **响应式**：监听 `resize` 事件自适应窗口大小
- **资源释放**：`onBeforeUnmount` 中取消动画帧和移除事件监听

### 7. 用户注册 — `UserRegisterPage.vue`
- 表单字段：账号、密码（≥8位）、确认密码、用户名
- **自定义校验**：
  - 用户名不能包含特殊字符（正则需要手动维护字符集）
  - 确认密码需与密码一致
  - 密码变更时自动触发确认密码字段的二次校验
- 登录成功后跳转至登录页

### 8. 用户登录 — `UserLoginPage.vue`
- 表单字段：账号、密码（≥8位）
- **登录流程**：调用 API → 成功后写入 Pinia Store → 跳转至 `redirect` 目标页（默认 `/admin/userManage`）
- **错误处理**：区分 404（接口不存在）、后端业务错误、网络错误三种场景，分别展示不同提示

### 9. 用户管理 — `UserManagePage.vue`
- **搜索**：顶部搜索框支持按用户名模糊搜索和清空重置
- **表格展示**：用户名、账号、头像（图片上传组件）、创建时间（dayjs 格式化）、角色（管理员绿色标签 / 普通用户蓝色标签）、操作（删除按钮）
- **权限控制**：仅 `userAccount === "admin"` 的用户可看到删除按钮
- **分页**：每页 5 条

### 10. 头像上传裁剪 — `UserManagePage.vue`（内嵌裁剪弹窗）
完全自实现的图片裁剪功能，无需第三方裁剪库：
- **上传校验**：限制图片类型和 2MB 大小上限
- **裁剪区域**：680×420 裁剪画布，中心 260×260 初始裁剪框
- **交互操作**：
  - 拖拽图片调整位置（`mousedown` → `mousemove` → `mouseup`）
  - 滚轮缩放（1× ~ 5×）
  - 拖拽裁剪框移动
  - 拖拽四角手柄调整裁剪框大小（最小 80×80）
- **裁剪输出**：通过 Canvas `drawImage` 截取裁剪区域，输出为 PNG Blob，再通过 `uploadAvatar` 上传
- **滑块缩放**：提供 Slider 组件作为缩放的补充操作方式

### 11. 全局导航 — `GlobalHeader.vue`
- 左侧：Logo + "用户中心" 标题
- 中间：水平菜单栏（首页 / 登录 / 注册 / 用户管理 / 关于）
- 右侧：根据当前路由显示"登录"按钮（首页/注册页）或"退出登录"按钮（管理页）
- 菜单高亮通过 `router.afterEach` 同步当前路径

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
