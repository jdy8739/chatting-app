package com.example.ChatoBackend.controller;

import com.example.ChatoBackend.entity.User;
import com.example.ChatoBackend.jwt.JWTUtils;
import com.example.ChatoBackend.service.UserServiceImpl;
import io.jsonwebtoken.MalformedJwtException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.tomcat.util.http.fileupload.IOUtils;
import org.apache.tomcat.util.http.fileupload.impl.FileSizeLimitExceededException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.security.auth.login.CredentialException;
import javax.servlet.http.HttpServletRequest;
import java.io.*;
import java.nio.file.Files;
import java.nio.file.NoSuchFileException;
import java.sql.SQLException;
import java.sql.SQLIntegrityConstraintViolationException;
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
    public ResponseEntity<String> signin(@RequestBody Map<String, String> siginMap) {
        try {
            userService.signin(siginMap.get("id"), siginMap.get("password"));
        } catch (NoSuchElementException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (BadCredentialsException e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
        return ResponseEntity.ok()
                .body(jwtUtils.makeJWT(siginMap.get("id")));
    }

    @PostMapping("/get-userId")
    public ResponseEntity<String> getUserId(HttpServletRequest req) {
        String token = String.valueOf(req.getHeader(HttpHeaders.AUTHORIZATION));
        return new ResponseEntity<>(jwtUtils.getUserId(token), HttpStatus.OK);
    }

    @PostMapping("/info")
    public ResponseEntity<User> getUserInfo(HttpServletRequest req) {
        String token = String.valueOf(req.getHeader(HttpHeaders.AUTHORIZATION));
        try {
            User user = userService.findUserInfoById(jwtUtils.getUserId(token));
            return new ResponseEntity<>(user, HttpStatus.OK);
        } catch (MalformedJwtException e) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        } catch (NoSuchElementException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
}
