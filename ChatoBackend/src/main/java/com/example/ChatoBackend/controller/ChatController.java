package com.example.ChatoBackend.controller;

import com.example.ChatoBackend.DTO.MessageDTO;
import com.example.ChatoBackend.Utility.Utils;
import com.example.ChatoBackend.service.MessageServiceImpl;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.io.*;
import java.util.List;
import java.util.Map;


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

    @Autowired
    Utils utils;

    @MessageMapping(value = "/chat/message")
    public void handleMessageSend(String messageString) throws ParseException {
        JSONParser jsonParser = new JSONParser();
        JSONObject jsonObject = (JSONObject) jsonParser.parse(messageString);
        MessageDTO messageDTO = new MessageDTO(
                null,
                jsonObject.get(ROOM_ID).toString(),
                jsonObject.get(WRITER).toString(),
                jsonObject.get(MESSAGE).toString(),
                jsonObject.get(TIME).toString(),
                false,
                false
                );
        messageDTO.setMsgNo(messageService.saveMessage(messageDTO));
        template.convertAndSend(
                "/sub/chat/room/" + messageDTO.getRoomId(), messageDTO);
    }

    @MessageMapping(value = "/chat/delete")
    public void deleteMessageOrParticipant(String messageString) throws ParseException {
        JSONParser jsonParser = new JSONParser();
        JSONObject jsonObject = (JSONObject) jsonParser.parse(messageString);
        Long msgNo = (Long) jsonObject.get("msgNo");
        MessageDTO messageDTO = new MessageDTO(
                msgNo == Long.valueOf(BAN_PROTOCOL_NUMBER) ? msgNo : null,
                jsonObject.get(ROOM_ID).toString(),
                jsonObject.get(WRITER).toString(),
                jsonObject.get(MESSAGE).toString(),
                "",
                false,
                false
        );
        template.convertAndSend(
                "/sub/chat/room/" + messageDTO.getRoomId(), messageDTO);
    }

    @MessageMapping(value = "/chat/binary")
    public void receiveBinaryFile(byte[] bytes, SimpMessageHeaderAccessor simpMessageHeaderAccessor) {
        Map<String, Object> headersMap = (Map<String, Object>) simpMessageHeaderAccessor.getHeader("nativeHeaders");
        List<Object> isList = (List<Object>) headersMap.get("image-size");
        List<Object> riList = (List<Object>) headersMap.get("room-id");
        List<Object> wrList = (List<Object>) headersMap.get("writer");
        List<Object> timeList = (List<Object>) headersMap.get("time");
        int imageSize = Integer.parseInt((String) isList.get(0));
        Long roomId = Long.parseLong((String) riList.get(0));
        String writer = (String) wrList.get(0);
        String now = (String) timeList.get(0);
        byte[] imageByte = utils.extractImageByteData(bytes, imageSize);
        long msgNo;
        MessageDTO messageDTO = new MessageDTO(
                null,
                (String) riList.get(0),
                writer,
                "",
                now,
                false,
                true);
        try {
            msgNo = messageService.saveMessage(messageDTO);
            messageDTO.setMsgNo(msgNo);
            messageService.savePicture(imageByte, roomId, msgNo);
        } catch (Exception e) {
            messageDTO.setMessage("The Image send has failed.");
            messageDTO.setWriter("MASTER");
            messageDTO.setIsPicture(false);
        } finally {
            template.convertAndSend("/sub/chat/room/" + roomId, messageDTO);
        }
    }
}