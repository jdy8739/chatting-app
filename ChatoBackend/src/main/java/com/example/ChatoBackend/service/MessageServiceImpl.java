package com.example.ChatoBackend.service;

import com.example.ChatoBackend.DTO.MessageDTO;
import com.example.ChatoBackend.entity.ChatRoom;
import com.example.ChatoBackend.repository.ChatRoomRepository;
import com.example.ChatoBackend.repository.MessageRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import java.sql.SQLException;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
public class MessageServiceImpl implements MessageService {

    @Autowired
    ChatRoomRepository chatRoomRepository;

    @Autowired
    MessageRepository messageRepository;

    @Override
    public long saveMessage(MessageDTO messageDTO) {
        long newId = -1;
        try {
            newId = messageRepository.saveMessage(messageDTO);
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
        return newId;
    }

    @Override
    public List<MessageDTO> getMessages(Long roomId, Integer offset) {
        try {
            return messageRepository.getMessages(roomId, offset);
        } catch (SQLException e) {
            throw new RuntimeException();
        }
    }

    @Override
    public void deleteMessage(Long roomId, Long msgNo) {
        try {
            messageRepository.deleteMessage(roomId, msgNo);
        } catch (SQLException e) {
            throw new RuntimeException();
        }
    }

    @Override
    public void deleteRoom(Long roomId) {
        try {
            messageRepository.deleteRoom(roomId);
        } catch (SQLException e) {
            throw new RuntimeException();
        }
    }
}
