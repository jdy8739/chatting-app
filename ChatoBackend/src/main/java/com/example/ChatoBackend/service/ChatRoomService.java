package com.example.ChatoBackend.service;

import com.example.ChatoBackend.entity.ChatRoom;
import org.springframework.stereotype.Service;

import java.sql.SQLException;
import java.util.List;

public interface ChatRoomService {

    public void saveChatRoom(ChatRoom chatRoom) throws SQLException;

    public List<ChatRoom> findEveryChatRoom();

    public void changeSubject(Long roomId, String newSubject);

    public boolean checkRoomStatusOK(Long roomId);

    public void minusParticipantsCount(Long roomId);

    public boolean checkPwValidation(Long roomId, String password);

    public void deleteRoom(Long roomId);
}
