package com.example.ChatoBackend.controller;

import com.example.ChatoBackend.DTO.MessageDTO;
import com.example.ChatoBackend.entrance_limit_handler.EntranceLimitHandler;
import com.example.ChatoBackend.service.ChatRoomServiceImpl;
import com.example.ChatoBackend.service.MessageServiceImpl;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Slf4j
@Controller
@RequiredArgsConstructor
public class ChatController {

    private final String ROOM_ID = "roomId";
    private final String WRITER = "writer";
    private final String MESSAGE = "message";

    private final String TIME = "time";

    private final String REJECTED = "rejected";

    private final SimpMessagingTemplate template;

    @Autowired
    EntranceLimitHandler entranceLimitHandler;

    @Autowired
    ChatRoomServiceImpl chatRoomService;

    @Autowired
    MessageServiceImpl messageService;

    @MessageMapping(value = "/chat/enter_or_leave")
    public void handleUser(String messageString) throws ParseException {
        JSONParser jsonParser = new JSONParser();
        JSONObject jsonObject = (JSONObject) jsonParser.parse(messageString);
        MessageDTO messageDTO = new MessageDTO(
                null,
                jsonObject.get(ROOM_ID).toString(),
                jsonObject.get(WRITER).toString(),
                jsonObject.get(MESSAGE).toString(),
                null,
                false
        );
        String roomId = messageDTO.getRoomId();
        /* if (!entranceLimitHandler.checkIfEntranceAvailable(Integer.parseInt(roomId)))
            messageDTO.setMessage(REJECTED); */
        if (!checkIfChatRoomExist(Long.parseLong(roomId))) {
            messageDTO.setMessage(REJECTED);
        }
        template.convertAndSend(
                "/sub/chat/room/" + roomId, messageDTO);
    }

    @MessageMapping(value = "/chat/message")
    public void handleMessage(String messageString) throws ParseException {
        JSONParser jsonParser = new JSONParser();
        JSONObject jsonObject = (JSONObject) jsonParser.parse(messageString);
        MessageDTO messageDTO = new MessageDTO(
                null,
                jsonObject.get(ROOM_ID).toString(),
                jsonObject.get(WRITER).toString(),
                jsonObject.get(MESSAGE).toString(),
                jsonObject.get(TIME).toString(),
                false
                );
        messageDTO.setMsgNo(messageService.saveMessage(messageDTO));
        template.convertAndSend(
                "/sub/chat/room/" + messageDTO.getRoomId(), messageDTO);
    }

    private boolean checkIfChatRoomExist(Long roomId) {
        return chatRoomService.checkIfChatRoomExist(roomId);
    }
}