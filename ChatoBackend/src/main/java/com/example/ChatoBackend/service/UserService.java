package com.example.ChatoBackend.service;

import com.example.ChatoBackend.entity.User;
import org.springframework.web.multipart.MultipartFile;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.Map;

public interface UserService {

    public void saveUser(User user);

    public String saveProfilePic(String id, MultipartFile profilePicBinary) throws IOException;

    public Map<String, Object> signin(String id, String password);

    public User findUserInfoById(String id);

    public void updateUser(
            String id, String prevId, String nickName, String newProfilePicUrl, boolean isUserPicRemains) throws IOException;

    public boolean checkPasswordMatches(String id, String inputPassword);

    public void withdraw(String id);

    public String findNickNameById(String id);

    public Map<String, Object> getUserInfo(String id);

    public String findUserIdByUserNo(long userNo);

    public Long findUserNoByUserId(String id);

    public void toggleSubjectLike(Long userNo, String subject, boolean isAddLike);

    public void saveBannedIpAddress(Long roomId, String apAddress, String userName);
}
