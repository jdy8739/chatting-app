package com.example.ChatoBackend.service;

import com.example.ChatoBackend.entity.ChatRoom;
import com.example.ChatoBackend.repository.ChatRoomRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
public class ChatRoomServiceImpl implements ChatRoomService {

    @Autowired
    private ChatRoomRepository chatRoomRepository;

    @Override
    public void saveChatRoom(ChatRoom chatRoom) {
        chatRoomRepository.save(chatRoom);
    }

    @Override
    public List<ChatRoom> findEveryChatRoom() {
        return chatRoomRepository.findAll();
    }

    @Override
    public void changeSubject(Long roomId, String newSubject) {
        chatRoomRepository.changeSubject(roomId, newSubject);
    }

    @Override
    public boolean checkIfChatRoomExist(Long roomId) {
        return chatRoomRepository.findByRoomId(roomId).isPresent();
    }
}
