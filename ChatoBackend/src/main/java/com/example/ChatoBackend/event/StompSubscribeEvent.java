package com.example.ChatoBackend.event;

import com.example.ChatoBackend.DTO.MessageDTO;
import com.example.ChatoBackend.DTO.ParticipantDTO;
import com.example.ChatoBackend.service.ChatRoomServiceImpl;
import com.example.ChatoBackend.service.UserService;
import com.example.ChatoBackend.service.UserServiceImpl;
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
    UserServiceImpl userService;
    @Autowired
    ConnectedUserAndRoomInfoStore connectedUserAndRoomInfoStore;
    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    private Map<String, Object> map;
    private final String MASTER = "MASTER";
    private final String NULL = "null";

    private final int SUBSCRIBE_PROTOCOL_NUMBER = 0;

    public void onApplicationEvent(SessionSubscribeEvent event) {
        map = (Map<String, Object>) event.getMessage().getHeaders();
        Map<String, String> nativeHeaders = (Map<String, String>) map.get("nativeHeaders");
        String roomId = extractId(String.valueOf(nativeHeaders.get("roomId")));
        String userId = extractId(String.valueOf(nativeHeaders.get("userId")));
        String sessionId = (String) map.get("simpSessionId");
        if (userId.equals(NULL) || roomId.equals(NULL)) return;

        String nickName = null;
        boolean isUserSignedInUsedId = (userId.length() < 16);
        if (isUserSignedInUsedId) nickName = userService.findNickNameById(userId);
        if (putUserIdIntoSetIfNotDuplicateId(roomId, userId, nickName)) return;
        String[] values = {roomId, userId};
        connectedUserAndRoomInfoStore.connectedUserMap.put(sessionId, values);
        chatRoomService.increaseParticipantsCount(Long.valueOf(roomId));
        messagingTemplate.convertAndSend(
                "/sub/chat/room/" + roomId,
                new MessageDTO(
                        Long.valueOf(SUBSCRIBE_PROTOCOL_NUMBER),
                        roomId,
                        MASTER,
                        userId + "/" + nickName,
                        null,
                        false,
                        false));
        messagingTemplate.convertAndSend(
                "/sub/chat/room/list", new RoomParticipantsInfo(Integer.valueOf(roomId), true));
    }

    private boolean putUserIdIntoSetIfNotDuplicateId(String roomId, String userId, String nickName) {
        Set<String[]> participantsUserSet = connectedUserAndRoomInfoStore.participantsUserMap.get(Long.valueOf(roomId));
        String[] newParticipantArr = {userId, nickName};
        if (participantsUserSet == null) {
            Set<String[]> newUserIdSet = new HashSet<>();
            newUserIdSet.add(newParticipantArr);
            connectedUserAndRoomInfoStore.participantsUserMap.put(Long.valueOf(roomId), newUserIdSet);
        } else {
            if (isDuplicateUserIdExist(userId, participantsUserSet)) return true;
            participantsUserSet.add(newParticipantArr);
        }
        return false;
    }

    private boolean isDuplicateUserIdExist(String targetUserId, Collection<String[]> targetSet) {
        Iterator<String[]> iterator = targetSet.iterator();
        while (iterator.hasNext()) {
            if (iterator.next()[0].equals(targetUserId)) return true;
        }
        return false;
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


