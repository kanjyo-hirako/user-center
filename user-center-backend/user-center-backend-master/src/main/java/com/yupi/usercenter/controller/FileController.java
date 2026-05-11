package com.yupi.usercenter.controller;

import com.yupi.usercenter.common.BaseResponse;
import com.yupi.usercenter.common.ErrorCode;
import com.yupi.usercenter.common.ResultUtils;
import com.yupi.usercenter.exception.BusinessException;
import com.yupi.usercenter.model.domain.User;
import com.yupi.usercenter.service.UserService;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import java.io.File;
import java.io.IOException;
import java.util.UUID;

import static com.yupi.usercenter.contant.UserConstant.USER_LOGIN_STATE;

@RestController
@RequestMapping("/file")
public class FileController {

    private static final String UPLOAD_DIR = System.getProperty("user.dir") + "/upload/avatars/";

    @Resource
    private UserService userService;

    @PostMapping("/upload")
    public BaseResponse<String> uploadAvatar(@RequestParam("file") MultipartFile file,
                                             @RequestParam("userId") Long userId,
                                             HttpServletRequest request) {
        User currentUser = getLoginUserFromSession(request);
        if (currentUser == null) {
            throw new BusinessException(ErrorCode.NOT_LOGIN);
        }
        if (file.isEmpty()) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR, "文件为空");
        }

        String originalFilename = file.getOriginalFilename();
        String ext = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            ext = originalFilename.substring(originalFilename.lastIndexOf("."));
        }

        String filename = UUID.randomUUID() + ext;
        File dir = new File(UPLOAD_DIR);
        if (!dir.exists()) {
            dir.mkdirs();
        }

        try {
            file.transferTo(new File(dir, filename));
        } catch (IOException e) {
            throw new BusinessException(ErrorCode.SYSTEM_ERROR, "文件上传失败");
        }

        String avatarUrl = "/avatars/" + filename;

        User updateUser = new User();
        updateUser.setId(userId);
        updateUser.setAvatarUrl(avatarUrl);
        userService.updateById(updateUser);

        return ResultUtils.success(avatarUrl);
    }

    private User getLoginUserFromSession(HttpServletRequest request) {
        Object userObj = request.getSession().getAttribute(USER_LOGIN_STATE);
        return (User) userObj;
    }
}
