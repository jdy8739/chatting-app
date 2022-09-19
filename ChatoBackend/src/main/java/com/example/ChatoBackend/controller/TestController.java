package com.example.ChatoBackend.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@CrossOrigin(origins = "http://13.209.250.95", allowedHeaders = "*")
public class TestController {

    @GetMapping("/test")
    public String test() {
        return "test";
    }
}
