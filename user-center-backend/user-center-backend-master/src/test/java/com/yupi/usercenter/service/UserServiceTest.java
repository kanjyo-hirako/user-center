package com.yupi.usercenter.service;

// [编程学习交流圈](https://www.code-nav.cn/) 连接万名编程爱好者，一起优秀！20000+ 小伙伴交流分享、40+ 大厂嘉宾一对一答疑、100+ 各方向编程交流群、4000+ 编程问答参考

import com.yupi.usercenter.model.domain.User;
import com.yupi.usercenter.exception.BusinessException;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

import javax.annotation.Resource;

/**
 * 用户服务测试
 *
 * @author <a href="https://github.com/liyupi">程序员鱼皮</a>
 * @from <a href="https://yupi.icu">编程导航知识星球</a>
 */
@SpringBootTest
public class UserServiceTest {

    @Resource
    private UserService userService;

    private User buildTestUser(String suffix) {
        User user = new User();
        user.setUsername("testUser_" + suffix);
        user.setUserAccount("acct_" + suffix);
        user.setAvatarUrl("https://example.com/avatar.png");
        user.setUserPassword("12345678");
        user.setPhone("12345678901");
        user.setEmail("test_" + suffix + "@example.com");
        return user;
    }

    /**
     * 测试添加用户
     */
    @Test
    public void testAddUser() {
        User user = buildTestUser(String.valueOf(System.currentTimeMillis()));
        boolean result = userService.save(user);
        Assertions.assertNotNull(user.getId());
        Assertions.assertTrue(result);
    }

    // https://www.code-nav.cn/

    /**
     * 测试更新用户
     */
    @Test
    public void testUpdateUser() {
        String suffix = String.valueOf(System.currentTimeMillis());
        User user = buildTestUser(suffix);
        Assertions.assertTrue(userService.save(user));
        user.setUsername("updated_" + suffix);
        boolean result = userService.updateById(user);
        Assertions.assertTrue(result);
    }

    /**
     * 测试删除用户
     */
    @Test
    public void testDeleteUser() {
        User user = buildTestUser(String.valueOf(System.currentTimeMillis()));
        Assertions.assertTrue(userService.save(user));
        boolean result = userService.removeById(user.getId());
        Assertions.assertTrue(result);
    }

    // https://space.bilibili.com/12890453/

    /**
     * 测试获取用户
     */
    @Test
    public void testGetUser() {
        User created = buildTestUser(String.valueOf(System.currentTimeMillis()));
        Assertions.assertTrue(userService.save(created));
        User user = userService.getById(created.getId());
        Assertions.assertNotNull(user);
    }

    /**
     * 测试用户注册
     */
    @Test
    void userRegister() {
        Assertions.assertThrows(BusinessException.class, () ->
                userService.userRegister("yupi", "", "123456", "testUser"));
        Assertions.assertThrows(BusinessException.class, () ->
                userService.userRegister("yu", "", "123456", "testUser"));
        Assertions.assertThrows(BusinessException.class, () ->
                userService.userRegister("yupi", "123456", "123456", "testUser"));

        Assertions.assertThrows(BusinessException.class, () ->
                userService.userRegister("yu pi", "12345678", "123456", "testUser"));
        long result = userService.userRegister("yu pi", "12345678", "123456789", "testUser");
        Assertions.assertEquals(-1, result);

        String suffix = String.valueOf(System.currentTimeMillis());
        String userAccount = "reg_" + suffix;
        String userPassword = "12345678";
        String checkPassword = "12345678";
        String username = "name_" + suffix;
        result = userService.userRegister(userAccount, userPassword, checkPassword, username);
        Assertions.assertTrue(result > 0);

        String duplicateAccount = userAccount;
        Assertions.assertThrows(BusinessException.class, () ->
                userService.userRegister(duplicateAccount, userPassword, checkPassword, "another_" + suffix));
    }
}
