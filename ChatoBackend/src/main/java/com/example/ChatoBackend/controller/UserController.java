package com.example.ChatoBackend.controller;

import com.example.ChatoBackend.entity.User;
import com.example.ChatoBackend.service.UserServiceImpl;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Slf4j
@Controller
@RequestMapping("/user")
@CrossOrigin(origins = "http://localhost:3000", allowedHeaders = "*")
public class UserController {

    @Autowired
    UserServiceImpl userService;

    @PostMapping("/signup")
    public ResponseEntity<Void> singup(
            @RequestParam String id,
            @RequestParam String nickName,
            @RequestParam String password,
            @RequestParam MultipartFile userProfilePic) throws IOException {
        log.info("" + userProfilePic);
        userService.saveUser(new User(id, nickName, password, null));
        return new ResponseEntity<>(HttpStatus.OK);
    }
}
