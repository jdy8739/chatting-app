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
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Slf4j
@Controller
@RequestMapping("/room")
@CrossOrigin(origins = "http://localhost:3000", allowedHeaders = "*")
public class RoomController {

    private final String ROOM_ID = "roomId";

    private final String NEW_SUBJECT = "newSubject";
    @Autowired
    ChatRoomServiceImpl chatRoomService;

    @PostMapping("/create")
    public ResponseEntity<Void> createRoom(@Validated @RequestBody ChatRoom chatRoom) {
        chatRoomService.saveChatRoom(chatRoom);
        return new ResponseEntity<Void>(HttpStatus.OK);
    }

    @GetMapping("/list")
    public ResponseEntity<List<ChatRoom>> getRoomList() {
        return new ResponseEntity<>(chatRoomService.findEveryChatRoom(), HttpStatus.OK);
    }

    @PutMapping("/change_subject")
    public ResponseEntity<Void> changeSubject(@RequestBody Map<String, String> map) {
        chatRoomService.changeSubject(Long.parseLong(map.get(ROOM_ID)), map.get(NEW_SUBJECT));
        return new ResponseEntity<>(HttpStatus.OK);
    }
}
