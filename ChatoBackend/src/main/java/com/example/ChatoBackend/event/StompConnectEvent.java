package com.example.ChatoBackend.event;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationListener;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

@Slf4j
@Component
public class StompConnectEvent implements ApplicationListener<SessionConnectEvent> {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    public void onApplicationEvent(SessionConnectEvent event) {
        log.info(event + "");
        messagingTemplate.convertAndSend("/sub/chat/room/1", "hello??");
    }
}