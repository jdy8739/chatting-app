package com.example.ChatoBackend.service;

import com.example.ChatoBackend.DTO.ParticipantDTO;
import com.example.ChatoBackend.entity.ChatRoom;
import org.springframework.stereotype.Service;

import java.sql.ParameterMetaData;
import java.sql.SQLException;
import java.util.List;

public interface ChatRoomService {

    public void saveChatRoom(ChatRoom chatRoom) throws SQLException;

    public List<ChatRoom> findEveryChatRoom();

    public void changeSubject(Long roomId, String newSubject);

    public boolean checkPwCorrect(Long roomId, String password);

    public boolean checkRoomStatusOK(Long roomId);

    public void increaseParticipantsCount(Long roomId);

    public void decreaseParticipantsCount(Long roomId);

    public boolean checkPwValidation(Long roomId, String password);

    public void deleteRoom(Long roomId);

    public Long findRoomOwnerByRoomId(Long roomId);

    public List<ParticipantDTO> getParticipantListByRoomId(Long roomId);

    public boolean checkIfIsRoomOwner(long roomId, long userNo);
}
