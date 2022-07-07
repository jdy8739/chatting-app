package com.example.ChatoBackend.controller;

import com.example.ChatoBackend.entity.ChatRoom;
import com.example.ChatoBackend.service.ChatRoomService;
import com.example.ChatoBackend.service.ChatRoomServiceImpl;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

@Slf4j
@Controller
@RequestMapping("/room")
@CrossOrigin(origins = "http://localhost:3000", allowedHeaders = "*")
public class RoomController {

    @Autowired
    ChatRoomService chatRoomService;

    @PostMapping("/create")
    public ResponseEntity<Void> createRoom(@Validated @RequestBody ChatRoom chatRoom) {
        chatRoomService.saveChatRoom(chatRoom);
        return new ResponseEntity<Void>(HttpStatus.OK);
    }
}
