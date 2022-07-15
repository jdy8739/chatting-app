package com.example.ChatoBackend.controller;

import com.example.ChatoBackend.DTO.MessageDTO;
import com.example.ChatoBackend.entity.ChatRoom;
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

    @PostMapping("/enter_password")
    public ResponseEntity<Boolean> checkPwValidation(@RequestBody Map<String, String> map) {
        Long roomId = Long.valueOf(map.get(ROOM_ID));
        String password = map.get("password");
        Boolean isValidPw = chatRoomService.checkPwValidation(roomId, password);
        return new ResponseEntity<>(isValidPw, HttpStatus.OK);
    }

    @PostMapping("/message/{id}")
    public ResponseEntity<List<MessageDTO>> getMessage(
            @PathVariable("id") Long roomId,
            @RequestParam(value = "offset") String offset,
            @RequestBody Map<String, String> map) {
        List<MessageDTO> messageDTOList =
                messageService.getMessages(roomId, map.get("password"), Integer.valueOf(offset));
        if (messageDTOList == null)
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        else return new ResponseEntity<>(messageDTOList, HttpStatus.OK);
    }

    @DeleteMapping("/del_message/{id}")
    public ResponseEntity<Void> deleteMessage(
            @PathVariable("id") Long roomId,
            @RequestParam("msg_no") Long msgNo
            ) {
        messageService.deleteMessage(roomId, msgNo);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @DeleteMapping("/delete/{roomId}")
    public ResponseEntity<Void> deleteRoom(@PathVariable(ROOM_ID) Long roomId) {
        chatRoomService.deleteRoom(roomId);
        messageService.deleteRoom(roomId);
        return new ResponseEntity<>(HttpStatus.OK);
    }
}
