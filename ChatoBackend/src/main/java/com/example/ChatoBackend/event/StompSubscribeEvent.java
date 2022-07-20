package com.example.ChatoBackend.event;

import com.example.ChatoBackend.DTO.MessageDTO;
import com.example.ChatoBackend.service.ChatRoomServiceImpl;
import com.example.ChatoBackend.store.ConnectedUserAndRoomInfoStore;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionSubscribeEvent;

import java.util.*;

@Slf4j
@Component
public class StompSubscribeEvent implements ApplicationListener<SessionSubscribeEvent>  {

    @Autowired
    ChatRoomServiceImpl chatRoomService;
    @Autowired
    ConnectedUserAndRoomInfoStore connectedUserAndRoomInfoStore;
    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    private Map<String, Object> map;
    private final String MASTER = "MASTER";
    private final String NULL = "null";

    public void onApplicationEvent(SessionSubscribeEvent event) {
        map = (Map<String, Object>) event.getMessage().getHeaders();
        Map<String, String> nativeHeaders = (Map<String, String>) map.get("nativeHeaders");
        String roomId = extractId(String.valueOf(nativeHeaders.get("roomId")));
        String userId = extractId(String.valueOf(nativeHeaders.get("userId")));
        String sessionId = (String) map.get("simpSessionId");
        if (userId.equals(NULL) || roomId.equals(NULL)) return;
        String[] values = {roomId, userId};
        connectedUserAndRoomInfoStore.connectedUserMap.put(sessionId, values);
        putUserIdIntoUserIdSetByRoomId(roomId, userId);
        messagingTemplate.convertAndSend(
                "/sub/chat/room/" + roomId,
                new MessageDTO(
                        null,
                        roomId,
                        MASTER,
                        userId.substring(0, 9) + " has just joined the room.",
                        null,
                        false));

        messagingTemplate.convertAndSend(
                "/sub/chat/room/list", new RoomParticipantsInfo(Integer.valueOf(roomId), true));
    }

    private void putUserIdIntoUserIdSetByRoomId(String roomId, String userId) {
        Set<String> participantsUserSet = connectedUserAndRoomInfoStore.participantsUserMap.get(Long.valueOf(roomId));
        if (participantsUserSet == null) {
            Set<String> newUserIdSet = new HashSet<>();
            newUserIdSet.add(userId);
            connectedUserAndRoomInfoStore.participantsUserMap.put(Long.valueOf(roomId), newUserIdSet);
        } else {
            participantsUserSet.add(userId);
        }
    }

    private String extractId(String id) {
        return id.replace("[", "").replace("]", "");
    };
}

@Getter
@Setter
@AllArgsConstructor
class RoomParticipantsInfo {
    private Integer roomId;
    private Boolean isEnter;
}


