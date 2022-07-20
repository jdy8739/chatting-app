package com.example.ChatoBackend.event;

import com.example.ChatoBackend.DTO.MessageDTO;
import com.example.ChatoBackend.service.ChatRoomServiceImpl;
import com.example.ChatoBackend.store.ConnectedUserAndRoomInfoStore;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationListener;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

@Slf4j
@Component
public class StompDisconnectEvent implements ApplicationListener<SessionDisconnectEvent> {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    @Autowired
    ConnectedUserAndRoomInfoStore connectedUserAndRoomInfoStore;
    @Autowired
    ChatRoomServiceImpl chatRoomService;

    private final String MASTER = "MASTER";

    public void onApplicationEvent(SessionDisconnectEvent event) {
        try {
            String sessionId = event.getSessionId();
            String roomId = connectedUserAndRoomInfoStore.connectedUserMap.get(sessionId)[0];
            String userId = connectedUserAndRoomInfoStore.connectedUserMap.get(sessionId)[1];
            chatRoomService.minusParticipantsCount(Long.valueOf(roomId));
            connectedUserAndRoomInfoStore.connectedUserMap.remove(sessionId);
            removeUserIdIntoUserIdSetByRoomId(roomId, userId);
            messagingTemplate.convertAndSend(
                    "/sub/chat/room/" + roomId,
                    new MessageDTO(
                            Long.valueOf(1),
                            roomId,
                            MASTER,
                            userId,
                            null,
                            false));

            messagingTemplate.convertAndSend(
                    "/sub/chat/room/list", new RoomParticipantsInfo(Integer.valueOf(roomId), false));
        } catch (NullPointerException e) {
            return;
        }
    }

    private void removeUserIdIntoUserIdSetByRoomId(String roomId, String userId) {
        Set<String> participantsUserSet = connectedUserAndRoomInfoStore.participantsUserMap.get(Long.valueOf(roomId));
        if (participantsUserSet == null) {
            return;
        } else {
            participantsUserSet.remove(userId);
            if (participantsUserSet.size() == 0) {
                connectedUserAndRoomInfoStore.participantsUserMap.remove(roomId);
            }
        }
    }
}
