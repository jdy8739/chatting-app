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
    public void saveMessage(MessageDTO messageDTO) {
        try {
            if (messageRepository.saveMessage(messageDTO) != 1) {
                throw new SQLException();
            }
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public List<MessageDTO> getMessages(Long roomId, String password, Integer offset) {
        Optional<ChatRoom> optChatRoom = chatRoomRepository.findByRoomId(roomId);
        boolean isAccessEligible = false;
        if (optChatRoom.isPresent()) {
            if (optChatRoom.get().isPwRequired()) {
                if (password != null && password.equals(optChatRoom.get().getPassword()))
                    isAccessEligible = true;
            } else isAccessEligible = true;
        }
        if (isAccessEligible) {
            try {
                return messageRepository.getMessages(roomId, offset);
            } catch (SQLException e) {
                throw new RuntimeException();
            }
        } else return null;
    }
}
