package com.example.ChatoBackend.controller;

import com.example.ChatoBackend.DTO.MessageDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;
import org.springframework.messaging.MessageHandlingException;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.rsocket.annotation.ConnectMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaders;
import org.springframework.stereotype.Controller;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.RequestBody;

import javax.servlet.http.HttpServletRequest;
import java.net.http.HttpRequest;

@Slf4j
@Controller
@RequiredArgsConstructor
public class ChatController {

    private final String ROOM_ID = "roomId";
    private final String WRITER = "writer";
    private final String MESSAGE = "message";

    private final SimpMessagingTemplate template;
    @MessageMapping(value = "/chat/message")
    public void message(String messageString) throws ParseException {
        JSONParser jsonParser = new JSONParser();
        JSONObject jsonObject = (JSONObject) jsonParser.parse(messageString);
        MessageDTO messageDTO = new MessageDTO(
                jsonObject.get(ROOM_ID).toString(),
                jsonObject.get(WRITER).toString(),
                jsonObject.get(MESSAGE).toString()
                );
        template.convertAndSend("/sub/chat/room/" + messageDTO.getRoomId(), messageDTO);
    }
}