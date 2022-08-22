package com.example.ChatoBackend.service;

import com.example.ChatoBackend.DTO.ParticipantDTO;
import com.example.ChatoBackend.entity.BannedIp;
import com.example.ChatoBackend.entity.ChatRoom;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.sql.ParameterMetaData;
import java.sql.SQLException;
import java.util.List;

public interface ChatRoomService {

    public void saveChatRoom(ChatRoom chatRoom) throws SQLException;

    public ChatRoom findChatRoomByRoomId(long roomId);

    public List<ChatRoom> findEveryChatRoom();

    public void changeSubject(Long roomId, String newSubject);

    public boolean checkPwCorrect(Long roomId, String password, Long userNo);

    public boolean checkRoomStatusOK(Long roomId);

    public void increaseParticipantsCount(Long roomId);

    public void decreaseParticipantsCount(Long roomId);

    public boolean checkPwValidation(Long roomId, String password);

    public void deleteRoom(Long roomId);

    public Long findRoomOwnerByRoomId(Long roomId);

    public List<ParticipantDTO> getParticipantListByRoomId(Long roomId);

    public boolean checkIfIsRoomOwner(long roomId, long userNo);

    public boolean checkIfIsNotBannedIp(long roomId, String ipAddress);

    public List<BannedIp> findBannedIpByRoomId(long roomId);

    public void unlockBannedUser(long bannedIpNo);

    public List<ChatRoom> searchChatRooms(String keyword);

    public void updateRoomRoomPassword(boolean pwRequired, String password, long roomId);

    public void updateRoomCapacity(int capacity, long roomId);

    public byte[] getChatPicture(long roomId, long msgNo) throws IOException;
}
