package com.example.ChatoBackend.service;

import com.example.ChatoBackend.DTO.ParticipantDTO;
import com.example.ChatoBackend.entity.BannedIp;
import com.example.ChatoBackend.entity.ChatRoom;
import com.example.ChatoBackend.repository.BannedIpRepository;
import com.example.ChatoBackend.repository.ChatRoomRepository;
import com.example.ChatoBackend.repository.MessageRepository;
import com.example.ChatoBackend.store.ConnectedUserAndRoomInfoStore;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
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

    @Autowired
    BannedIpRepository bannedIpRepository;

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
    public boolean checkPwCorrect(Long roomId, String password, Long userNo) {
        Optional<ChatRoom> optChatRoom = chatRoomRepository.findByRoomId(roomId);
        if (optChatRoom.isPresent()) {
            ChatRoom chatRoom = optChatRoom.get();
            Long owner = chatRoom.getOwner();
            if (owner != null && owner.equals(userNo)) {
                return true;
            } else if (chatRoom.isPwRequired()) {
                if (password != null && password.equals(chatRoom.getPassword()))
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
        deleteRoomPicture(roomId);
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
        for (String[] participant : set) {
            participantList.add(new ParticipantDTO(participant[0], participant[1]));
        }
        return participantList;
    }

    @Override
    public boolean checkIfIsRoomOwner(long roomId, long userNo) {
        Optional<ChatRoom> optionalChatRoom = chatRoomRepository.findByRoomId(roomId);
        if (optionalChatRoom.isEmpty()) throw new NoSuchElementException();
        Long roomOwner = optionalChatRoom.get().getOwner();
        return roomOwner != null && (roomOwner == userNo);
    }

    @Override
    public boolean checkIfIsNotBannedIp(long roomId, String ipAddress) {
        List<String> bannedIpList = bannedIpRepository.findIpAddressByRoomId(roomId);
        if (bannedIpList.size() == 0) return true;
        for (String ipAddressElem : bannedIpList) {
            if (ipAddressElem.equals(ipAddress)) return false;
        }
        return true;
    }

    @Override
    public List<BannedIp> findBannedIpByRoomId(long roomId) {
        List<BannedIp> bannedIpList =  bannedIpRepository.findBannedIpByRoomId(roomId);
        int count = 0;
        for (BannedIp bannedIp : bannedIpList) {
            String ipAddress = bannedIpList.get(count).getIpAddress().substring(0, 7);
            bannedIp.setIpAddress(ipAddress);
            count ++;
        }
        return bannedIpList;
    }

    @Override
    public void unlockBannedUser(long bannedIpNo) {
        bannedIpRepository.deleteBannedIpByBannedIpNo(bannedIpNo);
    }

    @Override
    public List<ChatRoom> searchChatRooms(String keyword) {
        return chatRoomRepository.findByRoomNameContaining(keyword);
    }

    private void deleteRoomPicture(long roomId) {
        String path = "./images/rooms/" + roomId;
        File roomDir = new File(path);
        if (roomDir.exists()) {
            try {
                Files.walk(roomDir.toPath())
                        .sorted(Comparator.reverseOrder())
                        .map(Path :: toFile)
                        .forEach((file) -> file.delete());
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }
}
