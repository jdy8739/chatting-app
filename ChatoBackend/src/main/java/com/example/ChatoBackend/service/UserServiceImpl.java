package com.example.ChatoBackend.service;

import com.example.ChatoBackend.entity.User;
import com.example.ChatoBackend.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.naming.AuthenticationException;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.NoSuchElementException;
import java.util.Optional;

@Slf4j
@Service
public class UserServiceImpl implements UserService {

    @Autowired
    UserRepository userRepository;

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
        String path = "./images/users/" + id;
        File newUserFolder = new File(path);
        if (!newUserFolder.exists()) newUserFolder.mkdir();
        FileOutputStream writer = new FileOutputStream(path + "/" + id + ".jpg");
        writer.write(profilePicBinary.getBytes());
        writer.close();
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
        if (!isPrevFileSaved) {
            return;
        }
        else {
            String path = "./images/users/" + prevId;
            File newUserFolder = new File(path);
            if (newUserFolder.exists()) {
                String picUrl = path + "/" + prevId + ".jpg";
                File picFile = new File(picUrl);
                if (picFile.exists()) picFile.delete();
                newUserFolder.delete();
                log.info(newUserFolder.getName());
            }
        }
    }

    @Override
    public void updateUser(String id, String prevId, String nickName, String newProfilePicUrl) {
        deletePrevFile(prevId);
        Optional<User> optionalUser = userRepository.findById(prevId);
        if (optionalUser.isEmpty()) throw new NoSuchElementException();
        User user = optionalUser.get();
        user.setId(id);
        user.setNickName(nickName);
        user.setProfilePicUrl(newProfilePicUrl);
        try {
            userRepository.save(user);
        } catch (Exception e) {
            throw new RuntimeException();
        }
    }
}
