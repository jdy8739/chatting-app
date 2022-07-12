package com.example.ChatoBackend.service;

import com.example.ChatoBackend.entity.ChatRoom;
import com.example.ChatoBackend.repository.ChatRoomRepository;
import com.example.ChatoBackend.repository.MessageRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.sql.SQLException;
import java.util.List;

@Slf4j
@Service
public class ChatRoomServiceImpl implements ChatRoomService {

    @Autowired
    private ChatRoomRepository chatRoomRepository;

    @Autowired
    private MessageRepository messageRepository;

    @Override
    public void saveChatRoom(ChatRoom chatRoom) throws SQLException {
        try {
            if (chatRoomRepository.save(chatRoom) != null) {
                messageRepository.createDynamicTable(chatRoom.getRoomId());
            }
        } catch (SQLException sqlException) {
            // 나중에 로직 넣어준다.
        }
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
