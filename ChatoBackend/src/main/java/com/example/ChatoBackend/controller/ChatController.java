package com.example.ChatoBackend.controller;

import com.example.ChatoBackend.DTO.MessageDTO;
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

    private final int BAN_PROTOCOL_NUMBER = 2;
    @Autowired
    private final SimpMessagingTemplate template;
    @Autowired
    MessageServiceImpl messageService;

    JSONParser jsonParser = new JSONParser();

    @MessageMapping(value = "/chat/message")
    public void handleMessageSend(String messageString) throws ParseException {
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

    @MessageMapping(value = "/chat/delete")
    public void deleteMessageOrParticipant(String messageString) throws ParseException {
        JSONObject jsonObject = (JSONObject) jsonParser.parse(messageString);
        Long msgNo = (Long) jsonObject.get("msgNo");
        MessageDTO messageDTO = new MessageDTO(
                msgNo == Long.valueOf(BAN_PROTOCOL_NUMBER) ? msgNo : null,
                jsonObject.get(ROOM_ID).toString(),
                jsonObject.get(WRITER).toString(),
                jsonObject.get(MESSAGE).toString(),
                "",
                false
        );
        template.convertAndSend(
                "/sub/chat/room/" + messageDTO.getRoomId(), messageDTO);
    }
}