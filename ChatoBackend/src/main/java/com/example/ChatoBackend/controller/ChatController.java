package com.example.ChatoBackend.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@Controller
@RequestMapping("/chat")
@CrossOrigin(
        origins = "http://localhost:3000",
        allowedHeaders = "*")
public class ChatController {

    @GetMapping("/test")
    public ResponseEntity<String> test() {
        return new ResponseEntity<String>("Hi", HttpStatus.OK);
    }

    @PostMapping("/receive")
    public ResponseEntity<Void> receiveChatMsg(@RequestBody Map<String, String> map) {
        log.info("" + map.get("msg"));
        return new ResponseEntity<Void>(HttpStatus.OK);
    }
}
