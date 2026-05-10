# 🚀 用户中心后端系统（User Center Backend）

---

## 📁 项目结构

```java
user-center-backend/
└── user-center-backend-master/       # 项目源码主目录
    ├── pom.xml                       # Maven 依赖配置
    ├── src/main/java/com/yupi/usercenter
    │   ├── UserCenterApplication.java         # 项目启动类
    │   ├── common/                            # 公共通用模块
    │   │   ├── BaseResponse.java              # 统一返回封装
    │   │   ├── ErrorCode.java                 # 错误码枚举
    │   │   └── ResultUtils.java               # 返回工具类
    │   ├── config/
    │   │   └── CorsConfig.java                # 跨域配置
    │   ├── contant/
    │   │   └── UserConstant.java              # 用户常量(角色/权限)
    │   ├── controller/
    │   │   └── UserController.java            # 用户接口层
    │   ├── exception/
    │   │   ├── BusinessException.java         # 自定义业务异常
    │   │   └── GlobalExceptionHandler.java    # 全局异常捕获
    │   ├── mapper/
    │   │   └── UserMapper.java                # 数据库DAO层
    │   ├── model/
    │   │   ├── domain/User.java               # 用户实体类
    │   │   └── request/                       # 请求DTO
    │   │       ├── UserLoginRequest.java
    │   │       └── UserRegisterRequest.java
    │   └── service/
    │       ├── UserService.java               # 服务接口
    │       └── impl/UserServiceImpl.java      # 服务实现类
    ├── src/main/resources
    │   ├── application.yml                    # 开发环境配置
    │   ├── application-prod.yml               # 生产环境配置
    │   └── mapper/UserMapper.xml              # MyBatis映射文件
    └── src/test/java                          # 单元测试
```

---

## 🛠️ 技术栈

|分类|技术|版本|
|---|---|---|
|开发语言|Java|1\.8|
|核心框架|Spring Boot|2\.6\.4|
|ORM框架|MyBatis\-Plus|3\.5\.1|
|数据库|MySQL|5\.7\+|
|工具库|Apache Commons Lang3|3\.12\.0|
|代码简化|Lombok|最新|
|构建工具|Maven|3\.x|
|测试框架|JUnit 4|4\.13\.2|

---

## ✨ 核心功能

- **用户注册**：账号≥4位、密码≥8位、禁止特殊字符、两次密码一致、账号唯一、星球号唯一、MD5加盐加密存储

- **用户登录**：基于原生 Session 会话管理，登录状态保存24小时

- **用户注销**：清除服务端 Session，实现安全退出

- **获取当前用户**：从 Session 获取登录用户信息

- **用户搜索**：用户名模糊查询，**仅管理员**可用

- **用户删除**：逻辑删除、不可物理删除，**仅管理员**可用

---

## 📡 接口文档

**接口统一前缀：/api/user**

|请求方式|接口地址|接口说明|鉴权权限|
|---|---|---|---|
|POST|/user/register|用户注册|无需鉴权|
|POST|/user/login|用户登录|无需鉴权|
|POST|/user/logout|用户注销|无需鉴权|
|GET|/user/current|获取当前登录用户|登录用户|
|GET|/user/search|模糊搜索用户|登录用户|
|POST|/user/delete|删除用户|管理员|

---

## 💻 运行环境

- JDK 1\.8\+

- Maven 3\.x

- MySQL 5\.7\+

---

## 🚀 本地启动步骤

1. **克隆项目**到本地

2. **创建数据库**：新建数据库`yupi`，导入 user 数据表

3. **修改配置**：修改 `application\.yml` 中数据库账号密码

4. **启动命令**：
        `mvn clean install
mvn spring\-boot:run`

5. **访问地址**：[http://localhost:8080/api](http://localhost:8080/api)

---

## 📦 生产部署

```bash
# 打包
mvn clean package -DskipTests
# 生产环境运行
java -jar target/user-center-backend-master.jar --spring.profiles.active=prod
```

---

## 🔐 权限说明

- **普通用户**：注册、登录、注销、查看个人信息、搜索用户

- **管理员**：拥有全部权限，可删除、管理所有用户

---

## 📌 项目特点

- ✅ 代码结构清晰，分层规范（controller/service/mapper/model）

- ✅ 统一返回结果、全局异常处理、自定义错误码

- ✅ 原生 Session 登录，无复杂第三方依赖

- ✅ 密码加盐 MD5 加密，安全可靠

- ✅ 简单角色权限控制（普通用户 / 管理员）

