package com.example.ChatoBackend.controller;

import com.example.ChatoBackend.entity.User;
import com.example.ChatoBackend.jwt.JWTUtils;
import com.example.ChatoBackend.service.UserServiceImpl;
import io.jsonwebtoken.MalformedJwtException;
import lombok.extern.slf4j.Slf4j;
import org.apache.tomcat.util.http.fileupload.impl.FileSizeLimitExceededException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletRequest;
import java.io.*;
import java.nio.file.Files;
import java.nio.file.NoSuchFileException;
import java.util.Map;
import java.util.NoSuchElementException;

@Slf4j
@Controller
@RequestMapping("/user")
@CrossOrigin(origins = "http://localhost:3000", allowedHeaders = "*")
public class UserController {

    @Autowired
    UserServiceImpl userService;
    @Autowired
    JWTUtils jwtUtils;

    @PostMapping("/signup")
    public ResponseEntity<Void> singup(
            @RequestParam String id,
            @RequestParam String nickName,
            @RequestParam String password,
            @RequestParam (required = false) MultipartFile userProfilePic) {
        String fileUrl = null;
        try {
            if (userProfilePic != null) fileUrl = userService.saveProfilePic(id, userProfilePic);
            userService.saveUser(new User(id, nickName, password, fileUrl));
        } catch (FileSizeLimitExceededException e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.CONFLICT);
        } catch (IOException e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @GetMapping("/profile-pic/{id}")
    public ResponseEntity<byte[]> getProfileImage(
            @PathVariable("id") String id) {
        byte[] imageByteArray = null;
        try {
            String path = "./images/users/" + id;
            File file = new File(path + "/" + id + ".jpg");
            imageByteArray = Files.readAllBytes(file.toPath());
        } catch (NoSuchFileException e) {
            return new ResponseEntity<>(null, HttpStatus.OK);
        } catch (IOException e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return new ResponseEntity<>(imageByteArray, HttpStatus.OK);
    }

    @PostMapping("/signin")
    public ResponseEntity<Map<String, Object>> signin(@RequestBody Map<String, String> siginMap) {
        try {
            Map<String, Object> userInfoMap =
                    userService.signin(siginMap.get("id"), siginMap.get("password"));
            HttpHeaders httpHeaders = new HttpHeaders();
            httpHeaders.set("Access-Control-Expose-Headers", "*");
            httpHeaders.add(HttpHeaders.COOKIE, jwtUtils.makeJWT(siginMap.get("id")));
            return new ResponseEntity<>(userInfoMap, httpHeaders, HttpStatus.OK);
        } catch (NoSuchElementException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (BadCredentialsException e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    /* 로그인, 새로고침 시 클라이언트 redux에 회원 정보 저장 용도 */
    @GetMapping("/get-userInfo")
    public ResponseEntity<Map<String, Object>> getUserSignedInInfo(HttpServletRequest req) {
        try {
            String token = String.valueOf(req.getHeader(HttpHeaders.AUTHORIZATION));
            Map<String, Object> userInfoMap =
                    userService.getUserInfo(jwtUtils.getUserId(token));
            return new ResponseEntity<>(userInfoMap, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
    }

    /* 회원 정보 수정, 삭제 페이지 용도 */
    @GetMapping("/info")
    public ResponseEntity<User> getUserWholeInfo(HttpServletRequest req) {
        String token = String.valueOf(req.getHeader(HttpHeaders.AUTHORIZATION));
        try {
            return new ResponseEntity<>(
                    userService.findUserInfoById(jwtUtils.getUserId(token)), HttpStatus.OK);
        } catch (MalformedJwtException e) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        } catch (NoSuchElementException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @PutMapping("/alter")
    public ResponseEntity<Void> alter(
            @RequestParam String id,
            @RequestParam String nickName,
            @RequestParam String isUseProfilePic,
            @RequestParam (required = false) MultipartFile userProfilePic,
            @RequestParam String inputPassword,
            HttpServletRequest req) {

        String token = String.valueOf(req.getHeader(HttpHeaders.AUTHORIZATION));
        if (token == null) return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);

        boolean isUserPicRemains = Boolean.parseBoolean(isUseProfilePic);
        String userId;
        try {
            userId = jwtUtils.getUserId(token);
            if (!userService.checkPasswordMatches(userId, inputPassword)) {
                return new ResponseEntity<>(HttpStatus.FORBIDDEN);
            }
            String newProfilePicUrl = null;
            if (userProfilePic != null) newProfilePicUrl = userService.saveProfilePic(id, userProfilePic);
            userService.updateUser(id, userId, nickName, newProfilePicUrl, isUserPicRemains);
        } catch (MalformedJwtException e) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        } catch (FileSizeLimitExceededException e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        } catch (IOException e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.CONFLICT);
        }
        HttpHeaders httpHeaders = new HttpHeaders();
        httpHeaders.set("Access-Control-Expose-Headers", "*");
        httpHeaders.add(HttpHeaders.COOKIE, jwtUtils.makeJWT(id));
        return new ResponseEntity<>(httpHeaders, HttpStatus.OK);
    }

    @PutMapping("/withdraw")
    public ResponseEntity<String> withdraw(
            @RequestBody Map<String, String> map,
            HttpServletRequest req) {
        String token = String.valueOf(req.getHeader(HttpHeaders.AUTHORIZATION));
        if (token == null) return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        String userId;
        try {
            userId = jwtUtils.getUserId(token);
            if (!userService.checkPasswordMatches(userId, map.get("inputPassword")))
                return new ResponseEntity<>(HttpStatus.FORBIDDEN);
            userService.withdraw(userId);
        } catch (MalformedJwtException e) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @PostMapping("/manage_subject_like")
    public ResponseEntity<Void> manageSubjectLike(
            @RequestBody Map<String, String> map,
            HttpServletRequest req) {
        String token = String.valueOf(req.getHeader(HttpHeaders.AUTHORIZATION));
        Long userNo = userService.findUserNoByUserId(jwtUtils.getUserId(token));
        String subject = map.get("subject");
        boolean isAddLike = Boolean.parseBoolean(map.get("isAddLike"));
        userService.toggleSubjectLike(userNo, subject, isAddLike);
        return new ResponseEntity<Void>(HttpStatus.OK);
    }

    @PostMapping("/add_banned")
    public ResponseEntity<Void> addBannedIp(@RequestBody Map<String, Object> map) {
        Long roomId = Long.parseLong((String) map.get("roomId"));
        String ipAddress = (String) map.get("ipAddress");
        String userName = (String) map.get("userName");
        userService.saveBannedIpAddress(roomId, ipAddress, userName);
        return new ResponseEntity<>(HttpStatus.OK);
    }
}
