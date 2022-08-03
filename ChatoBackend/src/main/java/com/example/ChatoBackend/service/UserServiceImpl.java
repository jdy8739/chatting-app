package com.example.ChatoBackend.service;

import com.example.ChatoBackend.entity.ChatRoom;
import com.example.ChatoBackend.entity.User;
import com.example.ChatoBackend.repository.ChatRoomRepository;
import com.example.ChatoBackend.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.apache.tomcat.util.http.fileupload.impl.FileSizeLimitExceededException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.naming.AuthenticationException;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOError;
import java.io.IOException;
import java.util.NoSuchElementException;
import java.util.Optional;

@Slf4j
@Service
public class UserServiceImpl implements UserService {

    @Autowired
    UserRepository userRepository;

    @Autowired
    ChatRoomRepository chatRoomRepository;

    @Autowired
    PasswordEncoder passwordEncoder;

    @Override
    public void saveUser(User user) {
        String encodedPassword = passwordEncoder.encode(user.getPassword());
        user.setPassword(encodedPassword);
        try {
            userRepository.save(user);
        } catch (Exception e) {
            throw new RuntimeException();
        }
    }

    @Override
    public String saveProfilePic(String id, MultipartFile profilePicBinary) throws IOException {
        if (profilePicBinary != null) {
            String path = "./images/users/" + id;
            String picUrlPath = path + "/" + id + ".jpg";
            File newUserFolder = new File(path);
            if (!newUserFolder.exists()) newUserFolder.mkdir();
            else if (newUserFolder.exists()) {
                File picFile = new File(picUrlPath);
                if (picFile.exists()) picFile.delete();
            }
            FileOutputStream writer = new FileOutputStream(picUrlPath);
            writer.write(profilePicBinary.getBytes());
            writer.close();
        }
        return "http://localhost:5000/user/profile-pic/" + id;
    }

    @Override
    public void signin(String id, String password) {
        Optional<User> optionalUser = userRepository.findById(id);
        if (optionalUser.isEmpty()) throw new NoSuchElementException();
        User user = optionalUser.get();
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new BadCredentialsException("Password not matches.");
        }
    }

    @Override
    public User findUserInfoById(String id) {
        try {
            User user = userRepository.findById(id).get();
            user.setPassword(null);
            return user;
        } catch (NoSuchElementException e) {
            throw new NoSuchElementException();
        }
    }

    private void deletePrevFile(String prevId) {
        boolean isPrevFileSaved = (userRepository.findById(prevId).get().getProfilePicUrl() != null);
        if (!isPrevFileSaved) return;
        else {
            String path = "./images/users/" + prevId;
            File newUserFolder = new File(path);
            if (newUserFolder.exists()) {
                String picUrl = path + "/" + prevId + ".jpg";
                File picFile = new File(picUrl);
                if (picFile.exists()) picFile.delete();
                newUserFolder.delete();
            }
        }
    }

    private void changePrevFileName(String id, String prevId) {
        boolean isPrevFileSaved = (userRepository.findById(prevId).get().getProfilePicUrl() != null);
        if (!isPrevFileSaved) return;
        else {
            String path = "./images/users/" + prevId;
            File newUserFolder = new File(path);
            if (newUserFolder.exists()) {
                String picUrl = path + "/" + prevId + ".jpg";
                File picFile = new File(picUrl);
                if (picFile.exists()) picFile.renameTo(new File("./images/users/" + prevId + "/" + id + ".jpg"));
                newUserFolder.renameTo(new File("./images/users/" + id));
            }
        }
    }

    @Override
    public void updateUser(String id,
                           String prevId,
                           String nickName,
                           String newProfilePicUrl,
                           boolean isUserPicRemains) throws IOException {
        newProfilePicUrl = changeProfilePicAndDirectoryName(id, prevId, newProfilePicUrl, isUserPicRemains);
        Optional<User> optionalUser = userRepository.findById(prevId);
        if (optionalUser.isEmpty()) throw new NoSuchElementException();
        User user = optionalUser.get();
        user.setId(id);
        user.setNickName(nickName);
        user.setProfilePicUrl(newProfilePicUrl);
        try {
            chatRoomRepository.changeRoomOwnerToNewId(id, prevId);
            userRepository.save(user);
        } catch (Exception e) {
            throw new RuntimeException();
        }
    }

    private String changeProfilePicAndDirectoryName(String id,
                                             String prevId,
                                             String newProfilePicUrl,
                                             boolean isUserPicRemains) throws IOException {
        if (!isUserPicRemains) deletePrevFile(prevId);
        else {
            if (!prevId.equals(id)) {
                if (newProfilePicUrl == null) {
                    changePrevFileName(id, prevId);
                    newProfilePicUrl = saveProfilePic(id, null);
                }
                deletePrevFile(prevId);
            } else newProfilePicUrl = saveProfilePic(id, null);
        }
        return newProfilePicUrl;
    }

    @Override
    public boolean checkPasswordMatches(String id, String inputPassword) {
        Optional<User> optionalUser = userRepository.findById(id);
        if (optionalUser.isEmpty()) throw new NoSuchElementException();
        if (passwordEncoder.matches(inputPassword, optionalUser.get().getPassword())) {
            return true;
        } else return false;
    }

    @Override
    public void withdraw(String id) {
        deletePrevFile(id);
        userRepository.deleteById(id);
    }

    @Override
    public String findNickNameById(String id) {
        try {
            return userRepository.findNickNameById(id);
        } catch (NoSuchElementException e) {
            return null;
        }
    }
}
