package com.example.ChatoBackend.controller;

import com.example.ChatoBackend.DTO.MessageDTO;
import com.example.ChatoBackend.DTO.ParticipantDTO;
import com.example.ChatoBackend.entity.ChatRoom;
import com.example.ChatoBackend.entity.User;
import com.example.ChatoBackend.jwt.JWTUtils;
import com.example.ChatoBackend.service.ChatRoomServiceImpl;
import com.example.ChatoBackend.service.MessageServiceImpl;
import com.example.ChatoBackend.service.UserServiceImpl;
import com.example.ChatoBackend.store.ConnectedUserAndRoomInfoStore;
import io.jsonwebtoken.MalformedJwtException;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.security.sasl.AuthenticationException;
import javax.servlet.http.HttpServletRequest;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.NoSuchFileException;
import java.sql.SQLException;
import java.util.*;

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
    UserServiceImpl userService;
    @Autowired
    JWTUtils jwtUtils;

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
    public ResponseEntity<Void> changeSubject(
            @RequestBody Map<String, String> map,
            HttpServletRequest req) {
        String token = String.valueOf(req.getHeader(HttpHeaders.AUTHORIZATION));
        try {
            long roomId = Long.parseLong(map.get("targetRoomId"));
            if (!chatRoomService.checkIfIsRoomOwner(roomId, jwtUtils.getUserId(token)))
                throw new Exception();
            chatRoomService.changeSubject(roomId, map.get("destinationId"));
            messagingTemplate.convertAndSend("/sub/chat/room/list", map);
            return new ResponseEntity<>(HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
    }

    @PostMapping("/enter_password")
    public ResponseEntity<Boolean> checkPwValidation(@RequestBody Map<String, String> map) {
        Long roomId = Long.valueOf(map.get(ROOM_ID));
        String password = map.get("password");
        Boolean isValidPw = chatRoomService.checkPwValidation(roomId, password);
        return new ResponseEntity<>(isValidPw, HttpStatus.OK);
    }

    @PostMapping("/message/{id}")
    public ResponseEntity<Map<String, Object>> getMessage(
            @PathVariable("id") Long roomId,
            @RequestParam(value = "offset") String offset,
            @RequestBody Map<String, String> map) {
        String roomOwner = "";
        List<MessageDTO> messageDTOList = null;
        if (Integer.valueOf(offset) == 0) {
            if (!chatRoomService.checkPwCorrect(roomId, map.get("password"))) {
                return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
            } else if (!chatRoomService.checkRoomStatusOK(roomId)) {
                return new ResponseEntity<>(HttpStatus.PRECONDITION_FAILED);
            }
            roomOwner = chatRoomService.findRoomOwnerByRoomId(roomId);
        }
        messageDTOList = messageService.getMessages(roomId, Integer.valueOf(offset));
        Map<String, Object> responseMap = new HashMap<>();
        responseMap.put("owner", roomOwner);
        responseMap.put("messageList", messageDTOList);
        return new ResponseEntity<>(responseMap, HttpStatus.OK);
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
    public ResponseEntity<Void> deleteRoom(
            @PathVariable(ROOM_ID) Long roomId,
            HttpServletRequest req) {
        String token = String.valueOf(req.getHeader(HttpHeaders.AUTHORIZATION));
        try {
            if (!chatRoomService.checkIfIsRoomOwner(roomId, jwtUtils.getUserId(token)))
                throw new Exception();
            chatRoomService.deleteRoom(roomId);
            messageService.deleteRoom(roomId);
            Map<String, Integer> map = new HashMap<>();
            map.put("isDeleted", 1);
            map.put(ROOM_ID, Math.toIntExact(roomId));
            messagingTemplate.convertAndSend("/sub/chat/room/list", map);
            return new ResponseEntity<>(HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
    }

    @GetMapping("/participants/{roomId}")
    public ResponseEntity<List<ParticipantDTO>> getParticipantsByRoomId(
            @PathVariable(ROOM_ID) Long roomId) {
        return new ResponseEntity<>(chatRoomService.getParticipantListByRoomId(roomId), HttpStatus.OK);
    }

    @GetMapping("/content-pic/{roomId}/{msgNo}")
    public ResponseEntity<byte[]> getContentImage(
            @PathVariable("roomId") String roomId,
            @PathVariable("msgNo") String msgNo) {
        byte[] imageByteArray = null;
        try {
            String path = "./images/rooms/" + roomId;
            File file = new File(path + "/" + msgNo + ".jpg");
            imageByteArray = Files.readAllBytes(file.toPath());
        } catch (NoSuchFileException e) {
            return new ResponseEntity<>(null, HttpStatus.OK);
        } catch (IOException e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return new ResponseEntity<>(imageByteArray, HttpStatus.OK);
    }
}
