package com.example.ChatoBackend.service;

import com.example.ChatoBackend.DTO.ParticipantDTO;
import com.example.ChatoBackend.entity.ChatRoom;
import com.example.ChatoBackend.repository.ChatRoomRepository;
import com.example.ChatoBackend.repository.MessageRepository;
import com.example.ChatoBackend.store.ConnectedUserAndRoomInfoStore;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.sql.ParameterMetaData;
import java.sql.SQLException;
import java.util.*;

@Slf4j
@Service
public class ChatRoomServiceImpl implements ChatRoomService {

    @Autowired
    private ChatRoomRepository chatRoomRepository;

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    ConnectedUserAndRoomInfoStore connectedUserAndRoomInfoStore;

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
            return true;
        }
    }

    @Override
    public void increaseParticipantsCount(Long roomId) {
        chatRoomRepository.increaseParticipantsCount(roomId);
    }

    @Override
    public void decreaseParticipantsCount(Long roomId) {
        chatRoomRepository.decreaseParticipantsCount(roomId);
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
    public Long findRoomOwnerByRoomId(Long roomId) {
        return chatRoomRepository.findByRoomId(roomId).get().getOwner();
    }

    @Override
    public List<ParticipantDTO> getParticipantListByRoomId(Long roomId) {
        Set<String[]> set = connectedUserAndRoomInfoStore.participantsUserMap.get(roomId);
        List<ParticipantDTO> participantList = new ArrayList<>();
        Iterator<String[]> iterator = set.iterator();
        while (iterator.hasNext()) {
            String[] participant = iterator.next();
            participantList.add(new ParticipantDTO(participant[0], participant[1]));
        }
        return participantList;
    }

    @Override
    public boolean checkIfIsRoomOwner(long roomId, long userNo) {
        Optional<ChatRoom> optionalChatRoom = chatRoomRepository.findByRoomId(roomId);
        if (optionalChatRoom.isEmpty()) throw new NoSuchElementException();
        long roomOwner = optionalChatRoom.get().getOwner();
        if (roomOwner == userNo) return true;
        else return false;
    }
}
