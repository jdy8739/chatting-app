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

}
