package com.example.ChatoBackend.service;

import com.example.ChatoBackend.entity.BannedIp;
import com.example.ChatoBackend.entity.ChatRoom;
import com.example.ChatoBackend.entity.LikedSubject;
import com.example.ChatoBackend.entity.User;
import com.example.ChatoBackend.repository.BannedIpRepository;
import com.example.ChatoBackend.repository.ChatRoomRepository;
import com.example.ChatoBackend.repository.LikedSubjectRepository;
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
import java.nio.file.Files;
import java.util.HashMap;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.Optional;

@Slf4j
@Service
public class UserServiceImpl implements UserService {

    @Autowired
    UserRepository userRepository;

    @Autowired
    LikedSubjectRepository likedSubjectRepository;

    @Autowired
    PasswordEncoder passwordEncoder;

    @Autowired
    BannedIpRepository bannedIpRepository;

    private final String BASE_URL = "./src/main/java/com/example/ChatoBackend";

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
            String path = BASE_URL + "/images/users/" + id;
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
    public Map<String, Object> signin(String id, String password, String refreshToken) {
        Optional<User> optionalUser = userRepository.findById(id);
        if (optionalUser.isEmpty()) throw new NoSuchElementException();
        User user = optionalUser.get();
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new BadCredentialsException("Password not matches.");
        } else {
            userRepository.setRefreshTokenByUserNo(refreshToken, user.getUserNo());
            return assembleUserInfo(user);
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
            String path = BASE_URL + "/images/users/" + prevId;
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
            String path = BASE_URL + "/images/users/" + prevId;
            File newUserFolder = new File(path);
            if (newUserFolder.exists()) {
                String picUrl = path + "/" + prevId + ".jpg";
                File picFile = new File(picUrl);
                if (picFile.exists()) picFile.renameTo(new File(BASE_URL + "/images/users/" + prevId + "/" + id + ".jpg"));
                newUserFolder.renameTo(new File(BASE_URL + "/images/users/" + id));
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
        likedSubjectRepository.deleteByUserNo(userRepository.findUserNoByUserId(id));
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

    @Override
    public Map<String, Object> getUserInfo(String id) {
        User user = findUserInfoById(id);
        return assembleUserInfo(user);
    }

    private Map<String, Object> assembleUserInfo (User user) {
        Map<String, Object> userInfoMap = new HashMap<>();
        Long userNo = user.getUserNo();
        userInfoMap.put("userNo", userNo);
        userInfoMap.put("userId", user.getId());
        userInfoMap.put("userNickName", user.getNickName());
        userInfoMap.put("likedSubjects", likedSubjectRepository.findLikedListByUserNo(userNo));
        return userInfoMap;
    }

    @Override
    public String findUserIdByUserNo(long userNo) {
        return userRepository.findUserIdByUserNo(userNo);
    }

    @Override
    public Long findUserNoByUserId(String id) {
        return userRepository.findUserNoByUserId(id);
    }

    @Override
    public void toggleSubjectLike(Long userNo, String subject, boolean isAddLike) {
        if (isAddLike) likedSubjectRepository.deleteLikedSubjectByUserNo(userNo, subject);
        else {
            int count = likedSubjectRepository.getLikedSubjectCountPerUser(userNo);
            if (count > 7) likedSubjectRepository.deleteTop1ByUserNo(userNo);
            likedSubjectRepository.save(new LikedSubject(userNo, subject));
        }
    }

    @Override
    public void saveBannedIpAddress(Long roomId, String ipAddress, String userName) {
        bannedIpRepository.save(new BannedIp(roomId, ipAddress, userName));
    }

    @Override
    public boolean checkIfIsValidRefreshToken(String refreshToken, String id) {
        String targetToken = userRepository.findRefreshTokenIdByUserId(id);
        return (refreshToken.equals(targetToken));
    }

    @Override
    public void signout(String id) {
        Long userNo = userRepository.findUserNoByUserId(id);
        userRepository.setRefreshTokenByUserNo(null, userNo);
    }

    @Override
    public byte[] getUserPic(String id) throws IOException {
        byte[] imageByteArray = null;
        String path = BASE_URL + "/images/users/" + id;
        File file = new File(path + "/" + id + ".jpg");
        if (file.exists()) imageByteArray = Files.readAllBytes(file.toPath());
        else {
            file = new File(BASE_URL + "/images/users/default-avatar.jpg");
            imageByteArray = Files.readAllBytes(file.toPath());
        }
        return imageByteArray;
    }
}
