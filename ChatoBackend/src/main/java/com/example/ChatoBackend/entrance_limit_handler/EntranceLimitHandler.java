package com.example.ChatoBackend.entrance_limit_handler;
import com.example.ChatoBackend.service.ChatRoomServiceImpl;
import com.example.ChatoBackend.store.ConnectedUserAndRoomInfoStore;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptorAdapter;
import org.springframework.stereotype.Component;

import java.util.Map;

@Slf4j
@Component
public class EntranceLimitHandler extends ChannelInterceptorAdapter {

    /* 메세징 템플릿을 사용할 수 없어서, 사용을 하지않는 컴포넌트 */

    @Autowired
    ConnectedUserAndRoomInfoStore connectedUserAndRoomInfoStore;
    @Autowired
    ChatRoomServiceImpl chatRoomService;
    private Map<String, String> map;

    public void postSend(Message message, MessageChannel channel, boolean sent) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);
        String sessionId = accessor.getSessionId();
        switch (accessor.getCommand()) {
            case CONNECT:
                // 유저가 Websocket으로 connect()를 한 뒤 호출됨.
                map = (Map<String, String>) message.getHeaders().get("nativeHeaders");
                String[] values = new String[2];
                values[0] = extractId(String.valueOf(map.get("roomId")));
                values[1] = extractId(String.valueOf(map.get("userId")));
                if (values[0] != null && values[1] != null) {
                    if (chatRoomService.checkRoomStatusOK(Long.valueOf(values[0]))) {
                        connectedUserAndRoomInfoStore.connectedUserMap.put(sessionId, values);
                    }
                }
                break;
            case DISCONNECT:
                // 유저가 Websocket으로 disconnect() 를 한 뒤 호출됨 or 세션이 끊어졌을 때 발생함(페이지 이동~ 브라우저 닫기 등).
                // 여기서는 갑자기 소켓이 닫힌 경우를 가정해서, 결국 메세지 컨트롤러에서 통신 종료 메세지를 보낼 수 없고 다른 빈 컴포넌트의 메소드에서 처리해야할 듯.
                try {
                    Long roomId = Long.valueOf(connectedUserAndRoomInfoStore.connectedUserMap.get(sessionId)[0]);
                    chatRoomService.minusParticipantsCount(roomId);
                    // 유저 목록 업데이트를 위해 종료된 아이디를 소켓 메세지로 보내는 메소드(종료된 통신의 유저 아이디);
                    connectedUserAndRoomInfoStore.connectedUserMap.remove(sessionId);
                } catch (NullPointerException e) {
                    return;
                }
                break;
            default:
                break;
        }
    }

    private String extractId(String id) {
        return id.replace("[", "").replace("]", "");
    };
}
