package com.example.ChatoBackend.event;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationListener;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

@Slf4j
@Component
public class StompDisconnectEvent implements ApplicationListener<SessionDisconnectEvent> {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @EventListener
    public void onApplicationEvent(SessionDisconnectEvent event) {
        log.info("2");
        messagingTemplate.convertAndSend("/sub/chat/room/1", "let's go??");
    }
}
