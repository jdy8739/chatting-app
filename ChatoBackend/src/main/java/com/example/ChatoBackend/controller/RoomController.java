package com.example.ChatoBackend.controller;

import com.example.ChatoBackend.DTO.MessageDTO;
import com.example.ChatoBackend.entity.ChatRoom;
import com.example.ChatoBackend.service.ChatRoomServiceImpl;
import com.example.ChatoBackend.service.MessageServiceImpl;
import com.example.ChatoBackend.store.ConnectedUserAndRoomInfoStore;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.sql.SQLException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Slf4j
@Controller
@RequestMapping("/room")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000", allowedHeaders = "*")
public class RoomController {

    private final String ROOM_ID = "roomId";

    @Autowired
    private final SimpMessagingTemplate messagingTemplate;
    @Autowired
    ChatRoomServiceImpl chatRoomService;
    @Autowired
    MessageServiceImpl messageService;

    @Autowired
    ConnectedUserAndRoomInfoStore connectedUserAndRoomInfoStore;

    @PostMapping("/create")
    public ResponseEntity<Void> createRoom(@Validated @RequestBody ChatRoom chatRoom) throws SQLException {
        chatRoomService.saveChatRoom(chatRoom);
        chatRoom.setNowParticipants(0);
        messagingTemplate.convertAndSend("/sub/chat/room/list", chatRoom);
        return new ResponseEntity<Void>(HttpStatus.OK);
    }

    @GetMapping("/list")
    public ResponseEntity<List<ChatRoom>> getRoomList() {
        return new ResponseEntity<>(chatRoomService.findEveryChatRoom(), HttpStatus.OK);
    }

    @PutMapping("/change_subject")
    public ResponseEntity<Void> changeSubject(@RequestBody Map<String, String> map) {
        log.info("" + map);
        chatRoomService.changeSubject(Long.parseLong(map.get("targetRoomId")), map.get("destinationId"));
        messagingTemplate.convertAndSend("/sub/chat/room/list", map);
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

        List<MessageDTO> messageDTOList = null;
        if (Integer.valueOf(offset) == 0) {
            if (!chatRoomService.checkRoomStatusOK(roomId)) {
                return new ResponseEntity<>(HttpStatus.PRECONDITION_FAILED);
            }
        }
        messageDTOList = messageService.getMessages(roomId, map.get("password"), Integer.valueOf(offset));
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
        Map<String, Integer> map = new HashMap<>();
        map.put("isDeleted", 1);
        map.put("roomId", Math.toIntExact(roomId));
        messagingTemplate.convertAndSend("/sub/chat/room/list", map);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @GetMapping("/participants/{roomId}")
    public ResponseEntity<Set<String>> getParticipantsByRoomId(
            @PathVariable("roomId") Long roomId) {
        return new ResponseEntity<>(connectedUserAndRoomInfoStore.participantsUserMap.get(roomId), HttpStatus.OK);
    }
}
