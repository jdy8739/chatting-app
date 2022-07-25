package com.example.ChatoBackend.service;

import com.example.ChatoBackend.entity.ChatRoom;
import com.example.ChatoBackend.repository.ChatRoomRepository;
import com.example.ChatoBackend.repository.MessageRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.sql.SQLException;
import java.util.List;
import java.util.Optional;

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
            sqlException.printStackTrace();
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
    public boolean checkPwCorrect(Long roomId, String password) {
        Optional<ChatRoom> optChatRoom = chatRoomRepository.findByRoomId(roomId);
        if (optChatRoom.isPresent()) {
            if (optChatRoom.get().isPwRequired()) {
                if (password != null && password.equals(optChatRoom.get().getPassword()))
                    return true;
            } else return true;
        }
        return false;
    }

    @Override
    public boolean checkRoomStatusOK(Long roomId) {
        Optional <ChatRoom> chatRoomOptional = chatRoomRepository.findByRoomId(roomId);
        if (chatRoomOptional.isEmpty()) {
            return false;
        } else if (chatRoomOptional.get().getNowParticipants() + 1 > chatRoomOptional.get().getLimitation()) {
            return false;
        } else {
            chatRoomRepository.plusParticipantsCount(roomId);
            return true;
        }
    }

    @Override
    public void minusParticipantsCount(Long roomId) {
        chatRoomRepository.minusParticipantsCount(roomId);
    }

    @Override
    public boolean checkPwValidation(Long roomId, String password) {
        Optional<ChatRoom> optionalChatRoom = chatRoomRepository.findByRoomId(roomId);
        if (optionalChatRoom.isPresent()) {
            if (optionalChatRoom.get().getPassword().equals(password)) return true;
        }
        return false;
    }

    @Override
    public void deleteRoom(Long roomId) {
        chatRoomRepository.deleteByRoomId(roomId);
    }

    @Override
    public String findRoomOwnerByRoomId(Long roomId) {
        return chatRoomRepository.findByRoomId(roomId).get().getOwner();
    }
}
