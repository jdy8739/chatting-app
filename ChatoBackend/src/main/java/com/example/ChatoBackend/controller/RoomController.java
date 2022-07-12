package com.example.ChatoBackend.controller;

import com.example.ChatoBackend.DTO.MessageDTO;
import com.example.ChatoBackend.entity.ChatRoom;
import com.example.ChatoBackend.service.ChatRoomService;
import com.example.ChatoBackend.service.ChatRoomServiceImpl;
import com.example.ChatoBackend.service.MessageServiceImpl;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.sql.SQLException;
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

    @Autowired
    MessageServiceImpl messageService;

    @PostMapping("/create")
    public ResponseEntity<Void> createRoom(@Validated @RequestBody ChatRoom chatRoom) throws SQLException {
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

    @GetMapping("/message/{id}")
    public ResponseEntity<List<MessageDTO>> getMessage(
            @PathVariable("id") Long roomId,
            @RequestParam(value = "password", required = false) String password, // 보안 문제 추후에 해결.
            @RequestParam(value = "offset") String offset) {
        return new ResponseEntity<>(
                messageService.getMessages(roomId, password, Integer.parseInt(offset)), HttpStatus.OK);
    }
}
