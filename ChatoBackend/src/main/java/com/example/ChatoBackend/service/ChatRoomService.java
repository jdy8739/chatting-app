package com.example.ChatoBackend.service;

import com.example.ChatoBackend.entity.ChatRoom;
import org.springframework.stereotype.Service;

import java.util.List;

public interface ChatRoomService {

    public void saveChatRoom(ChatRoom chatRoom);

    public List<ChatRoom> findEveryChatRoom();

    public void changeSubject(Long roomId, String newSubject);

    public boolean checkIfChatRoomExist(Long roomId);
}
